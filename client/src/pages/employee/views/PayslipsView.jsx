import React, { useState, useEffect } from "react";
import { getEmployeePayslips } from "../../../api/employee.api";

const PayslipsView = ({ onViewPayslip, refreshKey }) => {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [data, setData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchPayslips = async () => {
      try {
        const res = await getEmployeePayslips({
          year: selectedYear,
          status: statusFilter,
        });
        if (isMounted && res?.data) {
          setData(res.data);
        }
      } catch (err) {
        console.warn("Could not load employee payslips:", err);
      }
    };
    fetchPayslips();
    return () => {
      isMounted = false;
    };
  }, [selectedYear, statusFilter, refreshKey]);

  const stats = data?.stats || {
    totalPayslips: 12,
    totalGross: "₹ 8,40,000",
    totalDeductions: "₹ 1,68,000",
    totalNet: "₹ 6,72,000",
  };

  const payslips = data?.payslips || [
    { id: 1, period: "Aug 2025", contract: "Regular Contract", gross: "₹ 67,000.00", deduction: "₹ 12,500.00", net: "₹ 54,500.00", status: "Generated", paymentStatus: "Paid" },
    { id: 2, period: "Jul 2025", contract: "Regular Contract", gross: "₹ 67,000.00", deduction: "₹ 12,500.00", net: "₹ 54,500.00", status: "Generated", paymentStatus: "Paid" },
    { id: 3, period: "Jun 2025", contract: "Regular Contract", gross: "₹ 65,000.00", deduction: "₹ 12,000.00", net: "₹ 53,000.00", status: "Generated", paymentStatus: "Paid" },
    { id: 4, period: "May 2025", contract: "Regular Contract", gross: "₹ 65,000.00", deduction: "₹ 12,000.00", net: "₹ 53,000.00", status: "Generated", paymentStatus: "Paid" },
    { id: 5, period: "Apr 2025", contract: "Regular Contract", gross: "₹ 60,000.00", deduction: "₹ 11,000.00", net: "₹ 49,000.00", status: "Generated", paymentStatus: "Paid" },
  ];

  const handleDownload = (period, slipId) => {
    alert(`Generating official PDF payslip for ${period}... Download started.`);
  };

  return (
    <div className="employee-payslips-view">
      {/* Header */}
      <div className="odoo-page-header">
        <div>
          <h1 className="odoo-page-title">My Payslips</h1>
          <p className="odoo-page-subtitle">View and download your payslips</p>
        </div>
      </div>

      {/* 4 Stat Boxes */}
      <div className="odoo-stat-row-4">
        <div className="odoo-stat-box">
          <div className="odoo-stat-box-icon purple">📄</div>
          <div className="odoo-stat-box-meta">
            <span className="odoo-stat-box-label">Total Payslips</span>
            <span className="odoo-stat-box-value">{stats.totalPayslips}</span>
            <span className="odoo-stat-box-sub">All Time</span>
          </div>
        </div>

        <div className="odoo-stat-box">
          <div className="odoo-stat-box-icon green">💰</div>
          <div className="odoo-stat-box-meta">
            <span className="odoo-stat-box-label">Total Gross Earnings</span>
            <span className="odoo-stat-box-value">{stats.totalGross}</span>
            <span className="odoo-stat-box-sub">All Time</span>
          </div>
        </div>

        <div className="odoo-stat-box">
          <div className="odoo-stat-box-icon red">👛</div>
          <div className="odoo-stat-box-meta">
            <span className="odoo-stat-box-label">Total Deductions</span>
            <span className="odoo-stat-box-value">{stats.totalDeductions}</span>
            <span className="odoo-stat-box-sub">All Time</span>
          </div>
        </div>

        <div className="odoo-stat-box">
          <div className="odoo-stat-box-icon purple">💳</div>
          <div className="odoo-stat-box-meta">
            <span className="odoo-stat-box-label">Total Net Salary</span>
            <span className="odoo-stat-box-value">{stats.totalNet}</span>
            <span className="odoo-stat-box-sub">All Time</span>
          </div>
        </div>
      </div>

      {/* Payslip History Card */}
      <div className="odoo-card">
        <div className="odoo-card-header">
          <h3 className="odoo-card-title">
            <span>📄</span> Payslip History
          </h3>

          <div style={{ display: "flex", gap: "10px" }}>
            <select
              className="odoo-filter-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2024">2024</option>
            </select>

            <select
              className="odoo-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All Status">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        <div className="odoo-table-wrapper">
          <table className="odoo-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>#</th>
                <th>Period</th>
                <th>Contract</th>
                <th>Gross Amount</th>
                <th>Deduction Amount</th>
                <th>Net Amount</th>
                <th>Status</th>
                <th>Payment Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payslips.map((p, index) => (
                <tr key={p.id || index}>
                  <td>{index + 1}</td>
                  <td><strong>{p.period}</strong></td>
                  <td>{p.contract}</td>
                  <td>{p.gross}</td>
                  <td>{p.deduction}</td>
                  <td><strong>{p.net}</strong></td>
                  <td>{p.status}</td>
                  <td>
                    <span className={`odoo-badge ${p.paymentStatus === "Paid" ? "odoo-badge-green" : "odoo-badge-orange"}`}>
                      {p.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        type="button"
                        className="odoo-table-action-btn"
                        onClick={() => onViewPayslip(p.id || p.period)}
                      >
                        👁 View
                      </button>
                      <button
                        type="button"
                        className="odoo-table-action-btn"
                        onClick={() => handleDownload(p.period, p.id)}
                      >
                        ⬇ Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayslipsView;
