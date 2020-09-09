// Setup jsonwebtoken
const jwt = require('jsonwebtoken');

// Check and verify user access token
module.exports = function(req,res,next){

    // Check if token exists
    const token = req.cookies.accessToken;
    if(!token) return res.status(401).send('Access Denied');

    // Verify token
    try{
        const verified = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        req.user = verified;
        next();
    }catch(err){ // Send error
        res.status(400).send('Invalid Token');
    }
}