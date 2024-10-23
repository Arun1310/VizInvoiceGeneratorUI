import Hidden from '@mui/material/Hidden';
import { styled } from '@mui/material/styles';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import {
	navbarCloseMobile,
	resetNavbar,
	selectFuseNavbar
} from 'app/theme-layouts/shared-components/navbar/navbarSlice';
import GlobalStyles from '@mui/material/GlobalStyles';
import { selectFuseCurrentLayoutConfig } from '@fuse/core/FuseSettings/fuseSettingsSlice';
import clsx from 'clsx';
import { useEffect } from 'react';
import NavbarStyle3Content from './NavbarStyle3Content';

const navbarWidth = 120;
const navbarWidthDense = 64;
const panelWidth = 280;
const StyledNavBar = styled('div')(({ theme, dense, open, folded, position }) => ({
	minWidth: navbarWidth,
	width: navbarWidth,
	maxWidth: navbarWidth,
	...(position === 'left' && {
		borderRight: `1px solid ${theme.palette.divider}`
	}),
	...(position === 'right' && {
		borderLight: `1px solid ${theme.palette.divider}`
	}),
	...(dense && {
		minWidth: navbarWidthDense,
		width: navbarWidthDense,
		maxWidth: navbarWidthDense,
		...(!open && {
			...(position === 'left' && {
				marginLeft: -navbarWidthDense
			}),
			...(position === 'right' && {
				marginRight: -navbarWidthDense
			})
		})
	}),
	...(!folded && {
		minWidth: dense ? navbarWidthDense + panelWidth : navbarWidth + panelWidth,
		width: dense ? navbarWidthDense + panelWidth : navbarWidth + panelWidth,
		maxWidth: dense ? navbarWidthDense + panelWidth : navbarWidth + panelWidth,
		'& #fuse-navbar-panel': {
			opacity: '1!important',
			pointerEvents: 'initial!important'
		},
		...(!open && {
			...(position === 'left' && {
				marginLeft: -(dense ? navbarWidthDense + panelWidth : navbarWidth + panelWidth)
			}),
			...(position === 'right' && {
				marginRight: -(dense ? navbarWidthDense + panelWidth : navbarWidth + panelWidth)
			})
		})
	}),
	...(!open && {
		transition: theme.transitions.create('margin', {
			easing: theme.transitions.easing.easeOut,
			duration: theme.transitions.duration.leavingScreen
		}),
		...(position === 'left' && {
			marginLeft: -(dense ? navbarWidthDense : navbarWidth)
		}),
		...(position === 'right' && {
			marginRight: -(dense ? navbarWidthDense : navbarWidth)
		})
	}),
	...(open && {
		transition: theme.transitions.create('margin', {
			easing: theme.transitions.easing.easeOut,
			duration: theme.transitions.duration.enteringScreen
		})
	}),
	'& .user-menu': {
		minWidth: 56,
		width: 56,
		'& .title': {
			opacity: 0
		},
		'& .subtitle': {
			opacity: 0
		},
		'& .info-icon': {
			opacity: 0
		},
		'& .arrow': {
			opacity: 0
		}
	}
}));
const StyledNavBarMobile = styled(SwipeableDrawer)(() => ({
	'& .MuiDrawer-paper': {
		'& #fuse-navbar-side-panel': {
			minWidth: 'auto',
			wdith: 'auto'
		},
		'& #fuse-navbar-panel': {
			opacity: '1!important',
			pointerEvents: 'initial!important'
		}
	},
	'& .user-menu': {
		minWidth: 56,
		width: 56,
		'& .title': {
			opacity: 0
		},
		'& .subtitle': {
			opacity: 0
		},
		'& .info-icon': {
			opacity: 0
		},
		'& .arrow': {
			opacity: 0
		}
	}
}));

/**
 * The navbar style 3.
 */
function NavbarStyle3(props) {
	const { className = '', dense = false } = props;
	const dispatch = useAppDispatch();
	const config = useAppSelector(selectFuseCurrentLayoutConfig);
	const navbar = useAppSelector(selectFuseNavbar);
	const { folded } = config.navbar;
	useEffect(() => {
		return () => {
			dispatch(resetNavbar());
		};
	}, [dispatch]);
	return (
		<>
			<GlobalStyles
				styles={(theme) => ({
					'& #fuse-navbar-side-panel': {
						width: dense ? navbarWidthDense : navbarWidth,
						minWidth: dense ? navbarWidthDense : navbarWidth,
						maxWidth: dense ? navbarWidthDense : navbarWidth
					},
					'& #fuse-navbar-panel': {
						maxWidth: '100%',
						width: panelWidth,
						...(config.navbar.position === 'left' && {
							borderRight: `1px solid ${theme.palette.divider}!important`
						}),
						...(config.navbar.position === 'right' && {
							borderLeft: `1px solid ${theme.palette.divider}!important`
						}),
						[theme.breakpoints.up('lg')]: {
							minWidth: panelWidth,
							maxWidth: 'initial'
						}
					}
				})}
			/>

			<Hidden lgDown>
				<StyledNavBar
					open={navbar.open}
					dense={dense ? 1 : 0}
					folded={folded ? 1 : 0}
					position={config.navbar.position}
					className={clsx('sticky top-0 z-20 h-screen flex-auto shrink-0 flex-col', className)}
				>
					<NavbarStyle3Content dense={dense ? 1 : 0} />
				</StyledNavBar>
			</Hidden>

			<Hidden lgUp>
				<StyledNavBarMobile
					classes={{
						paper: clsx('h-screen w-auto max-w-full flex-auto flex-col overflow-hidden', className)
					}}
					anchor={config.navbar.position}
					variant="temporary"
					open={navbar.mobileOpen}
					onClose={() => dispatch(navbarCloseMobile())}
					onOpen={() => {}}
					disableSwipeToOpen
					ModalProps={{
						keepMounted: true // Better open performance on mobile.
					}}
				>
					<NavbarStyle3Content dense={dense ? 1 : 0} />
				</StyledNavBarMobile>
			</Hidden>
		</>
	);
}

export default NavbarStyle3;
