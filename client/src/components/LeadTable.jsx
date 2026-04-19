import React from "react";

const headers = [
  { key: "name", label: "Lead" },
  { key: "company", label: "Company" },
  { key: "email", label: "Email" },
  { key: "source", label: "Source" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Created" }
];

function formatDate(value) {
  return new Date(value).toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default function LeadTable({
  leads,
  sortBy,
  sortOrder,
  onSort,
  onSelectLead,
  onChangeStatus,
  onOpenNotes,
  onCopyEmail,
  onDeleteLead,
  activeActionId
}) {
  return (
    <div className="glass-card table-shell">
      <div className="table-scroll">
        <table className="lead-table">
          <thead>
            <tr>
              {headers.map((header) => {
                const active = sortBy === header.key;

                return (
                  <th key={header.key}>
                    <button type="button" className={`sort-trigger ${active ? "active" : ""}`} onClick={() => onSort(header.key)}>
                      {header.label}
                      <span className="sort-arrow">{active ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}</span>
                    </button>
                  </th>
                );
              })}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead._id} onClick={() => onSelectLead(lead._id)} role="button" tabIndex={0}>
                <td>
                  <div className="lead-cell-main">
                    <strong>{lead.name}</strong>
                    <span>{lead.phone || lead.company || "No extra details"}</span>
                  </div>
                </td>
                <td>{lead.company || "-"}</td>
                <td>{lead.email}</td>
                <td>
                  <span className="source-pill">{lead.source}</span>
                </td>
                <td onClick={(event) => event.stopPropagation()}>
                  <select
                    className="status-select"
                    value={lead.status}
                    disabled={activeActionId === lead._id}
                    onChange={(event) => onChangeStatus(lead._id, event.target.value)}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="converted">Converted</option>
                  </select>
                </td>
                <td>{formatDate(lead.createdAt)}</td>
                <td onClick={(event) => event.stopPropagation()}>
                  <div className="row-actions">
                    <button type="button" className="btn btn-ghost btn-small" onClick={() => onSelectLead(lead._id)}>
                      Details
                    </button>
                    <button type="button" className="btn btn-ghost btn-small" onClick={() => onOpenNotes(lead._id)}>
                      Notes
                    </button>
                    <button type="button" className="btn btn-ghost btn-small" onClick={() => onCopyEmail(lead)}>
                      Copy Email
                    </button>
                    <button type="button" className="btn btn-danger btn-small" onClick={() => onDeleteLead(lead)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}