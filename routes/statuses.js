// Setup router, StatusSchema, access token verification, and status validation
const express = require('express');
const router = express.Router();
const path = require('path');
const Status = require('../models/Status');
const {verifyAccessToken} = require('../verifyToken');
const {statusValidation} = require('../validation');

// Get all statuses
router.get('/', async (req, res) => {
    try{
        const statusList = await Status.find().limit(100).sort({createdAt: 'descending'});
        res.json(statusList);
    }catch(err){ // Send error
        res.status(500).json(err);
    }
});

// Send a status to be created
router.post('/', verifyAccessToken, async (req, res) => {
    // Validate status and return error message if failed
    const statusMsg = {message: req.body};
    const {error} = statusValidation(statusMsg);
    if(error) return res.json({error: '400 Bad Request', message: error.details[0].message});
    // Sanitize status
    const sanitizedStatus = req.body.trim();
    // Create new status object
    const status = new Status({
        user: req.user.username,
        userId: req.user._id,
        status: sanitizedStatus
    });
    // Save status to DB
    try{
        const savedStatus = await status.save();
        res.json(savedStatus);
        // Emit post event
        const io = req.app.locals.io;
        io.emit('postStatus', savedStatus);
    }catch(err){ // Send error on failure
        res.status(500).json(err);
    }
});

// Specific status page
router.get('/:statusId', async (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'status.html'));
});

// Get a specific status
router.get('/:statusId/data', async (req, res) => {
    try{
        // Check if status exists
        const status = await Status.findById(req.params.statusId);
        if(!status){
            throw new Error();
        }
        res.json(status);
    }catch(err){ // Send error
        res.json({error: '404 Not Found', message: 'No entry found.'});
    }
});

// Delete a specific status
router.delete('/:statusId', verifyAccessToken, async (req, res) => {
    try{
        // Check if status is owned by user
        const status = await Status.findById(req.params.statusId);
        if(status.user != req.user.username){
            throw new Error();
        }
        // Delete status
        const removedStatus = await Status.deleteOne({_id: req.params.statusId});
        res.json(removedStatus);
        // Emit delete event
        const io = req.app.locals.io;
        io.emit('deleteStatus', status);
    }catch(err){ // Send error
        res.json({error: '404 Not Found', message: 'No entry found.'});
    }
});

// Update a specific status
router.patch('/:statusId', verifyAccessToken, async (req, res) => {
    // Validate status and return error message if failed
    const statusMsg = {message: req.body};
    const {error} = statusValidation(statusMsg);
    if(error) return res.json({error: '400 Bad Request', message: error.details[0].message});
    try{
        // Check if status is owned by user
        const status = await Status.findById(req.params.statusId);
        if(status.user != req.user.username){
            throw new Error();
        }
        // Sanitize status
        const sanitizedStatus = req.body.trim();
        // Update status
        const patchedStatus = await Status.findOneAndUpdate({_id: req.params.statusId}, {status: sanitizedStatus}, {new: true});
        res.json(patchedStatus);
        // Emit patch event
        const io = req.app.locals.io;
        io.emit('patchStatus', patchedStatus);
    }catch(err){ // Send error on failure
        res.json({error: '404 Not Found', message: 'No entry found.'});
    }
});

// Update a specific status's likes
router.post('/:statusId/like', verifyAccessToken, async (req, res) => {
    try{
        // Get status and create sets from likes and dislikes arrays
        const {likes, dislikes, _id} = await Status.findById(req.params.statusId);
        const likeSet = new Set(likes);
        const dislikeSet = new Set(dislikes);
        // Try to add a new user to the set to determine if duplicate and remove from like set if the size doesn't change
        let likeSize = likeSet.size;
        likeSet.add(req.user.username);
        if(likeSet.size == likeSize){
            likeSet.delete(req.user.username);
        }else{ // Try to remove user from dislike set if size changes
            dislikeSet.delete(req.user.username);
        }
        likeSize = likeSet.size;
        const dislikeSize = dislikeSet.size;
        // Update status' likes and dislikes arrays
        await Status.findOneAndUpdate({_id: _id}, {likes: Array.from(likeSet), dislikes: Array.from(dislikeSet)}, {timestamps: false});
        res.json({_id, newLikes: likeSize, newDislikes: dislikeSize});
        // Emit like event
        const io = req.app.locals.io;
        io.emit('likeStatus', {_id, newLikes: likeSize, newDislikes: dislikeSize});
    }catch(err){ // Send error on failure
        res.json({error: '404 Not Found', message: 'No entry found.'});
    }
});

// Update a specific status's dislikes
router.post('/:statusId/dislike', verifyAccessToken, async (req, res) => {
    try{
        // Get status and create sets from likes and dislikes arrays
        const {likes, dislikes, _id, createdAt} = await Status.findById(req.params.statusId);
        const likeSet = new Set(likes);
        const dislikeSet = new Set(dislikes);
        // Try to add a new user to the set to determine if duplicate and remove from dislike set if the size doesn't change
        let dislikeSize = dislikeSet.size;
        dislikeSet.add(req.user.username);
        if(dislikeSet.size == dislikeSize){
            dislikeSet.delete(req.user.username);
        }else{ // Try to remove user from like set if size changes
            likeSet.delete(req.user.username);
        }
        dislikeSize = dislikeSet.size;
        const likeSize = likeSet.size;
        // Update status' likes and dislikes array
        await Status.findOneAndUpdate({_id: _id}, {likes: Array.from(likeSet), dislikes: Array.from(dislikeSet)}, {timestamps: false});
        res.json({_id, newLikes: likeSize, newDislikes: dislikeSize});
        // Emit dislike event
        const io = req.app.locals.io;
        io.emit('dislikeStatus', {_id, newLikes: likeSize, newDislikes: dislikeSize});
    }catch(err){ // Send error on failure
        res.json({error: '404 Not Found', message: 'No entry found.'});
    }
});

// Export router
module.exports = router;