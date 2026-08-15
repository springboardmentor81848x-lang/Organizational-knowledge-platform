const http = require('http')

const BASE_URL = 'http://localhost:8080'

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL)
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
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
    req.on('error', reject)
    if (body) {
      req.write(JSON.stringify(body))
    }
    req.end()
  })
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function waitForBackend(retries = 30) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await makeRequest('GET', '/api/skills/suggested')
      if (res.status === 200 || res.status === 401 || res.status === 403) {
        console.log(`Backend is up and responding (status: ${res.status})`)
        return true
      }
    } catch (e) {
      process.stdout.write('.')
    }
    await sleep(2000)
  }
  throw new Error('Backend failed to respond within timeout.')
}

const ts = Date.now()
const TEST_ORG = `MatrixOrg_${ts}`

const TESTS = [
  // 1. Employee Valid Registration (Engineering -> Java -> Java Developer)
  {
    name: '1. Valid Employee Registration with cascading Dept + Team + JobTitle',
    payload: {
      fullName: 'Alice Employee',
      email: `alice_${ts}@matrix.io`,
      password: 'Password123!',
      role: 'EMPLOYEE',
      company: TEST_ORG,
      departmentName: 'Engineering',
      teamName: 'Java',
      roleTitle: 'Java Developer',
      bio: 'Java Engineer in Engineering'
    },
    expectedStatus: [200, 201],
    validate: (res) => {
      if (!res.data.token) throw new Error('Missing JWT token in response')
      if (res.data.systemRole !== 'EMPLOYEE') throw new Error(`Expected role EMPLOYEE, got ${res.data.systemRole}`)
      if (res.data.departmentName !== 'Engineering') throw new Error(`Expected departmentName Engineering, got ${res.data.departmentName}`)
      if (res.data.teamName !== 'Java') throw new Error(`Expected teamName Java, got ${res.data.teamName}`)
      if (res.data.roleTitle !== 'Java Developer') throw new Error(`Expected roleTitle Java Developer, got ${res.data.roleTitle}`)
      return true
    }
  },

  // 2. Manager Valid Registration (Engineering)
  {
    name: '2. Valid Manager Registration (Department-scoped, NO team, NO custom title)',
    payload: {
      fullName: 'Bob Manager',
      email: `bob_${ts}@matrix.io`,
      password: 'Password123!',
      role: 'MANAGER',
      company: TEST_ORG,
      departmentName: 'Engineering',
      teamName: null,
      roleTitle: null,
      bio: 'Engineering Department Manager'
    },
    expectedStatus: [200, 201],
    validate: (res) => {
      if (!res.data.token) throw new Error('Missing JWT token')
      if (res.data.systemRole !== 'MANAGER') throw new Error(`Expected role MANAGER, got ${res.data.systemRole}`)
      if (res.data.departmentName !== 'Engineering') throw new Error(`Expected departmentName Engineering, got ${res.data.departmentName}`)
      if (res.data.teamName !== null && res.data.teamName !== undefined) throw new Error(`Expected teamName null, got ${res.data.teamName}`)
      if (!res.data.roleTitle || !res.data.roleTitle.toLowerCase().includes('manager')) throw new Error(`Expected Manager roleTitle, got ${res.data.roleTitle}`)
      return true
    }
  },

  // 3. Duplicate Manager in SAME department (Must be rejected)
  {
    name: '3. One Manager Per Department Invariant (Reject second manager in same department)',
    payload: {
      fullName: 'Charlie Imposter Manager',
      email: `charlie_${ts}@matrix.io`,
      password: 'Password123!',
      role: 'MANAGER',
      company: TEST_ORG,
      departmentName: 'Engineering',
      teamName: null,
      roleTitle: null
    },
    expectedStatus: [400],
    validate: (res) => {
      const err = res.data.error || JSON.stringify(res.data)
      if (!err.toLowerCase().includes('already has a manager')) {
        throw new Error(`Expected "already has a Manager" error, got: ${err}`)
      }
      return true
    }
  },

  // 4. Manager in DIFFERENT department of SAME org (Must succeed)
  {
    name: '4. Valid Manager in Different Department (Finance Manager)',
    payload: {
      fullName: 'Diana Finance Mgr',
      email: `diana_${ts}@matrix.io`,
      password: 'Password123!',
      role: 'MANAGER',
      company: TEST_ORG,
      departmentName: 'Finance',
      teamName: null,
      roleTitle: null
    },
    expectedStatus: [200, 201],
    validate: (res) => {
      if (res.data.systemRole !== 'MANAGER') throw new Error(`Expected role MANAGER, got ${res.data.systemRole}`)
      if (res.data.departmentName !== 'Finance') throw new Error(`Expected departmentName Finance, got ${res.data.departmentName}`)
      return true
    }
  },

  // 5. Department Head Valid Registration
  {
    name: '5. Valid Department Head Registration (Department-scoped)',
    payload: {
      fullName: 'Edward Dept Head',
      email: `edward_${ts}@matrix.io`,
      password: 'Password123!',
      role: 'DEPARTMENT_HEAD',
      company: TEST_ORG,
      departmentName: 'Engineering',
      teamName: null,
      roleTitle: null
    },
    expectedStatus: [200, 201],
    validate: (res) => {
      if (res.data.systemRole !== 'DEPARTMENT_HEAD') throw new Error(`Expected role DEPARTMENT_HEAD, got ${res.data.systemRole}`)
      if (res.data.departmentName !== 'Engineering') throw new Error(`Expected departmentName Engineering, got ${res.data.departmentName}`)
      if (res.data.teamName !== null && res.data.teamName !== undefined) throw new Error(`Expected teamName null, got ${res.data.teamName}`)
      return true
    }
  },

  // 6. HR Specialist Valid Registration (Org-wide, NO dept, NO team)
  {
    name: '6. Valid HR Specialist Registration (Org-wide scope: NO Dept, NO Team)',
    payload: {
      fullName: 'Fiona HR',
      email: `fiona_${ts}@matrix.io`,
      password: 'Password123!',
      role: 'HR_SPECIALIST',
      company: TEST_ORG,
      departmentName: null,
      teamName: null,
      roleTitle: null
    },
    expectedStatus: [200, 201],
    validate: (res) => {
      if (res.data.systemRole !== 'HR_SPECIALIST') throw new Error(`Expected role HR_SPECIALIST, got ${res.data.systemRole}`)
      if (res.data.departmentName !== null && res.data.departmentName !== undefined) throw new Error(`Expected departmentName null, got ${res.data.departmentName}`)
      if (res.data.teamName !== null && res.data.teamName !== undefined) throw new Error(`Expected teamName null, got ${res.data.teamName}`)
      if (!res.data.roleTitle || !res.data.roleTitle.toLowerCase().includes('hr')) throw new Error(`Expected roleTitle HR Specialist, got ${res.data.roleTitle}`)
      return true
    }
  },

  // 7. L&D Admin Valid Registration (Org-wide, NO dept, NO team)
  {
    name: '7. Valid L&D Admin Registration (Org-wide learning scope: NO Dept, NO Team)',
    payload: {
      fullName: 'George LDAdmin',
      email: `george_${ts}@matrix.io`,
      password: 'Password123!',
      role: 'L_AND_D_ADMIN',
      company: TEST_ORG,
      departmentName: null,
      teamName: null,
      roleTitle: null
    },
    expectedStatus: [200, 201],
    validate: (res) => {
      if (res.data.systemRole !== 'L_AND_D_ADMIN') throw new Error(`Expected role L_AND_D_ADMIN, got ${res.data.systemRole}`)
      if (res.data.departmentName !== null && res.data.departmentName !== undefined) throw new Error(`Expected departmentName null, got ${res.data.departmentName}`)
      if (res.data.teamName !== null && res.data.teamName !== undefined) throw new Error(`Expected teamName null, got ${res.data.teamName}`)
      if (!res.data.roleTitle || !res.data.roleTitle.toLowerCase().includes('l&d')) throw new Error(`Expected roleTitle L&D Admin, got ${res.data.roleTitle}`)
      return true
    }
  },

  // 8. System Admin Valid Registration (Org/Platform-wide, NO dept, NO team)
  {
    name: '8. Valid System Admin Registration (Platform-wide scope: NO Dept, NO Team)',
    payload: {
      fullName: 'Helen SysAdmin',
      email: `helen_${ts}@matrix.io`,
      password: 'Password123!',
      role: 'SYSTEM_ADMIN',
      company: TEST_ORG,
      departmentName: null,
      teamName: null,
      roleTitle: null
    },
    expectedStatus: [200, 201],
    validate: (res) => {
      if (res.data.systemRole !== 'SYSTEM_ADMIN') throw new Error(`Expected role SYSTEM_ADMIN, got ${res.data.systemRole}`)
      if (res.data.departmentName !== null && res.data.departmentName !== undefined) throw new Error(`Expected departmentName null, got ${res.data.departmentName}`)
      if (res.data.teamName !== null && res.data.teamName !== undefined) throw new Error(`Expected teamName null, got ${res.data.teamName}`)
      if (!res.data.roleTitle || !res.data.roleTitle.toLowerCase().includes('admin')) throw new Error(`Expected roleTitle System Administrator, got ${res.data.roleTitle}`)
      return true
    }
  },

  // 9. Negative Test: HR Specialist trying to pass department (Must be rejected)
  {
    name: '9. Security Invariant: HR Specialist cannot be assigned to Department',
    payload: {
      fullName: 'Invalid HR Dept',
      email: `inv_hr_${ts}@matrix.io`,
      password: 'Password123!',
      role: 'HR_SPECIALIST',
      company: TEST_ORG,
      departmentName: 'Engineering',
      teamName: null
    },
    expectedStatus: [400],
    validate: (res) => {
      const err = res.data.error || JSON.stringify(res.data)
      if (!err.toLowerCase().includes('department must not be specified for hr')) {
        throw new Error(`Expected department rejection for HR, got: ${err}`)
      }
      return true
    }
  },

  // 10. Negative Test: Manager trying to pass specific team (Must be rejected)
  {
    name: '10. Security Invariant: Manager cannot be assigned to a specific Team',
    payload: {
      fullName: 'Invalid Mgr Team',
      email: `inv_mgr_team_${ts}@matrix.io`,
      password: 'Password123!',
      role: 'MANAGER',
      company: TEST_ORG,
      departmentName: 'Marketing',
      teamName: 'Content'
    },
    expectedStatus: [400],
    validate: (res) => {
      const err = res.data.error || JSON.stringify(res.data)
      if (!err.toLowerCase().includes('team/domain must not be specified for manager')) {
        throw new Error(`Expected team rejection for Manager, got: ${err}`)
      }
      return true
    }
  },

  // 11. Negative Test: Employee with invalid Team for Department (e.g. Accounting team in Engineering dept)
  {
    name: '11. Integrity Invariant: Employee team must belong to the selected Department',
    payload: {
      fullName: 'Invalid Emp Cascading',
      email: `inv_emp_casc_${ts}@matrix.io`,
      password: 'Password123!',
      role: 'EMPLOYEE',
      company: TEST_ORG,
      departmentName: 'Engineering',
      teamName: 'Accounting', // Accounting is Finance, not Engineering
      roleTitle: 'Developer'
    },
    expectedStatus: [400],
    validate: (res) => {
      const err = res.data.error || JSON.stringify(res.data)
      if (!err.toLowerCase().includes('not a valid team')) {
        throw new Error(`Expected invalid team rejection, got: ${err}`)
      }
      return true
    }
  },

  // 12. Negative Test: Employee missing team
  {
    name: '12. Integrity Invariant: Employee must provide a Team',
    payload: {
      fullName: 'Missing Team Emp',
      email: `inv_emp_noteam_${ts}@matrix.io`,
      password: 'Password123!',
      role: 'EMPLOYEE',
      company: TEST_ORG,
      departmentName: 'Engineering',
      teamName: null,
      roleTitle: 'Developer'
    },
    expectedStatus: [400],
    validate: (res) => {
      const err = res.data.error || JSON.stringify(res.data)
      if (!err.toLowerCase().includes('team')) {
        throw new Error(`Expected missing team error, got: ${err}`)
      }
      return true
    }
  }
]

