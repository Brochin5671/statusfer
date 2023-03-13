// Setup profanity filter
const BadWords = require('bad-words'); 
const filter = new BadWords();

// Sanitize text, filter profanity, and export
const sanitizeText = (text) => {
    let sanitizedText = text.trim();
    // Temporary fix for package unable to filter text with no words
    try{
        sanitizedText = filter.clean(sanitizedText);
    }catch(e){}
    return sanitizedText;
}
module.exports.sanitizeText = sanitizeText;