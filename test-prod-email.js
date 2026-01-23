const https = require('https');

function request(data) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'tsamssirapro.onrender.com',
            path: '/api/auth/forgot-password',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, res => {
            let body = '';
            res.on('data', d => body += d);
            res.on('end', () => resolve({ status: res.statusCode, body: body }));
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

const data = JSON.stringify({ email: 'dkhilsamer69@gmail.com' });
console.log('Testing Production Forgot Password...');
request(data).then(res => {
    console.log(`Status: ${res.status}`);
    console.log(`Body: ${res.body}`);
}).catch(console.error);
