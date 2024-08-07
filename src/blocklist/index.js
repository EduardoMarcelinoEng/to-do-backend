const { resolve } = require('path');
const { blockListClient, modelsList } = require(resolve('src', 'redis'));
const blocklist = modelsList(blockListClient);
const { decode } = require('jsonwebtoken');
const { createHash } = require('crypto');

function generateHashToken(token){
    return createHash('sha256')
        .update(token)
        .digest('hex');
}

module.exports = {
    async insert(token){
        const dateExpiration = decode(token).exp;
        const tokenHash = generateHashToken(token);
        await blocklist.insert(tokenHash, '', dateExpiration);

    },
    async hasToken(token){
        const tokenHash = generateHashToken(token);
        const result = await blocklist.hasKey(tokenHash);
        return result;
    }
}