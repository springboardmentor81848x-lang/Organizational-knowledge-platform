import React, { useState } from 'react'
import Icon from './Icon.jsx'
import api from '../services/api.js'

export default function GoogleSignInModal({ isOpen, onClose, onLoginSuccess }) {
  const [selectedAccount, setSelectedAccount] = useState('nidarshan')
  const [customEmail, setCustomEmail] = useState('')
  const [customName, setCustomName] = useState('')
  const [selectedRole, setSelectedRole] = useState('EMPLOYEE')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const presetAccounts = [
    {
      id: 'nidarshan',
      name: 'Nidarshan',
      email: 'nidarshannidarshan154@gmail.com',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Nidarshan',
      initials: 'N'
    }
  ]

  const handleContinue = async (account) => {
    setLoading(true)
    setError(null)

    let email = ''
    let name = ''
    let picture = ''

    if (account === 'custom') {
      if (!customEmail.trim()) {
        setError('Please enter a valid Google email address.')
        setLoading(false)
        return
      }
      email = customEmail.trim().toLowerCase()
      name = customName.trim() || email.split('@')[0]
      picture = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
    } else {
      const preset = presetAccounts.find(a => a.id === account) || presetAccounts[0]
      email = preset.email
      name = preset.name
      picture = preset.avatar
    }

    try {
      const authData = await api.googleLogin(`google_oauth_token_${Date.now()}`, {
        email,
        name,
        picture
      })

      const sysRole = (authData.systemRole || selectedRole || 'EMPLOYEE').toUpperCase()
      const appRole = sysRole.includes('MANAGER') ? 'manager'
        : sysRole.includes('HR') ? 'hr'
        : sysRole.includes('HEAD') || sysRole.includes('DEPT') ? 'depthead'
        : sysRole.includes('L_AND_D') || sysRole.includes('LD') ? 'ldadmin'
        : sysRole.includes('ADMIN') ? 'admin'
        : 'employee'

      onClose()
      onLoginSuccess(appRole, authData)
    } catch (err) {
      console.error('Google login failed:', err)
      setError(err.message || 'Google authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-[440px] bg-[#1a1d24] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <Icon name="x" className="w-4 h-4" />
        </button>

        {/* Google Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg mb-3">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.28 1.48-1.13 2.73-2.4 3.58v3h3.88c2.27-2.09 3.54-5.17 3.54-8.82z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.92H1.3v3.09C3.26 21.3 7.31 24 12 24z" />
              <path fill="#FBBC05" d="M5.31 14.32A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.58.42-2.32V6.59H1.3A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.3 5.41l4.01-3.09z" />
              <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.94 1.19 15.23 0 12 0 7.31 0 3.26 2.7 1.3 6.59l4.01 3.09C6.25 6.86 8.89 4.77 12 4.77z" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-white">Sign in with Google</h2>
          <p className="text-xs text-slate-400 mt-1">Choose an account to continue to <span className="text-lime-300 font-medium">KnowledgeIQ</span></p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <Icon name="alert-triangle" className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Account Selection */}
        <div className="space-y-2 mb-5">
          {presetAccounts.map((acc) => (
            <button
              key={acc.id}
              onClick={() => {
                setSelectedAccount(acc.id)
                handleContinue(acc.id)
              }}
              disabled={loading}
              className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all text-left ${
                selectedAccount === acc.id
                  ? 'bg-white/10 border-lime-400/50 shadow-md shadow-lime-400/5'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shrink-0 shadow">
                {acc.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-white truncate">{acc.name}</div>
                <div className="text-xs text-slate-400 truncate">{acc.email}</div>
              </div>
              <Icon name="arrow-right" className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          ))}

          {/* Use another account option */}
          <button
            onClick={() => setSelectedAccount('custom')}
            disabled={loading}
            className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all text-left ${
              selectedAccount === 'custom'
                ? 'bg-white/10 border-lime-400/50'
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-slate-300 shrink-0">
              <Icon name="user-plus" className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-white">Use another Google account</div>
              <div className="text-xs text-slate-400">Sign in with any Gmail / Google Workspace</div>
            </div>
          </button>
        </div>

        {/* Custom Account Form */}
        {selectedAccount === 'custom' && (
          <div className="space-y-3 p-4 rounded-2xl bg-black/30 border border-white/5 mb-5 animate-fade-in">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Google Email Address</label>
              <input
                type="email"
                placeholder="your.email@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full bg-[#0B0F1A] border border-white/15 focus:border-lime-400 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Full Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-[#0B0F1A] border border-white/15 focus:border-lime-400 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none"
              />
            </div>
            <button
              onClick={() => handleContinue('custom')}
              disabled={loading || !customEmail.trim()}
              className="w-full bg-lime-400 hover:bg-lime-300 disabled:opacity-50 text-[#0B0F1A] font-semibold rounded-xl py-2.5 text-sm transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Icon name="loader-2" className="w-4 h-4 animate-spin" /> : 'Continue as Custom User'}
            </button>
          </div>
        )}

        {/* Privacy Note */}
        <div className="text-[11px] text-slate-500 text-center leading-relaxed">
          To continue, Google will securely share your name, email address, and profile picture with KnowledgeIQ.
        </div>
      </div>
    </div>
  )
}
