// Setup mongoose
const mongoose = require('mongoose');

// Create StatusSchema and export
const StatusSchema = mongoose.Schema({
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
});
module.exports = mongoose.model('Statuses',StatusSchema);