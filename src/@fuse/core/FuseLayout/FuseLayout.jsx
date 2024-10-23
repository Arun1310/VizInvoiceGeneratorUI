import { useDeepCompareEffect } from '@fuse/hooks';
import _ from '@lodash';
import {
	generateSettings,
	selectFuseCurrentSettings,
	selectFuseDefaultSettings,
	setSettings
} from '@fuse/core/FuseSettings/fuseSettingsSlice';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { useLocation } from 'react-router-dom';
import { getFuseRouteParamUtil } from '@fuse/hooks/useFuseRouteParameter';
import FuseLoading from '../FuseLoading';

/**
 * FuseLayout
 * React frontend component in a React project that is used for layouting the user interface. The component
 * handles generating user interface settings related to current routes, merged with default settings, and uses
 * the new settings to generate layouts.
 */
function FuseLayout(props) {
	const { layouts, children } = props;
	const dispatch = useAppDispatch();
	const settings = useAppSelector(selectFuseCurrentSettings);
	const defaultSettings = useAppSelector(selectFuseDefaultSettings);
	const layoutStyle = settings.layout.style;
	const location = useLocation();
	const { pathname } = location;
	const newSettings = useRef(settings);
	const matchedSettings = getFuseRouteParamUtil(pathname, 'settings', true);
	const shouldAwaitRender = useCallback(() => {
		let _newSettings;

		/**
		 * On Path changed
		 */
		// if (prevPathname !== pathname) {
		if (matchedSettings) {
			/**
			 * if matched route has settings
			 */
			_newSettings = generateSettings(defaultSettings, matchedSettings);
		} else if (!_.isEqual(newSettings.current, defaultSettings)) {
			/**
			 * Reset to default settings on the new path
			 */
			_newSettings = _.merge({}, defaultSettings);
		} else {
			_newSettings = newSettings.current;
		}

		if (!_.isEqual(newSettings.current, _newSettings)) {
			newSettings.current = _newSettings;
		}
	}, [defaultSettings, matchedSettings]);
	shouldAwaitRender();
	const currentSettings = useMemo(() => newSettings.current, [newSettings.current]);
	useDeepCompareEffect(() => {
		if (!_.isEqual(currentSettings, settings)) {
			dispatch(setSettings(currentSettings));
		}
	}, [dispatch, currentSettings, settings]);
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);
	return useMemo(() => {
		if (!_.isEqual(currentSettings, settings)) {
			return <FuseLoading />;
		}

		return Object.entries(layouts).map(([key, Layout]) => {
			if (key === layoutStyle) {
				return (
					<React.Fragment key={key}>
						<Layout>{children}</Layout>
					</React.Fragment>
				);
			}

			return null;
		});
	}, [layouts, layoutStyle, children, currentSettings, settings]);
}

export default FuseLayout;
