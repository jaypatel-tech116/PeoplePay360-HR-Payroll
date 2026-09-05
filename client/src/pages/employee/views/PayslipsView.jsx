import React, { useState, useEffect, useRef } from "react";
import { getEmployeePayslips, getPayslipDetails } from "../../../api/employee.api";
import { SkeletonListPage } from "../../../components/ui/SkeletonLoader";

const PayslipsView = ({ onViewPayslip, refreshKey }) => {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [data, setData] = useState(null);
  const [printData, setPrintData] = useState(null);
  const printRef = useRef(null);

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
    totalPayslips: 0,
    totalGross: "₹ 0.00",
    totalDeductions: "₹ 0.00",
    totalNet: "₹ 0.00",
  };

  const payslips = data?.payslips || [];

  const handleDownload = async (period, slipId) => {
    try {
      // Fetch full payslip details for PDF
      const res = await getPayslipDetails(slipId || period);
      if (res?.data?.payslip) {
        setPrintData(res.data.payslip);
        // Wait for state to update, then trigger print
        setTimeout(() => {
          window.print();
          setTimeout(() => setPrintData(null), 1000);
        }, 200);
      }
    } catch (err) {
      console.error("Failed to generate payslip PDF:", err);
    }
  };

  if (!data) return <SkeletonListPage rows={5} cols={5} />;

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
              {payslips.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center", color: "var(--odoo-text-muted)", padding: "24px" }}>
                    No payslips found for this period
                  </td>
                </tr>
              )}
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
                        ⬇ PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print-only Payslip Layout (hidden on screen, visible when printing) */}
      {printData && (
        <div className="payslip-print-container" ref={printRef}>
          <div className="payslip-print-header">
            <div>
              <div className="payslip-print-company">PeoplePay360</div>
              <div style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "4px" }}>Payslip Statement</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700, fontSize: "1rem" }}>{printData.period}</div>
              <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                {printData.paymentStatus === "Paid" ? "✅ Paid" : "⏳ Unpaid"}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "2px" }}>Employee</div>
              <div style={{ fontWeight: 700 }}>{printData.employeeName}</div>
              <div style={{ fontSize: "0.82rem", color: "#6b7280" }}>{printData.employeeCode} • {printData.designation}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "2px" }}>Department</div>
              <div style={{ fontWeight: 700 }}>{printData.department}</div>
            </div>
          </div>

          <h4 style={{ margin: "0 0 8px", fontSize: "0.85rem" }}>Earnings</h4>
          <table className="payslip-print-table">
            <thead><tr><th>Component</th><th style={{ textAlign: "right" }}>Amount</th></tr></thead>
            <tbody>
              {(printData.earnings || []).map((e, i) => (
                <tr key={i}><td>{e.name}</td><td style={{ textAlign: "right" }}>{e.amount}</td></tr>
              ))}
              <tr style={{ fontWeight: 700, background: "#f9fafb" }}>
                <td>Gross Earnings</td>
                <td style={{ textAlign: "right" }}>{printData.grossAmount}</td>
              </tr>
            </tbody>
          </table>

          <h4 style={{ margin: "16px 0 8px", fontSize: "0.85rem" }}>Deductions</h4>
          <table className="payslip-print-table">
            <thead><tr><th>Component</th><th style={{ textAlign: "right" }}>Amount</th></tr></thead>
            <tbody>
              {(printData.deductions || []).map((d, i) => (
                <tr key={i}><td>{d.name}</td><td style={{ textAlign: "right" }}>{d.amount}</td></tr>
              ))}
              <tr style={{ fontWeight: 700, background: "#f9fafb" }}>
                <td>Total Deductions</td>
                <td style={{ textAlign: "right" }}>{printData.deductionAmount}</td>
              </tr>
            </tbody>
          </table>

          <div className="payslip-print-total" style={{ marginTop: "20px", padding: "16px", background: "#f3ebf1", borderRadius: "8px", textAlign: "right" }}>
            <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Net Pay: </span>
            <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "#714B67" }}>{printData.netAmount}</span>
          </div>

          <div style={{ marginTop: "32px", fontSize: "0.72rem", color: "#9ca3af", textAlign: "center", borderTop: "1px solid #e5e7eb", paddingTop: "12px" }}>
            This is a computer-generated payslip from PeoplePay360. No signature required.
          </div>
        </div>
      )}
    </div>
  );
};

export default PayslipsView;
