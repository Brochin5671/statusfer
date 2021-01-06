// Setup router, path, User and Status model, validation, sanitize text, refresh token verification, bcrypt, and jsonwebtoken
const router = require('express').Router();
const path = require('path');
const User = require('../models/User');
const Status = require('../models/Status');
const {registerValidation, loginValidation} = require('../validation');
const {sanitizeText} = require('../sanitize.js');
const {verifyRefreshToken} = require('../verifyToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Store refreshTokens
let refreshTokens = [];

// Serve register page
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'register.html'));
    // Redirect if refresh cookie exists
    if(req.cookies.refreshToken){
        res.redirect('../');
    }
});

// Register a user
router.post('/register', async (req, res) => {
    // Validate user and return error message if failed
    const {error} = registerValidation(req.body);
    if(error) return res.status(400).json({error: '400 Bad Request', message: error.details[0].message});
    // Sanitize username and email
    const sanitizedUsername = sanitizeText(req.body.username);
    const sanitizedEmail = req.body.email.trim();
    // Check if username and email already registered
    const usernameExists = await User.findOne({username: sanitizedUsername});
    if(usernameExists) return res.status(400).json({error: '400 Bad Request', message: 'Username is taken.'});
    const emailExists = await User.findOne({email: sanitizedEmail});
    if(emailExists) return res.status(400).json({error: '400 Bad Request', message: 'Email already registered.'});
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    // Create new user object
    const user = new User({
        username: sanitizedUsername,
        email: sanitizedEmail,
        password: hashedPass
    });
    // Save user to DB and generate tokens on success
    try{
        await user.save();
        // Create and assign access and refresh token to user, then store refresh token
        const accessToken = jwt.sign({_id: user._id, username: user.username}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '10m'});
        const refreshToken = jwt.sign({_id: user._id, username: user.username}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '1h'});
        refreshTokens.push(refreshToken);
        // Send httponly token cookies
        res.cookie('accessToken', accessToken, {maxAge: 600000, httpOnly: true});
        res.cookie('refreshToken', refreshToken, {maxAge: 3600000, httpOnly: true});
        res.json({message: 'Successfully registered user.'});
    }catch(err){ // Send error on failure
        res.status(500).json({error: '500 Internal Server Error', message: 'Unable to register user.'});
    }
});

// Generate new access token from refresh token
router.post('/token', verifyRefreshToken, (req, res) => {
    // Check if refresh token exists in DB, clear cookies and send error if not found
    const refreshToken = req.cookies.refreshToken;
    if(!refreshTokens.includes(refreshToken)){
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        return res.status(403).json({error: '403 Forbidden', message: 'This token has expired, try re-logging in.'});
    }
    // Generate new access token and httponly token cookie if access token cookie expired
    const currentAccessToken = req.cookies.accessToken;
    if(!currentAccessToken){
        const accessToken = jwt.sign({_id: req.user._id, username: req.user.username}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '10m'});
        res.cookie('accessToken', accessToken, {maxAge: 600000, httpOnly: true});
    }
    res.json({message: req.user.username, userId: req.user._id});
});

// Serve login page
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
    // Redirect if refresh cookie exists
    if(req.cookies.refreshToken){
        res.redirect('../');
    }
});

// Login a user
router.post('/login', async (req, res) => {
    // Validate user and return error message if failed
    const {error} = loginValidation(req.body);
    if(error) return res.status(400).json({error: '400 Bad Request', message: error.details[0].message});
    // Check if email and password is correct
    const user = await User.findOne({email: req.body.email});
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!user || !validPass) return res.status(400).json({error: '400 Bad Request', message: 'Email or password is wrong.'});
    // Create and assign access and refresh token to user, then store refresh token
    const accessToken = jwt.sign({_id: user._id, username: user.username}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '10m'});
    const refreshToken = jwt.sign({_id: user._id, username: user.username}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '1h'});
    refreshTokens.push(refreshToken);
    // Send httponly token cookies
    res.cookie('accessToken', accessToken, {maxAge: 600000, httpOnly: true});
    res.cookie('refreshToken', refreshToken, {maxAge: 3600000, httpOnly: true})
    res.json({message: 'Successfully logged in user.'});
});

// Logout a user
router.delete('/logout', (req, res) => {
    // Remove refresh token from db, clear cookies, and send success message
    refreshTokens = refreshTokens.filter(token => token !== req.cookies.refreshToken);
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    res.json({message: 'Successfully logged out user.'});
});

// Serve a specific user page
router.get('/:userId', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'user.html'));
});

// Get a specific user
router.get('/:userId/data', async (req, res) => {
    // Get and return a user and user's status list on success
    try{
        // Check if user exists
        const user = await User.findById(req.params.userId);
        if(!user) throw new Error();
        const {username, _id, createdAt} = user;
        // Get user's status list
        userStatusList = await Status.find({userId: _id}).sort({createdAt: 'descending'});
        res.json({username, _id, createdAt, userStatusList});
    }catch(err){ // Send error on failure
        res.status(404).json({error: '404 Not Found', message: 'No user found.'});
    }
});

// Export router
module.exports = router;