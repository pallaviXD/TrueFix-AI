import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  BrainCircuit,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  GitBranch,
  Languages,
  Route,
  ScanSearch,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Link, useLocation } from "wouter";

import { images } from "@/lib/api";
import { useAwsDrawer } from "@/App";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { CivicTicker } from "@/components/CivicTicker";

const heroImage = images.garbageOne;
const incidentVideo =
  "https://www.youtube-nocookie.com/embed/jJh9cuDMX0E?autoplay=1&mute=1&loop=1&playlist=jJh9cuDMX0E&controls=0&modestbranding=1&rel=0&playsinline=1&iv_load_policy=3&fs=0&disablekb=1&cc_load_policy=0";

type Language = "en" | "kn" | "hi";

const translations: Record<
  Language,
  {
    kicker: string;
    titleA: string;
    titleB: string;
    tagline: string;
    support: string;
    cta: string;
    scope: string;
    live: string;
    complaint: string;
    garbage: string;
    location: string;
    caption: string;
    pipeline: string;
    complete: string;
    classified: string;
    classifiedDetail: string;
    duplicate: string;
    duplicateDetail: string;
    routed: string;
    routedDetail: string;
    tracking: string;
    language: string;
    scroll: string;
    contextKicker: string;
    contextTitle: string;
    contextBody: string;
    pipelineKicker: string;
    pipelineTitle: string;
    pipelineBody: string;
    proofKicker: string;
    proofTitle: string;
    proofBody: string;
    source: string;
  }
