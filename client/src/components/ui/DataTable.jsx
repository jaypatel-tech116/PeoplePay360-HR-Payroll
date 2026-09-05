import React from "react";
import "./DataTable.css";

/**
 * Reusable Data Table Component
 * @param {string} [title]
 * @param {string} [subtitle]
 * @param {Array<{ key: string, header: string, width?: string, render?: (row: any) => React.ReactNode }>} columns
 * @param {Array<any>} data
 * @param {string} [emptyMessage]
 * @param {React.ReactNode} [actions]
 */
const DataTable = ({
  title,
  subtitle,
  columns = [],
  data = [],
  emptyMessage = "No records found.",
  actions,
}) => {
  return (
    <div className="datatable-card">
      {(title || actions) && (
        <div className="datatable-header">
          <div>
            {title && <h3 className="datatable-title">{title}</h3>}
            {subtitle && <p className="datatable-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="datatable-actions">{actions}</div>}
        </div>
      )}

      <div className="datatable-wrapper">
        <table className="datatable-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, idx) => (
                <tr key={row.id || idx}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="datatable-empty">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
