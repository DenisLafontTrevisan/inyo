export const GRAPHQL_API = `https://prisma${
	// eslint-disable-line import/prefer-default-export
	process.env.REACT_APP_INYO_ENV === 'development' ? '-dev' : ''
}.inyo.me/`;

export const WEEKDAYS_SHORT = {
	fr: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
};

export const MONTHS = {
	fr: [
		'Janvier',
		'Février',
		'Mars',
		'Avril',
		'Mai',
		'Juin',
		'Juillet',
		'Août',
		'Septembre',
		'Octobre',
		'Novembre',
		'Décembre',
	],
};

export const WEEKDAYS_LONG = {
	fr: [
		'Dimanche',
		'Lundi',
		'Mardi',
		'Mercredi',
		'Jeudi',
		'Vendredi',
		'Smedi',
	],
};

export const FIRST_DAY_OF_WEEK = {
	fr: 1,
};
// Translate aria-labels
export const LABELS = {
	fr: {nextMonth: 'Mois suivant', previousMonth: 'Mois précédent'},
};
