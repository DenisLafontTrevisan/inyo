import React from 'react';
import {Formik} from 'formik';
import styled from 'react-emotion';
import * as Yup from 'yup';
import {Mutation} from 'react-apollo';
import Creatable from 'react-select/lib/Creatable';
import ClassicSelect from 'react-select';
import {templates} from '../../../utils/quote-templates';

import {
	H1,
	H3,
	H4,
	Button,
	primaryBlue,
	primaryNavyBlue,
	FlexRow,
	ErrorInput,
	Label,
} from '../../../utils/content';
import FormElem from '../../../components/FormElem';
import AddressAutocomplete from '../../../components/AddressAutocomplete';
import {CREATE_QUOTE} from '../../../utils/mutations';
import {GET_ALL_QUOTES} from '../../../utils/queries';

const Title = styled(H1)`
	color: ${primaryNavyBlue};
`;

const SubTitle = styled(H3)`
	color: ${primaryBlue};
`;

const FormTitle = styled(H4)`
	color: ${primaryBlue};
`;

const SelectStyles = {
	option: (base, state) => ({
		...base,
		borderRadius: 0,
		fontFamily: 'Ligne',
	}),
	menu: (base, state) => ({
		...base,
		marginTop: 2,
		borderRadius: 0,
		fontFamily: 'Ligne',
	}),
	control: base => ({
		...base,
		width: '30vw',
		borderRadius: 0,
		fontFamily: 'Ligne',
	}),
	input: (base, state) => ({
		...base,
		fontFamily: 'Ligne',
		marginTop: '5px',
	}),
};

const quoteTemplates = templates.map(template => ({
	value: template.name,
	label: template.label,
}));

