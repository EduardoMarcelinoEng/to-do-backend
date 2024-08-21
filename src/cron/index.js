const cron = require('node-cron');
const { resolve } = require('path');
const { Op } = require('sequelize');
const { User } = require(resolve('src', 'app', 'models'));
const moment = require("moment");

cron.schedule('*/1 * * * *', async ()=>{
    await User.destroy({
        where: {
            createdAt: {
                [Op.lte]: moment().subtract(1, "days").format("YYYY-MM-DD HH:mm:ss")
            }
        }
    });
});