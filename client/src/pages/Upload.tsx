import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Camera, Check, ChevronRight, ImagePlus, LocateFixed, MapPin, Mic, Pencil, RefreshCw, Send, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { api, images } from "@/lib/api";
import { canRouteReport, detectWardFromCoordinates } from "../../../shared/truefix";
import { EmptyNotice, ErrorNotice, LoadingSteps, PageIntro, SectionLabel, TrustNote } from "@/App";
import { AudioEvidence, type AudioData } from "@/components/AudioEvidence";

const steps = ["Analyzing photo & voice note…", "Running Whisper AI speech-to-text…", "Checking nearby duplicates…", "Drafting bilingual complaint…"];

export default function Upload() {
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [caption, setCaption] = useState("");
  const [location, setReportLocation] = useState("12th Main Road, Indiranagar");
  const [coordinates, setCoordinates] = useState({ lat: 12.9784, lng: 77.6408 });
  const [locating, setLocating] = useState(true);
  const [editingLocation, setEditingLocation] = useState(false);
  const [locationDraft, setLocationDraft] = useState(location);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");

  const acquireLocation = () => {
    setLocating(true);
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoordinates({ lat, lng });
          const ward = detectWardFromCoordinates(lat, lng);
          setReportLocation(`GPS (${lat.toFixed(4)}, ${lng.toFixed(4)}) · ${ward}`);
          setLocating(false);
        },
        (err) => {
          console.warn("[Geolocation] Browser location unavailable:", err.message);
          setLocating(false);
          setEditingLocation(true);
        },
        { timeout: 7000, enableHighAccuracy: true }
      );
    } else {
      setLocating(false);
      setEditingLocation(true);
    }
  };

  useEffect(() => {
    acquireLocation();
  }, []);

  const useCurrentLocation = () => {
    acquireLocation();
  };

  useEffect(() => {
    if (!loading) return;
    const timer = window.setInterval(() => setLoadingStep((current) => Math.min(current + 1, steps.length - 1)), 430);
    return () => window.clearInterval(timer);
  }, [loading]);

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setPhoto(URL.createObjectURL(file));
  };

  const useSample = (type: "garbage" | "pothole" = "garbage") => {
    setError("");
    if (type === "garbage") {
      setPhoto(images.garbageTwo);
      setCaption("Garbage has been left along the footpath since yesterday.");
    } else {
      setPhoto(images.pothole);
      setCaption("Deep pothole damaging two-wheelers and slowing traffic.");
    }
  };

  const saveManualLocation = () => {
    if (locationDraft.trim()) setReportLocation(locationDraft.trim());
    setEditingLocation(false);
  };

  const submitReport = async () => {
    if (!photo) {
      setError("Add a photo first. It is the evidence that keeps this complaint accountable.");
      return;
    }

    const isPothole = /pothole|road|hole|ಗುಂಡಿ/i.test(caption);
    const validation = canRouteReport({
      category: isPothole ? "Pothole" : "Garbage accumulation",
      durationDays: 1,
      location,
      imageQuality: 0.85,
    });
    if (!validation.allowed) {
      setError(validation.reason);
      return;
    }

    setError("");
    setLoadingStep(0);
    setLoading(true);
    try {
      const complaint = await api.submitReport({
        photo,
        caption,
        location,
        coordinates,
        audioUrl: audioData?.url,
        audioDuration: audioData?.duration,
        audioTranscript: audioData?.transcript,
        audioTranscriptKannada: audioData?.transcriptKannada,
      });
      navigate(`/complaint/${complaint.id}`);
    } catch {
      setLoading(false);
      setError("We couldn’t create your report. Please try again when you have a stronger connection.");
    }
  };

  if (loading) {
    return (
      <div className="narrow-page loading-page">
        <div className="loading-orbit"><Sparkles size={21} /></div>
        <PageIntro eyebrow="NammaFix AI is working" title="Turning your photo into action.">
          We’ll route this to the right Bengaluru civic team and check for nearby reports before filing it.
        </PageIntro>
        <div className="paper-card loading-card">
          <LoadingSteps steps={steps} active={loadingStep} />
          <div className="loading-caption"><span className="mini-pulse" /> This usually takes less than a minute.</div>
        </div>
        <TrustNote>Your photo is used to draft the complaint and is not shared publicly.</TrustNote>
      </div>
    );
  }

  return (
    <div className="narrow-page upload-page">
      <PageIntro eyebrow="Report an issue" title="Make it visible. Make it fixable.">
        Snap a clear photo of a garbage pile or pothole. We’ll turn it into a complaint you can follow and verify.
      </PageIntro>

      {/* Offline / Demo Disclosure Banner */}
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
          <strong>Demo Mode:</strong> Using local offline heuristics for voice transcription and computer vision. In production, these route to Amazon Transcribe and Amazon Rekognition.
        </span>
      </div>

      <div className="upload-layout">
        <section className="paper-card upload-card">
          <SectionLabel><Camera size={14} /> 01 / Evidence photo</SectionLabel>
          <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={handlePhoto} />
          {photo ? (
            <div className="camera-hud-frame">
              <img src={photo} alt="Selected civic issue" />
              <div className="hud-corner top-left" />
              <div className="hud-corner top-right" />
              <div className="hud-corner bottom-left" />
              <div className="hud-corner bottom-right" />
              <div className="camera-meta-bar">
                <div className="camera-meta-header">
                  <span className="camera-geotag">
                    <LocateFixed size={12} /> {coordinates.lat.toFixed(4)}° N, {coordinates.lng.toFixed(4)}° E
                  </span>
                  <span className="camera-timestamp">19 SEP 2026 · BBMP AI</span>
                </div>
                <div className="camera-ward-stamp">{location}</div>
              </div>
              <div className="photo-preview-overlay" style={{ top: "12px", bottom: "auto" }}>
                <span><Check size={14} className="text-emerald-400" /> Geotagged Photo Ready</span>
                <button type="button" className="photo-change" onClick={() => fileInputRef.current?.click()}>Retake / Change</button>
              </div>
            </div>
          ) : (
            <button type="button" className="photo-dropzone" onClick={() => fileInputRef.current?.click()}>
              <span className="dropzone-icon"><ImagePlus size={23} /></span>
              <strong>Tap to capture evidence photo</strong>
              <span>Camera with automatic GPS & Ward geotagging</span>
            </button>
          )}

          <div style={{ marginTop: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: "750", color: "#4f6b64", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              ⚡ Fast Test Presets (Verified Media)
            </span>
            <div className="preset-chips-grid">
              <button
                type="button"
                className="preset-chip-btn"
                onClick={() => {
                  setError("");
                  setPhoto(images.garbageOne);
                  setCaption("Overflowing waste collection point blocking bus stop.");
                  setReportLocation("12th Main Road, Indiranagar");
                  setCoordinates({ lat: 12.9784, lng: 77.6408 });
                }}
              >
                <div className="preset-chip-icon garbage">🗑️</div>
                <div>
                  <span className="preset-chip-title">Indiranagar Garbage</span>
                  <span className="preset-chip-sub">Ward 151 · Domlur</span>
                </div>
              </button>

              <button
                type="button"
                className="preset-chip-btn"
                onClick={() => {
                  setError("");
                  setPhoto(images.pothole);
                  setCaption("Deep pothole hazard for two-wheelers near metro pillar.");
                  setReportLocation("80 Feet Road, Koramangala");
                  setCoordinates({ lat: 12.9352, lng: 77.6245 });
                }}
              >
                <div className="preset-chip-icon pothole">⚠️</div>
                <div>
                  <span className="preset-chip-title">Koramangala Pothole</span>
                  <span className="preset-chip-sub">Ward 150 · 80 Ft Rd</span>
                </div>
              </button>

              <button
                type="button"
                className="preset-chip-btn"
                onClick={() => {
                  setError("");
                  setPhoto(images.garbageTwo);
                  setCaption("Mixed waste dumped beside pedestrian footpath.");
                  setReportLocation("27th Main, HSR Layout");
                  setCoordinates({ lat: 12.9116, lng: 77.6389 });
                }}
              >
                <div className="preset-chip-icon garbage">📦</div>
                <div>
                  <span className="preset-chip-title">HSR Layout Footpath</span>
                  <span className="preset-chip-sub">Ward 147 · SWM</span>
                </div>
              </button>

              <button
                type="button"
                className="preset-chip-btn"
                onClick={() => {
                  setError("");
                  setPhoto(images.potholeTwo);
                  setCaption("Broken asphalt surface near school crossing.");
                  setReportLocation("4th Block, Jayanagar");
                  setCoordinates({ lat: 12.925, lng: 77.5938 });
                }}
              >
                <div className="preset-chip-icon pothole">🚧</div>
                <div>
                  <span className="preset-chip-title">Jayanagar School Rd</span>
                  <span className="preset-chip-sub">Ward 154 · Road Infra</span>
                </div>
              </button>
            </div>
          </div>
        </section>

        <section className="paper-card details-card">
          <SectionLabel><Mic size={14} /> 02 / Voice note & description <span className="optional">Optional</span></SectionLabel>
          <p style={{ fontSize: "12.5px", color: "var(--ink-soft)", margin: "0 0 12px", lineHeight: "1.5" }}>
            Speak in Kannada, English, or Hindi. Whisper AI will transcribe your voice into structured evidence.
          </p>

          <AudioEvidence
            value={audioData}
            onChange={setAudioData}
            onApplyTranscript={(transcriptText) => {
              setCaption((prev) => (prev ? `${prev}\n${transcriptText}` : transcriptText));
            }}
          />

          <div style={{ marginTop: "16px" }}>
            <label className="field-label" htmlFor="caption">What should the team know? (Optional description)</label>
            <textarea
              id="caption"
              className="text-field text-area"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="e.g. This has been here since Monday and blocks the footpath."
              rows={3}
            />
            <div className="field-count">{caption.length}/240</div>
          </div>
        </section>

        <section className="paper-card details-card">
          <SectionLabel><MapPin size={14} /> 03 / Where is it?</SectionLabel>
          <div className={locating ? "location-row locating" : "location-row"}>
            <span className="location-icon"><LocateFixed size={18} /></span>
            <div><strong>{locating ? "Finding your location…" : location}</strong><span>{locating ? "Keep location services on" : `${coordinates.lat.toFixed(4)}° N · ${coordinates.lng.toFixed(4)}° E`}</span></div>
            <button type="button" className="icon-button" onClick={useCurrentLocation} aria-label="Refresh location"><RefreshCw size={15} /></button>
          </div>
          {editingLocation ? (
            <div className="manual-location">
              <input className="text-field" value={locationDraft} onChange={(event) => setLocationDraft(event.target.value)} onKeyDown={(event) => event.key === "Enter" && saveManualLocation()} autoFocus />
              <button type="button" className="save-location" onClick={saveManualLocation}>Save</button>
            </div>
          ) : (
            <button type="button" className="manual-link" onClick={() => setEditingLocation(true)}>Use a different location <ChevronRight size={14} /></button>
          )}
        </section>
      </div>

      {error ? <ErrorNotice message={error} /> : null}
      {!photo && !error ? <EmptyNotice title="No evidence yet" message="A photo helps the right team understand the issue and prevents duplicate visits." /> : null}

      <div className="submit-row">
        <button type="button" className="primary-button submit-button" onClick={submitReport}>
          <Send size={16} /> Submit report <span className="button-arrow">→</span>
        </button>
        <p>By submitting, you’re helping your neighbourhood stay accountable.</p>
      </div>
      <TrustNote><strong>Evidence-first by design.</strong> Resolutions need a before/after photo, not just a status update.</TrustNote>
    </div>
  );
}
