const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { resolve } = require('path');
const allowlist = require(resolve('src', 'allowlist'));
require('dotenv').config();

module.exports = {
    passwordCrypt: (password)=>{
        return new Promise((resolve, reject) => {
    
          bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(password, salt, function(err, hash) {
              
              resolve(hash);
    
            });
          });
    
        });
    },
    createAccessToken: ({ data, privateKey, options }) => {
        return jwt.sign(data, privateKey, options);
    },
    createRefreshToken: async ({ data, expiresIn }) => {
        const refreshToken = crypto.randomBytes(24).toString('hex');
    
        await allowlist.insert(refreshToken, JSON.stringify(data), expiresIn);
    
        return refreshToken;
    }
}