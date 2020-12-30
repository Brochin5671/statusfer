// Setup jsonwebtoken
const jwt = require('jsonwebtoken');

// Check and verify user access token
const verifyAccessToken = (req, res, next) => {
    // Check if token exists
    const token = req.cookies.accessToken;
    if(!token) return res.json({error: '401 Unauthroized', message: 'Login to use features.'});
    // Verify access token
    try{
        const verifiedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = verifiedToken;
        next();
    }catch(err){ // Send error on failure
        res.json({error: '400 Bad Request', message: 'Invalid token, try refreshing the page.'});
    }
}

// Check and verify user refresh token
const verifyRefreshToken = (req, res, next) => {
    // Check if token exists and clear access token cookie if not
    const token = req.cookies.refreshToken;
    if(!token){
        res.clearCookie('accessToken');
        return res.json({error: '401 Unauthroized', message: 'Login to use features.'});
    }
    // Verify refresh token, generate new access token and send httponly token cookie
    try{
        const verifiedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        req.user = verifiedToken;
        next();
    }catch(err){ // Clear access token cookie and send error on failure
        res.clearCookie('accessToken');
        res.json({error: '400 Bad Request', message: 'Invalid token, try re-logging in.'});
    }
}

// Export verification functions
module.exports.verifyAccessToken = verifyAccessToken;
module.exports.verifyRefreshToken = verifyRefreshToken;