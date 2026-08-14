# KnowledgeIQ Platform Architecture

## 1. System Overview
KnowledgeIQ is an enterprise workforce skill intelligence and adaptive learning platform. It maps organizational competencies, automatically identifies high-risk skill gaps, calculates role-based benchmarks, clusters employees into specialized domain teams, and generates personalized learning interventions.

```
┌─────────────────────────────────────────────────────────────┐
│                   React 18 + Vite Frontend                  │
│  - Modern Dark-Themed UI                                    │
│  - 6 Role-Based Dynamic Dashboards                          │
│  - Real-Time Heatmaps, Radar Charts & Interventions         │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API (Bearer JWT Auth)
┌──────────────────────────────▼──────────────────────────────┐
│                  Spring Boot 3 REST Backend                 │
│  - Security: Spring Security 6 + JWT Filter                 │
│  - Controllers: Auth, Employee, Manager, HR, DeptHead, L&D  │
│  - Services: GapAnalysisService, LearningRecommendation     │
│  - JPA / Hibernate ORM Layer                                │
└──────────────────────────────┬──────────────────────────────┘
                               │ JDBC
┌──────────────────────────────▼──────────────────────────────┐
│                    PostgreSQL Database                      │
│  - Tables: users, organizations, departments, roles         │
│  - skills, role_skill_benchmarks, user_skills               │
│  - courses, course_enrollments, certifications              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### Backend
- **Framework**: Spring Boot 3.2.3 (Java 17)
- **Security**: Spring Security 6 + JSON Web Tokens (JWT)
- **Database ORM**: Spring Data JPA + Hibernate 6
- **Database**: PostgreSQL (Supabase Cloud / Local)
- **API Architecture**: RESTful JSON APIs

### Frontend
- **Framework**: React 18 + Vite 5
- **Styling**: Vanilla CSS + Tailwind CSS utilities
- **Icons**: Lucide Icons
- **Charts**: Recharts (Heatmaps, Radar Charts, Area Trends, Bar Charts, Donut Pies)
- **HTTP Client**: Native Fetch with JWT interceptor

---

## 3. The 6 Role-Based Personas (RBAC)

1. **Employee (`EMPLOYEE`)**:
   - Personalized skill inventory and self-assessments
   - Radar charts comparing personal skills to role targets
   - AI-recommended learning modules & courses
   - Interactive AI Chat Advisor

2. **Team Lead / Manager (`MANAGER`)**:
   - Dynamic Domain Team grouping (e.g. Java Engineering, Python Engineering, Frontend & UI, Cloud & DevOps)
   - Multi-team switcher toolbar & scoped statistics
   - Department Skill Gap Heatmap matrix
   - Direct reports progress tracker and actionable interventions

3. **HR Specialist (`HR_SPECIALIST`)**:
   - Organization-wide workforce directory with department and status filters
   - Workforce skill inventory matrix with department selectors
   - Strategic workforce skill forecasting & deficit trend projections
   - Automated quarterly demand vs supply analytics
   - One-click CSV reports export

4. **Department Head (`DEPARTMENT_HEAD`)**:
   - Department governance & headcount analytics
   - Role skill benchmark rule builder (create/edit benchmark target levels)
   - Training budget allocation & ROI multiplier calculations

5. **L&D Administrator (`L_AND_D_ADMIN`)**:
   - Course catalog management (create, update, delete training courses)
   - Adaptive learning path builder & curriculum sequencing
   - Credential & certification verification queue

6. **System Administrator (`SYSTEM_ADMIN`)**:
   - Comprehensive user administration & RBAC role assignments
   - Account activation and suspension
   - Competency skill catalog master editor
   - System health, active sessions, and audit metrics

---

## 4. Directory Structure

```
├── backend/                             # Spring Boot 3.2.3 Backend
│   ├── src/main/java/com/knowledgeiq/
│   │   ├── config/                      # Security & JWT Configuration
│   │   ├── controller/                  # REST API Controllers (6 Roles)
│   │   ├── dto/                         # Data Transfer Objects
│   │   ├── model/                       # JPA Database Entities
│   │   ├── repository/                  # Spring Data JPA Repositories
│   │   └── service/                     # Business Logic & Gap Analysis Engine
│   ├── src/main/resources/
│   │   └── application.properties       # Database & Security Configuration
│   └── pom.xml                          # Maven Project Dependencies
│
├── frontend/                            # React 18 + Vite Frontend
│   ├── src/
│   │   ├── components/                  # Shared UI Components (Sidebar, Topbar, Modals, Icons)
│   │   ├── pages/                       # 6 Role Dashboard & Management Pages
│   │   ├── services/                    # Frontend API Client (api.js)
│   │   ├── data.js                      # Navigation Definitions & Role Metadata
│   │   ├── App.jsx                      # Main App & Dynamic Role-Based Router
│   │   └── main.jsx                     # Vite Application Entrypoint
│   └── package.json                     # Frontend Dependencies & Scripts
│
├── docs/                                # Documentation & Specifications
│   ├── ARCHITECTURE.md                  # High-level architecture documentation
│   ├── API_DOCUMENTATION.md             # Complete REST API endpoint reference
│   └── SETUP_GUIDE.md                   # Step-by-step local setup instructions
│
├── scripts/                             # Automation & Verification Scripts
│   ├── verify_live_system.js            # Automated 6-role end-to-end integration test
│   └── run_browser_automation.js        # Headless browser automation test suite
│
├── docker-compose.yml                   # Docker Compose Configuration
├── .env.example                         # Environment Variables Template
└── README.md                            # Main Project README
```