> = {
  en: {
    kicker: "A multilingual civic action agent",
    titleA: "Report it.",
    titleB: "Prove it fixed.",
    tagline: "From photo to accountability",
    support:
      "NammaFix turns a resident's photo into a correctly routed, bilingual complaint, then asks for proof before anyone calls it resolved.",
    cta: "Open live demo",
    scope: "Bharat Builds Tour",
    live: "Live demo",
    complaint: "Complaint 0042",
    garbage: "GARBAGE PILE",
    location: "MS Palya, Bengaluru",
    caption: "Overflowing waste collection point near the main road",
    pipeline: "AI report pipeline",
    complete: "3 of 4 complete",
    classified: "Classified",
    classifiedDetail: "Garbage · 96% confidence",
    duplicate: "Duplicate check",
    duplicateDetail: "One nearby report flagged",
    routed: "Routed to ward",
    routedDetail: "151 · Solid Waste Management",
    tracking: "TRACKING ID",
    language: "English + ಕನ್ನಡ",
    scroll: "See the accountability loop",
    contextKicker: "The problem is after submit",
    contextTitle: "7.81 lakh complaints. Not enough proof.",
    contextBody:
      "Residents already report garbage and road issues through Sahaaya. The missing layer is accountability after a status changes to resolved.",
    pipelineKicker: "The NammaFix loop",
    pipelineTitle: "A complaint is not the finish line.",
    pipelineBody:
      "Every report moves through a recoverable, inspectable flow. The demo shows the state change, not a chatbot conversation.",
    proofKicker: "The demo wow moment",
    proofTitle: "Resolved is a claim. Proof makes it real.",
    proofBody:
      "Upload an after photo from the same spot. Rekognition compares the evidence. The resident still makes the final call with Confirm Fixed or Still Not Fixed.",
    source: "Real incident footage · Bengaluru",
  },
  kn: {
    kicker: "ಬಹುಭಾಷಾ ನಾಗರಿಕ ಸಹಾಯಕರ",
    titleA: "ವರದಿ ಮಾಡಿ.",
    titleB: "ಪರಿಹಾರವನ್ನು ಸಾಬೀತುಪಡಿಸಿ.",
    tagline: "ಫೋಟೋದಿಂದ ಹೊಣೆಗಾರಿಕೆಗೆ",
    support:
      "ನಮ್ಮFix ನಿವಾಸಿಯ ಫೋಟೋವನ್ನು ಸರಿಯಾದ ವಾರ್ಡ್‌ಗೆ ಕಳುಹಿಸಿದ ದ್ವಿಭಾಷಾ ದೂರಾಗಿ ಬದಲಿಸುತ್ತದೆ. ಪರಿಹಾರ ಎಂದು ಗುರುತಿಸುವ ಮೊದಲು ಸಾಕ್ಷ್ಯ ಕೇಳುತ್ತದೆ.",
    cta: "ಲೈವ್ ಡೆಮೊ ತೆರೆಯಿರಿ",
    scope: "ಭಾರತ್ ಬಿಲ್ಡ್ಸ್ ಟೂರ್",
    live: "ಲೈವ್ ಡೆಮೊ",
    complaint: "ದೂರು 0042",
    garbage: "ಕಸದ ರಾಶಿ",
    location: "ಎಂ ಎಸ್ ಪಾಳ್ಯ, ಬೆಂಗಳೂರು",
    caption: "ಮುಖ್ಯ ರಸ್ತೆಯ ಬಳಿಯ ತುಂಬಿ ಹರಿಯುತ್ತಿರುವ ಕಸ ಸಂಗ್ರಹ ಸ್ಥಳ",
    pipeline: "AI ವರದಿ ಪ್ರಕ್ರಿಯೆ",
    complete: "4ರಲ್ಲಿ 3 ಪೂರ್ಣ",
    classified: "ವರ್ಗೀಕರಿಸಲಾಗಿದೆ",
    classifiedDetail: "ಕಸ · 96% ನಂಬಿಕೆ",
    duplicate: "ನಕಲು ಪರಿಶೀಲನೆ",
    duplicateDetail: "ಹತ್ತಿರದ ಒಂದು ವರದಿ ಕಂಡುಬಂದಿದೆ",
    routed: "ವಾರ್ಡ್‌ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ",
    routedDetail: "151 · ಘನ ತ್ಯಾಜ್ಯ ನಿರ್ವಹಣೆ",
    tracking: "ಟ್ರ್ಯಾಕಿಂಗ್ ID",
    language: "English + ಕನ್ನಡ",
    scroll: "ಹೊಣೆಗಾರಿಕೆಯ ಹಾದಿ ನೋಡಿ",
    contextKicker: "ಸಲ್ಲಿಸಿದ ನಂತರದ ಸಮಸ್ಯೆ",
    contextTitle: "7.81 ಲಕ್ಷ ದೂರುಗಳು. ಸಾಕಷ್ಟು ಸಾಕ್ಷ್ಯವಿಲ್ಲ.",
    contextBody:
      "ಸಹಾಯ ಮೂಲಕ ನಿವಾಸಿಗಳು ಈಗಾಗಲೇ ಕಸ ಮತ್ತು ರಸ್ತೆ ಸಮಸ್ಯೆಗಳನ್ನು ವರದಿ ಮಾಡುತ್ತಿದ್ದಾರೆ. ಪರಿಹಾರ ಎಂದು ಗುರುತಿಸಿದ ನಂತರದ ಹೊಣೆಗಾರಿಕೆಯ ಪದರವೇ ಕಾಣೆಯಾಗಿದೆ.",
    pipelineKicker: "ನಮ್ಮFix ಹಾದಿ",
    pipelineTitle: "ದೂರು ಅಂತಿಮ ಹಂತವಲ್ಲ.",
    pipelineBody:
      "ಪ್ರತಿ ವರದಿಯೂ ಪರಿಶೀಲಿಸಬಹುದಾದ ಹಾದಿಯಲ್ಲಿ ಸಾಗುತ್ತದೆ. ಡೆಮೊ ಚಾಟ್ ಅಲ್ಲ, ಸ್ಥಿತಿಯ ಬದಲಾವಣೆಯನ್ನು ತೋರಿಸುತ್ತದೆ.",
    proofKicker: "ಡೆಮೊದ ಮುಖ್ಯ ಕ್ಷಣ",
    proofTitle: "ಪರಿಹಾರ ಒಂದು ಹೇಳಿಕೆ. ಸಾಕ್ಷ್ಯ ಅದನ್ನು ನಿಜಗೊಳಿಸುತ್ತದೆ.",
    proofBody:
      "ಅದೇ ಸ್ಥಳದ ನಂತರದ ಫೋಟೋವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. Rekognition ಸಾಕ್ಷ್ಯವನ್ನು ಹೋಲಿಸುತ್ತದೆ. ಅಂತಿಮ ನಿರ್ಧಾರ ನಿವಾಸಿಯದೇ.",
    source: "ನಿಜವಾದ ಘಟನೆ · ಬೆಂಗಳೂರು",
  },
  hi: {
    kicker: "एक बहुभाषी नागरिक सहायक",
    titleA: "रिपोर्ट करें।",
    titleB: "सुधार का प्रमाण दें।",
    tagline: "फोटो से जवाबदेही तक",
    support:
      "NammaFix निवासी की फोटो को सही वार्ड तक पहुंची द्विभाषी शिकायत में बदलता है और समाधान मानने से पहले प्रमाण मांगता है।",
    cta: "लाइव डेमो खोलें",
    scope: "भारत बिल्ड्स टूर",
    live: "लाइव डेमो",
    complaint: "शिकायत 0042",
    garbage: "कचरे का ढेर",
    location: "एम एस पाल्या, बेंगलुरु",
    caption: "मुख्य सड़क के पास कचरा संग्रह केंद्र भर गया है",
    pipeline: "AI रिपोर्ट प्रक्रिया",
    complete: "4 में से 3 पूरे",
    classified: "वर्गीकृत",
    classifiedDetail: "कचरा · 96% भरोसा",
    duplicate: "डुप्लीकेट जांच",
    duplicateDetail: "पास की एक रिपोर्ट मिली",
    routed: "वार्ड को भेजा गया",
    routedDetail: "151 · ठोस कचरा प्रबंधन",
    tracking: "ट्रैकिंग ID",
    language: "English + हिन्दी",
    scroll: "जवाबदेही का रास्ता देखें",
    contextKicker: "जमा करने के बाद की समस्या",
    contextTitle: "7.81 लाख शिकायतें. पर्याप्त प्रमाण नहीं.",
    contextBody:
      "निवासी पहले से Sahaaya पर कचरे और सड़कों की शिकायत करते हैं. कमी उस जवाबदेही की है जो समाधान दर्ज होने के बाद चाहिए.",
    pipelineKicker: "NammaFix प्रक्रिया",
    pipelineTitle: "शिकायत अंतिम पड़ाव नहीं है.",
    pipelineBody:
      "हर रिपोर्ट जांच योग्य प्रक्रिया से गुजरती है. डेमो चैट नहीं, स्थिति में बदलाव दिखाता है.",
    proofKicker: "डेमो का खास क्षण",
    proofTitle: "समाधान एक दावा है. प्रमाण उसे सच बनाता है.",
    proofBody:
      "उसी जगह की बाद की फोटो अपलोड करें. Rekognition प्रमाणों की तुलना करता है. अंतिम निर्णय निवासी का रहता है.",
    source: "वास्तविक घटना · बेंगलुरु",
  },
};

