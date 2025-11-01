import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../../libs/dynamoDB';

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

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.userId;
    
    if (!userId) {
      return errorResponse('User not authenticated', 401);
    }

    const itemId = event.pathParameters?.id;

    if (!itemId) {
      return errorResponse('Item ID is required', 400);
    }

    // First, verify the item exists and belongs to the user
    const getResult = await ddbDocClient.send(new GetCommand({
      TableName: process.env.TABLE_NAME,
      Key: { itemId },
    }));

    if (!getResult.Item) {
      return errorResponse('Item not found', 404);
    }

    const existingItem = getResult.Item as any;
    if (existingItem.userId !== userId) {
      return errorResponse('Access denied to this item', 403);
    }

    await ddbDocClient.send(new DeleteCommand({
      TableName: process.env.TABLE_NAME,
      Key: { itemId },
    }));

    return successResponse({ 
      message: 'Item deleted successfully',
      itemId 
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    return errorResponse((error as Error).message);
  }
};