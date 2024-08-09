const { resolve } = require('path');
const request = require ('supertest');
const app = require (resolve('.'));
const { User, Task } = require(resolve("src", "app", "models"));
const { createAccessToken, createRefreshToken, passwordCrypt } = require(resolve('src', 'Utils'));
const _ = require('lodash');
const { getValue } = require(resolve('src', 'allowlist'));
const { hasToken:hasTokenBlockList } = require(resolve('src', 'blocklist'));
const validRefreshToken = async refreshToken => await getValue(refreshToken);
const jwt = require('jsonwebtoken');
const moment = require('moment');
require('dotenv').config();

jest.mock('axios');

test('POST /user', async () => {

    let userId = null;
    let messageError = null;

    try {
        const obj = {
            email: "test@email.com",
            name: "Eduardo Marcelino",
            password: "1a@btyqa"
        };
        const responseCreate = await request(app).post('/user')
            .send(obj);

        userId = responseCreate.body.id;

        expect(responseCreate.status).toBe(201); 
        expect(responseCreate.body).toEqual(
            expect.objectContaining({
              name: expect.any(String),
              email: expect.any(String),
            }),
        );
    } catch (error) {
        messageError = error.message;
    }

    if(userId){
        const user = await User.findByPk(userId);

        await user.destroy();
    }

    if(messageError) throw new Error(messageError);

});

test('POST /user/auth', async () => {

    let userData = null;
    let messageError = null;

    try {
        const password = "1a@btyqa";
        const obj = {
            email: "test@email.com",
            name: "Eduardo Marcelino",
            password: await passwordCrypt(password)
        };

        const user = await User.create(obj);
        userData = user;

        const responseLogin = await request(app).post('/user/auth')
            .send({
                email: obj.email,
                password
            });

        expect(responseLogin.status).toBe(200); 
        expect(responseLogin.body).toEqual(
            expect.objectContaining({
                token: expect.any(String),
                refreshToken: expect.any(String),
                user: expect.any(Object)
            })
        );
    } catch (error) {
        messageError = error.message;
    }

    if(userData) await userData.destroy();
    if(messageError) throw new Error(messageError);

});

test('POST /task', async () => {

    let userData = null;
    let messageError = null;

    try {
        const obj = {
            email: "test@email.com",
            name: "Eduardo Marcelino",
            password: await passwordCrypt("1a@btyqa")
        };
        const user = await User.create(obj);

        userData = user;
    
        const token = createAccessToken({
            data: {
              userId: user.id
            },
            privateKey: process.env.PRIVATE_KEY,
            options: { expiresIn: '15m' }
        });
    
        const responseTaskCreate = await request(app).post('/task')
            .set('auth', token)
            .send({
                description: "Teste",
                priority: "Baixa"
            });
    
        expect(responseTaskCreate.status).toBe(201); 
        expect(responseTaskCreate.body).toEqual(
            expect.objectContaining({
                id: expect.any(String),
                description: expect.any(String),
                priority: expect.any(String),
                status: expect.any(String),
                userId: user.id
            })
        );
    } catch (error) {
        messageError = error.message;
    }

    if(userData) await userData.destroy();
    if(messageError) throw new Error(messageError);
});

test('GET /task/get-pending', async () => {

    let userData = null;
    let messageError = null;

    try {
        const obj = {
            email: "test@email.com",
            name: "Eduardo Marcelino",
            password: await passwordCrypt("1a@btyqa")
        };
    
        const user = await User.create(obj);
        userData = user;
        const token = createAccessToken({
            data: {
              userId: user.id
            },
            privateKey: process.env.PRIVATE_KEY,
            options: { expiresIn: '15m' }
        });
        const tasksObj = [
            {
                description: "Teste 1",
                priority: "Baixa",
                userId: user.id
            },
            {
                description: "Teste 2",
                priority: "Alta",
                status: "done",
                userId: user.id
            }
        ];
        await Task.bulkCreate(tasksObj);
    
        const responseTaskGetPending = await request(app).get('/task/get-pending')
            .set('auth', token);
        expect(responseTaskGetPending.status).toBe(200);
        responseTaskGetPending.body.forEach(t => {
            expect(t).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    userId: user.id,
                    description: expect.any(String),
                    priority: expect.any(String),
                    status: "pending",
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String)
                })
            );
        });
    } catch (error) {
        messageError = error.message;
    }

    if(userData) await userData.destroy();
    if(messageError) throw new Error(messageError);
});

