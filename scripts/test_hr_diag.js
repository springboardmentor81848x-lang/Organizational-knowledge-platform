async function testHr() {
  const loginRes = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'hr@northwind.io', password: 'password123' })
  });
  const auth = await loginRes.json();
  console.log('HR Auth:', auth);

  const dashRes = await fetch('http://localhost:8080/api/hr/dashboard', {
    headers: { 'Authorization': `Bearer ${auth.token}` }
  });
  console.log('HR Dashboard status:', dashRes.status);
  const dashData = await dashRes.json();
  console.log('HR Dashboard data:', JSON.stringify(dashData, null, 2));
}
testHr();
