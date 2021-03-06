import styled from '@emotion/styled';
import * as Sentry from '@sentry/browser';
import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';

import fbt from '../fbt/fbt.macro';
import {FlexRow} from '../utils/content';
import {ReactComponent as AppLogo} from '../utils/icons/appLogo.svg';
import errorIllus from '../utils/images/bermuda-fatal-error.svg';
import {
	Heading,
	lightRed,
	primaryBlack,
	primaryPurple,
} from '../utils/new/design-system';

const ReporterMain = styled('div')`
	padding: 20px 40px;
`;

const ReporterRow = styled(FlexRow)`
	flex-direction: column;
	padding: 5%;
`;

const ErrorTitle = styled(Heading)`
	color: ${primaryPurple};
`;

const ErrorText = styled('div')`
	margin: 0 auto;
	max-width: 960px;
	font-size: 1rem;
	line-height: 1.6;
	color: ${primaryBlack};
	text-align: center;
`;

const Illus = styled('img')`
	height: 30vh;
	margin-bottom: 2rem;
`;

const ErrorCode = styled('pre')`
	background: ${lightRed};
	border-radius: 8px;
	padding: 1rem;
	margin: 1.5rem 0;
	display: block;
	overflow: auto;
`;

const A = styled('a')`
	font-size: inherit;
	color: ${primaryPurple};
	cursor: pointer;
`;

const LinkButton = styled(Link)`
	font-size: 14px;
	font-weight: 500;
	padding: 0.8rem 1.6rem;
	color: ${primaryPurple};
	border: 1px solid ${primaryPurple};
	border-radius: 30px;
	cursor: pointer;
	text-decoration: none;

	&:hover {
		background-color: ${primaryPurple};
		color: white;
	}
`;

class SentryReporter extends Component {
	constructor(props) {
		super(props);
		this.state = {error: null};
	}

	componentDidCatch(error, errorInfo) {
		this.setState({error});
		Sentry.withScope((scope) => {
			Object.keys(errorInfo).forEach((key) => {
				scope.setExtra(key, errorInfo[key]);
			});
			Sentry.captureException(error);
		});
	}

	render() {
		const {error} = this.state;

		if (
			error
			&& (error.message.includes('Loading chunk')
				|| error.message.includes('Loading CSS chunk'))
		) {
			return (
				<ReporterMain>
					<AppLogo />
					<ReporterRow>
						<Illus src={errorIllus} />
						<ErrorText>
							<ErrorTitle>
								<fbt desc="Update error page title">
									Erreur de chargement
								</fbt>
							</ErrorTitle>
							<p>
								<fbt desc="Update error page message">
									Cette erreur peut survenir lorsque
									l'application vient d'être mise à jour,
									merci de recharger la page.
									<fbt:param name="br">
										<br />
									</fbt:param>
									Si le problème persiste, vous pouvez nous{' '}
									<A
										onClick={() => Sentry.showReportDialog()
										}
									>
										transmettre cette erreur
									</A>
									.
								</fbt>
							</p>
							<LinkButton
								to="/app"
								onClick={() => {
									window.location.href = '/app';
								}}
							>
								<fbt desc="Error page refresh link">
									Recharger la page
								</fbt>
							</LinkButton>
						</ErrorText>
					</ReporterRow>
				</ReporterMain>
			);
		}
		if (error) {
			// render fallback UI
			return (
				<ReporterMain>
					<AppLogo />
					<ReporterRow>
						<Illus src={errorIllus} />
						<ErrorText>
							<ErrorTitle>
								<fbt desc="Generic error page title">
									Quelque chose ne s'est pas passé comme
									prévu.
								</fbt>
							</ErrorTitle>
							<div>
								<fbt desc="Generic error page message">
									Si vous souhaitez nous aider, vous pouvez
									nous{' '}
									<A
										onClick={() => Sentry.showReportDialog()
										}
									>
										transmettre cette erreur
									</A>
									. Voici l'erreur en question :
								</fbt>
							</div>
							<ErrorCode>
								<code>{error.toString()}</code>
							</ErrorCode>
							<LinkButton
								to="/app"
								onClick={() => {
									this.setState({error: null});
								}}
							>
								<fbt desc="Error page get back link">
									Revenir à la page d'accueil
								</fbt>
							</LinkButton>
						</ErrorText>
					</ReporterRow>
				</ReporterMain>
			);
		}
		// when there's not an error, render children untouched
		return this.props.children;
	}
}

export default withRouter(SentryReporter);
