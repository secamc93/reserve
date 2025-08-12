"use client";

import React from "react";
import "./DataTable.css";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  width?: string | number;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

export interface DataTableRowAction<T> {
  label: string;
  title?: string;
  icon?: React.ReactNode;
  className?: string;
  onClick: (row: T) => void;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Array<DataTableColumn<T>>;
  rowKey: (row: T) => string | number;
  loading?: boolean;
  emptyState?: React.ReactNode;
  actions?: Array<DataTableRowAction<T>>;
  className?: string;
  headerGradient?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  loading = false,
  emptyState,
  actions = [],
  className = "",
  headerGradient = true,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="datatable-container">
        <div className="datatable-loading">
          <div className="datatable-spinner" />
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <div className="datatable-container">
        <div className="datatable-empty">
          {emptyState || <p>No hay datos para mostrar</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`datatable-container ${className}`}>
      <div className="datatable-scroll">
        <table className="datatable-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`datatable-th ${headerGradient ? "datatable-th-gradient" : ""} ${
                    col.className || ""
                  }`}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
              {actions.length > 0 && (
                <th className={`datatable-th ${headerGradient ? "datatable-th-gradient" : ""}`} style={{ width: 120 }}>
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={rowKey(row)} className="datatable-tr">
                {columns.map((col) => (
                  <td key={col.key} className="datatable-td">
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </td>)
                )}
                {actions.length > 0 && (
                  <td className="datatable-td">
                    <div className="datatable-actions">
                      {actions.map((action, idx) => (
                        <button
                          key={idx}
                          type="button"
                          title={action.title || action.label}
                          className={`datatable-action-btn ${action.className || ""}`}
                          onClick={() => action.onClick(row)}
                        >
                          {action.icon}
                          <span className="sr-only">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable; 