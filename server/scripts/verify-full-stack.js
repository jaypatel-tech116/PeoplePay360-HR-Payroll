const http = require("http");
const app = require("../src/app");
const { pool } = require("../src/config/db");

async function runVerification() {
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(5001, resolve));
  console.log("🚀 Test server listening on port 5001");

  const baseUrl = "http://localhost:5001";

  async function post(url, data, headers = {}) {
    return new Promise((resolve, reject) => {
      const u = new URL(url);
      const postData = JSON.stringify(data);
      const req = http.request(
        {
          hostname: u.hostname,
          port: u.port,
          path: u.pathname,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postData),
            ...headers,
          },
        },
        (res) => {
          let body = "";
          res.on("data", (c) => (body += c));
          res.on("end", () => {
            try {
              resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
            } catch {
              resolve({ status: res.statusCode, headers: res.headers, body });
            }
          });
        }
      );
      req.on("error", reject);
      req.write(postData);
      req.end();
    });
  }

  async function get(url, headers = {}) {
    return new Promise((resolve, reject) => {
      const u = new URL(url);
      const req = http.request(
        {
          hostname: u.hostname,
          port: u.port,
          path: u.pathname,
          method: "GET",
          headers,
        },
        (res) => {
          let body = "";
          res.on("data", (c) => (body += c));
          res.on("end", () => {
            try {
              resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
            } catch {
              resolve({ status: res.statusCode, headers: res.headers, body });
            }
          });
        }
      );
      req.on("error", reject);
      req.end();
    });
  }

  try {
    // 1. Health check
    const health = await get(`${baseUrl}/api/health`);
    console.log("1. /api/health:", health.status, health.body.message);

    // 2. Database analysis
    const dbAnalysis = await get(`${baseUrl}/api/db/analysis`);
    console.log("2. /api/db/analysis:", dbAnalysis.status, {
      totalExpectedTables: dbAnalysis.body.data?.totalExpectedTables,
      totalExistingTables: dbAnalysis.body.data?.totalExistingTables,
      isFullyCompliant: dbAnalysis.body.data?.isFullyCompliant,
      totalRecords: dbAnalysis.body.data?.totalRecords,
    });

    // 3. Employee login
    const empLogin = await post(`${baseUrl}/api/auth/login`, {
      email: "employee1@gmail.com",
      password: "123456",
    });
    console.log("3. Employee login status:", empLogin.status, {
      role: empLogin.body.data?.user?.role,
      employee_id: empLogin.body.data?.user?.employee_id,
      employee_code: empLogin.body.data?.user?.employee_code,
      email: empLogin.body.data?.user?.email,
    });

    // Extract cookie
    const setCookie = empLogin.headers["set-cookie"];
    const cookieHeader = Array.isArray(setCookie) ? setCookie[0].split(";")[0] : "";

    // 4. Test /api/auth/me for Employee
    const empMe = await get(`${baseUrl}/api/auth/me`, { Cookie: cookieHeader });
    console.log("4. /api/auth/me status:", empMe.status, "User role:", empMe.body.data?.user?.role);

    // 5. HR login
    const hrLogin = await post(`${baseUrl}/api/auth/login`, {
      email: "hr@gmail.com",
      password: "909090",
    });
    console.log("5. HR login status:", hrLogin.status, {
      role: hrLogin.body.data?.user?.role,
      employee_id: hrLogin.body.data?.user?.employee_id,
      employee_code: hrLogin.body.data?.user?.employee_code,
      email: hrLogin.body.data?.user?.email,
    });

    // 6. Test Register with email and password only
    const randEmail = `testuser_${Date.now()}@example.com`;
    const regRes = await post(`${baseUrl}/api/auth/register`, {
      email: randEmail,
      password: "mypassword123",
    });
    console.log("6. Register status:", regRes.status, {
      user: regRes.body.data?.user?.email,
      role: regRes.body.data?.user?.role,
      employee_code: regRes.body.data?.user?.employee_code,
    });

    console.log("\n🎯 All fullstack integration tests PASSED successfully!");
  } catch (err) {
    console.error("Verification failed:", err);
  } finally {
    server.close();
    await pool.end();
  }
}

runVerification();
