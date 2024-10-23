import components from './utils/components';

/**
Component to render NavItem depending on its type.
*/
function FuseNavItem(props) {
	const { type } = props;
	const C = components[type];
	return C ? <C {...props} /> : null;
}

export default FuseNavItem;
