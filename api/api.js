const express = require('express');
const apiRouter = express.Router();
const currencyRouter = require('./currency.js');

apiRouter.use('/currency', currencyRouter);

module.exports = apiRouter;