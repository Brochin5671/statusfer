// Setup router, path, User and Status model, validation, sanitize text, token and cookie functions, and password functions
const router = require('express').Router();
const path = require('path');
const User = require('../models/User');
const Status = require('../models/Status');
const {
    registerValidation,
    loginValidation,
    bioValidation,
    usernameValidation,
    emailValidation,
    newPasswordValidation,
    passwordValidation
} = require('../resources/validation');
const {sanitizeText} = require('../resources/sanitize');
const {
    createAccessToken,
    createTokens,
    verifyAccessToken,
    verifyRefreshToken,
    decodeRefreshTokenExp
} = require('../resources/tokens');
const {genCookies, genAccessCookie, clearCookies} = require('../resources/cookies');
const {hashPassword, validPassword} = require('../resources/passwords');

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
    const hashedPass = await hashPassword(req.body.password);
    // Create new user object
    const user = new User({
        username: sanitizedUsername,
        email: sanitizedEmail,
        password: hashedPass
    });
    // Save user to DB and generate tokens on success
    try{
        const newUser = await user.save();
        // Create tokens and store refresh token
        const {accessToken, refreshToken} = createTokens(newUser);
        const tokenExp = decodeRefreshTokenExp(refreshToken);
        await User.updateOne({_id: newUser._id}, {tokenExp: tokenExp}, {timestamps: false});
        // Send httponly token cookies
        genCookies(res, accessToken, refreshToken);
        res.json({message: 'Successfully registered user.'});
    }catch(err){ // Send error on failure
        res.status(500).json({error: '500 Internal Server Error', message: 'Unable to register user.'});
    }
});

// Generate new access token from refresh token
router.post('/token', verifyRefreshToken, async (req, res) => {
    // Check if refresh token exists in DB, clear cookies and send error if not found
    const user = await User.findById(req.user._id);
    const refreshToken = req.cookies.refreshToken;
    const tokenExp = decodeRefreshTokenExp(refreshToken);
    if(tokenExp !== user.tokenExp){
        clearCookies(res);
        await User.updateOne({_id: req.user._id}, {tokenExp: null}, {timestamps: false});
        return res.status(403).json({error: '403 Forbidden', message: 'This token has expired, try re-logging in.'});
    }
    // Generate new access token and httponly token cookie if access token cookie expired
    const currentAccessToken = req.cookies.accessToken;
    if(!currentAccessToken){
        const accessToken = createAccessToken(req.user);
        genAccessCookie(res, accessToken);
    }
    res.json({username: req.user.username, _id: req.user._id});
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
    if(!user) return res.status(400).json({error: '400 Bad Request', message: 'Email or password is wrong.'});
    const validPass = await validPassword(req.body.password, user.password);
    if(!validPass) return res.status(400).json({error: '400 Bad Request', message: 'Email or password is wrong.'});
    // Create tokens and store refresh token
    const {accessToken, refreshToken} = createTokens(user);
    const tokenExp = decodeRefreshTokenExp(refreshToken);
    await User.updateOne({_id: user._id}, {tokenExp: tokenExp}, {timestamps: false});
    // Send httponly token cookies
    genCookies(res, accessToken, refreshToken);
    res.json({message: 'Successfully logged in user.'});
});

// Logout a user
router.delete('/logout', verifyRefreshToken, async (req, res) => {
    // Remove refresh token from db, clear cookies, and send success message
    await User.updateOne({_id: req.user._id}, {tokenExp: null}, {timestamps: false});
    clearCookies(res);
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
        const {username, _id, bio, createdAt} = user;
        // Get user's status list
        userStatusList = await Status.find({userId: _id}).sort({createdAt: 'descending'});
        res.json({username, bio, createdAt, userStatusList});
    }catch(err){ // Send error on failure
        res.status(404).json({error: '404 Not Found', message: 'No user found.'});
    }
});

