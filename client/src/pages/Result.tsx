import { useEffect, useState } from "react";
import { ArrowRight, Check, CheckCircle2, ChevronRight, Copy, Flag, MapPin, Mic, Route, ShieldCheck, Sparkles, Trash2, Wrench } from "lucide-react";
import { Link, useRoute } from "wouter";
import { api, Complaint } from "@/lib/api";
import { ErrorNotice, LoadingSteps, PageIntro, SectionLabel, TrustNote } from "@/App";
import { AudioPlayer } from "@/components/AudioPlayer";

const categoryInfo = {
  garbage: { label: "Garbage", icon: Trash2 },
  pothole: { label: "Pothole", icon: Wrench },
};

export default function Result() {
  const [, params] = useRoute("/complaint/:id");
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params?.id) return;
    setLoading(true);
    api.getComplaint(params.id).then((result) => {
      if (!result) setError("That report no longer exists in this demo.");
      else setComplaint(result);
    }).catch(() => setError("We couldn’t load this report. Try opening it again from My reports.")).finally(() => setLoading(false));
  }, [params?.id]);

  const copyTrackingId = async () => {
    if (!complaint) return;
    await navigator.clipboard?.writeText(complaint.trackingId);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  if (loading) {
    return <div className="narrow-page loading-page"><PageIntro eyebrow="Complaint receipt" title="Preparing your report.">Fetching the AI draft, routing details, and tracking ID.</PageIntro><div className="paper-card loading-card"><LoadingSteps steps={["Loading complaint…", "Checking routing details…", "Preparing receipt…"]} active={1} /></div></div>;
  }
  if (error || !complaint) return <div className="narrow-page"><PageIntro eyebrow="Complaint receipt" title="We hit a small snag." /><ErrorNotice message={error || "This complaint could not be found."} /><Link href="/dashboard" className="secondary-button">Back to my reports</Link></div>;

  const info = categoryInfo[complaint.category];
  const CategoryIcon = info.icon;
  const confidence = Math.round(complaint.confidence * 100);
  const isResolved = complaint.status === "Resolved";

  return (
    <div className="narrow-page result-page">
      <PageIntro eyebrow={isResolved ? "Resolution verified" : "Complaint created"} title={isResolved ? "This one has proof." : "Your report is on record."} backHref="/dashboard">
        {isResolved ? "The issue is marked resolved because the before/after evidence was checked." : "Keep this receipt number. We’ll keep the trail visible as it moves through the civic system."}
      </PageIntro>

      <div className="receipt-card">
        <div className="receipt-top"><span className="receipt-label"><ShieldCheck size={14} /> NammaFix AI receipt</span><span className="receipt-date">19 SEP 2026</span></div>
        <div className="receipt-id-row"><div><span className="mini-label">TRACKING ID</span><strong className="receipt-id">{complaint.trackingId}</strong></div><button type="button" className="copy-button" onClick={copyTrackingId}>{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}</button></div>
        <div className="receipt-rule" />
        <div className="receipt-status-row"><span className="receipt-status-dot" /><span>{complaint.status}</span><span className="receipt-status-note">Last updated just now</span></div>
      </div>

      {complaint.duplicateOf ? <div className="duplicate-note"><div className="duplicate-icon"><Copy size={16} /></div><div><strong>We found a nearby report.</strong><p>This may be the same issue as <span>{complaint.duplicateOf}</span>. Your evidence has been linked so the civic team sees one clear signal, not two disconnected tickets.</p></div></div> : null}

      <section className="paper-card complaint-draft-card">
        <div className="card-section-head"><SectionLabel><Sparkles size={14} /> AI-drafted complaint</SectionLabel><span className="confidence-badge"><span className="confidence-dot" /> {confidence}% confident</span></div>
        <div className="language-grid">
          <div className="language-block"><span className="language-label">English</span><h2>{complaint.title}</h2><p>{complaint.caption}</p></div>
          <div className="language-block kannada"><span className="language-label">ಕನ್ನಡ</span><h2>{complaint.titleKannada}</h2><p>ನಿಮ್ಮ ಫೋಟೋ ಮತ್ತು ಸ್ಥಳದ ಆಧಾರದ ಮೇಲೆ ಈ ದೂರನ್ನು ರಚಿಸಲಾಗಿದೆ.</p></div>
        </div>
        <div className="ai-note"><Sparkles size={14} /> Drafted from your photo and note. You can dispute the resolution later if the fix doesn’t hold.</div>
      </section>

      {complaint.audioUrl ? (
        <section className="paper-card audio-evidence-card" style={{ padding: "18px 20px" }}>
          <SectionLabel><Mic size={14} /> Voice note evidence</SectionLabel>
          <AudioPlayer
            url={complaint.audioUrl}
            duration={complaint.audioDuration || 8}
            transcript={complaint.audioTranscript}
            transcriptKannada={complaint.audioTranscriptKannada || complaint.titleKannada}
            title="Citizen Voice Note"
          />
        </section>
      ) : null}

      <section className="paper-card routing-card">
        <SectionLabel><Route size={14} /> Civic routing</SectionLabel>
        <div className="routing-row"><div className="routing-icon"><CategoryIcon size={17} /></div><div><span className="mini-label">CATEGORY</span><strong>{info.label}</strong></div></div>
        <div className="routing-row"><div className="routing-icon"><MapPin size={17} /></div><div><span className="mini-label">WARD</span><strong>{complaint.ward}</strong></div></div>
        <div className="routing-row"><div className="routing-icon"><Flag size={17} /></div><div><span className="mini-label">ASSIGNED DEPARTMENT</span><strong>{complaint.department}</strong></div></div>
      </section>

      {isResolved && complaint.afterPhoto ? (
        <section className="paper-card proof-card"><div className="card-section-head"><SectionLabel><CheckCircle2 size={14} /> Verified proof</SectionLabel><span className="proof-date">19 Sep · checked by you</span></div><div className="proof-grid"><div><img src={complaint.photo} alt="Before" /><span>Before</span></div><div><img src={complaint.afterPhoto} alt="After" /><span>After</span></div></div><p className="proof-note">{complaint.resolutionNote}</p></section>
      ) : (
        <div className="next-step-card"><div className="next-step-icon"><ShieldCheck size={20} /></div><div><span className="mini-label">WHEN THE TEAM MARKS THIS FIXED</span><strong>You’ll be asked for an after photo.</strong><p>A status flag is not enough. You decide whether the fix holds up.</p></div></div>
      )}

      <div className="result-actions">
        <Link href={`/resolution/${complaint.id}`} className={isResolved ? "secondary-button" : "primary-button"}>{isResolved ? "Review resolution" : "I’ll verify the fix"}<ArrowRight size={15} /></Link>
        <Link href={`/track?report=${complaint.trackingId}`} className="secondary-button">Track public status</Link>
        <Link href="/dashboard" className="text-link">View all reports <ChevronRight size={15} /></Link>
      </div>
      <TrustNote>Demo data is stored in a single mock API client so the real API Gateway can replace it later without changing these screens.</TrustNote>
    </div>
  );
}
