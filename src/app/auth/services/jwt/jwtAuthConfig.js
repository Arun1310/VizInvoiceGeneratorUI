const jwtAuthConfig = {
	tokenStorageKey: 'jwt_access_token',
	signInUrl: 'api/auth/sign-in',
	signUpUrl: 'mock-api/Auth/sign-up',
	tokenRefreshUrl: 'mock-api/auth/refresh',
	getUserUrl: 'api/Token/refresh',
	updateUserUrl: 'mock-api/auth/user',
	updateTokenFromHeader: true
};
export default jwtAuthConfig;
