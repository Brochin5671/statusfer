// Setup jsonwebtoken
const jwt = require('jsonwebtoken');

// Check and verify user access token
const verifyAccessToken = (req, res, next) => {
    // Check if token exists and send error on failure
    const token = req.cookies.accessToken;
    if(!token) return res.status(401).json({error: '401 Unauthroized', message: 'Login to use features.'});
    // Verify access token
    try{
        const verifiedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = verifiedToken;
        next();
    }catch(err){ // Clear access cookie and send error on failure
        res.clearCookie('accessToken');
        res.status(400).json({error: '400 Bad Request', message: 'Invalid token, try refreshing the page.'});
    }
}

// Check and verify user refresh token
const verifyRefreshToken = (req, res, next) => {
    // Check if token exists, clear cookies and send error on failure
    const token = req.cookies.refreshToken;
    if(!token){
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        return res.json({error: '401 Unauthroized', message: 'Login to use features.'});
    }
    // Verify refresh token
    try{
        const verifiedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        req.user = verifiedToken;
        next();
    }catch(err){ // Clear cookies and send error on failure
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        res.status(400).json({error: '400 Bad Request', message: 'Invalid token, try re-logging in.'});
    }
}

// Export verification functions
module.exports.verifyAccessToken = verifyAccessToken;
module.exports.verifyRefreshToken = verifyRefreshToken;