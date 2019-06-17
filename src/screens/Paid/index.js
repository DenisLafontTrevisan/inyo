import React from 'react';
import styled from '@emotion/styled';

import Illus from '../../utils/images/bermuda-done.svg';
import {ButtonLink, P} from '../../utils/new/design-system';
import {FlexRow, FlexColumn} from '../../utils/content';

const Container = styled('div')`
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 800px;
`;

const IllusForPaying = styled('img')`
	height: 330px;
`;

const Column = styled(FlexColumn)`
	width: 400px;
	margin-left: 2rem;
	justify-content: center;
`;

function Paid({user}) {
	if (user && user.me) {
		return (
			<Container>
				<FlexRow>
					<IllusForPaying src={Illus} />
					<Column>
						<P>Merci pour votre achat..</P>
						<ButtonLink to="app/dashboard">
							Retourner au dashboard
						</ButtonLink>
					</Column>
				</FlexRow>
			</Container>
		);
	}

	return (
		<Container>
			<FlexRow>
				<IllusForPaying src={Illus} />
				<Column>
					<P>
						Merci pour votre achat. Pour utiliser Inyo vous devez
						vous connecter.
					</P>
					<ButtonLink to="auth/sign-in">Se connecter</ButtonLink>
				</Column>
			</FlexRow>
		</Container>
	);
}

export default Paid;