import React, {useState, useRef} from 'react';
import PropTypes from 'prop-types';
import WebFont from 'webfontloader';

import './index.css';

const sizes = {
	tiny: 'md-18',
	small: 'md-24',
	medium: 'md-36',
	large: 'md-48',
};
const light = 'md-light';
const dark = 'md-dark';
const mdInactive = 'md-inactive';

WebFont.load({
	google: {
		families: ['Material+Icons'],
	},
	timeout: 5000,
});

function MaterialIcon(props) {
	const {
		size,
		invert,
		inactive,
		style,
		className,
		color,
		icon,
		...rest
	} = props;

	const sizeMapped = sizes[size] || parseInt(size, 10) || sizes.small;
	const defaultColor = invert && 'invert' ? light : dark;
	const inactiveColor = inactive && 'inactive' ? mdInactive : '';
	const propStyle = style || {};
	const styleOverride = Object.assign(propStyle, {
		color: color || '',
		fontSize: sizeMapped,
	});
	const clsName
		= className
		|| `material-icons ${sizeMapped} ${defaultColor} ${inactiveColor}`;

	return (
		<i {...rest} className={clsName} style={styleOverride}>
			{icon}
		</i>
	);
}

MaterialIcon.propTypes = {
	icon: PropTypes.string.isRequired,
	size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	invert: PropTypes.bool,
	inactive: PropTypes.bool,
};

export default MaterialIcon;