const pipeline = [
  {
    number: "01",
    icon: Camera,
    label: "Capture",
    title: "Photo plus GPS & Ward Geotag",
    text: "A resident captures one clear photo from the street stamped with coordinates.",
  },
  {
    number: "02",
    icon: BrainCircuit,
    label: "Understand",
    title: "Amazon Bedrock Multilingual",
    text: "Claude 3.5 Sonnet drafts bilingual English + Kannada title and categorizes the hazard.",
  },
  {
    number: "03",
    icon: Route,
    label: "Route",
    title: "BBMP Ward & Dept Ledger",
    text: "Geo-clustering catches duplicate tickets and routes directly to the assigned officer.",
  },
  {
    number: "04",
    icon: ShieldCheck,
    label: "Verify",
    title: "Rekognition Proof Verification",
    text: "An after-photo and citizen human confirmation close the loop with zero bribes.",
  },
];

function LandingLogo() {
  return (
    <div className="landing-logo">
      <img
        src="/logo.png"
        alt="NammaFix AI"
        style={{
          height: "38px",
          width: "auto",
          objectFit: "contain",
          display: "block",
        }}
      />
    </div>
  );
}

function AwsMark({
  type,
  label,
}: {
  type: "bedrock" | "rekognition" | "step";
  label: string;
}) {
  return (
    <div className="aws-service">
      <span className={`aws-mark aws-${type}`} aria-hidden="true">
        {type === "bedrock" ? "B" : type === "rekognition" ? "R" : "S"}
      </span>
      <span>{label}</span>
    </div>
  );
}

