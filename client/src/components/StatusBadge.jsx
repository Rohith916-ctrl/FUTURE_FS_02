import React from "react";

const labels = {
  new: "New",
  contacted: "Contacted",
  converted: "Converted"
};

export default function StatusBadge({ status }) {
  return <span className={`status-badge status-${status}`}>{labels[status] || status}</span>;
}