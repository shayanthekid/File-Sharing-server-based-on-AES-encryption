const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    iv: {
        type: String,
        required: true
    }
});

const File = mongoose.model('File', fileSchema);

module.exports = File;