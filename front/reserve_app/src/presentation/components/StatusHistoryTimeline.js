// Presentation - StatusHistoryTimeline Component
import React from 'react';
import './StatusHistoryTimeline.css';

const StatusHistoryTimeline = ({ reserva }) => {
  if (!reserva || !reserva.status_history || reserva.status_history.length === 0) {
    return (
      <div className="status-history-empty">
        <span className="empty-icon">📋</span>
        <p>No hay historial de cambios disponible</p>
      </div>
    );
  }

  const formattedHistory = reserva.getFormattedStatusHistory();

  return (
    <div className="status-history-timeline">
      <h4 className="timeline-title">📈 Historial de Estados</h4>
      <div className="timeline-container">
        {formattedHistory.map((change, index) => (
          <div key={change.id} className="timeline-item">
            <div className="timeline-marker">
              <span className="status-icon">{change.status_icon}</span>
              <div className="timeline-line"></div>
            </div>
            <div className="timeline-content">
              <div className="status-change">
                <div className="status-header">
                  <span className="status-name">{change.status_name}</span>
                  <span className="change-date">{change.changed_at_formatted}</span>
                </div>
                <div className="status-details">
                  <span className="status-code">({change.status_code})</span>
                  {change.changed_by_user && (
                    <span className="changed-by">
                      por {change.changed_by_user}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="timeline-summary">
        <span className="summary-text">
          Total de cambios: {formattedHistory.length}
        </span>
      </div>
    </div>
  );
};

export default StatusHistoryTimeline; 