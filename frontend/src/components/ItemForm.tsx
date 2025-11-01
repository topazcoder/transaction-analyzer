import React, { useState, useEffect } from 'react'
import { Item, ItemRequest } from '../types/item'

interface ItemFormProps {
  item?: Item | null
  onSubmit: (data: ItemRequest) => void
  onCancel: () => void
  isEditing: boolean
}

export const ItemForm: React.FC<ItemFormProps> = ({ item, onSubmit, onCancel, isEditing }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: ''
  })

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category
      })
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: ''
      })
    }
  }, [item])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields for create
    if (!isEditing && (!formData.name || !formData.description || !formData.category || formData.price <= 0)) {
      alert('Please fill all required fields')

      return
    }

    // Validate at least one field for update
    if (isEditing && !formData.name && !formData.description && !formData.category && formData.price <= 0) {
      alert('Please update at least one field')

      return
    }

    onSubmit(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className='bg-white p-6 rounded-lg shadow-md'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>Name *</label>
          <input
            type='text'
            name='name'
            value={formData.name}
            onChange={handleChange}
            required={!isEditing}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Product name'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>Category *</label>
          <select
            name='category'
            value={formData.category}
            onChange={handleChange}
            required={!isEditing}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value=''>Select a category</option>
            <option value='Electronics'>Electronics</option>
            <option value='Books'>Books</option>
            <option value='Clothing'>Clothing</option>
            <option value='Home'>Home</option>
            <option value='Sports'>Sports</option>
            <option value='Other'>Other</option>
          </select>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>Price *</label>
          <input
            type='number'
            name='price'
            value={Number(formData.price).toString()}
            onChange={handleChange}
            min='0'
            step='0.01'
            required={!isEditing}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='0.00'
          />
        </div>

        <div className='md:col-span-2'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>Description *</label>
          <textarea
            name='description'
            value={formData.description}
            onChange={handleChange}
            required={!isEditing}
            rows={3}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Product description'
          />
        </div>
      </div>

      <div className='flex justify-end space-x-4 mt-6'>
        <button
          type='button'
          onClick={onCancel}
          className='px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50'
        >
          Cancel
        </button>
        <button
          type='submit'
          className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          {isEditing ? 'Update' : 'Create'} Product
        </button>
      </div>
    </form>
  )
}