class CreateQuoteForm extends React.Component {
	render() {
		const {customers, onCreate} = this.props;

		return (
			<Mutation mutation={CREATE_QUOTE}>
				{createQuote => (
					<Formik
						initialValues={{
							customer: '',
							template: '',
							firstName: '',
							lastName: '',
							email: '',
							quoteTitle: '',
						}}
						validate={(values) => {
							const errors = {};

							if (!values.customer) {
								errors.customer = 'Requis';
							}
							else {
								const selectedCustomer
									= values.customer
									&& customers.find(
										c => c.id === values.customer.id,
									);
								const newCustomer
									= !selectedCustomer && values.customer;

								if (newCustomer) {
									if (!values.firstName) {
										errors.firstName = 'Requis';
									}
									if (!values.lastName) {
										errors.lastName = 'Requis';
									}
									if (!values.address) {
										errors.address = 'Requis';
									}
									if (!values.email) {
										errors.email = 'Requis';
									}
									else if (
										!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(
											values.email,
										)
									) {
										errors.email = 'Email invalide';
									}
								}
							}
							if (!values.template) {
								errors.template = 'Requis';
							}
							else if (
								values.template !== 'WEBSITE'
								&& values.template !== 'IDENTITY'
								&& values.template !== 'BLANK'
							) {
								errors.template = 'Template invalide';
							}
							if (!values.quoteTitle) {
								errors.quoteTitle = 'Requis';
							}

							return errors;
						}}
						onSubmit={async (values, actions) => {
							actions.setSubmitting(true);
							const customer = customers.find(
								c => c.id === values.customer.id,
							);

							const variables = {
								template: values.template,
								name: values.quoteTitle,
							};

							if (customer) {
								variables.customerId = customer.id;
							}
							else {
								variables.customer = {
									name: values.customer.value,
									firstName: values.firstName,
									lastName: values.lastName,
									email: values.email,
									address: values.address,
								};
							}

							const option = {};
							const selectedTemplate = templates.find(
								t => t.name === values.template,
							);

							if (selectedTemplate) {
								option.proposal = selectedTemplate.proposal;
								option.sections = selectedTemplate.sections;
							}

							variables.option = option;

							try {
								const result = await createQuote({
									variables,
									update: (cache, {data: {createQuote}}) => {
										const data = cache.readQuery({
											query: GET_ALL_QUOTES,
										});

										data.me.company.quotes.push(
											createQuote,
										);
										try {
											cache.writeQuery({
												query: GET_ALL_QUOTES,
												data,
											});
										}
										catch (e) {
											console.log(e);
										}
									},
								});

								onCreate(result.data.createQuote);
								actions.setSubmitting(false);
							}
							catch (error) {
								actions.setSubmitting(false);
								actions.setErrors(error);
								actions.setStatus({
									msg: `Quelque chose ne s'est pas passé comme prévu. ${error}`,
								});
							}
						}}
					>
						{(props) => {
							const {
								values,
								setFieldValue,
								status,
								isSubmitting,
								errors,
								touched,
							} = props;
							const selectedCustomer
								= values.customer
								&& customers.find(
									c => c.id === values.customer.id,
								);
							const newCustomer
								= !selectedCustomer && values.customer;

							return (
								<div>
									<form onSubmit={props.handleSubmit}>
										<Title>Créez votre devis</Title>
										<FlexRow justifyContent="space-around">
											<div>
												<SubTitle>
													1. Votre client
												</SubTitle>
												<Label>
													Entrez le nom de
													l'entreprise de votre client
												</Label>
												<Creatable
													id="customer"
													name="customer"
													options={customers.map(
														customer => ({
															...customer,
															label:
																customer.name,
															value: customer.id,
														}),
													)}
													getOptionValue={option => option.id
													}
													onChange={(option) => {
														setFieldValue(
															'customer',
															option,
														);
													}}
													styles={SelectStyles}
													value={values.customer}
													isClearable
													placeholder="Dubois SARL"
													formatCreateLabel={inputValue => `Créer "${inputValue}"`
													}
												/>
												{errors.customer
													&& touched.customer && (
													<ErrorInput>
														{errors.customer}
													</ErrorInput>
												)}
												{!selectedCustomer
													&& values.customer && (
													<div>
														<FormTitle>
																Il semblerait
																que ce soit un
																nouveau client !
														</FormTitle>
														<p>
																Pourriez-vous
																nous en dire
																plus ?
														</p>

														<FormElem
															{...props}
															label="Le prénom de votre contact"
															name="firstName"
															placeholder="John"
														/>
														<FormElem
															{...props}
															label="Le nom de votre contact"
															name="lastName"
															placeholder="Doe"
														/>
														<FormElem
															{...props}
															label="Son email"
															name="email"
															placeholder="contact@company.com"
														/>

														<AddressAutocomplete
															{...props}
															onChange={
																props.setFieldValue
															}
															name="address"
															placeholder="42 rue du Fer, 75000 Paris"
															label="L'adresse de l'entreprise"
														/>
														{errors.address
																&& touched.address && (
															<ErrorInput>
																{
																	errors.address
																}
															</ErrorInput>
														)}
													</div>
												)}
											</div>

											<div>
												<SubTitle>
													2. Votre Projet
												</SubTitle>
												<Label>
													Nous pouvons pré-remplir
													votre devis pour vous
												</Label>
												<ClassicSelect
													styles={SelectStyles}
													defaultValue="WEBSITE"
													placeholder="Type de devis"
													onChange={(option) => {
														setFieldValue(
															'template',
															option
																&& option.value,
														);
													}}
													options={quoteTemplates}
												/>
												{errors.template
													&& touched.template && (
													<ErrorInput>
														{errors.template}
													</ErrorInput>
												)}
												<FormElem
													{...props}
													label="Titre de votre devis"
													name="quoteTitle"
													placeholder="Nom du devis"
												/>
												{status
													&& status.msg && (
													<ErrorInput>
														{status.msg}
													</ErrorInput>
												)}

												<br />
												<Button
													type="submit"
													theme={
														isSubmitting
															? 'Disabled'
															: 'Primary'
													}
													disabled={isSubmitting}
													size="Large"
												>
													Créez votre devis
												</Button>
											</div>
										</FlexRow>
									</form>
								</div>
							);
						}}
					</Formik>
				)}
			</Mutation>
		);
	}
}

export default CreateQuoteForm;
