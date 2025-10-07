const http = require('http');

const postData = JSON.stringify({ prompt: 'Say hello in JSON: { "greeting": "Hello" }' });

const options = {
  hostname: 'localhost',
  port: 8888,
  path: '/api/ask',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
  },
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      console.log('Response:', JSON.parse(data));
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (err) => console.error('Request error:', err));
req.write(postData);
req.end();
