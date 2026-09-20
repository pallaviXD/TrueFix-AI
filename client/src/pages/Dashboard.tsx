import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, AudioLines, CheckCircle2, CircleAlert, Download, Filter, Route as RouteIcon, Search, Trash2, TrendingUp, Wrench } from "lucide-react";
import { Link } from "wouter";
import { api, Complaint, ComplaintStatus } from "@/lib/api";
import { EmptyNotice, ErrorNotice, LoadingSteps, PageIntro, SectionLabel } from "@/App";
import { TrendCharts } from "@/components/TrendCharts";

const statusMeta: Record<ComplaintStatus, { className: string; icon: typeof CheckCircle2 }> = {
  Submitted: { className: "status-submitted", icon: CircleAlert },
  Routed: { className: "status-routed", icon: RouteIcon },
  "Needs Review": { className: "status-review", icon: CircleAlert },
  Resolved: { className: "status-resolved", icon: CheckCircle2 },
  Disputed: { className: "status-disputed", icon: CircleAlert },
};

const categoryMeta = {
  garbage: { label: "Garbage", icon: Trash2, tone: "category-garbage" },
  pothole: { label: "Pothole", icon: Wrench, tone: "category-pothole" },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function csvEscape(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function exportReportsCsv(reports: Complaint[]) {
  const headers = [
    "Tracking ID",
    "Complaint ID",
    "Category",
    "Status",
    "Title",
    "Ward",
    "Department",
    "Location",
    "Latitude",
    "Longitude",
    "Confidence",
    "Created Date",
    "Has Voice Note",
  ];
  const rows = reports.map((c) => [
    c.trackingId,
    c.id,
    c.category,
    c.status,
    c.title,
    c.ward,
    c.department,
    c.location,
    c.coordinates.lat,
    c.coordinates.lng,
    `${(c.confidence * 100).toFixed(0)}%`,
    c.createdAt,
    c.audioUrl ? "Yes" : "No",
  ]);

  const csvContent = [headers, ...rows]
    .map((r) => r.map(csvEscape).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `nammafix-civic-reports-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function getCategoryMeta(cat: string) {
  if (cat === "pothole" || /pothole|road|crater/i.test(cat || "")) {
    return categoryMeta.pothole;
  }
  return categoryMeta.garbage;
}

function getStatusMeta(status: string) {
  if (statusMeta[status as ComplaintStatus]) {
    return statusMeta[status as ComplaintStatus];
  }
  const s = String(status || "").toLowerCase();
  if (s.includes("review")) return statusMeta["Needs Review"];
  if (s.includes("rout") || s.includes("progress")) return statusMeta.Routed;
  if (s.includes("resolv") || s.includes("fix")) return statusMeta.Resolved;
  if (s.includes("disput")) return statusMeta.Disputed;
  return statusMeta.Submitted;
}

function ComplaintCard({ complaint }: { complaint: Complaint }) {
  const category = getCategoryMeta(complaint.category);
  const status = getStatusMeta(complaint.status);
  const CategoryIcon = category.icon;
  const StatusIcon = status.icon;
  return (
    <Link href={`/complaint/${complaint.id}`} className="complaint-card">
      <div className="complaint-thumb-wrap">
        <img className="complaint-thumb" src={complaint.photo} alt="" />
        <span className={`category-icon ${category.tone}`}><CategoryIcon size={15} /></span>
      </div>
      <div className="complaint-main">
        <div className="complaint-topline"><span className="category-name">{category.label}</span><span className="complaint-date">{formatDate(complaint.createdAt)}</span></div>
        <h3>{complaint.title}</h3>
        <p className="complaint-meta">{complaint.ward} <span>·</span> {complaint.department.replace("BBMP ", "")}</p>
        <div className="complaint-footer">
          <span className={`status-badge ${status.className}`}><StatusIcon size={12} /> {complaint.status}</span>
          {complaint.audioUrl ? (
            <span className="audio-badge" title="Citizen voice note attached">
              <AudioLines size={11} /> Voice note
            </span>
          ) : null}
          {complaint.duplicateOf ? <span className="duplicate-flag">Possible duplicate</span> : null}
        </div>
      </div>
      <ArrowUpRight className="card-arrow" size={17} />
    </Link>
  );
}

export default function Dashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filter, setFilter] = useState<"all" | "garbage" | "pothole">("all");
  const [wardFilter, setWardFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCharts, setShowCharts] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadComplaints = () => {
    setLoading(true);
    setError("");
    api.listComplaints().then(setComplaints).catch(() => setError("We couldn’t load your reports. Check your connection and try again.")).finally(() => setLoading(false));
  };

  useEffect(() => { loadComplaints(); }, []);

  const filtered = useMemo(() => {
    return complaints.filter((complaint) => {
      const matchesCategory = filter === "all" || complaint.category === filter;
      const matchesWard = wardFilter === "all" || complaint.ward.includes(wardFilter);
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || complaint.title.toLowerCase().includes(query) || complaint.trackingId.toLowerCase().includes(query) || complaint.location.toLowerCase().includes(query);
      return matchesCategory && matchesWard && matchesSearch;
    });
  }, [complaints, filter, wardFilter, searchQuery]);

  const resolved = complaints.filter((complaint) => complaint.status === "Resolved").length;
  const active = complaints.length - resolved;

  if (loading) {
    return (
      <div className="wide-page loading-page">
        <PageIntro eyebrow="Your civic trail" title="My reports.">
          Every report stays visible from first photo to final proof.
        </PageIntro>
        <div className="paper-card loading-card dashboard-loading"><LoadingSteps steps={["Loading your reports…", "Checking latest status updates…", "Preparing your civic trail…"]} active={1} /></div>
      </div>
    );
  }

  return (
    <div className="wide-page dashboard-page">
      {/* Operational Demonstration Disclosure Banner */}
      <div
        style={{
          background: "rgba(16, 185, 129, 0.08)",
          border: "1px solid rgba(16, 185, 129, 0.25)",
          borderRadius: "12px",
          padding: "10px 16px",
          fontSize: "12px",
          color: "#134e40",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "20px",
          lineHeight: "1.4",
        }}
      >
        <span style={{ fontSize: "15px" }}>ℹ️</span>
        <span>
          <strong>Operational Demonstration View:</strong> Displaying civic reports stored in local SQLite database with Cedar policy enforcement. This environment is an offline prototype and is not connected to the live BBMP Sahaya production backend.
        </span>
      </div>

      {/* Citizen Karma Banner */}
      <div style={{ background: "linear-gradient(135deg, #09201b, #11362e)", border: "1px solid rgba(52, 211, 153, 0.25)", borderRadius: "16px", padding: "18px 24px", color: "#e6f5ef", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.4)", display: "grid", placeItems: "center", fontSize: "20px" }}>
            ⭐
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <strong style={{ fontSize: "16px", color: "#fff" }}>Citizen Karma: 420 Pts</strong>
              <span style={{ fontSize: "10px", fontWeight: "800", background: "rgba(52, 211, 153, 0.2)", color: "#34d399", padding: "2px 8px", borderRadius: "999px", textTransform: "uppercase" }}>
                Rank #12 Bengaluru
              </span>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#9bbdb3" }}>
              Verified Reporter Badge · 3 proof check confirmations on record
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
          <div>
            <span style={{ color: "#7da298", display: "block", fontSize: "10px", textTransform: "uppercase" }}>Authenticity</span>
            <strong style={{ color: "#4ade80", fontSize: "14px" }}>100%</strong>
          </div>
          <div>
            <span style={{ color: "#7da298", display: "block", fontSize: "10px", textTransform: "uppercase" }}>Ward Impact</span>
            <strong style={{ color: "#fbbf24", fontSize: "14px" }}>4 Wards</strong>
          </div>
        </div>
      </div>

      <div className="dashboard-head">
        <PageIntro eyebrow="Your civic trail" title="My reports.">
          Every report stays visible from first photo to final proof.
        </PageIntro>
        <Link href="/upload" className="primary-button header-cta"><span>Report new issue</span><ArrowUpRight size={15} /></Link>
      </div>

      <div className="metric-grid">
        <div className="metric-card metric-main"><span className="metric-label">Total reports</span><strong>{complaints.length.toString().padStart(2, "0")}</strong><span className="metric-foot">Since you joined NammaFix</span></div>
        <div className="metric-card"><span className="metric-label">In progress</span><strong>{active.toString().padStart(2, "0")}</strong><span className="metric-foot"><span className="metric-dot dot-teal" /> Active with civic teams</span></div>
        <div className="metric-card"><span className="metric-label">Verified fixed</span><strong>{resolved.toString().padStart(2, "0")}</strong><span className="metric-foot"><span className="metric-dot dot-sage" /> Photo-checked by you</span></div>
      </div>

      {/* Analytics & Export Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", margin: "20px 0 16px" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            className="secondary-button"
            style={{ padding: "6px 12px", fontSize: "11px" }}
            onClick={() => setShowCharts((prev) => !prev)}
          >
            <TrendingUp size={13} className="text-emerald-500" />
            <span>{showCharts ? "Hide Trends" : "Show Civic Trends"}</span>
          </button>
          <Link href="/track" className="secondary-button" style={{ padding: "6px 12px", fontSize: "11px" }}>
            <Search size={13} />
            <span>Public Tracking</span>
          </Link>
        </div>

        <button
          type="button"
          className="secondary-button"
          style={{ padding: "6px 14px", fontSize: "11px" }}
          onClick={() => exportReportsCsv(filtered)}
          title="Download CSV for BBMP field engineers"
        >
          <Download size={13} className="text-teal-600" />
          <span>Export CSV ({filtered.length})</span>
        </button>
      </div>

      {showCharts && <TrendCharts complaints={complaints} />}

      {error ? <ErrorNotice message={error} /> : null}

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", margin: "24px 0 16px" }}>
        <input
          type="text"
          placeholder="Search by title, tracking ID (e.g. NF-2026), or street…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-field"
          style={{ maxWidth: "360px", padding: "8px 14px", fontSize: "12px" }}
        />

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#627d76" }}>Category:</span>
          <div className="filter-group" role="group" aria-label="Filter reports">
            {(["all", "garbage", "pothole"] as const).map((option) => (
              <button key={option} type="button" className={filter === option ? "filter-button active" : "filter-button"} onClick={() => setFilter(option)}>
                {option === "all" ? "All" : categoryMeta[option].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ward Filter Chips */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center", marginBottom: "20px" }}>
        <span style={{ fontSize: "11px", fontWeight: "700", color: "#627d76", marginRight: "6px" }}>Bengaluru Wards:</span>
        {[
          { label: "All Wards", value: "all" },
          { label: "Ward 151 (Domlur)", value: "151" },
          { label: "Ward 150 (Koramangala)", value: "150" },
          { label: "Ward 154 (Jayanagar)", value: "154" },
          { label: "Ward 147 (HSR Layout)", value: "147" },
          { label: "Ward 149 (BTM)", value: "149" },
        ].map((w) => (
          <button
            key={w.value}
            type="button"
            className={`filter-button ${wardFilter === w.value ? "active" : ""}`}
            style={{ fontSize: "11px", padding: "5px 10px" }}
            onClick={() => setWardFilter(w.value)}
          >
            {w.label}
          </button>
        ))}
      </div>

      {filtered.length ? (
        <div className="complaint-list">
          {filtered.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))}
        </div>
      ) : (
        <EmptyNotice
          title="No reports matching filter"
          message="Try another filter or search term, or capture a new issue for Bengaluru."
          href="/upload"
          action="Report an issue"
        />
      )}
    </div>
  );
}
