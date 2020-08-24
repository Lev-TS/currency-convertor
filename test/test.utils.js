const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./test/test.sqlite');

const sqlCreateRatesTable =
	'CREATE TABLE IF NOT EXISTS rates (' +
	'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
	'iso_code TEXT UNIQUE NOT NULL,' +
	'last_updated TEXT NOT NULL,' +
	'exchange_rate TEXT NOT NULL)';
const sqlCreateCurrenciesTable =
	'CREATE TABLE IF NOT EXISTS currencies (' +
	'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
	'iso_code TEXT UNIQUE NOT NULL,' +
	'currency_name TEXT UNIQUE NOT NULL)';
const sqlCreateLogTable =
	'CREATE TABLE IF NOT EXISTS log (' +
	'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
	'user_id TEXT NOT NULL,' +
	'conversion_amount TEXT NOT NULL,' +
	'converted_from TEXT NOT NULL,' +
	'converted_to TEXT NOT NULL,' +
	'timestamp TEXT NOT NULL)';

const seedRatesTable =
	'INSERT INTO rates (id, iso_code, last_updated, exchange_rate)' +
	'VALUES (1, "GEL", "2020-07-30", "3.6")';

const seedLogTable =
	'INSERT INTO log (id, user_id, conversion_amount, converted_from, converted_to, timestamp)' +
	'VALUES (1, "2.1", "2.2", "2.3", "2.4", "2.5")';

const seedCurrenciesTable =
	'INSERT INTO currencies (id, iso_code, currency_name)' +
	'VALUES (1, "GEL", "Georgian lari")';

function createTestTables(done) {
	db.serialize(function () {
		db.run('DROP TABLE IF EXISTS currencies');
		db.run(sqlCreateCurrenciesTable);
        db.run(seedCurrenciesTable);
		db.run('DROP TABLE IF EXISTS rates');
		db.run(sqlCreateRatesTable);
        db.run(seedRatesTable);
		db.run('DROP TABLE IF EXISTS log');
		db.run(sqlCreateLogTable);
        db.run(seedLogTable, done);
	});
}

module.exports = {
	sqlCreateRatesTable: sqlCreateRatesTable,
	sqlCreateCurrenciesTable: sqlCreateCurrenciesTable,
	sqlCreateLogTable: sqlCreateLogTable,
	createTestTables: createTestTables,
};
