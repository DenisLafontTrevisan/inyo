import React, {Component} from 'react';
import styled from 'react-emotion';
import {withRouter} from 'react-router-dom';
import {Mutation, Query} from 'react-apollo';

import CustomerNameAndAddress from '../CustomerNameAndAddress';
import IssuerNameAndAddress from '../IssuerNameAndAddress';
import InlineEditable from '../InlineEditable';
import ProjectSection from '../ProjectSection';
import ProjectTotal from '../ProjectTotal';
import TasksProgressBar from '../TasksProgressBar';
import {
	UPDATE_PROJECT,
	ADD_SECTION,
	START_PROJECT,
	REMOVE_PROJECT,
} from '../../utils/mutations';
import {GET_USER_INFOS} from '../../utils/queries';
import {
	H1,
	H3,
	FlexRow,
	FlexColumn,
	Button,
	primaryNavyBlue,
	primaryBlue,
	gray20,
	gray10,
	gray50,
	signalRed,
	Loading,
} from '../../utils/content';

import 'react-toastify/dist/ReactToastify.css';

const ProjectDisplayMain = styled('div')`
	min-height: 100vh;
`;

const BackButton = styled(Button)`
	padding: 10px 5px;
	font-size: 11px;
	margin: 10px 0 10px 40px;
	color: ${gray50};
`;

const ProjectDisplayTitle = styled(H1)`
	color: ${primaryNavyBlue};
	margin: 0;
`;

const ProjectSections = styled('div')``;
const SideActions = styled(FlexColumn)`
	min-width: 15vw;
	padding: 20px 40px;
`;
const ProjectName = styled(H3)`
	color: ${primaryBlue};
	margin: 10px 0 20px;
`;
const CenterContent = styled(FlexColumn)`
	background: ${gray10};
	padding: 20px 40px;
`;

const ProjectRow = styled(FlexRow)`
	padding-left: 40px;
	padding-right: 40px;
	padding-top: 10px;
	padding-bottom: ${props => (props.noPadding ? '0px' : '10px')};
	border-bottom: 1px solid ${gray20};
`;

const ProjectContent = styled('div')`
	max-width: 750px;
	width: fill-available;
	margin-left: auto;
	margin-right: auto;
	padding-bottom: 40px;
`;

const ProjectAction = styled(Button)`
	text-decoration: none;
	color: ${props => (props.theme === 'DeleteOutline' ? signalRed : primaryBlue)};
	font-size: 13px;
	transform: translateY(18px);
	margin-top: 10px;
	margin-bottom: 10px;
`;

const ProjectStatus = styled(FlexColumn)`
	span {
		font-size: 13px;
		margin: 5px 20px;
	}
`;

const StartProjectButton = styled(Button)`
	width: auto;
	padding: 0.5em 1em;
	margin-bottom: 0.5em;
`;

class ProjectDisplay extends Component {
	constructor(props) {
		super(props);
		this.state = {
			mode: 'project',
			apolloTriggerRenderTemporaryFix: false,
		};
	}

	getProjectTotal = (project) => {
		let sumDays = 0;

		project.sections.forEach((section) => {
			section.items.forEach((item) => {
				sumDays += item.pendingUnit || item.unit;
			});
		});
		return <ProjectTotal sumDays={sumDays} />;
	};

