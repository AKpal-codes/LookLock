const { RekognitionClient, SearchFacesByImageCommand } = require("@aws-sdk/client-rekognition");

// Initialize the Rekognition client
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
        const { image } = JSON.parse(event.body);
        const imageBytes = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), 'base64');

        const command = new SearchFacesByImageCommand({
            CollectionId: process.env.REKOGNITION_COLLECTION_ID,
            Image: { Bytes: imageBytes },
            FaceMatchThreshold: 90, // Confidence threshold
            MaxFaces: 1,
        });

        const data = await client.send(command);

        if (data.FaceMatches && data.FaceMatches.length > 0) {
            const matchedFace = data.FaceMatches[0];
            // The name is stored in ExternalImageId during registration
            const name = matchedFace.Face.ExternalImageId;
            return {
                statusCode: 200,
                body: JSON.stringify({
                    status: 'known',
                    message: `Welcome back, ${name}!`,
                    name: name,
                }),
            };
        } else {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    status: 'unknown',
                    message: 'Hi stranger! Want to introduce yourself?',
                }),
            };
        }
    } catch (error) {
        // This error often means no face was found in the image
        if (error.name === 'InvalidParameterException') {
            return {
                statusCode: 400,
                body: JSON.stringify({ 
                    status: 'no_face_detected',
                    message: "We couldn't detect a face. Please try again."
                }),
            };
        }
        console.error("Error in recognize function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                status: 'error',
                message: "An internal server error occurred."
            }),
        };
    }
};