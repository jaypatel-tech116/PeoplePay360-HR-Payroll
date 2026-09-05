require('dotenv').config();
const { generateToken } = require('../src/utils/jwt');
const http = require('http');

async function testAttendanceReportEndpoint() {
  const token = generateToken({ id: 'usr-hr-001', role: 'HR_MANAGER' });

  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/hr/employees/1/attendance-report',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log('STATUS:', res.statusCode);
      const parsed = JSON.parse(body);
      console.log('LEAVES REPORT DATA:\n', JSON.stringify(parsed.data?.leaves, null, 2));
      process.exit(0);
    });
  });
  req.on('error', e => { console.error(e); process.exit(1); });
  req.end();
}

testAttendanceReportEndpoint().catch(e => { console.error(e); process.exit(1); });
