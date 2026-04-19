import React from "react";

export default function StatCard({ label, value, tone }) {
  return (
    <div className={`stat-card glass-card tone-${tone || "indigo"}`}>
      <p>{label}</p>
      <h2>{value}</h2>
    </div>
  );
}