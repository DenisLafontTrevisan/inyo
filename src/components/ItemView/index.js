import React, {useState, useRef} from 'react';
import styled from '@emotion/styled';
import {css} from '@emotion/core';
import {useQuery, useMutation} from 'react-apollo-hooks';
import moment from 'moment';
import useOnClickOutside from 'use-onclickoutside';
import ReactTooltip from 'react-tooltip';

import TaskStatusButton from '../TaskStatusButton';
import Plural from '../Plural';
import {gray50, gray70, LoadingLogo} from '../../utils/content';
import CheckList from '../CheckList';
import CommentList from '../CommentList';
import MultilineEditable from '../MultilineEditable';
import InlineEditable from '../InlineEditable';
import UnitInput from '../UnitInput';
import DateInput from '../DateInput';
import CustomersDropdown from '../CustomersDropdown';
import ProjectsDropdown from '../ProjectsDropdown';

import {GET_ITEM_DETAILS} from '../../utils/queries';
import {UPDATE_ITEM, REMOVE_ITEM} from '../../utils/mutations';
import {ReactComponent as FolderIcon} from '../../utils/icons/folder.svg';
import {ReactComponent as TimeIcon} from '../../utils/icons/time.svg';
import {ReactComponent as ContactIcon} from '../../utils/icons/contact.svg';
import {ReactComponent as HourglassIcon} from '../../utils/icons/hourglass.svg';
import {ReactComponent as TaskTypeIcon} from '../../utils/icons/task-type.svg';
import {
	TaskHeading,
	SubHeading,
	Button,
	primaryPurple,
	DueDateInputElem,
	DateInputContainer,
	HR,
} from '../../utils/new/design-system';
import {ITEM_TYPES, TOOLTIP_DELAY} from '../../utils/constants';

const Header = styled('div')``;

const Metas = styled('div')`
	display: grid;
	grid-template-columns: 340px 1fr;
	grid-row-gap: 0.8em;
	color: ${gray50};
	padding-bottom: 2rem;
	font-size: 14px;
`;

const Meta = styled('div')`
	display: flex;
	align-items: flex-start;

	svg {
		margin-right: 15px;
	}
`;

const MetaLabel = styled('div')`
	margin-right: 1rem;
`;

const MetaText = styled('span')`
	color: ${primaryPurple};
	flex: 1;
	cursor: ${props => (props.onClick ? 'pointer' : 'initial')};

	:empty::before {
		content: '\\2014';
	}
`;

const MetaTime = styled(MetaText)`
	position: relative;
`;

const ClientDropdown = styled(CustomersDropdown)`
	margin-top: -6px;
	padding: 0;
`;

const StyledProjectsDropdown = styled(ProjectsDropdown)`
	margin-top: -6px;
	padding: 0;
`;

const Description = styled('div')`
	color: ${gray70};
	line-height: 1.6;
	margin-top: 20px;
	margin-bottom: 25px;
	margin-left: -4rem;
	margin-right: -4rem;
	background-color: #faf8fe;
	min-height: 5rem;
	display: flex;

	a {
		color: ${primaryPurple};

		&:hover {
			text-decoration: none;
		}
	}

	blockquote {
		border-left: 3px solid ${primaryPurple};
		padding-left: 1rem;
	}

	textarea {
		min-height: 5rem;
	}
`;

const StickyHeader = styled('div')`
	position: sticky;
	top: 0;
	background: #5020ee;
	margin: -4rem -4rem 1.4rem;
	display: flex;
	justify-content: center;
	padding: 1rem;
	z-index: 1;
`;

const Title = styled(TaskHeading)`
	display: flex;
	align-items: center;
	margin: 2rem 0;

	span {
		border: 1px solid transparent;
		padding: 15px 18px 16px;
		width: 100%;
	}
`;

const TaskHeadingIcon = styled('div')`
	position: relative;
	left: -5px;
`;

