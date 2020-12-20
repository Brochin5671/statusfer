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

// Status validation
const statusValidation = status => {
    const JoiSchema = joi.object({
        message: joi.string().required().max(255)
    });
    return JoiSchema.validate(status);
}

// Export validations
module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.statusValidation = statusValidation;