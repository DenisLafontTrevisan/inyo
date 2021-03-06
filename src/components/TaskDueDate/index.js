import moment from 'moment';
import React, {
	useCallback, useEffect, useRef, useState,
} from 'react';

import fbt from '../../fbt/fbt.macro';
import {
	accentGrey,
	DateInputContainer,
	DueDateInputElem,
	TaskIconText,
} from '../../utils/new/design-system';
import useOnClickOutside from '../../utils/useOnClickOutside';
import DateInput from '../DateInput';
import MaterialIcon from '../MaterialIcon';
import Tooltip from '../Tooltip';

function TaskDueDate({
	editDueDate,
	customerToken,
	setEditDueDate,
	item,
	onDueDateSubmit,
	switchOnSelect,
	setEditCustomer,
}) {
	const dateRef = useRef();
	const [dueDate, setDueDate] = useState(
		item.dueDate
			|| (item.dueDate
				|| (item.section
					&& item.section.project
					&& item.section.project.deadline)),
	);
	const [momentDueDate, setMomentDueDate] = useState(
		moment(dueDate || new Date()),
	);

	useEffect(() => {
		setDueDate(
			item.dueDate
				|| (item.dueDate
					|| (item.section
						&& item.section.project
						&& item.section.project.deadline)),
		);
	}, [item.dueDate, item.section]);

	useEffect(() => {
		setMomentDueDate(moment(dueDate || new Date()));
	}, [dueDate]);

	useOnClickOutside(dateRef, () => {
		setEditDueDate(false);
	});

	const onClickDateInputContainer = useCallback(() => {
		if (!customerToken && !editDueDate) {
			setEditDueDate(true);
		}
	}, [customerToken, editDueDate, setEditDueDate]);
	const onDateChangeDateInput = useCallback(
		(args) => {
			onDueDateSubmit(args);
			setEditDueDate(false);
			if (switchOnSelect) {
				setEditCustomer(true);
			}
		},
		[onDueDateSubmit, setEditDueDate, switchOnSelect, setEditCustomer],
	);

	return (
		<Tooltip
			label={
				<fbt project="inyo" desc="worked days left">
					Marge restante pour commencer la tâche
				</fbt>
			}
		>
			<TaskIconText
				inactive={editDueDate}
				icon={
					<MaterialIcon icon="event" size="tiny" color={accentGrey} />
				}
				content={
					<DateInputContainer onClick={onClickDateInputContainer}>
						{!customerToken && editDueDate ? (
							<>
								<DueDateInputElem
									value={moment(dueDate || new Date()).format(
										'DD/MM/YYYY',
									)}
								/>
								<DateInput
									innerRef={dateRef}
									date={momentDueDate}
									onDateChange={onDateChangeDateInput}
									duration={item.unit}
								/>
							</>
						) : (
							<>
								{(dueDate && (
									<>
										<fbt
											project="inyo"
											desc="notification message"
										>
											<fbt:plural
												name="workedDaysCount"
												count={
													moment(dueDate).diff(
														moment(),
														'days',
													) - item.unit
												}
												many="jours"
												value={
													+(
														moment(dueDate).diff(
															moment(),
															'days',
														) - item.unit
													).toFixed(2)
												}
												showCount="yes"
											>
												jour
											</fbt:plural>
										</fbt>
									</>
								)) || <>&mdash;</>}
							</>
						)}
					</DateInputContainer>
				}
			/>
		</Tooltip>
	);
}

export default TaskDueDate;
