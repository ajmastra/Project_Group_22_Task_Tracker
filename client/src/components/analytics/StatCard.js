import React from "react";

export default function StatCard({ title, value, icon, color, subtitle }) {
  return (
    <div className="stat-card">
      <div className="stat-card-content">
        <div className="stat-card-info">
          <h3 className="stat-card-title">{title}</h3>
          <div className="stat-card-value" style={{ color }}>
            {value}
          </div>
          {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
        </div>
        <div className="stat-card-icon" style={{ backgroundColor: `${color}20` }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

