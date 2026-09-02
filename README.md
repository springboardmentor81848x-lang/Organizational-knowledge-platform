# 🎯 Employee Skill Gap & Learning Intelligence Platform

![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)
![Status](https://img.shields.io/badge/status-active--development-blue?style=for-the-badge)

> A full-stack platform that maps employee skills against role/department requirements, surfaces skill gaps, and drives closing those gaps through personalized learning paths, mentorship, training programs, assessments, and an AI assistant — with built-in gamification and community features to keep employees engaged.

---

## 📑 Table of Contents

- [About the Project](#-about-the-project)
- [Core Modules](#-core-modules)
- [Tech Stack](#️-tech-stack)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Testing (Postman)](#-api-testing-postman)
- [Project Structure](#-project-structure)
- [Roadmap](#️-roadmap)
- [Contributors](#-contributors)
- [License](#-license)

---

## 📋 About the Project

Organizations often struggle to know, at a glance, which employees are equipped for which roles — and what training would close the gap. This platform centralizes that entire workflow:

1. **Assess** — employees take skill assessments; results are scored and compared against role/department requirements.
2. **Identify** — the system computes and tracks knowledge gaps per employee, per skill.
3. **Close the gap** — employees are guided through curated learning paths, training programs, and resources, and can request mentorship from more experienced colleagues.
4. **Engage** — badges, certificates, and community groups keep the experience motivating rather than purely administrative.
5. **Assist** — an integrated AI chat assistant helps employees navigate their learning journey.
6. **Govern** — role-based access control and full audit logging keep the platform secure and traceable.

---

## 🧩 Core Modules

| Module | What it does | Key tables |
| --- | --- | --- |
| **User & Access Management** | Authentication, role-based permissions, password resets | `users`, `roles`, `user_roles`, `password_reset_tokens` |
| **Employees & Departments** | Employee records, department structure, department-level required skills | `employees`, `departments`, `department_required_skills` |
| **Skills & Assessments** | Skill catalog, assessment authoring, scoring, and results | `skills`, `skill_assessments`, `assessment_questions`, `assessment_results`, `employee_skills` |
| **Knowledge Gap Analysis** | Detects and tracks the gap between an employee's current skill level and what their role/target role requires | `knowledge_gaps`, `target_roles`, `target_role_skills` |
| **Learning & Development** | Structured learning paths built from resources, plus formal training programs | `learning_paths`, `learning_path_items`, `learning_resources`, `learning_resource_completions`, `training_programs`, `training_assignments` |
| **Mentorship** | Employees request mentors; mentors run knowledge-sharing sessions | `mentor_profiles`, `mentor_requests`, `mentor_request_history`, `mentorships`, `knowledge_sessions`, `session_registrations` |
| **Gamification** | Recognizes progress and achievement | `badges`, `employee_badges`, `certificates` |
| **Community** | Peer discussion groups, posts, and direct messaging | `community_groups`, `community_group_members`, `community_posts`, `messages` |
| **Workforce Operations** | Leave management and task tracking | `leave_types`, `leave_requests`, `tasks` |
| **AI Assistant** | Logs of employee interactions with the in-app AI chat assistant | `ai_chat_logs` |
| **Platform & Governance** | Notifications, system-wide settings, and a full audit trail of changes | `notifications`, `system_settings`, `audit_logs` |

---

## 🛠️ Tech Stack

> ℹ️ Update this section with your actual stack — filled in below with sensible defaults based on the project structure. Replace with what you're actually running.

| Layer | Technology |
| --- | --- |
| Frontend | _e.g. React.js_ |
| Backend | _e.g. Node.js / Express.js_ |
| Database | MySQL 8.x (hosted on Aiven Cloud) |
| API Testing | Postman (Collection v2.1) + Newman |
| Auth | Bearer Token / JWT |
| Version Control | Git & GitHub |

---

## 🗄️ Database Schema

The database (`defaultdb`) contains **40 tables**. Highlights:

- `employees` — core employee profile, linked to `departments` and `users`
- `assessment_results` — stores `score`, `passed`, `gap_before` / `gap_after`, and proficiency level per employee per skill assessment
- `knowledge_gaps` — the computed gap between current and required skill level, used to recommend learning content
- `learning_paths` → `learning_path_items` → `learning_resources` — a three-level structure for guided learning
- `mentorships` — pairs employees with mentors, tracked from request → acceptance → session history
- `audit_logs` — records `action`, `entity_type`, `entity_id`, and before/after values for every significant change
- `ai_chat_logs` — stores `message` / `reply` pairs from the AI assistant, tied to `user_id` and `employee_id`

A full SQL dump with all table definitions, keys, and constraints is included in this repo (`sql.sql`).

---

## 🔌 API Endpoints

Currently covered by the QA test suite (see [API Testing](#-api-testing-postman)):

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/employees` | List all employees |
| `GET` | `/api/employees/:id` | Fetch a single employee by ID |
| `GET` | `/api/departments` | List all departments |
| `GET` | `/api/assessment-results` | List employee skill assessment results |
| `GET` | `/api/audit-logs` | List system audit trail entries |
| `GET` | `/api/chat-logs` | List AI assistant chat logs |

> More endpoints (skills, learning paths, mentorship, community, badges, leave, tasks) exist per the schema above — add them here as they're built and tested.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/<your-org>/<your-repo>.git
cd <your-repo>
```

### 2. Set up the database
```bash
mysql -u <username> -p < sql.sql
```
This creates the `defaultdb` database with all 40 tables.

### 3. Install dependencies
```bash
# backend
cd backend
npm install

# frontend
cd ../frontend
npm install
```

### 4. Configure environment variables
Copy `.env.example` to `.env` in the backend (and frontend, if applicable) and fill in the values — see [Environment Variables](#-environment-variables).

### 5. Run the app
```bash
# backend
npm run dev

# frontend
npm start
```

---

## 🔧 Environment Variables

| Variable | Description |
| --- | --- |
| `DB_HOST` | MySQL host |
| `DB_PORT` | MySQL port (default `3306`) |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name (`defaultdb`) |
| `JWT_SECRET` / `TOKEN_SECRET` | Secret used to sign Bearer tokens |
| `PORT` | Port the backend API runs on |

---

## 🧪 API Testing (Postman)

A full QA test suite is included, built for **Postman (Collection v2.1)**:

- `OKGIP-API-QA.postman_collection.json` — combined collection covering all six core endpoints
- `01_Get_All_Employees.postman_collection.json` → `06_Get_Chat_Logs.postman_collection.json` — the same requests, split individually for isolated testing

Each request asserts:
- `200 OK` status and `application/json` content type
- Response time under 2000ms
- Non-empty array/object payloads with required fields present
- Endpoint-specific business rules (e.g. assessment scores in range 0–100, audit logs sorted newest-first)

Run the full suite from the CLI with [Newman](https://github.com/postmanlabs/newman):
```bash
newman run OKGIP-API-QA.postman_collection.json \
  --env-var "base_url=http://localhost:3000" \
  --env-var "token=<your-bearer-token>"
```

---

## 📁 Project Structure

```
.
├── backend/                  # API server
├── frontend/                 # Client application
├── sql.sql                   # Full database schema (40 tables)
├── OKGIP-API-QA.postman_collection.json
├── 01_Get_All_Employees.postman_collection.json
├── 02_Get_Employee_By_ID.postman_collection.json
├── 03_Get_All_Departments.postman_collection.json
├── 04_Get_Assessment_Results.postman_collection.json
├── 05_Get_Audit_Logs.postman_collection.json
├── 06_Get_Chat_Logs.postman_collection.json
└── README.md
```

> Update the `backend/` and `frontend/` structure above to reflect your actual folder layout.

---

## 🗺️ Roadmap

- [ ] Expand API test coverage to skills, learning paths, and mentorship endpoints
- [ ] Add automated CI pipeline (GitHub Actions + Newman)
- [ ] Add role-based access tests (admin vs. employee vs. mentor)
- [ ] Document AI chat assistant integration

---

## 👥 Contributors

| Member          | Contribution                            |
| --------------- | ---------------------------------------- |
| **Harishkumar** | Frontend Development & Project Guidance |
| **Girish**      | Backend Development                     |
| **Lokesh**      | UI/UX Wireframes & Design               |

---

LIVE PROJECT - https://okgip-overhaul.onrender.com

Live Application - https://okgip-overhaul.onrender.com
