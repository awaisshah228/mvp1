const api = require('express').Router();



//routes
api.use('/', require('./userRouter'));
api.use('/', require('./authRouter'));


module.exports = api;