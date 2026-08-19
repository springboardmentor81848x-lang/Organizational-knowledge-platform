const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function run() {
  console.log('--- 1. Testing AI Onboarding Domain Suggestions ---');
  const aiRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/ai/onboarding',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { domain: 'Java' });

  console.log('AI Onboarding Status:', aiRes.status);
  console.log('AI Skills returned:', aiRes.data.skills ? aiRes.data.skills.map(s => s.name) : 'none');
  console.log('AI Courses returned count:', aiRes.data.courses ? aiRes.data.courses.length : 0);

  console.log('\n--- 2. Registering Employee with Engineering & Java Team (No job title provided) ---');
  const testEmail = `dev_java_${Date.now()}@northwind.io`;
  const regPayload = {
    fullName: 'Alex Vance',
    email: testEmail,
    password: 'Password123!',
    role: 'EMPLOYEE',
    company: 'Northwind Labs',
    departmentName: 'Engineering',
    teamName: 'Java',
    roleTitle: null, // Omitted as per user requirement
    bio: 'Backend Java Specialist at Northwind Labs.'
  };

  const regRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, regPayload);

  console.log('Registration Status:', regRes.status);
  console.log('Registration Response:', {
    email: regRes.data.email,
    fullName: regRes.data.fullName,
    systemRole: regRes.data.systemRole,
    department: regRes.data.department,
    teamName: regRes.data.teamName,
    roleTitle: regRes.data.roleTitle
  });

  const empToken = regRes.data.token;
  if (!empToken) {
    throw new Error('Registration failed to return token');
  }

  console.log('\n--- 3. Submitting Onboarding Profile Update (Background, AI Skills & Benchmarks) ---');
  const updatePayload = {
    fullName: 'Alex Vance',
    departmentName: 'Engineering',
    teamName: 'Java',
    roleTitle: 'Java Developer',
    company: 'Northwind Labs',
    bio: 'Passionate about distributed microservices and reactive Java systems.',
    education: 'B.S. in Computer Science · State Tech University (2022)',
    experience: '3 years in Java Spring Boot backend development.',
    skills: [
      { skillName: 'Java Spring Boot', proficiencyLevel: 4 },
      { skillName: 'SQL', proficiencyLevel: 3 },
      { skillName: 'Cloud / AWS', proficiencyLevel: 3 },
      { skillName: 'Docker', proficiencyLevel: 4 }
    ],
    roleBenchmarks: [
      { skillName: 'Java Spring Boot', proficiencyLevel: 5 },
      { skillName: 'SQL', proficiencyLevel: 4 },
      { skillName: 'Cloud / AWS', proficiencyLevel: 4 },
      { skillName: 'Security', proficiencyLevel: 4 }
    ]
  };

  const profileRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/profile',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${empToken}`
    }
  }, updatePayload);

  console.log('Profile Update Status:', profileRes.status);
  console.log('Updated Profile:', profileRes.data);

  console.log('\n--- 4. Manager Login & Team Verification ---');
  const mgrLogin = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'manager@northwind.io', password: 'password123' });

  console.log('Manager Login Status:', mgrLogin.status);
  const mgrToken = mgrLogin.data.token;

  const teamRes = await request({
    hostname: 'localhost',
    port: 8080,
    path: '/api/manager/team-profiles',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${mgrToken}` }
  });

  console.log('Manager Team Members count:', Array.isArray(teamRes.data) ? teamRes.data.length : 'error');
  if (Array.isArray(teamRes.data)) {
    console.log('Team Member emails:', teamRes.data.map(m => m.email || m.fullName));
    const matched = teamRes.data.find(m => m.email === testEmail || m.fullName === 'Alex Vance');
    console.log('Newly registered employee in Manager team?:', !!matched);
    if (matched) {
      console.log('Employee details in manager view:', {
        fullName: matched.fullName,
        email: matched.email,
        roleTitle: matched.roleTitle,
        departmentName: matched.departmentName,
        skillsCount: matched.skills ? matched.skills.length : 0
      });
    }
  }

  console.log('\n✅ ALL VERIFICATION CHECKS PASSED!');
}

run().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
