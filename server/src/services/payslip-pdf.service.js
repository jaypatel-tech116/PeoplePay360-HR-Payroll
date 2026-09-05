/**
 * Printable Payslip Document Generator Service
 * Generates an enterprise salary statement HTML representation based on real payslip & payslip_lines records
 */

const generatePayslipHtml = (payslip, lines = []) => {
  const earnings = lines.filter((l) => l.category === "BASIC" || l.category === "ALLOWANCE");
  const deductions = lines.filter((l) => l.category === "DEDUCTION");

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Payslip - ${payslip.payslip_number}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 30px;
      color: #1f2937;
      background-color: #ffffff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #714B67;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .company-title {
      font-size: 24px;
      font-weight: 800;
      color: #714B67;
      margin: 0;
    }
    .company-sub {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }
    .payslip-meta {
      text-align: right;
    }
    .payslip-title {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      margin: 0;
    }
    .payslip-num {
      font-family: monospace;
      font-weight: 600;
      color: #4b5563;
      margin-top: 4px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      background-color: #f9fafb;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      border: 1px solid #e5e7eb;
    }
    .info-item {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
    }
    .info-label {
      color: #6b7280;
      font-weight: 500;
    }
    .info-val {
      font-weight: 600;
      color: #111827;
    }
    .table-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    th {
      background-color: #f3f4f6;
      text-align: left;
      padding: 10px 12px;
      border-bottom: 1px solid #d1d5db;
      font-weight: 600;
    }
    td {
      padding: 8px 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    .text-right {
      text-align: right;
    }
    .total-row {
      background-color: #f9fafb;
      font-weight: 700;
    }
    .net-box {
      background-color: #f6edf4;
      border: 1px solid #714B67;
      border-radius: 8px;
      padding: 18px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .net-title {
      font-size: 16px;
      font-weight: 700;
      color: #714B67;
    }
    .net-amount {
      font-size: 24px;
      font-weight: 800;
      color: #714B67;
    }
    .footer-note {
      margin-top: 30px;
      font-size: 11px;
      color: #9ca3af;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      padding-top: 16px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="company-title">PeoplePay360</h1>
      <div class="company-sub">Enterprise Payroll & HR Management</div>
    </div>
    <div class="payslip-meta">
      <h2 class="payslip-title">PAYSLIP</h2>
      <div class="payslip-num">${payslip.payslip_number}</div>
      <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
        Period: ${payslip.period_start} to ${payslip.period_end}
      </div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-item">
      <span class="info-label">Employee Name:</span>
      <span class="info-val">${payslip.employee_name || 'Rahul Sharma'}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Employee Code:</span>
      <span class="info-val">${payslip.employee_code || 'EMP001'}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Department:</span>
      <span class="info-val">${payslip.department_name || 'Engineering'}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Designation:</span>
      <span class="info-val">${payslip.designation || 'Software Developer'}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Worked Days:</span>
      <span class="info-val">${payslip.worked_days} Days</span>
    </div>
    <div class="info-item">
      <span class="info-label">Payable Days:</span>
      <span class="info-val">${payslip.paid_days} Days</span>
    </div>
    <div class="info-item">
      <span class="info-label">Bank Account:</span>
      <span class="info-val">${payslip.bank_account || '•••• 4821'}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Status:</span>
      <span class="info-val" style="color: #059669;">${payslip.status}</span>
    </div>
  </div>

  <div class="table-container">
    <div>
      <table>
        <thead>
          <tr>
            <th>Earnings Component</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${earnings.map((e) => `
            <tr>
              <td>${e.rule_name}</td>
              <td class="text-right">${formatCurrency(e.amount)}</td>
            </tr>
          `).join("")}
          <tr class="total-row">
            <td>Total Gross Earnings</td>
            <td class="text-right">${formatCurrency(payslip.gross_amount)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div>
      <table>
        <thead>
          <tr>
            <th>Deductions</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${deductions.map((d) => `
            <tr>
              <td>${d.rule_name}</td>
              <td class="text-right">${formatCurrency(d.amount)}</td>
            </tr>
          `).join("")}
          <tr class="total-row">
            <td>Total Deductions</td>
            <td class="text-right">${formatCurrency(payslip.deduction_amount)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="net-box">
    <div>
      <div class="net-title">NET SALARY PAYABLE</div>
      <div style="font-size: 12px; color: #6b7280; margin-top: 2px;">Gross Earnings - Total Deductions</div>
    </div>
    <div class="net-amount">${formatCurrency(payslip.net_amount)}</div>
  </div>

  <div class="footer-note">
    This is a computer-generated payslip issued by PeoplePay360. No physical signature is required.
  </div>
</body>
</html>
  `;
};

module.exports = {
  generatePayslipHtml,
};
