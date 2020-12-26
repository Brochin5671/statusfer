// Setup router
const express = require('express');
const router = express.Router();
const path = require('path');

// Setup UserSchema, validation, bcrypt, jsonwebtoken, and token verification
const User = require('../models/User');
const { registerValidation,loginValidation } = require('../validation');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyAccessToken, verifyRefreshToken } = require('../verifyToken');

// Store refreshTokens
let refreshTokens = [];

// Register page
router.get('/register', (req,res) => {
    res.sendFile(path.join(__dirname,'../public','register.html'));
});

// Register a user
router.post('/register', async (req,res) => {
    // Validate user and return error message if failed
    const { error } = registerValidation(req.body);
    if(error) return res.json({error: '400 Bad Request', message: error.details[0].message});
    // Check if username and email already registered
    const usernameExists = await User.findOne({username: req.body.username});
    if(usernameExists) return res.json({error: '400 Bad Request', message: 'Username is taken.'});
    const emailExists = await User.findOne({email: req.body.email});
    if(emailExists) return res.json({error: '400 Bad Request', message: 'Email already registered.'});
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password,salt);
    // Sanitize username and email
    const sanitizedUsername = req.body.username.trim();
    const sanitizedEmail = req.body.email.trim();
    // Create new user object
    const user = new User({
        username: sanitizedUsername,
        email: sanitizedEmail,
        password: hashedPass
    });
    // Save user to DB and generate tokens
    try{
        const savedUser = await user.save();
        // Create and assign access and refresh token to user, then store refresh token
        const accessToken = jwt.sign({_id: user._id, username: user.username},process.env.ACCESS_TOKEN_SECRET,{expiresIn: '10m'});
        const refreshToken = jwt.sign({_id: user._id, username: user.username},process.env.REFRESH_TOKEN_SECRET,{expiresIn: '1h'});
        refreshTokens.push(refreshToken);
        // Send httponly token cookies
        res.cookie('accessToken',accessToken, {maxAge: 600000, httpOnly: true});
        res.cookie('refreshToken',refreshToken,{maxAge: 3600000, httpOnly: true});
        res.status(200).json({message: 'Register successful'});
    }catch(err){
        res.status(500).json(err);
    }
});

// Generate new access token from refresh token
router.post('/token', verifyRefreshToken, async (req,res) => {
    // Check if refresh token exists
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken) return res.json({error: '401 Unauthorized', message: 'Unauthorized Access'});
    if(!refreshTokens.includes(refreshToken)) return res.json({error: '403 Forbidden', message: 'Forbidden token'});
    // Generate new access token and httponly token cookie if access token cookie expired
    const currentAccessToken = req.cookies.accessToken;
    if(!currentAccessToken){
        const accessToken = jwt.sign({_id: req.user._id, username: req.user.username},process.env.ACCESS_TOKEN_SECRET,{expiresIn: '10m'});
        res.cookie('accessToken', accessToken, {maxAge: 600000, httpOnly: true});
    }
    res.status(200).json({message: req.user.username});
});

// Login page
router.get('/login',(req,res) => {
    res.sendFile(path.join(__dirname,'../public','login.html'));
});

// Login a user
router.post('/login', async (req,res) => {
    // Validate user and return error message if failed
    const { error } = loginValidation(req.body);
    if(error) return res.json({error: '400 Bad Request', message: error.details[0].message});
    // Check if email is correct
    const user = await User.findOne({email: req.body.email});
    if(!user) return res.json({error: '400 Bad Request', message: 'Email or password is wrong.'});
    // Check if password is correct
    const validPass = await bcrypt.compare(req.body.password,user.password);
    if(!validPass) return res.json({error: '400 Bad Request', message: 'Email or password is wrong.'});
    // Create and assign access and refresh token to user, then store refresh token
    const accessToken = jwt.sign({_id: user._id, username: user.username},process.env.ACCESS_TOKEN_SECRET,{expiresIn: '10m'});
    const refreshToken = jwt.sign({_id: user._id, username: user.username},process.env.REFRESH_TOKEN_SECRET,{expiresIn: '1h'});
    refreshTokens.push(refreshToken);
    // Send httponly token cookies
    res.cookie('accessToken',accessToken, {maxAge: 600000, httpOnly: true});
    res.cookie('refreshToken',refreshToken, {maxAge: 3600000, httpOnly: true})
    res.status(200).json({message: 'Login successful'});
});

// Verify user logged in and send back username
router.get('/loggedin', verifyAccessToken, (req,res) => {
    res.status(200).json({message: req.user.username});
});

// Logout a user
router.delete('/logout', (req,res) => {
    // Remove refresh token from db, clear cookies, and send success message
    refreshTokens = refreshTokens.filter(token => token !== req.cookies.refreshToken);
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    res.status(200).send('Logout successful');
});

// Export router
module.exports = router;