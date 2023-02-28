const express = require("express");
const app = express();

const { MongoClient } = require("mongodb");
const uri =
    "mongodb+srv://Sudeysh:NC5tYtm2zDzvZkm5@flle-sharing.bn4jz1i.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const crypto = require("crypto-js");

const algorithm = "aes-256-cbc";
const key = "1f2d3e4c5b6a7d8e9f0g1h2i3j4k5l6m";
const iv = crypto.lib.WordArray.random(256 / 8).toString(crypto.enc.Hex);

app.get("/encrypt/:message", async function (request, result) {
    const message = request.params.message;

    const cipher = crypto.AES.encrypt(message, key, {
        iv: iv,
        mode: crypto.mode.CBC,
        padding: crypto.pad.Pkcs7,
    });

    const base64data = Buffer.from(iv, "binary").toString("base64");

    // Connect to the database
    try {
        await client.connect();
        console.log("Connected to the database");

        // Get the strings collection
        const collection = client.db("file").collection("strings");

        // Insert the encrypted message into the collection
        const result = await collection.insertOne({
            message: cipher.toString(),
            iv: base64data,
        });
        console.log("Encrypted message inserted into database:", result);

    } catch (err) {
        console.error(err);
    } finally {
        // Close the database connection
        await client.close();
        console.log("Disconnected from the database");
    }

    result.send(cipher.toString());
});

const server = app.listen(process.env.PORT || 3000, function () {
    console.log("Server started running....");
});
