import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Copy,
  ExternalLink,
  Flag,
  MapPin,
  MessageSquare,
  Mic,
  RefreshCw,
  Route as RouteIcon,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { api, Complaint, ComplaintStatus } from "@/lib/api";
import { AudioPlayer } from "@/components/AudioPlayer";
import { PageIntro, SectionLabel } from "@/App";

const STAGES: { key: string; label: string; sub: string }[] = [
  { key: "Submitted", label: "01 / Submitted", sub: "Photo & AI verified" },
  { key: "Routed", label: "02 / Routed", sub: "Dispatched to BBMP team" },
  { key: "Resolved", label: "03 / Verified Fixed", sub: "Reporter proof loop" },
];

function getStageIndex(status: ComplaintStatus): number {
  if (status === "Submitted") return 0;
  if (status === "Routed") return 1;
  if (status === "Needs Review" || status === "Resolved" || status === "Disputed") return 2;
  return 0;
}

const statusBadgeClasses: Record<ComplaintStatus, string> = {
  Submitted: "status-submitted",
  Routed: "status-routed",
  "Needs Review": "status-review",
  Resolved: "status-resolved",
  Disputed: "status-disputed",
};

export default function Tracking() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialQuery = searchParams.get("report") || "NF-2026-0919-027";

  const [searchId, setSearchId] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const fetchReport = (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError("");
    api.getComplaint(id.trim())
      .then((res) => {
        if (!res) {
          setError(`No report found matching "${id}". Check the ID on your receipt.`);
          setComplaint(null);
        } else {
          setComplaint(res);
          // Update URL without reload
          window.history.replaceState(null, "", `/track?report=${encodeURIComponent(res.trackingId)}`);
        }
      })
      .catch(() => {
        setError("Could not retrieve report. Check your network connection.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (activeQuery) {
      fetchReport(activeQuery);
    }
  }, [activeQuery]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      setActiveQuery(searchId.trim());
    }
  };

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!complaint || !commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const newComment = await api.addComment(complaint.id, commentText.trim());
      setComplaint({
        ...complaint,
        comments: [...(complaint.comments || []), newComment],
      });
      setCommentText("");
      toast.success("Feedback added", {
        description: "Your update is now part of the civic audit trail.",
      });
    } catch {
      toast.error("Failed to add comment. Please try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = complaint
    ? `Track NammaFix issue ${complaint.trackingId}: ${complaint.title} (${complaint.ward}) · Status: ${complaint.status}`
    : "Track my NammaFix report";

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "NammaFix Report Status",
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    toast.success("Tracking link copied", {
      description: "Paste it into any message or civic forum.",
    });
  };

  const activeStage = complaint ? getStageIndex(complaint.status) : 0;

  return (
    <div className="narrow-page tracking-page">
      <PageIntro eyebrow="Public civic trail" title="Track report." backHref="/dashboard">
        Follow your report from initial evidence capture to ward assignment and final verification.
      </PageIntro>

      {/* Demo Dataset Disclosure Banner */}
      <div
        style={{
          background: "rgba(16, 185, 129, 0.08)",
          border: "1px solid rgba(16, 185, 129, 0.25)",
          borderRadius: "10px",
          padding: "10px 14px",
          fontSize: "12px",
          color: "#134e40",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "20px",
          lineHeight: "1.4",
        }}
      >
        <span style={{ fontSize: "14px" }}>ℹ️</span>
        <span>
          <strong>Estimated BBMP SLA (demo dataset):</strong> Displaying interactive civic trail over local database records. Production deployment connects to live municipal dispatch feeds.
        </span>
      </div>

      {/* Search Bar */}
      <div className="paper-card" style={{ padding: "18px 20px", marginBottom: "20px" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            className="text-field"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter tracking ID (e.g. NF-2026-0919-027 or cmp-027)"
            style={{ flex: 1, padding: "10px 14px", fontSize: "13px" }}
          />
          <button
            type="submit"
            className="primary-button"
            style={{ padding: "0 18px", height: "42px" }}
            disabled={loading}
          >
            {loading ? <RefreshCw size={15} className="animate-spin" /> : <Search size={15} />}
            <span>Track</span>
          </button>
        </form>

        {/* Quick Sample Chips */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#62877c" }}>Quick demo lookup:</span>
          {[
            { label: "NF-2026-0919-027 (Indiranagar Waste)", id: "NF-2026-0919-027" },
            { label: "NF-2026-0919-026 (Koramangala Pothole)", id: "NF-2026-0919-026" },
            { label: "NF-2026-0918-025 (HSR Footpath)", id: "NF-2026-0918-025" },
          ].map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => {
                setSearchId(sample.id);
                setActiveQuery(sample.id);
              }}
              style={{
                fontSize: "10.5px",
                padding: "3px 8px",
                borderRadius: "6px",
                background: "#f0f7f4",
                border: "1px solid #cce4dc",
                color: "#123730",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="state-panel error-panel" role="alert" style={{ marginBottom: "20px" }}>
          <CircleAlert size={18} />
          <div>
            <strong>Report not found</strong>
            <p>{error}</p>
          </div>
        </div>
      ) : null}

      {complaint && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Header Card */}
          <div className="receipt-card">
            <div className="receipt-top">
              <span className="receipt-label">
                <ShieldCheck size={14} /> Estimated BBMP SLA (demo dataset)
              </span>
              <span className="receipt-date">
                {new Date(complaint.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="receipt-id-row">
              <div>
                <span className="mini-label">TRACKING ID</span>
                <strong className="receipt-id">{complaint.trackingId}</strong>
              </div>
              <span className={`status-badge ${statusBadgeClasses[complaint.status] || "status-submitted"}`}>
                {complaint.status}
              </span>
            </div>

            <div className="receipt-rule" />

            {/* 3-Stage Visual Pipeline */}
            <div style={{ padding: "16px 0 8px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "8px",
                  position: "relative",
                }}
              >
                {STAGES.map((stg, index) => {
                  const isDone = index < activeStage;
                  const isCurrent = index === activeStage;
                  return (
                    <div
                      key={stg.key}
                      style={{
                        background: isCurrent ? "rgba(52, 211, 153, 0.12)" : isDone ? "#f0f7f4" : "#fbfdfc",
                        border: `1.5px solid ${isCurrent ? "#10b981" : isDone ? "#34d399" : "#d8eae3"}`,
                        borderRadius: "10px",
                        padding: "10px 12px",
                        textAlign: "left",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <span
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            background: isCurrent ? "#10b981" : isDone ? "#059669" : "#cadfd7",
                            color: "#fff",
                            display: "grid",
                            placeItems: "center",
                            fontSize: "10px",
                            fontWeight: "800",
                          }}
                        >
                          {isDone ? <CheckCircle2 size={12} /> : index + 1}
                        </span>
                        <strong style={{ fontSize: "11px", color: isCurrent ? "#064e3b" : "#1a3831" }}>
                          {stg.label}
                        </strong>
                      </div>
                      <span style={{ fontSize: "10px", color: "#62877c", display: "block" }}>
                        {stg.sub}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Social Share Strip */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                alignItems: "center",
                paddingTop: "14px",
                borderTop: "1px solid #d4e7e0",
                marginTop: "12px",
              }}
            >
              <button
                type="button"
                className="secondary-button"
                onClick={handleShare}
                style={{ padding: "6px 12px", fontSize: "11px" }}
              >
                <Share2 size={13} /> Share Status
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={handleCopyLink}
                style={{ padding: "6px 12px", fontSize: "11px" }}
              >
                <Copy size={13} /> Copy Link
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  background: "#dcfce7",
                  border: "1px solid #86efac",
                  color: "#15803d",
                  fontSize: "11px",
                  fontWeight: "750",
                  textDecoration: "none",
                }}
              >
                <span>WhatsApp Share</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>

          {/* Issue Details & Evidence */}
          <section className="paper-card" style={{ padding: "20px" }}>
            <SectionLabel>
              <Sparkles size={14} /> Issue Evidence &amp; Routing
            </SectionLabel>

            <div style={{ marginTop: "12px" }}>
              <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "18px", color: "#0f3029", margin: "0 0 6px" }}>
                {complaint.title}
              </h2>
              {complaint.titleKannada && (
                <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#059669", fontStyle: "italic" }}>
                  {complaint.titleKannada}
                </p>
              )}
              <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#476860", lineHeight: "1.5" }}>
                {complaint.caption}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div style={{ background: "#f5f9f7", padding: "12px", borderRadius: "10px", border: "1px solid #d4e7e0" }}>
                  <span style={{ fontSize: "10px", fontWeight: "800", color: "#5c7e75", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
                    <MapPin size={11} /> Ward Location
                  </span>
                  <strong style={{ fontSize: "13px", color: "#11362e", display: "block", marginTop: "4px" }}>
                    {complaint.ward}
                  </strong>
                  <span style={{ fontSize: "11px", color: "#62877c" }}>{complaint.location}</span>
                  <div style={{ marginTop: "6px" }}>
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${complaint.coordinates.lat}&mlon=${complaint.coordinates.lng}#map=16/${complaint.coordinates.lat}/${complaint.coordinates.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: "11px", color: "#0b756d", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      <span>View on map</span> <ExternalLink size={10} />
                    </a>
                  </div>
                </div>

                <div style={{ background: "#f5f9f7", padding: "12px", borderRadius: "10px", border: "1px solid #d4e7e0" }}>
                  <span style={{ fontSize: "10px", fontWeight: "800", color: "#5c7e75", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Flag size={11} /> Department
                  </span>
                  <strong style={{ fontSize: "13px", color: "#11362e", display: "block", marginTop: "4px" }}>
                    {complaint.department}
                  </strong>
                  <span style={{ fontSize: "11px", color: "#0b756d", fontWeight: "700" }}>
                    {(complaint.confidence * 100).toFixed(0)}% AI Verification Score
                  </span>
                </div>
              </div>

              {/* Photos */}
              <div style={{ display: "grid", gridTemplateColumns: complaint.afterPhoto ? "1fr 1fr" : "1fr", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <span style={{ fontSize: "10px", fontWeight: "800", color: "#5c7e75", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                    Reported Photo Evidence
                  </span>
                  <img
                    src={complaint.photo}
                    alt="Reported Issue"
                    style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "10px", border: "1px solid #d4e7e0" }}
                  />
                </div>
                {complaint.afterPhoto && (
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: "800", color: "#059669", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                      Verified Resolution Proof
                    </span>
                    <img
                      src={complaint.afterPhoto}
                      alt="Resolution Proof"
                      style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "10px", border: "1px solid #10b981" }}
                    />
                  </div>
                )}
              </div>

              {/* Audio Note Widget */}
              {complaint.audioUrl && (
                <div style={{ marginTop: "12px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "750", color: "#52746d", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "5px", marginBottom: "6px" }}>
                    <Mic size={13} /> Citizen Voice Note Evidence
                  </span>
                  <AudioPlayer
                    url={complaint.audioUrl}
                    duration={complaint.audioDuration || 8}
                    transcript={complaint.audioTranscript}
                    transcriptKannada={complaint.audioTranscriptKannada}
                    title="Original Voice Recording"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Citizen Feedback & Updates Thread */}
          <section className="paper-card" style={{ padding: "20px" }}>
            <SectionLabel>
              <MessageSquare size={14} /> Citizen Updates &amp; Feedback ({complaint.comments?.length || 0})
            </SectionLabel>

            <form onSubmit={handleAddComment} style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add on-the-ground update or feedback (e.g. 'Garbage truck visited at 10 AM', 'Pothole patch holding up')..."
                className="text-field text-area"
                rows={2}
                style={{ fontSize: "12px" }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={isSubmittingComment || !commentText.trim()}
                  style={{ padding: "6px 16px", fontSize: "12px" }}
                >
                  {isSubmittingComment ? "Posting…" : "Post Citizen Update"}
                </button>
              </div>
            </form>

            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {complaint.comments && complaint.comments.length > 0 ? (
                complaint.comments
                  .slice()
                  .reverse()
                  .map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: "#f7fbf9",
                        border: "1px solid #d4e7e0",
                        borderRadius: "10px",
                        padding: "10px 14px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <strong style={{ fontSize: "11px", color: "#11362e" }}>
                          {item.author || "Citizen Contributor"}
                        </strong>
                        <span style={{ fontSize: "10px", color: "#7a9b91", fontFamily: "monospace" }}>
                          {new Date(item.createdAt).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: "12px", color: "#2d4e46", lineHeight: "1.45" }}>
                        {item.text}
                      </p>
                    </div>
                  ))
              ) : (
                <div style={{ textAlign: "center", padding: "16px 0", color: "#72968c", fontSize: "12px" }}>
                  No citizen comments yet. Be the first to post an update!
                </div>
              )}
            </div>
          </section>

          {/* Quick Actions */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "space-between", flexWrap: "wrap", alignItems: "center" }}>
            <Link href={`/resolution/${complaint.id}`} className="primary-button">
              <span>Verify resolution proof</span>
              <ArrowUpRight size={15} />
            </Link>
            <Link href={`/complaint/${complaint.id}`} className="secondary-button">
              View official receipt
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
