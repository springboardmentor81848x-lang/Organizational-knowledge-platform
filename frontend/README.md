# KnowledgeIQ — React + Vite App

A role-based Organizational Knowledge Gap Intelligence Platform, built with React + Vite, Tailwind CSS, Recharts, and Lucide Icons.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

To build a production bundle:

```bash
npm run build
npm run preview
```

## Structure

```
src/
  data.js                 Navigation definitions and metadata for all 6 roles
  App.jsx                 Authentication state, multi-role routing, layout shell
  components/
    Icon.jsx              Central icon mapping to lucide-react
    Bits.jsx              Shared UI components (StatCard, Pill, Gauge, SectionHead, Modal, etc.)
    Sidebar.jsx           Role-aware responsive sidebar
    Topbar.jsx            Top navigation bar + notifications + quick profile switcher
  pages/
    EmployeePages.jsx     Employee dashboard, skill inventory, AI learning paths, mentorship, certs
    ManagerPages.jsx      Manager team skill matrix, critical gaps, budget recommendations
    HRPages.jsx           HR directory, workforce skill heatmap, demand forecasting, reporting
    DeptHeadPages.jsx     Department benchmarks, ROI analytics, training allocation
    LdAdminPages.jsx      Course catalog, adaptive path builder, credential verification queue, AI mentors
    AdminPages.jsx        System user management, RBAC roles, platform skill inventory, audit logs
  services/
    api.js                Centralized REST API client connected to Spring Boot backend
```

## Notes on fonts

The Sora/Inter webfonts load from Google Fonts with `display=swap`, and the whole
app has a system-font fallback stack (`ui-sans-serif, system-ui, -apple-system, sans-serif`)
set directly in `index.html`. If the webfont fails to load (offline, blocked network),
text still renders immediately in the fallback — it will never appear invisible or blank.
