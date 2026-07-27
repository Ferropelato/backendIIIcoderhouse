const ERROR_DICTIONARY = require('./errorDictionary');
const domainErrors = require('./domainErrors');

module.exports = { ...domainErrors, ERROR_DICTIONARY };