	render() {
		const {
			project,
			mode,
			startProject,
			editProjectTitle,
			addItem,
			editItem,
			editSectionTitle,
			removeItem,
			removeSection,
			addSection,
			totalItemsFinished,
			totalItems,
			askForInfos,
			timePlanned,
			issuer,
			refetch,
		} = this.props;
		const customerViewMode = this.props.match.params.customerToken;

		return (
			<Query query={GET_USER_INFOS}>
				{({loading, data}) => {
					if (loading) return <Loading />;
					if ((data && data.me) || customerViewMode) {
						return (
							<ProjectDisplayMain>
								{!customerViewMode && (
									<BackButton
										theme="Link"
										size="XSmall"
										onClick={() => this.props.history.push(
											'/app/projects',
										)
										}
									>
										Retour à la liste des projets
									</BackButton>
								)}
								{mode === 'edit' && (
									<ProjectRow justifyContent="space-between">
										<ProjectDisplayTitle>
											Remplissez votre projet
										</ProjectDisplayTitle>
										<Mutation
											mutation={START_PROJECT}
											onError={(error) => {
												if (
													error.message.includes(
														'NEED_MORE_INFOS',
													)
													|| error.message.includes(
														'Missing required data',
													)
												) {
													return askForInfos();
												}
												return false;
											}}
										>
											{StartProject => (
												<StartProjectButton
													theme="Primary"
													size="Medium"
													onClick={() => {
														startProject(
															project.id,
															StartProject,
														);
													}}
												>
													Commencer le project
												</StartProjectButton>
											)}
										</Mutation>
									</ProjectRow>
								)}
								<ProjectRow
									noPadding
									justifyContent="space-between"
								>
									<FlexColumn>
										<ProjectName>
											<Mutation mutation={UPDATE_PROJECT}>
												{updateProject => (
													<InlineEditable
														value={project.name}
														type="text"
														placeholder="Name of the project"
														disabled={
															mode !== 'edit'
														}
														onFocusOut={(value) => {
															editProjectTitle(
																value,
																project.id,
																updateProject,
															);
														}}
													/>
												)}
											</Mutation>
										</ProjectName>
									</FlexColumn>
									{mode === 'see' && (
										<FlexRow>
											<ProjectStatus>
												<span>
													Temps prévu : {timePlanned}
												</span>
											</ProjectStatus>
										</FlexRow>
									)}
								</ProjectRow>
								<FlexRow justifyContent="space-between">
									<CenterContent flexGrow="2">
										<ProjectContent>
											{mode === 'see' && (
												<TasksProgressBar
													tasksCompleted={
														totalItemsFinished
													}
													tasksTotal={totalItems}
												/>
											)}
											<FlexColumn fullHeight>
												<ProjectSections>
													{project.sections.map(
														(section, index) => (
															<ProjectSection
																key={`section${
																	section.id
																}`}
																data={section}
																addItem={
																	addItem
																}
																editItem={
																	editItem
																}
																customerViewMode={
																	customerViewMode
																}
																mode={mode}
																editSectionTitle={
																	editSectionTitle
																}
																removeItem={
																	removeItem
																}
																removeSection={
																	removeSection
																}
																sectionIndex={
																	index
																}
																defaultDailyPrice={
																	!customerViewMode
																	&& data.me
																		.defaultDailyPrice
																}
																refetch={
																	refetch
																}
																projectStatus={
																	project.status
																}
															/>
														),
													)}
													{mode === 'edit' && (
														<Mutation
															mutation={
																ADD_SECTION
															}
														>
															{AddSection => (
																<ProjectAction
																	theme="Link"
																	size="XSmall"
																	onClick={() => {
																		addSection(
																			project.id,
																			AddSection,
																		);
																	}}
																>
																	Ajouter une
																	section
																</ProjectAction>
															)}
														</Mutation>
													)}
												</ProjectSections>
											</FlexColumn>
										</ProjectContent>
									</CenterContent>
									<SideActions justifyContent="space-between">
										<div>
											{issuer.name && (
												<IssuerNameAndAddress
													issuer={issuer}
												/>
											)}
											<CustomerNameAndAddress
												customer={project.customer}
											/>
											{this.getProjectTotal(
												project,
												customerViewMode
													? project.issuer.owner
														.defaultVatRate
													: data.me.defaultVatRate,
											)}
										</div>
										{mode === 'edit' && (
											<Mutation mutation={REMOVE_PROJECT}>
												{RemoveProject => (
													<ProjectAction
														theme="DeleteOutline"
														size="XSmall"
														type="delete"
														onClick={() => {
															this.props.removeProject(
																project.id,
																RemoveProject,
															);
														}}
													>
														Supprimer le brouillon
													</ProjectAction>
												)}
											</Mutation>
										)}
									</SideActions>
								</FlexRow>
							</ProjectDisplayMain>
						);
					}
					return false;
				}}
			</Query>
		);
	}
}

export default withRouter(ProjectDisplay);