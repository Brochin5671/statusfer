// Setup validator
const joi = require('@hapi/joi');

// Register validation
const registerValidation = user => {
    const JoiSchema = joi.object({
        username: joi.string().required(),
        email: joi.string().required().insensitive().min(3).max(254).email(),
        password: joi.string().required().min(8)
    });
    return JoiSchema.validate(user);
}

// Login validation
const loginValidation = user => {
    const JoiSchema = joi.object({
        email: joi.string().required().insensitive().email(),
        password: joi.string().required()
    });
    return JoiSchema.validate(user);
}

// Export validations
module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;