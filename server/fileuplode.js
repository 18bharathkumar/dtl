const { Storage } = require('@google-cloud/storage');
const path = require('path');
const multer = require('multer');

// Google Cloud Storage Configuration
const storage = new Storage({
    projectId: 'totemic-web-444003-c3', // Replace with your project ID
    keyFilename: 'key.json' // Replace with the path to your key file
});

const bucketName = 'hunger_chain-photo'; // Replace with your bucket name
const bucket = storage.bucket(bucketName);

// Multer Storage for Local Uploads
const localStorage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage: localStorage });

// Function to Upload File to Google Cloud Bucket
const uploadToGoogleCloud = async (filePath, filename) => {
    try {
        const file = bucket.file(filename);

        // Upload the file to the bucket
        await bucket.upload(filePath, {
            destination: filename,
            public: true // Make the file public
        });

        // Get the public URL
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
        return publicUrl;
    } catch (error) {
        console.error('Error uploading to Google Cloud:', error);
        throw new Error('Failed to upload file to Google Cloud');
    }
};

module.exports = { upload, uploadToGoogleCloud };
