import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CognitoIdentityProviderClient, AdminInitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { SignInRequest, AuthResponse } from '../../types/auth';

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
    body: JSON.stringify({ error: message }),
  };
}

const cognitoClient = new CognitoIdentityProviderClient({ 
  region: process.env.REGION 
});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return errorResponse('Request body is required', 400);
    }

    const request: SignInRequest = JSON.parse(event.body);
    
    if (!request.email || !request.password) {
      return errorResponse('Email and password are required', 400);
    }

    const authCommand = new AdminInitiateAuthCommand({
      UserPoolId: process.env.USER_POOL_ID,
      ClientId: process.env.USER_POOL_CLIENT_ID,
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      AuthParameters: {
        USERNAME: request.email,
        PASSWORD: request.password,
      },
    });

    const response = await cognitoClient.send(authCommand);

    if (!response.AuthenticationResult) {
      return errorResponse('Authentication failed', 401);
    }

    const authResponse: AuthResponse = {
      accessToken: response.AuthenticationResult.AccessToken!,
      refreshToken: response.AuthenticationResult.RefreshToken!,
      idToken: response.AuthenticationResult.IdToken!, // This is crucial for authorization
      expiresIn: response.AuthenticationResult.ExpiresIn!,
      tokenType: response.AuthenticationResult.TokenType!,
    };

    // Add clear instructions in the response about token usage
    const enhancedResponse = {
      ...authResponse,
      usageInstructions: {
        authorization: 'Use idToken for API authorization (Bearer token)',
        accessControl: 'Use accessToken for AWS service calls if needed',
        storage: 'Store both tokens securely (httpOnly cookies recommended)'
      }
    };

    return successResponse(enhancedResponse);
  } catch (error) {
    const err = error as Error;
    console.error('Error signing in user:', error);
    
    if (err.name === 'NotAuthorizedException' || err.name === 'UserNotFoundException') {
      return errorResponse('Invalid email or password', 401);
    }
    
    return errorResponse(err.message);
  }
};
