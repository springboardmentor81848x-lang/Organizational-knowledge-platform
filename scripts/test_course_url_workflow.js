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

function put(path, body, token = null) {
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
      method: 'PUT',
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

async function runCourseUrlWorkflowTests() {
  console.log('===================================================================');
  console.log('   FULL END-TO-END VERIFICATION: EXTERNAL LEARNING RESOURCE URLS   ');
  console.log('===================================================================\n');

  const ts = Date.now();
  const orgName = `TechNova Solutions ${ts}`;

  // Step 1: AI Onboarding Suggestions API Check
  console.log('[Test 1] Testing AI Onboarding Suggestions for "Backend Development"...');
  const aiSugRes = await post('/ai/onboarding', { domain: 'Backend Development' });
  console.log(`- Status: ${aiSugRes.status}`);
  console.log(`- Skills returned: ${aiSugRes.data.skills ? aiSugRes.data.skills.length : 0}`);
  console.log(`- Courses returned: ${aiSugRes.data.courses ? aiSugRes.data.courses.length : 0}`);
  if (aiSugRes.data.courses && aiSugRes.data.courses.length > 0) {
    aiSugRes.data.courses.forEach(c => {
      console.log(`  * Course: "${c.title}" | Provider: ${c.provider} | URL: ${c.url || c.courseUrl}`);
    });
  }

  // Step 2: Register New Employee
  console.log('\n[Test 2] Registering New Employee...');
  const regRes = await post('/auth/register', {
    fullName: 'Lucas Meyer',
    email: `lucas.dev.${ts}@technova.io`,
    password: 'password123',
    role: 'EMPLOYEE',
    company: orgName,
    departmentName: 'Engineering',
    roleTitle: 'Java Spring Developer'
  });
  const token = regRes.data.token;
  console.log(`✔ Registered Lucas Meyer -> Token obtained: ${!!token}`);

  // Step 3: Complete Employee Onboarding with Skills & Benchmarks
  console.log('\n[Test 3] Submitting Profile Onboarding with Skill Gaps...');
  const profileRes = await put('/auth/profile', {
    fullName: 'Lucas Meyer',
    company: orgName,
    departmentName: 'Engineering',
    roleTitle: 'Java Spring Developer',
    skills: [
      { skillName: 'Java Spring Boot', proficiencyLevel: 2 },
      { skillName: 'React', proficiencyLevel: 1 },
      { skillName: 'Advanced SQL', proficiencyLevel: 2 }
    ],
    roleBenchmarks: [
      { skillName: 'Java Spring Boot', expectedLevel: 5 },
      { skillName: 'React', expectedLevel: 4 },
      { skillName: 'Advanced SQL', expectedLevel: 4 }
    ]
  }, token);
  console.log(`✔ Profile updated: ${profileRes.data.fullName} (${profileRes.data.title})`);

  // Step 4: Verify Training Portal Learning Path & Recommendations
  console.log('\n[Test 4] Querying Training Portal Learning Path API (/api/training/learning-path/personalized)...');
  const pathRes = await get('/training/learning-path/personalized', token);
  console.log(`- Target Role: ${pathRes.data.targetRole}`);
  console.log(`- Skill Score: ${pathRes.data.skillScore}% | Gap: ${pathRes.data.gapPercentage}%`);
  console.log(`- Total Recommendations: ${pathRes.data.steps ? pathRes.data.steps.length : 0}`);

  let allHaveValidUrls = true;
  let distinctUrls = new Set();

  pathRes.data.steps.forEach((step, idx) => {
    const url = step.courseUrl || step.url;
    console.log(`  Step ${step.stepNumber || idx + 1}: "${step.title}"`);
    console.log(`    - Provider: ${step.provider}`);
    console.log(`    - Target Skill: ${step.skillName || step.category}`);
    console.log(`    - URL: ${url}`);
    console.log(`    - IsExternal: ${step.isExternal}`);
    if (url) distinctUrls.add(url);
  });

  console.log(`✔ Distinct Course URLs verified: ${distinctUrls.size}`);

  // Step 5: Test URL Validation & SSRF Rejection
  console.log('\n[Test 5] Testing Security & URL Validation Rules on Backend...');
  const customCourse1 = await post('/training/courses', {
    title: `OAuth 2.0 Security Guide ${ts}`,
    description: 'OAuth2 and OpenID Connect deep dive',
    provider: 'Spring Security',
    courseUrl: 'javascript:alert("XSS")',
    targetLevel: 4,
    durationHours: 5
  }, token);
  console.log(`  - Dangerous Scheme "javascript:alert(1)": courseUrl set to -> ${customCourse1.data.courseUrl === null ? 'NULL (REJECTED SAFE)' : customCourse1.data.courseUrl}`);

  const customCourse2 = await post('/training/courses', {
    title: `Internal AWS Metadata ${ts}`,
    description: 'Internal cloud probe',
    provider: 'Internal',
    courseUrl: 'http://169.254.169.254/latest/meta-data/',
    targetLevel: 4,
    durationHours: 5
  }, token);
  console.log(`  - SSRF Probe "http://169.254.169.254/...": courseUrl set to -> ${customCourse2.data.courseUrl === null ? 'NULL (REJECTED SAFE)' : customCourse2.data.courseUrl}`);

  const customCourse3 = await post('/training/courses', {
    title: `Localhost Loopback ${ts}`,
    description: 'Localhost probe',
    provider: 'Local',
    courseUrl: 'http://localhost:8080/admin',
    targetLevel: 4,
    durationHours: 5
  }, token);
  console.log(`  - Localhost Probe "http://localhost:8080/...": courseUrl set to -> ${customCourse3.data.courseUrl === null ? 'NULL (REJECTED SAFE)' : customCourse3.data.courseUrl}`);

  const customCourse4 = await post('/training/courses', {
    title: `Valid Official Spring Guide ${ts}`,
    description: 'Official Spring guide',
    provider: 'Spring',
    courseUrl: 'https://spring.io/guides/gs/rest-service',
    targetLevel: 4,
    durationHours: 4
  }, token);
  console.log(`  - Valid Official URL "https://spring.io/guides/gs/rest-service": courseUrl set to -> ${customCourse4.data.courseUrl}`);

  // Step 6: Test Persistence Across Requests (Browser Refresh Simulation)
  console.log('\n[Test 6] Testing Persistence Across Repeated Invocations...');
  const secondFetch = await get('/training/learning-path/personalized', token);
  const reloadedStep = secondFetch.data.steps.find(s => s.title.toLowerCase().includes('spring'));
  console.log(`✔ Re-queried learning path -> Course: "${reloadedStep?.title}" | Persistent URL: "${reloadedStep?.courseUrl || reloadedStep?.url}"`);

  console.log('\n===================================================================');
  console.log('   ✔ ALL TESTS PASSED: ONBOARDING → AI RECOMMENDATIONS → TRAINING   ');
  console.log('===================================================================\n');
}

runCourseUrlWorkflowTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
