const axios = require('axios');
const Server = require("../models/server");


module.exports = async () => {
    let arr=[];

    try{
        const response = await axios.post(process.env.ROOMEET_SERVERS_API_URL, {
            token: process.env.ROOMEET_SERVERS_API_TOKEN
          })
      
          arr = response.data.data;

          arr.forEach(async item => {
            const server = await Server.findOne({serverId:item.id});

            server.setting = item.set;
            server.autoSet = item.autoSet;
            server.record = item.record;
            server.autoRecord = item.autoRecord;
            await server.save();
            console.log('updated a server data')
          });
    }catch(err){
        console.log(err);
    }
}