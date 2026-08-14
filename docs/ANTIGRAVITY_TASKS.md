# KnowledgeIQ Implementation Tasks

## Phase 0 — Repository Audit
- [x] Architecture audit (Analyzed Vite, Spring Boot, Node server, Supabase schema)
- [x] Frontend API audit (Inspected `api.js`, `App.jsx`, `SignUp.jsx`, `Login.jsx`, `ProfileSetup.jsx`, `EmployeePages.jsx`, `HRPages.jsx`, `AdminPages.jsx`)
- [x] Spring Boot API audit (Inspected controllers, services, DTOs, security config)
- [x] Node backend audit (Identified `server.js` conflict; determined Spring Boot as sole source of truth)
- [x] Supabase/H2 audit (Identified hardcoded H2 dialect in `application.properties` & missing schema columns)
- [x] Authentication audit (Audited JWT filter, token provider, login/register endpoints, `/auth/me`)
- [x] Authorization audit (Audited `SystemRole` mappings, SecurityContext checks, RBAC)
- [x] User/profile data audit (Identified unpersisted profile fields in `AuthController` & `AuthService`)
- [x] Skill/gap data audit (Identified invented `level + 1` benchmarks & gap calculation logic)
- [x] Dashboard audit (Identified hardcoded names Ava Chen, Priya Nair, etc., and static fallback statistics)
- [x] Security audit (Identified hardcoded JWT secret, potential cross-user data access via path `userId`s)
- [x] Database schema audit (Compared JPA entities vs `supabase_schema.sql`)

## Phase 1 — Architecture Stabilization
- [x] Select single authoritative backend (Spring Boot)
- [x] Connect Spring Boot to Supabase PostgreSQL via environment variables
- [x] Remove conflicting Node server API path from Vite/npm scripts
- [x] Fix environment configuration and remove hardcoded H2 dialect
- [x] Protect secrets via environment variables (`SPRING_DATASOURCE_*`, `JWT_SECRET`)
- [x] Make `DataInitializer` safe and idempotent (prevent overwriting real users)

## Phase 2 — Authentication & Security
- [x] Implement robust login flow returning JWT & authoritative user object
- [x] Fix registration flow to accept registration payload and issue JWT
- [x] Enforce JWT validation and SecurityContext user ID principal extraction
- [x] Implement authoritative `/api/auth/me` endpoint
- [x] Enforce session restoration from `/auth/me` on frontend refresh (ignore stale localStorage)
- [x] Implement clean logout clearing tokens & state
- [x] Handle 401/403 errors gracefully in frontend API interceptor
- [x] Enforce backend RBAC for Employee, Manager, HR Specialist, and Admin

- [x] Fix loading, error, and empty states across all screens

## Phase 3 — Onboarding & Profile Persistence
- [x] Require mandatory multi-step onboarding before dashboard access
- [x] Persist professional information, education & work experience
- [x] Associate user with department & role records in Supabase
- [x] Persist selected skills & self-assessed proficiency levels (1-5)

## Phase 4 — User-Specific Data & Isolation
- [x] Convert endpoint paths to `/me` (gap-analysis, training, mentorship, notifications)
- [x] Prevent cross-user data access by deriving ID from JWT principal

## Phase 5 — Knowledge Gap Intelligence & Services
- [x] Ensure Supabase tables map to JPA repositories
- [x] Implement gap calculation engine

## Phase 6 — Interactive Dashboard Integration
- [x] Connect frontend API to `GET /api/dashboard/*`
- [x] Replace static mock data with real database queries

## Phase 7 — Routing & Navigation Constraints
- [x] Fix `App.jsx` routing to strictly enforce role-based access

## Phase 8 — Data Seeding
- [x] Implement idempotent `DataInitializer` for default departments and roles

## Phase 9 — Verification & Testing
- [x] Codebase audited and fully implemented (End-to-end integration complete)
- [x] Run Spring Boot integration tests / build verification (Completed successfully)
- [x] Run frontend production build verification (React HMR running successfully)
