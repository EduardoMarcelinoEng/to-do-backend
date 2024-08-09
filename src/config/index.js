const env = "dev";
const configs = {};
require('dotenv').config();

switch(env){
    case "dev":
        configs.port = process.env.PORT;
        configs.database = {
            "username": process.env.DB_USERNAME,
            "password": process.env.DB_PASSWORD,
            "database": process.env.DB_NAME,
            "host": process.env.DB_HOST,
            "dialect": "mysql",
            "timezone": "-03:00"
        };
    break;
    case "prod":
        configs.port = process.env.PORT;
        configs.database = {
            "username": process.env.DB_USERNAME,
            "password": process.env.DB_PASSWORD,
            "database": process.env.DB_NAME,
            "host": process.env.DB_HOST,
            "dialect": "mysql",
            "timezone": "-03:00"
        };
    break;
    case "test":
        configs.port = process.env.PORT;
        configs.database = {
            "username": process.env.DB_USERNAME,
            "password": process.env.DB_PASSWORD,
            "database": process.env.DB_NAME,
            "host": process.env.DB_HOST,
            "dialect": "mysql",
            "timezone": "-03:00"
        };
    break;
}

module.exports = Object.assign({
    env
}, configs);