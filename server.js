const express = require('express');
const path = require('path');

const cors = require('cors');
const bodyParser = require('body-parser');
const errorhandler = require('errorhandler');

const CronJob = require('cron').CronJob;
const seedDatabase = require('./seed')

// Tun seedDatabase everyday at 6 am
const runScheduledSeedDatabase = new CronJob('0 0 6 * * ', () => {
	seedDatabase(), null, true, 'Europe/Vilnius'
});
runScheduledSeedDatabase.start();

const app = express();

// middleware
app.use(bodyParser.json());
app.use(cors());

// Serve the static files from the CRA
app.use(express.static(path.join(__dirname, 'client/build')));

const apiRouter = require('./api/api');
app.use('/api', apiRouter);


app.use(errorhandler());

// Start listening at 
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log('Listening on port: ' + PORT);
});

module.exports = app