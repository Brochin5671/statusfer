// Setup mongoose
const mongoose = require('mongoose');

// Create StatusSchema and export model
const StatusSchema = mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    likes: {
        type: Array,
        required: true
    },
    dislikes: {
        type: Array,
        required: true
    }
}, {timestamps: true});
module.exports = mongoose.model('Statuses', StatusSchema);