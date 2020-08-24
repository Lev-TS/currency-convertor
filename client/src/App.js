import React from 'react';
import './App.css';

import { v4 as uuidv4 } from 'uuid';

import Form from './components/form/form.component';
import Results from './components/results/results.component';
import Attribution from './components/attribution/attribution.component';

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isInvertedConversion: false,

			// data sent
			userId: '',
			selectedCurrency: '',
			conversionAmount: '',
			convertedFrom: '',
			convertedTo: '',

			// data received
			exchangeRate: '',
			lastUpdated: '',
			previousConversionAmount: '',
			previousConvertedFrom: '',
			previousConvertedTo: '',

			// data computed based on data received
			convertedAmount: '',
		};
	}

	handleCurrencySelection = (event) => {
		const convertedFrom = !this.state.isInvertedConversion
			? 'EUR'
			: event.target.value;
		const convertedTo = this.state.isInvertedConversion
			? 'EUR'
			: event.target.value;

		this.setState({
			selectedCurrency: event.target.value,
			convertedFrom: convertedFrom,
			convertedTo: convertedTo,
		});
	};

	handleConversionInvertion = (event) => {
		this.setState((prevState) => ({
			isInvertedConversion: !prevState.isInvertedConversion,
			convertedFrom: prevState.convertedTo,
			convertedTo: prevState.convertedFrom,
		}));
	};

	handleConversionAmountInput = (event) => {
		const regex = /^[0-9]*\.?[0-9]*$/;
		if (regex.test(event.target.value)) {
			this.setState({ conversionAmount: event.target.value });
		}
	};

	handleSubmit = (event) => {
		event.preventDefault();

		const {
			userId,
			selectedCurrency,
			conversionAmount,
			convertedFrom,
			convertedTo,
			isInvertedConversion,
		} = this.state;

		fetch('/api/currency/convert', {
			method: 'POST',
			body: JSON.stringify({
				userId,
				selectedCurrency,
				conversionAmount,
				convertedFrom,
				convertedTo,
			}),
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json; charset=utf-8',
			},
		})
			.then((response) => response.json())
			.then(({ selectedCurrencyDetails, lastActivity }) => {
				const convertedAmount = isInvertedConversion
					? conversionAmount / selectedCurrencyDetails.exchange_rate
					: conversionAmount * selectedCurrencyDetails.exchange_rate;

				this.setState({
					exchangeRate: selectedCurrencyDetails.exchange_rate,
					lastUpdated: selectedCurrencyDetails.last_updated,
					previousConversionAmount: lastActivity.conversion_amount,
					previousConvertedFrom: lastActivity.converted_from,
					previousConvertedTo: lastActivity.converted_to,
					convertedAmount,
				});
			})
			.catch((error) => {
				alert('Server failed, please try again later');
				console.log(error);
			});
	};

	// get existing userId if exists or create a newUser
	componentDidMount() {
		const isExistingUser = JSON.parse(window.localStorage.getItem('user'));
		if (isExistingUser) {
			this.setState({ userId: isExistingUser.id });
		} else {
			const newUser = { id: uuidv4() };
			window.localStorage.setItem('user', JSON.stringify(newUser));
			this.setState({ userId: newUser.id });
		}
	}

	// reset exchangeRate to unsure that inverted conversion gets logged.
	componentWillUnmount() {
		this.setState({ exchangeRate: '' });
	}

	render() {
		const {
			selectedCurrency,
			conversionAmount,
			isInvertedConversion,
			exchangeRate,
			lastUpdated,
			previousConversionAmount,
			previousConvertedFrom,
			previousConvertedTo,
			convertedAmount,
		} = this.state;

		return (
			<div className="App">
				<Form
					conversionAmount={conversionAmount}
					selectedCurrency={selectedCurrency}
					isInvertedConversion={isInvertedConversion}
					handleSubmit={this.handleSubmit}
					handleConversionAmountInput={
						this.handleConversionAmountInput
					}
					handleCurrencySelection={this.handleCurrencySelection}
					handleConversionInvertion={this.handleConversionInvertion}
				/>
				<Results
					exchangeRate={Number(exchangeRate)}
					lastUpdated={lastUpdated}
					previousConversionAmount={previousConversionAmount}
					previousConvertedFrom={previousConvertedFrom}
					previousConvertedTo={previousConvertedTo}
					convertedAmount={Number(convertedAmount)}
				/>
				<Attribution />
			</div>
		);
	}
}

export default App;
