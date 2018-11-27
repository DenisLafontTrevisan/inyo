import React, {Component} from 'react';
import DayPicker from 'react-day-picker';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import ClassicSelect from 'react-select';
import styled from 'react-emotion';
import 'react-day-picker/lib/style.css';

import {
	Input,
	primaryWhite,
	primaryNavyBlue,
	primaryBlue,
	FlexRow,
} from '../../utils/content';

const WEEKDAYS_SHORT = {
	fr: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
};
const MONTHS = {
	fr: [
		'Janvier',
		'Février',
		'Mars',
		'Avril',
		'Mai',
		'Juin',
		'Juillet',
		'Août',
		'Septembre',
		'Octobre',
		'Novembre',
		'Décembre',
	],
};

const WEEKDAYS_LONG = {
	fr: [
		'Dimanche',
		'Lundi',
		'Mardi',
		'Mercredi',
		'Jeudi',
		'Vendredi',
		'Smedi',
	],
};

const FIRST_DAY_OF_WEEK = {
	fr: 1,
};
// Translate aria-labels
const LABELS = {
	fr: {nextMonth: 'Mois suivant', previousMonth: 'Mois précédent'},
};

const formatDate = dateObject => new Date(dateObject).toLocaleDateString('fr-FR');

const parseDate = (dateString) => {
	const dates = dateString.split('/');

	return new Date(`${dates[1]}/${dates[0]}/${dates[2]}`);
};

const SearchQuoteFormMain = styled(FlexRow)`
	padding: 40px;
	background-color: ${primaryWhite};
`;

const DateInput = styled(Input)`
	background: ${primaryWhite};
	border-color: ${primaryBlue};
	border-left: 0px;
	color: ${primaryNavyBlue};
	margin-right: 10px;
	padding: 18px 5px;
	&:focus {
		outline: none;
	}
`;

const SpanLabel = styled('span')`
	background: ${primaryWhite};
	color: ${primaryNavyBlue};
	border: 1px solid ${primaryBlue};
	border-right: 0px;
	padding: 15px 0px 12px 18px;
`;

const SelectStyles = {
	option: (base, state) => ({
		...base,
		borderRadius: 0,
		fontFamily: 'Ligne',
	}),
	menu: (base, state) => ({
		...base,
		marginTop: 2,
		borderRadius: 0,
		fontFamily: 'Ligne',
	}),
	control: base => ({
		...base,
		borderRadius: 0,
		fontFamily: 'Ligne',
		width: '300px',
		height: '100%',
	}),
	input: (base, state) => ({
		...base,
		fontFamily: 'Ligne',
		marginTop: '5px',
	}),
};

class SearchQuoteForm extends Component {
	constructor(props) {
		super(props);
		const customers = [];

		props.baseQuotes.forEach((quote) => {
			if (!customers.find(e => e.value === quote.customer.name)) {
				customers.push({
					value: quote.customer.name,
					label: quote.customer.name,
				});
			}
		});
		customers.push({value: 'all', label: 'Tous les clients'});
		this.state = {
			from: new Date('01/01/2018'),
			to: new Date('01/01/2019'),
			customers,
		};
	}

	// initialValues={{
	// 	from: '01/01/2018',
	// 	to: '01/01/2019',
	// }}
	render() {
		const {from, to} = this.state;

		return (
			<SearchQuoteFormMain>
				<SpanLabel>Du :</SpanLabel>
				<DayPickerInput
					formatDate={formatDate}
					parseDate={parseDate}
					dayPickerProps={{
						locale: 'fr',
						months: MONTHS.fr,
						weekdaysLong: WEEKDAYS_LONG.fr,
						weekdaysShort: WEEKDAYS_SHORT.fr,
						firstDayOfWeek: FIRST_DAY_OF_WEEK.fr,
						labels: LABELS.fr,
						selectedDays: from,
					}}
					component={props => <DateInput {...props} />}
					onDayChange={(day) => {
						this.setState({from: day});
						this.props.sortByDate(day, to);
					}}
					value={from}
				/>
				<SpanLabel>Au :</SpanLabel>
				<DayPickerInput
					formatDate={formatDate}
					parseDate={parseDate}
					dayPickerProps={{
						locale: 'fr',
						months: MONTHS.fr,
						weekdaysLong: WEEKDAYS_LONG.fr,
						weekdaysShort: WEEKDAYS_SHORT.fr,
						firstDayOfWeek: FIRST_DAY_OF_WEEK.fr,
						labels: LABELS.fr,
						selectedDays: to,
					}}
					component={props => <DateInput {...props} />}
					onDayChange={(day) => {
						this.setState({to: day});
						this.props.sortByDate(from, day);
					}}
					value={to}
				/>
				<ClassicSelect
					styles={SelectStyles}
					placeholder="Triez par client"
					defaultValue={{value: 'all', label: 'Tous les clients'}}
					onChange={(option) => {
						this.props.sortByCustomer(option && option.value);
					}}
					options={this.state.customers}
				/>
			</SearchQuoteFormMain>
		);
	}
}

export default SearchQuoteForm;