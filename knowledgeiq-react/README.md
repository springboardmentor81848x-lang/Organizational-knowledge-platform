# KnowledgeIQ — React App

A role-based (Employee / HR / Admin) Organizational Knowledge Gap Intelligence Platform, built with React + Vite, Tailwind, Recharts, and lucide-react.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

To build a production bundle:

```bash
npm run build
npm run preview
```

## Structure

```
src/
  data.js                 mock data + nav config for all three roles
  App.jsx                 auth state, routing, layout shell
  components/
    Icon.jsx               central icon name -> lucide-react component map
    Bits.jsx                StatCard, Pill, Gauge, SectionHead, etc.
    Sidebar.jsx             role-aware sidebar + mobile nav
    Topbar.jsx               topbar + command palette (⌘K)
  pages/
    Login.jsx                role-select login screen
    EmployeePages.jsx        Employee dashboard, skills, AI, training, assessments
    HRPages.jsx               HR dashboard, directory, skill matrix, reports, gap analysis
    AdminPages.jsx            Admin dashboard, users, roles, audit log, settings
    SharedPages.jsx           Profile, Notifications (used by all roles)
```

## Notes on fonts

The Sora/Inter webfonts load from Google Fonts with `display=swap`, and the whole
app has a system-font fallback stack (`ui-sans-serif, system-ui, -apple-system, sans-serif`)
set directly in `index.html`. If the webfont fails to load (offline, blocked network),
text still renders immediately in the fallback — it should never appear invisible or blank.

## Demo login

Pick any role tab (Employee / HR / Admin) on the login screen and click **Sign in** —
this is a front-end demo with mock data, so no real credentials are required.
