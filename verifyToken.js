// Setup jsonwebtoken
const jwt = require('jsonwebtoken');

// Check and verify user token
module.exports = function(req,res,next){

    // Check if token exists
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
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