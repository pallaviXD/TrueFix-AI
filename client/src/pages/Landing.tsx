import { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  Bot,
  BrainCircuit,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  GitBranch,
  Languages,
  MessageSquare,
  Mic,
  Route,
  ScanSearch,
  Search,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Link, useLocation } from "wouter";

import { images } from "@/lib/api";
import { useAwsDrawer, useCivicAi } from "@/App";
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
    <Link href="/" className="landing-logo" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
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
    </Link>
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

type DemoComplaint = {
  id: string;
  trackingId: string;
  shortTitle: string;
  photo: string;
  progressPercent: string;
  complete: Record<Language, string>;
  complaint: Record<Language, string>;
  category: Record<Language, string>;
  location: Record<Language, string>;
  caption: Record<Language, string>;
  classifiedDetail: Record<Language, string>;
  duplicateDetail: Record<Language, string>;
  routedDetail: Record<Language, string>;
};

const DEMO_COMPLAINTS: DemoComplaint[] = [
  {
    id: "0042",
    trackingId: "NM24 0042",
    shortTitle: "Garbage",
    photo: "/evidence/garbage-before.jpg",
    progressPercent: "75%",
    complete: {
      en: "3 of 4 complete",
      kn: "4ರಲ್ಲಿ 3 ಪೂರ್ಣ",
      hi: "4 में से 3 पूरे",
    },
    complaint: {
      en: "Complaint 0042",
      kn: "ದೂರು 0042",
      hi: "शिकायत 0042",
    },
    category: {
      en: "GARBAGE PILE",
      kn: "ಕಸದ ರಾಶಿ",
      hi: "कचरे का ढेर",
    },
    location: {
      en: "MS Palya, Bengaluru",
      kn: "ಎಂ ಎಸ್ ಪಾಳ್ಯ, ಬೆಂಗಳೂರು",
      hi: "एम एस पाल्या, बेंगलुरु",
    },
    caption: {
      en: "Overflowing waste collection point near the main road",
      kn: "ಮುಖ್ಯ ರಸ್ತೆಯ ಬಳಿಯ ತುಂಬಿ ಹರಿಯುತ್ತಿರುವ ಕಸ ಸಂಗ್ರಹ ಸ್ಥಳ",
      hi: "मुख्य सड़क के पास कचरा संग्रह केंद्र भर गया है",
    },
    classifiedDetail: {
      en: "Garbage · 96% confidence",
      kn: "ಕಸ · 96% ನಂಬಿಕೆ",
      hi: "कचरा · 96% भरोसा",
    },
    duplicateDetail: {
      en: "One nearby report flagged",
      kn: "ಹತ್ತಿರದ ಒಂದು ವರದಿ ಕಂಡುಬಂದಿದೆ",
      hi: "पास की एक रिपोर्ट मिली",
    },
    routedDetail: {
      en: "151 · Solid Waste Management",
      kn: "151 · ಘನ ತ್ಯಾಜ್ಯ ನಿರ್ವಹಣೆ",
      hi: "151 · ठोस कचरा प्रबंधन",
    },
  },
  {
    id: "0108",
    trackingId: "NM24 0108",
    shortTitle: "Pothole",
    photo: "/evidence/pothole-before.jpg",
    progressPercent: "75%",
    complete: {
      en: "3 of 4 complete",
      kn: "4ರಲ್ಲಿ 3 ಪೂರ್ಣ",
      hi: "4 में से 3 पूरे",
    },
    complaint: {
      en: "Complaint 0108",
      kn: "ದೂರು 0108",
      hi: "शिकायत 0108",
    },
    category: {
      en: "POTHOLE HAZARD",
      kn: "ರಸ್ತೆ ಗುಂಡಿ ಅಪಾಯ",
      hi: "सड़क गड्ढा खतरा",
    },
    location: {
      en: "80 Feet Road, Koramangala",
      kn: "80 ಅಡಿ ರಸ್ತೆ, ಕೋರಮಂಗಲ",
      hi: "80 फीट रोड, कोरमंगला",
    },
    caption: {
      en: "Deep crater on asphalt causing severe two-wheeler skid hazard",
      kn: "ದ್ವಿಚಕ್ರ ವಾಹನಗಳಿಗೆ ಅಪಾಯ ಉಂಟುಮಾಡುತ್ತಿರುವ ಆಳವಾದ ರಸ್ತೆ ಗುಂಡಿ",
      hi: "दोपहिया वाहनों के लिए खतरनाक गहरा गड्ढा",
    },
    classifiedDetail: {
      en: "Road Pothole · 98% confidence",
      kn: "ರಸ್ತೆ ಗುಂಡಿ · 98% ನಂಬಿಕೆ",
      hi: "सड़क गड्ढा · 98% भरोसा",
    },
    duplicateDetail: {
      en: "No duplicates within 200m",
      kn: "200 ಮೀಟರ್ ಒಳಗೆ ಯಾವುದೇ ನಕಲು ಇಲ್ಲ",
      hi: "200 मीटर के भीतर कोई डुप्लीकेट नहीं",
    },
    routedDetail: {
      en: "150 · BBMP Road Infrastructure",
      kn: "150 · ರಸ್ತೆ ಮೂಲಸೌಕರ್ಯ ವಿಭಾಗ",
      hi: "150 · सड़क अवसंरचना विभाग",
    },
  },
  {
    id: "0233",
    trackingId: "NM24 0233",
    shortTitle: "Streetlight",
    photo: "/evidence/streetlight.jpg",
    progressPercent: "100%",
    complete: {
      en: "4 of 4 complete · Dispatched",
      kn: "4ರಲ್ಲಿ 4 ಪೂರ್ಣ · ಹೊರಡಿಸಲಾಗಿದೆ",
      hi: "4 में से 4 पूरे · रवाना",
    },
    complaint: {
      en: "Complaint 0233",
      kn: "ದೂರು 0233",
      hi: "शिकायत 0233",
    },
    category: {
      en: "STREETLIGHT OUT",
      kn: "ಬೀದಿ ದೀಪ ದುರಸ್ತಿ",
      hi: "स्ट्रीटलाइट बंद",
    },
    location: {
      en: "14th Cross, Malleshwaram",
      kn: "14ನೇ ಕ್ರಾಸ್, ಮಲ್ಲೇಶ್ವರಂ",
      hi: "14वां क्रॉस, मल्लेश्वरम",
    },
    caption: {
      en: "Dark residential stretch, 3 unlit LED street poles creating safety issue",
      kn: "ಬೆಳಕಿಲ್ಲದ 3 ಎಲ್‌ಇಡಿ ಕಂಬಗಳು, ಕತ್ತಲಾದ ವಸತಿ ಪ್ರದೇಶ",
      hi: "अंधेरी सड़क, 3 स्ट्रीटलाइट खराब होने से सुरक्षा खतरा",
    },
    classifiedDetail: {
      en: "Electrical · 95% confidence",
      kn: "ವಿದ್ಯುತ್ ವಿಭಾಗ · 95% ನಂಬಿಕೆ",
      hi: "विद्युत · 95% भरोसा",
    },
    duplicateDetail: {
      en: "Merged with BESCOM Ticket #7741",
      kn: "ಬೆಸ್ಕಾಂ ಟಿಕೆಟ್ #7741 ರೊಂದಿಗೆ ವಿಲೀನ",
      hi: "बेस्कॉम टिकट #7741 के साथ मर्ज किया गया",
    },
    routedDetail: {
      en: "045 · BESCOM & Electrical Cell",
      kn: "045 · ಬೆಸ್ಕಾಂ ಮತ್ತು ವಿದ್ಯುತ್ ಘಟಕ",
      hi: "045 · बेस्कॉम और विद्युत सेल",
    },
  },
  {
    id: "0319",
    trackingId: "NM24 0319",
    shortTitle: "Water Leak",
    photo: "/evidence/waterleak.jpg",
    progressPercent: "75%",
    complete: {
      en: "3 of 4 complete",
      kn: "4ರಲ್ಲಿ 3 ಪೂರ್ಣ",
      hi: "4 में से 3 पूरे",
    },
    complaint: {
      en: "Complaint 0319",
      kn: "ದೂರು 0319",
      hi: "शिकायत 0319",
    },
    category: {
      en: "WATER MAIN LEAK",
      kn: "ಕುಡಿಯುವ ನೀರು ಸೋರಿಕೆ",
      hi: "पानी पाइपलाइन रिसाव",
    },
    location: {
      en: "CMH Road, Indiranagar",
      kn: "ಸಿಎಂಎಚ್ ರಸ್ತೆ, ಇಂದಿರಾನಗರ",
      hi: "सीएमएच रोड, इंदिरानगर",
    },
    caption: {
      en: "Pressurized drinking water pipeline burst, flooding roadway",
      kn: "ಕುಡಿಯುವ ನೀರಿನ ಪೈಪ್ ಒಡೆದು ರಸ್ತೆಯ ಮೇಲೆ ಹರಿಯುತ್ತಿದೆ",
      hi: "मुख्य पेयजल पाइपलाइन फटने से सड़क पर पानी भर गया",
    },
    classifiedDetail: {
      en: "BWSSB Water Main · 97% confidence",
      kn: "ನೀರು ಸರಬರಾಜು · 97% ನಂಬಿಕೆ",
      hi: "जल रिसाव · 97% भरोसा",
    },
    duplicateDetail: {
      en: "Urgent severity alert routed to engineer",
      kn: "ತುರ್ತು ಎಚ್ಚರಿಕೆ ಇಂಜಿನಿಯರ್‌ಗೆ ರವಾನೆ",
      hi: "फील्ड इंजीनियर को तत्काल अलर्ट भेजा गया",
    },
    routedDetail: {
      en: "112 · BWSSB Water Supply Unit",
      kn: "112 · ಬಿಡಬ್ಲ್ಯೂಎಸ್ಎಸ್‌ಬಿ ನೀರು ಸರಬರಾಜು",
      hi: "112 · बीडब्ल्यूएसएसबी जल आपूर्ति",
    },
  },
];

