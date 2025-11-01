import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { SignUpRequest } from '../../types/auth';

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
    if (!event.body) {
      return errorResponse('Email, password, and name are required', 400);
    }

    const request: SignUpRequest = JSON.parse(event.body);
    
    if (!request.email || !request.password || !request.name) {
      return errorResponse('Email, password, and name are required', 400);
    }

    if (request.password.length < 8) {
      return errorResponse('Password must be at least 8 characters long', 400);
    }

    const createUserCommand = new AdminCreateUserCommand({
      UserPoolId: process.env.USER_POOL_ID,
      Username: request.email,
      UserAttributes: [
        { Name: 'email', Value: request.email },
        { Name: 'name', Value: request.name },
        { Name: 'email_verified', Value: 'true' }
      ],
      MessageAction: 'SUPPRESS',
      TemporaryPassword: request.password,
    });

    await cognitoClient.send(createUserCommand);

    const setPasswordCommand = new AdminSetUserPasswordCommand({
      UserPoolId: process.env.USER_POOL_ID,
      Username: request.email,
      Password: request.password,
      Permanent: true,
    });

    await cognitoClient.send(setPasswordCommand);

    return successResponse({
        email: request.email,
        name: request.name
      }, 201);
  } catch (error) {
    const err = error as Error;
    console.error('Error signing up user:', error);
    
    if (err.name === 'UsernameExistsException') {
      return errorResponse('User with this email already exists', 400);
    }
    
    return errorResponse(err.message)
  }
};