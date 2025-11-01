export interface Item {
  itemId: string;
  userId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemRequest {
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface UpdateItemRequest {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  body: T;
}

export interface ErrorResponse {
  error: string;
  message: string;
}