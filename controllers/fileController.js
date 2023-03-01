const File = require('../models/file');
const crypto = require("crypto-js");
const algorithm = "aes-256-cbc";
const key = "1f2d3e4c5b6a7d8e9f0g1h2i3j4k5l6m";
const iv = crypto.lib.WordArray.random(256 / 8).toString(crypto.enc.Hex);

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
        const file = await File.findOne({ message: encrypted });

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