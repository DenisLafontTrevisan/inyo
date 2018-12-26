import React from 'react';
import gql from 'graphql-tag';
import {Query} from 'react-apollo';
import {withRouter, Route} from 'react-router-dom';
import styled from 'react-emotion';

import Item from '../../../components/ProjectSection/see-item';
import ItemView from '../../../components/ItemView';

import {
	P,
	H3,
	primaryNavyBlue,
	LinkButton,
	ModalContainer as Modal,
	FlexRow,
	ModalElem,
} from '../../../utils/content';
import {ReactComponent as TaskIcon} from '../../../utils/icons/folder.svg';
import {ReactComponent as TimeIcon} from '../../../utils/icons/time.svg';
import {ReactComponent as DateIcon} from '../../../utils/icons/date.svg';
import {ReactComponent as ContactIcon} from '../../../utils/icons/contact.svg';

const SectionTitle = styled(H3)`
	color: ${primaryNavyBlue};
`;

const USER_TASKS = gql`
	query {
		me {
			id
			startWorkAt
			endWorkAt
		}
		items {
			id
			status
			name
			description
			unit
			reviewer
			section {
				id
				project {
					id
					deadline
					status
					customer {
						id
						name
					}
				}
			}
		}
	}
`;

const ColumnHeader = styled('div')`
	flex: ${props => props.flex};
	display: flex;
`;

const HeaderRow = styled(FlexRow)`
	margin: 10px 51px 10px 17px;
`;

const HeaderText = styled('span')`
	margin-left: 7px;
`;

const DashboardTasks = ({history}) => (
	<Query query={USER_TASKS}>
		{({data, loading}) => {
			if (loading) return <p>Loading</p>;

			const {me, items} = data;

			const now = new Date();

			const startWorkAt = new Date();
			const endWorkAt = new Date();

			startWorkAt.setUTCHours(
				me.startWorkAt.split(':')[0],
				me.endWorkAt.split(':')[1],
				0,
				0,
			);
			endWorkAt.setUTCHours(
				me.endWorkAt.split(':')[0],
				me.endWorkAt.split(':')[1],
				0,
				0,
			);

			const userWorkingTime = (endWorkAt - startWorkAt) / 60 / 60 / 1000;
			// day is over -> show next day
			let timeLeft = userWorkingTime;

			// day ongoing -> show tasks the user can do
			if (now > startWorkAt && now < endWorkAt) {
				timeLeft = (now - startWorkAt) / 60 / 60 / 1000;
			}

			const itemsToDo = [];

			while (
				itemsToDo.reduce((sum, {unit}) => sum + unit, 0)
					* userWorkingTime
					< timeLeft
				&& itemsToDo.length < 8
				&& items[itemsToDo.length]
			) {
				itemsToDo.push(items[itemsToDo.length]);
			}
			const itemsToDoLater = items.slice(
				itemsToDo.length,
				itemsToDo.length + 3,
			);

			return (
				<>
					{now > endWorkAt ? (
						<SectionTitle>Tâches à faire demain</SectionTitle>
					) : (
						<SectionTitle>Tâches à faire aujourd'hui</SectionTitle>
					)}
					<HeaderRow>
						<ColumnHeader flex="1">
							<TaskIcon />
							<HeaderText>Titre de la tâche</HeaderText>
						</ColumnHeader>
						<ColumnHeader flex="0 0 140px">
							<TimeIcon />
							<HeaderText>Durée</HeaderText>
						</ColumnHeader>
						<ColumnHeader flex="0 0 140px">
							<DateIcon />
							<HeaderText>Deadline</HeaderText>
						</ColumnHeader>
						<ColumnHeader flex="0 0 140px">
							<ContactIcon />
							<HeaderText>Client</HeaderText>
						</ColumnHeader>
					</HeaderRow>
					{itemsToDo.length ? (
						itemsToDo.map(item => (
							<Item
								key={item.id}
								item={item}
								projectStatus={item.section.project.status}
								deadline={item.section.project.deadline}
								mode="dashboard"
								customer={item.section.project.customer.name}
								onClick={() => {
									history.push(
										`/app/dashboard/items/${item.id}`,
									);
								}}
								onClickCommentIcon={() => {
									history.push(
										`/app/dashboard/items/${
											item.id
										}#comments`,
									);
								}}
							/>
						))
					) : (
						<div>
							<P>
								Bravo, vous n'avez plus rien à faire !
								Voulez-vous...
							</P>
							<LinkButton to="/app/projects/create">
								Créer un nouveau projet
							</LinkButton>
						</div>
					)}
					<SectionTitle>Il vous reste du temps ?</SectionTitle>
					{itemsToDoLater.map(item => (
						<Item
							key={item.id}
							item={item}
							projectStatus={item.section.project.status}
							deadline={item.section.project.deadline}
							mode="dashboard"
							customer={item.section.project.customer.name}
							onClick={() => {
								history.push(`/app/dashboard/items/${item.id}`);
							}}
							onClickCommentIcon={() => {
								history.push(
									`/app/dashboard/items/${item.id}#comments`,
								);
							}}
						/>
					))}

					<Route
						path="/app/dashboard/items/:itemId"
						render={({match, history}) => (
							<Modal
								onDismiss={() => history.push('/app/dashboard')}
							>
								<ModalElem>
									<ItemView id={match.params.itemId} />
								</ModalElem>
							</Modal>
						)}
					/>
				</>
			);
		}}
	</Query>
);

export default withRouter(DashboardTasks);
