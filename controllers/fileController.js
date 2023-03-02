const File = require('../models/file');
const crypto = require("crypto-js");
const algorithm = "aes-256-cbc";
const key = "1f2d3e4c5b6a7d8e9f0g1h2i3j4k5l6m";
const iv = crypto.lib.WordArray.random(256 / 8).toString(crypto.enc.Hex);
const multer = require('multer');
const path = require('path');
// Set storage engine
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

// Initialize upload
const upload = multer({
    storage: storage
}).single('file');

exports.uploadFile = async (req, res) => {
    upload(req, res, async function (err) {
        if (err) {
            console.error(err);
            res.send('Error uploading file');
        } else {
            // Get the file details from the request
            const { title, description  } = req.body;
            const { filename } = req.file;

            // Encrypt the filename using AES encryption
            const cipher = crypto.AES.encrypt(filename, key, {
                iv: iv,
                mode: crypto.mode.CBC,
                padding: crypto.pad.Pkcs7,
            });

            const base64data = Buffer.from(iv, 'binary').toString('base64');
            const encryptedFilename = encodeURIComponent(cipher.toString()).replace(/\//g, '_').replace(/\+/g, '-');

            try {
                const file = new File({
                    title: title,
                    description: description,
                    iv: base64data,
                    username: "testuser",
                    filename: encryptedFilename
                });

                await file.save();

                res.send('File uploaded successfully');
            } catch (err) {
                console.error(err);
                res.send('Error uploading file');
            }
        }
    });
};


exports.getAllFiles = async (req, res) => {
    try {
        const files = await File.find({});

        const decryptedFiles = files.map((file) => {
            const decryptedFilename = crypto.AES.decrypt(decodeURIComponent(file.filename).replace(/_/g, '/').replace(/-/g, '+'), key, {
                iv: Buffer.from(file.iv, 'base64'),
                mode: crypto.mode.CBC,
                padding: crypto.pad.Pkcs7
            }).toString(crypto.enc.Utf8);

            return {
                id: file._id,
                title: file.title,
                filename: decryptedFilename,
                username: file.username
            };
        });

       

        // construct the absolute path to the file
        const filePath = path.join(__dirname, '..', 'uploads/',);


        //res.json(decryptedFiles);
        res.render('files', { decryptedFiles, filePath });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving files');
    }
};

exports.downloadFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        const decryptedFilename = crypto.AES.decrypt(
            decodeURIComponent(file.filename).replace(/_/g, '/').replace(/-/g, '+'),
            key,
            {
                iv: Buffer.from(file.iv, 'base64'),
                mode: crypto.mode.CBC,
                padding: crypto.pad.Pkcs7
            }
        ).toString(crypto.enc.Utf8);

        const filePath = path.join(__dirname, '..', 'uploads', decryptedFilename);

        res.download(filePath, file.originalname);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to download file' });
    }
};


exports.createFile = async (req, res) => {
    const message = req.params.message;

    const cipher = crypto.AES.encrypt(message, key, {
        iv: iv,
        mode: crypto.mode.CBC,
        padding: crypto.pad.Pkcs7,
    });

    const base64data = Buffer.from(iv, "binary").toString("base64");
    const encryptedMessage = encodeURIComponent(cipher.toString()).replace(/\//g, "_").replace(/\+/g, "-");

    try {
        const file = new File({
            message: encryptedMessage,
            iv: base64data,
        });

        await file.save();

        res.send(encryptedMessage);

    } catch (err) {
        console.error(err);
        res.send("Error encrypting message");
    }
};



exports.getFile = async (req, res) => {
    const encrypted = req.params.encrypted.replace(/_/g, "/").replace(/-/g, "+").replace(/-/g, "%");

    try {
        const file = await File.findOne({ iv: encrypted });

        if (file) {
            const iv = Buffer.from(file.iv, "base64");
            const decrypted = crypto.AES.decrypt(decodeURIComponent(file.message), key, {
                iv: iv,
                mode: crypto.mode.CBC,
                padding: crypto.pad.Pkcs7,
            });

            res.send(decrypted.toString(crypto.enc.Utf8));
        } else {
            res.send("Message not found");
        }
    } catch (err) {
        console.error(err);
        res.send("Error decrypting message");
    }
};

exports.getFiles = async (req, res) => {
    try {
        const files = await File.find().sort({ _id: -1 });

        res.render("index", { data: files });

    } catch (err) {
        console.error(err);
        res.send("Error fetching files");
    }
};