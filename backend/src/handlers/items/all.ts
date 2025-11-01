import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../../utils/dynamodb';
import { Item } from '../../types/item';

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

export const handler = async (_: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const command = new ScanCommand({
      TableName: process.env.TABLE_NAME,
    });

    const result = await ddbDocClient.send(command);
    const items = result.Items as Item[] || [];

    return successResponse(items);
  } catch (error) {
    console.error('Error retrieving items:', error);
    return errorResponse((error as Error).message);
  }
};