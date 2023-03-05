const User = require('../models/user');
const crypto = require('crypto-js');
const algorithm = 'aes-256-cbc';
const key = '1f2d3e4c5b6a7d8e9f0g1h2i3j4k5l6m';
const iv = crypto.lib.WordArray.random(256 / 8).toString(crypto.enc.Hex);

exports.signup = async (req, res) => {
    const { username, password } = req.body;

    // Encrypt the password using AES encryption
    const cipher = crypto.AES.encrypt(password, key, {
        iv: iv,
        mode: crypto.mode.CBC,
        padding: crypto.pad.Pkcs7,
    });

    const base64data = Buffer.from(iv, 'binary').toString('base64');
    const encryptedPassword = encodeURIComponent(cipher.toString()).replace(/\//g, '_').replace(/\+/g, '-');

    try {
        const user = new User({
            username,
            password: encryptedPassword,
            iv: base64data,
        });

        await user.save();

        res.send('User created successfully');
    } catch (err) {
        console.error(err);
        res.send('Error creating user');
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).send('Invalid username or password');
        }

        const iv = Buffer.from(user.iv, 'base64');

        // Decrypt the password using the user's iv and key
        const decrypted = crypto.AES.decrypt(decodeURIComponent(user.password), key, {
            iv: iv,
            mode: crypto.mode.CBC,
            padding: crypto.pad.Pkcs7,
        });

        if (decrypted.toString(crypto.enc.Utf8) !== password) {
            return res.status(401).send('Invalid username or password');
        }

        req.session.user = {
            username: user.username,
            email: 'example@example.com'
        };

        res.redirect('/home/getAllFiles');
       // res.send('Logged in successfully');
    } catch (err) {
        console.error(err);
        res.send(err);
    }
};