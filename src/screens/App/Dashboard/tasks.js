import styled from '@emotion/styled';
import Portal from '@reach/portal';
import moment from 'moment';
import React, {useCallback, useMemo, useState} from 'react';
import {useDrag} from 'react-dnd';
import {Route, withRouter} from 'react-router-dom';

import ArianneThread from '../../../components/ArianneThread';
import TaskView from '../../../components/ItemView';
import LeftBarSchedule from '../../../components/LeftBarSchedule';
import MaterialIcon from '../../../components/MaterialIcon';
import RescheduleModal from '../../../components/RescheduleModal';
import Schedule from '../../../components/Schedule';
import Task from '../../../components/TaskRow';
import TasksList from '../../../components/TasksList';
import fbt from '../../../fbt/fbt.macro';
import {useMutation, useQuery} from '../../../utils/apollo-hooks';
import {BREAKPOINTS, DRAG_TYPES} from '../../../utils/constants';
import {
	FlexRow,
	LoadingLogo,
	ModalContainer as Modal,
	ModalElem,
} from '../../../utils/content';
import {
	isCustomerTask,
	taskFulfillsActivationCriteria,
} from '../../../utils/functions';
import IllusBackground from '../../../utils/images/empty-tasks-background.svg';
import IllusFigure from '../../../utils/images/empty-tasks-illus.svg';
import {FOCUS_TASK} from '../../../utils/mutations';
import {
	IllusContainer,
	IllusFigureContainer,
	IllusText,
	P,
	ScrollHelper,
} from '../../../utils/new/design-system';
import {GET_ALL_TASKS_SHORT} from '../../../utils/queries';
import useScheduleData from '../../../utils/useScheduleData';
import useUserInfos from '../../../utils/useUserInfos';

const TasksListStyle = {minHeight: '50px'};

const FlexRowMobile = styled(FlexRow)`
	@media (max-width: ${BREAKPOINTS.mobile}px) {
		flex-direction: column;
	}

	@media (max-width: ${BREAKPOINTS.desktopSmall}px) {
		flex-direction: column;
	}
`;

function DraggableTask({
	item,
	userId,
	customerToken,
	baseUrl,
	setIsDragging = () => {},
}) {
	const [, drag] = useDrag({
		item: {
			id: item.id,
			type: DRAG_TYPES.TASK,
		},
		begin() {
			setIsDragging(true);
			return {
				type: item.type,
				linkedCustomer: item.linkedCustomer, // we need this
				attachments: item.attachments, // and this to check for activation criteria fulfillment
				id: item.id,
			};
		},
		end() {
			setIsDragging(false);
		},
	});

	if (isCustomerTask(item.type) && !item.linkedCustomer) {
		return (
			<Task item={item} customerToken={customerToken} baseUrl={baseUrl} />
		);
	}

	return (
		<Task
			ref={drag}
			item={item}
			customerToken={customerToken}
			baseUrl={baseUrl}
			userId={userId}
			isDraggable
		/>
	);
}

const Loading = ({loading, fallback, children}) => {
	if (loading) {
		return fallback;
	}

	return children();
};

const LoadingScreen = () => (
	<Portal>
		<div
			style={{
				display: 'flex',
				position: 'fixed',
				background: 'white',
				top: '0',
				bottom: '0',
				right: '0',
				left: '0',
			}}
		>
			<LoadingLogo />
		</div>
	</Portal>
);

