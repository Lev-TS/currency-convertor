const express = require('express');
const currencyRouter = express.Router();
const path = require('path');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'));



currencyRouter.post('/convert', (req, res, next) => {
	const { userId, selectedCurrency, conversionAmount } = req.body;
	if (!userId || !selectedCurrency || !conversionAmount) {
		return res.sendStatus(400);
	}

	const sqlLogActivity =
		'INSERT INTO log (user_id, conversion_amount, conversion_currency, timestamp)' +
		'VALUES ($userId, $conversionAmount, $selectedCurrency, $timeStamp)';

	const values = {
		$userId: userId,
		$conversionAmount: conversionAmount,
		$selectedCurrency: selectedCurrency,
		$timeStamp: Date.now(),
	};

	db.run(sqlLogActivity, values, (error) => {
		if (error) {
			next(error);
		} else {
			console.log('user activity logged')
			
			const sqlFetchFxRate =
				'SELECT * FROM rates WHERE rates.iso_code = $selectedCurrency';

			db.get(sqlFetchFxRate, values.$selectedCurrency, (error, data) => {
				error
					? console.log(error)
					: res.status(200).json({ data });
			});
		}
	});
});

module.exports = currencyRouter;
