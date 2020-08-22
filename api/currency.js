const express = require('express');
const currencyRouter = express.Router();
const path = require('path');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'));

//handle conversion request
currencyRouter.post('/convert', (req, res, next) => {
	const {
		userId,
		conversionAmount,
		convertedFrom,
		convertedTo,

		// the bank API provides only euro rates, this
		// should be refactored if the api has all rates.
		selectedCurrency,
	} = req.body;

	if (
		!userId ||
		!conversionAmount ||
		!convertedFrom ||
		!convertedTo ||
		!selectedCurrency
	) {
		return res.sendStatus(400);
	}

	// Log activity
	const sqlLogActivity =
		'INSERT INTO log (user_id, conversion_amount, converted_from, converted_to, timestamp)' +
		'VALUES ($userId, $conversionAmount, $convertedFrom, $convertedTo, $timeStamp)';

	const placeholdersToLogActivity = {
		$userId: userId,
		$conversionAmount: conversionAmount,
		$convertedFrom: convertedFrom,
		$convertedTo: convertedTo,
		$timeStamp: Date.now(),
	};

	db.run(sqlLogActivity, placeholdersToLogActivity, (error) => {
		if (error) {
			next(error);
		} else {
			console.log('user activity logged');
		}
	});

	// fetch and send data
	const sqlFetchFxRate =
		'SELECT * FROM rates WHERE rates.iso_code = $selectedCurrency';

	const placeholdersToFetchData = {
		$selectedCurrency: selectedCurrency,
	};

	db.get(sqlFetchFxRate, placeholdersToFetchData, (error, data) => {
		error
			? res.sendStatus(404)
			: res.status(200).json({
					selectedCurrencyDetails: data,
					log: {
						userId: userId,
						conversionAmount: conversionAmount,
						convertedFrom: convertedFrom,
						convertedTo: convertedTo,
					},
			  });
	});
});

// handle request for available currencies
currencyRouter.get('/list', (req, res, next) => {
	db.all(
		'SELECT currencies.currency_name, currencies.iso_code FROM currencies JOIN rates ON currencies.iso_code = rates.iso_code',
		(error, data) => {
			if (error) {
				next(error);
			} else {
				res.status(200).json({ listOfCurrencies: data });
			}
		}
	);
});

module.exports = currencyRouter;
