import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import awsAuthConfig from './awsAuthConfig';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
Amplify.configure(awsAuthConfig);

function AWSAuthProvider(props) {
	const { children } = props;
	return <Authenticator.Provider>{children}</Authenticator.Provider>;
}

export default AWSAuthProvider;
