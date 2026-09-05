import React, { useState, useEffect } from "react";
import { getEmployeePayslips } from "../../../api/employee.api";
import api from "../../../api/axios";
import { SkeletonListPage } from "../../../components/ui/SkeletonLoader";

const PayslipsView = ({ onViewPayslip, refreshKey }) => {
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchPayslips = async () => {
      try {
        setLoading(true);
        const res = await getEmployeePayslips({
          year: selectedYear === "All Years" ? "" : selectedYear,
          status: statusFilter === "All Status" ? "" : statusFilter,
        });
        if (isMounted && res?.data) {
          setData(res.data);
        }
      } catch (err) {
        console.warn("Could not load employee payslips:", err);
      } finally {
        if (isMounted) setLoading(false);
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

  const handleDownload = (period, slipId) => {
    if (!slipId) return;
    const pdfUrl = `${api.defaults.baseURL}/payroll/payslips/${slipId}/pdf`;
    window.open(pdfUrl, "_blank");
  };

  if (loading && !data) return <SkeletonListPage rows={5} cols={5} />;

  return (
    <div className="employee-payslips-view">
      {/* Header */}
      <div className="odoo-page-header">
        <div>
          <h1 className="odoo-page-title">My Payslips</h1>
          <p className="odoo-page-subtitle">View and download your official payslips synchronized with database</p>
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
              <option value="All Years">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
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
                        onClick={() => handleDownload(p.period, p.id)}
                      >
                        👁 View PDF
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

              {payslips.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: "30px", color: "#9ca3af" }}>
                    No payslips found for the selected period. Newly generated payslips will appear here after payroll processing.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayslipsView;
