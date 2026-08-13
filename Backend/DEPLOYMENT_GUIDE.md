# Backend Deployment Guide - Three New Roles

## Quick Start

### Prerequisites
- Java 21+
- Maven 3.8+
- PostgreSQL 12+
- Port 8080 available

### Build Instructions

1. **Navigate to Backend Directory**
   ```bash
   cd C:\AndroidProjects\Organizational_Knowledge_Gap_Platform_Final\Backend
   ```

2. **Clean and Compile**
   ```bash
   .\mvnw.cmd clean compile
   ```

3. **Run Tests**
   ```bash
   .\mvnw.cmd test -Dtest=RolePermissionServiceTest
   ```

4. **Build Package**
   ```bash
   .\mvnw.cmd clean package -DskipTests
   ```

5. **Run Application**
   ```bash
   .\mvnw.cmd spring-boot:run
   ```

Application will start on: `http://localhost:8080`

---

## Database Setup

### 1. Initialize Database

If starting fresh, run the complete schema script:
```sql
-- Execute: knowledge_gap_db.sql
-- This creates all tables and populates seed data including the 3 new roles
```

### 2. Update Existing Database

If upgrading an existing installation:
```sql
-- The schema is already compatible - no migration needed
-- New roles can be assigned to existing or new users immediately
-- Run knowledge_gap_db.sql to populate new seed users (optional)
```

### 3. Verify Database Connection

Check `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/knowledge_gap
spring.datasource.username=postgres
spring.datasource.password=root123
```

Update credentials as needed for your environment.

---

## Seed Users

The database includes 12 total users. The first 9 are existing roles, and 3 are new:

### New Role Users (Seed Data)
| Role | Email | Password | ID |
|------|-------|----------|-----|
| DEPARTMENT_HEAD | dept_head@kgap.com | password123 | 10 |
| LEARNING_DEVELOPMENT_ADMIN | lnd_admin@kgap.com | password123 | 11 |
| MENTOR | mentor@kgap.com | password123 | 12 |

### Testing New Roles

**Login with Department Head:**
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dept_head@kgap.com",
    "password": "password123"
  }'
```

**Response (save the token):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "DEPARTMENT_HEAD",
  "fullName": "Rajesh Kumar",
  "email": "dept_head@kgap.com"
}
```

**Test Endpoint with Token:**
```bash
curl -X GET "http://localhost:8080/roles/DEPARTMENT_HEAD/permissions" \
  -H "Authorization: Bearer <token_from_above>"
```

---

## API Testing Guide

### 1. Authentication Endpoints

#### Register New User with New Role
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Smith",
    "email": "jane.smith@company.com",
    "password": "securePassword123",
    "role": "LEARNING_DEVELOPMENT_ADMIN"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@company.com",
    "password": "securePassword123"
  }'
```

### 2. Role Information Endpoints (All Authenticated Users)

#### Get All Available Roles (ADMIN, HR only)
```bash
curl -X GET "http://localhost:8080/roles" \
  -H "Authorization: Bearer <token>"
```

#### Get Specific Role Details
```bash
curl -X GET "http://localhost:8080/roles/DEPARTMENT_HEAD" \
  -H "Authorization: Bearer <token>"
```

#### Get Role Permissions
```bash
curl -X GET "http://localhost:8080/roles/DEPARTMENT_HEAD/permissions" \
  -H "Authorization: Bearer <token>"
```

#### Get All Roles with Full Details
```bash
curl -X GET "http://localhost:8080/roles/info/all" \
  -H "Authorization: Bearer <token>"
```

#### Check Specific Permission
```bash
curl -X GET "http://localhost:8080/roles/DEPARTMENT_HEAD/has-permission/monitor_learning_progress" \
  -H "Authorization: Bearer <token>"
```

### 3. Employee Management Endpoints

#### Get Employees by Role (ADMIN, HR, MANAGER, DEPARTMENT_HEAD)
```bash
curl -X GET "http://localhost:8080/employees/by-role/MENTOR" \
  -H "Authorization: Bearer <token>"
```

#### Update Employee Role (ADMIN, HR only)
```bash
curl -X PUT "http://localhost:8080/employees/5/role/MENTOR" \
  -H "Authorization: Bearer <token>"
```

### 4. Department Endpoints

#### Get All Departments (ADMIN, HR, MANAGER, DEPARTMENT_HEAD)
```bash
curl -X GET "http://localhost:8080/departments" \
  -H "Authorization: Bearer <token>"
