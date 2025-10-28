'use client'

import { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function Home() {
  const [sessionId, setSessionId] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Generate session ID on mount
  useEffect(() => {
    setSessionId(uuidv4())
  }, [])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(e)
    }
    // Allow Shift+Enter for line breaks (default behavior)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim() || isLoading || !sessionId) return

    const userMessage = inputValue.trim()
    setInputValue('')
    setIsLoading(true)

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId: sessionId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()

      // Add assistant response to chat
      if (data.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-slate-800">
            Construction Estimator AI
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Get accurate construction cost estimates powered by AI
          </p>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            // Welcome Screen
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">
                  Welcome to Construction Estimator AI
                </h2>
                <p className="text-slate-600 mb-6">
                  I can help you estimate costs for construction projects, materials, labor, and more.
                  Just describe your project and I'll provide detailed estimates.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-slate-700 mb-1">Example:</p>
                    <p className="text-sm text-slate-600">
                      "Estimate the cost of building a 2000 sq ft residential home"
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-slate-700 mb-1">Example:</p>
                    <p className="text-sm text-slate-600">
                      "What's the cost to install hardwood flooring in a 500 sq ft room?"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Messages
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-white text-slate-800 shadow-md border border-slate-200'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="text-sm prose prose-sm max-w-none prose-slate prose-headings:text-slate-800 prose-p:text-slate-700 prose-strong:text-slate-900 prose-code:text-slate-800 prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-100 prose-pre:text-slate-800">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl px-4 py-3 shadow-md border border-slate-200">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={sendMessage} className="flex gap-3">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your construction project... (Shift+Enter for new line)"
              disabled={isLoading || !sessionId}
              rows={1}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-800 placeholder-slate-400 resize-none min-h-[48px] max-h-[200px] overflow-y-auto"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim() || !sessionId}
              className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors self-end"
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                'Send'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