export default function Landing() {
  const [incidentReady, setIncidentReady] = useState(false);
  const [enteringApp, setEnteringApp] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [proofScenario, setProofScenario] = useState<"pothole" | "garbage">("pothole");
  const { openDrawer } = useAwsDrawer();
  const [, navigate] = useLocation();
  const copy = translations[language];

  const enterDashboard = () => {
    if (enteringApp) return;
    setEnteringApp(true);
    window.setTimeout(() => navigate("/dashboard"), 420);
  };

  return (
    <div className="landing-page">
      <CivicTicker />
      <section className="landing-hero product-hero">
        <div
          className={incidentReady ? "hero-media incident-ready" : "hero-media"}
          aria-hidden="true"
        >
          <img className="hero-fallback visible" src={heroImage} alt="" />
          <iframe
            className="incident-frame"
            src={incidentVideo}
            title="Real Bengaluru civic incident footage"
            allow="autoplay; encrypted-media"
            onLoad={() => setIncidentReady(true)}
            tabIndex={-1}
          />
          <div className="hero-vignette" />
          <div className="hero-grain" />
        </div>
        <header className="landing-header">
          <LandingLogo />
          <div className="landing-header-tools">
            <button
              type="button"
              className="aws-inspect-header-btn"
              onClick={openDrawer}
              title="Inspect AWS Cloud Architecture"
            >
              <Zap size={13} className="text-amber-400" />
              <span>AWS Architecture</span>
            </button>
            <div className="landing-header-note">
              <span className="live-dot" /> Bharat Builds · Bangalore
            </div>
            <div className="language-picker" aria-label="Choose language">
              {(["en", "kn", "hi"] as Language[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={language === item ? "language-option active" : "language-option"}
                  onClick={() => setLanguage(item)}
                >
                  {item === "en" ? "EN" : item === "kn" ? "ಕನ್ನಡ" : "हिन्दी"}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="product-hero-grid">
          <div className="hero-copy product-copy">
            <div
              className="landing-kicker"
              style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}
            >
              <span
                style={{
                  background: "rgba(245, 158, 11, 0.2)",
                  color: "#fef08a",
                  border: "1px solid rgba(245, 158, 11, 0.4)",
                  padding: "3px 9px",
                  borderRadius: "999px",
                  fontSize: "10px",
                  fontWeight: "800",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                🏆 Bharat Builds Tour · AWS First Commit
              </span>
              <span>{copy.kicker}</span>
            </div>
            <h1>
              {copy.titleA}
              <br />
              <span>{copy.titleB}</span>
            </h1>
            <p className="hero-tagline">{copy.tagline}</p>
            <p className="hero-support">{copy.support}</p>
            <div className="hero-actions">
              <button
                type="button"
                className="hero-cta"
                onClick={enterDashboard}
                disabled={enteringApp}
              >
                {copy.cta} <ArrowRight size={17} />
              </button>
              <span className="hero-mvp">
                <Activity size={13} /> {copy.scope}
              </span>
            </div>
          </div>

          <div className="hero-console" aria-label="NammaFix live demo pipeline">
            <div className="console-top">
              <span>
                <span className="console-live" /> {copy.live}
              </span>
              <span>{copy.complaint}</span>
            </div>
            <div className="console-photo">
              <img src={heroImage} alt="Garbage pile incident in Bengaluru" />
              <div className="console-photo-label">
                <strong>{copy.garbage}</strong>
                <span>{copy.location}</span>
              </div>
            </div>
            <div className="console-caption">
              <span className="console-caption-icon">
                <Camera size={13} />
              </span>
              <span>{copy.caption}</span>
            </div>
            <div className="console-progress">
              <div className="console-progress-head">
                <span>{copy.pipeline}</span>
                <span>{copy.complete}</span>
              </div>
              <div className="console-progress-line">
                <span />
              </div>
            </div>
            <div className="console-steps">
              <div className="console-step complete">
                <span>
                  <Check size={12} />
                </span>
                <div>
                  <strong>{copy.classified}</strong>
                  <small>{copy.classifiedDetail}</small>
                </div>
              </div>
              <div className="console-step complete">
                <span>
                  <Check size={12} />
                </span>
                <div>
                  <strong>{copy.duplicate}</strong>
                  <small>{copy.duplicateDetail}</small>
                </div>
              </div>
              <div className="console-step active">
                <span>
                  <Route size={12} />
                </span>
                <div>
                  <strong>{copy.routed}</strong>
                  <small>{copy.routedDetail}</small>
                </div>
              </div>
            </div>
            <div className="console-receipt">
              <div>
                <span>{copy.tracking}</span>
                <strong>NM24 0042</strong>
              </div>
              <div className="receipt-language">
                <Languages size={14} />
                <span>{copy.language}</span>
              </div>
            </div>
          </div>
        </div>

        <a
          className="hero-source"
          href="https://www.youtube.com/watch?v=jJh9cuDMX0E"
          target="_blank"
          rel="noreferrer"
        >
          {copy.source}
        </a>
        <div className="hero-scroll">
          <span>{copy.scroll}</span>
          <ArrowDown size={15} />
        </div>
        <div
          className={enteringApp ? "landing-transition active" : "landing-transition"}
          aria-hidden={!enteringApp}
        >
          <span className="transition-mark">
            <ArrowRight size={15} />
          </span>
          <span>Opening your civic trail</span>
        </div>
      </section>

      <section className="context-section">
        <div className="context-intro">
          <span className="section-kicker">{copy.contextKicker}</span>
          <h2>{copy.contextTitle}</h2>
          <p>{copy.contextBody}</p>
        </div>
        <div className="context-stats">
          <div className="context-stat featured">
            <span>Jan 2023 to Jun 2026</span>
            <strong>7.81L</strong>
            <small>complaints filed through Sahaaya</small>
          </div>
          <div className="context-stat">
            <AlertTriangle size={18} />
            <strong>01</strong>
            <small>duplicate case caught nearby</small>
          </div>
          <div className="context-stat">
            <CheckCircle2 size={18} />
            <strong>01</strong>
            <small>after photo required to close</small>
          </div>
        </div>
      </section>

      <section className="pipeline-section">
        <div className="pipeline-heading">
          <div>
            <span className="section-kicker">{copy.pipelineKicker}</span>
            <h2>{copy.pipelineTitle}</h2>
          </div>
          <p>{copy.pipelineBody}</p>
        </div>
        <div className="pipeline-grid">
          {pipeline.map(({ number, icon: Icon, label, title, text }) => (
            <article className="pipeline-card" key={number}>
              <div className="pipeline-card-top">
                <span>{number}</span>
                <Icon size={18} />
              </div>
              <small>{label}</small>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="proof-section">
        <div className="proof-copy">
          <span className="section-kicker">{copy.proofKicker}</span>
          <h2>{copy.proofTitle}</h2>
          <p>{copy.proofBody}</p>
          <div className="proof-tags">
            <span>
              <ScanSearch size={14} /> Interactive split curtain
            </span>
            <span>
              <GitBranch size={14} /> Amazon Rekognition CV
            </span>
          </div>
          <div style={{ marginTop: "20px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              className={proofScenario === "pothole" ? "language-option active" : "language-option"}
              style={{ padding: "8px 14px", fontSize: "11px", cursor: "pointer" }}
              onClick={() => setProofScenario("pothole")}
            >
              Case 1: 4th Block Pothole
            </button>
            <button
              type="button"
              className={proofScenario === "garbage" ? "language-option active" : "language-option"}
              style={{ padding: "8px 14px", fontSize: "11px", cursor: "pointer" }}
              onClick={() => setProofScenario("garbage")}
            >
              Case 2: Indiranagar Garbage Dump
            </button>
          </div>
        </div>
        <div className="proof-visual" style={{ width: "100%", maxWidth: "560px" }}>
          <div className="proof-visual-head" style={{ marginBottom: "12px" }}>
            <span>REKOGNITION COMPUTER VISION PROOF</span>
            <span className="confidence">
              <ShieldCheck size={13} /> 94% CV confidence
            </span>
          </div>
          <BeforeAfterSlider
            beforeImage={proofScenario === "pothole" ? images.potholeTwo : images.garbageOne}
            afterImage={images.cleanStreet}
            beforeLabel={proofScenario === "pothole" ? "BEFORE · POTHOLE HAZARD" : "BEFORE · GARBAGE DUMP"}
            afterLabel="AFTER · RESOLVED STREET"
            aspectRatio="16 / 11"
          />
        </div>
      </section>

      <section className="aws-strip">
        <div className="aws-intro">
          <span className="aws-kicker">Infrastructure for trust</span>
          <strong>Built on AWS</strong>
          <span>Real serverless services for Bangalore civic accountability.</span>
        </div>
        <div className="aws-services" style={{ cursor: "pointer" }} onClick={openDrawer}>
          <AwsMark type="bedrock" label="Amazon Bedrock" />
          <AwsMark type="rekognition" label="Rekognition" />
          <AwsMark type="step" label="Step Functions" />
        </div>
        <button
          type="button"
          className="aws-inspect-header-btn"
          style={{ padding: "10px 18px", fontSize: "12px", background: "#065f46" }}
          onClick={openDrawer}
        >
          <Zap size={14} className="text-amber-400" />
          <span>Inspect AWS Architecture Drawer →</span>
        </button>
      </section>
      <footer className="landing-footer">
        <span>© 2026 NammaFix AI</span>
        <span className="footer-divider" />
        <span>Built for the streets of Bengaluru</span>
        <Link href="/upload">
          Enter the app <ChevronRight size={14} />
        </Link>
      </footer>
    </div>
  );
}
