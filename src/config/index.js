const env = "dev";
const configs = {};

switch(env){
    case "dev":
        configs.port = 8888;
        configs.database = {
            "username": "root",
            "password": "",
            "database": "to_do",
            "host": "127.0.0.1",
            "dialect": "mysql",
            "timezone": "-03:00"
        };
    break;
    case "prod":
        configs.port = 7000;
        configs.database = {
            "username": "root",
            "password": "",
            "database": "to_do",
            "host": "127.0.0.1",
            "dialect": "mysql",
            "timezone": "-03:00"
        };
    break;
    case "test":
        configs.port = 5000;
        configs.database = {
            "username": "root",
            "password": "",
            "database": "to_do",
            "host": "127.0.0.1",
            "dialect": "mysql",
            "timezone": "-03:00"
        };
    break;
}

module.exports = Object.assign({
    env
}, configs);