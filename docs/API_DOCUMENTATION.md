# KnowledgeIQ REST API Documentation

Base URL: `http://localhost:8080/api`

All protected endpoints require an `Authorization: Bearer <JWT_TOKEN>` header.

---

## 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account with role, company, dept, and job title | Public |
| `POST` | `/api/auth/login` | Authenticate user and issue JWT token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Authenticated |
| `PUT` | `/api/auth/profile` | Update profile information & onboarding details | Authenticated |

---

## 2. Employee Endpoints (`/api/training`, `/api/gap-analysis`, `/api/competency`)

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/gap-analysis/me` | Get personal skill gaps vs. role targets | `EMPLOYEE` |
| `GET` | `/api/competency/skills` | List all available competency skills in catalog | Authenticated |
| `GET` | `/api/training/courses` | List active training courses | Authenticated |
| `POST` | `/api/training/enroll` | Enroll in a training course | `EMPLOYEE` |
| `GET` | `/api/training/enrollments/me` | List enrolled courses & completion status | `EMPLOYEE` |
| `GET` | `/api/training/learning-path/personalized` | Get AI-generated learning path steps | `EMPLOYEE` |
| `POST` | `/api/ai/chat` | Chat with KnowledgeIQ AI Advisor | Authenticated |

---

## 3. Manager Endpoints (`/api/manager`, `/api/gap-analysis`)

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/manager/dashboard` | Get department direct reports count, critical gaps & avg gap | `MANAGER` |
| `GET` | `/api/manager/team-profiles` | Get list of direct reports with individual scores & risk status | `MANAGER` |
| `GET` | `/api/gap-analysis/scoped-heatmap` | Get department/domain competency heatmap matrix | `MANAGER`, `HR_SPECIALIST`, `DEPARTMENT_HEAD` |
| `POST` | `/api/gap-analysis/recalculate` | Trigger real-time gap recalculation | Authenticated |

---

## 4. HR Specialist Endpoints (`/api/hr`, `/api/analytics`)

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/hr/dashboard` | Org-wide headcount, critical gaps, avg completion, certs & heatmap | `HR_SPECIALIST`, `SYSTEM_ADMIN` |
| `GET` | `/api/hr/users` | List all workforce accounts in organization | `HR_SPECIALIST`, `SYSTEM_ADMIN` |
| `POST` | `/api/hr/users/{id}/status` | Activate or suspend employee account | `HR_SPECIALIST`, `SYSTEM_ADMIN` |
| `POST` | `/api/hr/users/{id}/role` | Update employee department, role title, or system access role | `HR_SPECIALIST`, `SYSTEM_ADMIN` |
| `GET` | `/api/hr/departments-list` | List all departments with manager, headcount & deficit metrics | `HR_SPECIALIST`, `SYSTEM_ADMIN` |
| `POST` | `/api/hr/departments` | Create a new organizational department | `HR_SPECIALIST`, `SYSTEM_ADMIN` |
| `GET` | `/api/hr/forecasting-data` | Strategic skill deficits & quarterly demand vs supply forecast | `HR_SPECIALIST`, `SYSTEM_ADMIN` |
| `GET` | `/api/analytics/export/gaps.csv` | Download skill gaps report in CSV format | `HR_SPECIALIST`, `SYSTEM_ADMIN` |
| `GET` | `/api/analytics/export/training.csv` | Download training completions report in CSV format | `HR_SPECIALIST`, `SYSTEM_ADMIN` |

---

## 5. Department Head Endpoints (`/api/depthead`)

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/depthead/dashboard` | Department head executive summary | `DEPARTMENT_HEAD`, `SYSTEM_ADMIN` |
| `GET` | `/api/depthead/benchmarks` | List role skill benchmark rules | `DEPARTMENT_HEAD`, `SYSTEM_ADMIN` |
| `POST` | `/api/depthead/benchmarks` | Create a new role skill benchmark rule | `DEPARTMENT_HEAD`, `SYSTEM_ADMIN` |
| `PUT` | `/api/depthead/benchmarks/{id}` | Update target level or criticality of a benchmark rule | `DEPARTMENT_HEAD`, `SYSTEM_ADMIN` |
| `GET` | `/api/depthead/allocation` | Get department budget allocation & ROI multiplier | `DEPARTMENT_HEAD`, `SYSTEM_ADMIN` |
| `PUT` | `/api/depthead/allocation` | Update department training budget & target completion | `DEPARTMENT_HEAD`, `SYSTEM_ADMIN` |

---

## 6. L&D Admin Endpoints (`/api/ldadmin`, `/api/training`)

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/ldadmin/dashboard` | Course catalog, pending certs & enrollment metrics | `L_AND_D_ADMIN`, `SYSTEM_ADMIN` |
| `POST` | `/api/training/courses` | Create a new training course | `L_AND_D_ADMIN`, `SYSTEM_ADMIN` |
| `PUT` | `/api/training/courses/{id}` | Update course title, provider, duration, or skill tags | `L_AND_D_ADMIN`, `SYSTEM_ADMIN` |
| `DELETE` | `/api/training/courses/{id}` | Delete a course from catalog | `L_AND_D_ADMIN`, `SYSTEM_ADMIN` |
| `GET` | `/api/ldadmin/paths` | List adaptive learning paths | `L_AND_D_ADMIN`, `SYSTEM_ADMIN` |
| `POST` | `/api/ldadmin/paths` | Create a new adaptive learning path | `L_AND_D_ADMIN`, `SYSTEM_ADMIN` |
| `DELETE` | `/api/ldadmin/paths/{id}` | Delete an adaptive learning path | `L_AND_D_ADMIN`, `SYSTEM_ADMIN` |
| `GET` | `/api/ldadmin/certifications` | List submitted credentials for verification | `L_AND_D_ADMIN`, `SYSTEM_ADMIN` |

---

## 7. System Admin Endpoints (`/api/admin`)

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | System health, user counts & uptime metrics | `SYSTEM_ADMIN` |
| `GET` | `/api/admin/users` | Master user directory with system roles | `SYSTEM_ADMIN` |
| `PUT` | `/api/admin/users/{id}/status` | Toggle user status (active / suspended) | `SYSTEM_ADMIN` |
| `PUT` | `/api/admin/users/{id}/role` | Update user system role | `SYSTEM_ADMIN` |
| `POST` | `/api/admin/skills` | Add new skill to master competency catalog | `SYSTEM_ADMIN` |
| `DELETE` | `/api/admin/skills/{id}` | Remove skill from master catalog | `SYSTEM_ADMIN` |
