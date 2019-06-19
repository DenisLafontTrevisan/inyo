import PropTypes from 'prop-types';
import React from 'react';
import {useMutation} from 'react-apollo-hooks';

import Task from '../TasksList/task';
import {ModalContainer, ModalElem} from '../../utils/content';
import {P, Button} from '../../utils/new/design-system';
import {UNFOCUS_TASK} from '../../utils/mutations';

const RescheduleModal = ({tasks}) => {
	const unfocusTask = useMutation(UNFOCUS_TASK);

	return (
		<ModalContainer noClose>
			<ModalElem>
				<P>
					Il semblerait qu'il y ait des tâches prévues les jours
					précédents que vous n'avez pas validées ou déplacées.
				</P>
				{tasks.map(task => (
					<Task item={task} baseUrl="dashboard" />
				))}
				<Button
					onClick={() => tasks.forEach(task => unfocusTask({
						variables: {
							itemId: task.id,
						},
					}))
					}
				>
					Tout remettre dans la liste
				</Button>
			</ModalElem>
		</ModalContainer>
	);
};

RescheduleModal.propTypes = {
	tasks: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.id,
		}),
	),
	onReschedule: PropTypes.func,
};

export default RescheduleModal;