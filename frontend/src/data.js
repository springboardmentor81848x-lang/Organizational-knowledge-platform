export const ROLE_META = {
  employee: { label: 'Employee', desc: 'Track your growth, close skill gaps, follow AI-guided paths.' },
  manager: { label: 'Team Lead / Manager', desc: 'Team skill coverage, high-risk gap alerts & team heatmap.' },
  hr: { label: 'HR Specialist', desc: 'Org-wide skills intelligence, strategic forecasting & analytics.' },
  depthead: { label: 'Department Head', desc: 'Department strategy, benchmark approval & budget allocation.' },
  ldadmin: { label: 'L&D Admin / Mentor', desc: 'Training catalog, adaptive paths & cert verification.' },
  admin: { label: 'System Admin', desc: 'Manage users, roles, permissions and platform health.' }
}

export const NAV = {
  employee: [
    { section: 'Overview', items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
      { id: 'skills', label: 'Skill Inventory', icon: 'layers' }
    ]},
    { section: 'Learning', items: [
      { id: 'ai', label: 'AI Recommendations', icon: 'sparkles' },
      { id: 'mentorship', label: 'Mentorship & Sharing', icon: 'users' },
      { id: 'training', label: 'Training Portal', icon: 'graduation-cap' },
      { id: 'assessments', label: 'Assessment Portal', icon: 'clipboard-check' }
    ]},
    { section: 'Account', items: [
      { id: 'profile', label: 'Profile', icon: 'user-circle' },
      { id: 'notifications', label: 'Notifications', icon: 'bell' }
    ]}
  ],
  manager: [
    { section: 'Overview', items: [
      { id: 'dashboard', label: 'Team Dashboard', icon: 'layout-dashboard' },
      { id: 'heatmap', label: 'Department Team Heatmap', icon: 'grid' },
      { id: 'gaps', label: 'Team Skill Gaps', icon: 'search' }
    ]},
    { section: 'Management', items: [
      { id: 'progress', label: 'Employee Progress Tracker', icon: 'trending-up' },
      { id: 'interventions', label: 'Learning Interventions', icon: 'sparkles' }
    ]},
    { section: 'Account', items: [
      { id: 'profile', label: 'Profile', icon: 'user-circle' },
      { id: 'notifications', label: 'Notifications', icon: 'bell' }
    ]}
  ],
  hr: [
    { section: 'Overview', items: [
      { id: 'dashboard', label: 'HR Dashboard', icon: 'layout-dashboard' },
      { id: 'directory', label: 'Employee Directory', icon: 'users' },
      { id: 'matrix', label: 'Workforce Skill Inventory', icon: 'grid' },
      { id: 'departments', label: 'Org Departments', icon: 'building' }
    ]},
    { section: 'Intelligence', items: [
      { id: 'gaps', label: 'Org Gap Intelligence', icon: 'search' },
      { id: 'forecasting', label: 'Strategic Skill Forecast', icon: 'trending-up' },
      { id: 'reports', label: 'Reports & Analytics', icon: 'bar-chart' }
    ]},
    { section: 'Account', items: [
      { id: 'profile', label: 'Profile', icon: 'user-circle' },
      { id: 'notifications', label: 'Notifications', icon: 'bell' }
    ]}
  ],
  depthead: [
    { section: 'Department', items: [
      { id: 'dashboard', label: 'Department Overview', icon: 'layout-dashboard' },
      { id: 'benchmarks', label: 'Role Benchmarks Approval', icon: 'check-square' },
      { id: 'allocation', label: 'Resource & Budget Allocation', icon: 'pie-chart' }
    ]},
    { section: 'Account', items: [
      { id: 'profile', label: 'Profile', icon: 'user-circle' },
      { id: 'notifications', label: 'Notifications', icon: 'bell' }
    ]}
  ],
  ldadmin: [
    { section: 'Catalog & Paths', items: [
      { id: 'dashboard', label: 'L&D Management Center', icon: 'layout-dashboard' },
      { id: 'catalog', label: 'Internal/External Catalog', icon: 'graduation-cap' },
      { id: 'paths', label: 'Adaptive Learning Path Builder', icon: 'map' },
      { id: 'certs', label: 'Certification Verification', icon: 'award' }
    ]},
    { section: 'Mentorship', items: [
      { id: 'mentors', label: 'Mentor Management', icon: 'users' }
    ]},
    { section: 'Account', items: [
      { id: 'profile', label: 'Profile', icon: 'user-circle' },
      { id: 'notifications', label: 'Notifications', icon: 'bell' }
    ]}
  ],
  admin: [
    { section: 'System', items: [
      { id: 'dashboard', label: 'Admin Dashboard', icon: 'layout-dashboard' },
      { id: 'users', label: 'User Management', icon: 'users' },
      { id: 'roles', label: 'Roles & Access Control', icon: 'shield-check' }
    ]},
    { section: 'Platform', items: [
      { id: 'skills', label: 'Skill Management', icon: 'layers' },
      { id: 'audit', label: 'Security Audit Logs', icon: 'scroll-text' },
      { id: 'settings', label: 'System Settings', icon: 'settings' }
    ]},
    { section: 'Account', items: [
      { id: 'profile', label: 'Profile', icon: 'user-circle' },
      { id: 'notifications', label: 'Notifications', icon: 'bell' }
    ]}
  ]
}
