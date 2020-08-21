import React from 'react';
import './App.css';

import Form from './components/form/form.component.jsx';

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			userId: 'dev',
			selectedCurrency: 'GEL',
			conversionAmount: '',

			isInvertedConversion: false,

			exchangeRate: '',
			lastUpdated: '',
			convertedAmount: '',
			currencyAbbreviation: '',
		};
	}

	handleCurrencySelection = (event) => {
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

		const { userId, selectedCurrency, conversionAmount, isInvertedConversion } = this.state;

		fetch('/api/currency/convert', {
			method: 'POST',
			body: JSON.stringify({
				userId,
				selectedCurrency,
				conversionAmount,
				isInvertedConversion
			}),
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json; charset=utf-8',
			},
		})
			.then((response) => response.json())
			.then(({ data: { exchange_rate, last_updated, iso_code } }) => {
				const convertedAmount = isInvertedConversion ? (conversionAmount / exchange_rate).toFixed(2) : (conversionAmount * exchange_rate).toFixed(2)

				this.setState({
					exchangeRate: exchange_rate,
					lastUpdated: last_updated,
					currencyAbbreviation: iso_code,
					convertedAmount
				});
			})
			.catch((error) => {
				alert('Server failed, please try again later');
				console.log(error);
			});
	};

	handleConversionInvertion = (event) => {
		this.state.isInvertedConversion
			? this.setState({ isInvertedConversion: false })
			: this.setState({ isInvertedConversion: true });
	};

	componentWillUnmount() {
		this.setState({ exchangeRate: '' });
	}

	render() {
		const {
			userId,
			selectedCurrency,
			exchangeRate,
			conversionAmount,
			convertedAmount,
			currencyAbbreviation,
			isInvertedConversion,
		} = this.state;

		return (
			<div className="App">
				<Form
					conversionAmount={conversionAmount}
					selectedCurrency={selectedCurrency}
					isInvertedConversion={isInvertedConversion}
					handleSubmit={this.handleSubmit}
					handleConversionAmountInput={this.handleConversionAmountInput}
					handleCurrencySelection={this.handleCurrencySelection}
					handleConversionInvertion={this.handleConversionInvertion}
				/>

				<div className="result">
					<span>
						{convertedAmount}
					</span>
				</div>
			</div>
		);
	}
}

export default App;
