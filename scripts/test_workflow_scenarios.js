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
    throw new Error(`Login failed for ${email} (${res.status}): ${JSON.stringify(res.data)}`)
  }
  return { token: res.data.token, user: res.data }
}

async function runWorkflows() {
  console.log('===============================================================')
  console.log('KNOWLEDGEIQ FULL ROLE WORKFLOW & USER JOURNEY TEST')
  console.log('===============================================================')

  let passed = 0
  let failed = 0

  async function step(name, fn) {
    process.stdout.write(`\n➡️  ${name}... `)
    try {
      await fn()
      console.log('✅ OK')
      passed++
    } catch (e) {
      console.log('❌ FAILED: ' + e.message)
      failed++
    }
  }

  // --- WORKFLOW 1: EMPLOYEE JOURNEY ---
  console.log('\n🔵 1. EMPLOYEE END-TO-END JOURNEY (Ava Chen - Java Team)')
  const emp = await login('employee@northwind.io')

  await step('1.1 View Dashboard and Skill Radar', async () => {
    const res = await request('GET', '/api/dashboard/employee', null, emp.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}`)
  })

  await step('1.2 Perform Self-Assessment & Update Rating', async () => {
    const res = await request('POST', '/api/employee/skills/add', {
      skillName: `Spring Cloud & Reactive Microservices`,
      categoryName: 'Technical',
      proficiencyLevel: 4
    }, emp.token)
    if (res.status !== 200 && res.status !== 201) throw new Error(`Status ${res.status}`)
  })

  await step('1.3 Upload Certification Credential', async () => {
    const res = await request('POST', '/api/employee/certifications', {
      name: 'Spring Professional Certified Developer',
      issuingOrganization: 'VMware Tanzu',
      issueDate: '2026-03-15',
      credentialUrl: 'https://vmware.com/verify/spring'
    }, emp.token)
    if (res.status !== 200 && res.status !== 201) throw new Error(`Status ${res.status}`)
  })

  let courseIdToEnroll
  await step('1.4 Discover AI Recommendations & Enroll', async () => {
    const recRes = await request('GET', '/api/training/recommendations/personalized', null, emp.token)
    if (recRes.status !== 200) throw new Error(`Recommendations failed: ${recRes.status}`)

    const coursesRes = await request('GET', '/api/training/courses', null, emp.token)
    if (coursesRes.status !== 200 || !coursesRes.data.length) throw new Error('No courses found')
    courseIdToEnroll = coursesRes.data[0].id

    const enrollRes = await request('POST', '/api/training/enroll', { courseId: courseIdToEnroll }, emp.token)
    if (enrollRes.status !== 200 && enrollRes.status !== 201) throw new Error(`Enroll failed: ${enrollRes.status}`)
  })

  await step('1.5 Chat with AI Career Coach', async () => {
    const chatRes = await request('POST', '/api/ai/chat', {
      message: 'What advanced system architecture patterns should I learn next?',
      courseContext: 'Spring Boot 3 Enterprise Microservices'
    }, emp.token)
    if (chatRes.status !== 200) throw new Error(`Status ${chatRes.status}`)
    if (!chatRes.data.reply && !chatRes.data.response) throw new Error('Missing reply')
  })

  // --- WORKFLOW 2: MANAGER JOURNEY ---
  console.log('\n🟢 2. MANAGER END-TO-END JOURNEY (Marcus Lee - Engineering Manager)')
  const mgr = await login('manager@northwind.io')

  let directReportId
  await step('2.1 Review Department Team Profiles & Skill Gaps', async () => {
    const res = await request('GET', '/api/manager/team-profiles', null, mgr.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}`)
    if (res.data.length > 0) directReportId = res.data[0].id
  })

  await step('2.2 Analyze Department Skill Heatmap', async () => {
    const res = await request('GET', '/api/manager/heatmap-data', null, mgr.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}`)
  })

  await step('2.3 Assign Mandatory Training Intervention to Direct Report', async () => {
    if (!directReportId || !courseIdToEnroll) return
    const res = await request('POST', '/api/manager/assign-course', {
      employeeId: directReportId,
      courseId: courseIdToEnroll,
      notes: 'Mandatory Q3 Architecture Upskilling'
    }, mgr.token)
    if (res.status !== 200 && res.status !== 201) throw new Error(`Status ${res.status}`)
  })

  // --- WORKFLOW 3: DEPARTMENT HEAD JOURNEY ---
  console.log('\n🟣 3. DEPARTMENT HEAD JOURNEY (David Vance - Head of Engineering)')
  const dh = await login('depthead@northwind.io')

  await step('3.1 Inspect Department Overview & KPI Metrics', async () => {
    const res = await request('GET', '/api/depthead/dashboard', null, dh.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}`)
  })

  await step('3.2 Calibrate Role Benchmarks & Set Critical Competencies', async () => {
    const benchmarksRes = await request('GET', '/api/depthead/benchmarks', null, dh.token)
    if (benchmarksRes.status !== 200) throw new Error(`Status ${benchmarksRes.status}`)
  })

  await step('3.3 Allocate Department Training Budget Across Teams', async () => {
    const res = await request('PUT', '/api/depthead/allocation', {
      departmentBudget: 120000,
      teamAllocations: {
        'Java Team': 40000,
        'Python Team': 30000,
        'Frontend Team': 25000,
        'DevOps Team': 25000
      }
    }, dh.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}`)
  })

  // --- WORKFLOW 4: HR SPECIALIST JOURNEY ---
  console.log('\n🟠 4. HR SPECIALIST JOURNEY (Priya Nair - HR Operations Lead)')
  const hr = await login('hr@northwind.io')

  await step('4.1 Audit Workforce Directory & Role Distribution', async () => {
    const res = await request('GET', '/api/hr/users', null, hr.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}`)
  })

  await step('4.2 Provision New Organization Department', async () => {
    const res = await request('POST', '/api/hr/departments', {
      name: `AI_Robotics_Lab_${Date.now()}`,
      description: 'Applied Artificial Intelligence and Automation Center'
    }, hr.token)
    if (res.status !== 200 && res.status !== 201) throw new Error(`Status ${res.status}`)
  })

  await step('4.3 Review Strategic Skill Forecasting & Gap Predictions', async () => {
    const res = await request('GET', '/api/hr/forecasting-data', null, hr.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}`)
  })

  // --- WORKFLOW 5: L&D ADMIN JOURNEY ---
  console.log('\n🟡 5. L&D ADMIN JOURNEY (Elena Rostova - L&D Program Lead)')
  const ld = await login('ldadmin@northwind.io')

  let newCourseId
  await step('5.1 Publish New Curriculum Course in Catalog', async () => {
    const res = await request('POST', '/api/training/courses', {
      title: `Zero-Trust Cloud Architecture & Kubernetes Masterclass ${Date.now()}`,
      description: 'Comprehensive containerization, security policies, and production deployment',
      provider: 'Cloud Native Foundation',
      durationHours: 12,
      courseUrl: 'https://kubernetes.io/training'
    }, ld.token)
    if (res.status !== 200 && res.status !== 201) throw new Error(`Status ${res.status}`)
    newCourseId = res.data.id
  })

  await step('5.2 Inspect and Verify Employee Certifications', async () => {
    const res = await request('GET', '/api/ldadmin/certifications', null, ld.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}`)
  })

  // --- WORKFLOW 6: SYSTEM ADMINISTRATOR JOURNEY ---
  console.log('\n🔴 6. SYSTEM ADMINISTRATOR JOURNEY (Noah Bennett - Platform Admin)')
  const adm = await login('admin@northwind.io')

  await step('6.1 Monitor System Health & Audit Logs', async () => {
    const res = await request('GET', '/api/dashboard/admin', null, adm.token)
    if (res.status !== 200) throw new Error(`Status ${res.status}`)
  })

  await step('6.2 Expand Global Skill Taxonomy', async () => {
    const res = await request('POST', '/api/admin/skills', {
      name: `Quantum_Computing_Algorithms_${Date.now()}`,
      categoryName: 'Technical',
      description: 'Quantum circuits, Qiskit, and qubit simulation'
    }, adm.token)
    if (res.status !== 200 && res.status !== 201) throw new Error(`Status ${res.status}`)
  })

  console.log('\n===============================================================')
  console.log(`WORKFLOW VERIFICATION RESULT: ${passed} PASSED | ${failed} FAILED | TOTAL: ${passed + failed}`)
  console.log('===============================================================')

  if (failed > 0) process.exit(1)
}

runWorkflows().catch(err => {
  console.error('Fatal error in workflow test:', err)
  process.exit(1)
})
