// Require mongoose
const mongoose = require('mongoose');

// Create PostSchema and export
const PostSchema = mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
})
module.exports = mongoose.model('Posts',PostSchema);