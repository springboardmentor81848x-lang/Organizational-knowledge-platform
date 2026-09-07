import React, { useState, useEffect, useCallback } from 'react'
import Login from './pages/Login.jsx'
import SignUp from './pages/SignUp.jsx'
import SignUpManager from './pages/SignUpManager.jsx'
import ProfileSetup from './pages/ProfileSetup.jsx'
import Sidebar, { MobileNav } from './components/Sidebar.jsx'
import { Topbar, CommandPalette } from './components/Topbar.jsx'
import {
  EmployeeDashboard, EmployeeSkills, EmployeeAI, EmployeeTraining, EmployeeAssessments, EmployeeMentorship
} from './pages/EmployeePages.jsx'
import {
  HRDashboard, HRDirectory, HRMatrix, HRReports, GapAnalysis, HRForecasting, HRDepartments
} from './pages/HRPages.jsx'
import {
  AdminDashboard, AdminUsers, AdminRoles, AdminSkills, AdminAudit, AdminSettings
} from './pages/AdminPages.jsx'
import {
  ManagerDashboard, TeamSkillGapHeatmap, TeamProfilesOverview, ActionableInterventionsPanel, EmployeeProgressTracker,
  ManagerAssessmentsPage, ManagerReportsPage
} from './pages/ManagerPages.jsx'
import { EmployeeSkills as SkillsShared } from './pages/EmployeePages.jsx'
import { ProfilePage, NotificationsPage } from './pages/SharedPages.jsx'
import { DeptHeadDashboard, DeptHeadBenchmarks, DeptHeadAllocation } from './pages/DeptHeadPages.jsx'
import { LdAdminDashboard, LdAdminCatalog, LdAdminPaths, LdAdminCerts, LdAdminMentorManagement } from './pages/LdAdminPages.jsx'
import api from './services/api.js'

