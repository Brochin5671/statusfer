// Setup router and UserSchema
const express = require('express');
const router = express.Router();

// Setup UserSchema, validation, bcrypt, and jsonwebtoken
const User = require('../models/User');
const { registerValidation,loginValidation } = require('../validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Store refreshTokens
let refreshTokens = [];

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

// Generate new access token from refresh token
router.post('/token', async (req,res) => {

    // Check if refresh token exists
    const refreshToken = req.body.token;
    if(!refreshToken) return res.sendStatus(401);
    if(!refreshTokens.includes(refreshToken)) return res.status(403).send('Forbidden token');

    // Verify refresh token and generate new access token
    try{
        const verified = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
        const accessToken = jwt.sign({_id: verified._id, username: verified.username},process.env.ACCESS_TOKEN_SECRET,{expiresIn: '10m'});
        res.json({accessToken: accessToken});
    }catch(err){ // Send error
        res.status(400).send('Invalid token');
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

    // Create and assign access and refresh token to user, then store refresh token
    const accessToken = jwt.sign({_id: user._id, username: user.username},process.env.ACCESS_TOKEN_SECRET,{expiresIn: '10m'});
    const refreshToken = jwt.sign({_id: user._id, username: user.username},process.env.REFRESH_TOKEN_SECRET);
    refreshTokens.push(refreshToken);

    // Send tokens
    res.json({accessToken: accessToken, refreshToken: refreshToken});

});

// Logout a user
router.delete('/logout',(req,res) => {
    // Remove refresh token and send success message
    refreshTokens = refreshTokens.filter(token => token !== req.body.token);
    res.send('Logout successful');
});

// Export router
module.exports = router;