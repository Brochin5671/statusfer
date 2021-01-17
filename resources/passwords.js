// Setup bcrypt
const bcrypt = require('bcryptjs');

// Hash and return a password
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);
    return hashedPass;
}

// Compare passwords and return result
const validPassword = async (inputPassword, userPassword) => {
    const validPass = await bcrypt.compare(inputPassword, userPassword);
    return validPass;
}

// Export password functions
module.exports.hashPassword = hashPassword;
module.exports.validPassword = validPassword;
