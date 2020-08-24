import React from 'react';
import './form.styles.scss';

class Form extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			listOfCurrencies: [],
		};
	}

	componentDidMount() {
		fetch('/api/currency/list')
			.then((response) => response.json())
			.then(({ listOfCurrencies }) =>
				this.setState({ listOfCurrencies: listOfCurrencies })
			);
	}

	render() {
		const {
			conversionAmount,
			isInvertedConversion,
			selectedCurrency,
			handleSubmit,
			handleConversionAmountInput,
			handleCurrencySelection,
			handleConversionInvertion,
		} = this.props;

		const { listOfCurrencies } = this.state;

		const convertFrom = <span className="input-field euro">EUR: Euro</span>;

		const convertTo = (
			<select
				value={selectedCurrency}
				onChange={handleCurrencySelection}
				className="input-field"
				required
			>
				<option value='' disabled>Choose a currency</option>
				{listOfCurrencies.map((currency) => (
					<option key={currency.iso_code} value={currency.iso_code}>
						{currency.iso_code}: {currency.currency_name}
					</option>
				))}
			</select>
		);

		return (
			<div className="form">
				<form onSubmit={handleSubmit} method="POST">
					<div className="input-group">
						<span className="label">Amount</span>
						<input
							type="text"
							value={conversionAmount}
							onChange={handleConversionAmountInput}
							className="input-field amount"
							placeholder="Please enter amount"
							required
						/>
					</div>
					<div
						className="input-group"
						style={
							isInvertedConversion
								? { opacity: 1 }
								: { opacity: 0.6 }
						}
					>
						<span className="label">From</span>
						{isInvertedConversion ? convertTo : convertFrom}
					</div>
					<div
						onClick={handleConversionInvertion}
						className="invert-button"
					>
						&#8644;
					</div>
					<div
						className="input-group"
						style={
							isInvertedConversion
								? { opacity: 0.6 }
								: { opacity: 1 }
						}
					>
						<span className="label">To</span>
						{isInvertedConversion ? convertFrom : convertTo}
					</div>
					<button type="submit" className="submit-button">
						&#10095;
					</button>
				</form>
			</div>
		);
	}
}

export default Form;
