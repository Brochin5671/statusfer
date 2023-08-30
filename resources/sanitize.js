// Setup profanity filter
const {
  RegExpMatcher,
  TextCensor,
  englishDataset,
  englishRecommendedTransformers,
} = require('obscenity');
const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

// Sanitize text, filter profanity, and export
const sanitizeText = (text) => {
  const censor = new TextCensor();
  const input = text.trim();
  const matches = matcher.getAllMatches(input);
  const sanitizedText = censor.applyTo(input, matches);
  return sanitizedText;
};
module.exports.sanitizeText = sanitizeText;
