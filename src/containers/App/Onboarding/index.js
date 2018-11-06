import React, {Component} from 'react';
import styled from 'react-emotion';
import {Query} from 'react-apollo';
import {Redirect} from 'react-router-dom';
import OnboardingFirstStep from '../../../components/Onboarding/onboarding-first-step';
import OnboardingSecondStep from '../../../components/Onboarding/onboarding-second-step';
import OnboardingThirdStep from '../../../components/Onboarding/onboarding-third-step';
import OnboardingFourthStep from '../../../components/Onboarding/onboarding-fourth-step';
import OnboardingFifthStep from '../../../components/Onboarding/onboarding-fifth-step';
import {GET_USER_INFOS} from '../../../utils/queries';

import {gray20, signalGreen} from '../../../utils/content';

const OnboardingMain = styled('div')`
	max-width: 650px;
	margin-left: auto;
	margin-right: auto;
	margin-top: 100px;
`;

const OnboardingProgressBar = styled('div')`
	background: ${gray20};
	position: relative;
	height: 5px;
	width: 100%;
	margin-bottom: 15px;

	&:after {
		position: absolute;
		top: 0;
		left: 0;
		content: ' ';
		width: ${props => props.completionRate || 0}%;
		height: 100%;
		background: ${signalGreen};
		transition: width 0.2s ease;
	}
`;

const Loading = styled('div')`
	font-size: 30px;
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
`;

class Onboarding extends Component {
	constructor(props) {
		super(props);
		this.state = {
			step: 1,
		};
	}

	getNextStep = () => this.setState({step: this.state.step + 1});

	getPreviousStep = () => this.setState({step: this.state.step - 1});

	getStepData = (step, me) => {
		switch (step) {
		case 0:
			return <Redirect to="/auth" />;
		case 1:
			return (
				<OnboardingFirstStep
					me={me}
					step={step}
					getNextStep={this.getNextStep}
					getPreviousStep={this.getPreviousStep}
				/>
			);
		case 2:
			return (
				<OnboardingSecondStep
					me={me}
					step={step}
					getNextStep={this.getNextStep}
					getPreviousStep={this.getPreviousStep}
				/>
			);
		case 3:
			return (
				<OnboardingThirdStep
					me={me}
					step={step}
					getNextStep={this.getNextStep}
					getPreviousStep={this.getPreviousStep}
				/>
			);
		case 4:
			return (
				<OnboardingFourthStep
					me={me}
					step={step}
					getNextStep={this.getNextStep}
					getPreviousStep={this.getPreviousStep}
				/>
			);
		case 5:
			return (
				<OnboardingFifthStep
					me={me}
					step={step}
					getNextStep={this.getNextStep}
					getPreviousStep={this.getPreviousStep}
				/>
			);
		case 6:
			return <Redirect to="/app" />;
		}
	};

	render() {
		const {step} = this.state;

		return (
			<Query query={GET_USER_INFOS}>
				{({loading, data}) => {
					if (loading) return <Loading>Chargement...</Loading>;
					if (data && data.me) {
						const {me} = data;

						return (
							<OnboardingMain>
								<OnboardingProgressBar
									completionRate={((step - 1) / 5) * 100}
								/>
								{this.getStepData(step, me)}
							</OnboardingMain>
						);
					}
					return <Redirect to="/auth" />;
				}}
			</Query>
		);
	}
}

export default Onboarding;