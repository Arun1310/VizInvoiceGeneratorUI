import { useAppSelector } from 'app/store/hooks';
import { selectFuseCurrentSettings } from '@fuse/core/FuseSettings/fuseSettingsSlice';
import clsx from 'clsx';
import NavbarToggleButton from 'app/theme-layouts/shared-components/navbar/NavbarToggleButton';

/**
 * Navbar pin toggle button.
 */
function NavbarPinToggleButton(props) {
	const { ...rest } = props;
	const settings = useAppSelector(selectFuseCurrentSettings);
	const { config } = settings.layout;
	const folded = config.navbar?.folded;
	return (
		<NavbarToggleButton
			{...rest}
			className={clsx(folded ? 'opacity-50' : 'opacity-100', rest.className)}
		/>
	);
}

export default NavbarPinToggleButton;
