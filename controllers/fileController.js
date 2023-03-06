const File = require('../models/file');
const DownloadLog = require('../models/log')
const crypto = require("crypto-js");
const algorithm = "aes-256-cbc";
const key = "1f2d3e4c5b6a7d8e9f0g1h2i3j4k5l6m";
const iv = crypto.lib.WordArray.random(256 / 8).toString(crypto.enc.Hex);
const multer = require('multer');
const path = require('path');
const AWS = require('../models/aws');
const kms = new AWS.KMS({ region: 'ap-southeast-1' });
const keyId = 'arn:aws:kms:ap-southeast-1:826894182914:key/d9341968-3e8e-409c-8120-6dde85dd882d';

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
            const { title, description } = req.body;
            const { filename } = req.file;
            const { username } = req.session.user;

            // Encrypt the filename using KMS encryption
            const encryptParams = {
                KeyId: keyId,
                Plaintext: Buffer.from(filename),
            };

            kms.encrypt(encryptParams, async (err, data) => {
                if (err) {
                    console.log('Encryption error:', err);
                    res.send('Error uploading file');
                } else {
                    const encryptedFilename = data.CiphertextBlob.toString('base64');
                    const base64data = Buffer.from(iv, 'binary').toString('base64');

                    try {
                        const file = new File({
                            title: title,
                            description: description,
                            iv: base64data,
                            username: username,
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
        }
    });
};

exports.getAllFiles = async (req, res) => {

    let filePath;
    let test = 1234;

    try {
        const files = await File.find({});
        const logs = await DownloadLog.find({});
        const decryptedFiles = await Promise.all(
            files.map(async (file) => {
                const decryptedFilename = await kms.decrypt({
                    CiphertextBlob: Buffer.from(file.filename, 'base64'),
                    EncryptionContext: {
                        // Add any encryption context you have used when encrypting the file name
                    }
                }).promise().then(data => data.Plaintext.toString());

                return {
                    id: file._id,
                    title: file.title,
                    filename: decryptedFilename,
                    username: file.username
                };
            })
        );
        
        
        filePath = path.join(__dirname, '..', 'uploads/');

       

        // construct the absolute path to the file


        //res.json(decryptedFiles);
        res.render('files', { decryptedFiles, filePath, req, logs, test });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving files');
    }
};

exports.downloadFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        // Decrypt the filename using AWS KMS
        const decryptedFilename = await kms.decrypt({
            CiphertextBlob: Buffer.from(file.filename, 'base64'),
            EncryptionContext: {
                // Add any encryption context you have used when encrypting the file name
            }
        }).promise().then(data => data.Plaintext.toString());

        const filePath = path.join(__dirname, '..', 'uploads', decryptedFilename);

        res.download(filePath, file.originalname);
        const currentTime = new Date();

        try {
            const log = new DownloadLog({
                fileId: req.params.id,
                username: req.session.user.username,
                downloadTime: currentTime
            });

            await log.save();
        } catch (error) {
            console.error(error);
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to download file' });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const file = await File.findByIdAndDelete(req.params.id);
        res.send('File deleted successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting file');
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