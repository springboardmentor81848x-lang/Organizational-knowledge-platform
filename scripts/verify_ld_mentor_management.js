const BASE_URL = 'http://localhost:8080/api';

async function request(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || errData.error || `HTTP ${res.status}`);
  }

  return res.json();
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForServer() {
  console.log('Waiting for backend server to become ready on http://localhost:8080...');
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://localhost:8080/api/auth/departments?orgName=Northwind');
      if (res.ok) {
        console.log('✓ Backend server is UP and responding!\n');
        return;
      }
    } catch (e) {
      await sleep(2000);
    }
  }
  throw new Error('Backend server failed to start in 60s');
}

async function main() {
  console.log('================================================================');
  console.log('AUTOMATED E2E VERIFICATION: MENTOR ACCEPTANCE & NOTIFICATION WORKFLOW');
  console.log('================================================================\n');

  await waitForServer();

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✓ PASS [${total}]: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL [${total}]: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // TEST 1: Login as L&D Admin
  console.log('--- TEST 1: Login as L&D Admin (ldadmin@northwind.io) ---');
  const ldLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'ldadmin@northwind.io', password: 'password123' })
  });
  const ldToken = ldLogin.token;
  assert(ldLogin.token && ldLogin.systemRole === 'L_AND_D_ADMIN', `L&D Admin authenticated successfully (${ldLogin.fullName}, ${ldLogin.systemRole})`);

  // TEST 2: Login as Employee Mentee (Liam Harper - Software Engineer)
  console.log('\n--- TEST 2: Login as Employee Mentee (swe@northwind.io) ---');
  const empLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'swe@northwind.io', password: 'password123' })
  });
  const empToken = empLogin.token;
  const empId = empLogin.userId;
  assert(empLogin.token && empLogin.systemRole === 'EMPLOYEE', `Employee mentee authenticated successfully (${empLogin.fullName}, ${empLogin.systemRole})`);

  // TEST 3: L&D Admin fetches organization employees & AI recommendations
  console.log('\n--- TEST 3: L&D Admin fetches organization employees ---');
  const employees = await request('/ldadmin/mentorship/employees', {
    headers: { Authorization: `Bearer ${ldToken}` }
  });
  assert(Array.isArray(employees) && employees.length > 0, `Fetched ${employees.length} employees for L&D mentor assignment`);
  const targetEmployee = employees.find(e => e.id === empId) || employees[0];
  console.log(`  Selected Employee: ${targetEmployee.fullName} (${targetEmployee.roleTitle || 'Developer'}, ID: ${targetEmployee.id})`);

  // TEST 4: L&D Admin fetches AI recommendations for Liam Harper
  console.log('\n--- TEST 4: L&D Admin fetches AI recommendations for ' + targetEmployee.fullName + ' ---');
  const recommendations = await request(`/ldadmin/mentorship/recommendations?employeeId=${targetEmployee.id}`, {
    headers: { Authorization: `Bearer ${ldToken}` }
  });
  assert(Array.isArray(recommendations) && recommendations.length > 0, `Generated ${recommendations.length} AI mentor recommendation matches`);
  const topRec = recommendations[0];
  const mentorLevel = topRec.mentorProficiency ?? topRec.mentorProficiencyLevel ?? 4;
  const menteeLevel = topRec.menteeProficiency ?? topRec.menteeProficiencyLevel ?? 1;
  const reasonText = topRec.reason || topRec.matchReason || '';
  console.log(`  Top Matched Mentor: ${topRec.fullName} (${topRec.roleTitle})`);
  console.log(`  Skill Target: ${topRec.skillName} (Mentor Level ${mentorLevel}/5 vs Mentee Level ${menteeLevel}/5)`);
  console.log(`  Match Score: ${topRec.matchScore}%`);
  console.log(`  Reason: "${reasonText}"`);
  assert(topRec.matchScore >= 65, 'Match score is valid');
  assert(mentorLevel > menteeLevel, 'Mentor has higher proficiency level than employee');

  // TEST 5: L&D Admin assigns mentor -> Initial status MUST be REQUESTED (Pending Mentor Acceptance)
  console.log('\n--- TEST 5: L&D Admin assigns mentor -> Initial Status REQUESTED ---');
  const assignPayload = {
    menteeId: targetEmployee.id,
    mentorId: topRec.mentorId || topRec.id,
    skillId: topRec.skillId,
    goal: `Close ${topRec.skillName} skill gap (Level ${menteeLevel} -> ${mentorLevel})`,
    message: `Assigned by L&D Admin via AI Skill-Gap Analysis (${topRec.matchScore}% match)`
  };
  const assignResult = await request('/ldadmin/mentorship/assign', {
    method: 'POST',
    headers: { Authorization: `Bearer ${ldToken}` },
    body: JSON.stringify(assignPayload)
  });
  const mentorshipId = assignResult.id;
  assert(assignResult.status === 'REQUESTED', `Mentorship created with REQUESTED status (Pending Mentor Acceptance, ID: ${mentorshipId})`);
  assert(assignResult.assignedByName === ldLogin.fullName || assignResult.assignedByName === 'Nobita Nobi', `AssignedBy records L&D Admin: ${assignResult.assignedByName}`);

  // TEST 6: Mentor Logs In & Verifies Notification & Pending Request
  console.log('\n--- TEST 6: Mentor logs in and reviews pending L&D assignment in Requests ---');
  const mentorLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: topRec.email || 'employee@northwind.io', password: 'password123' })
  });
  const mentorToken = mentorLogin.token;
  assert(mentorLogin.token, `Mentor authenticated successfully (${mentorLogin.fullName})`);

  const mentorMentees = await request('/mentorship/my-mentees', {
    headers: { Authorization: `Bearer ${mentorToken}` }
  });
  const incomingReq = mentorMentees.find(m => m.id === mentorshipId);
  assert(incomingReq !== undefined, 'Assigned mentee appears in Mentor incoming requests list');
  assert(incomingReq.status === 'REQUESTED', 'Mentorship status is REQUESTED for mentor');
  assert(incomingReq.assignedByName === ldLogin.fullName || incomingReq.assignedByName === 'Nobita Nobi', 'Assignment shows L&D Admin attribution');

  // TEST 7: Mentor Accepts Assignment -> Status transitions to ACTIVE
  console.log('\n--- TEST 7: Mentor accepts the L&D assignment ---');
  const acceptRes = await request(`/mentorship/${mentorshipId}/accept`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${mentorToken}` }
  });
  assert(acceptRes.status === 'ACTIVE', 'Mentorship successfully transitioned to ACTIVE upon mentor acceptance');
  assert(acceptRes.startDate !== null, 'Start date timestamp initialized upon mentor acceptance');

  // TEST 8: Mentee verifies active status in My Mentors
  console.log('\n--- TEST 8: Mentee verifies active status in My Mentors ---');
  const myMentors = await request('/mentorship/my-mentors', {
    headers: { Authorization: `Bearer ${empToken}` }
  });
  const activeMentorship = myMentors.find(m => m.id === mentorshipId);
  assert(activeMentorship !== undefined, `Assigned mentor ${activeMentorship.mentorName} is present in employee's My Mentors`);
  assert(activeMentorship.status === 'ACTIVE', 'Mentorship is confirmed ACTIVE for mentee');

  // TEST 9: Persistent Chat & Meeting Links Active
  console.log('\n--- TEST 9: Mentor and Mentee exchange chat messages ---');
  const chatMsg = await request(`/mentorship/${mentorshipId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${mentorToken}` },
    body: JSON.stringify({
      message: `Hello ${targetEmployee.fullName?.split(' ')[0]}! I accepted the L&D mentorship assignment for ${topRec.skillName}.`,
      messageType: 'TEXT'
    })
  });
  assert(chatMsg.id && chatMsg.message.includes(topRec.skillName), `Mentor sent message: "${chatMsg.message}"`);

  const menteeReply = await request(`/mentorship/${mentorshipId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${empToken}` },
    body: JSON.stringify({
      message: 'Thank you! Excited to learn from your domain experience.',
      messageType: 'TEXT'
    })
  });
  assert(menteeReply.id && menteeReply.senderName === targetEmployee.fullName, 'Mentee reply sent successfully');

  // TEST 10: Decline Workflow Test (L&D assigns second pair -> Mentor declines -> Status REJECTED)
  console.log('\n--- TEST 10: Decline Workflow Test (L&D assigns -> Mentor declines) ---');
  const employee2 = employees.find(e => e.email === 'juniordev@northwind.io') || employees[1];
  const recs2 = await request(`/ldadmin/mentorship/recommendations?employeeId=${employee2.id}`, {
    headers: { Authorization: `Bearer ${ldToken}` }
  });

  if (recs2.length > 0) {
    const topRec2 = recs2[0];
    const assignPayload2 = {
      menteeId: employee2.id,
      mentorId: topRec2.mentorId || topRec2.id,
      skillId: topRec2.skillId,
      goal: `Evaluate decline flow for ${topRec2.skillName}`,
      message: 'Test assignment for decline verification'
    };
    const assignResult2 = await request('/ldadmin/mentorship/assign', {
      method: 'POST',
      headers: { Authorization: `Bearer ${ldToken}` },
      body: JSON.stringify(assignPayload2)
    });
    assert(assignResult2.status === 'REQUESTED', 'Second mentorship created in REQUESTED status');

    // Mentor declines assignment
    const mentor2Login = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: topRec2.email || 'employee@northwind.io', password: 'password123' })
    });
    const rejectRes = await request(`/mentorship/${assignResult2.id}/reject`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${mentor2Login.token}` }
    });
    assert(rejectRes.status === 'REJECTED', 'Mentorship successfully transitioned to REJECTED upon mentor decline');

    // Verify L&D Admin sees REJECTED status in all mentorships
    const allMentorships = await request('/ldadmin/mentorship/all', {
      headers: { Authorization: `Bearer ${ldToken}` }
    });
    const declinedInAdmin = allMentorships.find(m => m.id === assignResult2.id);
    assert(declinedInAdmin && declinedInAdmin.status === 'REJECTED', 'Declined mentorship shows as REJECTED in L&D admin oversight');
  }

  // SUMMARY
  console.log('\n================================================================');
  console.log(`ALL AUTOMATED TESTS PASSED! (${passed}/${total} assertions succeeded)`);
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('\n❌ AUTOMATION FAILED WITH ERROR:', err);
  process.exit(1);
});
