import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

// Create verifier instance for ID tokens
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID!,
  tokenUse: 'id', // We're expecting an ID token
  clientId: process.env.USER_POOL_CLIENT_ID!,
});

export const handler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  try {
    const token = event.authorizationToken?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('No token provided');
    }

    // Verify the JWT ID token using AWS Cognito verifier
    const payload = await verifier.verify(token);

    const apiArn = event.methodArn.split('/').slice(0, 2).join('/');
    const resource = `${apiArn}/*/*`;
    
    // Extract user information from the ID token payload
    return {
      principalId: payload.sub, // Use Cognito subject ID as principal
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: resource,
          },
        ],
      },
      context: {
        userId: payload.sub,
        email: payload.email?.toLocaleString() || '',
        name: payload.name?.toString() || payload.given_name?.toString() || '',
        email_verified: payload.email_verified?.toString() == 'true'
      },
    };
  } catch (error) {
    console.error('Authorization error:', error);
    
    // Return a Deny policy for any verification errors
    return {
      principalId: 'unauthorized',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn,
          },
        ],
      },
      context: {
        message: (error as Error).message
      },
    };
  }
};
