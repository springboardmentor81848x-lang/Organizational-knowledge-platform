import React, { useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import Icon from '../components/Icon.jsx'
import api from '../services/api.js'

export default function Login({ onLogin, onSwitchToSignUp, onSwitchToSignUpManager, onSwitchToSignUpHR }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleLogin(e, overrideEmail, overridePassword) {
    if (e) e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const loginEmail = overrideEmail ?? email.trim()
      const loginPassword = overridePassword ?? password
      const authData = await api.login(loginEmail, loginPassword)
      const sysRole = (authData.systemRole || '').toUpperCase()
      const appRole = sysRole.includes('MANAGER') ? 'manager'
        : sysRole.includes('HR') ? 'hr'
        : sysRole.includes('HEAD') || sysRole.includes('DEPT') ? 'depthead'
        : sysRole.includes('L_AND_D') || sysRole.includes('LD') ? 'ldadmin'
        : sysRole.includes('ADMIN') ? 'admin'
        : 'employee'
      onLogin(appRole, authData)
    } catch (err) {
      setError(err.message || 'Incorrect email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDemoLogin(demoEmail, demoPassword) {
    // Directly call login with the credentials — don't rely on async state updates
    setEmail(demoEmail)
    setPassword(demoPassword)
    setLoading(true)
    setError(null)
    try {
      const authData = await api.login(demoEmail, demoPassword)
      const sysRole = (authData.systemRole || '').toUpperCase()
      const appRole = sysRole.includes('MANAGER') ? 'manager'
        : sysRole.includes('HR') ? 'hr'
        : sysRole.includes('HEAD') || sysRole.includes('DEPT') ? 'depthead'
        : sysRole.includes('L_AND_D') || sysRole.includes('LD') ? 'ldadmin'
        : sysRole.includes('ADMIN') ? 'admin'
        : 'employee'
      onLogin(appRole, authData)
    } catch (err) {
      setError(err.message || 'Demo login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true)
      setError(null)
      try {
        // Fetch user info from Google using access token
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        })
        if (!userInfoRes.ok) throw new Error('Failed to fetch Google user info')
        const googleUser = await userInfoRes.json()

        // Send the access token + user info to backend
        const authData = await api.googleLogin(tokenResponse.access_token, googleUser)
        const sysRole = (authData.systemRole || '').toUpperCase()
        const appRole = sysRole.includes('MANAGER') ? 'manager'
          : sysRole.includes('HR') ? 'hr'
          : sysRole.includes('HEAD') || sysRole.includes('DEPT') ? 'depthead'
          : sysRole.includes('L_AND_D') || sysRole.includes('LD') ? 'ldadmin'
          : sysRole.includes('ADMIN') ? 'admin'
          : 'employee'
        onLogin(appRole, authData)
      } catch (err) {
        setError(err.message || 'Google sign-in failed. Please try again.')
      } finally {
        setGoogleLoading(false)
      }
    },
    onError: (err) => {
      console.error('Google Login Error:', err)
      setError('Google sign-in was cancelled or failed. Please try again.')
    },
    flow: 'implicit'
  })

  const isLoading = loading || googleLoading

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-lime-400 flex items-center justify-center animate-pulse">
            <Icon name="brain-circuit" className="w-6 h-6 text-[#0B0F1A]" />
          </div>
          <div className="text-slate-400 text-sm">
            {googleLoading ? 'Signing in with Google…' : 'Signing you in…'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex bg-[#0B0F1A] relative overflow-hidden">
      <div className="grad-blob w-[420px] h-[420px] bg-lime-400/30 -top-20 -left-20"></div>
      <div className="grad-blob w-[380px] h-[380px] bg-indigo-500/30 top-1/3 -right-10" style={{ animationDelay: '-4s' }}></div>
      <div className="grad-blob w-[300px] h-[300px] bg-blue-500/20 bottom-0 left-1/4" style={{ animationDelay: '-8s' }}></div>

      {/* Left: brand / illustration */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-14 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lime-400 flex items-center justify-center">
            <Icon name="brain-circuit" className="w-5 h-5 text-[#0B0F1A]" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-lg leading-none">KnowledgeIQ</div>
            <div className="text-slate-400 text-xs mt-0.5">Northwind Labs</div>
          </div>
        </div>

        <div className="max-w-md fade-in">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-lime-300 bg-lime-400/10 border border-lime-400/20 rounded-full px-3 py-1 mb-6">
            <Icon name="sparkles" className="w-3.5 h-3.5" /> AI-powered workforce intelligence
          </span>
          <h1 className="font-display text-4xl xl:text-[2.75rem] font-bold text-white leading-[1.1] mb-5">
            Close every knowledge gap before it costs you.
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            KnowledgeIQ maps organizational skills in real time, flags critical gaps, and routes every employee to the exact learning path that closes them.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-4"><div className="text-lime-300 font-display text-2xl font-bold">1,284</div><div className="text-slate-400 text-xs mt-1">Employees mapped</div></div>
            <div className="glass rounded-2xl p-4"><div className="text-lime-300 font-display text-2xl font-bold">96%</div><div className="text-slate-400 text-xs mt-1">Skill coverage</div></div>
            <div className="glass rounded-2xl p-4"><div className="text-lime-300 font-display text-2xl font-bold">3.4x</div><div className="text-slate-400 text-xs mt-1">Learning ROI</div></div>
          </div>
        </div>

        <div className="text-slate-500 text-xs">© 2026 Northwind Labs. All rights reserved.</div>
      </div>

      {/* Right: login card */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <form onSubmit={handleLogin} className="w-full max-w-md glass rounded-3xl p-8 sm:p-10 fade-in">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-lime-400 flex items-center justify-center">
              <Icon name="brain-circuit" className="w-[18px] h-[18px] text-[#0B0F1A]" />
            </div>
            <div className="font-display font-bold text-white">KnowledgeIQ</div>
          </div>

          <h2 className="font-display text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-slate-400 text-sm mb-8">Sign in to your KnowledgeIQ workspace</p>

          <div className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <Icon name="alert-circle" className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">Email address</label>
              <div className="relative">
                <Icon name="mail" className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  placeholder="your@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">Password</label>
              <div className="relative">
                <Icon name="lock" className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  placeholder="Your password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400/50" />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                <input type="checkbox" className="switch" defaultChecked />
                Remember me
              </label>
              <a href="#" className="text-lime-300 hover:text-lime-200 font-medium">Forgot password?</a>
            </div>

            <button type="submit" id="login-submit"
              className="w-full bg-lime-400 hover:bg-lime-300 text-[#0B0F1A] font-semibold rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2 shadow-[0_8px_24px_-6px_rgba(166,226,46,0.5)]">
              Sign in <Icon name="arrow-right" className="w-4 h-4" />
            </button>

            {/* Google OAuth */}
            <button
              type="button"
              id="login-google"
              onClick={() => googleLogin()}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-200 font-medium rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.28 1.48-1.13 2.73-2.4 3.58v3h3.88c2.27-2.09 3.54-5.17 3.54-8.82z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.92H1.3v3.09C3.26 21.3 7.31 24 12 24z" />
                <path fill="#FBBC05" d="M5.31 14.32A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.58.42-2.32V6.59H1.3A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.3 5.41l4.01-3.09z" />
                <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.94 1.19 15.23 0 12 0 7.31 0 3.26 2.7 1.3 6.59l4.01 3.09C6.25 6.86 8.89 4.77 12 4.77z" />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 py-1">
              <div className="h-px bg-white/10 flex-1"></div>
              <span className="text-xs text-slate-500">quick demo login</span>
              <div className="h-px bg-white/10 flex-1"></div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="demo-employee"
                onClick={() => handleDemoLogin('employee@northwind.io', 'password123')}
                className="bg-white/5 hover:bg-lime-400/10 hover:border-lime-400/30 border border-white/10 rounded-xl py-2 text-xs font-medium text-slate-300 hover:text-lime-300 transition-all text-center"
              >
                👤 Employee
              </button>
              <button
                type="button"
                id="demo-manager"
                onClick={() => handleDemoLogin('manager@northwind.io', 'password123')}
                className="bg-white/5 hover:bg-lime-400/10 hover:border-lime-400/30 border border-white/10 rounded-xl py-2 text-xs font-medium text-slate-300 hover:text-lime-300 transition-all text-center"
              >
                👔 Manager
              </button>
              <button
                type="button"
                id="demo-hr"
                onClick={() => handleDemoLogin('hr@northwind.io', 'password123')}
                className="bg-white/5 hover:bg-lime-400/10 hover:border-lime-400/30 border border-white/10 rounded-xl py-2 text-xs font-medium text-slate-300 hover:text-lime-300 transition-all text-center"
              >
                👥 HR Lead
              </button>
              <button
                type="button"
                id="demo-depthead"
                onClick={() => handleDemoLogin('depthead@northwind.io', 'password123')}
                className="bg-white/5 hover:bg-lime-400/10 hover:border-lime-400/30 border border-white/10 rounded-xl py-2 text-xs font-medium text-slate-300 hover:text-lime-300 transition-all text-center"
              >
                🏛️ Dept Head
              </button>
              <button
                type="button"
                id="demo-ldadmin"
                onClick={() => handleDemoLogin('ldadmin@northwind.io', 'password123')}
                className="bg-white/5 hover:bg-lime-400/10 hover:border-lime-400/30 border border-white/10 rounded-xl py-2 text-xs font-medium text-slate-300 hover:text-lime-300 transition-all text-center"
              >
                🎓 L&D Admin
              </button>
              <button
                type="button"
                id="demo-admin"
                onClick={() => handleDemoLogin('admin@northwind.io', 'password123')}
                className="bg-white/5 hover:bg-lime-400/10 hover:border-lime-400/30 border border-white/10 rounded-xl py-2 text-xs font-medium text-slate-300 hover:text-lime-300 transition-all text-center"
              >
                🛡️ Admin
              </button>
            </div>

            {onSwitchToSignUp && (
              <>
                <div className="flex items-center gap-3 py-1">
                  <div className="h-px bg-white/10 flex-1" />
                  <span className="text-xs text-slate-500">new to KnowledgeIQ?</span>
                  <div className="h-px bg-white/10 flex-1" />
                </div>
                <div className="space-y-2">
                  <button
                    type="button"
                    id="login-go-signup"
                    onClick={onSwitchToSignUp}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-lime-400/30 text-slate-200 font-medium rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Icon name="user-plus" className="w-4 h-4 text-lime-300" /> Join as Employee
                  </button>
                  {onSwitchToSignUpHR && (
                    <button
                      type="button"
                      id="login-go-signup-hr"
                      onClick={onSwitchToSignUpHR}
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-lime-400/30 text-slate-200 font-medium rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Icon name="user-check" className="w-4 h-4 text-lime-300" /> Join as HR Specialist
                    </button>
                  )}
                  {onSwitchToSignUpManager && (
                    <button
                      type="button"
                      id="login-go-signup-manager"
                      onClick={onSwitchToSignUpManager}
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-lime-400/30 text-slate-200 font-medium rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Icon name="users" className="w-4 h-4 text-lime-300" /> Register as Manager
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
