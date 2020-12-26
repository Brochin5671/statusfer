// Setup router, StatusSchema, and token verification
const express = require('express');
const router = express.Router();
const path = require('path');
const Status = require('../models/Status');
const { verifyAccessToken, verifyRefreshToken } = require('../verifyToken');
const { statusValidation } = require('../validation');

// Get all statuses
router.get('/', async (req,res) => {
    try{
        const statuses = await Status.find().limit(100).sort({createdAt: 'descending'});
        res.json(statuses);
    }catch(err){ // Send error
        res.status(500).json(err);
    }
});

// Send a status
router.post('/', verifyAccessToken, async (req,res) => {
    // Validate status and return error message if failed
    const statusMsg = { message: req.body };
    const { error } = statusValidation(statusMsg);
    if(error) return res.json({error: '400 Bad Request', message: error.details[0].message});
    // Sanitize status
    const sanitizedStatus = req.body.trim();
    // Create new status object
    const status = new Status({
        user: req.user.username,
        status: sanitizedStatus
    });
    // Save status to DB
    try{
        const savedStatus = await status.save()
        res.json(savedStatus);
    }catch(err){ // Send error
        res.status(500).json(err);
    }
});

// Specific status page
router.get('/:statusId', async (req,res) => {
    res.sendFile(path.join(__dirname,'../public','status.html'));
});

// Get a specific status
router.get('/:statusId/data', async (req,res) => {
    try{
        const status = await Status.findById(req.params.statusId);
        res.json(status);
    }catch(err){ // Send error
        res.json({error: '404 Not Found', message: 'No entry found'});
    }
});

// Delete a specific status
router.delete('/:statusId', verifyAccessToken, async (req,res) => {
    try{
        // Check if status is owned by user
        const status = await Status.findById(req.params.statusId);
        if(status.user != req.user.username){
            throw new Error();
        }
        // Delete status
        const removedStatus = await Status.deleteOne({_id: req.params.statusId});
        res.json(removedStatus);
    }catch(err){ // Send error
        res.json({error: '404 Not Found', message: 'No entry found'});
    }
});

// Update a specific status
router.patch('/:statusId', verifyAccessToken, async (req,res) => {
    // Validate status and return error message if failed
    const statusMsg = { message: req.body };
    const { error } = statusValidation(statusMsg);
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
        const patchedStatus = await Status.updateOne({_id: req.params.statusId},{$set: {status: sanitizedStatus}});
        res.json(patchedStatus);
    }catch(err){ // Send error
        res.json({error: '404 Not Found', message: 'No entry found'});
    }
});

// Export router
module.exports = router;