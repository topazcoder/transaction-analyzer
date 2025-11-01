import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { blockchainService } from '@/services/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export const Dashboard: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { user, signOut } = useAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [input])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Replace with your actual API call
      const { data } = await blockchainService.sendPrompt(input.trim())

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.naturalLanguageExplanation || 'Sorry, I could not process your request.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    setMessages([])
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  return (
    <div className='flex h-screen bg-gray-950 text-gray-100 overflow-hidden'>
      {/* Animated Background */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-float' />
        <div className='absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-float-delayed' />
        <div className='absolute top-1/2 left-1/2 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl animate-float-slow' />
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-0'
        } bg-gray-900/50 backdrop-blur-xl border-r border-gray-800/50 transition-all duration-300 flex flex-col relative z-10 overflow-hidden`}
      >
        <div className='p-4 border-b border-gray-800/50'>
          <button
            onClick={handleNewChat}
            className='w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
          >
            <svg
              className='w-5 h-5 group-hover:rotate-90 transition-transform duration-300'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
            </svg>
            New Chat
          </button>
        </div>

        <div className='flex-1 overflow-y-auto p-4 space-y-2'>
          <div className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3'>Recent Chats</div>
          {/* Chat history items would go here */}
          <div className='space-y-2'>
            {[1, 2, 3].map(i => (
              <button
                key={i}
                className='w-full text-left py-3 px-4 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 text-gray-400 hover:text-gray-200 transition-all duration-200 text-sm truncate group'
              >
                <div className='flex items-center gap-2'>
                  <svg
                    className='w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                    />
                  </svg>
                  Previous conversation {i}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className='p-4 border-t border-gray-800/50'>
          <div className='text-xs text-gray-500 text-center'>
            <p>Powered by AI</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className='flex-1 flex flex-col relative z-10'>
        {/* Header */}
        <header className='bg-gray-900/50 backdrop-blur-xl border-b border-gray-800/50 px-6 py-4 flex items-center justify-between shadow-lg'>
          <div className='flex items-center gap-4'>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className='p-2 hover:bg-gray-800/50 rounded-xl transition-all duration-200 group'
            >
              <svg
                className='w-6 h-6 text-gray-400 group-hover:text-gray-200 transition-colors'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            </button>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg'>
                <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
                </svg>
              </div>
              <div>
                <h1 className='text-xl font-bold text-gray-100'>Transaction Analyzer</h1>
                <p className='text-xs text-gray-500'>Your intelligent companion</p>
              </div>
            </div>
          </div>

          <div className='flex items-center gap-4'>
            {/* User Profile */}
            <div className='flex items-center gap-3 px-4 py-2 bg-gray-800/30 rounded-xl border border-gray-700/50'>
              <div className='w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-lg'>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className='hidden sm:block'>
                <p className='text-sm font-medium text-gray-200'>{user?.name || 'User'}</p>
                <p className='text-xs text-gray-500'>{user?.email || 'user@example.com'}</p>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className='px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 border border-red-600/30 group'
            >
              <svg
                className='w-5 h-5 group-hover:translate-x-1 transition-transform'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                />
              </svg>
              <span className='hidden sm:inline'>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Messages Area */}
        <div className='flex-1 overflow-y-auto px-4 py-6'>
          <div className='max-w-4xl mx-auto space-y-6'>
            {messages.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-full py-12'>
                <div className='w-20 h-20 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-xl border border-gray-700/50 shadow-xl animate-pulse'>
                  <svg className='w-10 h-10 text-blue-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
                  </svg>
                </div>
                <h2 className='text-2xl font-bold text-gray-300 mb-2'>How can I help you today?</h2>
                <p className='text-gray-500 text-center max-w-md'>Start a conversation by typing a message below</p>

                {/* Suggestion Cards */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 w-full max-w-2xl'>
                  {[
                    { icon: '💡', title: 'About Me', desc: 'Who are you?' },
                    { icon: '📝', title: 'What is Ethereum', desc: 'What is Ethereum?' },
                    {
                      icon: '🔍',
                      title: 'Research',
                      desc: 'Are addresses 0xD5b1... and 0x52e0... related with each other?'
                    },
                    {
                      icon: '🎨',
                      title: 'List Transactions',
                      desc: 'List all transactions involving 0xE2f3... greater than 10 ETH in the last month.'
                    }
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(item.desc)}
                      className='p-4 bg-gray-800/30 hover:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-xl group'
                    >
                      <div className='text-2xl mb-2 group-hover:scale-110 transition-transform'>{item.icon}</div>
                      <h3 className='font-semibold text-gray-200 mb-1'>{item.title}</h3>
                      <p className='text-sm text-gray-500'>{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideUp`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {message.role === 'assistant' && (
                      <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg'>
                        <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M13 10V3L4 14h7v7l9-11h-7z'
                          />
                        </svg>
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] sm:max-w-[70%] ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                          : 'bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 text-gray-100'
                      } rounded-2xl px-5 py-4 shadow-lg`}
                    >
                      <p className='text-sm leading-relaxed whitespace-pre-wrap'>{message.content}</p>
                      <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {message.role === 'user' && (
                      <div className='w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-semibold shadow-lg'>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className='flex gap-4 justify-start animate-slideUp'>
                    <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg'>
                      <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M13 10V3L4 14h7v7l9-11h-7z'
                        />
                      </svg>
                    </div>
                    <div className='bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl px-5 py-4 shadow-lg'>
                      <div className='flex gap-2'>
                        <div
                          className='w-2 h-2 bg-blue-500 rounded-full animate-bounce'
                          style={{ animationDelay: '0ms' }}
                        />
                        <div
                          className='w-2 h-2 bg-blue-500 rounded-full animate-bounce'
                          style={{ animationDelay: '150ms' }}
                        />
                        <div
                          className='w-2 h-2 bg-blue-500 rounded-full animate-bounce'
                          style={{ animationDelay: '300ms' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className='border-t border-gray-800/50 bg-gray-900/50 backdrop-blur-xl p-4'>
          <form onSubmit={handleSubmit} className='max-w-4xl mx-auto'>
            <div className='relative flex items-end gap-3 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-3 shadow-xl focus-within:border-blue-500/50 transition-all duration-200'>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
                placeholder='Type your message here...'
                rows={1}
                className='flex-1 bg-transparent text-gray-100 placeholder-gray-500 focus:outline-none resize-none max-h-32 py-2 px-2'
                disabled={isLoading}
              />
              <button
                type='submit'
                disabled={!input.trim() || isLoading}
                className='p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex-shrink-0 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100 group'
              >
                {isLoading ? (
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                ) : (
                  <svg
                    className='w-5 h-5 group-hover:translate-x-0.5 transition-transform'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
                    />
                  </svg>
                )}
              </button>
            </div>
            <p className='text-xs text-gray-600 text-center mt-3'>
              Press <kbd className='px-2 py-1 bg-gray-800 rounded text-gray-400'>Enter</kbd> to send,{' '}
              <kbd className='px-2 py-1 bg-gray-800 rounded text-gray-400'>Shift + Enter</kbd> for new line
            </p>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30px, 30px) scale(0.9); }
          66% { transform: translate(20px, -20px) scale(1.1); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 20px) scale(1.05); }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 30s ease-in-out infinite;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(17, 24, 39, 0.5);
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.5);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.7);
        }
      `}</style>
    </div>
  )
}
