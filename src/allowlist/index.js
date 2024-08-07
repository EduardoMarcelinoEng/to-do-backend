const { resolve } = require('path');
const { allowListClient, modelsList } = require(resolve('src', 'redis'));

module.exports = modelsList(allowListClient);