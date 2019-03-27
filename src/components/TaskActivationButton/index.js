import React from 'react';
import {useMutation} from 'react-apollo-hooks';

import BistableButton from '../BistableButton';

import {FOCUS_TASK, UNFOCUS_TASK} from '../../utils/mutations';

const TaskActivationButton = ({
	customerToken, taskId, isActive, disabled,
}) => {
	const focusItem = useMutation(FOCUS_TASK);
	const unfocusItem = useMutation(UNFOCUS_TASK);

	return (
		<BistableButton
			white={!isActive}
			value={isActive}
			disabled={disabled}
			trueLabel="Cette tâche est prévu pour aujourd'hui"
			trueTooltip="Enlever la tâche des choses à faire aujourd'hui"
			falseLabel="Je fais cette tâche aujourd'hui"
			falseTooltip="Ajouter la tâche aux choses à faire aujourd'hui"
			commit={focusItem}
			reverse={unfocusItem}
			variables={{itemId: taskId, token: customerToken}}
		/>
	);
};

export default TaskActivationButton;
