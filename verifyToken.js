// Setup jsonwebtoken
const jwt = require('jsonwebtoken');

// Check and verify user access token
const verifyAccessToken = function(req,res,next){
    // Check if token exists
    const token = req.cookies.accessToken;
    if(!token) return res.status(401).send('Access Denied');
    // Verify access token
    try{
        const verified = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        req.user = verified;
        next();
    }catch(err){ // Send error
        res.status(400).send('Invalid Token');
    }
}

// Check and verify user refresh token
const verifyRefreshToken = function(req,res,next){
    // Check if token exists
    const token = req.cookies.refreshToken;
    if(!token) return res.status(401).send('Access Denied');
    // Verify refresh token, generate new access token and send httponly token cookie
    try{
        const verified = jwt.verify(token,process.env.REFRESH_TOKEN_SECRET);
        req.user = verified;
        const accessToken = jwt.sign({_id: verified._id, username: verified.username},process.env.ACCESS_TOKEN_SECRET,{expiresIn: '10m'});
        res.cookie('accessToken',accessToken, {maxAge: 600000, httpOnly: true});
        next();
    }catch(err){ // Send error
        res.status(400).send('Invalid Token');
    }
}

// Export verification functions
module.exports.verifyAccessToken = verifyAccessToken;
module.exports.verifyRefreshToken = verifyRefreshToken;