const express = require('express');
const currencyRouter = express.Router();
const path = require('path');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(
	process.env.TEST_DATABASE || path.join(__dirname, '../database.sqlite')
);

// handle request for exchange rate and log activity
currencyRouter.post('/convert', (req, res, next) => {
	const {
		userId,
		conversionAmount,
		convertedFrom,
		convertedTo,
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

	db.run(sqlLogActivity, placeholdersToLogActivity, function (error) {
		if (error) {
			next(error);
		} else {
			db.get(
				`SELECT * FROM log WHERE log.id = ${this.lastID}`,
				(error, retrivedActivity) => {
					if (error) {
						next(error);
					} else {
						const lastActivity = retrivedActivity;
						const sqlFetchFxRate =
							'SELECT exchange_rate, last_updated FROM rates WHERE rates.iso_code = $selectedCurrency';
						const placeholdersToFetchData = {
							$selectedCurrency: selectedCurrency,
						};
						db.get(
							sqlFetchFxRate,
							placeholdersToFetchData,
							(error, selectedCurrencyDetails) => {
								error
									? res.sendStatus(400)
									: res
											.status(200)
											.json({
												selectedCurrencyDetails,
												lastActivity,
											});
							}
						);
					}
				}
			);
		}
	});
});

// handle request for available currencies names;
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
