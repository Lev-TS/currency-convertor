process.env.PORT = 8081;
process.env.TEST_DATABASE = './test/test.sqlite';

const expect = require('chai').expect;
const request = require('supertest');
const sqlite3 = require('sqlite3');

const app = require('../server');
const utils = require('./test.utils');

const prodDb = new sqlite3.Database('./database.sqlite');
const testDb = new sqlite3.Database(process.env.TEST_DATABASE);

// Model tests
describe("Table 'rates'", function () {
	it('should exist', function (done) {
		prodDb.get(
			"SELECT name FROM sqlite_master WHERE type='table' AND name='rates'",
			(error, table) => {
				if (error || !table) {
					done(new Error(error || 'Table not found'));
				}
				if (table) {
					done();
				}
			}
		);
	});

	it('should have iso_code, last_updated, and exchange_rate columns', function (done) {
		prodDb.run(
			"INSERT INTO rates (iso_code, last_updated, exchange_rate) VALUES ('test-value', '23-08-2020', '3.3')",
			function (error) {
				if (error) {
					done(new Error(error));
				} else {
					prodDb.run(
						`DELETE FROM rates WHERE rates.id=${this.lastID}`,
						() => {
							expect(this.lastID).to.exist;
							done();
						}
					);
				}
			}
		);
	});

	it('should contain exchange rates provided by the bank', function (done) {
		prodDb.get(
			"SELECT * FROM rates WHERE rates.iso_code='USD'",
			(error, row) => {
				if (error || !row) {
					done(new Error(error || 'Row not found'));
				}
				if (row) {
					expect(row.last_updated).to.exist;
					expect(row.exchange_rate).to.exist;
					done();
				}
			}
		);
	});

	it('should contain up-to-date exchange rates', function (done) {
		prodDb.serialize(function () {
			prodDb.run(
				"INSERT INTO rates (iso_code, last_updated, exchange_rate) VALUES ('test-value', '23-08-2020', '3.3')"
			);
			prodDb.run(
				"INSERT OR REPLACE INTO rates (iso_code, last_updated, exchange_rate) VALUES ('test-value', '24-08-2020', '3.4')"
			);
			prodDb.get(
				"SELECT * FROM rates WHERE rates.iso_code='test-value'",
				(error, row) => {
					if (error || !row) {
						done(new Error('cells ar not updated'));
					}
					if (row) {
						expect(row.last_updated).to.equal('24-08-2020');
						expect(row.exchange_rate).to.equal('3.4');
						done();
					}
				}
			);
			prodDb.run("DELETE FROM rates WHERE rates.iso_code='test-value'");
		});
	});
});

describe("Table 'currencies'", function () {
	it('should exist', function (done) {
		prodDb.get(
			"SELECT name FROM sqlite_master WHERE type='table' AND name='currencies'",
			(error, table) => {
				if (error || !table) {
					done(new Error(error || 'Table not found'));
				}
				if (table) {
					done();
				}
			}
		);
	});

	it('should have iso_code and currency_name columns', function (done) {
		prodDb.run(
			"INSERT INTO currencies (iso_code, currency_name) VALUES ('code', 'name')",
			function (error) {
				if (error) {
					done(new Error(error));
				} else {
					prodDb.run(
						`DELETE FROM currencies WHERE currencies.id=${this.lastID}`,
						() => {
							expect(this.lastID).to.exist;
							done();
						}
					);
				}
			}
		);
	});

	it('should contain currency names provided by the bank', function (done) {
		prodDb.get(
			"SELECT * FROM currencies WHERE currencies.iso_code='USD'",
			(error, row) => {
				if (error || !row) {
					done(new Error(error || 'Row not found'));
				}
				if (row) {
					expect(row.currency_name).to.exist;
					done();
				}
			}
		);
	});

	it('should contain up-to-date currency names', function (done) {
		prodDb.serialize(function () {
			prodDb.run(
				"INSERT INTO currencies (iso_code, currency_name) VALUES ('code', 'name')"
			);
			prodDb.run(
				"INSERT OR REPLACE INTO currencies (iso_code, currency_name) VALUES ('code', 'new-name')"
			);
			prodDb.get(
				"SELECT * FROM currencies WHERE currencies.iso_code='code'",
				(error, row) => {
					if (error || !row) {
						done(new Error('cells ar not updated'));
					}
					if (row) {
						expect(row.currency_name).to.equal('new-name');
						done();
					}
				}
			);
			prodDb.run(
				"DELETE FROM currencies WHERE currencies.iso_code='code'"
			);
		});
	});
});

