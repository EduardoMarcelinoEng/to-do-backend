const express = require("express");
const app = express();
const { resolve, join } = require('path');
const cors = require('cors');
const { env, port } = require(resolve("src", "config"));
const consign = require('consign');
const { existsSync } = require("fs");
const { sequelize } = require(resolve("src", "app", "models"));
require(resolve("src", "cron"));

app.use(express.static("dist/to-do-frontend/browser"));

app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({extended:false}));
if(env !== 'prod') app.use(cors());

consign()
    .include('src/controllers')
    .into(app);

app.get("*", (req, res) => {
    let pathBuild = join(__dirname, "dist", "to-do-frontend", "browser", "index.html");
    if(existsSync(pathBuild)){
        return res.sendFile(pathBuild);
    }
    res.status(404).send("Route not found.");
});

(async ()=>{

    try {
        await sequelize.authenticate();
        console.log('Database connection has been established.');
      } catch (error) {
        console.log('Unable to connect to database => ', error);
        return false;
    }

    app.listen(port, ()=>{
        console.log('\x1b[42m', `Application running at ${port}. Environment ${({
            prod: "Production",
            dev: "Development",
            test: "Test"
        })[env]}`, "\x1b[0m");
    });
})();

module.exports = app;