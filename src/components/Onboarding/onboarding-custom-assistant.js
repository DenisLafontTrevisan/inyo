import styled from '@emotion/styled';
import React, {useState} from 'react';
import {useMutation} from 'react-apollo-hooks';

import fbt from '../../fbt/fbt.macro';
import {
	Button, gray50, H4, P,
} from '../../utils/content';
import illus from '../../utils/images/bermuda-hello-edwige.svg';
import {UPDATE_USER_SETTINGS} from '../../utils/mutations';
import {Input} from '../../utils/new/design-system';

const OnboardingStep = styled('div')`
	display: flex;
	flex-direction: column;
`;

const StepSubtitle = styled(H4)`
	text-align: center;
`;

const StepDescription = styled(P)`
	text-align: center;
	color: ${gray50};
	font-size: 15px;
`;

const Illus = styled('img')`
	height: 250px;
`;

const Form = styled('form')`
	display: flex;
	flex-direction: horizontal;
`;

const NameInput = styled(Input)`
	background: white;
	border-radius: 0;
	padding: 0.7rem 1rem;
	flex: 1;
	border: 1px solid ${gray50};
	margin-right: 1rem;
`;

const ActionButton = styled(Button)`
	width: 200px;
	margin: auto;
`;

const OnboardingCustomAssistant = ({
	me,
	getNextStep,
	getPreviousStep,
	isFirstStep,
}) => {
	const [updateUserSettings] = useMutation(UPDATE_USER_SETTINGS);
	const [assistantName, setAssistantName] = useState('Edwige');

	const hasValidName = !!assistantName.trim();

	return (
		<OnboardingStep>
			<StepSubtitle>
				<fbt project="inyo" desc="onboarding assistant title 1st">
					Comment souhaitez-vous appeler
				</fbt>
				<br />
				<fbt project="inyo" desc="onboarding assistant title 2nd">
					votre assistant·e ?
				</fbt>
			</StepSubtitle>

			<Illus src={illus} />

			<StepDescription>
				<fbt project="inyo" desc="onboarding assistant description">
					Lorsque nous notifierons vos clients d'une tâche à réaliser,
					d'un commentaire, etc. ce sera le prénom utilisé pour signer
					les emails.
				</fbt>
			</StepDescription>

			<Form
				onSubmit={async (e) => {
					e.preventDefault();

					if (!hasValidName) return;

					await updateUserSettings({
						variables: {
							settings: {assistantName},
						},
					});

					getNextStep();
				}}
			>
				<NameInput
					big
					type="text"
					placeholder="Edwige"
					name="name"
					onChange={(e) => {
						setAssistantName(e.target.value);
					}}
					value={assistantName}
				/>

				<ActionButton
					type="submit"
					theme={hasValidName ? 'Primary' : 'Disabled'}
					size="Medium"
				>
					<fbt project="inyo" desc="confirm onboarding assistant">
						Valider
					</fbt>
				</ActionButton>
			</Form>

			{!isFirstStep && (
				<ActionButton theme="Link" onClick={getPreviousStep}>
					{'< '}
					<fbt project="inyo" desc="back onboarding assistant">
						Retour
					</fbt>
				</ActionButton>
			)}
		</OnboardingStep>
	);
};

export default OnboardingCustomAssistant;
