// Required modules
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();
const nodemailer = require('nodemailer');
const { google } = require('googleapis');


const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const GMAIL_USER = process.env.GMAIL_USER;

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/complaintsDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Complaint Schema
const complaintSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    busNumber: { type: String },
    complaintType: { type: String, required: true },
    complaintDescription: { type: String, required: true },
    complaintPhoto: String,
    status: { type: String, default: 'Pending' },
    submittedAt: { type: Date, default: Date.now }
});
const Complaint = mongoose.model('Complaint', complaintSchema);

// Multer Configuration
const localStorage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({
    storage: localStorage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only images are allowed'));
        }
        cb(null, true);
    }
});

// Google Cloud Storage Configuration
const storage = new Storage({
    projectId: 'totemic-web-444003-c3', // Replace with your Google Cloud project ID
    keyFilename: 'key.json' // Replace with your service account key file
});
const bucketName = 'hunger_chain-photo'; // Replace with your bucket name
const bucket = storage.bucket(bucketName);

// Upload File to Google Cloud Storage
const uploadToGoogleCloud = async (filePath, filename) => {
    try {
        const file = bucket.file(filename);

        // Upload the file to the bucket
        await bucket.upload(filePath, {
            destination: filename,
            public: true // Make the file publicly accessible
        });

        // Get the public URL
        return `https://storage.googleapis.com/${bucketName}/${filename}`;
    } catch (error) {
        console.error('Error uploading to Google Cloud:', error);
        throw new Error('Failed to upload file to Google Cloud');
    }
};

// Submit Complaint

app.post('/submit-complaint', upload.single('complaintPhoto'), async (req, res) => {
    //check if the end get hit or not
    console.log("hitting the /submit-complaint endpoint");
    console.log(req.body);
    

    try {
        const { name, email, mobile, busNumber, complaintType, complaintDescription } = req.body;
        const localFilePath = req.file ? req.file.path : null;

        let complaintPhotoUrl = null;

        // Upload to Google Cloud if a file was uploaded
        if (localFilePath) {
            const cloudFilename = `${Date.now()}_${path.basename(localFilePath)}`;
            complaintPhotoUrl = await uploadToGoogleCloud(localFilePath, cloudFilename);

            // Optionally, delete the local file after upload
            fs.unlink(localFilePath, (err) => {
                if (err) console.error('Error deleting local file:', err);
            });
        }

        const newComplaint = new Complaint({
            name,
            email,
            mobile,
            busNumber,
            complaintType,
            complaintDescription,
            complaintPhoto: complaintPhotoUrl
        });

        const savedComplaint = await newComplaint.save();
        res.json({
            message: 'Complaint submitted successfully',
            complaintId: savedComplaint._id,
            complaintPhotoUrl
        });
    } catch (err) {
        console.error("Error submitting complaint:", err);
        res.status(500).json({ message: 'Error submitting complaint' });
    }
});

// Fetch All Complaints with IST Timing


app.get('/all-complaints', async (req, res) => {
    try {
        // Fetch all complaints from the database
        const allComplaints = await Complaint.find();

        // Convert submittedAt to Indian Standard Time (IST)
        const complaintsWithIST = allComplaints.map(complaint => ({
            ...complaint._doc, // Spread the complaint object to keep all fields
            submittedAt: new Date(complaint.submittedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        }));

        // Send the complaints with IST timings as a JSON response
        res.json({ complaints: complaintsWithIST });
    } catch (err) {
        console.error("Error fetching complaints:", err);
        res.status(500).json({ message: 'Error fetching complaints' });
    }
});

//getting specified complient
app.get('/complaint/:id', async (req, res) => {
//hitting get one complinet with id 

    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }
        res.json(complaint);
    } catch (err) {
        console.error("Error fetching complaint:", err);
        res.status(500).json({ message: 'Error fetching complaint' });
    }
});


const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Function to send an email
async function sendEmail(to, subject, text) {
    try {
        const accessToken = await oauth2Client.getAccessToken();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: GMAIL_USER,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken.token,
            },
        });

        const mailOptions = {
            from: `Complaint Management <${GMAIL_USER}>`,
            to: to,
            subject: subject,
            text: text,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent:', result);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

// API endpoint to resolve complaint
app.put('/resolve-complaint/:id', async (req, res) => {
    try {
        const updatedComplaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { status: 'Resolved' },
            { new: true }
        );

        if (!updatedComplaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        // Send email to the complainant
        const recipientEmail = updatedComplaint.email; // Assuming the complaint document has an 'email' field
        const complaintId = updatedComplaint._id;
        const complaintDescription = updatedComplaint.description;

        const subject = 'Your Complaint has been Resolved';
        const emailText = `
            Dear User,

            We are writing to inform you that your complaint (ID: ${complaintId}) has been marked as resolved.

            Complaint Details:
            - Description: ${complaintDescription}

            Thank you for bringing this to our attention. Please feel free to reach out if you have any further concerns.

            Best Regards,
            Complaint Management Team
        `;

        await sendEmail(recipientEmail, subject, emailText);

        res.json({ message: 'Complaint marked as resolved and email sent to the user.' });
    } catch (err) {
        console.error('Error updating complaint status:', err);
        res.status(500).json({ message: 'Error updating complaint status' });
    }
});



app.post('/sendmail',(req,res)=>{
    try {
        
    } catch (error) {
        
    }
})



// Start Server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
