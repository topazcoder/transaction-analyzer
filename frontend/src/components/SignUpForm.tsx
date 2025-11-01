import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isAxiosError } from 'axios'

export const SignUpForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const { signUp } = useAuth()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const { left, top, width, height } = container.getBoundingClientRect()
      const x = ((clientX - left) / width - 0.5) * 20
      const y = ((clientY - top) / height - 0.5) * 20

      container.style.setProperty('--mouse-x', `${x}px`)
      container.style.setProperty('--mouse-y', `${y}px`)
    }

    container.addEventListener('mousemove', handleMouseMove)
    return () => container.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await signUp(formData.email, formData.password, formData.name)
    } catch (error) {
      if (isAxiosError(error)) setError(error.response?.data)
      else setError('Failed to create new account')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div
      ref={containerRef}
      className='min-h-screen flex items-center justify-center relative overflow-hidden px-4 sm:px-6 lg:px-8'
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e3a8a 75%, #0c4a6e 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite'
      }}
    >
      {/* Animated Background Orbs */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-float' />
        <div className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-float-delayed' />
        <div className='absolute top-1/2 right-1/3 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl animate-float-slow' />
      </div>

      {/* Floating Particles */}
      <div className='absolute inset-0 pointer-events-none'>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className='absolute w-2 h-2 bg-blue-400/30 rounded-full animate-particle'
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <div className='max-w-md w-full relative z-10'>
        {/* Glassmorphism Card */}
        <div
          className='backdrop-blur-2xl bg-gray-900/40 rounded-3xl p-8 sm:p-10 shadow-2xl border border-gray-700/50 relative overflow-hidden transition-transform duration-300'
          style={{
            transform: 'translate(calc(var(--mouse-x, 0px) * 0.05), calc(var(--mouse-y, 0px) * 0.05))'
          }}
        >
          {/* Shimmer Effect */}
          <div className='absolute inset-0 opacity-30'>
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent animate-shimmer' />
          </div>

          {/* Content */}
          <div className='relative z-10'>
            {/* Logo/Icon */}
            <div className='flex justify-center mb-6'>
              <div className='w-16 h-16 bg-gradient-to-br from-blue-500/30 to-indigo-600/30 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-gray-600/50 shadow-lg'>
                <svg className='w-8 h-8 text-blue-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
                  />
                </svg>
              </div>
            </div>

            {/* Header */}
            <div className='text-center mb-8'>
              <h2 className='text-3xl sm:text-4xl font-bold text-gray-100 mb-2 tracking-tight'>Create Account</h2>
              <p className='text-gray-400 text-sm'>
                Already have an account?{' '}
                <Link
                  to='/signin'
                  className='font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-all duration-200'
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Form */}
            <form className='space-y-5' onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <div className='bg-red-500/20 backdrop-blur-xl border border-red-400/30 text-red-200 px-4 py-3 rounded-2xl animate-slideDown flex items-start gap-3'>
                  <svg className='w-5 h-5 flex-shrink-0 mt-0.5' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span className='text-sm'>{error}</span>
                </div>
              )}

              {/* Full Name Input */}
              <div className='space-y-2'>
                <label htmlFor='name' className='block text-sm font-medium text-gray-300'>
                  Full Name
                </label>
                <div className='relative group'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <svg
                      className='w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                      />
                    </svg>
                  </div>
                  <input
                    id='name'
                    name='name'
                    type='text'
                    required
                    autoComplete='name'
                    className='w-full pl-12 pr-4 py-3.5 bg-gray-800/50 backdrop-blur-xl border border-gray-600/50 rounded-2xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 hover:bg-gray-800/70'
                    placeholder='Enter your full name'
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className='space-y-2'>
                <label htmlFor='email' className='block text-sm font-medium text-gray-300'>
                  Email Address
                </label>
                <div className='relative group'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <svg
                      className='w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207'
                      />
                    </svg>
                  </div>
                  <input
                    id='email'
                    name='email'
                    type='email'
                    required
                    autoComplete='email'
                    className='w-full pl-12 pr-4 py-3.5 bg-gray-800/50 backdrop-blur-xl border border-gray-600/50 rounded-2xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 hover:bg-gray-800/70'
                    placeholder='you@example.com'
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className='space-y-2'>
                <label htmlFor='password' className='block text-sm font-medium text-gray-300'>
                  Password
                </label>
                <div className='relative group'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <svg
                      className='w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                      />
                    </svg>
                  </div>
                  <input
                    id='password'
                    name='password'
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete='new-password'
                    className='w-full pl-12 pr-12 py-3.5 bg-gray-800/50 backdrop-blur-xl border border-gray-600/50 rounded-2xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 hover:bg-gray-800/70'
                    placeholder='Create a password (min. 8 characters)'
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors'
                  >
                    {showPassword ? (
                      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
                        />
                      </svg>
                    ) : (
                      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                        />
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className='space-y-2'>
                <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-300'>
                  Confirm Password
                </label>
                <div className='relative group'>
                  <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                    <svg
                      className='w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                      />
                    </svg>
                  </div>
                  <input
                    id='confirmPassword'
                    name='confirmPassword'
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete='new-password'
                    className='w-full pl-12 pr-12 py-3.5 bg-gray-800/50 backdrop-blur-xl border border-gray-600/50 rounded-2xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 hover:bg-gray-800/70'
                    placeholder='Confirm your password'
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors'
                  >
                    {showConfirmPassword ? (
                      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
                        />
                      </svg>
                    ) : (
                      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                        />
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type='submit'
                disabled={isLoading}
                className='w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 shadow-xl hover:shadow-2xl relative overflow-hidden group'
              >
                <span className='absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300' />
                <span className='relative flex items-center justify-center'>
                  {isLoading ? (
                    <>
                      <div className='w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mr-2' />
                      Creating your account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <svg
                        className='w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M13 7l5 5m0 0l-5 5m5-5H6'
                        />
                      </svg>
                    </>
                  )}
                </span>
              </button>

              {/* Terms */}
              <p className='text-center text-xs text-gray-500 pt-2'>
                By signing up, you agree to our{' '}
                <a href='#' className='text-blue-400 hover:text-blue-300 underline transition-colors'>
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href='#' className='text-blue-400 hover:text-blue-300 underline transition-colors'>
                  Privacy Policy
                </a>
              </p>
            </form>
          </div>
        </div>

        {/* Footer Text */}
        <p className='mt-6 text-center text-gray-500 text-sm'>Join thousands of users worldwide</p>
      </div>
    </div>
  )
}