// Change a user's bio
router.patch('/bio', verifyAccessToken, async (req, res) => {
    // Validate bio and return error message if failed
    const {error} = bioValidation(req.body);
    if(error) return res.status(400).json({error: '400 Bad Request', message: error.details[0].message});
    // Sanitize new bio
    const newBio = sanitizeText(req.body.bio);
    // Update user's bio
    await User.findOneAndUpdate({_id: req.user._id}, {bio: newBio}, {new: true});
    res.json({message: 'Successfully updated bio.'});
});

// Change a user's username
router.patch('/username', verifyAccessToken, async (req, res) => {
    // Validate username and return error message if failed
    const {error} = usernameValidation(req.body);
    if(error) return res.status(400).json({error: '400 Bad Request', message: error.details[0].message});
    // Sanitize new username
    const newUsername = sanitizeText(req.body.username);
    // Check if username is taken
    const usernameExists = await User.findOne({username: newUsername});
    if(usernameExists) return res.status(400).json({error: '400 Bad Request', message: 'Username is taken.'});
    // Remove all of user's statuses
    await Status.updateMany({userId: req.user._id}, {user: newUsername}, {timestamps: false});
    // Update user's username
    const patchedUser = await User.findOneAndUpdate({_id: req.user._id}, {username: newUsername}, {new: true});
    // Create tokens and store refresh token
    const {accessToken, refreshToken} = createTokens(patchedUser);
    const tokenExp = decodeRefreshTokenExp(refreshToken);
    await User.updateOne({_id: patchedUser._id}, {tokenExp: tokenExp}, {timestamps: false});
    // Send httponly token cookies
    genCookies(res, accessToken, refreshToken);
    res.json({message: 'Successfully updated username.'});
});

// Change a user's email
router.patch('/email', verifyAccessToken, async (req, res) => {
    // Validate email and return error message if failed
    const {error} = emailValidation(req.body);
    if(error) return res.status(400).json({error: '400 Bad Request', message: error.details[0].message});
    // Sanitize new email
    const newEmail = sanitizeText(req.body.email);
    // Check if email is registered
    const emailExists = await User.findOne({email: newEmail});
    if(emailExists) return res.status(400).json({error: '400 Bad Request', message: 'Email already registered.'});
    // Update user's email
    await User.findOneAndUpdate({_id: req.user._id}, {email: newEmail}, {new: true});
    res.json({message: 'Successfully updated email.'});
});

// Change a user's password
router.patch('/password', verifyAccessToken, async (req, res) => {
    // Validate new password and return error message if failed
    const {error} = newPasswordValidation(req.body);
    if(error) return res.status(400).json({error: '400 Bad Request', message: error.details[0].message});
    // Check if password is correct
    const user = await User.findById(req.user._id);
    const validPass = await validPassword(req.body.password, user.password);
    if(!validPass) return res.status(400).json({error: '400 Bad Request', message: 'Password is wrong.'});
    // Hash new password
    const hashedPass = await hashPassword(req.body.newPassword);
    // Update user's password
    await User.findOneAndUpdate({_id: req.user._id}, {password: hashedPass}, {new: true});
    res.json({message: 'Successfully updated password.'});
});

// Delete a user's account
router.delete('/deactivate', verifyAccessToken, async (req, res) => {
    // Validate password and return error message if failed
    const {error} = passwordValidation(req.body);
    if(error) return res.status(400).json({error: '400 Bad Request', message: error.details[0].message});
    // Check if password is correct
    const user = await User.findById(req.user._id);
    const validPass = await validPassword(req.body.password, user.password);
    if(!validPass) return res.status(400).json({error: '400 Bad Request', message: 'Password is wrong.'});
    // Remove all of user's statuses
    await Status.deleteMany({userId: user._id});
    // Remove user and clear cookies
    await User.deleteOne({_id: req.user._id});
    clearCookies(res);
    res.json({message: 'Successfully deleted user.'});
});

// Export router
module.exports = router;