## Role-Based Access Control (RBAC) Implementation

### Overview

This document describes the complete role-based access control system implemented in the Organizational Knowledge Gap Platform backend. The system supports 7 distinct roles, each with specific permissions and API access levels.

---

## Supported Roles

### 1. **EMPLOYEE**
Basic user role with limited access to personal skill data and learning resources.

**Permissions:**
- View own skill gaps
- View own learning paths
- View own recommendations
- Participate in mentorship activities

**API Access:**
- `GET /skill-gaps/employee/{id}` - View own skill gaps
- `GET /heatmap/employee/{id}` - View own heatmap
- `GET /recommendations/employee/{id}` - View own recommendations
- `GET /learning-paths/employee/{id}` - View own learning paths
- `POST /learning-paths/generate/{id}` - Generate own learning path
- `GET /external-courses` - View available courses
- `GET /roles/{role}` - View role information

---

### 2. **MANAGER**
Team/department leadership role with oversight of team skill analytics and learning progress.

**Permissions:**
- All EMPLOYEE permissions
- View department skill coverage
- View department skill gaps
- View training adoption metrics
- View employee progress
- Monitor learning progress
- Support learning interventions
- Access department dashboard

**API Access:**
- All EMPLOYEE endpoints
- `GET /departments` - List all departments
- `GET /departments/{id}` - Get department details
- `GET /knowledge-gaps/**` - View organizational knowledge gaps
- `GET /skill-gaps/**` - Query organizational skill gaps
- `GET /heatmap/**` - View organizational heatmaps
- `GET /employees/by-role/{role}` - Get employees by role

---

### 3. **HR**
Human Resources specialist with full training and competency management access.

**Permissions:**
- All MANAGER permissions
- Manage training programs
- Manage learning paths
- Configure recommendations
- Manage external courses
- Track learning effectiveness
- Manage certifications and renewals
- Manage user roles
- Manage system settings

**API Access:**
- All MANAGER endpoints
- `POST /external-courses` - Create/add courses
- `PUT /external-courses/{id}` - Update courses
- `DELETE /external-courses/{id}` - Delete courses
- `PUT /employees/{id}` - Update employee information
- `PUT /employees/{id}/role/{newRole}` - Change user role
- `POST /departments` - Create new departments
- `PUT /departments/{id}` - Update departments
- `POST /roles` - Manage system roles

---

### 4. **ADMIN** (System Administrator)
Full system access with complete control over all features and configurations.

**Permissions:**
- All HR permissions
- Manage system settings
- Unrestricted access to all platform features

**API Access:**
- All HR endpoints
- `DELETE /employees/{id}` - Delete employees
- `DELETE /departments/{id}` - Delete departments
- Any unrestricted administrative endpoints

---

### 5. **DEPARTMENT_HEAD** (NEW)
Department leadership role focused on team skill gaps and learning progress.

**Permissions:**
- View own skill gaps (optional)
- View own learning paths (optional)
- View own recommendations (optional)
- View department skill coverage
- View department skill gaps
- View training adoption
- View individual employee progress
- Monitor learning progress
- Support/recommend learning interventions
- Access department-level dashboards
- Participate in mentorship

**Capabilities:**
- Review department-wide skill gap assessments
- Identify high-risk skill gaps in the team
- Monitor employee and team learning progress
- View training program adoption rates
- Access department-level analytical dashboards and reports
- Recommend learning interventions for team members

**API Access:**
- `GET /skill-gaps/employee/**` - View own gaps (if applicable)
- `GET /departments` - List departments
- `GET /departments/{id}` - View department details
- `GET /knowledge-gaps/**` - View organizational data
- `GET /skill-gaps/**` - Query skill gaps
- `GET /heatmap/**` - View department heatmaps
- `GET /employees` - View all employees
- `GET /employees/{id}` - Get employee details
- `GET /employees/by-role/{role}` - Filter employees by role
- `GET /learning-paths/**` - View learning paths

---

### 6. **LEARNING_DEVELOPMENT_ADMIN** (NEW)
Learning & Development specialist with authority over training programs and learning resources.

