import styled from '@emotion/styled';
import {Formik} from 'formik';
import React from 'react';
import {useMutation} from 'react-apollo-hooks';
import * as Yup from 'yup';

import fbt from '../../fbt/fbt.macro';
import {BREAKPOINTS} from '../../utils/constants';
import {gray20} from '../../utils/content';
import illus from '../../utils/images/bermuda-hello-edwige.svg';
import {UPDATE_USER_SETTINGS} from '../../utils/mutations';
import {Button} from '../../utils/new/design-system';
import FormElem from '../FormElem';

const UserDataFormMain = styled('div')``;

const ProfileSection = styled('div')`
	padding: 60px 40px;
	border: 1px solid ${gray20};
	display: flex;
	align-items: center;

	@media (max-width: ${BREAKPOINTS}px) {
		flex-direction: column;
		padding: 0;
		border: none;
	}
`;

const UpdateButton = styled(Button)`
	display: block;
	margin-top: 15px;
	margin-left: auto;
	margin-right: 50px;
	margin-bottom: 80px;

	@media (max-width: ${BREAKPOINTS}px) {
		margin-right: 0;
		margin-bottom: 20px;
	}
`;

const Illus = styled('img')`
	width: 44%;
	margin-right: 2rem;

	@media (max-width: ${BREAKPOINTS}px) {
		margin-right: 0;
	}
`;

const UserAssistantForm = ({defaultAssistantName, done}) => {
	const [updateUserSettings] = useMutation(UPDATE_USER_SETTINGS);

	return (
		<UserDataFormMain>
			<Formik
				initialValues={{
					assistantName: defaultAssistantName,
				}}
				validationSchema={Yup.object().shape({
					assistantName: Yup.string().required(
						<fbt project="inyo" desc="required">
							Requis
						</fbt>,
					),
				})}
				onSubmit={async (values, actions) => {
					actions.setSubmitting(true);

					await updateUserSettings({
						variables: {
							settings: values,
						},
					});

					done();

					actions.setSubmitting(false);
				}}
			>
				{props => (
					<form onSubmit={props.handleSubmit}>
						<ProfileSection>
							<Illus src={illus} />
							<FormElem
								{...props}
								name="assistantName"
								label={
									<fbt project="inyo" desc="assistant name">
										Nom de l'assistant
									</fbt>
								}
								placeholder="Edwige"
								padded
								required
							/>
						</ProfileSection>
						<UpdateButton type="submit" big>
							<fbt project="inyo" desc="update">
								Mettre à jour
							</fbt>
						</UpdateButton>
					</form>
				)}
			</Formik>
		</UserDataFormMain>
	);
};

export default UserAssistantForm;
