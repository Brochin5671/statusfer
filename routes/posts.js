// Setup router
const express = require('express');
const router = express.Router();

// Routes
router.get('/',(req,res) => {
    res.send('posts');
});

// Post request
const Post = require('../models/Post');
router.post('/', (req,res) => {
    // Create Post object
    const post = new Post({
        user: req.body.user,
        status: req.body.status
    })
    // Save data to DB
    post.save()
    .then(data => { // Respond with data
        res.status(200).json(data);
    })
    .catch(err => { // Respond with err
        res.status(500).json( {message: err} );
    });
});

// Export router
module.exports = router;