const axios = require('axios').default;
const parseString = require('xml2js').parseString;

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database.sqlite');

const seedDatabase = () => {
	axios
		.get(
			'http://www.lb.lt/WebServices/FxRates/FxRates.asmx/getCurrentFxRates?tp=EU'
		)
		.then((response) => {
			parseString(response.data, (error, result) => {
				if (error) {
					console.log(error);
				} else {
					result.FxRates.FxRate.forEach((el) => {
						const sqlCreateRatesTable =
							'CREATE TABLE IF NOT EXISTS rates (' +
							'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
							'iso_code TEXT UNIQUE NOT NULL,' +
							'last_updated TEXT NOT NULL,' +
							'exchange_rate TEXT NOT NULL)';

						const sqlSeedRatesTable =
							'INSERT OR REPLACE INTO rates (iso_code, last_updated, exchange_rate)' +
							'VALUES ($isoCode, $lastUpdated, $exchangeRate)';

						const values = {
							$isoCode: el.CcyAmt[1].Ccy[0],
							$lastUpdated: el.Dt[0],
							$exchangeRate: el.CcyAmt[1].Amt[0],
						};

						db.serialize(() => {
							db.run(sqlCreateRatesTable, (error) =>
								error ? console.log(error) : null
							);
							db.run(sqlSeedRatesTable, values, (error) =>
								error ? console.log(error) : null
							);
						});
					});
				}
			});
			console.log('Table "rates" is available and seeded');
		})
		.catch((error) => console.log(error));

	axios
		.get(
			'http://www.lb.lt/WebServices/FxRates/FxRates.asmx/getCurrencyList?'
		)
		.then((response) => {
			parseString(response.data, (error, result) => {
				if (error) {
					console.log(error);
				} else {
					result.CcyTbl.CcyNtry.forEach((el) => {
						const sqlCreateCurrenciesTable =
							'CREATE TABLE IF NOT EXISTS currencies (' +
							'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
							'iso_code TEXT UNIQUE NOT NULL,' +
							'currency_name TEXT UNIQUE NOT NULL)';

						const sqlSeedCurrenciesTable =
							'INSERT OR REPLACE INTO currencies (iso_code, currency_name)' +
							'VALUES ($isoCode, $currencyName)';

						const values = {
							$currencyName: el.CcyNm[1]['_'],
							$isoCode: el.Ccy[0],
						};

						db.serialize(() => {
							db.run(sqlCreateCurrenciesTable, (error) =>
								error ? console.log(error) : null
							);
							db.run(sqlSeedCurrenciesTable, values, (error) =>
								error ? console.log(error) : null
							);
						});
					});
					console.log('Table "currencies" is available and seeded');
				}
			});
		})
		.catch((error) => console.log(error));

	const sqlCreateLogTable =
		'CREATE TABLE IF NOT EXISTS log (' +
		'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
		'user_id TEXT NOT NULL,' +
		'conversion_amount TEXT NOT NULL,' +
		'converted_from TEXT NOT NULL,' +
		'converted_to TEXT NOT NULL,' +
		'timestamp TEXT NOT NULL)';

	db.run(sqlCreateLogTable, (error) =>
		error
			? console.log(error)
			: console.log('Table "log" is available but not seeded')
	);
};

seedDatabase();

module.exports = seedDatabase;
