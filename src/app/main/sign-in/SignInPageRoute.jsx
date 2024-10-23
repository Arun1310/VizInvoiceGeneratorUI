// import SignInPage from './SignInPage';
import ClassicSignInPage from './ClassicSignInPage';
import authRoles from '../../auth/authRoles';

const SignInPageRoute = {
	path: 'sign-in',
	element: <ClassicSignInPage />,
	settings: {
		layout: {
			config: {
				navbar: {
					display: false
				},
				toolbar: {
					display: false
				},
				footer: {
					display: false
				},
				leftSidePanel: {
					display: false
				},
				rightSidePanel: {
					display: false
				}
			}
		}
	},
	auth: authRoles.onlyGuest // []
};
export default SignInPageRoute;
