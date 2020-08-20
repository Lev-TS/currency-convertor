import React from 'react';
import './App.css';

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			
			userId: '1234',
			selectedCurrency: 'GEL',
			conversionAmount: '',
			
			exchangeRate: '',
			lastUpdated: '',
			convertedAmount: '',
			abbreviation: ''
		};
	}

	handleCurrencyChange = (event) => {
		this.setState({ selectedCurrency: event.target.value });
	};

	handleConversionAmountInput = (event) => {
		const regex = /^[0-9]*\.?[0-9]*$/;
		if (regex.test(event.target.value)) {
			this.setState({ conversionAmount: event.target.value });
		 }
	};

	handleSubmit = (event) => {
		event.preventDefault();

		const { userId, selectedCurrency, conversionAmount } = this.state;

		fetch('/api/currency/convert', {
			method: 'POST',
			body: JSON.stringify({
				userId,
				selectedCurrency,
				conversionAmount,
			}),
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json; charset=utf-8',
			},
		})
			.then((response) => response.json())
			.then(({ data: { exchange_rate, last_updated, iso_code } }) => {
				const convertedAmount = (
					exchange_rate * conversionAmount
				).toFixed(2);

				this.setState({
					exchangeRate: exchange_rate,
					lastUpdated: last_updated,
					abbreviation: iso_code,
					convertedAmount,
				});
			})
			.catch((error) => console.log(error));
	};

	componentWillUnmount() {
		this.setState({exchangeRate: ''});
	}

	render() {
		const {
			userId,
			selectedCurrency,
			exchangeRate,
			conversionAmount,
			convertedAmount,
			abbreviation
		} = this.state;

		return (
			<div className="App">
				<form onSubmit={this.handleSubmit} method="POST">
					<label>Amount to convert</label>
					<input
						type="text"
						value={conversionAmount}
						onChange={this.handleConversionAmountInput}
						required
					/>
					<button type="submit">Convert</button>
				</form>
				<div className="result">
					<span>
						{convertedAmount} {abbreviation}
					</span>
				</div>
			</div>
		);
	}
}

export default App;
