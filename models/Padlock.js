const mongoose = require('mongoose');

const PadlockSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    notes: {
        type: String,
        required: false
    },
    folder: {
        type: String,
        required: true
    },
    updatedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
    }
});

const padlock = mongoose.model('Padlock', PadlockSchema);

module.exports = padlock;