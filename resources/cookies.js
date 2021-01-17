// Generate httponly token cookies
function genCookies(res, accessToken, refreshToken){
    genAccessCookie(res, accessToken);
    genRefreshCookie(res, refreshToken);
}

// Generate httponly access token cookie
function genAccessCookie(res, accessToken){
    res.cookie('accessToken', accessToken, {maxAge: 600000, httpOnly: true});
}

// Generate httponly refresh token cookie
function genRefreshCookie(res, refreshToken){
    res.cookie('refreshToken', refreshToken, {maxAge: 3600000, httpOnly: true});
}

// Clear httponly token cookies
function clearCookies(res){
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
}

// Export cookie functions
module.exports.genCookies = genCookies;
module.exports.genAccessCookie = genAccessCookie;
module.exports.genRefreshCookie = genRefreshCookie;
module.exports.clearCookies = clearCookies;