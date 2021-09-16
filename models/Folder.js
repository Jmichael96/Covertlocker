const mongoose = require('mongoose');

const FolderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    folderName: {
        type: String,
        required: true,
    },
    updatedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
    }
});

const folder = mongoose.model('Folder', FolderSchema);

module.exports = folder;