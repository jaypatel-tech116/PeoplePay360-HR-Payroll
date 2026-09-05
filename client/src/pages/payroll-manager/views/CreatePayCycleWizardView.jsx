import React, { useState, useEffect } from "react";
import payrollApi from "../../../api/payroll.api";

const CreatePayCycleWizardView = ({ onBack, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [structures, setStructures] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedStructureId, setSelectedStructureId] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState("August 2026");
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [searchTerm, setSearchTerm] = useState("");
  const [contractFilter, setContractFilter] = useState("All Status");
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [structData, empData] = await Promise.all([
          payrollApi.getSalaryStructures(),
          payrollApi.getEmployees(),
        ]);
        setStructures(structData || []);
        if (structData && structData.length > 0) {
          setSelectedStructureId(structData[0].id);
        }

        const validEmployees = empData || [];
        setEmployees(validEmployees);
        // Pre-select all employees with active contracts
        const activeCodes = validEmployees
          .filter((e) => e.contract_status === "ACTIVE" || e.active_contract_id)
          .map((e) => e.employee_code);
        setSelectedEmployees(activeCodes);
      } catch (err) {
        console.error("Failed to load structures and employees for wizard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [yearFilter, setYearFilter] = useState("All");

  const monthOptions = React.useMemo(() => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    // 36 continuous months across 2026, 2025, and 2027
    const years = [2026, 2025, 2027];
    const options = [];

    for (const yr of years) {
      for (let m = 0; m < 12; m++) {
        const monthName = monthNames[m];
        const monthNum = String(m + 1).padStart(2, "0");
        const lastDay = new Date(yr, m + 1, 0).getDate();
        const start = `${yr}-${monthNum}-01`;
        const end = `${yr}-${monthNum}-${String(lastDay).padStart(2, "0")}`;
        options.push({
          label: `${monthName} ${yr}`,
          month: monthName,
          year: String(yr),
          start,
          end,
          daysInMonth: lastDay,
        });
      }
    }
    return options;
  }, []);

  const visibleMonthOptions = React.useMemo(() => {
    if (yearFilter === "All") return monthOptions;
    return monthOptions.filter((m) => m.year === yearFilter);
  }, [monthOptions, yearFilter]);

  const activePeriodOpt = monthOptions.find((m) => m.label === selectedPeriod) || monthOptions[0];

  const toggleSelectEmp = (code) => {
    setSelectedEmployees((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const formattedEmployeesList = employees.map((e) => {
    const hasContract = e.contract_status === "ACTIVE" || e.active_contract_id;
    const wageNum = parseFloat(e.wage) || 50000;
    return {
      dbId: e.id,
      code: e.employee_code || `EMP${e.id}`,
      name: `${e.first_name || ""} ${e.last_name || ""}`.trim(),
      dept: e.department_name || "General",
      role: e.designation || "Staff Member",
      contract: hasContract ? "Active" : "No Contract",
      salary: "₹ " + wageNum.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
      eligibility: hasContract ? "Eligible" : "Needs Contract",
    };
  });

  const uniqueDepts = ["All Departments", ...Array.from(new Set(formattedEmployeesList.map((e) => e.dept).filter(Boolean)))];

  const filteredEmployees = formattedEmployeesList.filter((e) => {
    if (selectedDept !== "All Departments" && e.dept !== selectedDept) return false;
    if (contractFilter !== "All Status" && e.contract !== contractFilter) return false;
    const q = searchTerm.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.code.toLowerCase().includes(q) ||
      e.role.toLowerCase().includes(q)
    );
  });

  const handleFinishCreate = async () => {
    try {
      setSubmitting(true);
      const chosenPeriod = monthOptions.find((m) => m.label === selectedPeriod) || monthOptions[0];

      // Selected employee DB IDs
      const selectedDbIds = formattedEmployeesList
        .filter((e) => selectedEmployees.includes(e.code))
        .map((e) => e.dbId);

      if (selectedDbIds.length === 0) {
        alert("Please select at least one employee for this payrun.");
        setSubmitting(false);
        return;
      }

      // 1. Create Payrun
      const structId = parseInt(selectedStructureId, 10) || 1;
      const newPayrun = await payrollApi.createPayrun({
        salary_structure_id: structId,
        period_start: chosenPeriod.start,
        period_end: chosenPeriod.end,
        month: chosenPeriod.month,
        year: chosenPeriod.year,
        employee_ids: selectedDbIds,
      });

      // 2. Compute payrun immediately so employee payslips and totals populate (never show ₹0.00)
      await payrollApi.computePayrun(newPayrun.id, selectedDbIds);

      // Fetch fresh payrun record in Computed status
      const computedRun = await payrollApi.getPayrunById(newPayrun.id);

      if (onComplete) {
        onComplete(computedRun || newPayrun);
      }
    } catch (err) {
      alert("Failed to create payrun: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mgr-content-body">
      {/* Page Header */}
      <div className="mgr-page-header">
        <div>
          <h1 className="mgr-page-title">Create Payrun</h1>
          <p className="mgr-page-subtitle">
            Configure payroll batch parameters and select eligible employees synchronized with database
          </p>
        </div>
      </div>

      {/* 2-Step Progress Indicator */}
      <div className="mgr-stepper" style={{ maxWidth: "600px", margin: "0 auto 24px auto" }}>
        <div className={`mgr-step ${currentStep === 1 ? "active" : "completed"}`}>
          <div className="mgr-step-num">{currentStep > 1 ? "✓" : "1"}</div>
          <span>1. Payroll Setup</span>
        </div>
        <div className="mgr-step-divider" />
        <div className={`mgr-step ${currentStep === 2 ? "active" : ""}`}>
          <div className="mgr-step-num">2</div>
          <span>2. Employee Selection</span>
        </div>
      </div>

      {loading && (
        <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
          Loading live salary structures and employees from database...
        </div>
      )}

      {/* STEP 1: Payroll Setup Form */}
      {!loading && currentStep === 1 && (
        <div className="mgr-section-card" style={{ maxWidth: "720px", margin: "0 auto" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--mgr-border)" }}>
            <h3 style={{ margin: 0, fontSize: "1.08rem", fontWeight: 700, color: "var(--mgr-text-dark)" }}>
              Step 1: Batch Configuration
            </h3>
            <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
              Define salary structure and pay period across 36 available calendar months
            </span>
          </div>

          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "22px" }}>
            {/* Salary Structure Selector */}
            <div className="mgr-form-group">
              <label className="mgr-label">
                Salary Structure <span className="req">*</span>
              </label>
              <select
                className="mgr-select"
                value={selectedStructureId}
                onChange={(e) => setSelectedStructureId(Number(e.target.value))}
              >
                {structures.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.type}) — {st.code || `SS00${st.id}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Pay Period Selector with 36 Months */}
            <div className="mgr-form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <label className="mgr-label" style={{ margin: 0 }}>
                  Pay Period ({monthOptions.length} Months Available) <span className="req">*</span>
                </label>

                {/* Quick Year Filter Pills */}
                <div className="mgr-period-pills">
                  {["All", "2026", "2025", "2027"].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      className={`mgr-period-pill ${yearFilter === yr ? "active" : ""}`}
                      onClick={() => setYearFilter(yr)}
                    >
                      {yr === "All" ? `All (${monthOptions.length})` : yr}
                    </button>
                  ))}
                </div>
              </div>

              <select
                className="mgr-select"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                {yearFilter === "All" ? (
                  <>
                    <optgroup label="📅 2026 (Active Operational Year)">
                      {monthOptions
                        .filter((m) => m.year === "2026")
                        .map((opt) => (
                          <option key={opt.label} value={opt.label}>
                            {opt.label} ({opt.start} – {opt.end})
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="📅 2025 (Historical Records)">
                      {monthOptions
                        .filter((m) => m.year === "2025")
                        .map((opt) => (
                          <option key={opt.label} value={opt.label}>
                            {opt.label} ({opt.start} – {opt.end})
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="📅 2027 (Future Projections)">
                      {monthOptions
                        .filter((m) => m.year === "2027")
                        .map((opt) => (
                          <option key={opt.label} value={opt.label}>
                            {opt.label} ({opt.start} – {opt.end})
                          </option>
                        ))}
                    </optgroup>
                  </>
                ) : (
                  visibleMonthOptions.map((opt) => (
                    <option key={opt.label} value={opt.label}>
                      {opt.label} ({opt.start} – {opt.end})
                    </option>
                  ))
                )}
              </select>

              {/* Period Metadata Preview Card */}
              {activePeriodOpt && (
                <div className="mgr-period-preview-card">
                  <div className="mgr-preview-item">
                    <span className="mgr-preview-label">Selected Period</span>
                    <span className="mgr-preview-val">{activePeriodOpt.label}</span>
                  </div>
                  <div className="mgr-preview-item">
                    <span className="mgr-preview-label">Date Window</span>
                    <span className="mgr-preview-val">{activePeriodOpt.start} → {activePeriodOpt.end}</span>
                  </div>
                  <div className="mgr-preview-item">
                    <span className="mgr-preview-label">Duration</span>
                    <span className="mgr-preview-val">{activePeriodOpt.daysInMonth} Calendar Days</span>
                  </div>
                </div>
              )}
            </div>

            {/* Department Filter */}
            <div className="mgr-form-group">
              <label className="mgr-label">Filter Department</label>
              <select
                className="mgr-select"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                {uniqueDepts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Summary Notice */}
            <div
              style={{
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "14px 18px",
                fontSize: "0.83rem",
                color: "#475569",
                lineHeight: 1.45,
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>ℹ️</span>
              <div>
                <strong style={{ color: "#1e293b" }}>Synchronized Database Calculation:</strong> Selected employees with active contracts will have salary rules evaluated dynamically against their base contract wage in sequence order.
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div
            style={{
              padding: "18px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid var(--mgr-border)",
              backgroundColor: "#fafafa",
              borderRadius: "0 0 10px 10px",
            }}
          >
            <button
              type="button"
              className="mgr-btn-secondary"
              onClick={onBack}
            >
              Cancel
            </button>
            <button
              type="button"
              className="mgr-btn-primary"
              onClick={() => setCurrentStep(2)}
            >
              Continue to Employee Selection →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Employee Selection Checklist */}
      {!loading && currentStep === 2 && (
        <div className="mgr-section-card">
          {/* Header & Filter Controls */}
          <div
            style={{
              padding: "18px 20px",
              borderBottom: "1px solid var(--mgr-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700 }}>
                Step 2: Select Employees ({selectedEmployees.length} selected)
              </h3>
              <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                Select eligible employees to include in {selectedPeriod} payrun
              </span>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="mgr-btn-secondary"
                style={{ padding: "6px 12px", fontSize: "0.8rem", fontWeight: 600 }}
                onClick={() => setSelectedEmployees([])}
                title="Deselect all employees"
              >
                Clear / Deselect All
              </button>

              <button
                type="button"
                className="mgr-btn-secondary"
                style={{ padding: "6px 12px", fontSize: "0.8rem", fontWeight: 600, borderColor: "var(--mgr-plum-primary)", color: "var(--mgr-plum-primary)" }}
                onClick={() => {
                  const first5 = filteredEmployees.slice(0, 5).map((e) => e.code);
                  setSelectedEmployees(first5);
                }}
                title="Select exactly the first 5 employees"
              >
                ⚡ Select First 5
              </button>

              <div className="mgr-input-search-wrapper" style={{ width: "200px" }}>
                <span>🔍</span>
                <input
                  type="text"
                  placeholder="Search name, code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="mgr-btn-secondary"
                value={contractFilter}
                onChange={(e) => setContractFilter(e.target.value)}
                style={{ padding: "6px 12px" }}
              >
                <option value="All Status">All Contracts</option>
                <option value="Active">Active Contract</option>
                <option value="No Contract">No Contract</option>
              </select>
            </div>
          </div>

          {/* Employee Checklist Table */}
          <div className="mgr-table-container">
            <table className="mgr-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>
                    <input
                      type="checkbox"
                      checked={
                        filteredEmployees.length > 0 &&
                        filteredEmployees.every((e) => selectedEmployees.includes(e.code))
                      }
                      onChange={() => {
                        const allFilteredCodes = filteredEmployees.map((e) => e.code);
                        const allSelected = allFilteredCodes.every((c) => selectedEmployees.includes(c));
                        if (allSelected) {
                          setSelectedEmployees((prev) => prev.filter((c) => !allFilteredCodes.includes(c)));
                        } else {
                          setSelectedEmployees((prev) => Array.from(new Set([...prev, ...allFilteredCodes])));
                        }
                      }}
                    />
                  </th>
                  <th>Employee Code</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Job Position</th>
                  <th>Contract</th>
                  <th style={{ textAlign: "right" }}>Base Wage</th>
                  <th>Eligibility</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((e) => (
                  <tr key={e.code}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(e.code)}
                        onChange={() => toggleSelectEmp(e.code)}
                      />
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      <code>{e.code}</code>
                    </td>
                    <td style={{ fontWeight: 600, color: "#111827" }}>{e.name}</td>
                    <td>{e.dept}</td>
                    <td style={{ color: "#4b5563" }}>{e.role}</td>
                    <td>
                      <span
                        className={`mgr-badge ${
                          e.contract === "Active" ? "mgr-badge-green" : "mgr-badge-red"
                        }`}
                      >
                        {e.contract}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "#111827" }}>
                      {e.salary}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: "0.74rem",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: "4px",
                          backgroundColor: e.eligibility === "Eligible" ? "#e6f7ef" : "#fee2e2",
                          color: e.eligibility === "Eligible" ? "#059669" : "#dc2626",
                        }}
                      >
                        {e.eligibility}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "#9ca3af" }}>
                      No employees match the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Sticky Bottom Action Area */}
          <div
            style={{
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #f1f5f9",
              backgroundColor: "#fafafa",
              borderRadius: "0 0 8px 8px",
            }}
          >
            <button
              type="button"
              className="mgr-btn-secondary"
              onClick={() => setCurrentStep(1)}
              disabled={submitting}
            >
              ← Back
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "0.82rem", color: "#6b7280" }}>
                <strong>{selectedEmployees.length}</strong> employees queued for batch creation
              </span>
              <button
                type="button"
                className="mgr-btn-primary"
                onClick={handleFinishCreate}
                disabled={submitting || selectedEmployees.length === 0}
              >
                {submitting
                  ? "Creating & Computing..."
                  : `Create Payrun (${selectedEmployees.length}) ✓`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePayCycleWizardView;