**Permissions:**
- View own skill gaps
- View own learning paths
- View own recommendations
- Manage training programs
- Create/manage personalized learning paths
- Configure recommendation algorithms
- Manage external learning resources
- Monitor training participation and completion
- Track learning effectiveness
- Manage certifications and renewal processes
- Configure adaptive learning logic
- Participate in mentorship

**Capabilities:**
- Create and manage training program catalogs
- Design personalized learning paths for employees
- Configure AI recommendation logic and parameters
- Add, update, and manage external training courses
- Monitor and analyze training program metrics
- Track completion rates and learning effectiveness
- Manage certification requirements and renewals
- Configure and optimize recommendation logic

**API Access:**
- `GET /external-courses` - View all courses
- `POST /external-courses` - Create new courses
- `PUT /external-courses/{id}` - Update courses
- `DELETE /external-courses/{id}` - Delete courses
- `GET /external-courses/skill/{skillName}` - Filter by skill
- `GET /external-courses/level/{level}` - Filter by level
- `GET /external-courses/provider/{provider}` - Filter by provider
- `GET /learning-paths/employee/**` - View learning paths
- `POST /learning-paths/generate/**` - Generate learning paths
- `GET /recommendations/employee/**` - View recommendations
- `POST /recommendations/generate/**` - Generate recommendations
- `GET /skill-gaps/employee/**` - View employee skill gaps
- `GET /roles/{role}/permissions` - View role permissions

---

### 7. **MENTOR** (NEW)
Senior/experienced role providing mentorship and guidance for employee development.

**Permissions:**
- View own skill gaps
- View own learning paths
- View own recommendations
- Participate in mentorship/knowledge-sharing
- View assigned mentees
- Support mentees' learning paths
- Monitor mentee learning/training progress
- Provide learning guidance/recommendations
- Track mentorship progress

**Capabilities:**
- View and monitor assigned mentees' learning progress
- Provide guidance on skill development
- Support mentees in achieving learning goals
- Track mentorship relationship progress
- Share knowledge and best practices
- Recommend resources and learning interventions

**API Access:**
- `GET /skill-gaps/employee/{id}` - View own/mentee gaps
- `GET /learning-paths/employee/{id}` - View own/mentee paths
- `GET /recommendations/employee/{id}` - View recommendations
- `GET /external-courses` - View available courses
- `GET /employees/by-role/**` - Query employee roster
- `GET /roles/{role}` - View role information

---

## Role Hierarchy

The roles have the following hierarchy of permissions (more permissions = higher level):

```
EMPLOYEE
    ↓
MENTOR / LEARNING_DEVELOPMENT_ADMIN
    ↓
MANAGER / DEPARTMENT_HEAD
    ↓
HR
    ↓
ADMIN (Full Access)
```

---

## Permission Matrix

| Permission | EMPLOYEE | MANAGER | HR | ADMIN | DEPT_HEAD | L&D_ADMIN | MENTOR |
|---|---|---|---|---|---|---|---|
| view_own_skill_gaps | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| view_own_learning_paths | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| view_own_recommendations | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| view_department_skill_coverage | | ✓ | ✓ | ✓ | ✓ | | |
| view_department_skill_gaps | | ✓ | ✓ | ✓ | ✓ | | |
| view_training_adoption | | ✓ | ✓ | ✓ | ✓ | ✓ | |
| view_employee_progress | | ✓ | ✓ | ✓ | ✓ | | |
| monitor_learning_progress | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| support_learning_interventions | | ✓ | ✓ | ✓ | ✓ | | |
| access_department_dashboard | | ✓ | ✓ | ✓ | ✓ | | |
| manage_training_programs | | | ✓ | ✓ | | ✓ | |
| manage_learning_paths | | | ✓ | ✓ | | ✓ | |
| configure_recommendations | | | ✓ | ✓ | | ✓ | |
| manage_external_courses | | | ✓ | ✓ | | ✓ | |
| track_learning_effectiveness | | | ✓ | ✓ | | ✓ | |
| manage_certifications | | | ✓ | ✓ | | ✓ | |
| manage_roles | | | ✓ | ✓ | | | |
| manage_system_settings | | | | ✓ | | | |
| participate_mentorship | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| view_mentees | | | | | | | ✓ |
| support_mentee_learning | | | | | | | ✓ |
| track_mentorship_progress | | | | | | | ✓ |

