import styled from '@emotion/styled';
import React from 'react';
import {
	Redirect, Route, Switch, useParams,
} from 'react-router-dom';

import CustomEmailSidebar from '../../../components/CustomEmailSidebar';
import EmailCustomizer from '../../../components/EmailCustomizer';
import fbt from '../../../fbt/fbt.macro';
import {BREAKPOINTS} from '../../../utils/constants';
import {FlexRow, Loading} from '../../../utils/content';
import {Container, Heading, HeadingRow} from '../../../utils/new/design-system';
import useEmailData from '../../../utils/useEmailData';

const EmailContainer = styled('div')`
	flex: 1;
	max-width: 1200px;
	margin: 3.5rem auto;

	@media (max-width: ${BREAKPOINTS.mobile}px) {
		margin: 0 auto 3.5rem auto;
	}
`;

const Main = styled('div')`
	min-height: 100vh;
	display: flex;
	flex: 1;
	padding-bottom: 100px;

	@media (max-width: ${BREAKPOINTS.mobile}px) {
		padding: 1rem;
	}
`;

const FlexRowContainer = styled(FlexRow)`
	@media (max-width: ${BREAKPOINTS.mobile}px) {
		flex-direction: column;
	}
`;

const CustomizeEmailRoute = () => {
	const {categories, error} = useEmailData();

	if (!categories) {
		return (
			<Container>
				<Main>
					<Loading />
				</Main>
			</Container>
		);
	}
	if (error) throw error;

	return (
		<Container>
			<Main>
				<Switch>
					<Route path="/app/emails/:category/:type">
						<CustomizeEmail categories={categories} />
					</Route>
					<Redirect
						to={`/app/emails/${categories[0].name}/${categories[0].types[0].name}`}
					/>
				</Switch>
			</Main>
		</Container>
	);
};

const CustomizeEmail = ({categories}) => {
	const {category: categoryParam, type: typeParam} = useParams();

	const catSelected
		= categories.find(c => c.name === categoryParam) || categories[0];
	const emailType
		= catSelected.types.find(t => t.name === typeParam)
		|| catSelected.types[0];

	// This will change depending on the email type
	//
	return (
		<EmailContainer>
			<HeadingRow>
				<Heading>
					<fbt project="inyo" desc="emails">
						Modèles d'emails
					</fbt>
				</Heading>
			</HeadingRow>
			<FlexRowContainer>
				<CustomEmailSidebar categories={categories} />
				<EmailCustomizer
					emailType={emailType}
					emailTypeId={emailType.id}
				/>
			</FlexRowContainer>
		</EmailContainer>
	);
};

export default CustomizeEmailRoute;
