const express = require("express");
const app = express();
const { resolve } = require('path');
const cors = require('cors');
const { env, port } = require(resolve("src", "config"));

app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({extended:false}));
if(env !== 'prod') app.use(cors());

app.listen(port, ()=>console.log('\x1b[42m', `Application running at ${port}. Environment ${({
    prod: "Production",
    dev: "Development",
    test: "Test"
})[env]}`, "\x1b[0m"));