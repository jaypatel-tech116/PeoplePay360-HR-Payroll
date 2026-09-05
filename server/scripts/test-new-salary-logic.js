require('dotenv').config();

function computeSalary(wage, lopDays = 0, scheduledDays = 23) {
  // Earnings (100% of wage)
  const basic = Math.round(wage * 0.50 * 100) / 100; // 50%
  const hra = Math.round(wage * 0.30 * 100) / 100;   // 30%
  const conv = Math.round(wage * 0.05 * 100) / 100;  // 5%
  const med = Math.round(wage * 0.05 * 100) / 100;   // 5%
  const spec = Math.round((wage - (basic + hra + conv + med)) * 100) / 100; // 10% balancing

  const gross = basic + hra + conv + med + spec;

  // Deductions
  const pf = Math.round(wage * 0.05 * 100) / 100; // 5% reduction on salary
  const pt = 200.00;                             // Fixed PT
  const tds = Math.round(wage * 0.04 * 100) / 100; // 4% tax
  const lop = lopDays > 0 ? Math.round((wage / scheduledDays) * lopDays * 100) / 100 : 0;

  const totalDeductions = pf + pt + tds + lop;
  const net = gross - totalDeductions;

  return {
    wage,
    lopDays,
    earnings: {
      basic,
      hra,
      conv,
      med,
      spec,
      totalGross: gross
    },
    deductions: {
      pf_5pct: pf,
      pt_fixed: pt,
      tds_4pct: tds,
      lop,
      totalDeductions
    },
    netSalary: net
  };
}

console.log('=== TEST 1: Wage = 50,000 ===');
console.log(JSON.stringify(computeSalary(50000), null, 2));

console.log('\n=== TEST 2: Suresh Malhotra (Wage = 83,000) ===');
console.log(JSON.stringify(computeSalary(83000), null, 2));

console.log('\n=== TEST 3: Wage = 50,000 with 1 unpaid leave ===');
console.log(JSON.stringify(computeSalary(50000, 1), null, 2));
