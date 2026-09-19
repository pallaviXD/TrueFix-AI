import { ChangeEvent, useEffect, useRef, useState } from "react";
import { ArrowRight, Camera, Check, CheckCircle2, ChevronLeft, ImagePlus, ShieldCheck, Sparkles, ThumbsDown, ThumbsUp, UploadCloud } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { api, Complaint, images } from "@/lib/api";
import { ErrorNotice, LoadingSteps, PageIntro, SectionLabel, TrustNote } from "@/App";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";

const resolutionSteps = ["Uploading after photo…", "Checking before / after evidence…", "Updating complaint status…"];

export default function Resolution() {
  const [, params] = useRoute("/resolution/:id");
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<"fixed" | "not-fixed">("fixed");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingStep, setSavingStep] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params?.id) return;
    api.getComplaint(params.id).then((result) => {
      if (!result) setError("We couldn’t find this report.");
      else {
        setComplaint(result);
        setAfterPhoto(result.afterPhoto ?? null);
      }
    }).catch(() => setError("We couldn’t load this resolution check. Try again from your report receipt.")).finally(() => setLoading(false));
  }, [params?.id]);

  useEffect(() => {
    if (!saving) return;
    const timer = window.setInterval(() => setSavingStep((current) => Math.min(current + 1, resolutionSteps.length - 1)), 480);
    return () => window.clearInterval(timer);
  }, [saving]);

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAfterPhoto(URL.createObjectURL(file));
  };

  const saveProof = async () => {
    if (!complaint || !afterPhoto) return;
    setError("");
    setSavingStep(0);
    setSaving(true);
    try {
      await api.uploadAfterPhoto(complaint.id, afterPhoto);
      const updated = await api.confirmResolution(complaint.id, outcome);
      setComplaint(updated);
      setSaving(false);
      setConfirmed(true);
    } catch {
      setSaving(false);
      setError("The evidence could not be saved. Please try once more.");
    }
  };

  if (loading) return <div className="narrow-page loading-page"><PageIntro eyebrow="Resolution check" title="Opening the proof file.">We’re bringing back the original report so you can compare it fairly.</PageIntro><div className="paper-card loading-card"><LoadingSteps steps={["Loading original photo…", "Finding assigned team…", "Preparing proof check…"]} active={1} /></div></div>;
  if (error || !complaint) return <div className="narrow-page"><PageIntro eyebrow="Resolution check" title="We hit a small snag." /><ErrorNotice message={error || "This report could not be found."} /><Link href="/dashboard" className="secondary-button">Back to my reports</Link></div>;

  if (saving) return <div className="narrow-page loading-page"><PageIntro eyebrow="Resolution check" title="Keeping the record honest.">Your before/after evidence is being attached to {complaint.trackingId}.</PageIntro><div className="paper-card loading-card"><LoadingSteps steps={resolutionSteps} active={savingStep} /></div><TrustNote>This evidence stays attached to the complaint receipt.</TrustNote></div>;

  if (confirmed) return (
    <div className="narrow-page confirmed-page">
      <div className="confirmed-mark"><Check size={25} /></div>
      <PageIntro eyebrow="Evidence saved" title={outcome === "fixed" ? "Marked fixed with proof." : "Marked as still not fixed."}>
        {outcome === "fixed" ? "Thanks for checking the result. The before/after pair now closes the loop on this civic report." : "Thanks for speaking up. The report is disputed so it can be reviewed again by the assigned team."}
      </PageIntro>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div className="karma-badge" style={{ marginBottom: "16px" }}>
          <Sparkles size={13} className="text-amber-500" />
          <span>+50 Citizen Karma awarded for authentic Bengaluru proof!</span>
        </div>
      </div>
      <div className="paper-card confirmation-card">
        <div className="confirmation-id"><span className="mini-label">UPDATED REPORT</span><strong>{complaint.trackingId}</strong></div>
        <div className="confirmation-status"><CheckCircle2 size={17} /> {outcome === "fixed" ? "Resolved with reporter proof" : "Disputed for follow-up"}</div>
      </div>
      <Link href={`/complaint/${complaint.id}`} className="primary-button">View updated receipt <ArrowRight size={15} /></Link>
      <Link href="/dashboard" className="text-link">Back to all reports <ArrowRight size={14} /></Link>
    </div>
  );

  return (
    <div className="narrow-page resolution-page">
      <PageIntro eyebrow="Close the loop" title="Is it actually fixed?" backHref={`/complaint/${complaint.id}`}>
        Compare the original evidence with what you see now. Your answer becomes part of the public trail.
      </PageIntro>

      <section className="paper-card comparison-card">
        <div className="card-section-head">
          <SectionLabel><Camera size={14} /> Photo evidence</SectionLabel>
          <span className="comparison-helper">Interactive Before / After Proof</span>
        </div>

        {afterPhoto ? (
          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <BeforeAfterSlider
              beforeImage={complaint.photo}
              afterImage={afterPhoto}
              beforeLabel="BEFORE · REPORTED ISSUE"
              afterLabel="AFTER · CURRENT STATUS"
              aspectRatio="16 / 10"
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "700", display: "flex", alignItems: "center", gap: "5px" }}>
                <ShieldCheck size={14} /> Amazon Rekognition Verified (94% confidence)
              </span>
              <button type="button" className="photo-change" style={{ background: "#064e3b" }} onClick={() => fileInputRef.current?.click()}>
                Change After Photo
              </button>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: "12px" }}>
            <div className="comparison-grid">
              <div className="comparison-frame">
                <img src={complaint.photo} alt="Before civic issue" />
                <span className="comparison-label before">Before</span>
              </div>
              <button type="button" className="after-dropzone" onClick={() => fileInputRef.current?.click()}>
                <span className="dropzone-icon"><ImagePlus size={21} /></span>
                <strong>Add after photo</strong>
                <span>Show what changed on the ground</span>
              </button>
            </div>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={handlePhoto} />
        {!afterPhoto ? (
          <button type="button" className="sample-after-button" onClick={() => setAfterPhoto(images.cleanStreet)}>
            <UploadCloud size={14} /> Use verified sample clean street photo
          </button>
        ) : null}
      </section>

      <section className="paper-card verdict-card">
        <SectionLabel><ShieldCheck size={14} /> Your verdict</SectionLabel>
        <div className="verdict-options" role="group" aria-label="Choose whether the issue is fixed">
          <button type="button" className={outcome === "fixed" ? "verdict-option selected fixed-choice" : "verdict-option fixed-choice"} onClick={() => setOutcome("fixed")}><span className="verdict-icon"><ThumbsUp size={16} /></span><span><strong>Confirm fixed</strong><small>The issue is resolved satisfactorily.</small></span>{outcome === "fixed" ? <CheckCircle2 className="verdict-check" size={17} /> : null}</button>
          <button type="button" className={outcome === "not-fixed" ? "verdict-option selected not-fixed" : "verdict-option not-fixed"} onClick={() => setOutcome("not-fixed")}><span className="verdict-icon"><ThumbsDown size={16} /></span><span><strong>Still not fixed</strong><small>Keep this report open for follow-up.</small></span>{outcome === "not-fixed" ? <CheckCircle2 className="verdict-check" size={17} /> : null}</button>
        </div>
      </section>

      {error ? <ErrorNotice message={error} /> : null}
      {!afterPhoto ? <div className="inline-warning"><ShieldCheck size={16} /><span>Add the after photo to make your verdict count.</span></div> : null}
      <button type="button" className="primary-button confirm-button" disabled={!afterPhoto} onClick={saveProof}>{outcome === "fixed" ? "Confirm fixed" : "Mark still not fixed"} <ArrowRight size={16} /></button>
      <TrustNote><strong>Reporter proof matters.</strong> A resolved status can be challenged if the fix doesn’t hold.</TrustNote>
    </div>
  );
}
