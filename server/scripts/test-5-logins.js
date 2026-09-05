const accounts = [
  { email: "admin@gmail.com", pass: "admin", role: "ADMIN" },
  { email: "hr@gmail.com", pass: "hrhr", role: "HR_MANAGER" },
  { email: "payroll@gmail.com", pass: "payroll", role: "HR_PAYROLL_MANAGER" },
  { email: "payuser@gmail.com", pass: "payuser", role: "HR_PAYROLL_USER" },
  { email: "employee@gmail.com", pass: "123456", role: "EMPLOYEE" },
];

async function test5Logins() {
  console.log("\n🔑 Testing 5 Role Login Accounts:");
  console.log("------------------------------------------------------------------");
  for (const acc of accounts) {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: acc.email, password: acc.pass }),
      });
      const json = await res.json();
      if (json.success && json.data.user.role === acc.role) {
        console.log(`  ✓ ${acc.role.padEnd(20)} | ${acc.email.padEnd(22)} | pass: ${acc.pass.padEnd(8)} -> SUCCESS`);
      } else {
        console.error(`  ✗ ${acc.role} failed: ${json.message}`);
      }
    } catch (err) {
      console.error(`  ✗ ${acc.role} connection error:`, err.message);
    }
  }
  console.log("------------------------------------------------------------------\n");
}

test5Logins();
