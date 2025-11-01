import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CognitoIdentityProviderClient, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { User } from '../../types/auth';

const successResponse = <T>(body: T, statusCode: number = 200): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN!,
      'Access-Control-Allow-Credentials': false,
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
  };
}

const errorResponse = (message: string, statusCode: number = 500): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
        'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN!,
        'Access-Control-Allow-Credentials': false,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    },
    body: message,
  };
}

const cognitoClient = new CognitoIdentityProviderClient({ 
  region: process.env.REGION 
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.userId;
    const email = event.requestContext.authorizer?.email;
    const name = event.requestContext.authorizer?.name;
    
    if (!userId) {
      return errorResponse("Not Authorized", 401);
    }

    // Get additional user info from Cognito
    const getUserCommand = new AdminGetUserCommand({
      UserPoolId: process.env.USER_POOL_ID,
      Username: email,
    });

    const userInfo = await cognitoClient.send(getUserCommand);

    const user: User = {
      userId,
      email: email || '',
      name: name || '',
      emailVerified: userInfo.UserAttributes?.find(attr => attr.Name === 'email_verified')?.Value === 'true',
    };

    return successResponse(user);
  } catch (error) {
    console.error('Error getting current user:', error);
    return errorResponse('Failed to get user information');
  }
};