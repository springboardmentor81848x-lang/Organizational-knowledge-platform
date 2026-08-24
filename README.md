# KnowledgeIQ — Enterprise Workforce Skill Intelligence Platform

KnowledgeIQ is an enterprise workforce skill intelligence and adaptive learning platform. It maps organizational competencies, detects critical skill gaps, clusters employees into specialized domain teams, and generates personalized learning interventions.

---

## Architecture & Project Structure

```
.
├── backend/                             # Spring Boot 3.2.3 (Java 17) REST API
│   ├── src/main/java/com/knowledgeiq/
│   │   ├── config/                      # Security & JWT Configuration
│   │   ├── controller/                  # 6-Role REST Controllers
│   │   ├── dto/                         # Request & Response DTOs
│   │   ├── model/                       # JPA Database Entities
│   │   ├── repository/                  # Spring Data Repositories
│   │   └── service/                     # Business Logic & Gap Engine
│   └── src/main/resources/
│       └── application.properties       # Database & Security Config
│
├── frontend/                            # React 18 + Vite Frontend Application
│   ├── src/
│   │   ├── components/                  # Shared UI Component Library
│   │   ├── pages/                       # 6 Role Dashboard & Management Views
│   │   ├── services/                    # Frontend API Client (api.js)
│   │   ├── data.js                      # Navigation Definitions & Role Metadata
│   │   ├── App.jsx                      # Main Application & Router
│   │   └── main.jsx                     # Vite Application Entrypoint
│   └── package.json                     # Frontend Dependencies & Scripts
│
├── docs/                                # Project Documentation & Specifications
│   ├── ARCHITECTURE.md                  # System Architecture & Technical Design
│   ├── API_DOCUMENTATION.md             # Complete REST API Reference (6 Roles)
│   └── SETUP_GUIDE.md                   # Local Installation & Execution Guide
│
├── scripts/                             # Verification & Test Automation Scripts
│   ├── verify_live_system.js            # Automated 6-Role Full Integration Test
│   └── run_browser_automation.js        # Headless Browser Verification Suite
│
├── docker-compose.yml                   # Docker Compose Configuration
├── .env.example                         # Environment Variables Template
├── supabase_schema.sql                  # Complete Supabase PostgreSQL DDL & Seed Data
└── README.md                            # Main Documentation
```

---

## The 6 Role-Based Personas (RBAC)

1. **Employee** (`employee@northwind.io`):
   - Personal skill inventory, proficiency radar charts, and self-assessments
   - AI-recommended training courses and personalized learning paths
   - Interactive AI Advisor Chat Drawer

2. **Team Lead / Manager** (`manager@northwind.io`):
   - Dynamic **Domain Team Grouping** (Java Developers, Python Developers, UI/Frontend, DevOps)
   - Multi-team switcher toolbar & scoped metric cards
   - Department Competency Skill Gap Heatmap matrix
   - Direct reports progress tracker and actionable interventions

3. **HR Specialist** (`hr@northwind.io`):
   - Workforce user management with Department & Status filters
   - Organization Skill Matrix with interactive department selectors
   - Strategic workforce skill forecasting & quarterly demand vs. supply trends
   - One-click CSV reports export for skill gaps and training completions

4. **Department Head** (`depthead@northwind.io`):
   - Department governance & headcount analytics
   - Role skill benchmark rule editor (create, customize, and approve targets)
   - Training budget allocation & ROI multiplier calculations

5. **L&D Administrator** (`ldadmin@northwind.io`):
   - Training course catalog management (create, edit, delete courses)
   - Adaptive learning path builder & sequencing
   - Credential & certification verification queue

6. **System Administrator** (`admin@northwind.io`):
   - Master user directory with system access role governance
   - Account activation and suspension
   - Competency skill catalog master editor
   - Platform health, active sessions, and system audit logs

---

## Quick Start

### 1. Start Backend (Spring Boot)
```powershell
cd backend
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
./mvnw.cmd spring-boot:run
```
*Backend runs on: `http://localhost:8080`*

### 2. Start Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on: `http://localhost:5173`*

---

## Verification & Testing

To run the automated integration test suite across all 6 roles:
```bash
node scripts/verify_live_system.js
```

---

## Documentation Links
- [System Architecture](docs/ARCHITECTURE.md)
- [REST API Reference](docs/API_DOCUMENTATION.md)
- [Setup & Execution Guide](docs/SETUP_GUIDE.md)
=======
# Organizational-knowledge-platform
>>>>>>> origin/main
