import React, {useState, useRef} from 'react';
import {withRouter} from 'react-router-dom';
import styled from '@emotion/styled';
import {useQuery, useMutation} from 'react-apollo-hooks';
import moment from 'moment';
import useOnClickOutside from 'use-onclickoutside';
import ReactTooltip from 'react-tooltip';

import {
	Aside,
	SubHeading,
	Button,
	primaryPurple,
	primaryRed,
	primaryBlack,
	primaryGrey,
	lightGrey,
	accentGrey,
	P,
} from '../../utils/new/design-system';
import {ModalContainer} from '../../utils/content';

import {ReactComponent as EyeIcon} from '../../utils/icons/eye.svg';
import Pencil2, {ReactComponent as Pencil} from '../../utils/icons/pencil.svg';
import {ReactComponent as TasksIcon} from '../../utils/icons/tasks-icon.svg';
import {ReactComponent as SharedNotesIcon} from '../../utils/icons/shared-notes-icon.svg';
import {ReactComponent as PersonalNotesIcon} from '../../utils/icons/personal-notes-icon.svg';
import {ReactComponent as TrashIcon} from '../../utils/icons/trash-icon.svg';
import {ReactComponent as ArchiveIcon} from '../../utils/icons/archive-icon.svg';
import {ReactComponent as UnarchiveIcon} from '../../utils/icons/unarchive-icon.svg';
import noClientIllus from '../../utils/images/bermuda-page-not-found.svg';
import noNotificationsIllus from '../../utils/images/bermuda-no-comments.svg';
import {GET_PROJECT_INFOS} from '../../utils/queries';
import {
	UPDATE_PROJECT,
	ARCHIVE_PROJECT,
	UNARCHIVE_PROJECT,
	REMOVE_PROJECT,
} from '../../utils/mutations';
import {TOOLTIP_DELAY, BREAKPOINTS} from '../../utils/constants';

import ConfirmModal from '../ConfirmModal';
import RemoveProjectButton from '../RemoveProjectButton';
import CreateProjectLinkButton from '../CreateProjectLinkButton';
import CustomerNameAndAddress from '../CustomerNameAndAddress';
import CustomerModalAndMail from '../CustomerModalAndMail';
import StaticCustomerView from '../StaticCustomerView';
import DuplicateProjectButton from '../DuplicateProjectButton';
import DateInput from '../DateInput';
import Plural from '../Plural';

const ProjectMenuIcon = styled('div')`
	margin: 0 10px -3px 0;

	svg {
		fill: ${primaryPurple};
	}
`;

const SubSection = styled('div')`
	margin-bottom: 2rem;

	@media (max-width: ${BREAKPOINTS}px) {
		margin-bottom: 1rem;
	}
`;

const Actions = styled('div')`
	margin-bottom: 1rem;
`;

const ClientPreviewIcon = styled(EyeIcon)`
	vertical-align: middle;
	margin-top: -2px;
	width: 16px;
	margin-right: 10px;
	margin-left: 4px;
`;

const PreviewModal = styled(ModalContainer)`
	min-height: 500px;
	padding: 0;
`;

const Notice = styled(P)`
	color: #fff;
	background: ${primaryPurple};
	padding: 10px;
	text-align: center;
	margin: 0;
`;

const CheckBoxLabel = styled('label')`
	font-size: 13px;
	margin: 0.5em 0;
	color: ${primaryPurple};
	cursor: pointer;

	input[type='checkbox'] {
		margin-left: 0.5em;
		margin-right: 0.9em;
		margin-top: -1px;
	}
`;

const BigNumber = styled(P)`
	font-size: 20px;
	font-weight: 500;
	color: ${props => (props.urgent ? primaryRed : primaryGrey)};
`;

const DateContainer = styled('div')`
	position: relative;

	p:hover {
		cursor: pointer;

		&:before {
			content: '';
			display: block;
			background: ${lightGrey};
			position: absolute;
			left: -0.5rem;
			top: -0.5rem;
			right: -0.5rem;
			bottom: -0.5rem;
			border-radius: 8px;
			z-index: -1;
		}
		&:after {
			content: '';
			display: block;
			background-color: ${accentGrey};
			mask-size: 35%;
			mask-position: center;
			mask-repeat: no-repeat;
			mask-image: url(${Pencil2});
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			width: 50px;
		}
	}
`;

