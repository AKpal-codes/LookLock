# Face Recognition Login with AWS Rekognition & Netlify

A secure, serverless web application that provides a facial recognition-based login and registration system. This project uses a modern frontend to capture a user's face and a secure serverless backend on Netlify to interact with the Amazon Rekognition API.

---

## Application Flow

1. **Login:** User clicks "Enter" and their webcam captures a single frame of their face.
2. **Recognition:** The image is sent to a secure backend function, which asks AWS Rekognition if the face is in its database (collection).
3. **Known User:** If a match is found, a "Welcome back, [Name]!" message is shown, and the user is redirected to the portfolio page.
4. **Unknown User:** If no match is found, the user is prompted to either register ("Introduce Yourself") or skip.
5. **Registration:** The user enters their name, a new photo is taken, and the backend function securely adds their face and name to the AWS Rekognition collection.

---

## Core Features

- **Secure Face Recognition:** Leverages Amazon Rekognition for face matching.
- **New User Registration:** Allows new users to easily register their face with their name.
- **Serverless Backend:** Uses Netlify Functions to handle all communication with the AWS API. Your secret AWS keys are never exposed to the frontend.
- **Modern UI:** Clean, responsive, and user-friendly interface built with HTML and Tailwind CSS.
- **Zero Server Management:** The entire application is deployed on Netlify's serverless platform.

---

## How It Works: The Secure Architecture

This project is intentionally split into a frontend and a backend to ensure security.

- **Frontend (`index.html`):** Static HTML file with JavaScript that runs in the user's browser. Its only job is to capture the webcam image and call our own API endpoints.
- **Backend (Netlify Functions):** Node.js functions (`/netlify/functions/recognize.js` and `register.js`) that run securely on Netlify's servers.
  - Receive the image from the frontend.
  - Safely load your AWS credentials from secure environment variables.
  - Use the AWS SDK to make the actual API calls to Amazon Rekognition.
  - Send a clean, simple JSON response back to the frontend.

**This architecture prevents your AWS secret keys from ever being exposed in the browser.**

---

## Deployment & Setup Guide

### Prerequisites

- AWS Account
- Netlify Account
- Node.js and npm installed
- GitHub account

### Step 1: Clone the Repository

```sh
git clone https://github.com/AKpal-codes/LookLock.git
cd LookLock
npm install
```

## Step 2: AWS Setup

1. **Create an IAM User:**  
   For security, create a new IAM user in your AWS account. Grant it `AmazonRekognitionFullAccess` permissions.

2. **Get Access Keys:**  
   Generate an access key for this new user. Carefully save the Access Key ID and the Secret Access Key.

3. **Create a Rekognition Collection:**  
   Use a simple script provided on the documentation page to create the collection named `face-auth-collection` through amazon SDK. Ensure you use the correct AWS region.

---

## Step 3: Netlify Setup & Deployment

1. **Push to GitHub:**  
   Push the entire project folder to a new repository on your GitHub account.

2. **Create a New Netlify Site:**  
   Log in to Netlify, click "Add new site" → "Import an existing project," and connect it to your new GitHub repository.

3. **Configure Build Settings:**  
   Netlify should automatically detect the settings from `netlify.toml`. The build command is `npm install` (or leave blank) and the publish directory is `/`.

4. **Add Environment Variables:**  
   This is the most critical step. In your Netlify site's dashboard, go to **Site settings > Build & deploy > Environment** and add the following variables:

   | Variable Name               | Value                        | Description                                 |
   |-----------------------------|------------------------------|---------------------------------------------|
   | `REKOGNITION_AWS_ACCESS_KEY_ID`         | Your AWS Access Key ID       | The access key for your IAM user.           |
   | `REKOGNITION_AWS_SECRET_ACCESS_KEY`     | Your AWS Secret Access Key   | The secret key for your IAM user.           |
   | `REKOGNITION_AWS_REGION`                | Your AWS Region (e.g., us-east-1) | The region where your collection exists. |
   | `REKOGNITION_COLLECTION_ID` | `face-auth-collection`       | The exact name of your face collection.     |

5. **Deploy:**  
   Trigger a deploy from the Netlify dashboard. Once it's finished, your site will be live!

---

## Project Structure

```/
├── netlify.toml          # Netlify configuration file
├── package.json          # Node.js dependencies for backend functions
├── index.html            # The main frontend user interface
├── README.md             # You are here!
└── netlify/
    └── functions/
        ├── recognize.js  # Serverless function for face searching
        └── register.js   # Serverless function for new user registration
```