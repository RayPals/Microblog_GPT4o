const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    image: { type: String },
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

// Ensure indexes are created
postSchema.index({ userId: 1 });

module.exports = mongoose.model('Post', postSchema);