const Item = ({id, customerToken, close}) => {
	const [editCustomer, setEditCustomer] = useState(false);
	const [editDueDate, setEditDueDate] = useState(false);
	const [editUnit, setEditUnit] = useState(false);
	const [editProject, setEditProject] = useState(false);
	const [deletingItem, setDeletingItem] = useState(false);
	const dateRef = useRef();

	const {loading, data, error} = useQuery(GET_ITEM_DETAILS, {
		suspend: false,
		variables: {id, token: customerToken},
	});

	const updateItem = useMutation(UPDATE_ITEM);
	const deleteItem = useMutation(REMOVE_ITEM, {
		variables: {
			itemId: id,
		},
		optimisticReponse: {
			removeItem: {
				id,
			},
		},
	});

	useOnClickOutside(dateRef, () => {
		setEditDueDate(false);
	});

	if (loading) return <LoadingLogo />;
	if (error) throw error;

	const {item} = data;
	const {linkedCustomer: customer} = item;

	let {description} = item;
	const deadline
		= (item.dueDate || (item.section && item.section.project.deadline))
		&& new Date(
			item.dueDate || (item.section && item.section.project.deadline),
		);

	// parse the description for the file list
	let files = [];
	const fileListRegex = /([\s\S])+# content-acquisition-list\n([^#]+)$/;

	if (fileListRegex.test(item.description)) {
		const matches = item.description
			.match(fileListRegex)[0]
			.split('# content-acquisition-list');

		const fileItemRegex = /- \[([ x])\] (.+)/;

		files = matches
			.pop()
			.split('\n')
			.filter(line => fileItemRegex.test(line))
			.map(line => ({
				checked: /^- \[[x]]/.test(line),
				name: line.match(fileItemRegex).pop(),
			}));
		description = matches.join('# content-acquisition-list');
	}

	const typeInfo
		= ITEM_TYPES.find(({type}) => type === item.type)
		|| ITEM_TYPES.find(({type}) => type === 'DEFAULT');

	return (
		<>
			<ReactTooltip effect="solid" delayShow={TOOLTIP_DELAY} />
			<StickyHeader>
				<TaskStatusButton
					taskId={id}
					isFinished={item.status === 'FINISHED'}
					disabled={customerToken && item.type !== 'CUSTOMER'}
					customerToken={customerToken}
				/>
			</StickyHeader>
			<Header>
				<Title data-tip="Type et titre de la tâche">
					<TaskHeadingIcon>{typeInfo.icon}</TaskHeadingIcon>
					<InlineEditable
						disabled={!!customerToken}
						editableCss={css`
							padding: 1rem 1.5rem;
						`}
						value={item.name}
						type="text"
						placeholder="Nommez cette tâche"
						onFocusOut={(value) => {
							if (value && value !== item.name) {
								updateItem({
									variables: {
										itemId: id,
										token: customerToken,
										name: value,
									},
								});
							}
						}}
					/>
				</Title>
			</Header>
			<Metas>
				<Meta data-tip="Temps estimé ou passé pour cette tâche">
					<TimeIcon />
					<MetaLabel>Temps estimé</MetaLabel>
					<MetaText>
						{!customerToken && editUnit ? (
							<UnitInput
								unit={item.unit}
								onBlur={(unit) => {
									updateItem({
										variables: {
											itemId: item.id,
											unit,
										},
									});
									setEditUnit(false);
								}}
								onSubmit={(unit) => {
									updateItem({
										variables: {
											itemId: item.id,
											unit,
										},
									});
									setEditUnit(false);
								}}
								onTab={(unit) => {
									updateItem({
										variables: {
											itemId: item.id,
											unit,
										},
									});
									setEditUnit(false);
								}}
							/>
						) : (
							<div
								onClick={
									customerToken
										? undefined
										: () => setEditUnit(true)
								}
							>
								{item.unit}
								<Plural
									singular=" jour"
									plural=" jours"
									value={item.unit}
								/>
							</div>
						)}
					</MetaText>
				</Meta>
				<Meta data-tip="Personne liée à cette tâche">
					<ContactIcon />
					<MetaLabel>Client</MetaLabel>
					{!customerToken && editCustomer ? (
						<ClientDropdown
							id="projects"
							defaultMenuIsOpen
							defaultValue={
								item.linkedCustomer && {
									value: item.linkedCustomer.id,
									label: item.linkedCustomer.name,
								}
							}
							autoFocus
							onChange={({value}) => {
								updateItem({
									variables: {
										itemId: item.id,
										linkedCustomerId: value,
									},
								});
								setEditCustomer(false);
							}}
							onBlur={() => {
								setEditCustomer(false);
							}}
						/>
					) : (
						<MetaText
							onClick={
								customerToken
									? undefined
									: () => setEditCustomer(true)
							}
						>
							{customer && customer.name}
						</MetaText>
					)}
				</Meta>
				{(!deadline || deadline.toString() !== 'Invalid Date') && (
					<Meta data-tip="Date limite pour réaliser cette tâche">
						<HourglassIcon />
						<MetaLabel>Temps restant</MetaLabel>
						<MetaTime
							title={deadline && deadline.toLocaleString()}
							dateTime={deadline && deadline.toJSON()}
							onClick={
								customerToken
									? undefined
									: () => !editDueDate && setEditDueDate(true)
							}
						>
							{!customerToken && editDueDate ? (
								<DateInputContainer>
									<DueDateInputElem
										value={moment(
											deadline || new Date(),
										).format('DD/MM/YYYY')}
									/>
									<DateInput
										innerRef={dateRef}
										date={moment(deadline || new Date())}
										onDateChange={(date) => {
											updateItem({
												variables: {
													itemId: item.id,
													dueDate: date.toISOString(),
												},
											});
											setEditDueDate(false);
										}}
										duration={item.unit}
									/>
								</DateInputContainer>
							) : (
								deadline && (
									<div>
										{moment(deadline).diff(
											moment(),
											'days',
										) - item.unit}{' '}
										<Plural
											value={item.unit}
											singular="jour"
											plural="jours"
										/>
									</div>
								)
							)}
						</MetaTime>
					</Meta>
				)}
				<Meta data-tip="Projet lié à cette tâche">
					<FolderIcon />
					<MetaLabel>Projet</MetaLabel>
					{!customerToken && editProject ? (
						<StyledProjectsDropdown
							id="projects"
							defaultMenuIsOpen
							autoFocus
							defaultValue={
								item.section
								&& item.section.project && {
									value: item.section.project.id,
									label: item.section.project.name,
								}
							}
							onChange={({value}) => {
								updateItem({
									variables: {
										itemId: item.id,
										projectId: value,
									},
								});
								setEditProject(false);
							}}
							onBlur={() => {
								setEditProject(false);
							}}
						/>
					) : (
						<MetaText
							onClick={
								customerToken
									? undefined
									: () => setEditProject(true)
							}
						>
							{item.section
								&& item.section.project
								&& item.section.project.name}
						</MetaText>
					)}
				</Meta>
				<Meta data-tip="Définit s'il y a des actions automatiques">
					<TaskTypeIcon />
					<MetaLabel>Type de tâche</MetaLabel>
					<MetaText>{typeInfo.name}</MetaText>
				</Meta>
			</Metas>
			{(!customerToken || description) && (
				<Description data-tip="Description de la tâche">
					<MultilineEditable
						disabled={!!customerToken}
						placeholder="Ajouter une description…"
						style={{padding: '1rem 4rem'}}
						onBlur={e => updateItem({
							variables: {
								itemId: id,
								token: customerToken,
								description: e.target.innerText,
							},
						})
						}
						defaultValue={description}
					/>
				</Description>
			)}
			{item.type === 'CONTENT_ACQUISITION' && (
				<>
					<SubHeading>Contenus à récupérer</SubHeading>
					<CheckList
						editable={!customerToken} // editable by user only, but checkable
						items={files}
						onChange={({items}) => {
							updateItem({
								variables: {
									itemId: id,
									token: customerToken,
									description: description.concat(
										items.length > 0
											? `\n# content-acquisition-list\n${items
												.map(
													({checked, name}) => `- [${
														checked
															? 'x'
															: ' '
													}] ${name}`,
												)
												.join('\n')}`
											: '',
									),
								},
							});
						}}
					/>
				</>
			)}
			<SubHeading>Commentaires</SubHeading>
			<CommentList itemId={item.id} customerToken={customerToken} />
			{!customerToken
				&& (deletingItem ? (
					<>
						<Button grey onClick={() => setDeletingItem(false)}>
							Annuler
						</Button>
						<Button
							red
							onClick={() => {
								deleteItem();
								close();
							}}
						>
							Confirmer la suppression
						</Button>
					</>
				) : (
					<>
						<HR />
						<Button red onClick={() => setDeletingItem(true)}>
							Supprimer la tâche
						</Button>
					</>
				))}
		</>
	);
};

export default Item;
