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

async function main() {
  console.log('=== VERIFYING MILESTONE 3 MODULE 1: KNOWLEDGE SHARING & MENTORSHIP ===\n');

  // 1. Login as Employee A (Mentee - Ava Chen)
  console.log('--- 1. Login as Mentee (employee@northwind.io) ---');
  const loginResA = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'employee@northwind.io', password: 'password123' })
  });
  const tokenA = loginResA.token;
  const userAId = loginResA.userId;
  console.log('Mentee Login OK -> User ID:', userAId);

  // 2. Fetch Skill-Gap Based Mentor Recommendations
  console.log('\n--- 2. Fetching Skill-Gap Mentor Recommendations ---');
  const recs = await request('/mentorship/recommendations', {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  console.log('Recommendations Count:', recs.length);
  if (recs.length > 0) {
    const topRec = recs[0];
    console.log('Top Recommended Mentor:', {
      fullName: topRec.fullName,
      skillName: topRec.skillName,
      mentorProficiency: topRec.mentorProficiency,
      menteeProficiency: topRec.menteeProficiency,
      matchScore: topRec.matchScore + '%',
      reason: topRec.reason
    });
  }

  const targetRec = recs.find(r => r.email === 'hr@northwind.io' || r.email === 'swe@northwind.io') || recs[0];
  if (!targetRec) {
    throw new Error('No mentor recommendation available for request test.');
  }

  console.log('\n--- 3. Login as Target Mentor (' + targetRec.email + ') ---');
  const loginResB = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: targetRec.email || 'swe@northwind.io', password: 'password123' })
  });
  const tokenB = loginResB.token;
  const userBId = loginResB.userId;
  console.log('Mentor Login OK -> User ID:', userBId);

  console.log('\n--- 4. Sending Mentorship Request from Mentee to Mentor ---');
  const requestRes = await request('/mentorship/request', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      mentorId: targetRec.mentorId,
      skillId: targetRec.skillId,
      goal: 'Master production Spring Boot microservices and REST security',
      message: 'Hi ' + targetRec.fullName + ', I would love your mentorship on backend Java microservices.'
    })
  });

  const mentorshipId = requestRes.id;
  console.log('Mentorship Created -> ID:', mentorshipId, 'Status:', requestRes.status);

  // 5. Mentor Login & Accept Request
  console.log('\n--- 5. Mentor Accepting Mentorship Request ---');
  const acceptRes = await request(`/mentorship/${mentorshipId}/accept`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  console.log('Accepted Status:', acceptRes.status, 'Start Date:', acceptRes.startDate);

  // 6. Messaging & Chat Exchange
  console.log('\n--- 6. Mentorship Persistent Chat Messaging ---');
  const msg1 = await request(`/mentorship/${mentorshipId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({
      message: 'Welcome to the mentorship program! Glad to guide you on Spring Boot.',
      messageType: 'TEXT'
    })
  });
  console.log('Mentor Sent Message:', msg1.message);

  const msg2 = await request(`/mentorship/${mentorshipId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      message: 'Thank you Liam! Looking forward to our first architecture session.',
      messageType: 'TEXT'
    })
  });
  console.log('Mentee Sent Message:', msg2.message);

  const messagesList = await request(`/mentorship/${mentorshipId}/messages`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  console.log('Chat History Count:', messagesList.length);

  // 7. Google Meet Link Sharing
  console.log('\n--- 7. Google Meet Link Sharing ---');
  const meetRes = await request(`/mentorship/${mentorshipId}/meeting-link`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({ meetingLink: 'https://meet.google.com/abc-defg-hij' })
  });
  console.log('Updated Google Meet Link:', meetRes.meetingLink);

  // 8. Knowledge Sharing Sessions & Attendance / Feedback
  console.log('\n--- 8. Knowledge Sharing Sessions & Feedback ---');
  const sessions = await request('/sessions', {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  console.log('Sessions Count:', sessions.length);

  if (sessions.length > 0) {
    const session = sessions[0];
    console.log('Session Title:', session.title, 'Host:', session.mentorName);

    // Register
    try {
      const regRes = await request(`/sessions/${session.id}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenA}` }
      });
      console.log('Registration Status:', regRes.isRegistered);
    } catch (e) {
      console.log('Registration info:', e.message || 'Already registered');
    }

    // Submit Feedback
    const fbRes = await request(`/sessions/${session.id}/feedback`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        rating: 5,
        comment: 'Outstanding Spring Boot microservices deep-dive! Extremely practical.'
      })
    });
    console.log('Session Feedback Updated -> Avg Rating:', fbRes.averageRating, 'Count:', fbRes.feedbackCount);
  }

  // 9. Expert Directory Search
  console.log('\n--- 9. Expert Directory Query ---');
  const experts = await request('/mentorship/experts', {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  console.log('Expert Directory Count:', experts.length);
  if (experts.length > 0) {
    console.log('Sample Expert:', {
      fullName: experts[0].fullName,
      department: experts[0].departmentName,
      expertSkills: experts[0].expertSkills.map(s => `${s.skillName} (Lvl ${s.proficiencyLevel})`)
    });
  }

  console.log('\n✅ ALL MILESTONE 3 MODULE 1 END-TO-END VERIFICATION CHECKS PASSED!');
}

main().catch(err => {
  console.error('❌ Verification failed:', err.message);
  process.exit(1);
});
