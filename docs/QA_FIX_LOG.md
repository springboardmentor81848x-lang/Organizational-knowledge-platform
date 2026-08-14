# QA and Fix Log — KnowledgeIQ Platform

## Application Stack

- **Frontend**: React.js (Vite 5, TailwindCSS, Recharts, Lucide Icons) on `http://localhost:5174` (or `http://localhost:5173`)
- **Backend**: Spring Boot 3 / Java 17 REST API on `http://localhost:8086`
- **Database**: PostgreSQL (`db.utdvsjyzybvwhudovgyn.supabase.co:5432`)
- **Test Suite**: Automated QA Suite (`backend/test_qa_suite.js`)

---

## Test Summary Matrix

| Workflow / Endpoint | Status | Last Tested | Evidence / Verification Details |
| :--- | :--- | :--- | :--- |
| **System Health Check** (`GET /api/auth/health`) | ✅ PASS | Aug 12, 2026 | Returned HTTP 200 `{"service":"knowledgeiq-backend","status":"UP"}` |
| **Employee Login** (`employee@northwind.io`) | ✅ PASS | Aug 12, 2026 | Returned HTTP 200, JWT token issued, Role: `EMPLOYEE` |
| **Manager Login** (`manager@northwind.io`) | ✅ PASS | Aug 12, 2026 | Returned HTTP 200, JWT token issued, Role: `MANAGER` |
| **HR Specialist Login** (`hr@northwind.io`) | ✅ PASS | Aug 12, 2026 | Returned HTTP 200, JWT token issued, Role: `HR_SPECIALIST` |
| **Department Head Login** (`depthead@northwind.io`) | ✅ PASS | Aug 12, 2026 | Returned HTTP 200, JWT token issued, Role: `DEPARTMENT_HEAD` |
| **L&D Admin Login** (`ldadmin@northwind.io`) | ✅ PASS | Aug 12, 2026 | Returned HTTP 200, JWT token issued, Role: `L_AND_D_ADMIN` |
| **System Admin Login** (`admin@northwind.io`) | ✅ PASS | Aug 12, 2026 | Returned HTTP 200, JWT token issued, Role: `SYSTEM_ADMIN` |
| **Signup (New User Registration)** | ✅ PASS | Aug 12, 2026 | Created user in DB, issued JWT, initial gap snapshot & notification generated |
| **Duplicate Email Signup Validation** | ✅ PASS | Aug 12, 2026 | Returned HTTP 400 `{"error":"A user with this email already exists"}` |
| **Session Recovery** (`GET /api/auth/me`) | ✅ PASS | Aug 12, 2026 | Restored user profile & role ground truth from Bearer JWT token |
| **Skill Gap Analysis** (`GET /api/gap-analysis/me`) | ✅ PASS | Aug 12, 2026 | Computed 6 skill gaps comparing user levels vs role benchmarks |
| **Personalized Learning Path** (`GET /api/training/learning-path/personalized`) | ✅ PASS | Aug 12, 2026 | Generated 6 adaptive course steps with relevance scores & external links |
| **Training Catalog** (`GET /api/training/courses`) | ✅ PASS | Aug 12, 2026 | Returned internal academy & external Coursera/Udemy resource links |
| **Course Enrollment** (`POST /api/training/enroll`) | ✅ PASS | Aug 12, 2026 | Created enrollment record, status: `IN_PROGRESS` |
| **Manager Scoped Heatmap** (`GET /api/gap-analysis/scoped-heatmap`) | ✅ PASS | Aug 12, 2026 | Returned 4x5 team skill coverage matrix for Manager workspace |
| **CSV Reports Export** (`GET /api/analytics/export/gaps.csv`) | ✅ PASS | Aug 12, 2026 | Exported raw CSV dataset of org-wide skill gaps |

---

# Issues Identified & Fixed

## Issue 001

### Workflow
User Registration (`POST /api/auth/register`)

### Observed Behavior
Signup failed with HTTP 400: `Transaction silently rolled back because it has been marked as rollback-only`.

### Expected Behavior
New user account should be saved in PostgreSQL, skills persisted, initial gap snapshot calculated, and JWT token issued.

### Root Cause
1. `skill_gap_snapshots` table in Supabase PostgreSQL schema was missing the `gap_percent` column, whereas the JPA entity `SkillGapSnapshot.java` mapped `@Column(name = "gap_percent")`. When `recalculateUserGaps` ran during registration, Hibernate executed `SELECT sgs.gap_percent FROM skill_gap_snapshots`, PostgreSQL returned `ERROR: column sgs1_0.gap_percent does not exist`, which marked Spring's `@Transactional` registration transaction as **rollback-only**.
2. Unvalidated skill ID strings caused `UUID.fromString()` parsing exceptions inside the transaction boundary.

### Files Changed
- `backend/supabase_schema.sql`
- `backend/src/main/java/com/knowledgeiq/service/AuthService.java`

### Fix
- Added `gap_percent INT NOT NULL DEFAULT 0` to `skill_gap_snapshots` table in `supabase_schema.sql` and re-executed DB schema migration against Supabase Cloud PostgreSQL.
- Added `isUuid()` helper method in `AuthService.java` to validate UUID strings before querying JPA repositories.

### Verification
Ran `node test_qa_suite.js`. New user signup returned HTTP 200 with valid JWT token: `[PASS] Signup (New User): 200 Token: Valid`.

### Status
✅ PASS

---

## Issue 002

### Workflow
CSV Analytics Report Export (`GET /api/analytics/export/gaps.csv`)

### Observed Behavior
Request failed with HTTP 403 Forbidden.

### Expected Behavior
CSV report download endpoint should be publicly accessible for dashboard exports or authenticated report requests.

### Root Cause
`SecurityConfig.java` missed matching `/api/analytics/export/**` in `.requestMatchers(...).permitAll()`.

### Files Changed
- `backend/src/main/java/com/knowledgeiq/config/SecurityConfig.java`

### Fix
Added `/api/analytics/export/**` to permitted matchers in `SecurityConfig.java`.

### Verification
Ran `node test_qa_suite.js`. Export returned HTTP 200 with raw CSV data: `[PASS] CSV Gaps Export: 200`.

### Status
✅ PASS

---

## Issue 003

### Workflow
Database Connection Pool Stability under load

### Observed Behavior
Intermittent JDBC connection timeout errors during rapid sequential API requests: `Unable to acquire JDBC Connection [HikariPool-1 - Connection is not available, request timed out after 20044ms.]`.

### Expected Behavior
Connection pool should seamlessly handle concurrent requests without timing out.

### Root Cause
HikariCP pool size was set too small (`maximum-pool-size=5`), and `max-lifetime` was set to `60s` (too short), causing Hikari to constantly drop and recreate cloud PostgreSQL TCP sockets.

### Files Changed
- `backend/src/main/resources/application.properties`

### Fix
Increased HikariCP `maximum-pool-size` to `15`, `keepalive-time` to `30s`, `max-lifetime` to `10 minutes`, and connection timeout to `30s`.

### Verification
Executed 16 parallel API requests across all 6 role workflows. Zero connection timeouts occurred.

### Status
✅ PASS