const DashboardTasks = ({location, history}) => {
	const {prevSearch} = location.state || {};
	const [isDragging, setIsDragging] = useState(false);
	const setIsDraggingDelayed = useCallback(
		(value) => {
			setTimeout(() => setIsDragging(value), 700);
		},
		[setIsDragging],
	);
	const query = useMemo(
		() => new URLSearchParams(prevSearch || location.search),
		[prevSearch, location.search],
	);

	const startingFrom
		= query.get('from')
		|| moment()
			.startOf('week')
			.format(moment.HTML5_FMT.DATE);

	const {data, loading, error} = useQuery(GET_ALL_TASKS_SHORT, {
		variables: {schedule: 'UNSCHEDULED'},
		pollInterval: 1000 * 60 * 5, // refresh tasks every 5 min
	});

	const {
		assistantName,
		workingTime,
		workingDays,
		hasFullWeekSchedule,
	} = useUserInfos();
	const [focusTask] = useMutation(FOCUS_TASK);
	const {
		loading: loadingSchedule,
		tasksToReschedule,
		scheduledTasksPerDay,
	} = useScheduleData({startingFrom});

	const onMoveTask = useCallback(
		({
			task, from, scheduledFor, position, action = 'MOVE',
		}) => {
			if (isCustomerTask(task.type) && !task.scheduledFor) {
				history.push({
					pathname: `/app/dashboard/${task.id}`,
					state: {
						prevSearch: location.search,
						isActivating: taskFulfillsActivationCriteria(task),
						scheduledFor,
					},
				});

				return;
			}

			if (
				isCustomerTask(task.type)
				&& task.scheduledForDays.some(day => day.date === scheduledFor)
			) return;

			focusTask({
				refetchQueries: ['getPlannedTimes'],
				awaitRefetchQueries: true,
				variables: {
					itemId: task.id,
					from,
					for: scheduledFor,
					schedulePosition: position,
					action,
				},
				optimisticReponse: {
					focusTask: {
						itemId: task.id,
						for: scheduledFor,
						schedulePosition: position,
					},
				},
			});
		},
		[focusTask, data && data.me.tasks, history, location.search],
	);

	const projectId = query.get('projectId');
	const filter = query.get('filter');
	const tags = useMemo(() => query.getAll('tags'), [
		query.getAll('tags').length,
	]);
	const linkedCustomerId = query.get('customerId');

	if (
		error
		&& !(
			data.me
			&& typeof error.message === 'string'
			&& (error.message.includes('NetworkError')
				|| error.message.includes('Network error')
				|| error.message.includes('Whoops'))
		)
	) throw error;

	const setProjectSelected = useCallback(
		(selected, removeCustomer) => {
			const newQuery = new URLSearchParams(query);

			if (selected) {
				const {value: selectedProjectId} = selected;

				newQuery.set('projectId', selectedProjectId);
			}
			else if (newQuery.has('projectId')) {
				newQuery.delete('projectId');
			}

			if (removeCustomer) {
				newQuery.delete('customerId');
			}

			history.push(`/app/dashboard?${newQuery.toString()}`);
		},
		[history, query],
	);

	const setCustomerSelected = useCallback(
		(selected) => {
			const newQuery = new URLSearchParams(query);

			if (selected) {
				const {value: selectedCustomerId} = selected;

				newQuery.set('customerId', selectedCustomerId);
			}
			else if (newQuery.has('customerId')) {
				newQuery.delete('customerId');
			}

			if (newQuery.has('projectId')) {
				newQuery.delete('projectId');
			}

			history.push(`/app/dashboard?${newQuery.toString()}`);
		},
		[history, query],
	);

	const setFilterSelected = useCallback(
		(selected) => {
			const newQuery = new URLSearchParams(query);

			if (selected) {
				const {value: selectedFilterId} = selected;

				newQuery.set('filter', selectedFilterId);
			}

			history.push(`/app/dashboard?${newQuery.toString()}`);
		},
		[history, query],
	);

	const setTagSelected = useCallback(
		(selected) => {
			const newQuery = new URLSearchParams(query);

			if (selected) {
				newQuery.delete('tags');
				selected.forEach(tag => newQuery.append('tags', tag.value));
			}

			history.push(`/app/dashboard?${newQuery.toString()}`);
		},
		[history, query],
	);

	const [
		unscheduledTasks,
		unscheduledFilteredTasks,
		ongoingProjectAndNoProjectTask,
		createTaskComponent,
	] = useMemo(() => {
		if (!loading) {
			const {
				me: {id, tasks},
			} = data;

			const unscheduledTasks = tasks.filter(
				t => !(t.assignee && t.assignee.id !== id),
			);

			const ongoingProjectAndNoProjectTask = unscheduledTasks.filter(
				task => !task.section
					|| task.section.project.status === 'ONGOING'
					|| projectId,
			);

			const unscheduledFilteredTasks = ongoingProjectAndNoProjectTask.filter(
				task => (!linkedCustomerId
						|| ((task.linkedCustomer
							&& task.linkedCustomer.id === linkedCustomerId)
							|| (task.section
								&& task.section.project.customer
								&& task.section.project.customer.id
									=== linkedCustomerId)))
					&& (!filter || task.status === filter || filter === 'ALL')
					// no project id, or project id, or special fake project id "noproject"
					&& (!projectId
						|| (task.section
							&& task.section.project.id === projectId)
						|| (projectId === 'noproject' && !task.section))
					&& tags.every(tag => task.tags.some(taskTag => taskTag.id === tag)),
			);

			const createTaskComponent = ({item, customerToken}) => (
				<DraggableTask
					item={item}
					userId={id}
					key={item.id}
					customerToken={customerToken}
					baseUrl="dashboard"
					setIsDragging={setIsDraggingDelayed}
				/>
			);

			return [
				unscheduledTasks,
				unscheduledFilteredTasks,
				ongoingProjectAndNoProjectTask,
				createTaskComponent,
			];
		}

		return [[], [], [], () => {}];
	}, [
		loading,
		data,
		projectId,
		linkedCustomerId,
		filter,
		tags,
		setIsDraggingDelayed,
	]);

	return (
		<>
			<ScrollHelper>
				<MaterialIcon icon="unfold_more" size="normal" />
			</ScrollHelper>
			<Schedule
				loading={loadingSchedule}
				startingFrom={startingFrom}
				onChangeWeek={(newWeek) => {
					const newQuery = new URLSearchParams(query);

					newQuery.set('from', newWeek);

					history.replace({
						...location,
						search: newQuery.toString(),
					});
				}}
				days={scheduledTasksPerDay}
				workingDays={workingDays}
				fullWeek={hasFullWeekSchedule}
				onMoveTask={onMoveTask}
				assistantName={assistantName}
				workingTime={workingTime}
				setIsDragging={setIsDraggingDelayed}
			/>
			{tasksToReschedule.length > 0 && (
				<RescheduleModal
					tasks={tasksToReschedule}
					onReschedule={onMoveTask}
				/>
			)}
			<FlexRowMobile justifyContent="space-between">
				<div style={{flex: 1}}>
					<ArianneThread
						projectId={projectId}
						linkedCustomerId={linkedCustomerId}
						selectCustomer={setCustomerSelected}
						selectProjects={setProjectSelected}
						selectFilter={setFilterSelected}
						selectTag={setTagSelected}
						filterId={filter}
						tagsSelected={tags}
						marginTop
					/>
					<Loading loading={loading} fallback={<LoadingScreen />}>
						{() => (unscheduledTasks.length !== 0
							|| unscheduledFilteredTasks.length
								!== unscheduledTasks.length ? (
								<TasksList
									style={TasksListStyle}
									hasFilteredItems={
										ongoingProjectAndNoProjectTask.length
										!== unscheduledFilteredTasks.length
									}
									items={unscheduledFilteredTasks}
									baseUrl="dashboard"
									createTaskComponent={createTaskComponent}
									condensed
								/>
							) : (
								<div style={{marginTop: '2rem'}}>
									<IllusContainer bg={IllusBackground}>
										<IllusFigureContainer
											fig={IllusFigure}
										/>
										<IllusText>
											<P>
												<fbt
													project="inyo"
													desc="no more task"
												>
													Vous n'avez plus de tâches à
													planifier.
												</fbt>
											</P>
										</IllusText>
									</IllusContainer>
								</div>
							))
						}
					</Loading>
				</div>
			</FlexRowMobile>
			<Route
				path="/app/dashboard/:taskId"
				render={({match, history, location: {state = {}}}) => (
					<Modal
						onDismiss={() => history.push(
							`/app/dashboard${state.prevSearch || ''}`,
						)
						}
					>
						<ModalElem>
							<TaskView
								id={match.params.taskId}
								close={() => history.push(
									`/app/dashboard${state.prevSearch
											|| ''}`,
								)
								}
								isActivating={state.isActivating}
								scheduledFor={state.scheduledFor}
							/>
						</ModalElem>
					</Modal>
				)}
			/>
			{!loadingSchedule && (
				<Portal>
					<LeftBarSchedule
						isDragging={isDragging}
						days={scheduledTasksPerDay}
						fullWeek={hasFullWeekSchedule}
						onMoveTask={onMoveTask}
						workingTime={workingTime}
					/>
				</Portal>
			)}
		</>
	);
};

export default withRouter(DashboardTasks);
