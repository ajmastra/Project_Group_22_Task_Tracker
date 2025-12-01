import React from "react";

export function TaskCardSkeleton() {
  return (
    <div className="skeleton-task-card">
      <div className="skeleton-line skeleton-title"></div>
      <div className="skeleton-line skeleton-text"></div>
      <div className="skeleton-line skeleton-text-short"></div>
      <div className="skeleton-line skeleton-text-short"></div>
      <div className="skeleton-actions">
        <div className="skeleton-button"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="skeleton-stat-card">
      <div className="skeleton-line skeleton-stat-title"></div>
      <div className="skeleton-line skeleton-stat-value"></div>
      <div className="skeleton-icon"></div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="skeleton-chart">
      <div className="skeleton-line skeleton-chart-title"></div>
      <div className="skeleton-chart-content"></div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="skeleton-comment">
      <div className="skeleton-comment-header">
        <div className="skeleton-avatar"></div>
        <div className="skeleton-comment-info">
          <div className="skeleton-line skeleton-comment-name"></div>
          <div className="skeleton-line skeleton-comment-date"></div>
        </div>
      </div>
      <div className="skeleton-line skeleton-comment-text"></div>
      <div className="skeleton-line skeleton-comment-text-short"></div>
    </div>
  );
}

export default function LoadingSkeleton({ type, count = 1 }) {
  const skeletons = [];
  for (let i = 0; i < count; i++) {
    switch (type) {
      case "task":
        skeletons.push(<TaskCardSkeleton key={i} />);
        break;
      case "stat":
        skeletons.push(<StatCardSkeleton key={i} />);
        break;
      case "chart":
        skeletons.push(<ChartSkeleton key={i} />);
        break;
      case "comment":
        skeletons.push(<CommentSkeleton key={i} />);
        break;
      default:
        skeletons.push(<div key={i} className="skeleton-default">Loading...</div>);
    }
  }
  return <>{skeletons}</>;
}