describe("Table 'log'", function () {
	it('should exist', function (done) {
		prodDb.get(
			"SELECT name FROM sqlite_master WHERE type='table' AND name='log'",
			(error, table) => {
				if (error || !table) {
					done(new Error(error || 'Table not found'));
				}
				if (table) {
					done();
				}
			}
		);
	});

	it('should have user_id, conversion_amount, converted_from, converted_to, timestamp columns', function (done) {
		prodDb.run(
			"INSERT INTO log (user_id, conversion_amount, converted_from, converted_to, timestamp) VALUES ('test-user', '1000', 'EUR', 'GEL', '1234')",
			function (error) {
				if (error) {
					done(new Error(error));
				} else {
					prodDb.run(
						`DELETE FROM log WHERE log.id=${this.lastID}`,
						() => {
							expect(this.lastID).to.exist;
							done();
						}
					);
				}
			}
		);
	});
});

// Server tests
describe('GET /api/currency/list', function () {
	let ratesArrLength;

	beforeEach(function (done) {
		testDb.serialize(function () {
			testDb.run(utils.sqlCreateLogTable);
			testDb.run(utils.sqlCreateRatesTable);
			testDb.run(utils.sqlCreateCurrenciesTable, () => {
				testDb.all('SELECT iso_code FROM rates', (error, rates) => {
					ratesArrLength = rates.length;
					done();
				});
			});
		});
	});

	it('should return all currency names that exist in rates table', function () {
		return request(app)
			.get('/api/currency/list')
			.then(function (response) {
				const currenciesArrLength =
					response.body.listOfCurrencies.length;
				expect(ratesArrLength).to.equal(currenciesArrLength);
			});
	});

	it('should return a status code of 200 after successfully serving the request', function () {
		return request(app).get('/api/currency/list').expect(200);
	});
});

describe('POST /api/currency/convert', function () {
	let newActivity;

	beforeEach(function (done) {
		utils.createTestTables(done)
		newActivity = {
			userId: 'test',
			// REMEMBER: selectedCurrency is not logged by design
			selectedCurrency: 'GEL',
			conversionAmount: '100',
			convertedFrom: 'GEL',
			convertedTo: 'EUR',
		};
	});

	it('should create a new user activity log', function () {
		return request(app)
			.post('/api/currency/convert')
			.send(newActivity)
			.then(function () {
				testDb.all(
					'SELECT * FROM log',
					function (error, result) {
						const retrivedLog = result.find(log => log.user_id === newActivity.userId);
						expect(retrivedLog).to.exist;
						expect(retrivedLog.user_id).to.equal(newActivity.userId);
						expect(retrivedLog.conversion_amount).to.equal(newActivity.conversionAmount)
						expect(retrivedLog.converted_from).to.equal(newActivity.convertedFrom)
						expect(retrivedLog.converted_to).to.equal(newActivity.convertedTo)
					}
				);
			});
	});

	it('should return the newly created user activity log', function () {
		return request(app)
			.post('/api/currency/convert')
			.send(newActivity)
			.then(function (response) {
				const returnedLog = response.body.lastActivity
				expect(returnedLog).to.exist;
				expect(returnedLog.id).to.exist;
				expect(returnedLog.user_id).to.equal(newActivity.userId);
				expect(returnedLog.conversion_amount).to.equal(newActivity.conversionAmount)
				expect(returnedLog.converted_from).to.equal(newActivity.convertedFrom)
				expect(returnedLog.converted_to).to.equal(newActivity.convertedTo)
			})
	})

	it('should return selected currency details', function () {
		return request(app)
			.post('/api/currency/convert')
			.send(newActivity)
			.then(function (response) {
				const returnedCurrencyDetials = response.body.selectedCurrencyDetails
				expect(returnedCurrencyDetials).to.exist;
				expect(returnedCurrencyDetials.exchange_rate).to.exist
				expect(returnedCurrencyDetials.last_updated).to.exist
			})
	})

	it('should return a status code of 400 for invalid currency request', function () {
		return request(app)
			.post('/api/currency/convert')
			.send({
				userId: 'test',
				selectedCurrency: '',
				conversionAmount: '100',
				convertedFrom: 'GEL',
				convertedTo: 'EUR',
			})
			.expect(400)
	})

	it('should return a status code of 200 after successfully serving the request', function () {
		return request(app)
			.post(('/api/currency/convert'))
			.send(newActivity)
			.expect(200)
	})
});
