import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";
import LeadTable from "../components/LeadTable";
import Pagination from "../components/Pagination";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";

const defaultPagination = { page: 1, pages: 1, total: 0 };
const defaultStats = { total: 0, new: 0, contacted: 0, converted: 0 };

export default function DashboardPage() {
  const { logout, admin } = useAuth();
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(defaultStats);
  const [pagination, setPagination] = useState(defaultPagination);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [activeActionId, setActiveActionId] = useState(null);
  const [detailsLead, setDetailsLead] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [notesLead, setNotesLead] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [followUpAt, setFollowUpAt] = useState("");
  const [deleteLead, setDeleteLead] = useState(null);

  const loadLeads = async (pageOverride = page) => {
    const query = new URLSearchParams({
      page: String(pageOverride),
      limit: "10",
      search,
      status: statusFilter,
      sortBy,
      sortOrder
    });

    const response = await apiRequest(`/api/leads?${query.toString()}`);
    setLeads(response.leads || []);
    setStats(response.stats || defaultStats);
    setPagination(response.pagination || defaultPagination);
    return response;
  };

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);

      try {
        if (active) {
          await loadLeads(page);
        }
      } catch (error) {
        if (active) {
          toast.error(error.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [page, search, statusFilter, sortBy, sortOrder]);

  const openLeadDetails = async (leadId) => {
    setDetailsLoading(true);
    setDetailsLead(null);

    try {
      const response = await apiRequest(`/api/leads/${leadId}`);
      setDetailsLead(response);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const openNotesModal = (leadId) => {
    const lead = leads.find((entry) => entry._id === leadId) || detailsLead;
    if (!lead) {
      toast.error("Lead not found");
      return;
    }

    setNotesLead(lead);
    setNoteText("");
    setFollowUpAt(lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).toISOString().slice(0, 16) : "");
  };

  const closeDetails = () => {
    setDetailsLead(null);
    setDetailsLoading(false);
  };

  const closeNotes = () => {
    setNotesLead(null);
    setNoteText("");
    setFollowUpAt("");
  };

  const handleSort = (field) => {
    setPage(1);
    if (field === sortBy) {
      setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(field);
    setSortOrder(field === "createdAt" ? "desc" : "asc");
  };

  const handleStatusChange = async (leadId, status) => {
    setActiveActionId(leadId);

    try {
      const updatedLead = await apiRequest(`/api/leads/${leadId}`, {
        method: "PUT",
        body: { status }
      });

      toast.success("Lead status updated");
      if (detailsLead?._id === leadId) {
        setDetailsLead(updatedLead);
      }
      if (notesLead?._id === leadId) {
        setNotesLead(updatedLead);
      }
      await loadLeads(page);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setActiveActionId(null);
    }
  };

  const handleSaveNote = async (event) => {
    event.preventDefault();

    if (!notesLead) {
      toast.error("Lead not found");
      return;
    }

    if (!noteText.trim() && !followUpAt) {
      toast.error("Add a note or set a follow-up date");
      return;
    }

    setActiveActionId(notesLead._id);

    try {
      const nextFollowUpAt = followUpAt ? new Date(followUpAt).toISOString() : "";
      const updatedLead = await apiRequest(`/api/leads/${notesLead._id}`, {
        method: "PUT",
        body: {
          noteText: noteText.trim() || undefined,
          nextFollowUpAt: nextFollowUpAt || undefined
        }
      });

      toast.success("Note added");
      setNotesLead(updatedLead);
      if (detailsLead?._id === updatedLead._id) {
        setDetailsLead(updatedLead);
      }
      closeNotes();
      await loadLeads(page);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setActiveActionId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteLead) {
      return;
    }

    setActiveActionId(deleteLead._id);

    try {
      await apiRequest(`/api/leads/${deleteLead._id}`, {
        method: "DELETE"
      });

      toast.success("Lead deleted");
      if (detailsLead?._id === deleteLead._id) {
        closeDetails();
      }
      if (notesLead?._id === deleteLead._id) {
        closeNotes();
      }

      const response = await loadLeads(page);
      if (response.leads.length === 0 && page > 1) {
        setPage(page - 1);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleteLead(null);
      setActiveActionId(null);
    }
  };

  const summaryCards = [
    { label: "Total Leads", value: stats.total, tone: "indigo" },
    { label: "New Leads", value: stats.new, tone: "blue" },
    { label: "Contacted Leads", value: stats.contacted, tone: "amber" },
    { label: "Converted Leads", value: stats.converted, tone: "emerald" }
  ];

  const handleCopyEmail = async (lead) => {
    try {
      await navigator.clipboard.writeText(lead.email);
      toast.success(`Copied ${lead.email}`);
    } catch (error) {
      toast.error("Could not copy email");
    }
  };

  return (
    <main className="dashboard-page">
      <div className="dashboard-backdrop" />
      <header className="topbar glass-card">
        <div>
          <p className="eyebrow">Admin dashboard</p>
          <h1>Welcome back, {admin?.email || "Admin"}</h1>
          <p className="subtle-copy">Track website leads, follow-ups, and conversions in one place.</p>
        </div>
        <div className="topbar-actions">
          <div className="user-chip">
            <span className="user-dot" />
            <div>
              <strong>{admin?.email}</strong>
              <span>JWT authenticated</span>
            </div>
          </div>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <section className="stats-grid">
        {summaryCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <section className="dashboard-panel glass-card">
        <div className="panel-toolbar">
          <div className="search-block">
            <label htmlFor="lead-search">Search</label>
            <input
              id="lead-search"
              type="search"
              placeholder="Search by name or email"
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
            />
          </div>

          <div className="toolbar-group">
            <label htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) => {
                setPage(1);
                setStatusFilter(event.target.value);
              }}
            >
              <option value="all">All leads</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
            </select>
          </div>

          <div className="toolbar-group">
            <label htmlFor="sort-mode">Sort</label>
            <select
              id="sort-mode"
              value={`${sortBy}:${sortOrder}`}
              onChange={(event) => {
                const [nextSortBy, nextSortOrder] = event.target.value.split(":");
                setPage(1);
                setSortBy(nextSortBy);
                setSortOrder(nextSortOrder);
              }}
            >
              <option value="createdAt:desc">Newest first</option>
              <option value="createdAt:asc">Oldest first</option>
              <option value="name:asc">Name A-Z</option>
              <option value="name:desc">Name Z-A</option>
              <option value="email:asc">Email A-Z</option>
              <option value="status:asc">Status A-Z</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-panel">
            <Spinner label="Loading leads..." />
          </div>
        ) : leads.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◎</div>
            <h3>No leads match your filters</h3>
            <p>Try clearing the search or switching the status filter.</p>
          </div>
        ) : (
          <LeadTable
            leads={leads}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onSelectLead={openLeadDetails}
            onChangeStatus={handleStatusChange}
            onOpenNotes={openNotesModal}
            onCopyEmail={handleCopyEmail}
            onDeleteLead={setDeleteLead}
            activeActionId={activeActionId}
          />
        )}

        <Pagination page={pagination.page} totalPages={pagination.pages} onPageChange={setPage} />
      </section>

      <Modal
        isOpen={Boolean(detailsLead) || detailsLoading}
        title="Lead Details"
        onClose={closeDetails}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={closeDetails}>
              Close
            </button>
            {detailsLead ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setNotesLead(detailsLead);
                  setNoteText("");
                  setDetailsLead(null);
                }}
              >
                Add Note
              </button>
            ) : null}
          </>
        }
      >
        {detailsLoading ? (
          <Spinner label="Loading lead details..." />
        ) : detailsLead ? (
          <>
            <div className="detail-grid">
              <div className="detail-card">
                <span>Name</span>
                <strong>{detailsLead.name}</strong>
              </div>
              <div className="detail-card">
                <span>Company</span>
                <strong>{detailsLead.company || "Not provided"}</strong>
              </div>
              <div className="detail-card">
                <span>Email</span>
                <strong>{detailsLead.email}</strong>
              </div>
              <div className="detail-card">
                <span>Phone</span>
                <strong>{detailsLead.phone || "Not provided"}</strong>
              </div>
              <div className="detail-card">
                <span>Source</span>
                <strong>{detailsLead.source}</strong>
              </div>
              <div className="detail-card">
                <span>Status</span>
                <StatusBadge status={detailsLead.status} />
              </div>
              <div className="detail-card">
                <span>Next follow-up</span>
                <strong>{detailsLead.nextFollowUpAt ? new Date(detailsLead.nextFollowUpAt).toLocaleString() : "Not scheduled"}</strong>
              </div>
              <div className="detail-card">
                <span>Created</span>
                <strong>{new Date(detailsLead.createdAt).toLocaleString()}</strong>
              </div>
            </div>
            <div className="notes-panel">
              <div className="notes-header">
                <h4>Follow-up notes</h4>
                <span>{detailsLead.notes?.length || 0} note(s)</span>
              </div>
              {detailsLead.notes?.length ? (
                <ul className="notes-list">
                  {detailsLead.notes.map((note, index) => (
                    <li key={`${note.createdAt}-${index}`}>
                      <p>{note.text}</p>
                      <span>{new Date(note.createdAt).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="subtle-copy">No notes recorded yet.</p>
              )}
            </div>
          </>
        ) : null}
      </Modal>

      <Modal
        isOpen={Boolean(notesLead)}
        title={`Add Note${notesLead ? ` - ${notesLead.name}` : ""}`}
        onClose={closeNotes}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={closeNotes}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSaveNote} disabled={activeActionId === notesLead?._id}>
              Save Note
            </button>
          </>
        }
      >
        <form className="notes-form" onSubmit={handleSaveNote}>
          <label>
            Follow-up note
            <textarea
              rows="5"
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              placeholder="Write the next follow-up step, outcome, or call summary..."
            />
          </label>
          <label>
            Next follow-up date and time
            <input
              type="datetime-local"
              value={followUpAt}
              onChange={(event) => setFollowUpAt(event.target.value)}
            />
          </label>
          {notesLead ? <p className="subtle-copy">Updating lead status or notes happens instantly after save.</p> : null}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteLead)}
        title="Delete lead"
        message={`Delete ${deleteLead?.name || "this lead"}? This action cannot be undone.`}
        confirmLabel="Delete lead"
        onCancel={() => setDeleteLead(null)}
        onConfirm={handleDelete}
      />
    </main>
  );
}