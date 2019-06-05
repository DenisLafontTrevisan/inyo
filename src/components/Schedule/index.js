import React, {useState} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {Droppable, Draggable} from 'react-beautiful-dnd';
import styled from '@emotion/styled';

import {
	mediumGrey,
	accentGrey,
	primaryPurple,
	primaryWhite,
	primaryBlack,
	primaryGrey,
	lightGrey,
} from '../../utils/new/design-system';

import TaskCard from '../TaskCard';
import IconButton from '../../utils/new/components/IconButton';

const Container = styled('div')`
	margin-top: 3rem;
`;

const Week = styled('div')`
	display: flex;
	flex-direction: row;
	justify-content: center;
`;

const Day = styled('div')`
	color: ${accentGrey};
	border: 2px solid ${mediumGrey};
	border-radius: 3px;
	padding: 0 5px;
	flex: 1;
	max-width: calc(100% / 7);
	margin: 0 -1px;

	${props => props.isOff
		&& `
		color: ${accentGrey};
		background: ${lightGrey};
	`}
`;

const DayTitle = styled('span')`
	color: inherit;
	text-transform: uppercase;
	font-size: 0.75rem;
	display: block;
	padding: 0.3rem 0;
	text-align: center;
	margin: 0.2rem 2rem 0.5rem;
	border-radius: 4px;

	${props => props.selected
		&& `
		color: ${primaryWhite};
		background: ${primaryPurple};
	`}
`;

const DayTasks = styled('div')`
	color: ${accentGrey};
	display: flex;
	flex-direction: column;
`;

const ScheduleNav = styled('div')`
	display: flex;
	margin-bottom: 1rem;
	color: ${primaryPurple};
	justify-content: flex-end;
`;

const ScheduleNavInfo = styled('div')`
	margin: 0 1rem;
	text-transform: uppercase;

	display: flex;
	align-items: center;
`;

const ScheduleNavButton = styled('button')`
	/* color: ${primaryPurple};
	cursor: pointer;
	height: 21px;
	width: 21px;
	border-radius: 50%; */
`;

const DraggableTaskCard = ({id, index, ...rest}) => (
	<Draggable key={id} draggableId={id} index={index} type="TASK">
		{provided => (
			<div
				className="task"
				ref={provided.innerRef}
				{...provided.draggableProps}
				{...provided.dragHandleProps}
				onMouseDown={e => provided.dragHandleProps
					&& provided.dragHandleProps.onMouseDown(e)
				}
				style={{
					// some basic styles to make the tasks look a bit nicer
					userSelect: 'none',

					// styles we need to apply on draggables
					...provided.draggableProps.style,
				}}
			>
				<TaskCard index={index} {...rest} />
			</div>
		)}
	</Draggable>
);

const DroppableDayTasks = ({id, children}) => (
	<Droppable droppableId={id} type="TASK" direction="vertical">
		{provided => (
			<DayTasks
				style={{minHeight: '50px', height: '100%'}}
				ref={provided.innerRef}
				{...provided.droppableProps}
			>
				{children}
				{provided.placeholder}
			</DayTasks>
		)}
	</Droppable>
);

const WEEKDAYS = {
	1: 'MONDAY',
	2: 'TUESDAY',
	3: 'WEDNESDAY',
	4: 'THURSDAY',
	5: 'FRIDAY',
	6: 'SATURDAY',
	0: 'SUNDAY',
};

const Schedule = ({days, workingDays, fullWeek}) => {
	const [startDay, setStartDay] = useState(moment().startOf('week'));

	const weekdays = [];

	const iteratorDate = moment(startDay).startOf('week');

	do {
		const workedDay = workingDays.includes(WEEKDAYS[iteratorDate.day()]);

		if (fullWeek || workedDay) {
			const tasks
				= (days[iteratorDate.format(moment.HTML5_FMT.DATE)]
					&& days[iteratorDate.format(moment.HTML5_FMT.DATE)].tasks)
				|| [];

			tasks.sort((a, b) => a.schedulePosition - b.schedulePosition);

			weekdays.push({
				momentDate: iteratorDate.clone(),
				date: iteratorDate.format(moment.HTML5_FMT.DATE),
				tasks,
				workedDay,
			});
		}
	} while (
		iteratorDate.add(1, 'day').toDate() < startDay.endOf('week').toDate()
	);

	return (
		<Container>
			<ScheduleNav>
				{
					<IconButton
						icon="navigate_before"
						size="tiny"
						onClick={() => setStartDay(startDay.clone().subtract(1, 'week'))
						}
					/>
				}
				<ScheduleNavInfo>Sem. {startDay.week()}</ScheduleNavInfo>
				{
					<IconButton
						icon="navigate_next"
						size="tiny"
						onClick={() => setStartDay(startDay.clone().add(1, 'week'))
						}
					/>
				}
			</ScheduleNav>
			<Week>
				{weekdays.map(day => (
					<Day isOff={!day.workedDay}>
						<DayTitle
							selected={moment().isSame(day.momentDate, 'day')}
						>
							{day.momentDate
								.toDate()
								.toLocaleDateString('default', {
									weekday: 'short',
									day: 'numeric',
									month: moment().isSame(
										day.momentDate,
										'month',
									)
										? undefined
										: 'numeric',
									year: moment().isSame(
										day.momentDate,
										'year',
									)
										? undefined
										: '2-digit',
								})}
						</DayTitle>
						<DroppableDayTasks id={day.date}>
							{day.tasks.map((task, index) => (
								<DraggableTaskCard
									id={task.id}
									task={task}
									index={index}
								/>
							))}
						</DroppableDayTasks>
					</Day>
				))}
			</Week>
		</Container>
	);
};

Schedule.defaultProps = {
	workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
};

Schedule.propTypes = {
	workingDays: PropTypes.arrayOf(
		PropTypes.oneOf([
			'MONDAY',
			'TUESDAY',
			'WEDNESDAY',
			'THURSDAY',
			'FRIDAY',
			'SATURDAY',
			'SUNDAY',
		]),
	),
};

export default Schedule;
