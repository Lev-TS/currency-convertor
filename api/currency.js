const express = require('express');
const currencyRouter = express.Router();
const path = require('path');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'));

currencyRouter.post('/convert', (req, res, next) => {
	const {
		userId,
		selectedCurrency,
		conversionAmount,
		isInvertedConversion,
	} = req.body;

	if (
		!userId ||
		!selectedCurrency ||
		!conversionAmount
	) {
		return res.sendStatus(400);
	}

	const convertedFrom = isInvertedConversion ? 'EUR' : selectedCurrency;
	const convertedTo = !isInvertedConversion ? 'EUR' : selectedCurrency;

	const sqlLogActivity =
		'INSERT INTO log (user_id, conversion_amount, converted_from, converted_to, timestamp)' +
		'VALUES ($userId, $conversionAmount, $convertedFrom, $convertedTo, $timeStamp)';

	const values = {
		$userId: userId,
		$conversionAmount: conversionAmount,
		$convertedFrom: convertedFrom,
		$convertedTo: convertedTo,
		$timeStamp: Date.now(),
	};

	db.run(sqlLogActivity, values, (error) => {
		if (error) {
			next(error);
		} else {
			console.log('user activity logged');

			const sqlFetchFxRate =
				'SELECT * FROM rates WHERE rates.iso_code = $selectedCurrency';

			const values = {
				$selectedCurrency: selectedCurrency,
			}

			db.get(sqlFetchFxRate, values, (error, data) => {
				error ? res.sendStatus(404) : res.status(200).json({ selectedCurrencyDetails: data });
			});
		}
	});
});

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
