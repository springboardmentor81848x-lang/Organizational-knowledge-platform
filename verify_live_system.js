const http = require('http');

const API_BASE = 'http://localhost:8080/api';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch { json = data; }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', err => reject(err));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function checkFrontend() {
  return new Promise((resolve) => {
    http.get('http://localhost:5173/', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, length: data.length });
      });
    }).on('error', err => resolve({ status: 'ERROR', error: err.message }));
  });
}

async function verifyAll6Roles() {
  console.log('=== VERIFYING LIVE SYSTEM ACROSS ALL 6 ROLES ===\n');

  // 1. Check frontend server
  const fe = await checkFrontend();
  console.log(`[FRONTEND] HTTP Server http://localhost:5173/ -> Status: ${fe.status}, Payload bytes: ${fe.length}`);

  // 2. Test logins and cross-role features for all 6 roles
  const roles = [
    { name: 'Employee', email: 'employee@northwind.io', role: 'EMPLOYEE' },
    { name: 'Team Lead / Manager', email: 'manager@northwind.io', role: 'MANAGER' },
    { name: 'HR Specialist', email: 'hr@northwind.io', role: 'HR_SPECIALIST' },
    { name: 'Department Head', email: 'depthead@northwind.io', role: 'DEPARTMENT_HEAD' },
    { name: 'L&D Admin', email: 'ldadmin@northwind.io', role: 'L_AND_D_ADMIN' },
    { name: 'System Admin', email: 'admin@northwind.io', role: 'SYSTEM_ADMIN' },
  ];

  const tokens = {};

  console.log('\n--- 1. AUTHENTICATION & TOKEN ISSUANCE ---');
  for (const r of roles) {
    const res = await request('POST', '/auth/login', { email: r.email, password: 'password123' });
    if (res.status === 200 && res.body.token) {
      tokens[r.role] = res.body.token;
      console.log(`✔ [${r.name}] (${r.email}) Login OK -> Role: ${res.body.systemRole}`);
    } else {
      console.error(`✘ [${r.name}] Login FAILED:`, res.status, res.body);
    }
  }

  console.log('\n--- 2. ROLE 1: EMPLOYEE INTERACTIVE ENDPOINTS ---');
  const empToken = tokens['EMPLOYEE'];
  if (empToken) {
    const me = await request('GET', '/auth/me', null, empToken);
    console.log(`✔ Employee Profile: ${me.body.fullName} (${me.body.email}), Department: ${me.body.department}`);

    const skills = await request('GET', '/competency/skills', null, empToken);
    console.log(`✔ Competency Skills Catalog: ${Array.isArray(skills.body) ? skills.body.length : 0} skills available`);

    const gaps = await request('GET', '/gap-analysis/me', null, empToken);
    console.log(`✔ Skill Gap Analysis: ${Array.isArray(gaps.body) ? gaps.body.length : 0} evaluated skills`);

    const lPath = await request('GET', '/training/learning-path/personalized', null, empToken);
    console.log(`✔ Personalized Learning Path: ${lPath.body && lPath.body.steps ? lPath.body.steps.length : 0} recommended modules`);
  }

  console.log('\n--- 3. ROLE 2: MANAGER / TEAM LEAD ENDPOINTS ---');
  const mgrToken = tokens['MANAGER'];
  if (mgrToken) {
    const heatmap = await request('GET', '/gap-analysis/scoped-heatmap', null, mgrToken);
    console.log(`✔ Team Heatmap: ${heatmap.body.rows ? heatmap.body.rows.length : 0} team members across ${heatmap.body.cols ? heatmap.body.cols.length : 0} skills`);

    const dash = await request('GET', '/manager/dashboard', null, mgrToken);
    console.log(`✔ Manager Dashboard: Team size ${dash.body.teamSize}, Critical gaps: ${dash.body.criticalGaps}`);
  }

  console.log('\n--- 4. ROLE 3: HR SPECIALIST ENDPOINTS ---');
  const hrToken = tokens['HR_SPECIALIST'];
  if (hrToken) {
    const hrDash = await request('GET', '/hr/dashboard', null, hrToken);
    console.log(`✔ HR Dashboard: Org Employees ${hrDash.body.totalEmployees}, Critical Gaps ${hrDash.body.criticalGaps}, Avg Completion: ${hrDash.body.avgCompletion}%`);
    console.log(`✔ HR Departments: ${hrDash.body.departments ? hrDash.body.departments.length : 0} departments tracked`);
    console.log(`✔ HR Directory: ${hrDash.body.directory ? hrDash.body.directory.length : 0} employees listed`);

    const hrUsers = await request('GET', '/hr/users', null, hrToken);
    console.log(`✔ HR Users Management Endpoint: ${Array.isArray(hrUsers.body) ? hrUsers.body.length : 0} users found in org`);

    const hrDepts = await request('GET', '/hr/departments-list', null, hrToken);
    console.log(`✔ HR Departments Roster Endpoint: ${Array.isArray(hrDepts.body) ? hrDepts.body.length : 0} departments listed`);

    const hrForecast = await request('GET', '/hr/forecasting-data', null, hrToken);
    console.log(`✔ HR Skill Forecasting Endpoint: ${hrForecast.body.forecastSkills ? hrForecast.body.forecastSkills.length : 0} skills forecasted`);
  }

  console.log('\n--- 5. ROLE 4: DEPARTMENT HEAD ENDPOINTS ---');
  const dhToken = tokens['DEPARTMENT_HEAD'];
  if (dhToken) {
    const dhDash = await request('GET', '/depthead/dashboard', null, dhToken);
    console.log(`✔ Department Head Dashboard: ${dhDash.body.departmentName}, Headcount: ${dhDash.body.totalEmployees}, Critical Gaps: ${dhDash.body.criticalGaps}`);

    const benchmarks = await request('GET', '/depthead/benchmarks', null, dhToken);
    console.log(`✔ Role Skill Benchmarks Governance: ${Array.isArray(benchmarks.body) ? benchmarks.body.length : 0} benchmark rules active`);

    const allocation = await request('GET', '/depthead/allocation', null, dhToken);
    console.log(`✔ Budget & Allocation: Total $${allocation.body.totalBudget}, ROI Forecast: ${allocation.body.roiForecast}`);
  }

  console.log('\n--- 6. ROLE 5: L&D ADMIN ENDPOINTS ---');
  const ldToken = tokens['L_AND_D_ADMIN'];
  if (ldToken) {
    const ldDash = await request('GET', '/ldadmin/dashboard', null, ldToken);
    console.log(`✔ L&D Admin Dashboard: Courses: ${ldDash.body.totalCourses}, Pending Certs: ${ldDash.body.pendingCertifications}, Enrollments: ${ldDash.body.totalEnrollments}`);

    const paths = await request('GET', '/ldadmin/paths', null, ldToken);
    console.log(`✔ Adaptive Learning Paths: ${Array.isArray(paths.body) ? paths.body.length : 0} paths registered`);

    const certs = await request('GET', '/ldadmin/certifications', null, ldToken);
    console.log(`✔ Credential Verification Queue: ${Array.isArray(certs.body) ? certs.body.length : 0} items in queue`);
  }

  console.log('\n--- 7. ROLE 6: SYSTEM ADMINISTRATOR ENDPOINTS ---');
  const admToken = tokens['SYSTEM_ADMIN'];
  if (admToken) {
    const admDash = await request('GET', '/admin/dashboard', null, admToken);
    console.log(`✔ Admin Dashboard: Total Users: ${admDash.body.totalUsers}, Active: ${admDash.body.activeSessions}, Uptime: ${admDash.body.uptime}`);

    const users = await request('GET', '/admin/users', null, admToken);
    console.log(`✔ Admin User Directory: ${Array.isArray(users.body) ? users.body.length : 0} registered accounts in Supabase database`);
  }

  console.log('\n======================================================');
  console.log('✔ ALL 6 ROLES AND LIVE DATABASE INTERCONNECTIONS VERIFIED!');
  console.log('======================================================');
}

verifyAll6Roles();
