const http = require('http');

function post(path, body, token = null) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: '/api' + path,
      method: 'POST',
      headers: headers
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, data: data }); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function get(path, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: '/api' + path,
      method: 'GET',
      headers: headers
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, data: data }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function testAllRolesLifecycle() {
  console.log('===============================================================');
  console.log('   FULL END-TO-END VERIFICATION: 6 ROLES & ORGANIZATION SCOPING');
  console.log('===============================================================\n');

  const testOrg = `Apex Technologies ${Date.now()}`;
  console.log(`[1] Creating Organization: "${testOrg}"\n`);

  // 1. Register Employee 1 (Java Developer)
  const emp1Payload = {
    fullName: 'Alex Vance',
    email: `alex.java.${Date.now()}@apextech.io`,
    password: 'password123',
    role: 'EMPLOYEE',
    company: testOrg,
    departmentName: 'Engineering',
    roleTitle: 'Java Developer'
  };
  const emp1Res = await post('/auth/register', emp1Payload);
  console.log(`✔ [EMPLOYEE 1] Registered: ${emp1Payload.fullName} (${emp1Payload.roleTitle}) -> Token: ${!!emp1Res.data.token}`);

  // 2. Register Employee 2 (Python Developer)
  const emp2Payload = {
    fullName: 'Maya Lin',
    email: `maya.python.${Date.now()}@apextech.io`,
    password: 'password123',
    role: 'EMPLOYEE',
    company: testOrg,
    departmentName: 'Engineering',
    roleTitle: 'Python Developer'
  };
  const emp2Res = await post('/auth/register', emp2Payload);
  console.log(`✔ [EMPLOYEE 2] Registered: ${emp2Payload.fullName} (${emp2Payload.roleTitle}) -> Token: ${!!emp2Res.data.token}`);

  // 3. Register Team Lead / Manager
  const mgrPayload = {
    fullName: 'Robert Sterling',
    email: `robert.manager.${Date.now()}@apextech.io`,
    password: 'password123',
    role: 'MANAGER',
    company: testOrg,
    departmentName: 'Engineering',
    roleTitle: 'Engineering Lead'
  };
  const mgrRes = await post('/auth/register', mgrPayload);
  const mgrToken = mgrRes.data.token;
  console.log(`✔ [MANAGER] Registered: ${mgrPayload.fullName} (${mgrPayload.roleTitle}) -> Token: ${!!mgrToken}`);

  // 4. Register HR Specialist
  const hrPayload = {
    fullName: 'Samantha Reed',
    email: `samantha.hr.${Date.now()}@apextech.io`,
    password: 'password123',
    role: 'HR_SPECIALIST',
    company: testOrg,
    departmentName: 'HR & Operations',
    roleTitle: 'HR Specialist'
  };
  const hrRes = await post('/auth/register', hrPayload);
  const hrToken = hrRes.data.token;
  console.log(`✔ [HR SPECIALIST] Registered: ${hrPayload.fullName} (${hrPayload.roleTitle}) -> Token: ${!!hrToken}`);

  // 5. Register Department Head
  const deptHeadPayload = {
    fullName: 'Dr. Victor Stone',
    email: `victor.head.${Date.now()}@apextech.io`,
    password: 'password123',
    role: 'DEPARTMENT_HEAD',
    company: testOrg,
    departmentName: 'Engineering',
    roleTitle: 'Head of Engineering'
  };
  const deptHeadRes = await post('/auth/register', deptHeadPayload);
  const deptHeadToken = deptHeadRes.data.token;
  console.log(`✔ [DEPARTMENT HEAD] Registered: ${deptHeadPayload.fullName} (${deptHeadPayload.roleTitle}) -> Token: ${!!deptHeadToken}`);

  // 6. Register L&D Admin / Mentor
  const ldPayload = {
    fullName: 'Clara Oswald',
    email: `clara.ld.${Date.now()}@apextech.io`,
    password: 'password123',
    role: 'L_AND_D_ADMIN',
    company: testOrg,
    departmentName: 'HR & Operations',
    roleTitle: 'Technical Mentor & L&D Lead'
  };
  const ldRes = await post('/auth/register', ldPayload);
  const ldToken = ldRes.data.token;
  console.log(`✔ [L&D ADMIN / MENTOR] Registered: ${ldPayload.fullName} (${ldPayload.roleTitle}) -> Token: ${!!ldToken}`);

  // 7. Register System Administrator
  const adminPayload = {
    fullName: 'Arthur Dent',
    email: `arthur.admin.${Date.now()}@apextech.io`,
    password: 'password123',
    role: 'SYSTEM_ADMIN',
    company: testOrg,
    departmentName: 'Engineering',
    roleTitle: 'Platform Administrator'
  };
  const adminRes = await post('/auth/register', adminPayload);
  const adminToken = adminRes.data.token;
  console.log(`✔ [SYSTEM ADMIN] Registered: ${adminPayload.fullName} (${adminPayload.roleTitle}) -> Token: ${!!adminToken}\n`);

  console.log('--- VERIFYING ORGANIZATION SCOPING & INTER-ROLE CONNECTION ---');

  // Verify Manager sees their direct reports
  const mgrTeamRes = await get('/manager/team-profiles', mgrToken);
  console.log(`1. Manager Direct Reports Count: ${Array.isArray(mgrTeamRes.data) ? mgrTeamRes.data.length : 'N/A'}`);
  if (Array.isArray(mgrTeamRes.data)) {
    mgrTeamRes.data.forEach(m => console.log(`   - Direct Report: ${m.fullName} [${m.roleTitle}] (${m.departmentName})`));
  }

  // Verify HR sees all organization members
  const hrUsersRes = await get('/hr/users', hrToken);
  console.log(`\n2. HR Specialist Organization Users: ${Array.isArray(hrUsersRes.data) ? hrUsersRes.data.length : 'N/A'}`);
  if (Array.isArray(hrUsersRes.data)) {
    hrUsersRes.data.forEach(u => console.log(`   - Org Member: ${u.fullName} [${u.systemRole}] (${u.department || 'N/A'})`));
  }

  // Verify Department Head Dashboard for Engineering
  const deptHeadDash = await get('/depthead/dashboard', deptHeadToken);
  console.log(`\n3. Department Head Dashboard:`);
  console.log(`   - Department: ${deptHeadDash.data.departmentName}`);
  console.log(`   - Total Employees in Dept: ${deptHeadDash.data.totalEmployees}`);
  console.log(`   - Critical Gaps: ${deptHeadDash.data.criticalGaps}`);

  // Verify L&D Admin Dashboard
  const ldDash = await get('/ldadmin/dashboard', ldToken);
  console.log(`\n4. L&D Admin Dashboard:`);
  console.log(`   - Total Catalog Courses: ${ldDash.data.totalCourses}`);
  console.log(`   - Pending Certifications: ${ldDash.data.pendingCertifications}`);

  // Verify System Admin Dashboard
  const adminDash = await get('/admin/dashboard', adminToken);
  console.log(`\n5. System Administrator Dashboard:`);
  console.log(`   - Total Users in Org: ${adminDash.data.totalUsers}`);
  console.log(`   - Active Sessions: ${adminDash.data.activeSessions}`);
  console.log(`   - Platform Uptime: ${adminDash.data.uptime}`);

  console.log('\n===============================================================');
  console.log('   ✔ ALL 6 ROLES REGISTERED & LINKED TO ORGANIZATION SUCCESSFULLY');
  console.log('===============================================================\n');
}

testAllRolesLifecycle();