```

### 5. External Courses Endpoints

#### View Courses (All authenticated users)
```bash
curl -X GET "http://localhost:8080/external-courses" \
  -H "Authorization: Bearer <token>"
```

#### Add Course (HR, ADMIN, LEARNING_DEVELOPMENT_ADMIN)
```bash
curl -X POST http://localhost:8080/external-courses \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Advanced Spring Boot",
    "provider": "Udemy",
    "description": "Master Spring Boot development",
    "skillName": "Java & Spring Boot",
    "level": "EXPERT",
    "durationHours": 40,
    "courseLink": "https://udemy.com/course/..."
  }'
```

#### Delete Course (HR, ADMIN, LEARNING_DEVELOPMENT_ADMIN)
```bash
curl -X DELETE "http://localhost:8080/external-courses/1" \
  -H "Authorization: Bearer <token>"
```

---

## Troubleshooting

### Issue: 403 Forbidden

**Cause:** User role doesn't have permission for endpoint

**Solution:** Check user role and verify endpoint authorization in SecurityConfig

```bash
# Get user's current role
curl -X GET "http://localhost:8080/auth/current" \
  -H "Authorization: Bearer <token>"
```

### Issue: 401 Unauthorized

**Cause:** Invalid or missing JWT token

**Solution:** 
1. Ensure token is included in Authorization header
2. Check token hasn't expired (24 hour validity)
3. Re-authenticate to get new token

### Issue: InvalidEndOfLine Exception with && operator

**Cause:** Windows PowerShell doesn't support && operator

**Solution:** Use semicolon (;) and if statements instead:
```powershell
cd path; if ($?) { next_command }
```

### Issue: Build Compilation Error

**Solution:** 
```bash
# Clean build cache
.\mvnw.cmd clean

# Clear local repository cache
rm -r ~/.m2/repository (or use GUI file manager)

# Rebuild
.\mvnw.cmd clean compile
```

### Issue: Database Connection Failed

**Solution:** Verify in `application.properties`:
1. PostgreSQL service is running
2. Database exists: `knowledge_gap`
3. Credentials are correct
4. Port 5432 is accessible

```bash
# Test PostgreSQL connection
psql -U postgres -d knowledge_gap -c "SELECT 1"
```

---

## Post-Deployment Verification

### 1. Application Health Check
```bash
curl -X GET http://localhost:8080/actuator/health
# Or without actuator:
curl -X GET http://localhost:8080/auth/register (should return error, not 404)
```

### 2. Database Verification
```sql
-- Connect to PostgreSQL
psql -U postgres -d knowledge_gap

-- Verify users with new roles
SELECT id, full_name, email, role FROM app_users WHERE role IN ('DEPARTMENT_HEAD', 'LEARNING_DEVELOPMENT_ADMIN', 'MENTOR');

-- Verify employee records
SELECT id, first_name, last_name, email, role FROM employee WHERE role IN ('DEPARTMENT_HEAD', 'LEARNING_DEVELOPMENT_ADMIN', 'MENTOR');
```

Expected output:
```
 id |        full_name        |        email        |             role
----+-------------------------+---------------------+------------------------------
 10 | Rajesh Kumar            | dept_head@kgap.com  | DEPARTMENT_HEAD
 11 | Dr. Lisa Wang           | lnd_admin@kgap.com  | LEARNING_DEVELOPMENT_ADMIN
 12 | Michael Chen            | mentor@kgap.com     | MENTOR
```

### 3. Role Permission Validation
```bash
# Test each new role has correct permissions
curl -X GET "http://localhost:8080/roles/DEPARTMENT_HEAD/permissions" \
  -H "Authorization: Bearer <token>"

# Verify DEPARTMENT_HEAD has these permissions:
# - view_department_skill_coverage
# - view_department_skill_gaps
# - monitor_learning_progress
# - access_department_dashboard
```

### 4. Authorization Testing

**Test DEPARTMENT_HEAD Can Access:**
```bash
curl -X GET "http://localhost:8080/departments" \
  -H "Authorization: Bearer <dept_head_token>"
# Should return 200 OK
```

**Test DEPARTMENT_HEAD Cannot Access:**
```bash
curl -X DELETE "http://localhost:8080/departments/1" \
  -H "Authorization: Bearer <dept_head_token>"
# Should return 403 Forbidden
```

**Test LEARNING_DEVELOPMENT_ADMIN Can Create Courses:**
```bash
curl -X POST http://localhost:8080/external-courses \
  -H "Authorization: Bearer <lnd_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Course", ...}'
