import React, { useState, useEffect } from 'react'
import Login from './pages/Login.jsx'
import SignUp from './pages/SignUp.jsx'
import SignUpManager from './pages/SignUpManager.jsx'
import ProfileSetup from './pages/ProfileSetup.jsx'
import Sidebar, { MobileNav } from './components/Sidebar.jsx'
import { Topbar, CommandPalette } from './components/Topbar.jsx'
import {
  EmployeeDashboard, EmployeeSkills, EmployeeAI, EmployeeTraining, EmployeeAssessments
} from './pages/EmployeePages.jsx'
import {
  HRDashboard, HRDirectory, HRMatrix, HRReports, GapAnalysis, HRForecasting, HRDepartments
} from './pages/HRPages.jsx'
import {
  AdminDashboard, AdminUsers, AdminRoles, AdminSkills, AdminAudit, AdminSettings
} from './pages/AdminPages.jsx'
import {
  ManagerDashboard, TeamSkillGapHeatmap, TeamProfilesOverview, ActionableInterventionsPanel
} from './pages/ManagerPages.jsx'
import { EmployeeSkills as SkillsShared } from './pages/EmployeePages.jsx'
import { ProfilePage, NotificationsPage } from './pages/SharedPages.jsx'
import { DeptHeadDashboard, DeptHeadBenchmarks, DeptHeadAllocation } from './pages/DeptHeadPages.jsx'
import { LdAdminDashboard, LdAdminCatalog, LdAdminPaths, LdAdminCerts } from './pages/LdAdminPages.jsx'
import api from './services/api.js'

export default function App() {
  const [authed, setAuthed] = useState(false)
  const [role, setRole] = useState('employee')
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('dashboard')
  const [dark, setDark] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [authScreen, setAuthScreen] = useState('login') // 'login' | 'signup'
  const [signUpRole, setSignUpRole] = useState('employee')
  const [pendingSetup, setPendingSetup] = useState(null) // holds authData for new users

  useEffect(() => {
    const storedToken = api.getToken()
    const storedUser = api.getCurrentUserFromStorage()

    // If no session at all, stay on login
    if (!storedToken || !storedUser) return

    // Guard: old "fallback" sessions had no real email (they came from the offline catch block).
    // If the stored user has no email or no token, force re-login so the user sees their real account.
    if (!storedUser.email) {
      api.logout()
      return
    }

    // Validate the token is still accepted by the live backend
    api.getCurrentUser()
      .then(liveUser => {
        // Backend returned the real user — use that as ground truth
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
        })
        setAuthed(true)
      })
      .catch(() => {
        // Token rejected by backend — force fresh login
        api.logout()
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
    })
    setPage('dashboard')
    setAuthed(true)
    setAuthScreen('login')
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
  }

  function nav(id) {
    setPage(id)
    setMobileNavOpen(false)
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
          onLogin={(appRole, authData) => handleLogin(appRole, authData, true)}
          onSwitchToLogin={() => setAuthScreen('login')}
          onSwitchToSignUpManager={() => setAuthScreen('signup-manager')}
        />
      )
    }
    if (authScreen === 'signup-manager') {
      return (
        <SignUpManager
          onLogin={(appRole, authData) => handleLogin(appRole, authData, false)}
          onSwitchToLogin={() => setAuthScreen('login')}
          onSwitchToSignUp={() => setAuthScreen('signup')}
        />
      )
    }
    return (
      <Login
        onLogin={handleLogin}
        onSwitchToSignUp={() => { setSignUpRole('employee'); setAuthScreen('signup') }}
        onSwitchToSignUpHR={() => { setSignUpRole('hr'); setAuthScreen('signup') }}
        onSwitchToSignUpManager={() => setAuthScreen('signup-manager')}
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
  if (page === 'profile') return <ProfilePage role={role} user={user} />
  if (page === 'notifications') return <NotificationsPage onNav={onNav} />
  if (page === 'gaps' && role !== 'manager' && role !== 'employee') return <GapAnalysis role={role} />

  if (role === 'employee') {
    switch (page) {
      case 'dashboard': return <EmployeeDashboard onNav={onNav} user={user} />
      case 'skills': return <EmployeeSkills onNav={onNav} />
      case 'ai': return <EmployeeAI user={user} onNav={onNav} />
      case 'training': return <EmployeeTraining user={user} onNav={onNav} />
      case 'assessments': return <EmployeeAssessments onNav={onNav} />
      default: return <NotFound />
    }
  }

  if (role === 'manager') {
    switch (page) {
      case 'dashboard': return <ManagerDashboard onNav={onNav} user={user} />
      case 'heatmap': return <TeamSkillGapHeatmap onNav={onNav} user={user} />
      case 'gaps': return <ManagerDashboard onNav={onNav} user={user} />
      case 'progress': return <TeamProfilesOverview onNav={onNav} user={user} />
      case 'interventions': return <ActionableInterventionsPanel onNav={onNav} user={user} />
      default: return <NotFound />
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
      default: return <NotFound />
    }
  }

  if (role === 'depthead') {
    switch (page) {
      case 'dashboard': return <DeptHeadDashboard onNav={onNav} user={user} />
      case 'benchmarks': return <DeptHeadBenchmarks />
      case 'allocation': return <DeptHeadAllocation />
      default: return <NotFound />
    }
  }

  if (role === 'ldadmin') {
    switch (page) {
      case 'dashboard': return <LdAdminDashboard onNav={onNav} user={user} />
      case 'catalog': return <LdAdminCatalog />
      case 'paths': return <LdAdminPaths />
      case 'certs': return <LdAdminCerts />
      default: return <NotFound />
    }
  }

  if (role === 'admin') {
    switch (page) {
      case 'dashboard': return <AdminDashboard onNav={onNav} user={user} />
      case 'users': return <AdminUsers />
      case 'roles': return <AdminRoles />
      case 'skills': return <AdminSkills />
      case 'audit': return <AdminAudit />
      case 'settings': return <AdminSettings />
      default: return <NotFound />
    }
  }

  return <NotFound />
}

function NotFound() {
  return <div className="text-slate-400 text-sm">Page not found.</div>
}
