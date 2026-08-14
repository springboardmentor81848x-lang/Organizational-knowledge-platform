# task.md — Organizational Knowledge Gap Intelligence Platform

## Phase 0: System Roles & Multi-Role Architecture (6 Roles Complete)
- [x] 0.1 Support all 6 distinct System Roles across Front-End and Back-End:
  - [x] `EMPLOYEE`: Employee (Self/Peer assessment, skill inventory, adaptive paths, certifications, mentorship).
  - [x] `MANAGER`: Team Lead / Manager (Team skill coverage, **Manager-Only Department Heatmap Matrix**, high-risk gap alerts, learning interventions).
  - [x] `HR_SPECIALIST`: HR Specialist (Org-wide gap intelligence, workforce skill inventory, strategic skill forecasting Q1-Q4, CSV reports).
  - [x] `DEPARTMENT_HEAD`: Department Head (Department strategy, role benchmark approvals, budget allocation).
  - [x] `L_AND_D_ADMIN`: Learning & Development Admin / Mentor (Internal/External catalogs, adaptive path builder, cert verification).
  - [x] `SYSTEM_ADMIN`: System Administrator (User account management, security access control, system telemetry, audit logs).
- [x] 0.2 Sign-Up & Onboarding Multi-Role Support:
  - [x] Update `SignUp.jsx` to present explicit selection cards for all 6 System Roles.
  - [x] Update `ProfileSetup.jsx` title suggestions & background tracking for all 6 roles.
  - [x] Update `AuthService.java` registration handler to map role strings to `EMPLOYEE`, `MANAGER`, `HR_SPECIALIST`, `DEPARTMENT_HEAD`, `L_AND_D_ADMIN`, `SYSTEM_ADMIN`.
- [x] 0.3 Routing & Navigation for 6 Roles:
  - [x] Update `data.js` (`ROLE_META` and `NAV`) to define navigation items for all 6 roles.
  - [x] Update `App.jsx` systemRole resolution and `PageRouter` switch cases for all 6 roles.

---

## Milestone 1: Week 1 & 2 — Project Initialization, Design Process & Core Setup
- [x] 1.1 Architectural & Database Schema Setup (Supabase PostgreSQL):
  - [x] Create/update JPA models (`User`, `Department`, `Role`, `SystemRole`, `EmployeeSkill`, `RoleSkillBenchmark`, `Skill`, `SkillCategory`).
  - [x] Standardize 1-5 proficiency scale: Unaware (1), Beginner (2), Intermediate (3), Advanced (4), Expert (5).
  - [x] Directly execute `supabase_schema.sql` migration against Supabase Cloud PostgreSQL DB (`db.utdvsjyzybvwhudovgyn.supabase.co`).
- [x] 1.2 Authentication & User Onboarding Backend Services:
  - [x] Implement JWT Authentication and Spring Security RBAC.
  - [x] Support full registration payload across all 6 System Roles.
  - [x] Maintain session restoration via authoritative `/api/auth/me` endpoint.
- [x] 1.3 Multi-Step Onboarding & Profile Management UI:
  - [x] Build 4-step onboarding wizard (`ProfileSetup.jsx`): Role & Dept -> Background -> Domain Knowledge Rating -> Finalize.
  - [x] Build user profile management page (`ProfilePage.jsx` & `EditProfileModal.jsx`).
- [x] 1.4 Competency Framework & Role Benchmarking:
  - [x] Implement role benchmark integration comparing employee proficiency ratings against required benchmarks.
  - [x] Flag critical vs non-critical role skill requirements.

---

## Milestone 2: Week 3 & 4 — Gap Analysis Engine & Training Recommendation System
- [x] 2.1 Automated Knowledge Gap Analysis Engine:
  - [x] Implement gap calculation logic (`required_level - proficiency_level`) in `GapAnalysisController.java`.
  - [x] Compute individual, team-level, and department-level aggregated skill gaps.
  - [x] Implement gap severity scoring (Critical, High, Medium, Low) and risk flagging.
  - [x] Track historical gap snapshots (`skill_gap_snapshots` table) for trend analysis over time.
- [x] 2.2 Department Skill Coverage Heatmap Visualization (Manager Role Only):
  - [x] Build dynamic team heatmap matrix in `ManagerPages.jsx` (Team Members on Y-axis vs Team Skills on X-axis).
  - [x] Color-code matrix cells: Red (Critical Gap), Yellow (Mild Gap), Green (Proficient), Blue (Expert).
  - [x] Restrict heatmap matrix view exclusively to the **Team Lead / Manager** role.
- [x] 2.3 AI-Driven Training Recommendation System & Recommendation Engine:
  - [x] Implement recommendation algorithm calculating course relevance score (0-100%) based on gap size & critical priority.
  - [x] Generate personalized & adaptive learning paths (`learning_paths` & `learning_path_courses` tables).
  - [x] Integrate external resource catalog links (Coursera, Udemy, LinkedIn Learning) alongside internal training courses.
  - [x] Support adaptive re-recommendations driven by user course completions and skill rating updates.
- [x] 2.4 End-to-End Build & Database Execution Verification:
  - [x] Execute Supabase SQL reset script (`node reset_db.js`) directly from terminal to alter live PostgreSQL schema.
  - [x] Execute Spring Boot compilation (`mvnw compile`) — **BUILD SUCCESS**.
  - [x] Verify front-end React SPA rendering & navigation across all 6 system roles.

---

## Milestone 3: Week 5 & 6 — Knowledge Sharing, Progress Tracking & Analytics
- [x] 3.1 Peer Knowledge-Sharing & Mentorship Matching Module:
  - [x] Implement peer mentorship matching based on skill complementarity (`findMentorsForSkill` for proficiency >= 4).
  - [x] Build internal knowledge-sharing session scheduling & mentorship session status management (`MentorshipController.java` & `MentorshipService.java`).
- [x] 3.2 Learning Progress Tracking & Skill Improvement Module:
  - [x] Implement course enrollment progress tracking with percentage completion bars (0-100%) in `CourseEnrollment.java`.
  - [x] Implement post-training skill improvement auto-boost (upgrades skill proficiency rating upon course completion).
- [x] 3.3 360-Degree Peer Assessment Module:
  - [x] Build peer assessment request workflow and evaluator feedback submission in `AssessmentController.java`.
- [x] 3.4 Notification & Alert System:
  - [x] Implement real-time notifications for course recommendations, enrollment updates, and mentorship requests (`NotificationService.java`).
- [x] 3.5 Workforce Analytics & CSV Export Module:
  - [x] Build CSV report export endpoints (`GET /api/analytics/export/gaps.csv` and `GET /api/analytics/export/training.csv`).

---

## Milestone 4: Week 7 & 8 — Testing, Cloud Deployment & Documentation (Final Phase)
- [ ] 4.1 Automated End-to-End Integration Testing (JUnit, Postman, React Testing Library).
- [ ] 4.2 Production Docker & Nginx Deployment Configuration (`Dockerfile`, `docker-compose.yml`, `nginx.conf`).
- [ ] 4.3 Final System Documentation, API Specs & Demonstration Video Prep.