export default function Landing() {
  const [incidentReady, setIncidentReady] = useState(false);
  const [enteringApp, setEnteringApp] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [proofScenario, setProofScenario] = useState<"pothole" | "garbage">("pothole");
  const [demoIndex, setDemoIndex] = useState(0);
  const [isDemoFading, setIsDemoFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsDemoFading(true);
      setTimeout(() => {
        setDemoIndex((prev) => (prev + 1) % DEMO_COMPLAINTS.length);
        setIsDemoFading(false);
      }, 260);
    }, 20000);

    return () => clearInterval(timer);
  }, [demoIndex]);

  const selectDemoComplaint = (idx: number) => {
    if (idx === demoIndex) return;
    setIsDemoFading(true);
    setTimeout(() => {
      setDemoIndex(idx);
      setIsDemoFading(false);
    }, 260);
  };

  const activeDemo = DEMO_COMPLAINTS[demoIndex];
  const { openDrawer } = useAwsDrawer();
  const { openAi } = useCivicAi();
  const [, navigate] = useLocation();
  const copy = translations[language];

  const goTo = (path: string) => (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    navigate(path);
  };

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

          <nav className="desktop-landing-nav">
            <Link
              href="/upload"
              className="landing-nav-link"
              onClick={goTo("/upload")}
            >
              <Camera size={14} /> Report Issue
            </Link>
            <Link
              href="/track"
              className="landing-nav-link"
              onClick={goTo("/track")}
            >
              <Search size={14} /> Track Status
            </Link>
            <Link
              href="/dashboard"
              className="landing-nav-link"
              onClick={goTo("/dashboard")}
            >
              <TrendingUp size={14} /> Trends & Dashboard
            </Link>
          </nav>

          <div className="landing-header-tools">
            <button
              type="button"
              className="aws-inspect-header-btn"
              onClick={openAi}
              title="Ask NammaFix AI Civic Copilot"
            >
              <Bot size={13} className="text-emerald-400" />
              <span>Ask AI Copilot</span>
            </button>
            <button
              type="button"
              className="aws-inspect-header-btn"
              onClick={openDrawer}
              title="Inspect AWS Cloud Architecture"
            >
              <Zap size={13} className="text-amber-400" />
              <span>AWS Cloud</span>
            </button>
            <div className="landing-header-note">
              <span className="live-dot" /> Bengaluru Live
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
            <div className="hero-actions" style={{ flexWrap: "wrap", gap: "10px" }}>
              <Link
                href="/upload"
                className="hero-cta"
                onClick={goTo("/upload")}
                style={{ textDecoration: "none", cursor: "pointer" }}
              >
                <Camera size={16} /> Report with Voice + Photo <ArrowRight size={16} />
              </Link>
              <Link
                href="/track"
                className="hero-cta-secondary"
                onClick={goTo("/track")}
                style={{ cursor: "pointer" }}
              >
                <Search size={14} /> Track by ID
              </Link>
              <Link
                href="/dashboard"
                className="hero-cta-secondary"
                onClick={goTo("/dashboard")}
                style={{ cursor: "pointer" }}
              >
                <TrendingUp size={14} /> Civic Trends & Ward Analytics
              </Link>
              <button
                type="button"
                className="hero-cta-secondary"
                onClick={openAi}
                style={{ cursor: "pointer", background: "rgba(16, 185, 129, 0.15)", borderColor: "rgba(16, 185, 129, 0.4)" }}
              >
                <Bot size={14} style={{ color: "#34d399" }} /> Ask AI Copilot
              </button>
            </div>
          </div>

          <div className="hero-console" aria-label="NammaFix live demo pipeline">
            <style>{`
              @keyframes timer-progress {
                0% { width: 0%; }
                100% { width: 100%; }
              }
            `}</style>
            <div className="console-top">
              <span>
                <span className="console-live" /> {copy.live} · 20s auto-rotation
              </span>
              <span>{activeDemo.complaint[language]}</span>
            </div>

            {/* Quick Complaint Category Switcher with 20s Progress Bar */}
            <div
              className="console-switcher-bar"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "5px",
                marginBottom: "12px",
              }}
            >
              {DEMO_COMPLAINTS.map((item, idx) => {
                const isSelected = idx === demoIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectDemoComplaint(idx)}
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      padding: "6px 2px 8px",
                      borderRadius: "7px",
                      border: isSelected ? "1px solid #10b981" : "1px solid rgba(13, 118, 106, 0.18)",
                      background: isSelected ? "#0d766a" : "rgba(242, 252, 247, 0.9)",
                      color: isSelected ? "#ffffff" : "#2d544c",
                      fontSize: "9px",
                      fontWeight: 750,
                      cursor: "pointer",
                      textAlign: "center",
                      lineHeight: "1.2",
                      transition: "all 0.2s ease",
                    }}
                    title={`View ${item.shortTitle} Complaint`}
                  >
                    <div>{item.shortTitle}</div>
                    <div style={{ fontSize: "7.5px", opacity: 0.8, marginTop: "1px" }}>{item.id}</div>
                    {isSelected && (
                      <span
                        key={`bar-${demoIndex}`}
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          height: "2.5px",
                          background: "#34d399",
                          animation: "timer-progress 20s linear forwards",
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                opacity: isDemoFading ? 0.25 : 1,
                transform: isDemoFading ? "scale(0.985)" : "scale(1)",
                transition: "opacity 0.25s ease, transform 0.25s ease",
              }}
            >
              <div className="console-photo">
                <img src={activeDemo.photo} alt={activeDemo.category[language]} />
                <div className="console-photo-label">
                  <strong>{activeDemo.category[language]}</strong>
                  <span>{activeDemo.location[language]}</span>
                </div>
              </div>
              <div className="console-caption">
                <span className="console-caption-icon">
                  <Camera size={13} />
                </span>
                <span>{activeDemo.caption[language]}</span>
              </div>
              <div className="console-progress">
                <div className="console-progress-head">
                  <span>{copy.pipeline}</span>
                  <span>{activeDemo.complete[language]}</span>
                </div>
                <div className="console-progress-line">
                  <span style={{ width: activeDemo.progressPercent }} />
                </div>
              </div>
              <div className="console-steps">
                <div className="console-step complete">
                  <span>
                    <Check size={12} />
                  </span>
                  <div>
                    <strong>{copy.classified}</strong>
                    <small>{activeDemo.classifiedDetail[language]}</small>
                  </div>
                </div>
                <div className="console-step complete">
                  <span>
                    <Check size={12} />
                  </span>
                  <div>
                    <strong>{copy.duplicate}</strong>
                    <small>{activeDemo.duplicateDetail[language]}</small>
                  </div>
                </div>
                <div className="console-step active">
                  <span>
                    <Route size={12} />
                  </span>
                  <div>
                    <strong>{copy.routed}</strong>
                    <small>{activeDemo.routedDetail[language]}</small>
                  </div>
                </div>
              </div>
              <div className="console-receipt">
                <div>
                  <span>{copy.tracking}</span>
                  <strong>{activeDemo.trackingId}</strong>
                </div>
                <div className="receipt-language">
                  <Languages size={14} />
                  <span>{copy.language}</span>
                </div>
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
            <span>Bengaluru Citywide Annual Estimates (Illustrative)</span>
            <strong>7.81L</strong>
            <small>public municipal grievances recorded across city portals*</small>
          </div>
          <div className="context-stat">
            <AlertTriangle size={18} />
            <strong>Real-time</strong>
            <small>duplicate cases caught within 500m radius</small>
          </div>
          <div className="context-stat">
            <CheckCircle2 size={18} />
            <strong>100%</strong>
            <small>distinct after-photos required before resolution</small>
          </div>
        </div>
        <p style={{ marginTop: "12px", fontSize: "11.5px", color: "#6b8078", fontStyle: "italic" }}>
          * Historical public reference figures for Bengaluru civic grievance volume (illustrative context, not live app instances).
        </p>
      </section>

      {/* Core Civic Capabilities Showcase Section */}
      <section className="features-showcase-section">
        <div className="features-showcase-header">
          <span className="section-kicker">Integrated Civic Platform</span>
          <h2>Explore All Civic Capabilities</h2>
          <p>
            From voice grievance capture in local dialects to real-time public tracking and AI copilot guidance,
            every civic action is backed by transparent verification.
          </p>
        </div>

        <div className="features-showcase-grid">
          {/* Card 1: Audio & Voice Recording */}
          <div className="feature-showcase-card">
            <div className="feature-card-icon">
              <Mic size={22} />
            </div>
            <span className="feature-card-tag">Citizen Input</span>
            <h3 className="feature-card-title">Voice Note & Audio Evidence</h3>
            <p className="feature-card-desc">
              Speak in Kannada, English, or Hindi. Record real-time voice notes on the street to explain potholes, garbage, or water leaks without typing.
            </p>
            <Link href="/upload" className="feature-redirect-btn" onClick={goTo("/upload")}>
              Record Audio & Report <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 2: Public Tracking by ID */}
          <div className="feature-showcase-card">
            <div className="feature-card-icon">
              <Search size={22} />
            </div>
            <span className="feature-card-tag">Transparency</span>
            <h3 className="feature-card-title">Public Ticket Tracking & Feedback</h3>
            <p className="feature-card-desc">
              Lookup any complaint by ID (e.g. <code>cmp-027</code> or tracking code). View 3-stage progress, WhatsApp share links, and leave citizen comments.
            </p>
            <Link href="/track" className="feature-redirect-btn" onClick={goTo("/track")}>
              Track Public Status <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 3: Ward Analytics & Trend Charts */}
          <div className="feature-showcase-card">
            <div className="feature-card-icon">
              <TrendingUp size={22} />
            </div>
            <span className="feature-card-tag">Analytics</span>
            <h3 className="feature-card-title">Ward Volume Trends & Charts</h3>
            <p className="feature-card-desc">
              Explore interactive category trends and ward resolution breakdowns over 7, 14, and 30 days powered by dynamic Recharts visualizers.
            </p>
            <Link href="/dashboard" className="feature-redirect-btn" onClick={goTo("/dashboard")}>
              View Trend Charts <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 4: AI Civic Copilot */}
          <div className="feature-showcase-card">
            <div className="feature-card-icon">
              <Bot size={22} />
            </div>
            <span className="feature-card-tag">Assistant</span>
            <h3 className="feature-card-title">NammaFix AI Civic Copilot</h3>
            <p className="feature-card-desc">
              Have questions about BBMP Sakala SLAs, BWSSB water tanker contacts, or pothole compensation bylaws? Ask our streaming AI Copilot anytime.
            </p>
            <button
              type="button"
              className="feature-redirect-btn"
              onClick={openAi}
              style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, font: "inherit", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              Ask AI Assistant <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 5: Proof Verification */}
          <div className="feature-showcase-card">
            <div className="feature-card-icon">
              <Camera size={22} />
            </div>
            <span className="feature-card-tag">Verification</span>
            <h3 className="feature-card-title">Before / After Proof Verification</h3>
            <p className="feature-card-desc">
              Inspect Rekognition computer vision comparison. Citizens inspect work evidence with an interactive slider before closing the ticket.
            </p>
            <Link href="/resolution/cmp-027" className="feature-redirect-btn" onClick={goTo("/resolution/cmp-027")}>
              Inspect Proof Demo <ArrowRight size={14} />
            </Link>
          </div>

          {/* Card 6: Municipal Data Export */}
          <div className="feature-showcase-card">
            <div className="feature-card-icon">
              <Download size={22} />
            </div>
            <span className="feature-card-tag">Open Data</span>
            <h3 className="feature-card-title">Municipal CSV Data Export</h3>
            <p className="feature-card-desc">
              Download clean municipal incident data for RTI audits, ward committee meetings, and BBMP grievance record keeping with one click.
            </p>
            <Link href="/dashboard" className="feature-redirect-btn" onClick={goTo("/dashboard")}>
              Open Dashboard Export <ArrowRight size={14} />
            </Link>
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
            afterImage={proofScenario === "pothole" ? images.potholeAfter : images.garbageAfter}
            beforeLabel={proofScenario === "pothole" ? "BEFORE · POTHOLE HAZARD" : "BEFORE · GARBAGE DUMP"}
            afterLabel={proofScenario === "pothole" ? "AFTER · REPAIRED ASPHALT" : "AFTER · CLEARED SIDEWALK"}
            aspectRatio="16 / 10"
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
        <div style={{ display: "flex", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/upload" onClick={goTo("/upload")} style={{ color: "rgba(255, 255, 255, 0.75)", textDecoration: "none", fontSize: "12px", cursor: "pointer" }}>
            Report Issue
          </Link>
          <Link href="/track" onClick={goTo("/track")} style={{ color: "rgba(255, 255, 255, 0.75)", textDecoration: "none", fontSize: "12px", cursor: "pointer" }}>
            Track by ID
          </Link>
          <Link href="/dashboard" onClick={goTo("/dashboard")} style={{ color: "rgba(255, 255, 255, 0.75)", textDecoration: "none", fontSize: "12px", cursor: "pointer" }}>
            Civic Trends
          </Link>
        </div>
        <Link href="/upload" onClick={goTo("/upload")} style={{ cursor: "pointer" }}>
          Enter the app <ChevronRight size={14} />
        </Link>
      </footer>
    </div>
  );
}