function parseRouteFromLocation() {
  const hash = window.location.hash || ''
  if (hash.startsWith('#signup')) {
    const parts = hash.split('?')
    const params = new URLSearchParams(parts[1] || '')
    const roleParam = params.get('role') || 'employee'
    return { isAuth: true, authScreen: 'signup', signUpRole: roleParam, page: 'dashboard' }
  }
  if (hash.startsWith('#login')) {
    return { isAuth: true, authScreen: 'login', signUpRole: 'employee', page: 'dashboard' }
  }
  if (hash.startsWith('#')) {
    const clean = hash.replace(/^#\/?/, '').split('?')[0]
    if (clean) return { isAuth: false, page: clean, authScreen: 'login', signUpRole: 'employee' }
  }
  return { isAuth: false, page: 'dashboard', authScreen: 'login', signUpRole: 'employee' }
}

export default function App() {
  const initialRoute = parseRouteFromLocation()

  const [authed, setAuthed] = useState(false)
  const [role, setRole] = useState('employee')
  const [user, setUser] = useState(null)
  const [page, setPage] = useState(initialRoute.page || 'dashboard')
  const [dark, setDark] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [authScreen, setAuthScreen] = useState(initialRoute.authScreen || 'login') // 'login' | 'signup'
  const [signUpRole, setSignUpRole] = useState(initialRoute.signUpRole || 'employee')
  const [pendingSetup, setPendingSetup] = useState(null) // holds authData for new users

  // ── Browser History & Back/Forward Button Synchronization ──────────────────
  useEffect(() => {
    function handlePopState(e) {
      const currentRoute = parseRouteFromLocation()
      if (!authed) {
        if (currentRoute.authScreen === 'signup') {
          setAuthScreen('signup')
          setSignUpRole(currentRoute.signUpRole)
        } else {
          setAuthScreen('login')
        }
      } else {
        const targetPage = currentRoute.page || 'dashboard'
        setPage(targetPage)
      }
      setMobileNavOpen(false)
      setPaletteOpen(false)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [authed])

  // ── Check Existing Session on Startup ──────────────────────────────────────
  useEffect(() => {
    const storedToken = api.getToken()
    const storedUser = api.getCurrentUserFromStorage()

    // If no session at all, sync hash if empty
    if (!storedToken || !storedUser) {
      if (!window.location.hash) {
        window.history.replaceState({ authed: false, authScreen: 'login' }, '', '#login')
      }
      return
    }

    // Guard: old sessions with missing emails
    if (!storedUser.email) {
      api.logout()
      window.history.replaceState({ authed: false, authScreen: 'login' }, '', '#login')
      return
    }

    // Validate the token is still accepted by the live backend
    api.getCurrentUser()
      .then(liveUser => {
        const fullName = liveUser.fullName || liveUser.full_name || storedUser.fullName || ''
        const sysRole = (liveUser.systemRole || storedUser.systemRole || '').toUpperCase()
        const appRole = sysRole.includes('MANAGER') ? 'manager'
          : sysRole.includes('HR') ? 'hr'
          : sysRole.includes('HEAD') || sysRole.includes('DEPT') ? 'depthead'
          : sysRole.includes('L_AND_D') || sysRole.includes('LD') ? 'ldadmin'
          : sysRole.includes('ADMIN') ? 'admin'
          : 'employee'

        setRole(appRole)
        setUser({
          name: fullName || 'You',
          fullName: fullName || 'You',
          title: liveUser.title || liveUser.roleTitle || storedUser.roleTitle || storedUser.department
            || (appRole === 'employee' ? 'Employee'
              : appRole === 'manager' ? 'Team Lead / Manager'
              : appRole === 'hr' ? 'HR Specialist'
              : appRole === 'depthead' ? 'Department Head'
              : appRole === 'ldadmin' ? 'L&D Admin'
              : 'Administrator'),
          initials: fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?',
          email: liveUser.email || storedUser.email,
          systemRole: liveUser.systemRole || storedUser.systemRole,
          company: liveUser.company || storedUser.company || '',
          bio: liveUser.bio || storedUser.bio || '',
          department: liveUser.department || storedUser.department || '',
          manager: liveUser.manager || storedUser.manager || null,
        })
        setAuthed(true)

        // If on initial login/signup hash, navigate to current tab or dashboard
        const currentRoute = parseRouteFromLocation()
        const initialPage = (currentRoute.page && currentRoute.page !== 'dashboard') ? currentRoute.page : 'dashboard'
        setPage(initialPage)
        window.history.replaceState({ authed: true, page: initialPage, role: appRole }, '', `#${initialPage}`)
      })
      .catch(() => {
        // Token rejected by backend — force fresh login
        api.logout()
        setAuthed(false)
        window.history.replaceState({ authed: false, authScreen: 'login' }, '', '#login')
      })
  }, [])

  function handleLogin(selectedRole, authData, isNewUser = false) {
    if (isNewUser) {
      // Show profile setup before entering the app
      setPendingSetup({ selectedRole, authData })
      return
    }
    const fullName = authData.fullName || authData.full_name || ''
    setRole(selectedRole)
    setUser({
      name: fullName || 'You',
      fullName: fullName || 'You',
      title: authData.roleTitle || authData.title || authData.department
        || (selectedRole === 'employee' ? 'Employee'
          : selectedRole === 'manager' ? 'Team Lead / Manager'
          : selectedRole === 'hr' ? 'HR Specialist'
          : selectedRole === 'depthead' ? 'Department Head'
          : selectedRole === 'ldadmin' ? 'L&D Admin'
          : 'Administrator'),
      initials: fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?',
      email: authData.email,
      systemRole: authData.systemRole,
      company: authData.company || authData.organization || '',
      bio: authData.bio || '',
      department: authData.department || '',
      manager: authData.manager || null,
    })
    setPage('dashboard')
    setAuthed(true)
    setAuthScreen('login')
    window.history.replaceState({ authed: true, page: 'dashboard', role: selectedRole }, '', '#dashboard')
  }

  function handleSetupComplete(updatedAuthData) {
    if (!pendingSetup) return
    handleLogin(pendingSetup.selectedRole, updatedAuthData, false)
    setPendingSetup(null)
  }

  function handleLogout() {
    api.logout()
    setAuthed(false)
    setRole('employee')
    setUser(null)
    setAuthScreen('login')
    window.history.replaceState({ authed: false, authScreen: 'login' }, '', '#login')
  }

  // ── Tab & Page Navigation with History Pushing ─────────────────────────────
  function nav(id, replace = false) {
    setPage(id)
    setMobileNavOpen(false)
    const targetHash = `#${id}`
    if (replace) {
      window.history.replaceState({ authed: true, page: id, role }, '', targetHash)
    } else {
      window.history.pushState({ authed: true, page: id, role }, '', targetHash)
    }
  }

  // ── Switch between Login and Sign Up with History Tracking ──────────────────
  function switchAuthScreen(screen, roleKey = 'employee', replace = false) {
    setAuthScreen(screen)
    setSignUpRole(roleKey)
    const targetHash = screen === 'signup'
      ? `#signup${roleKey ? `?role=${roleKey}` : ''}`
      : '#login'

    if (replace) {
      window.history.replaceState({ authed: false, authScreen: screen, signUpRole: roleKey }, '', targetHash)
    } else {
      window.history.pushState({ authed: false, authScreen: screen, signUpRole: roleKey }, '', targetHash)
    }
  }

  if (pendingSetup) {
    return (
      <ProfileSetup
        authData={pendingSetup.authData}
        onComplete={handleSetupComplete}
      />
    )
  }

  if (!authed) {
    if (authScreen === 'signup') {
      return (
        <SignUp
          initialRole={signUpRole}
          onLogin={(appRole, authData, isNewUser) => handleLogin(appRole, authData, isNewUser)}
          onSwitchToLogin={() => switchAuthScreen('login')}
          onSwitchToSignUpManager={() => switchAuthScreen('signup', 'manager')}
        />
      )
    }
    if (authScreen === 'signup-manager') {
      return (
        <SignUpManager
          onLogin={(appRole, authData) => handleLogin(appRole, authData, false)}
          onSwitchToLogin={() => switchAuthScreen('login')}
          onSwitchToSignUp={() => switchAuthScreen('signup', 'employee')}
        />
      )
    }
    return (
      <Login
        onLogin={handleLogin}
        onSwitchToSignUp={(roleKey = 'employee') => switchAuthScreen('signup', roleKey)}
        onSwitchToSignUpHR={() => switchAuthScreen('signup', 'hr')}
        onSwitchToSignUpManager={() => switchAuthScreen('signup', 'manager')}
      />
    )
  }

  const defaultUser = user || {
    name: 'You',
    title: 'KnowledgeIQ User',
    initials: '?'
  }

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen flex bg-[#F5F6FB] text-slate-800 dark:bg-[#0B0F1A] dark:text-slate-200 transition-colors">
        <Sidebar role={role} page={page} onNav={nav} onLogout={handleLogout} user={defaultUser} />

        <div className="flex-1 min-w-0 flex flex-col">
          <Topbar
            role={role}
            dark={dark}
            onToggleDark={() => setDark(!dark)}
            onOpenPalette={() => setPaletteOpen(true)}
            onNav={nav}
            onToggleMobile={() => setMobileNavOpen(!mobileNavOpen)}
          />
          <MobileNav role={role} page={page} onNav={nav} open={mobileNavOpen} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1500px] w-full mx-auto">
            <div className="fade-in" key={role + page}>
              <PageRouter role={role} page={page} onNav={nav} user={defaultUser} />
            </div>
          </main>
        </div>
      </div>

      <CommandPalette role={role} open={paletteOpen} onClose={() => setPaletteOpen(false)} onNav={nav} />
    </div>
  )
}

function PageRouter({ role, page, onNav, user }) {
  if (page === 'profile') return <ProfilePage role={role} user={user} onNav={onNav} />
  if (page === 'notifications') return <NotificationsPage onNav={onNav} />
  if (page === 'gaps' && role !== 'manager' && role !== 'employee') return <GapAnalysis role={role} onNav={onNav} />

  if (role === 'employee') {
    switch (page) {
      case 'dashboard': return <EmployeeDashboard onNav={onNav} user={user} />
      case 'skills': return <EmployeeSkills onNav={onNav} />
      case 'ai': return <EmployeeAI user={user} onNav={onNav} />
      case 'mentorship': return <EmployeeMentorship user={user} onNav={onNav} />
      case 'training': return <EmployeeTraining user={user} onNav={onNav} />
      case 'assessments': return <EmployeeAssessments onNav={onNav} initialTab="ai" />
      default: return <NotFound onNav={onNav} />
    }
  }

  if (role === 'manager') {
    switch (page) {
      case 'dashboard': return <ManagerDashboard onNav={onNav} user={user} />
      case 'heatmap': return <ManagerDashboard initialTab="heatmap" onNav={onNav} user={user} />
      case 'gaps': return <ManagerDashboard onNav={onNav} user={user} />
      case 'progress': return <EmployeeProgressTracker user={user} onNav={onNav} />
      case 'interventions': return <ManagerDashboard initialTab="interventions" onNav={onNav} user={user} />
      case 'assessments': return <ManagerAssessmentsPage user={user} onNav={onNav} />
      case 'reports': return <ManagerReportsPage user={user} onNav={onNav} />
      default: return <NotFound onNav={onNav} />
    }
  }

  if (role === 'hr') {
    switch (page) {
      case 'dashboard': return <HRDashboard onNav={onNav} user={user} />
      case 'directory': return <HRDirectory user={user} onNav={onNav} />
      case 'matrix': return <HRMatrix user={user} onNav={onNav} />
      case 'forecasting': return <HRForecasting user={user} onNav={onNav} />
      case 'reports': return <HRReports user={user} onNav={onNav} />
      case 'departments': return <HRDepartments user={user} onNav={onNav} />
      default: return <NotFound onNav={onNav} />
    }
  }

  if (role === 'depthead') {
    switch (page) {
      case 'dashboard': return <DeptHeadDashboard onNav={onNav} user={user} />
      case 'benchmarks': return <DeptHeadBenchmarks onNav={onNav} />
      case 'allocation': return <DeptHeadAllocation onNav={onNav} />
      default: return <NotFound onNav={onNav} />
    }
  }

  if (role === 'ldadmin') {
    switch (page) {
      case 'dashboard': return <LdAdminDashboard onNav={onNav} user={user} />
      case 'catalog': return <LdAdminCatalog onNav={onNav} />
      case 'paths': return <LdAdminPaths onNav={onNav} />
      case 'certs': return <LdAdminCerts onNav={onNav} />
      case 'mentors': return <LdAdminMentorManagement onNav={onNav} user={user} />
      default: return <NotFound onNav={onNav} />
    }
  }

  if (role === 'admin') {
    switch (page) {
      case 'dashboard': return <AdminDashboard onNav={onNav} user={user} />
      case 'users': return <AdminUsers onNav={onNav} />
      case 'roles': return <AdminRoles onNav={onNav} />
      case 'skills': return <AdminSkills onNav={onNav} />
      case 'audit': return <AdminAudit onNav={onNav} />
      case 'settings': return <AdminSettings onNav={onNav} />
      default: return <NotFound onNav={onNav} />
    }
  }

  return <NotFound onNav={onNav} />
}

function NotFound({ onNav }) {
  return (
    <div className="p-8 text-center space-y-4">
      <div className="text-slate-400 text-sm">Page not found.</div>
      {onNav && (
        <button
          onClick={() => onNav('dashboard')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-lime-400 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10 transition-colors"
        >
          Return to Dashboard
        </button>
      )}
    </div>
  )
}
