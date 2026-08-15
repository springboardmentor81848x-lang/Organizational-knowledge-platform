async function testGoogleAuth() {
  const payload = {
    accessToken: 'google_token_12345',
    userInfo: {
      email: 'nidarshannidarshan154@gmail.com',
      name: 'Nidarshan',
      picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c'
    }
  };

  const res = await fetch('http://localhost:8080/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  console.log('Google Auth Status:', res.status);
  const data = await res.json();
  console.log('Google Auth Response:', data);
}
testGoogleAuth();
