import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../../libs/dynamoDB';
import { CreateItemRequest, Item } from '../../types/item';

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

    if (!event.body) {
      return errorResponse('Request body is required', 400);
    }

    const request: CreateItemRequest = JSON.parse(event.body);
    
    if (!request.name || !request.description || !request.price || !request.category) {
      return errorResponse('All fields are required', 400);
    }

    if (request.price <= 0) {
      return errorResponse('Price must be greater than 0', 400);
    }

    const itemId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const newItem: Item = {
      itemId,
      userId,
      name: request.name,
      description: request.description,
      price: request.price,
      category: request.category,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await ddbDocClient.send(new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: newItem,
    }));

    return successResponse(newItem, 201);
  } catch (error) {
    console.error('Error creating item:', error);
    return errorResponse((error as Error).message);
  }
};