const SidebarLink = styled('div')`
	display: inline-flex;
	align-items: center;
	color: ${props => (props.active ? primaryBlack : primaryPurple)};
	text-decoration: none;
	font-weight: 500;
	margin-bottom: 0.8rem;
	cursor: ${props => (props.active ? 'default' : 'pointer')};
	position: relative;
	max-width: calc(100% - 2rem);

	${props => props.active
		&& `&:before {
			content: '';
			display: 'block';
			background: ${lightGrey};
			position: absolute;
			left: -0.5rem;
			top: -0.5rem;
			right: -1rem;
			bottom: -0.5rem;
			border-radius: 8px;
			z-index: -1;
		}

		svg {
			fill: ${primaryBlack} !important;
		}`}

	&:hover {
		&:before {
			content: '';
			display: 'block';
			background: ${lightGrey};
			position: absolute;
			left: -0.5rem;
			top: -0.5rem;
			right: -1rem;
			bottom: -0.5rem;
			border-radius: 8px;
			z-index: -1;
		}
		color: ${primaryBlack};
		svg {
			fill: ${primaryBlack};
		}
	}

	@media (max-width: ${BREAKPOINTS}px) {
		display: flex;
	}
`;

const SidebarHeading = styled(SubHeading)`
	display: flex;
	justify-content: space-between;
	margin-bottom: 10px;
`;

const Illus = styled('img')`
	max-width: 80%;
	max-height: 200px;
	margin: 1rem auto;
`;

const PencilElem = styled(Pencil)`
	cursor: pointer;
	width: 15px;
	margin-top: -2px;
`;