async function runSuite() {
  console.log('===============================================================')
  console.log('KNOWLEDGEIQ SIGNUP ARCHITECTURE MATRIX VERIFICATION SUITE')
  console.log('===============================================================')
  console.log(`Test Organization: ${TEST_ORG}`)
  console.log('Waiting for backend service...')
  
  await waitForBackend()

  let passed = 0
  let failed = 0

  for (const test of TESTS) {
    process.stdout.write(`\nRUNNING: ${test.name}... `)
    try {
      const res = await makeRequest('POST', '/api/auth/register', test.payload)
      if (!test.expectedStatus.includes(res.status)) {
        throw new Error(`Expected status ${test.expectedStatus.join('/')}, got ${res.status}: ${JSON.stringify(res.data)}`)
      }
      if (test.validate) {
        test.validate(res)
      }
      console.log('✅ PASSED (HTTP ' + res.status + ')')
      passed++
    } catch (e) {
      console.log('❌ FAILED: ' + e.message)
      failed++
    }
  }

  console.log('\n===============================================================')
  console.log(`RESULTS: ${passed} PASSED | ${failed} FAILED | TOTAL: ${TESTS.length}`)
  console.log('===============================================================')

  if (failed > 0) {
    process.exit(1)
  }
}

runSuite().catch(err => {
  console.error('Fatal test runner error:', err)
  process.exit(1)
})
