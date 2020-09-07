// Setup jsonwebtoken
const jwt = require('jsonwebtoken');

// Check and verify user token
module.exports = function(req,res,next){

    // Check if token exists
    const token = req.header('User-Token');
    if(!token) return res.status(401).send('Access Denied');

    // Verify token
    try{
        const verified = jwt.verify(token,process.env.TOKEN_SECRET);
        console.log(token);
        console.log(verified);
        req.user = verified;
        next();
    }catch(err){ // Send error
        res.status(400).send('Invalid Token');
    }
}