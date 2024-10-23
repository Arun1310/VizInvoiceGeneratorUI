import SignUpPage from './SignUpPage';
import authRoles from '../../auth/authRoles';
/**
 * Sign-up page route.
 */
const SignUpPageRoute = {
	path: 'sign-up',
	element: <SignUpPage />,
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
	auth: authRoles.onlyGuest
};
export default SignUpPageRoute;
