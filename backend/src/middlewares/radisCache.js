const axios = require("axios");
const redis = require("redis");
const redisPort = 6379
const client = redis.createClient(redisPort);

client.on("error", (err) => {
    console.log(err);
})

const  cache=(req, res, next)=> {
    // const { username } = req.params;
  
    // client.get(username, (err, data) => {
    //   if (err) throw err;
  
    //   if (data !== null) {
    //     res.send(setResponse(username, data));
    //   } else {
    //     next();
    //   }
    // });
  }

module.exports= cache