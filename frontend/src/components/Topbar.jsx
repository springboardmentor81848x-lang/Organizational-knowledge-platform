import React, { useState, useEffect } from 'react'
import Icon from './Icon.jsx'
import { NAV, ROLE_META } from '../data.js'
import api from '../services/api.js'

export function Topbar({ role, dark, onToggleDark, onOpenPalette, onNav, onToggleMobile }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchUnread = () => {
    api.getUnreadNotificationCount()
      .then(res => {
        if (res && res.unreadCount !== undefined) {
          setUnreadCount(res.unreadCount)
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchUnread()
    const interval = setInterval(fetchUnread, 10000)
    return () => clearInterval(interval)
  }, [])

  const toggleDropdown = () => {
    if (!showDropdown) {
      setLoading(true)
      api.getUserNotifications()
        .then(data => {
          const list = (data || []).filter(n => {
            const title = n.title || ''
            const message = n.message || ''
            return !title.includes('High skill gap detected') && !message.includes('100% for your current role benchmark')
          })
          setNotifications(list)
        })
        .catch(err => console.log('Error fetching notifications:', err))
        .finally(() => setLoading(false))
    }
    setShowDropdown(!showDropdown)
  }

  const handleMarkRead = async (id, e) => {
    e.stopPropagation()
    try {
      await api.markNotificationRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.log('Failed to mark read:', err)
    }
  }

  const handleMarkAllRead = async (e) => {
    e.stopPropagation()
    try {
      await api.markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.log('Failed to mark all read:', err)
    }
  }

  function getNotificationIcon(type) {
    const t = (type || '').toUpperCase()
    if (t.includes('CRITICAL')) return 'alert-triangle'
    if (t.includes('ALERT')) return 'alert-circle'
    if (t.includes('IMPROVED')) return 'trending-up'
    if (t.includes('RESOLVED')) return 'check-circle-2'
    if (t.includes('RECOMMENDATION')) return 'sparkles'
    return 'bell'
  }

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#0F1420]/80 backdrop-blur-md border-b border-slate-200/70 dark:border-white/5 px-4 sm:px-6 py-3 flex items-center gap-3">
      <button onClick={onToggleMobile} className="md:hidden p-2 rounded-lg border border-slate-200 dark:border-white/10">
        <Icon name="menu" className="w-4 h-4" />
      </button>
      <button onClick={onOpenPalette}
        className="flex-1 max-w-xl flex items-center gap-2 bg-slate-100 dark:bg-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-400 hover:bg-slate-200/70 dark:hover:bg-white/10 transition-colors">
        <Icon name="search" className="w-4 h-4" />
        <span className="flex-1 text-left">Search people, skills, courses…</span>
        <kbd className="text-[10px] bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded px-1.5 py-0.5">⌘K</kbd>
      </button>

      <div className="flex items-center gap-1.5 sm:gap-2 ml-auto relative">
        <span className="hidden lg:inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-300 rounded-full px-3 py-1.5">
          <Icon name="shield-check" className="w-3 h-3" /> {ROLE_META[role].label} workspace
        </span>

        {/* Bell Icon & Dropdown Container */}
        <div className="relative">
          <button 
            onClick={toggleDropdown} 
            className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors focus:outline-none"
            title="Notifications">
            <Icon name="bell" className="w-[18px] h-[18px] text-slate-600 dark:text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Quick Notification Dropdown Popover */}
          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowDropdown(false)}></div>
              
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#0F1420] border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-2xl z-40 overflow-hidden fade-in">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-800 dark:text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead} 
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline mr-1">
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setShowDropdown(false)}
                      className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                      title="Close notification panel">
                      <Icon name="x" className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                  {loading ? (
                    <div className="p-6 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
                      <Icon name="loader-2" className="w-4 h-4 animate-spin text-indigo-500" /> Loading notifications…
                    </div>
                  ) : notifications.length > 0 ? (
                    notifications.slice(0, 5).map((n, idx) => {
                      const isRead = n.isRead || n.read
                      const iconName = getNotificationIcon(n.eventType || n.type)
                      return (
                        <div 
                          key={n.id || idx}
                          onClick={() => {
                            setShowDropdown(false)
                            onNav('notifications')
                          }}
                          className={`p-3.5 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 flex items-start gap-3 ${
                            !isRead ? 'bg-indigo-50/30 dark:bg-indigo-500/5' : ''
                          }`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            n.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300' :
                            n.severity === 'HIGH' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300' :
                            'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300'
                          }`}>
                            <Icon name={iconName} className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{n.title}</h5>
                              {!isRead && (
                                <button 
                                  onClick={(e) => handleMarkRead(n.id, e)}
                                  className="w-2 h-2 rounded-full bg-indigo-500 hover:scale-125 transition-transform" 
                                  title="Mark as read" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug">{n.message}</p>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      <Icon name="bell-off" className="w-6 h-6 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                      No notifications yet
                    </div>
                  )}
                </div>

                <div className="p-2.5 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/10 text-center">
                  <button 
                    onClick={() => {
                      setShowDropdown(false)
                      onNav('notifications')
                    }}
                    className="w-full text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline py-1">
                    View all notifications →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <button onClick={onToggleDark} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
          <Icon name={dark ? 'sun' : 'moon'} className="w-[18px] h-[18px]" />
        </button>
        <button onClick={onOpenPalette} className="hidden sm:flex items-center gap-1.5 bg-[#0B0F1A] text-white text-xs font-medium rounded-xl px-3.5 py-2.5 hover:bg-[#0B0F1A]/90 transition-colors">
          <Icon name="sparkles" className="w-3.5 h-3.5 text-lime-400" /> Ask AI
        </button>
      </div>
    </header>
  )
}

export function CommandPalette({ role, open, onClose, onNav }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!open) return null
  const items = NAV[role].flatMap(s => s.items)

  return (
    <div className="fixed inset-0 z-50 modal-backdrop flex items-start justify-center pt-24 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-lg bg-white dark:bg-[#0F1420] rounded-2xl shadow-2xl overflow-hidden fade-in">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-white/10">
          <Icon name="search" className="w-4 h-4 text-slate-400" />
          <input autoFocus placeholder="Jump to a page…" className="flex-1 bg-transparent outline-none text-sm dark:text-white" />
          <kbd className="text-[10px] bg-slate-100 dark:bg-white/10 rounded px-1.5 py-0.5 text-slate-400">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {items.map(it => (
            <button key={it.id} onClick={() => { onClose(); onNav(it.id) }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-left">
              <Icon name={it.icon} className="w-4 h-4 text-slate-500 dark:text-slate-300" />
              <span className="text-sm text-slate-700 dark:text-slate-200">{it.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
