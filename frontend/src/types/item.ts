export interface Item {
  itemId: string
  userId: string
  name: string
  description: string
  price: number
  category: string
  createdAt: string
  updatedAt: string
}

export interface ItemRequest {
  name?: string
  description?: string
  price?: number
  category?: string
}
