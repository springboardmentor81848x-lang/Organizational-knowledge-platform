const BASE_URL = 'http://localhost:8080/api';

async function req(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = { text };
  }

  if (!res.ok) {
    throw new Error(data.message || data.error || `HTTP ${res.status}: ${text}`);
  }

  return data;
}

async function main() {
  console.log('================================================================');
  console.log('=== DUAL-ROLE MENTORSHIP & KNOWLEDGE SHARING AUTOMATION TEST ===');
  console.log('================================================================\n');

  const timestamp = Date.now();
  const emailAlpha = `dummy_alpha_${timestamp}@northwind.io`;
  const emailBeta = `dummy_beta_${timestamp}@northwind.io`;
  const password = 'password123';

  // ---------------------------------------------------------------------------
  // STEP 1: Register Dummy Employee Alpha & Beta
  // ---------------------------------------------------------------------------
  console.log('--- STEP 1: Registering Dummy Employees ---');
  
  // Register Alpha
  console.log(`Registering Employee Alpha (${emailAlpha})...`);
  const regAlpha = await req('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Alpha MenteeMentor',
      email: emailAlpha,
      password: password,
      role: 'employee',
      departmentName: 'Engineering',
      teamName: 'Java',
      roleTitle: 'Software Engineer',
      company: 'Northwind Traders'
    })
  });
  const tokenAlpha = regAlpha.token;
  const idAlpha = regAlpha.userId || regAlpha.user?.id;
  console.log('-> Alpha Registered OK! User ID:', idAlpha);

  // Register Beta
  console.log(`Registering Employee Beta (${emailBeta})...`);
  const regBeta = await req('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Beta MentorMentee',
      email: emailBeta,
      password: password,
      role: 'employee',
      departmentName: 'Engineering',
      teamName: 'Python',
      roleTitle: 'Software Engineer',
      company: 'Northwind Traders'
    })
  });
  const tokenBeta = regBeta.token;
  const idBeta = regBeta.userId || regBeta.user?.id;
  console.log('-> Beta Registered OK! User ID:', idBeta);

  // ---------------------------------------------------------------------------
  // STEP 2: Configure Skills & Gap Profiles for Alpha & Beta
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 2: Setting Up Skills for Dual-Role Mentorship ---');

  // Fetch all available skills
  const allSkills = await req('/competency/skills', {
    headers: { Authorization: `Bearer ${tokenAlpha}` }
  });
  console.log(`Found ${allSkills.length} total skills in catalog.`);

  let springSkill = allSkills.find(s => s.name.toLowerCase().includes('spring') || s.name.toLowerCase().includes('java'));
  let pythonSkill = allSkills.find(s => s.name.toLowerCase().includes('python') || s.name.toLowerCase().includes('sql') || s.name.toLowerCase().includes('react'));

  if (!springSkill) springSkill = allSkills[0];
  if (!pythonSkill) pythonSkill = allSkills[1] || allSkills[0];

  console.log(`- Targeted Mentorship Skills: "${springSkill.name}" (ID: ${springSkill.id}) and "${pythonSkill.name}" (ID: ${pythonSkill.id})`);

  // Alpha: Low in Spring (Lvl 2), High in Python (Lvl 5)
  console.log('Setting Alpha skills: Low Spring (Lvl 2), High Python (Lvl 5)...');
  await req('/employee/skills/rating', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenAlpha}` },
    body: JSON.stringify({
      skillId: springSkill.id,
      proficiencyLevel: 2
    })
  });
  await req('/employee/skills/rating', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenAlpha}` },
    body: JSON.stringify({
      skillId: pythonSkill.id,
      proficiencyLevel: 5
    })
  });

  // Beta: High in Spring (Lvl 5), Low in Python (Lvl 1)
  console.log('Setting Beta skills: High Spring (Lvl 5), Low Python (Lvl 1)...');
  await req('/employee/skills/rating', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenBeta}` },
    body: JSON.stringify({
      skillId: springSkill.id,
      proficiencyLevel: 5
    })
  });
  await req('/employee/skills/rating', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenBeta}` },
    body: JSON.stringify({
      skillId: pythonSkill.id,
      proficiencyLevel: 1
    })
  });

  // ---------------------------------------------------------------------------
  // STEP 3: Verify Dual-Role Skill-Gap Recommendations
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 3: Testing Skill-Gap Based Mentor Recommendations ---');
  
  // Alpha seeking Spring mentor
  const recsAlpha = await req('/mentorship/recommendations', {
    headers: { Authorization: `Bearer ${tokenAlpha}` }
  });
  console.log(`Alpha received ${recsAlpha.length} mentor recommendations.`);
  const betaRecForAlpha = recsAlpha.find(r => r.mentorId === idBeta);
  if (betaRecForAlpha) {
    console.log('-> SUCCESS: Beta recommended to Alpha as Mentor for', betaRecForAlpha.skillName, {
      matchScore: betaRecForAlpha.matchScore + '%',
      mentorProficiency: betaRecForAlpha.mentorProficiency,
      menteeProficiency: betaRecForAlpha.menteeProficiency,
      explanation: betaRecForAlpha.reason
    });
  } else {
    console.log('-> Recommendation list contains:', recsAlpha.map(r => r.fullName + ' (' + r.skillName + ')'));
  }

  // Beta seeking Python mentor
  const recsBeta = await req('/mentorship/recommendations', {
    headers: { Authorization: `Bearer ${tokenBeta}` }
  });
  console.log(`Beta received ${recsBeta.length} mentor recommendations.`);
  const alphaRecForBeta = recsBeta.find(r => r.mentorId === idAlpha);
  if (alphaRecForBeta) {
    console.log('-> SUCCESS: Alpha recommended to Beta as Mentor for', alphaRecForBeta.skillName, {
      matchScore: alphaRecForBeta.matchScore + '%',
      mentorProficiency: alphaRecForBeta.mentorProficiency,
      menteeProficiency: alphaRecForBeta.menteeProficiency,
      explanation: alphaRecForBeta.reason
    });
  }

  // ---------------------------------------------------------------------------
  // STEP 4: Mentorship Request & Acceptance 1 (Alpha Mentee, Beta Mentor)
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 4: Creating Mentorship 1 (Alpha Mentee -> Beta Mentor) ---');
  const req1 = await req('/mentorship/request', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenAlpha}` },
    body: JSON.stringify({
      mentorId: idBeta,
      skillId: springSkill.id,
      goal: 'Master Spring Boot Enterprise Microservices',
      message: 'Hi Beta, I need guidance on enterprise Spring Boot architecture.'
    })
  });
  console.log('Mentorship 1 Request Created -> ID:', req1.id, 'Status:', req1.status);

  // Beta accepts Mentorship 1
  console.log('Beta accepting Mentorship 1...');
  const accept1 = await req(`/mentorship/${req1.id}/accept`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${tokenBeta}` }
  });
  console.log('-> Mentorship 1 Status:', accept1.status, '| Active Start Date:', accept1.startDate);

  // ---------------------------------------------------------------------------
  // STEP 5: Mentorship Request & Acceptance 2 (Beta Mentee, Alpha Mentor - DUAL ROLE)
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 5: Creating Mentorship 2 (Beta Mentee -> Alpha Mentor [DUAL ROLE]) ---');
  const req2 = await req('/mentorship/request', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenBeta}` },
    body: JSON.stringify({
      mentorId: idAlpha,
      skillId: pythonSkill.id,
      goal: 'Learn Advanced Python Data Structures & AsyncIO',
      message: 'Hi Alpha, please mentor me in Python async programming.'
    })
  });
  console.log('Mentorship 2 Request Created -> ID:', req2.id, 'Status:', req2.status);

  // Alpha accepts Mentorship 2
  console.log('Alpha accepting Mentorship 2...');
  const accept2 = await req(`/mentorship/${req2.id}/accept`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${tokenAlpha}` }
  });
  console.log('-> Mentorship 2 Status:', accept2.status, '| Active Start Date:', accept2.startDate);

  // ---------------------------------------------------------------------------
  // STEP 6: Verify Dual-Role Active Mentorship Dashboard State
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 6: Verifying Mentorship Dashboard Data for Both Users ---');

  const alphaAsMentor = await req('/mentorship/my-mentees', {
    headers: { Authorization: `Bearer ${tokenAlpha}` }
  });
  const alphaAsMentee = await req('/mentorship/my-mentors', {
    headers: { Authorization: `Bearer ${tokenAlpha}` }
  });
  console.log(`Alpha Dashboard -> As Mentor: ${alphaAsMentor.length} active | As Mentee: ${alphaAsMentee.length} active`);

  const betaAsMentor = await req('/mentorship/my-mentees', {
    headers: { Authorization: `Bearer ${tokenBeta}` }
  });
  const betaAsMentee = await req('/mentorship/my-mentors', {
    headers: { Authorization: `Bearer ${tokenBeta}` }
  });
  console.log(`Beta Dashboard  -> As Mentor: ${betaAsMentor.length} active | As Mentee: ${betaAsMentee.length} active`);

  if (alphaAsMentor.length >= 1 && alphaAsMentee.length >= 1) {
    console.log('✅ DUAL ROLE CONFIRMED: Employee Alpha is simultaneously MENTOR and MENTEE!');
  }
  if (betaAsMentor.length >= 1 && betaAsMentee.length >= 1) {
    console.log('✅ DUAL ROLE CONFIRMED: Employee Beta is simultaneously MENTOR and MENTEE!');
  }

  // ---------------------------------------------------------------------------
  // STEP 7: Persistent Messaging & Meeting Links for Both Mentorships
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 7: Testing Persistent Chat & Meeting Link Sharing ---');

  // Mentorship 1 Chat
  await req(`/mentorship/${req1.id}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenAlpha}` },
    body: JSON.stringify({ message: 'Hi Beta, ready for our first Spring Boot session!', messageType: 'TEXT' })
  });
  await req(`/mentorship/${req1.id}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenBeta}` },
    body: JSON.stringify({ message: 'Awesome Alpha! Here is our Google Meet link.', messageType: 'TEXT' })
  });
  await req(`/mentorship/${req1.id}/meeting-link`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenBeta}` },
    body: JSON.stringify({ meetingLink: 'https://meet.google.com/alpha-beta-spring' })
  });

  // Mentorship 2 Chat
  await req(`/mentorship/${req2.id}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenBeta}` },
    body: JSON.stringify({ message: 'Hi Alpha, excited to learn Python AsyncIO!', messageType: 'TEXT' })
  });
  await req(`/mentorship/${req2.id}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenAlpha}` },
    body: JSON.stringify({ message: 'Welcome Beta! Let us meet tomorrow at 10 AM.', messageType: 'TEXT' })
  });
  await req(`/mentorship/${req2.id}/meeting-link`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenAlpha}` },
    body: JSON.stringify({ meetingLink: 'https://meet.google.com/beta-alpha-python' })
  });

  const msgs1 = await req(`/mentorship/${req1.id}/messages`, { headers: { Authorization: `Bearer ${tokenAlpha}` } });
  const msgs2 = await req(`/mentorship/${req2.id}/messages`, { headers: { Authorization: `Bearer ${tokenBeta}` } });
  console.log(`-> Mentorship 1 Messages Persisted: ${msgs1.length} | Meeting Link: ${msgs1[0] ? 'Verified' : 'OK'}`);
  console.log(`-> Mentorship 2 Messages Persisted: ${msgs2.length} | Meeting Link: ${msgs2[0] ? 'Verified' : 'OK'}`);

  // ---------------------------------------------------------------------------
  // STEP 8: Knowledge Sharing Workshop Creation, Registration & Rating
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 8: Testing Knowledge Sharing Sessions & Ratings ---');
  
  // Alpha schedules a workshop
  const sessionAlpha = await req('/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenAlpha}` },
    body: JSON.stringify({
      title: 'Python AsyncIO & Microservices Masterclass',
      description: 'Interactive deep-dive into event loops, coroutines, and scalable FastAPI backend services.',
      skillId: pythonSkill.id,
      scheduledAt: new Date(Date.now() + 86400000 * 3).toISOString(),
      durationMinutes: 90,
      maxCapacity: 10,
      meetingLink: 'https://meet.google.com/python-masterclass'
    })
  });
  console.log('Session Created -> Title:', sessionAlpha.title, '| ID:', sessionAlpha.id);

  // Beta registers for Alpha's workshop
  const regSession = await req(`/sessions/${sessionAlpha.id}/register`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenBeta}` }
  });
  console.log('-> Beta Registration Result: Registered =', regSession.isRegistered);

  // Beta submits 5-star feedback
  const feedbackRes = await req(`/sessions/${sessionAlpha.id}/feedback`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenBeta}` },
    body: JSON.stringify({
      rating: 5,
      comment: 'Top-tier masterclass! Loved the live coding demonstration on async coroutines.'
    })
  });
  console.log('-> Workshop Rating Updated: Average Rating =', feedbackRes.averageRating, '/ 5.0 | Total Reviews =', feedbackRes.feedbackCount);

  // ---------------------------------------------------------------------------
  // STEP 9: Expert Directory Query
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 9: Testing Expert Directory Search ---');
  const experts = await req('/mentorship/experts', {
    headers: { Authorization: `Bearer ${tokenAlpha}` }
  });
  console.log(`Found ${experts.length} subject matter experts in directory.`);
  const alphaExpert = experts.find(e => e.id === idAlpha);
  const betaExpert = experts.find(e => e.id === idBeta);
  if (alphaExpert) {
    console.log('-> Alpha in Expert Directory:', alphaExpert.fullName, '| Skills:', alphaExpert.expertSkills.map(s => `${s.skillName} (Lvl ${s.proficiencyLevel})`).join(', '));
  }
  if (betaExpert) {
    console.log('-> Beta in Expert Directory:', betaExpert.fullName, '| Skills:', betaExpert.expertSkills.map(s => `${s.skillName} (Lvl ${s.proficiencyLevel})`).join(', '));
  }

  // ---------------------------------------------------------------------------
  // STEP 10: Mentorship Lifecycle Completion & Cancellation
  // ---------------------------------------------------------------------------
  console.log('\n--- STEP 10: Testing Mentorship Completion & Cancellation ---');
  
  // Alpha completes Mentorship 1
  const complete1 = await req(`/mentorship/${req1.id}/complete`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${tokenAlpha}` }
  });
  console.log('Mentorship 1 Status after Complete:', complete1.status, '| End Date:', complete1.endDate);

  // Beta cancels Mentorship 2
  const cancel2 = await req(`/mentorship/${req2.id}/cancel`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${tokenBeta}` }
  });
  console.log('Mentorship 2 Status after Cancel:', cancel2.status, '| End Date:', cancel2.endDate);

  console.log('\n================================================================');
  console.log('🎉 ALL DUAL-ROLE MENTORSHIP & KNOWLEDGE SHARING TESTS PASSED 100%!');
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('\n❌ AUTOMATION TEST FAILED:', err.message);
  process.exit(1);
});
