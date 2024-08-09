const routerBase = '/user';
const { resolve } = require("path");
const { User } = require(resolve("src", "app", "models"));
const bcrypt = require('bcrypt');
const moment = require("moment");
const { createAccessToken, createRefreshToken, passwordCrypt } = require(resolve('src', 'Utils'));
const { auth, refresh } = require(resolve("src", "middlewares"));
const { insert:insertBlockList } = require(resolve('src', 'blocklist'));
require('dotenv').config();

module.exports = app => {
    app.post(routerBase, async (req, res)=>{
        try {
            
            const { name, email, password } = req.body;

            if(!name) return res.status(400).json("Informe o nome do usuário!");
            if(typeof email !== "string" || !email.match(/[a-z0-9.]+@[a-z0-9]+\.[a-z]+(\.[a-z]+)?/)) return res.status(400).json("Informe um e-mail válido!");
            if(!password) return res.status(400).json("Informe uma senha!");

            const hasUserWithEmail = await User.findOne({
                where: {
                    email
                }
            });

            if(hasUserWithEmail) return res.status(400).json("E-mail já registrado!");

            const user = await User.create({
                name, email, password: await passwordCrypt(password)
            });

            delete user.dataValues.password;

            return res.status(201).json(user);

        } catch (error) {
            return res.status(500).json(error.message);
        }
    });

    app.post(`${routerBase}/auth`, async (req, res) => {
        
        const { email, password } = req.body;
          
        if(typeof email !== "string" || !email.match(/[a-z0-9.]+@[a-z0-9]+\.[a-z]+(\.[a-z]+)?/)) return res.status(400).json("Informe um e-mail válido!");
        if(!password) return res.status(400).json("Informe uma senha!");

        const user = await User.findOne({
            where: {
                email
            }
        });
  
        if(!user) return res.status(400).json('Usuário não registrado!');
  
        const pass_ok = await bcrypt.compare(password, user.password);
  
        if(!pass_ok) return res.status(401).json('E-mail ou/e senha inválidos!');
  
        delete user.dataValues.password;
  
        return res.status(200).json({
          user: user.dataValues,
          token: createAccessToken({
            data: {
              userId: user.id
            },
            privateKey: process.env.PRIVATE_KEY,
            options: { expiresIn: '15m' }
          }),
          refreshToken: await createRefreshToken({
            data: {
              userId: user.id
            },
            expiresIn: moment().add(1, 'h').unix()
          })
        });
  
    });

    app.post(`${routerBase}/refresh`, refresh, async (req, res)=>{
      try {

        const { user } = res.locals.auth_data;

        delete user.dataValues.password;
      
        return res.status(200).json({
          user: user.dataValues,
          token: createAccessToken({
            data: {
              userId: user.id
            },
            privateKey: process.env.PRIVATE_KEY,
            options: { expiresIn: '15m' }
          }),
          refreshToken: await createRefreshToken({
            data: {
              userId: user.id
            },
            expiresIn: moment().add(1, 'h').unix()
          })
        });
      
      } catch (error) {
        return res.status(500).json(error.message);
      }
    });

  app.post(`${routerBase}/logout`, auth, refresh, async (req, res)=>{
    try {
    await insertBlockList(req.headers.auth);
    
    return res.status(200).json('Usuário deslogado!');
    } catch (error) {
    return res.status(500).json(error.message);
    }
      
  });
}