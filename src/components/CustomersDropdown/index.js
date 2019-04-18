import React from 'react';
import {useQuery} from 'react-apollo-hooks';

import {ArianneElem} from '../ArianneThread';

import {GET_ALL_CUSTOMERS} from '../../utils/queries';

const CustomersDropdown = ({creatable, ...props}) => {
	const {data, errors} = useQuery(GET_ALL_CUSTOMERS, {suspend: true});

	if (errors) throw errors;
	const customers = [...data.me.customers];

	if (creatable) {
		customers.unshift({id: 'CREATE', name: 'Créer un nouveau client'});
	}

	return <ArianneElem list={customers} {...props} />;
};

export default CustomersDropdown;
