// Setup router and UserSchema
const express = require('express');
const router = express.Router();

// Setup UserSchema, validation, bcrypt, and jsonwebtoken
const User = require('../models/User');
const { registerValidation,loginValidation } = require('../validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a user
router.post('/register', async (req,res) => {

    // Validate user and return error message if failed
    const { error } = registerValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    // Check if username and email already registered
    const usernameExists = await User.findOne({username: req.body.username});
    if(usernameExists) return res.status(400).send('Username taken.');
    const emailExists = await User.findOne({email: req.body.email});
    if(emailExists) return res.status(400).send('Email already registered');
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password,salt);

    // Create new user object
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPass
    });

    // Save user to DB
    try{
        const savedUser = await user.save();
        res.json(savedUser);
    }catch(err){
        res.status(400).send(err);
    }
});

// Login a user
router.post('/login', async (req,res) => {

    // Validate user and return error message if failed
    const { error } = loginValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    // Check if email is correct
    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).send('Email or password is wrong.');

    // Check if password is correct
    const validPass = await bcrypt.compare(req.body.password,user.password);
    if(!validPass) return res.status(400).send('Email or password is wrong.');

    // Create and assign JWT to user (probably change delivery of token)
    const token = jwt.sign({_id: user._id},process.env.TOKEN_SECRET);
    res.header('User-Token',token);

    // Send success message
    res.send('Logged in as '+user.username);

});

// Export router
module.exports = router;