const { RekognitionClient, IndexFacesCommand } = require("@aws-sdk/client-rekognition");

const client = new RekognitionClient({
    region: process.env.REKOGNITION_AWS_REGION,
    credentials: {
        accessKeyId: process.env.REKOGNITION_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REKOGNITION_AWS_SECRET_ACCESS_KEY,
    },
});

exports.handler = async function (event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { name, image } = JSON.parse(event.body);
        const imageBytes = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), 'base64');
        
        // Sanitize the name to be a valid ExternalImageId
        const externalImageId = name.replace(/[^a-zA-Z0-9_.-]/g, '');
        if (!externalImageId) {
             return { statusCode: 400, body: JSON.stringify({ message: 'Invalid name provided.' }) };
        }

        const command = new IndexFacesCommand({
            CollectionId: process.env.REKOGNITION_COLLECTION_ID,
            Image: { Bytes: imageBytes },
            ExternalImageId: externalImageId, // Store the user's name here
            DetectionAttributes: ["DEFAULT"],
        });

        const data = await client.send(command);

        if (data.FaceRecords && data.FaceRecords.length > 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    status: 'success',
                    message: `Welcome, ${name}! Your face is now registered.`,
                }),
            };
        } else {
             return {
                statusCode: 400,
                body: JSON.stringify({ message: "Could not register face. No face detected." }),
            };
        }

    } catch (error) {
        console.error("Error in register function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                status: 'error',
                message: "An internal server error occurred during registration."
            }),
        };
    }
};