const env = "dev";
const configs = {};

switch(env){
    case "dev":
        configs.port = 8888;
    break;
    case "prod":
        configs.port = 7000;
    break;
    case "test":
        configs.port = 5000;
    break;
}

module.exports = Object.assign({
    env
}, configs);