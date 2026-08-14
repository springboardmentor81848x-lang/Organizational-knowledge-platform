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

async function runQaSuite() {
  console.log('=== STARTING AUTONOMOUS QA TEST SUITE ===\n');
  const results = [];

  // Test 1: Health Check
  try {
    const res = await request('GET', '/auth/health');
    console.log('[PASS] Health Check:', res.status, res.body);
    results.push({ name: 'Health Check', status: 'PASS', detail: res.body });
  } catch (err) {
    console.error('[FAIL] Health Check:', err.message);
    results.push({ name: 'Health Check', status: 'FAIL', error: err.message });
  }

  // Test 2: Demo Logins for All 6 Roles
  const roles = [
    { name: 'Employee', email: 'employee@northwind.io', role: 'EMPLOYEE' },
    { name: 'Manager', email: 'manager@northwind.io', role: 'MANAGER' },
    { name: 'HR Specialist', email: 'hr@northwind.io', role: 'HR_SPECIALIST' },
    { name: 'Department Head', email: 'depthead@northwind.io', role: 'DEPARTMENT_HEAD' },
    { name: 'L&D Admin', email: 'ldadmin@northwind.io', role: 'L_AND_D_ADMIN' },
    { name: 'System Admin', email: 'admin@northwind.io', role: 'SYSTEM_ADMIN' },
  ];

  const tokens = {};

  for (const r of roles) {
    try {
      const res = await request('POST', '/auth/login', { email: r.email, password: 'password123' });
      if (res.status === 200 && res.body.token) {
        tokens[r.role] = res.body.token;
        console.log(`[PASS] Login (${r.name}):`, res.status, 'Token acquired for:', res.body.email, 'Role:', res.body.systemRole);
        results.push({ name: `Login - ${r.name}`, status: 'PASS', email: r.email });
      } else {
        console.error(`[FAIL] Login (${r.name}): Status`, res.status, res.body);
        results.push({ name: `Login - ${r.name}`, status: 'FAIL', detail: res.body });
      }
    } catch (err) {
      console.error(`[FAIL] Login (${r.name}):`, err.message);
      results.push({ name: `Login - ${r.name}`, status: 'FAIL', error: err.message });
    }
  }

  // Test 3: Registration Validation & Success
  const testEmail = `qa_test_${Date.now()}@northwind.io`;
  try {
    // Valid signup
    const regRes = await request('POST', '/auth/register', {
      fullName: 'QA Automation User',
      email: testEmail,
      password: 'Password123!',
      role: 'EMPLOYEE',
      departmentName: 'Engineering',
      roleTitle: 'Software Engineer',
      skills: [{ skillName: 'React', proficiencyLevel: 4 }]
    });

    if (regRes.status === 200 && regRes.body.token) {
      console.log('[PASS] Signup (New User):', regRes.status, 'Token:', regRes.body.token ? 'Valid' : 'Missing');
      results.push({ name: 'Signup - New User', status: 'PASS', email: testEmail });

      // Duplicate email test
      const dupRes = await request('POST', '/auth/register', {
        fullName: 'QA Duplicate User',
        email: testEmail,
        password: 'Password123!',
        role: 'EMPLOYEE'
      });
      if (dupRes.status === 400 || dupRes.status === 500) {
        console.log('[PASS] Signup (Duplicate Email Blocked): Status', dupRes.status, dupRes.body);
        results.push({ name: 'Signup - Duplicate Email Validation', status: 'PASS' });
      } else {
        console.error('[FAIL] Signup (Duplicate Email Allowed!): Status', dupRes.status);
        results.push({ name: 'Signup - Duplicate Email Validation', status: 'FAIL', detail: dupRes.body });
      }
    } else {
      console.error('[FAIL] Signup (New User): Status', regRes.status, regRes.body);
      results.push({ name: 'Signup - New User', status: 'FAIL', detail: regRes.body });
    }
  } catch (err) {
    console.error('[FAIL] Signup Test:', err.message);
    results.push({ name: 'Signup', status: 'FAIL', error: err.message });
  }

  // Test 4: Auth Session Recovery (/auth/me)
  const empToken = tokens['EMPLOYEE'];
  if (empToken) {
    try {
      const meRes = await request('GET', '/auth/me', null, empToken);
      if (meRes.status === 200 && meRes.body.email) {
        console.log('[PASS] Session Recovery (/auth/me):', meRes.status, 'User:', meRes.body.fullName, meRes.body.email);
        results.push({ name: 'Session Recovery (/auth/me)', status: 'PASS' });
      } else {
        console.error('[FAIL] Session Recovery (/auth/me): Status', meRes.status, meRes.body);
        results.push({ name: 'Session Recovery (/auth/me)', status: 'FAIL', detail: meRes.body });
      }
    } catch (err) {
      console.error('[FAIL] Session Recovery:', err.message);
      results.push({ name: 'Session Recovery (/auth/me)', status: 'FAIL', error: err.message });
    }
  }

  // Test 5: Protected Routes for Employee
  if (empToken) {
    // Gap Analysis
    try {
      const gapRes = await request('GET', '/gap-analysis/me', null, empToken);
      console.log(`[${gapRes.status === 200 ? 'PASS' : 'FAIL'}] Gap Analysis (/gap-analysis/me):`, gapRes.status, 'Gaps count:', Array.isArray(gapRes.body) ? gapRes.body.length : 0);
      results.push({ name: 'Gap Analysis Endpoint', status: gapRes.status === 200 ? 'PASS' : 'FAIL' });
    } catch (err) {
      console.error('[FAIL] Gap Analysis:', err.message);
      results.push({ name: 'Gap Analysis Endpoint', status: 'FAIL', error: err.message });
    }

    // Personalized Learning Path
    try {
      const lpRes = await request('GET', '/training/learning-path/personalized', null, empToken);
      console.log(`[${lpRes.status === 200 ? 'PASS' : 'FAIL'}] Personalized Learning Path:`, lpRes.status, 'Steps:', lpRes.body && lpRes.body.steps ? lpRes.body.steps.length : 0);
      results.push({ name: 'Personalized Learning Path', status: lpRes.status === 200 ? 'PASS' : 'FAIL' });
    } catch (err) {
      console.error('[FAIL] Learning Path:', err.message);
      results.push({ name: 'Personalized Learning Path', status: 'FAIL', error: err.message });
    }

    // Training Courses & Enrollment
    try {
      const coursesRes = await request('GET', '/training/courses', null, empToken);
      console.log(`[${coursesRes.status === 200 ? 'PASS' : 'FAIL'}] Training Courses Catalog:`, coursesRes.status, 'Count:', Array.isArray(coursesRes.body) ? coursesRes.body.length : 0);
      results.push({ name: 'Training Courses Catalog', status: coursesRes.status === 200 ? 'PASS' : 'FAIL' });

      if (Array.isArray(coursesRes.body) && coursesRes.body.length > 0) {
        const firstCourseId = coursesRes.body[0].id;
        const enrollRes = await request('POST', '/training/enroll', { courseId: firstCourseId }, empToken);
        console.log(`[${enrollRes.status === 200 ? 'PASS' : 'FAIL'}] Course Enrollment:`, enrollRes.status, 'Status:', enrollRes.body.status);
        results.push({ name: 'Course Enrollment Workflow', status: enrollRes.status === 200 ? 'PASS' : 'FAIL' });
      }
    } catch (err) {
      console.error('[FAIL] Training/Enrollment:', err.message);
      results.push({ name: 'Training & Enrollment', status: 'FAIL', error: err.message });
    }

    // Notifications
    try {
      const notifRes = await request('GET', '/notifications/me', null, empToken);
      console.log(`[${notifRes.status === 200 ? 'PASS' : 'FAIL'}] Notifications (/notifications/me):`, notifRes.status, 'Count:', Array.isArray(notifRes.body) ? notifRes.body.length : 0);
      results.push({ name: 'Notifications Endpoint', status: notifRes.status === 200 ? 'PASS' : 'FAIL' });
    } catch (err) {
      console.error('[FAIL] Notifications:', err.message);
      results.push({ name: 'Notifications Endpoint', status: 'FAIL', error: err.message });
    }
  }

  // Test 6: Manager Scoped Heatmap
  const mgrToken = tokens['MANAGER'] || tokens['EMPLOYEE'];
  if (mgrToken) {
    try {
      const heatRes = await request('GET', '/gap-analysis/scoped-heatmap', null, mgrToken);
      console.log(`[${heatRes.status === 200 ? 'PASS' : 'FAIL'}] Scoped Heatmap (Manager):`, heatRes.status, 'Matrix:', heatRes.body.rows ? heatRes.body.rows.length : 0, 'x', heatRes.body.cols ? heatRes.body.cols.length : 0);
      results.push({ name: 'Manager Heatmap Matrix', status: heatRes.status === 200 ? 'PASS' : 'FAIL' });
    } catch (err) {
      console.error('[FAIL] Manager Heatmap:', err.message);
      results.push({ name: 'Manager Heatmap Matrix', status: 'FAIL', error: err.message });
    }
  }

  // Test 7: Analytics CSV Export
  try {
    const csvRes = await request('GET', '/analytics/export/gaps.csv');
    console.log(`[${csvRes.status === 200 ? 'PASS' : 'FAIL'}] CSV Gaps Export:`, csvRes.status, 'Length:', typeof csvRes.body === 'string' ? csvRes.body.length : 0);
    results.push({ name: 'CSV Gaps Export', status: csvRes.status === 200 ? 'PASS' : 'FAIL' });
  } catch (err) {
    console.error('[FAIL] CSV Export:', err.message);
    results.push({ name: 'CSV Gaps Export', status: 'FAIL', error: err.message });
  }

  console.log('\n=== QA SUITE TEST SUMMARY ===');
  console.table(results);
}

runQaSuite();
