import React from 'react';
import './form.styles.scss';
import { useRef } from 'react';

class Form extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			currencyList: [],
		};
	}

	// componentDidMount(){
	//     fetch('/api/currency/list_of_currencies')
	// }

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

		const { currencyList, isInvertedConvertation } = this.state;
		const convertFrom = (
			<select name={selectedCurrency}>
				<option value="EUR">EUR: Euro</option>
			</select>
		);

		const convertTo = (
			<select
				value={selectedCurrency}
				onChange={handleCurrencySelection}
				placeholder="Please Choose"
				required
			>
				<option value="USD">USD: US Dollar</option>
				<option value="GEL">GEL: Georgian Lari</option>
			</select>
		);

		return (
			<div className="form">
				<form onSubmit={handleSubmit} method="POST">
					<label>
						Amount
						<input
							type="text"
							value={conversionAmount}
							onChange={handleConversionAmountInput}
							required
						/>
					</label>
					<label>
						From
						{!isInvertedConversion ? convertFrom : convertTo}
					</label>
					<button onClick={handleConversionInvertion}>&#8646;</button>
					<label>
						To
						{isInvertedConversion ? convertFrom : convertTo}
					</label>
					<button type="submit">&#10095;</button>
				</form>
			</div>
		);
	}
}

export default Form;
