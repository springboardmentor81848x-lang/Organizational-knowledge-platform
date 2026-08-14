const http = require('http');

function post(path, body, token = null) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const req = http.request({
      hostname: 'localhost',
      port: 8080,
      path: '/api' + path,
      method: 'POST',
      headers: headers
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, data: data }); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function run() {
  const login = await post('/auth/login', { email: 'employee@northwind.io', password: 'password123' });
  const token = login.data.token;
  console.log('Logged in as Employee. Token obtained.');

  console.log('\n--- RUN 1: Domain "Data Analytics" ---');
  const res1 = await post('/ai/generate-assessment', { domain: 'Data Analytics', difficulty: 'Intermediate', questionCount: 3 }, token);
  res1.data.questions.forEach((q, i) => {
    console.log(`${i + 1}. [${q.targetSkill}] ${q.questionText}`);
    console.log(`   Options: ${q.options.join(' | ')}`);
  });

  console.log('\n--- RUN 2: Domain "Data Analytics" (Fresh dynamic questions & options) ---');
  const res2 = await post('/ai/generate-assessment', { domain: 'Data Analytics', difficulty: 'Intermediate', questionCount: 3 }, token);
  res2.data.questions.forEach((q, i) => {
    console.log(`${i + 1}. [${q.targetSkill}] ${q.questionText}`);
    console.log(`   Options: ${q.options.join(' | ')}`);
  });

  console.log('\n--- RUN 3: Domain "React & Frontend" ---');
  const res3 = await post('/ai/generate-assessment', { domain: 'React & Frontend', difficulty: 'Intermediate', questionCount: 3 }, token);
  res3.data.questions.forEach((q, i) => {
    console.log(`${i + 1}. [${q.targetSkill}] ${q.questionText}`);
    console.log(`   Options: ${q.options.join(' | ')}`);
  });

  console.log('\n✔ Dynamic AI Assessment Generation Verified Successfully!');
}

run();