# Should return 200 OK
```

### 5. Role Endpoint Testing
```bash
# Should work for ADMIN/HR
curl -X GET "http://localhost:8080/roles" \
  -H "Authorization: Bearer <admin_token>"
# Should return 200 OK

# Should fail for EMPLOYEE
curl -X GET "http://localhost:8080/roles" \
  -H "Authorization: Bearer <employee_token>"
# Should return 403 Forbidden
```

---

## Frontend Integration Notes

### Updated Role Dropdowns

The frontend role selector should now include:
- EMPLOYEE
- MANAGER
- HR
- ADMIN
- **DEPARTMENT_HEAD** (NEW)
- **LEARNING_DEVELOPMENT_ADMIN** (NEW)
- **MENTOR** (NEW)

### API Endpoints to Update Frontend

1. **Get Available Roles:**
   ```
   GET /roles/info/all
   ```
   Returns all 7 roles with descriptions and permissions

2. **Role-Based UI Rendering:**
   Use `/roles/{role}/permissions` to determine which UI components to show

3. **Update User Role:**
   ```
   PUT /employees/{employeeId}/role/{newRole}
   ```

### Example Frontend Changes

```javascript
// Fetch available roles for dropdown
async function getAvailableRoles() {
  const response = await fetch('/roles/info/all', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
}

// Check if user has permission
async function userHasPermission(role, permission) {
  const response = await fetch(`/roles/${role}/has-permission/${permission}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data.hasPermission;
}

// Update user role
async function updateUserRole(employeeId, newRole) {
  const response = await fetch(`/employees/${employeeId}/role/${newRole}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
}
```

---

## Monitoring and Logging

### Enable SQL Logging
In `application.properties`:
```properties
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.use_sql_comments=true
```

### Log Authorization Decisions
Add to Spring Security configuration:
```java
logging.level.org.springframework.security=DEBUG
```

### Monitor Role Changes
Check application logs for:
- Authentication events
- Authorization successes/failures
- Role update operations

---

## Performance Optimization

### Database Indexes
Consider adding indexes for frequently queried columns:
```sql
CREATE INDEX idx_app_users_role ON app_users(role);
CREATE INDEX idx_employee_role ON employee(role);
CREATE INDEX idx_employee_email ON employee(email);
```

### Caching
The RolePermissionService is stateless and lightweight. Consider caching in production:
```java
@Cacheable(value = "rolePermissions", key = "#role")
public Set<String> getPermissionsForRole(String role) { ... }
```

---

## Security Hardening

1. **Update JWT Secret** (for production):
   ```java
   // In JwtService.java
   private static final String SECRET_KEY = 
     "<generate-strong-random-key>";
   ```

2. **Change Seed Passwords** (for production):
   ```sql
   UPDATE app_users SET password = '<new-bcrypt-hash>' 
   WHERE email IN ('dept_head@kgap.com', 'lnd_admin@kgap.com', 'mentor@kgap.com');
   ```

3. **Enable HTTPS** (for production):
   ```properties
   server.ssl.key-store=classpath:keystore.p12
   server.ssl.key-store-password=<password>
   server.ssl.key-store-type=PKCS12
   ```

4. **CORS Configuration** (update for production):
   Update `SecurityConfig.corsConfigurationSource()` with specific origins

---

## Rollback Plan

If issues arise after deployment:

1. **Revert Code Changes:**
   ```bash
   git checkout <previous-commit>
   ```

2. **Recompile and Deploy:**
   ```bash
   ./mvnw.cmd clean package -DskipTests
   ```

3. **Database Rollback:**
   - If using new roles in production data, update those users back to old roles:
   ```sql
   UPDATE app_users SET role = 'EMPLOYEE' WHERE role IN ('DEPARTMENT_HEAD', 'LEARNING_DEVELOPMENT_ADMIN', 'MENTOR');
   UPDATE employee SET role = 'EMPLOYEE' WHERE role IN ('DEPARTMENT_HEAD', 'LEARNING_DEVELOPMENT_ADMIN', 'MENTOR');
   ```

---

## Success Criteria

✓ Application starts without errors
✓ All 12 seed users can authenticate
✓ New roles can be assigned to users
✓ Each role has correct permissions
✓ Authorization checks work as expected
✓ Backward compatibility maintained
✓ All tests pass
✓ Frontend displays new roles correctly

---

For issues or questions, refer to:
- `ROLES_AND_PERMISSIONS.md` - Complete role documentation
- `IMPLEMENTATION_SUMMARY.md` - Technical implementation details
- Source code comments in modified files
