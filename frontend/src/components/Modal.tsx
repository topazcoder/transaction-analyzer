import { useEffect, useState } from 'react'
import CloseIcon from '../assets/svg/close.svg'

// Enhanced Modal Component with proper animations
export const Modal: React.FC<{
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Open modal
      setIsVisible(true)
      setIsClosing(false)

      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else if (isVisible) {
      // Start closing animation
      setIsClosing(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setIsClosing(false)

        // Restore body scroll
        document.body.style.overflow = 'unset'
      }, 300) // Match animation duration

      return () => clearTimeout(timer)
    }
  }, [isOpen, isVisible])

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isVisible) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  const backdropAnimation = isClosing ? 'animate-out fade-out duration-300' : 'animate-in fade-in duration-300'
  const modalAnimation = isClosing
    ? 'animate-out zoom-out slide-out-to-bottom-10 duration-300'
    : 'animate-in zoom-in slide-in-from-bottom-10 duration-300'

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay'>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm ${backdropAnimation}`}
        onClick={onClose}
      />

      {/* Modal container */}
      <div
        className={`relative bg-white rounded-3xl shadow-2xl w-full ${sizeClasses[size]} modal-content ${modalAnimation}`}
      >
        {/* Gradient header with shine effect */}
        <div className='relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-t-3xl px-8 py-6 overflow-hidden'>
          {/* Shine animation overlay */}
          <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shine' />
          <div className='flex justify-between items-center'>
            <h3 className='text-2xl font-bold text-white relative z-10 drop-shadow-lg'>{title}</h3>
            <button
              onClick={onClose}
              className='relative z-10 text-white hover:text-gray-200 transition-all duration-200 transform hover:scale-110 bg-black/20 rounded-full p-2 backdrop-blur-sm hover:bg-black/30'
              aria-label='Close modal'
            >
              <div className='w-5 h-5 pointer-events-none'>
                <CloseIcon />
              </div>
            </button>
          </div>
        </div>

        {/* Modal content */}
        <div className='p-8 max-h-[80vh] overflow-y-auto'>{children}</div>
      </div>
    </div>
  )
}

// Enhanced Confirmation Modal
export const ConfirmModal: React.FC<{
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  type = 'danger'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return (
          <svg className='w-12 h-12 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z'
            />
          </svg>
        )
      case 'warning':
        return (
          <svg className='w-12 h-12 text-yellow-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
        )
      case 'info':
        return (
          <svg className='w-12 h-12 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
        )
    }
  }

  const getButtonStyle = () => {
    switch (type) {
      case 'danger':
        return 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700'
      case 'info':
        return 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size='sm'>
      <div className='space-y-6 text-center'>
        <div className='flex justify-center'>
          <div
            className={`p-4 rounded-full ${
              type === 'danger' ? 'bg-red-100' : type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
            } animate-pulse`}
          >
            {getIcon()}
          </div>
        </div>

        <p className='text-gray-600 text-lg leading-relaxed'>{message}</p>

        <div className='flex space-x-4 justify-center'>
          <button
            onClick={onCancel}
            className='px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 font-medium flex-1'
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-3 ${getButtonStyle()} text-white rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg font-medium flex-1`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
