import { Item } from '@/types/item'
import { useState } from 'react'

// Enhanced Product Card Component
const EnhancedProductCard: React.FC<{
  item: Item
  onEdit: (item: Item) => void
  onDelete: (id: string) => void
}> = ({ item, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`relative bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-500 transform-gpu ${
        isHovered ? 'scale-105 shadow-2xl' : 'scale-100'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Soft gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 transition-opacity duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-70'
        }`}
      />

      {/* Subtle shine effect on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform transition-all duration-1000 ${
          isHovered ? 'translate-x-full' : '-translate-x-full'
        }`}
      />

      <div className='relative z-10 p-6'>
        {/* Category badge */}
        <div className='inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 mb-4'>
          <span className='text-sm font-medium text-gray-700'>{item.category}</span>
        </div>

        {/* Product name with gradient text */}
        <h3 className='text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3'>
          {item.name}
        </h3>

        {/* Description */}
        <p className='text-gray-600 mb-4 line-clamp-2'>{item.description}</p>

        {/* Price with subtle animated background */}
        <div className='flex items-center justify-between mb-6'>
          <div className='relative'>
            <div className='absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg transform rotate-1' />
            <span className='relative text-2xl font-bold text-gray-800 px-3 py-1'>${item.price.toFixed(2)}</span>
          </div>
          <div
            className={`w-3 h-3 rounded-full bg-green-400 animate-pulse ${isHovered ? 'scale-150' : 'scale-100'} transition-transform duration-300`}
          />
        </div>

        {/* Action buttons */}
        <div className='flex space-x-3'>
          <button
            onClick={() => onEdit(item)}
            className='flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 font-medium flex items-center justify-center space-x-2'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
              />
            </svg>
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete(item.itemId)}
            className='flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 font-medium flex items-center justify-center space-x-2'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
              />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Subtle hover border animation */}
      <div
        className={`absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-blue-200 via-purple-200 to-indigo-200 bg-clip-border transition-all duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}

export default EnhancedProductCard
