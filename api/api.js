const express = require('express');
const apiRouter = express.Router();
const fxRouter = require('./convert.js');

apiRouter.use('/convert', fxRouter);

module.exports = apiRouter;