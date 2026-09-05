import React, { useState } from "react";

const PayCyclesView = ({ onOpenCreateModal, onSelectCycle }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const cycles = [
    { id: 1, month: "August", year: "2025", payDate: "31 Aug 2025", status: "Processing", processedOn: "-" },
    { id: 2, month: "July", year: "2025", payDate: "31 Jul 2025", status: "Completed", processedOn: "31 Jul 2025" },
    { id: 3, month: "June", year: "2025", payDate: "30 Jun 2025", status: "Completed", processedOn: "30 Jun 2025" },
    { id: 4, month: "May", year: "2025", payDate: "31 May 2025", status: "Completed", processedOn: "31 May 2025" },
    { id: 5, month: "April", year: "2025", payDate: "30 Apr 2025", status: "Completed", processedOn: "30 Apr 2025" },
  ];

  return (
    <div className="pay-content-body">
      {/* 1. Header */}
      <div className="pay-page-header">
        <div>
          <h1 className="pay-page-title">Pay Cycles</h1>
          <p className="pay-page-subtitle">
            Manage monthly pay cycles
          </p>
        </div>

        <button
          type="button"
          className="pay-btn-primary"
          onClick={onOpenCreateModal}
        >
          <span>+</span>
          <span>Create Pay Cycle</span>
        </button>
      </div>

      {/* 2. Cycles Table */}
      <div className="pay-section-card">
        <div className="pay-table-responsive">
          <table className="pay-data-table">
            <thead>
              <tr>
                <th style={{ width: "30px" }}>#</th>
                <th>Month</th>
                <th>Year</th>
                <th>Pay Date</th>
                <th>Status</th>
                <th>Processed On</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {cycles.map((c) => (
                <tr
                  key={c.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => onSelectCycle(c)}
                >
                  <td style={{ color: "#9ca3af" }}>{c.id}</td>
                  <td style={{ fontWeight: 600, color: "#111827" }}>{c.month}</td>
                  <td>{c.year}</td>
                  <td>{c.payDate}</td>
                  <td>
                    <span
                      className={`pay-badge ${
                        c.status === "Processing"
                          ? "pay-badge-blue"
                          : "pay-badge-green"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td>{c.processedOn}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#9ca3af",
                        cursor: "pointer",
                        fontSize: "1rem",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCycle(c);
                      }}
                    >
                      ⋮
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pay-pagination-footer">
          <span>Showing 1 to 5 of 12 cycles</span>
          <div className="pay-pagination-controls">
            <button
              type="button"
              className="pay-page-btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
            <button
              type="button"
              className={`pay-page-btn ${currentPage === 1 ? "active" : ""}`}
              onClick={() => setCurrentPage(1)}
            >
              1
            </button>
            <button
              type="button"
              className={`pay-page-btn ${currentPage === 2 ? "active" : ""}`}
              onClick={() => setCurrentPage(2)}
            >
              2
            </button>
            <button
              type="button"
              className={`pay-page-btn ${currentPage === 3 ? "active" : ""}`}
              onClick={() => setCurrentPage(3)}
            >
              3
            </button>
            <button
              type="button"
              className="pay-page-btn"
              onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayCyclesView;
