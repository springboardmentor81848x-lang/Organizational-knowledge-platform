import React, { useState, useEffect, useRef } from 'react'
import Icon from './Icon.jsx'
import api from '../services/api.js'

const SUGGESTED_PROMPTS = [
  "💡 What is my biggest skill gap?",
  "🚀 What should I learn first?",
  "🔍 Why is this course recommended?",
  "🗺️ Explain my learning path",
  "📋 Create a 4-week learning plan",
  "🎯 How can I improve my weakest skill?"
]

export default function AIChatDrawer({ isOpen, onClose, initialPrompt, initialCourseContext, userSummary }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false)
  
  const messagesEndRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const isUserScrolledUp = useRef(false)

  // Initialize conversation thread when drawer opens
  useEffect(() => {
    if (isOpen) {
      if (initialPrompt || initialCourseContext) {
        handleSendMessage(initialPrompt || `Tell me why ${initialCourseContext} is recommended for me and what gap it addresses.`, initialCourseContext)
      } else if (messages.length === 0) {
        setMessages([
          {
            id: 'welcome',
            sender: 'ai',
            text: `### ✨ Welcome to your AI Learning Mentor!\n\nBased on your role as **${userSummary?.roleTitle || 'Professional'}**, I have analyzed your skill inventory and role benchmarks.\n\nI can explain your **Personalized Learning Path**, why courses are ordered in a specific sequence, or build a custom learning strategy for you.`
          }
        ])
      }
      setTimeout(scrollToBottomImmediately, 50)
    }
  }, [isOpen, initialPrompt, initialCourseContext])

  // Reliable Auto-scroll to bottom whenever messages or loading state change
  useEffect(() => {
    if (!isUserScrolledUp.current) {
      scrollToBottomImmediately()
    } else {
      setShowScrollBottomBtn(true)
    }
  }, [messages, loading])

  function scrollToBottomImmediately() {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    setShowScrollBottomBtn(false)
  }

  function handleScroll() {
    if (!scrollContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 60
    isUserScrolledUp.current = !isAtBottom
    if (isAtBottom) {
      setShowScrollBottomBtn(false)
    }
  }

  if (!isOpen) return null

  async function handleSendMessage(textToSend, courseContext = initialCourseContext) {
    const text = textToSend || inputMessage
    if (!text || !text.trim() || loading) return

    const trimmedText = text.trim()
    const userMsgId = Date.now().toString()
    const userMsg = { id: userMsgId, sender: 'user', text: trimmedText }

    // User message forces scroll to bottom
    isUserScrolledUp.current = false
    setMessages(prev => [...prev, userMsg])
    if (!textToSend) setInputMessage('')
    setLoading(true)

    // Scroll immediately for user message
    setTimeout(scrollToBottomImmediately, 30)

    try {
      const res = await api.chatWithAi(trimmedText, courseContext)
      const aiReplyText = res?.reply || res?.message || res?.text || "I'm having trouble retrieving a response. Please try again."
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReplyText
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      console.error('AI chat failed:', err)
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "⚠️ I couldn't connect to the AI assistant right now. Your recommendations remain available on the main page."
        }
      ])
    } finally {
      setLoading(false)
      setTimeout(scrollToBottomImmediately, 50)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden fade-in flex justify-end">
      {/* Light-dimmed backdrop overlay (35% opacity) */}
      <div 
        className="fixed inset-0 bg-slate-950/35 backdrop-blur-[2px] transition-opacity cursor-pointer"
        onClick={onClose}
        title="Click overlay to close AI Assistant"
      />

      {/* Drawer Container (Full Viewport Height Flex Container) */}
      <div className="w-screen max-w-md sm:w-[450px] bg-[#0F1420] border-l border-white/15 text-white shadow-2xl flex flex-col h-full h-dvh relative z-10">
        
        {/* HEADER (Flex Shrink 0) */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.04] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <Icon name="sparkles" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                AI Learning Assistant
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-[11px] text-slate-400">Your personalized learning mentor</p>
            </div>
          </div>
          {/* Obvious circular X close button */}
          <button
            type="button"
            onClick={onClose}
            title="Close AI Assistant"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-500/20 border border-white/20 hover:border-rose-400/50 text-slate-300 hover:text-rose-300 flex items-center justify-center transition-all shadow-md group"
          >
            <Icon name="x" className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Quick Prompt Suggestion Chips (Flex Shrink 0) */}
        <div className="px-4 py-2.5 bg-white/[0.02] border-b border-white/5 overflow-x-auto flex gap-1.5 scrollbar-none shrink-0">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt.replace(/^[^\s]+\s/, ''))}
              className="text-[11px] px-3 py-1.5 rounded-full bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-400/50 text-slate-300 hover:text-purple-200 transition-all whitespace-nowrap shrink-0 flex items-center gap-1"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* SCROLLABLE MESSAGE AREA (Flex 1, min-h-0, overflow-y-auto) */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 relative scrollbar-thin scrollbar-thumb-white/10"
        >
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="sparkles" className="w-3.5 h-3.5" />
                </div>
              )}
              
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                    : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">
                  {msg.text}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  You
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator ("AI is thinking...") */}
          {loading && (
            <div className="flex gap-3 justify-start fade-in">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                <Icon name="loader-2" className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-xs text-slate-300 flex items-center gap-2">
                <Icon name="loader-2" className="w-3.5 h-3.5 animate-spin text-purple-400" />
                <span>✨ AI is thinking & analyzing your path...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* Floating "↓ New response" button */}
        {showScrollBottomBtn && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
            <button
              type="button"
              onClick={scrollToBottomImmediately}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium px-3.5 py-1.5 rounded-full shadow-lg border border-purple-400/50 flex items-center gap-1.5 animate-bounce"
            >
              <Icon name="arrow-down" className="w-3 h-3" /> New response below
            </button>
          </div>
        )}

        {/* FIXED CHAT INPUT (Flex Shrink 0) */}
        <div className="p-4 border-t border-white/10 bg-white/[0.04] shrink-0 pb-safe">
          <form
            onSubmit={e => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex gap-2 items-center"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your skills, gaps, or learning path..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              title="Send message"
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold rounded-xl px-4 py-2.5 text-xs transition-all flex items-center justify-center gap-1 shadow-lg shadow-purple-600/30 shrink-0"
            >
              {loading ? (
                <Icon name="loader-2" className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Icon name="send" className="w-3.5 h-3.5" />
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
