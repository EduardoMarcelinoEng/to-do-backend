const jwt = require('jsonwebtoken');
const { User } = require('./../app/models');
const { resolve } = require('path');
const { hasToken:hasTokenBlockList } = require(resolve('src', 'blocklist'));
require('dotenv').config();

const auth = async (req, res, next) => {
    let token_header = req.headers.auth || req.query.token;
    
    if(!token_header) return res.status(401).json('AccessToken não enviado!');

    if(await hasTokenBlockList(token_header)) return res.status(401).json('AccessToken inválido!');
    
    jwt.verify(token_header, process.env.PRIVATE_KEY, async (err, decoded) => {
        if (err) return res.status(401).json('AccessToken inválido!');
        const user = await User.findByPk(decoded.userId);

        res.locals.auth_data = Object.assign({}, decoded, {
            userId: user.id,
            user
        });
        
        return next();
    });
}

module.exports = auth;