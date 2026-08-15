async function testHrDepts() {
  const loginRes = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'hr@northwind.io', password: 'password123' })
  });
  const auth = await loginRes.json();
  const res = await fetch('http://localhost:8080/api/hr/departments-list', {
    headers: { 'Authorization': `Bearer ${auth.token}` }
  });
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Data:', data);
}
testHrDepts();
