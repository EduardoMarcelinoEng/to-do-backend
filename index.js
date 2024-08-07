const express = require("express");
const app = express();
const { resolve } = require('path');
const cors = require('cors');
const { env, port } = require(resolve("src", "config"));
const consign = require('consign');
const { sequelize } = require(resolve("src", "app", "models"));

app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({extended:false}));
if(env !== 'prod') app.use(cors());

consign()
    .include('src/controllers')
    .into(app);

(async ()=>{

    try {
        await sequelize.authenticate();
        console.log('Database connection has been established.');
      } catch (error) {
        console.error('Unable to connect to database => ', error);
        return false;
    }

    app.listen(port, ()=>console.log('\x1b[42m', `Application running at ${port}. Environment ${({
        prod: "Production",
        dev: "Development",
        test: "Test"
    })[env]}`, "\x1b[0m"));
})();