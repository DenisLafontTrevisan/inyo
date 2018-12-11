import React, {Component} from 'react';
import styled from 'react-emotion';

import Plural from '../Plural';
import {
	H4, H6, gray20, primaryNavyBlue,
} from '../../utils/content';

const TotalMain = styled('div')`
	margin-top: 10px;
`;
const TotalElem = styled('div')`
	padding-top: 15px;
	padding-bottom: 15px;
`;
const TotalLabel = styled(H6)`
	font-size: 13px;
	margin: 0;
	margin-bottom: 10px;
	text-transform: uppercase;
`;
const TotalNumber = styled(H4)`
	color: ${primaryNavyBlue};
	margin: 0;
`;

class ProjectTotal extends Component {
	render() {
		const {sumDays} = this.props;

		return (
			<TotalMain>
				<TotalElem>
					<TotalLabel>Temps prévu</TotalLabel>
					<TotalNumber>
						{sumDays.toLocaleString()}{' '}
						<Plural
							singular="jour"
							plural="jours"
							value={sumDays}
						/>
					</TotalNumber>
				</TotalElem>
			</TotalMain>
		);
	}
}

export default ProjectTotal;