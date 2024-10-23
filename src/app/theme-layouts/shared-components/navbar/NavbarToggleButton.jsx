import IconButton from '@mui/material/IconButton';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { selectFuseCurrentSettings, setDefaultSettings } from '@fuse/core/FuseSettings/fuseSettingsSlice';
import _ from '@lodash';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import clsx from 'clsx';
import { navbarToggle, navbarToggleMobile } from './navbarSlice';

/**
 * The navbar toggle button.
 */
function NavbarToggleButton(props) {
	const {
		className = '',
		children = (
			<FuseSvgIcon
				size={20}
				color="action"
			>
				heroicons-outline:bars-3
			</FuseSvgIcon>
		),
		...rest
	} = props;
	const dispatch = useAppDispatch();
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const settings = useAppSelector(selectFuseCurrentSettings);
	const { config } = settings.layout;
	return (
		<IconButton
			onClick={() => {
				if (isMobile) {
					dispatch(navbarToggleMobile());
				} else if (config?.navbar?.style === 'style-2') {
					dispatch(
						setDefaultSettings(
							_.set({}, 'layout.config.navbar.folded', !settings?.layout?.config?.navbar?.folded)
						)
					);
				} else {
					dispatch(navbarToggle());
				}
			}}
			{...rest}
			className={clsx('border border-divider', className)}
		>
			{children}
		</IconButton>
	);
}

export default NavbarToggleButton;
