import React from 'react';
import styled from 'react-emotion';

import {primaryBlue, primaryWhite} from '../../utils/content';

const DayInputContainer = styled('div')`
	display: flex;
	flex-flow: row nowrap;
	justify-content: space-between;
	margin: 20px 0 20px 14px;
	font-size: 13px;
`;

const DayInput = styled('div')`
	cursor: pointer;
	background: ${props => (props.active ? primaryBlue : 'transparent')};
	color: ${props => (props.active ? primaryWhite : primaryBlue)};
	border-radius: 50%;
	width: 50px;
	height: 50px;
	display: flex;
	justify-content: center;
	align-items: center;
	border: solid 1px ${primaryBlue};
`;

const workingDaysNames = [
	{
		label: 'lun.',
		value: 'MONDAY',
	},
	{
		label: 'mar.',
		value: 'TUESDAY',
	},
	{
		label: 'mer.',
		value: 'WEDNESDAY',
	},
	{
		label: 'jeu.',
		value: 'THURSDAY',
	},
	{
		label: 'ven.',
		value: 'FRIDAY',
	},
	{
		label: 'sam.',
		value: 'SATURDAY',
	},
	{
		label: 'dim.',
		value: 'SUNDAY',
	},
];

function selectDay(values, value, setFieldValue) {
	return function () {
		const index = values.findIndex(item => value === item);

		if (index === -1) {
			values.push(value);
		}
		else {
			values.splice(index, 1);
		}

		setFieldValue('workingDays', values);
	};
}

export default function WeekDaysInput({values, setFieldValue}) {
	return (
		<DayInputContainer>
			{workingDaysNames.map(({value, label}) => (
				<DayInput
					active={values.includes(value)}
					onClick={selectDay(values, value, setFieldValue)}
				>
					{label}
				</DayInput>
			))}
		</DayInputContainer>
	);
}