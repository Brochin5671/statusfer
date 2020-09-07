// Require mongoose
const mongoose = require('mongoose');

// Create UserSchema and export
const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    registerDate: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model('Users',UserSchema);