const SidebarProjectInfos = ({
	projectId,
	hasClientAttributedTasks,
	history,
	location,
}) => {
	const query = new URLSearchParams(location.search);
	const activeView = query.get('view');
	const [isEditingCustomer, setEditCustomer] = useState(false);
	const [editDueDate, setEditDueDate] = useState(false);
	const [isCustomerPreviewOpen, setCustomerPreview] = useState(false);
	const [askNotifyActivityConfirm, setAskNotifyActivityConfirm] = useState(
		{},
	);
	const updateProject = useMutation(UPDATE_PROJECT);
	const archiveProject = useMutation(ARCHIVE_PROJECT);
	const unarchiveProject = useMutation(UNARCHIVE_PROJECT);
	const removeProject = useMutation(REMOVE_PROJECT);
	const {data, error} = useQuery(GET_PROJECT_INFOS, {
		variables: {projectId},
		suspend: true,
	});

	const dateRef = useRef();

	useOnClickOutside(dateRef, () => {
		setEditDueDate(false);
	});

	if (error) throw error;

	const {project} = data;
	const isArchived = project.status === 'ARCHIVED';

	function setView(view) {
		const newQuery = new URLSearchParams(location.search);

		newQuery.delete('filter');
		newQuery.set('view', view);
		history.push(`/app/tasks/?${newQuery.toString()}`);
	}

	const timeItTookPending = project.sections.reduce(
		(sectionsSum, section) => sectionsSum
			+ section.items.reduce((itemsSum, item) => itemsSum + item.unit, 0),
		0,
	);
	const margin = project.daysUntilDeadline - timeItTookPending;

	return (
		<Aside>
			<ReactTooltip effect="solid" delayShow={TOOLTIP_DELAY} />
			<SubSection>
				<SidebarHeading>Menu Projet</SidebarHeading>
				<SidebarLink
					data-tip="Vue principale"
					onClick={() => setView('tasks')}
					active={activeView === 'tasks' || !activeView}
				>
					<ProjectMenuIcon>
						<TasksIcon />
					</ProjectMenuIcon>
					Tâches du projet
				</SidebarLink>
				<SidebarLink
					data-tip="Seulement visibles par vous"
					onClick={() => setView('personal-notes')}
					active={activeView === 'personal-notes'}
				>
					<ProjectMenuIcon>
						<PersonalNotesIcon />
					</ProjectMenuIcon>
					Notes personnelles
				</SidebarLink>
				<SidebarLink
					data-tip="Visibles par tout le monde"
					onClick={() => setView('shared-notes')}
					active={activeView === 'shared-notes'}
				>
					<ProjectMenuIcon>
						<SharedNotesIcon />
					</ProjectMenuIcon>
					Notes partagées
				</SidebarLink>
			</SubSection>
			<SubSection>
				<SidebarHeading>
					Votre client
					{project.customer && (
						<PencilElem
							data-tip="Changer le client lié au projet"
							onClick={() => setEditCustomer(true)}
						/>
					)}
				</SidebarHeading>
				{project.customer ? (
					<>
						<CustomerNameAndAddress customer={project.customer} />
						<CheckBoxLabel data-tip="Évolution du projet, tâches qui requièrent une action, etc.">
							<input
								type="checkbox"
								checked={project.notifyActivityToCustomer}
								onChange={async () => {
									if (project.notifyActivityToCustomer) {
										const confirmed = await new Promise(
											resolve => setAskNotifyActivityConfirm({
												resolve,
											}),
										);

										setAskNotifyActivityConfirm({});

										if (!confirmed) {
											return;
										}
									}

									await updateProject({
										variables: {
											projectId: project.id,
											notifyActivityToCustomer: !project.notifyActivityToCustomer,
										},
									});
								}}
							/>
							Notifier mon client par email
						</CheckBoxLabel>
						{askNotifyActivityConfirm.resolve && (
							<ConfirmModal
								onConfirm={confirmed => askNotifyActivityConfirm.resolve(confirmed)
								}
								closeModal={() => askNotifyActivityConfirm.resolve(false)
								}
							>
								<Illus src={noNotificationsIllus} />
								<P>
									En décochant cette option, votre client ne
									recevra aucune notification de l'avancée de
									votre projet.
								</P>
								{hasClientAttributedTasks && (
									<P>
										Cependant, certaines des tâches sont
										attribuées à votre client et nécessitent
										l'envoi d'emails à celui-ci. Désactiver
										les notifications changera aussi
										l'attribution de ces tâches et votre
										client n'en sera pas averti.
									</P>
								)}
								<P>Êtes-vous sûr de vouloir continuer?</P>
							</ConfirmModal>
						)}
						<Button
							data-tip="Ce que verra votre client lorsqu'il se connecte au projet"
							link
							onClick={() => setCustomerPreview(true)}
						>
							<ClientPreviewIcon />
							<span>Voir la vue de mon client</span>
						</Button>
					</>
				) : (
					<>
						<Button icon="+" onClick={() => setEditCustomer(true)}>
							Ajouter un client
						</Button>
						<Illus src={noClientIllus} />
					</>
				)}

				{isEditingCustomer && (
					<CustomerModalAndMail
						onValidate={async (customer) => {
							if (
								project.customer
								&& project.customer.id === customer.id
							) {
								return project;
							}

							const updatedProject = await updateProject({
								variables: {
									projectId: project.id,
									customerId: customer.id,
								},
							});

							return updatedProject;
						}}
						selectedCustomerId={
							project.customer && project.customer.id
						}
						onDismiss={() => setEditCustomer(false)}
					/>
				)}
			</SubSection>

			{isCustomerPreviewOpen && (
				<PreviewModal
					size="large"
					onDismiss={() => setCustomerPreview(false)}
				>
					<Notice>
						Cette vue est celle que verra votre client lorsqu'il
						devra effectuer des actions.
					</Notice>
					<StaticCustomerView projectId={project.id} />
				</PreviewModal>
			)}

			<SubSection>
				<SidebarHeading>Deadline</SidebarHeading>
				<DateContainer>
					{project.deadline ? (
						<BigNumber
							data-tip="Date limite du projet"
							onClick={() => setEditDueDate(true)}
						>
							{(project.deadline
								&& moment(project.deadline).format(
									'DD/MM/YYYY',
								)) || <>&mdash;</>}
						</BigNumber>
					) : (
						<Button icon="+" onClick={() => setEditDueDate(true)}>
							Ajouter une deadline
						</Button>
					)}
					{editDueDate && (
						<DateInput
							innerRef={dateRef}
							date={moment(project.deadline || new Date())}
							onDateChange={(date) => {
								updateProject({
									variables: {
										projectId: project.id,
										deadline: date.toISOString(),
									},
									optimisticResponse: {
										__typename: 'Mutation',
										updateProject: {
											__typename: 'Project',
											...project,
											dueDate: date.toISOString(),
										},
									},
								});
								setEditDueDate(false);
							}}
							duration={project.total}
							position="right"
						/>
					)}
				</DateContainer>
			</SubSection>

			{project.daysUntilDeadline !== null && (
				<SubSection>
					<SubHeading>Marge jours restants</SubHeading>
					<BigNumber
						data-tip="Nombre de jours travaillés avant deadline"
						urgent={margin < 1}
					>
						{margin}&nbsp;
						<Plural value={margin} singular="jour" plural="jours" />
					</BigNumber>
				</SubSection>
			)}

			<div>
				<Actions>
					<DuplicateProjectButton
						data-tip="Copier ces tâches dans un nouveau projet"
						projectId={project.id}
						onCreate={({id}) => history.push(`/app/tasks?projectId=${id}`)
						}
					>
						Dupliquer le projet
					</DuplicateProjectButton>
				</Actions>
				<Actions>
					<CreateProjectLinkButton project={project} />
				</Actions>
				<Actions>
					{isArchived ? (
						<Button
							onClick={() => unarchiveProject({
								variables: {
									projectId: project.id,
								},
							})
							}
						>
							<UnarchiveIcon /> Désarchiver le projet
						</Button>
					) : (
						<Button
							onClick={() => archiveProject({
								variables: {
									projectId: project.id,
								},
							})
							}
						>
							<ArchiveIcon /> Archiver le projet
						</Button>
					)}
				</Actions>
				<Actions>
					<RemoveProjectButton
						red
						projectId={project.id}
						onRemove={() => history.push('/app/projects')}
					>
						<TrashIcon /> Supprimer le projet
					</RemoveProjectButton>
				</Actions>
			</div>
		</Aside>
	);
};

export default withRouter(SidebarProjectInfos);
