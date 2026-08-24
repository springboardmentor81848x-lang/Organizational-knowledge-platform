const BASE_URL = 'http://localhost:8080/api';

async function waitBackendReady(maxTries = 30) {
  for (let i = 0; i < maxTries; i++) {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'wrong' })
      });
      if (res.status === 400 || res.status === 401 || res.status === 200) {
        console.log('✓ Backend server is UP and responding!\n');
        return true;
      }
    } catch (e) {
      // not ready yet
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error('Backend failed to become ready in time.');
}

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, body: data };
}

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ PASS [${total}]: ${message}`);
  } else {
    console.error(`  ✗ FAIL [${total}]: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function run() {
  console.log('================================================================');
  console.log('AUTOMATED E2E VERIFICATION: EMPLOYEE CERTIFICATION -> L&D VALIDATION WORKFLOW');
  console.log('================================================================\n');

  console.log('Waiting for backend server to become ready on http://localhost:8080...');
  await waitBackendReady();

  // 1. Login as Employee
  console.log('--- TEST 1: Login as Employee Mentee (swe@northwind.io) ---');
  const empLogin = await request('POST', '/auth/login', {
    email: 'swe@northwind.io',
    password: 'password123'
  });
  assert(empLogin.status === 200 && empLogin.body.token, 'Employee authenticated successfully (' + empLogin.body.fullName + ')');
  const empToken = empLogin.body.token;
  const empId = empLogin.body.id;

  // 2. Login as L&D Admin
  console.log('\n--- TEST 2: Login as L&D Admin (ldadmin@northwind.io) ---');
  const ldLogin = await request('POST', '/auth/login', {
    email: 'ldadmin@northwind.io',
    password: 'password123'
  });
  assert(ldLogin.status === 200 && ldLogin.body.token, 'L&D Admin authenticated successfully (' + ldLogin.body.fullName + ')');
  const ldToken = ldLogin.body.token;

  // 3. Employee adds a new certification for "Cloud / AWS"
  console.log('\n--- TEST 3: Employee submits a new professional certification ---');
  // Get skills to link
  const prof = await request('GET', '/employee/profile', null, empToken);
  const awsSkill = prof.body.skills ? prof.body.skills.find(s => s.skill.toLowerCase().includes('cloud') || s.skill.toLowerCase().includes('aws')) : null;
  const skillId = awsSkill ? awsSkill.id : null;

  const certData = {
    name: 'AWS Certified Solutions Architect - Professional',
    issuingOrganization: 'Amazon Web Services (AWS)',
    issueDate: '2026-03-01',
    expirationDate: '2029-03-01',
    credentialId: 'AWS-PSA-998822',
    credentialUrl: 'https://aws.amazon.com/verification/AWS-PSA-998822',
    skillId: skillId
  };

  const createCertRes = await request('POST', '/employee/certifications', certData, empToken);
  assert(createCertRes.status === 200, 'Certification submitted successfully by employee');
  const certId = createCertRes.body.id;
  assert(certId != null, 'Created certification has valid UUID');
  assert(createCertRes.body.status === 'PENDING_VERIFICATION', 'Initial certification status is PENDING_VERIFICATION');

  // 4. Employee views their certifications list
  console.log('\n--- TEST 4: Employee verifies certification is listed with Pending status ---');
  const empCerts = await request('GET', '/employee/certifications', null, empToken);
  assert(Array.isArray(empCerts.body), 'Certifications list returned as array');
  const myCert = empCerts.body.find(c => c.id === certId);
  assert(myCert != null, 'Newly added certification is present in employee profile');
  assert(myCert.status === 'PENDING_VERIFICATION', 'Employee cert status shows PENDING_VERIFICATION');

  // 5. L&D Admin views Credential Verification queue
  console.log('\n--- TEST 5: L&D Admin reviews Credential Verification Queue (/api/ldadmin/certifications) ---');
  const ldCerts = await request('GET', '/ldadmin/certifications', null, ldToken);
  assert(Array.isArray(ldCerts.body), 'L&D Certifications queue returned as array');
  const queueItem = ldCerts.body.find(c => c.id === certId);
  assert(queueItem != null, 'Employee submission is present in L&D verification queue');
  assert(queueItem.employeeName === empLogin.body.fullName, `Queue item correctly attributes employee: ${queueItem.employeeName}`);
  assert(queueItem.status === 'PENDING_VERIFICATION', 'Queue item status is PENDING_VERIFICATION');
  assert(queueItem.credentialId === 'AWS-PSA-998822', 'Credential ID matches submitted payload');

  // 6. L&D Admin verifies the certification
  console.log('\n--- TEST 6: L&D Admin verifies certification and triggers skill elevation ---');
  const verifyRes = await request('POST', `/ldadmin/certifications/${certId}/verify`, null, ldToken);
  assert(verifyRes.status === 200, 'Verification request completed successfully: ' + verifyRes.body.message);

  // 7. Verify status transitioned to VERIFIED for both L&D Admin and Employee
  console.log('\n--- TEST 7: Verify status is updated to VERIFIED across both portals ---');
  const empCertsAfter = await request('GET', '/employee/certifications', null, empToken);
  const myCertAfter = empCertsAfter.body.find(c => c.id === certId);
  assert(myCertAfter.status === 'VERIFIED', 'Employee portal confirms status is now VERIFIED');
  assert(myCertAfter.assessmentStatus === 'Completed', 'Employee portal confirms assessment status is Completed');

  const ldCertsAfter = await request('GET', '/ldadmin/certifications', null, ldToken);
  const queueItemAfter = ldCertsAfter.body.find(c => c.id === certId);
  assert(queueItemAfter.status === 'VERIFIED', 'L&D Admin portal confirms status is VERIFIED');

  // 8. Test Decline Workflow
  console.log('\n--- TEST 8: Test Decline / Reject Workflow for invalid submissions ---');
  const rejectCertData = {
    name: 'Expired Legacy Certificate',
    issuingOrganization: 'Legacy Provider',
    issueDate: '2018-01-01',
    expirationDate: '2020-01-01',
    credentialId: 'LEGACY-001',
    credentialUrl: 'https://example.com/expired'
  };
  const rejectCertRes = await request('POST', '/employee/certifications', rejectCertData, empToken);
  const rejectCertId = rejectCertRes.body.id;
  assert(rejectCertId != null, 'Second test certification submitted');

  const rejectRes = await request('POST', `/ldadmin/certifications/${rejectCertId}/reject`, null, ldToken);
  assert(rejectRes.status === 200, 'Rejection endpoint returned success: ' + rejectRes.body.message);

  const empCertsAfterReject = await request('GET', '/employee/certifications', null, empToken);
  const myRejectCert = empCertsAfterReject.body.find(c => c.id === rejectCertId);
  assert(myRejectCert.status === 'REJECTED', 'Employee portal confirms certification status is REJECTED');

  const ldCertsAfterReject = await request('GET', '/ldadmin/certifications', null, ldToken);
  const queueRejectItem = ldCertsAfterReject.body.find(c => c.id === rejectCertId);
  assert(queueRejectItem.status === 'REJECTED', 'L&D Admin portal confirms certification status is REJECTED');

  // 9. L&D Dashboard metrics
  console.log('\n--- TEST 9: L&D Dashboard metrics consistency ---');
  const ldDash = await request('GET', '/ldadmin/dashboard', null, ldToken);
  assert(ldDash.status === 200, 'L&D Dashboard metrics loaded successfully');
  console.log(`  Summary: Pending Certs in Queue: ${ldDash.body.pendingCertifications}, Total Courses: ${ldDash.body.totalCourses}`);

  console.log('\n================================================================');
  console.log(`ALL AUTOMATED TESTS PASSED! (${passed}/${total} assertions succeeded)`);
  console.log('================================================================\n');
}

run().catch(err => {
  console.error('\n❌ Test execution failed:', err.message);
  process.exit(1);
});
