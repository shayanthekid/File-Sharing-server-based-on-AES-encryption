const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    iv: {
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true
    },
    filename: {
        type: String,
        required: true
    }
});

const File = mongoose.model('File', fileSchema);

module.exports = File;