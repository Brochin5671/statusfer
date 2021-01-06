// Setup profanity filter
const BadWords = require('bad-words'); 
const filter = new BadWords();

// Sanitize text, filter profanity, and export
const sanitizeText = (text) => {
    const trimmedText = text.trim();
    return filter.clean(trimmedText);
}
module.exports.sanitizeText = sanitizeText;