const { sequelize } = require('./sequelize');
require('../models/models');
require('../models/associations');

async function main(){
    try{
        await sequelize.authenticate();
        console.log("Database authenticated successfully");
        await sequelize.sync();
        console.log("All models are synced");
        console.log("Associations ran successfully");
    }
    catch (error){
        console.log("Database failed to authenticate");
        await sequelize.close();
    }
}
module.exports={main};