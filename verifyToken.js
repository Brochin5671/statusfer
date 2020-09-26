// Setup jsonwebtoken
const jwt = require('jsonwebtoken');

// Check and verify user access token
const verifyAccessToken = function(req,res,next){
    // Check if token exists
    const token = req.cookies.accessToken;
    if(!token) return res.json({error: '401 Unauthroized', message: 'Access Denied'});
    // Verify access token
    try{
        const verified = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        req.user = verified;
        next();
    }catch(err){ // Send error
        res.json({error: '400 Bad Request', message: 'Invalid Token'});
    }
}

// Check and verify user refresh token
const verifyRefreshToken = function(req,res,next){
    // Check if token exists
    const token = req.cookies.refreshToken;
    if(!token) return res.json({error: '401 Unauthroized', message: 'Access Denied'});
    // Verify refresh token, generate new access token and send httponly token cookie
    try{
        const verified = jwt.verify(token,process.env.REFRESH_TOKEN_SECRET);
        req.user = verified;
        next();
    }catch(err){ // Send error
        res.json({error: '400 Bad Request', message: 'Invalid Token'});
    }
}

// Export verification functions
module.exports.verifyAccessToken = verifyAccessToken;
module.exports.verifyRefreshToken = verifyRefreshToken;