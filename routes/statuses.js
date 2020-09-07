// Setup router, StatusSchema, and token verification
const express = require('express');
const router = express.Router();
const Status = require('../models/Status');
const verifyToken = require('../verifyToken');

// Gets all statuses
router.get('/', async (req,res) => {
    try{
        const statuses = await Status.find().limit(10);
        res.json(statuses);
    }catch(err){ // Send error
        res.json({message: err});
    }
});

// Send a status
router.post('/', verifyToken, async (req,res) => {

    // Create new status object
    const status = new Status({
        user: req.body.user,
        status: req.body.status
    });

    // Save status to DB
    try{
        const savedStatus = await status.save()
        res.json(savedStatus);
    }catch(err){ // Send error
        res.json({message: err});
    }
    
});

// Get a specific status
router.get('/:statusId', async (req,res) => {
    try{
        const status = await Status.findById(req.params.statusId);
        res.send(status.user+": "+status.status);
    }catch(err){ // Send error
        res.send('Entry not found');
    }
});

// Delete a specific status
router.delete('/:statusId', verifyToken, async (req,res) => {
    try{
        const removedStatus = await Status.deleteOne({_id: req.params.statusId});
        res.json(removedStatus);
    }catch(err){ // Send error
        res.send('Entry not found');
    }
});

// Update a specific status
router.patch('/:statusId', verifyToken, async (req,res) => {
    try{
        const patchedStatus = await Status.updateOne(
            {_id: req.params.statusId},
            {$set: {status: req.body.status}});
        res.json(patchedStatus);
    }catch(err){ // Send error
        res.send('Entry not found');
    }
});

// Export router
module.exports = router;