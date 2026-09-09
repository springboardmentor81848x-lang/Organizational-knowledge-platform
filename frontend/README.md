# KnowledgeIQ — React + Vite Frontend

A role-based Organizational Knowledge Gap Intelligence Platform, built with React + Vite, Recharts, and Lucide Icons.

## Local Development

```bash
npm install
npm run dev
```

Then open the URL printed by Vite (typically `http://localhost:5173`).

To build and preview a production bundle:

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

## Deploying to Render (Static Site)

1. Push this frontend folder to your new GitHub repository.
2. In [Render Dashboard](https://dashboard.render.com/), click **New +** ➔ **Static Site**.
3. Connect your frontend GitHub repository.
4. Set build options:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
5. In **Environment Variables**, add:
   - `VITE_API_BASE_URL` = `https://<YOUR_BACKEND_RENDER_URL>/api`
6. Click **Create Static Site**.

*(Note: SPA client routing is pre-configured via `public/_redirects` to avoid 404s on browser refresh).*

## Notes on Fonts

The Sora/Inter webfonts load from Google Fonts with `display=swap`, and the app has a system-font fallback stack (`ui-sans-serif, system-ui, -apple-system, sans-serif`) set directly in `index.html`.
