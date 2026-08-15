const http = require('http');

const BASE_URL = 'http://localhost:8080/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.token ? { 'Authorization': `Bearer ${options.token}` } : {}),
    ...options.headers
  };

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    json = text;
  }

  return {
    status: res.status,
    ok: res.ok,
    data: json
  };
}

async function login(email, password = 'password123') {
  const res = await request('/auth/login', {
    method: 'POST',
    body: { email, password }
  });
  if (!res.ok) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(res.data)}`);
  }
  return res.data;
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 TESTING COMPLETE 6-ROLE ORGANIZATIONAL WORKFLOW');
  console.log('====================================================\n');

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
    }
  }

  // 1. Check Backend Health
  console.log('--- 0. SYSTEM HEALTH CHECK ---');
  const health = await request('/auth/health');
  assert(health.status === 200 && health.data.status === 'UP', 'Backend is healthy and reachable');

  // 2. EMPLOYEE WORKFLOW
  console.log('\n--- 1. EMPLOYEE ROLE WORKFLOW (employee@northwind.io) ---');
  const empAuth = await login('employee@northwind.io');
  assert(empAuth.systemRole === 'EMPLOYEE', 'Employee authenticated with systemRole EMPLOYEE');
  
  const empProfile = await request('/employee/profile', { token: empAuth.token });
  assert(empProfile.status === 200 && empProfile.data.email === 'employee@northwind.io', 'Employee fetched personal profile');

  const empGaps = await request('/gap-analysis/me', { token: empAuth.token });
  assert(empGaps.status === 200 && Array.isArray(empGaps.data), `Employee computed personal skill gaps (${empGaps.data.length} gaps)`);

  const empLearningPath = await request('/training/learning-path/personalized', { token: empAuth.token });
  assert(empLearningPath.status === 200 && Array.isArray(empLearningPath.data.steps), `Employee personalized learning path loaded (${empLearningPath.data.steps?.length || 0} steps)`);

  const empAssessments = await request('/assessments/me', { token: empAuth.token });
  assert(empAssessments.status === 200 && Array.isArray(empAssessments.data), `Employee retrieved assessments list (${Array.isArray(empAssessments.data) ? empAssessments.data.length : 0} items)`);

  // 3. MANAGER WORKFLOW
  console.log('\n--- 2. MANAGER ROLE WORKFLOW (manager@northwind.io) ---');
  const mgrAuth = await login('manager@northwind.io');
  assert(mgrAuth.systemRole === 'MANAGER', 'Manager authenticated with systemRole MANAGER');

  const mgrDashboard = await request('/manager/dashboard', { token: mgrAuth.token });
  assert(mgrDashboard.status === 200 && mgrDashboard.data.totalTeamMembers !== undefined, `Manager retrieved team dashboard (${mgrDashboard.data.totalTeamMembers} members)`);

  const mgrTeamGaps = await request('/manager/team-gaps', { token: mgrAuth.token });
  assert(mgrTeamGaps.status === 200, 'Manager retrieved team gaps summary');

  const mgrHeatmap = await request('/manager/heatmap-data', { token: mgrAuth.token });
  assert(mgrHeatmap.status === 200 && Array.isArray(mgrHeatmap.data.rows), `Manager retrieved department skill heatmap (${mgrHeatmap.data.rows.length} team members)`);

  const mgrProfiles = await request('/manager/team-profiles', { token: mgrAuth.token });
  assert(mgrProfiles.status === 200 && Array.isArray(mgrProfiles.data), `Manager retrieved team member profiles (${mgrProfiles.data.length} profiles)`);

  // 4. HR SPECIALIST WORKFLOW
  console.log('\n--- 3. HR SPECIALIST ROLE WORKFLOW (hr@northwind.io) ---');
  const hrAuth = await login('hr@northwind.io');
  assert(hrAuth.systemRole === 'HR_SPECIALIST', 'HR Specialist authenticated with systemRole HR_SPECIALIST');

  const hrDashboard = await request('/hr/dashboard', { token: hrAuth.token });
  assert(hrDashboard.status === 200 && hrDashboard.data.totalEmployees !== undefined, `HR retrieved org-wide dashboard (${hrDashboard.data.totalEmployees} employees, ROI: ${hrDashboard.data.roi})`);

  const hrUsers = await request('/hr/users', { token: hrAuth.token });
  assert(hrUsers.status === 200 && Array.isArray(hrUsers.data), `HR retrieved workforce directory (${hrUsers.data.length} members)`);

  const hrForecasting = await request('/hr/forecasting-data', { token: hrAuth.token });
  assert(hrForecasting.status === 200 && Array.isArray(hrForecasting.data.forecastSkills), `HR retrieved strategic skill forecasting (${hrForecasting.data.forecastSkills.length} skills)`);

  const hrDepts = await request('/hr/departments-list', { token: hrAuth.token });
  assert(hrDepts.status === 200 && Array.isArray(hrDepts.data), `HR retrieved organization departments (${hrDepts.data.length} depts)`);

  // 5. DEPARTMENT HEAD WORKFLOW
  console.log('\n--- 4. DEPARTMENT HEAD ROLE WORKFLOW (depthead@northwind.io) ---');
  const dhAuth = await login('depthead@northwind.io');
  assert(dhAuth.systemRole === 'DEPARTMENT_HEAD', 'Department Head authenticated with systemRole DEPARTMENT_HEAD');

  const dhDashboard = await request('/depthead/dashboard', { token: dhAuth.token });
  assert(dhDashboard.status === 200 && dhDashboard.data.departmentName !== undefined, `Department Head retrieved dept overview (${dhDashboard.data.departmentName}, ${dhDashboard.data.totalEmployees} employees)`);

  const dhBenchmarks = await request('/depthead/benchmarks', { token: dhAuth.token });
  assert(dhBenchmarks.status === 200 && Array.isArray(dhBenchmarks.data), `Department Head retrieved role benchmarks (${dhBenchmarks.data.length} benchmarks)`);

  const dhAllocation = await request('/depthead/allocation', { token: dhAuth.token });
  assert(dhAllocation.status === 200 && Array.isArray(dhAllocation.data.teamAllocations), `Department Head retrieved budget/resource allocations (${dhAllocation.data.teamAllocations.length} team items)`);

  // 6. L&D ADMIN WORKFLOW
  console.log('\n--- 5. L&D ADMIN ROLE WORKFLOW (ldadmin@northwind.io) ---');
  const ldAuth = await login('ldadmin@northwind.io');
  assert(ldAuth.systemRole === 'L_AND_D_ADMIN', 'L&D Admin authenticated with systemRole L_AND_D_ADMIN');

  const ldDashboard = await request('/ldadmin/dashboard', { token: ldAuth.token });
  assert(ldDashboard.status === 200 && ldDashboard.data.totalCourses !== undefined, `L&D Admin retrieved management dashboard (${ldDashboard.data.totalCourses} courses)`);

  const ldCerts = await request('/ldadmin/certifications', { token: ldAuth.token });
  assert(ldCerts.status === 200 && Array.isArray(ldCerts.data), `L&D Admin retrieved certification verification center (${ldCerts.data.length} certs)`);

  // 7. SYSTEM ADMINISTRATOR WORKFLOW
  console.log('\n--- 6. SYSTEM ADMINISTRATOR ROLE WORKFLOW (admin@northwind.io) ---');
  const adminAuth = await login('admin@northwind.io');
  assert(adminAuth.systemRole === 'SYSTEM_ADMIN', 'System Admin authenticated with systemRole SYSTEM_ADMIN');

  const adminDashboard = await request('/admin/dashboard', { token: adminAuth.token });
  assert(adminDashboard.status === 200 && adminDashboard.data.totalUsers !== undefined, `Admin retrieved system dashboard (${adminDashboard.data.totalUsers} users, Uptime: ${adminDashboard.data.uptime})`);
  assert(Array.isArray(adminDashboard.data.roles), `Admin retrieved roles summary (${adminDashboard.data.roles.length} roles)`);
  assert(Array.isArray(adminDashboard.data.audit), `Admin retrieved audit event feed (${adminDashboard.data.audit.length} events)`);

  const adminUsers = await request('/admin/users', { token: adminAuth.token });
  assert(adminUsers.status === 200 && Array.isArray(adminUsers.data), `Admin retrieved user accounts management (${adminUsers.data.length} users)`);

  const skillsList = await request('/competency/skills', { token: adminAuth.token });
  assert(skillsList.status === 200 && Array.isArray(skillsList.data), `Admin retrieved global skill taxonomy (${skillsList.data.length} skills)`);

  const createSkillRes = await request('/admin/skills', {
    method: 'POST',
    token: adminAuth.token,
    body: { name: 'GraphQL API Architecture', categoryName: 'Technical', description: 'Schema design and GraphQL Federation' }
  });
  assert(createSkillRes.status === 200 && createSkillRes.data.id !== undefined, 'Admin created new skill in taxonomy');

  if (createSkillRes.data.id) {
    const deleteSkillRes = await request(`/admin/skills/${createSkillRes.data.id}`, {
      method: 'DELETE',
      token: adminAuth.token
    });
    assert(deleteSkillRes.status === 200, 'Admin deleted test skill from taxonomy');
  }

  // 8. AUTHORIZATION & SECURITY BOUNDARY ENFORCEMENT
  console.log('\n--- 7. AUTHORIZATION BOUNDARY TESTS ---');
  // Employee trying to access Admin endpoint -> 403
  const empAccessAdmin = await request('/admin/dashboard', { token: empAuth.token });
  assert(empAccessAdmin.status === 403, 'Employee blocked from Admin dashboard (HTTP 403 Forbidden)');

  // Employee trying to access HR dashboard -> 403
  const empAccessHr = await request('/hr/dashboard', { token: empAuth.token });
  assert(empAccessHr.status === 403, 'Employee blocked from HR dashboard (HTTP 403 Forbidden)');

  // Employee trying to access Dept Head dashboard -> 403
  const empAccessDeptHead = await request('/depthead/dashboard', { token: empAuth.token });
  assert(empAccessDeptHead.status === 403, 'Employee blocked from Dept Head dashboard (HTTP 403 Forbidden)');

  // Employee trying to create course -> 403
  const empCreateCourse = await request('/training/courses', {
    method: 'POST',
    token: empAuth.token,
    body: { title: 'Unauthorized Course', durationHours: 5 }
  });
  assert(empCreateCourse.status === 403, 'Employee blocked from creating course (HTTP 403 Forbidden)');

  // L&D Admin CAN create course
  const ldCreateCourse = await request('/training/courses', {
    method: 'POST',
    token: ldAuth.token,
    body: {
      title: 'Advanced Microservices with Kubernetes',
      description: 'Production container orchestration and service mesh.',
      provider: 'Cloud Native Computing Foundation',
      courseUrl: 'https://kubernetes.io/docs/tutorials/',
      durationHours: 12
    }
  });
  assert(ldCreateCourse.status === 200 && ldCreateCourse.data.id !== undefined, 'L&D Admin successfully created new training course');

  console.log('\n====================================================');
  console.log(`📊 FINAL RESULT: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('====================================================');

  if (passedTests === totalTests) {
    console.log('🎉 ALL 6 USER ROLES & AUTHORIZATION WORKFLOWS VERIFIED SUCCESSFULLY!');
  } else {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
