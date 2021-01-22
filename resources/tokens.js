// Setup jsonwebtoken
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Create access and refresh tokens for user
const createTokens = user => {
    const accessToken = createAccessToken(user)
    const refreshToken = createRefreshToken(user);
    return {accessToken, refreshToken};
}

// Create access token for user
function createAccessToken(user){
    return jwt.sign({_id: user._id, username: user.username}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '10m'});
}

// Create refresh token for user
function createRefreshToken(user){
    return jwt.sign({_id: user._id, username: user.username}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '1h'});
}

// Check and verify user access token
const verifyAccessToken = async (req, res, next) => {
    // Check if token exists and send error on failure
    const token = req.cookies.accessToken;
    if(!token) return res.status(401).json({error: '401 Unauthroized', message: 'Login to use features.'});
    // Verify access token and user, hand over control to next on success
    try{
        // Verify access token and store in request
        const verifiedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = verifiedToken;
        // Verify that the user exists
        const userExists = await User.findOne({username: req.user.username});
        if(!userExists) return res.status(404).json({error: '404 Not Found', message: 'This user no longer exists, clear your cookies to continue.'});
        next();
    }catch(err){ // Clear access cookie and send error on failure
        res.clearCookie('accessToken');
        res.status(400).json({error: '400 Bad Request', message: 'Invalid token, try refreshing the page.'});
    }
}

// Check and verify user refresh token
const verifyRefreshToken = async (req, res, next) => {
    // Check if token exists, clear cookies and send error on failure
    const token = req.cookies.refreshToken;
    if(!token){
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        return res.json({error: '401 Unauthroized', message: 'Login to use features.'});
    }
    // Verify refresh token and user, hand over control to next on success
    try{
        // Verify refresh token and store in request
        const verifiedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        req.user = verifiedToken;
        // Verify that the user exists
        const userExists = await User.findOne({username: req.user.username});
        if(!userExists) return res.status(404).json({error: '404 Not Found', message: 'This user no longer exists.'});
        next();
    }catch(err){ // Clear cookies and send error on failure
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        res.status(400).json({error: '400 Bad Request', message: 'Invalid token, try re-logging in.'});
    }
}

// Decodes and sends back numeric value of expiry date
const decodeRefreshTokenExp = token => {
    try{
        const verifiedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        return verifiedToken.exp;
    }catch(err){
        return null;
    }
}

// Export token functions
module.exports.createTokens = createTokens;
module.exports.createAccessToken = createAccessToken;
module.exports.createRefreshToken = createRefreshToken;
module.exports.verifyAccessToken = verifyAccessToken;
module.exports.verifyRefreshToken = verifyRefreshToken;
module.exports.decodeRefreshTokenExp = decodeRefreshTokenExp;