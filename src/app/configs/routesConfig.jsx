import settingsConfig from 'app/configs/settingsConfig';
import { Navigate } from 'react-router-dom';
import FuseLoading from '@fuse/core/FuseLoading';
import { layoutConfigOnlyMain } from 'app/configs/layoutConfigTemplates';
import ErrorBoundary from '@fuse/utils/ErrorBoundary';
import App from '../App';
import Error404Page from '../main/404/Error404Page';
import Error401Page from '../main/401/Error401Page';

const configModules = import.meta.glob('/src/app/main/**/*Route.jsx', { eager: true });
const mainRoutes = Object.keys(configModules)
	.map((modulePath) => {
		const moduleConfigs = configModules[modulePath].default;
		return Array.isArray(moduleConfigs) ? moduleConfigs : [moduleConfigs];
	})
	.flat();
const routes = [
	{
		path: '/',
		element: <App />,
		auth: settingsConfig.defaultAuth,
		errorElement: <ErrorBoundary />,
		children: [
			{
				path: '/',
				element: <Navigate to="/home" />
			},
			...mainRoutes,
			{
				path: 'loading',
				element: <FuseLoading />,
				settings: { layout: layoutConfigOnlyMain }
			},
			{
				path: '401',
				element: <Error401Page />
			},
			{
				path: '404',
				element: <Error404Page />,
				settings: { layout: layoutConfigOnlyMain },
				auth: null
			}
		]
	},
	{
		path: '*',
		element: <Navigate to="404" />
	}
];
export default routes;
