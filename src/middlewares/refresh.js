const { resolve } = require('path');
const { getValue, delete:deleteToken } = require(resolve('src', 'allowlist'));
const { User } = require('./../app/models');

const validRefreshToken = async refreshToken => await getValue(refreshToken);

const invalidRefreshToken = async refreshToken => await deleteToken(refreshToken);

const refresh = async (req, res, next) => {
    const refreshToken = req.headers.refresh_token || req.query.refresh_token;
    
    if(!refreshToken) return res.status(401).json({ error: 'RefreshToken não enviado!' });
    
    let decoded = await validRefreshToken(refreshToken);
    
    if(!decoded) return res.status(401).json({ error: 'RefreshToken inválido!' });
    
    await invalidRefreshToken(refreshToken);

    decoded = JSON.parse(decoded);

    const user = await User.findByPk(decoded.userId);
    
    res.locals.auth_data = Object.assign({}, decoded, {user});
    
    return next();
}

module.exports = refresh;