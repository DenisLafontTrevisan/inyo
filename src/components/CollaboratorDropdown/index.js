import styled from '@emotion/styled';
import React, {useCallback} from 'react';

import fbt from '../../fbt/fbt.macro';
import {useMutation} from '../../utils/apollo-hooks';
import {BREAKPOINTS} from '../../utils/constants';
import {formatName} from '../../utils/functions';
import {ASSIGN_TO_TASK, REMOVE_ASSIGNMENT_TO_TASK} from '../../utils/mutations';
import {
	accentGrey,
	CollaboratorLineRow,
	GenericDropdown,
	primaryPurple,
	primaryWhite,
} from '../../utils/new/design-system';
import CollaboratorAvatar from '../CollaboratorAvatar';
import IconButton from '../IconButton';
import Tooltip from '../Tooltip';

const Actions = styled('div')`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-end;
	flex: 1;
	margin-left: 1rem;

	* ~ * {
		margin-left: 0.2rem;
	}

	@media (max-width: ${BREAKPOINTS.mobile}px) {
		flex-direction: column-reverse;
		justify-content: flex-start;

		* ~ * {
			margin-left: 0;
			margin-bottom: 0.5rem;
		}
	}
`;

const CollaboratorDropdownElem = styled(GenericDropdown)`
	min-width: 250px;
`;

const DropdownCollaboratorLineRow = styled(CollaboratorLineRow)`
	margin: 0rem 0.25rem;
	padding: 0.25rem;
	cursor: pointer;

	&:first-of-type {
		margin-top: 0.25rem;
	}

	&:last-of-type {
		margin-bottom: 0.25rem;
	}

	${props => props.active
		&& `
		background: ${primaryPurple};
		color: ${primaryWhite};
	`}

	&:hover {
		background: ${primaryPurple};
		color: ${primaryWhite};
	}
`;

function CollaboratorLine({taskId, collaborator, active}) {
	const [assignToTask] = useMutation(ASSIGN_TO_TASK);
	const [removeAssignmentToTask] = useMutation(REMOVE_ASSIGNMENT_TO_TASK);
	const assignOrUnassign = useCallback(() => {
		if (active) {
			removeAssignmentToTask({
				variables: {
					taskId,
					collaboratorId: collaborator.id,
				},
				optimisticResponse: {
					removeAssignmentToTask: {
						id: taskId,
						assignee: undefined,
					},
				},
			});
		}
		else {
			assignToTask({
				variables: {
					taskId,
					collaboratorId: collaborator.id,
				},
				optimisticResponse: {
					assignToTask: {
						id: taskId,
						assignee: {
							...collaborator,
						},
					},
				},
			});
		}
	}, [active, collaborator]);

	return (
		<DropdownCollaboratorLineRow
			active={active}
			onMouseUp={assignOrUnassign}
		>
			<CollaboratorAvatar collaborator={collaborator} size={50} />
			<div>
				{formatName(collaborator.firstName, collaborator.lastName)}
			</div>
			{active && (
				<Actions>
					<IconButton icon="close" size="tiny" invert />
				</Actions>
			)}
		</DropdownCollaboratorLineRow>
	);
}

function CollaboratorDropdown({collaborators = [], assignee, taskId}) {
	return (
		<CollaboratorDropdownElem>
			{collaborators.length > 0
				&& collaborators.map(collab => (
					<CollaboratorLine
						key={collab.id}
						collaborator={collab}
						active={assignee && assignee.id === collab.id}
						taskId={taskId}
					/>
				))}
			{collaborators.length === 0 && (
				<div style={{padding: '1rem', color: accentGrey}}>
					<fbt project="inyo" desc="missing collaborator on project">
						Vous devez d'abord ajouter
					</fbt>
					<br />
					<fbt project="inyo" desc="missing collaborator on project">
						un collaborateur au projet.
					</fbt>
				</div>
			)}
		</CollaboratorDropdownElem>
	);
}

export default CollaboratorDropdown;
