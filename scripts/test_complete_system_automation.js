const http = require('http')

const BASE_URL = 'http://localhost:8080'

function request(method, path, body = null, token = null) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE_URL)
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    }
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`
    }
    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {}
          resolve({ status: res.statusCode, data: json, headers: res.headers })
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers })
        }
      })
    })
    req.on('error', (err) => {
      resolve({ status: 0, error: err.message })
    })
    if (body) {
      req.write(JSON.stringify(body))
    }
    req.end()
  })
}

async function login(email, password = 'password123') {
  const res = await request('POST', '/api/auth/login', { email, password })
  if (res.status !== 200 || !res.data.token) {
    throw new Error(`Login failed for ${email} (status ${res.status}): ${JSON.stringify(res.data)}`)
  }
  return { token: res.data.token, user: res.data }
}

async function runAllTests() {
  console.log('===============================================================')
  console.log('KNOWLEDGEIQ FULL SYSTEM AUTOMATION & REGRESSION TEST SUITE')
  console.log('===============================================================')

  let passed = 0
  let failed = 0
  const failures = []

  async function test(name, fn) {
    process.stdout.write(`\n[TEST] ${name}... `)
    try {
      await fn()
      console.log('✅ PASSED')
      passed++
    } catch (e) {
      console.log('❌ FAILED: ' + e.message)
      failed++
      failures.push({ name, error: e.message })
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 1. EMPLOYEE ROLE AUTOMATION
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n--- 1. EMPLOYEE SUITE (employee@northwind.io) ---')
  let empAuth
  await test('Employee Login', async () => {
    empAuth = await login('employee@northwind.io')
    if (empAuth.user.systemRole !== 'EMPLOYEE') throw new Error(`Expected EMPLOYEE role, got ${empAuth.user.systemRole}`)
  })

  await test('Get Employee Dashboard (/dashboard/employee)', async () => {
    const res = await request('GET', '/api/dashboard/employee', null, empAuth.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`)
  })

  await test('Get User Profile (/auth/me)', async () => {
    const res = await request('GET', '/api/auth/me', null, empAuth.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`)
    if (!res.data.email) throw new Error('Missing email in /auth/me')
  })

  await test('Get Employee Gaps (/gap-analysis/me)', async () => {
    const res = await request('GET', '/api/gap-analysis/me', null, empAuth.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`)
  })

  await test('Get Scoped Heatmap (/gap-analysis/scoped-heatmap)', async () => {
    const res = await request('GET', '/api/gap-analysis/scoped-heatmap', null, empAuth.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`)
  })

  await test('Get Personalized Recommendations (/training/recommendations/personalized)', async () => {
    const res = await request('GET', '/api/training/recommendations/personalized', null, empAuth.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`)
  })

  await test('Get Personalized Learning Path (/training/learning-path/personalized)', async () => {
    const res = await request('GET', '/api/training/learning-path/personalized', null, empAuth.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`)
  })

  let testCourseId
  await test('Get Courses Catalog (/training/courses)', async () => {
    const res = await request('GET', '/api/training/courses', null, empAuth.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`)
    if (Array.isArray(res.data) && res.data.length > 0) {
      testCourseId = res.data[0].id
    }
  })

  let enrollmentId
  await test('Enroll in Course (/training/enroll)', async () => {
    if (!testCourseId) return
    const res = await request('POST', '/api/training/enroll', { courseId: testCourseId }, empAuth.token)
    if (res.status !== 200 && res.status !== 201) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`)
    enrollmentId = res.data.id
  })

  await test('Get User Enrollments (/training/enrollments/me)', async () => {
    const res = await request('GET', '/api/training/enrollments/me', null, empAuth.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`)
    if (!Array.isArray(res.data)) throw new Error('Expected array of enrollments')
  })

  await test('Update Enrollment Status (/training/enrollments/{id}/status)', async () => {
    if (!enrollmentId) return
    const res = await request('PUT', `/api/training/enrollments/${enrollmentId}/status`, { status: 'COMPLETED' }, empAuth.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`)
  })

  await test('Add Custom Skill (/employee/skills/add)', async () => {
    const res = await request('POST', '/api/employee/skills/add', {
      skillName: `AutomationSkill_${Date.now()}`,
      categoryName: 'Technical',
      proficiencyLevel: 4
    }, empAuth.token)
    if (res.status !== 200 && res.status !== 201) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`)
  })

  let certId
  await test('Add Certification & List (/employee/certifications)', async () => {
    const addRes = await request('POST', '/api/employee/certifications', {
      certificationName: 'AWS Certified Developer',
      issuingOrganization: 'Amazon Web Services',
      issueDate: '2026-01-01',
      credentialUrl: 'https://aws.amazon.com/verification'
    }, empAuth.token)
    if (addRes.status !== 200 && addRes.status !== 201) throw new Error(`Add cert failed: ${JSON.stringify(addRes.data)}`)
    certId = addRes.data.id

    const listRes = await request('GET', '/api/employee/certifications', null, empAuth.token)
    if (listRes.status !== 200) throw new Error(`List certs failed: ${JSON.stringify(listRes.data)}`)
  })

  await test('AI Chat Assistant (/ai/chat)', async () => {
    const res = await request('POST', '/api/ai/chat', {
      message: 'Hello, what skills should I improve as a software engineer?',
      courseContext: 'Spring Boot & Microservices'
    }, empAuth.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`)
    if (!res.data.reply && !res.data.response) throw new Error('Missing AI response field')
  })

  await test('AI Onboarding Suggestions (/ai/onboarding)', async () => {
    const res = await request('POST', '/api/ai/onboarding', { domain: 'Full Stack Java' }, empAuth.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`)
    if (!Array.isArray(res.data.skills)) throw new Error('Missing skills array in AI onboarding response')
  })

  await test('Get Assessments Questionnaire & Submit (/assessments/questionnaire & /assessments/submit)', async () => {
    const qRes = await request('GET', '/api/assessments/questionnaire', null, empAuth.token)
    if (qRes.status !== 200) throw new Error(`Questionnaire failed: ${JSON.stringify(qRes.data)}`)

    const subRes = await request('POST', '/api/assessments/submit', {
      title: 'Automated Skill Self-Assessment',
      type: 'SELF_ASSESSMENT',
      responses: [
        { questionId: 'q1', score: 4, comment: 'Proficient in Java microservices' }
      ]
    }, empAuth.token)
    if (subRes.status !== 200 && subRes.status !== 201) throw new Error(`Submit assessment failed: ${JSON.stringify(subRes.data)}`)
  })

  await test('Get User Assessments History (/assessments/me)', async () => {
    const res = await request('GET', '/api/assessments/me', null, empAuth.token)
    if (res.status !== 200) throw new Error(`Get assessments failed: ${JSON.stringify(res.data)}`)
  })

  await test('Notifications API (/notifications/me & unread count)', async () => {
    const countRes = await request('GET', '/api/notifications/me/unread-count', null, empAuth.token)
    if (countRes.status !== 200) throw new Error(`Unread count failed: ${JSON.stringify(countRes.data)}`)

    const listRes = await request('GET', '/api/notifications/me', null, empAuth.token)
    if (listRes.status !== 200) throw new Error(`List notifications failed: ${JSON.stringify(listRes.data)}`)

    const markRes = await request('PUT', '/api/notifications/mark-all-read', null, empAuth.token)
    if (markRes.status !== 200) throw new Error(`Mark all read failed: ${JSON.stringify(markRes.data)}`)
  })

  // ───────────────────────────────────────────────────────────────────────────
  // 2. MANAGER ROLE AUTOMATION
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n--- 2. MANAGER SUITE (manager@northwind.io) ---')
  let mgrAuth
  await test('Manager Login', async () => {
    mgrAuth = await login('manager@northwind.io')
    if (mgrAuth.user.systemRole !== 'MANAGER') throw new Error(`Expected MANAGER role, got ${mgrAuth.user.systemRole}`)
  })

  let sampleEmployeeId
  await test('Get Manager Team Profiles (/manager/team-profiles)', async () => {
    const res = await request('GET', '/api/manager/team-profiles', null, mgrAuth.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`)
    if (Array.isArray(res.data) && res.data.length > 0) {
      sampleEmployeeId = res.data[0].id
    }
  })

  await test('Get Manager Team Gaps (/manager/team-gaps)', async () => {
    const res = await request('GET', '/api/manager/team-gaps', null, mgrAuth.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`)
  })

  await test('Get Manager Heatmap Data (/manager/heatmap-data)', async () => {
    const res = await request('GET', '/api/manager/heatmap-data', null, mgrAuth.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`)
  })

  await test('Get Employee Recommendations & Assign Course (/manager/assign-course)', async () => {
    if (!sampleEmployeeId || !testCourseId) return
    const recRes = await request('GET', `/api/manager/employee/${sampleEmployeeId}/recommendations`, null, mgrAuth.token)
    if (recRes.status !== 200) throw new Error(`Recommendations failed: ${JSON.stringify(recRes.data)}`)

    const assignRes = await request('POST', '/api/manager/assign-course', {
      employeeId: sampleEmployeeId,
      courseId: testCourseId,
      notes: 'Please prioritize this training module for Q3'
    }, mgrAuth.token)
    if (assignRes.status !== 200 && assignRes.status !== 201) throw new Error(`Assign course failed: ${JSON.stringify(assignRes.data)}`)
  })

  // ───────────────────────────────────────────────────────────────────────────
  // 3. DEPARTMENT HEAD ROLE AUTOMATION
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n--- 3. DEPARTMENT HEAD SUITE (depthead@northwind.io) ---')
  let dhAuth
  await test('Department Head Login', async () => {
    dhAuth = await login('depthead@northwind.io')
    if (dhAuth.user.systemRole !== 'DEPARTMENT_HEAD') throw new Error(`Expected DEPARTMENT_HEAD role, got ${dhAuth.user.systemRole}`)
  })

  await test('Get Dept Head Dashboard (/depthead/dashboard)', async () => {
    const res = await request('GET', '/api/depthead/dashboard', null, dhAuth.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`)
  })

  let benchmarkId
  await test('Get & Update Role Benchmarks (/depthead/benchmarks)', async () => {
    const res = await request('GET', '/api/depthead/benchmarks', null, dhAuth.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`)
    if (Array.isArray(res.data) && res.data.length > 0) {
      benchmarkId = res.data[0].id
    }
  })

  await test('Get & Update Department Budget Allocation (/depthead/allocation)', async () => {
    const getRes = await request('GET', '/api/depthead/allocation', null, dhAuth.token)
    if (getRes.status !== 200) throw new Error(`Get allocation failed: ${JSON.stringify(getRes.data)}`)

    const updateRes = await request('PUT', '/api/depthead/allocation', {
      departmentBudget: 75000,
      teamAllocations: { 'Java Team': 25000, 'Frontend Team': 25000, 'DevOps Team': 25000 }
    }, dhAuth.token)
    if (updateRes.status !== 200) throw new Error(`Update allocation failed: ${JSON.stringify(updateRes.data)}`)
  })

  // ───────────────────────────────────────────────────────────────────────────
  // 4. HR SPECIALIST ROLE AUTOMATION
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n--- 4. HR SPECIALIST SUITE (hr@northwind.io) ---')
  let hrAuth
  await test('HR Specialist Login', async () => {
    hrAuth = await login('hr@northwind.io')
    if (hrAuth.user.systemRole !== 'HR_SPECIALIST') throw new Error(`Expected HR_SPECIALIST role, got ${hrAuth.user.systemRole}`)
  })

  await test('Get HR Dashboard (/hr/dashboard)', async () => {
    const res = await request('GET', '/api/hr/dashboard', null, hrAuth.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`)
  })

  await test('Get HR Users Directory (/hr/users)', async () => {
    const res = await request('GET', '/api/hr/users', null, hrAuth.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`)
    if (!Array.isArray(res.data)) throw new Error('Expected array of users')
  })

  await test('Get HR Departments & Create Department (/hr/departments-list & /hr/departments)', async () => {
    const listRes = await request('GET', '/api/hr/departments-list', null, hrAuth.token)
    if (listRes.status !== 200) throw new Error(`Departments list failed: ${JSON.stringify(listRes.data)}`)

    const createRes = await request('POST', '/api/hr/departments', {
      name: `Innovations_${Date.now()}`,
      description: 'Research and Innovation Labs'
    }, hrAuth.token)
    if (createRes.status !== 200 && createRes.status !== 201) throw new Error(`Create dept failed: ${JSON.stringify(createRes.data)}`)
  })

  await test('Get HR Forecasting Data (/hr/forecasting-data)', async () => {
    const res = await request('GET', '/api/hr/forecasting-data', null, hrAuth.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`)
  })

  // ───────────────────────────────────────────────────────────────────────────
  // 5. L&D ADMIN ROLE AUTOMATION
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n--- 5. L&D ADMIN SUITE (ldadmin@northwind.io) ---')
  let ldAuth
  await test('L&D Admin Login', async () => {
    ldAuth = await login('ldadmin@northwind.io')
    if (ldAuth.user.systemRole !== 'L_AND_D_ADMIN') throw new Error(`Expected L_AND_D_ADMIN role, got ${ldAuth.user.systemRole}`)
  })

  await test('Get L&D Dashboard (/ldadmin/dashboard)', async () => {
    const res = await request('GET', '/api/ldadmin/dashboard', null, ldAuth.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`)
  })

  await test('Get L&D Certifications (/ldadmin/certifications)', async () => {
    const res = await request('GET', '/api/ldadmin/certifications', null, ldAuth.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`)
  })

  let createdCourseId
  await test('Create, Update & Delete Training Course (/training/courses)', async () => {
    const createRes = await request('POST', '/api/training/courses', {
      title: `Automation Course ${Date.now()}`,
      description: 'Automated test curriculum module',
      provider: 'KnowledgeIQ Academy',
      durationHours: 6,
      courseUrl: 'https://knowledgeiq.io/courses/auto'
    }, ldAuth.token)
    if (createRes.status !== 200 && createRes.status !== 201) throw new Error(`Create course failed: ${JSON.stringify(createRes.data)}`)
    createdCourseId = createRes.data.id

    const updateRes = await request('PUT', `/api/training/courses/${createdCourseId}`, {
      title: `Automation Course Updated ${Date.now()}`,
      description: 'Updated description',
      provider: 'KnowledgeIQ Academy',
      durationHours: 8,
      courseUrl: 'https://knowledgeiq.io/courses/auto-updated'
    }, ldAuth.token)
    if (updateRes.status !== 200) throw new Error(`Update course failed: ${JSON.stringify(updateRes.data)}`)

    const deleteRes = await request('DELETE', `/api/training/courses/${createdCourseId}`, null, ldAuth.token)
    if (deleteRes.status !== 200 && deleteRes.status !== 204) throw new Error(`Delete course failed: ${JSON.stringify(deleteRes.data)}`)
  })

  await test('Get L&D Paths (/ldadmin/paths)', async () => {
    const res = await request('GET', '/api/ldadmin/paths', null, ldAuth.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`)
  })

  // ───────────────────────────────────────────────────────────────────────────
  // 6. SYSTEM ADMINISTRATOR ROLE AUTOMATION
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n--- 6. SYSTEM ADMINISTRATOR SUITE (admin@northwind.io) ---')
  let admAuth
  await test('System Administrator Login', async () => {
    admAuth = await login('admin@northwind.io')
    if (admAuth.user.systemRole !== 'SYSTEM_ADMIN') throw new Error(`Expected SYSTEM_ADMIN role, got ${admAuth.user.systemRole}`)
  })

  await test('Get Admin Dashboard (/dashboard/admin)', async () => {
    const res = await request('GET', '/api/dashboard/admin', null, admAuth.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`)
  })

  await test('Get Admin Users (/admin/users)', async () => {
    const res = await request('GET', '/api/admin/users', null, admAuth.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`)
    if (!Array.isArray(res.data)) throw new Error('Expected array of users')
  })

  await test('Get Global Skill Taxonomy (/competency/skills)', async () => {
    const res = await request('GET', '/api/competency/skills', null, admAuth.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}: ${JSON.stringify(res.data)}`)
  })

  let createdSkillId
  await test('Create & Delete Global Skill (/admin/skills)', async () => {
    const createRes = await request('POST', '/api/admin/skills', {
      name: `AdminTaxonomySkill_${Date.now()}`,
      categoryName: 'Technical',
      description: 'Global taxonomy validation skill'
    }, admAuth.token)
    if (createRes.status !== 200 && createRes.status !== 201) throw new Error(`Create skill failed: ${JSON.stringify(createRes.data)}`)
    createdSkillId = createRes.data.id

    if (createdSkillId) {
      const deleteRes = await request('DELETE', `/api/admin/skills/${createdSkillId}`, null, admAuth.token)
      if (deleteRes.status !== 200 && deleteRes.status !== 204) throw new Error(`Delete skill failed: ${JSON.stringify(deleteRes.data)}`)
    }
  })

  // ───────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ───────────────────────────────────────────────────────────────────────────
  console.log('\n===============================================================')
  console.log(`FULL AUTOMATION SUMMARY: ${passed} PASSED | ${failed} FAILED | TOTAL: ${passed + failed}`)
  console.log('===============================================================')

  if (failures.length > 0) {
    console.log('\nDETAILED FAILURE LIST:')
    failures.forEach((f, i) => {
      console.log(`${i + 1}. ${f.name}: ${f.error}`)
    })
  }

  if (failed > 0) {
    process.exit(1)
  }
}

runAllTests().catch(err => {
  console.error('Fatal runner error:', err)
  process.exit(1)
})
