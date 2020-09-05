// Setup router
const express = require('express');
const router = express.Router();

// Routes

// Gets all posts
router.get('/', async (req,res) => {
    try{
        const posts = await Post.find().limit(1);
        res.json(posts);
    }catch(err){
        res.json( {message: err} );
    }
});

// Sends a post
const Post = require('../models/Post');
router.post('/', async (req,res) => {
    // Create Post object
    const post = new Post({
        user: req.body.user,
        status: req.body.status
    })
    // Save data to DB
    try{
        const savedPost = await post.save()
        res.json(savedPost);
    }catch(err){ // Send error
        res.json({message: err});
    }
});

// Get a specific post
router.get('/:postId', async (req,res) => {
    try{
        const post = await Post.findById(req.params.postId);
        res.json(post);
    }catch(err){ // Send error
        res.json({message: err});
    }
});

// Delete a specific post
router.delete('/:postId', async (req,res) => {
    try{
        const removedPost = await Post.deleteOne({_id: req.params.postId});
        res.json(removedPost);
    }catch(err){ // Send error
        res.json({message: err});
    }
});

// Update a specific post
router.patch('/:postId', async (req,res) => {
    try{
        const patchedPost = await Post.updateOne(
            {_id: req.params.postId},
            {$set: {status: req.body.status}});
        res.json(patchedPost);
    }catch(err){ // Send error
        res.json({message: err});
    }
});

// Export router
module.exports = router;