---

## Authentication Flow

### 1. User Registration
```bash
POST /auth/register
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "EMPLOYEE"  # or MANAGER, HR, ADMIN, DEPARTMENT_HEAD, LEARNING_DEVELOPMENT_ADMIN, MENTOR
}
```

### 2. User Login
```bash
POST /auth/login
{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "EMPLOYEE",
  "fullName": "John Doe",
  "email": "john@example.com"
}
```

### 3. API Request with JWT Token
All authenticated requests must include the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Role Management Endpoints

### Get All Available Roles
```bash
GET /roles
Authorization: Bearer <token>

Response (accessible to ADMIN, HR):
{
  "roles": ["EMPLOYEE", "MANAGER", "HR", "ADMIN", "DEPARTMENT_HEAD", "LEARNING_DEVELOPMENT_ADMIN", "MENTOR"],
  "count": 7
}
```

### Get Role Details
```bash
GET /roles/{role}
Authorization: Bearer <token>

Example: GET /roles/DEPARTMENT_HEAD

Response:
{
  "role": "DEPARTMENT_HEAD",
  "description": "Department head overseeing team skill gaps and learning progress",
  "permissions": [
    "view_department_skill_coverage",
    "view_department_skill_gaps",
    "monitor_learning_progress",
    "access_department_dashboard",
    ...
  ]
}
```

### Get All Roles with Details
```bash
GET /roles/info/all
Authorization: Bearer <token>

Response:
{
  "roles": {
    "EMPLOYEE": {
      "description": "Regular employee...",
      "permissions": [...]
    },
    "MANAGER": {
      "description": "Manager with team oversight...",
      "permissions": [...]
    },
    ...
  }
}
```

### Check Permission
```bash
GET /roles/{role}/has-permission/{permission}
Authorization: Bearer <token>

Example: GET /roles/DEPARTMENT_HEAD/has-permission/manage_training_programs

Response:
{
  "role": "DEPARTMENT_HEAD",
  "permission": "manage_training_programs",
  "hasPermission": false
}
```

### Update Employee Role
```bash
PUT /employees/{employeeId}/role/{newRole}
Authorization: Bearer <token>

Example: PUT /employees/5/role/MENTOR

Response:
{
  "id": 5,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "role": "MENTOR",
  "department": "Software Engineering",
  ...
}
```

---

## Authorization Error Responses

### 403 Forbidden - Insufficient Permissions
```json
{
  "timestamp": "2024-01-15T10:30:00.000+00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access Denied"
}
```

### 401 Unauthorized - Missing/Invalid Token
```json
{
  "timestamp": "2024-01-15T10:30:00.000+00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required"
}
```

---

## Implementation Notes

1. **Role Normalization**: Roles are automatically normalized to uppercase during registration and login (e.g., "department head" → "DEPARTMENT_HEAD")

2. **User-Employee Sync**: When a user is created, a corresponding Employee record is automatically created with the same role.

3. **Role Updates**: When updating an employee's role, both the `app_users` and `employee` tables are updated for consistency.

4. **Permission Checks**: All controllers use `@PreAuthorize` annotations with Spring Security to enforce role-based access control.

5. **JWT Tokens**: Tokens include the user's role as a claim and are valid for 24 hours.

---

## Database Schema

### Key Tables
- `app_users` - User authentication and role data
- `employee` - Employee profile information with role
- Roles are stored as strings in the `role` column (VARCHAR(50))

Supported role values:
- EMPLOYEE
- MANAGER
- HR
- ADMIN
- DEPARTMENT_HEAD
- LEARNING_DEVELOPMENT_ADMIN
- MENTOR

---

## Testing

Comprehensive unit tests are provided in `RolePermissionServiceTest.java` covering:
- Permission assignments for each role
- Permission checking logic
- Access control validation
- Role description generation
- Null/invalid role handling

Run tests with:
```bash
mvn test -Dtest=RolePermissionServiceTest
```

---

## Security Best Practices

1. Always validate role strings on the backend
2. Use `@PreAuthorize` annotations consistently
3. Never trust client-sent role information
4. Log role-based access for audit trails
5. Regularly review and update permission mappings
6. Test authorization before deployment
