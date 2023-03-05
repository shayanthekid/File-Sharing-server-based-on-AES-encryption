const mongoose = require('mongoose');

const downloadLogSchema = new mongoose.Schema({
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    downloadTime: {
        type: Date,
        default: Date.now,
    },
});

const DownloadLog = mongoose.model('DownloadLog', downloadLogSchema);

module.exports = DownloadLog;