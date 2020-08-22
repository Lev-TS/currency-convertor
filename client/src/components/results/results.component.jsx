import React from 'react';
import './results.styles.scss';

const Results = ({
	exchangeRate,
	lastUpdated,
	previousConversionAmount,
	previousConvertedFrom,
	previousConvertedTo,
	convertedAmount
}) => {
	const formatNumber = (number) => {
		const expo = 100000000000000 - 1;
		if (number >= expo) {
			return number.toExponential(5);
		} else {
			return number
				.toFixed(2)
				.toString()
				.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
		}
	};

	return (
		<div
			className="results"
			style={{ display: convertedAmount ? 'block' : 'none' }}
		>
			<p>
				{formatNumber(previousConversionAmount)} {previousConvertedFrom}{' '}
				=
			</p>
			<p>
				<span>{formatNumber(convertedAmount)}</span>{' '}
				{previousConvertedTo}
			</p>
			<div className="extras">
				<p>1 EUR = {exchangeRate.toFixed(6)}</p>
				<p>
					1{' '}
					{previousConvertedFrom === 'EUR'
						? previousConvertedTo
						: previousConvertedFrom}{' '}
					= {(1 / exchangeRate).toFixed(6)}{' '}
				</p>
				<p className="date">Updated: {lastUpdated}</p>
			</div>
		</div>
	);
};

export default Results;
