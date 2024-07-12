const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    comments: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            content: String,
            timestamp: { type: Date, default: Date.now }
        }
    ],
    reactions: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            reaction: String
        }
    ],
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