test('PUT /task/mark-as-done/:id', async () => {

    let userData = null;
    let messageError = null;

    try {
        const obj = {
            email: "test@email.com",
            name: "Eduardo Marcelino",
            password: await passwordCrypt("1a@btyqa")
        };
    
        const user = await User.create(obj);
        userData = user;
        const token = createAccessToken({
            data: {
              userId: user.id
            },
            privateKey: process.env.PRIVATE_KEY,
            options: { expiresIn: '15m' }
        });
        const task = await Task.create({
            description: "Teste 1",
            priority: "Média",
            userId: user.id
        });
    
        const responseTaskGetPending = await request(app).put(`/task/mark-as-done/${task.id}`)
            .set('auth', token);
        expect(responseTaskGetPending.status).toBe(200);
        const result = await Task.findByPk(task.id);
        expect(result.status).toBe("done");
    } catch (error) {
        messageError = error.message;
    }
    
    if(userData) await userData.destroy();
    if(messageError) throw new Error(messageError);
});

test('POST /user/refresh', async () => {

    let userData = null;
    let messageError = null;

    try {
        const password = "1a@btyqa";
        const obj = {
            email: "test@email.com",
            name: "Eduardo Marcelino",
            password: await passwordCrypt(password)
        };

        const user = await User.create(obj);
        userData = user;
        const refreshToken = await createRefreshToken({
            data: {
            userId: user.id
            },
            expiresIn: moment().add(1, 'h').unix()
        });
        const responseRefreshToken = await request(app).post('/user/refresh')
            .set("refresh_token", refreshToken)
            .send({});

        expect(responseRefreshToken.status).toBe(200);
        delete user.dataValues.password;
        user.dataValues.createdAt = moment(user.dataValues.createdAt).format("YYYY-MM-DD HH:mm:ss");
        user.dataValues.updatedAt = moment(user.dataValues.updatedAt).format("YYYY-MM-DD HH:mm:ss");

        responseRefreshToken.body.user.createdAt = moment(responseRefreshToken.body.user.createdAt).format("YYYY-MM-DD HH:mm:ss");
        responseRefreshToken.body.user.updatedAt = moment(responseRefreshToken.body.user.updatedAt).format("YYYY-MM-DD HH:mm:ss");
    
        expect(await new Promise((resolve)=>{
            jwt.verify(responseRefreshToken.body.token, process.env.PRIVATE_KEY, async (err, decoded) => {
                if(err) return resolve(false);
                resolve(true);
            });
        })).toBe(true);
        expect(Boolean(await validRefreshToken(refreshToken))).toBe(false);

        expect(responseRefreshToken.body).toEqual(
            expect.objectContaining({
                token: expect.any(String),
                refreshToken: expect.any(String),
                user: user.dataValues
            })
        );

        expect(Boolean(await hasTokenBlockList(responseRefreshToken.body.token))).toBe(false);
        expect(Boolean(await validRefreshToken(responseRefreshToken.body.refreshToken))).toBe(true);
    } catch (error) {
        messageError = error.message;
    }

    if(userData) await userData.destroy();
    if(messageError) throw new Error(messageError);

});

test('POST /user/logout', async () => {

    let userData = null;
    let messageError = null;

    try {
        const password = "1a@btyqa";
        const obj = {
            email: "test@email.com",
            name: "Eduardo Marcelino",
            password: await passwordCrypt(password)
        };

        const user = await User.create(obj);
        userData = user;
        const token = createAccessToken({
            data: {
            userId: user.id
            },
            privateKey: process.env.PRIVATE_KEY,
            options: { expiresIn: '15m' }
        });
        const refreshToken = await createRefreshToken({
            data: {
            userId: user.id
            },
            expiresIn: moment().add(1, 'h').unix()
        });
        const responseLogout = await request(app).post('/user/logout')
            .set("auth", token)
            .set("refresh_token", refreshToken)
            .send({});

        expect(responseLogout.status).toBe(200);

        expect(Boolean(await hasTokenBlockList(token))).toBe(true);

        expect(Boolean(await validRefreshToken(refreshToken))).toBe(false);
    } catch (error) {
        messageError = error.message;
    }

    if(userData) userData.destroy();
    if(messageError) throw new Error(messageError);

});