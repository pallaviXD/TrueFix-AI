export type Category = "garbage" | "pothole";
export type ComplaintStatus = "Submitted" | "Routed" | "Needs Review" | "Resolved" | "Disputed";

export type Complaint = {
  id: string;
  trackingId: string;
  category: Category;
  status: ComplaintStatus;
  title: string;
  titleKannada: string;
  caption: string;
  ward: string;
  department: string;
  confidence: number;
  location: string;
  coordinates: { lat: number; lng: number };
  createdAt: string;
  photo: string;
  afterPhoto?: string;
  duplicateOf?: string;
  resolutionNote?: string;
};

export type SubmitReportInput = {
  photo: string;
  caption?: string;
  location: string;
  coordinates: { lat: number; lng: number };
};

const images = {
  garbageOne:
    "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=1200&q=80",
  garbageTwo:
    "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1200&q=80",
  pothole:
    "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1200&q=80",
  potholeTwo:
    "https://images.unsplash.com/photo-1599818816930-4e59c5f8e658?auto=format&fit=crop&w=1200&q=80",
  cleanStreet:
    "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
};

let complaints: Complaint[] = [
  {
    id: "cmp-027",
    trackingId: "NF-2026-0919-027",
    category: "garbage",
    status: "Needs Review",
    title: "Overflowing waste collection point near 12th Main",
    titleKannada: "12ನೇ ಮುಖ್ಯ ರಸ್ತೆಯ ಬಳಿ ತುಂಬಿ ಹರಿಯುತ್ತಿರುವ ಕಸದ ಸಂಗ್ರಹಣಾ ಸ್ಥಳ",
    caption: "Garbage has been piling up beside the bus stop for three days.",
    ward: "151 · Domlur",
    department: "BBMP Solid Waste Management",
    confidence: 0.89,
    location: "12th Main Road, Indiranagar",
    coordinates: { lat: 12.9784, lng: 77.6408 },
    createdAt: "2026-09-19T12:18:00+05:30",
    photo: images.garbageOne,
    duplicateOf: "NF-2026-0919-024",
  },
  {
    id: "cmp-026",
    trackingId: "NF-2026-0919-026",
    category: "pothole",
    status: "Routed",
    title: "Deep pothole creating a hazard for two-wheelers",
    titleKannada: "ದ್ವಿಚಕ್ರ ವಾಹನಗಳಿಗೆ ಅಪಾಯ ಉಂಟುಮಾಡುತ್ತಿರುವ ಆಳವಾದ ರಸ್ತೆ ಗುಂಡಿ",
    caption: "Large pothole after the metro pillar; water collects here when it rains.",
    ward: "150 · Koramangala",
    department: "BBMP Road Infrastructure",
    confidence: 0.94,
    location: "80 Feet Road, Koramangala",
    coordinates: { lat: 12.9352, lng: 77.6245 },
    createdAt: "2026-09-18T17:42:00+05:30",
    photo: images.pothole,
  },
  {
    id: "cmp-025",
    trackingId: "NF-2026-0918-025",
    category: "garbage",
    status: "Submitted",
    title: "Mixed waste dumped beside the footpath",
    titleKannada: "ಪಾದಚಾರಿ ಮಾರ್ಗದ ಪಕ್ಕದಲ್ಲಿ ಮಿಶ್ರ ಕಸ ಎಸೆಯಲಾಗಿದೆ",
    caption: "The footpath is blocked by bags and food waste.",
    ward: "147 · HSR Layout",
    department: "BBMP Solid Waste Management",
    confidence: 0.86,
    location: "27th Main, HSR Layout",
    coordinates: { lat: 12.9116, lng: 77.6389 },
    createdAt: "2026-09-18T09:06:00+05:30",
    photo: images.garbageTwo,
  },
  {
    id: "cmp-024",
    trackingId: "NF-2026-0917-024",
    category: "pothole",
    status: "Resolved",
    title: "Road surface broken near the school crossing",
    titleKannada: "ಶಾಲೆಯ ಕ್ರಾಸಿಂಗ್ ಬಳಿ ಹಾಳಾದ ರಸ್ತೆ ಮೇಲ್ಮೈ",
    caption: "The patch had widened and was difficult to see at night.",
    ward: "154 · Jayanagar",
    department: "BBMP Road Infrastructure",
    confidence: 0.91,
    location: "4th Block, Jayanagar",
    coordinates: { lat: 12.925, lng: 77.5938 },
    createdAt: "2026-09-17T14:22:00+05:30",
    photo: images.potholeTwo,
    afterPhoto: images.cleanStreet,
    resolutionNote: "Before/after photo checked by the reporter on 19 Sep 2026.",
  },
  {
    id: "cmp-023",
    trackingId: "NF-2026-0916-023",
    category: "garbage",
    status: "Disputed",
    title: "Overflowing bin still blocking the lane",
    titleKannada: "ತುಂಬಿದ ಕಸದ ಬುಟ್ಟಿ ಇನ್ನೂ ದಾರಿಯನ್ನು ತಡೆಯುತ್ತಿದೆ",
    caption: "Marked resolved, but bags are still being left around the bin.",
    ward: "149 · BTM Layout",
    department: "BBMP Solid Waste Management",
    confidence: 0.83,
    location: "2nd Stage, BTM Layout",
    coordinates: { lat: 12.9166, lng: 77.6101 },
    createdAt: "2026-09-16T19:05:00+05:30",
    photo: images.garbageOne,
    afterPhoto: images.garbageTwo,
  },
];

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  async listComplaints(): Promise<Complaint[]> {
    await pause(420);
    return [...complaints].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getComplaint(id: string): Promise<Complaint | null> {
    await pause(360);
    return complaints.find((complaint) => complaint.id === id) ?? null;
  },

  async submitReport(input: SubmitReportInput): Promise<Complaint> {
    await pause(1250);
    const isPothole = /pothole|road|hole|ಗುಂಡಿ/i.test(input.caption ?? "");
    const category: Category = isPothole ? "pothole" : "garbage";
    const id = `cmp-${String(complaints.length + 28).padStart(3, "0")}`;
    const trackingId = `NF-2026-0919-${String(complaints.length + 28).padStart(3, "0")}`;
    const complaint: Complaint = {
      id,
      trackingId,
      category,
      status: "Submitted",
      title: isPothole
        ? "Road damage detected near the reported location"
        : "Uncollected waste detected near the reported location",
      titleKannada: isPothole
        ? "ವರದಿ ಮಾಡಿದ ಸ್ಥಳದ ಬಳಿ ರಸ್ತೆ ಹಾನಿ ಪತ್ತೆಯಾಗಿದೆ"
        : "ವರದಿ ಮಾಡಿದ ಸ್ಥಳದ ಬಳಿ ಸಂಗ್ರಹಿಸದ ಕಸ ಪತ್ತೆಯಾಗಿದೆ",
      caption: input.caption || "Photo submitted without an additional note.",
      ward: "151 · Domlur",
      department: isPothole ? "BBMP Road Infrastructure" : "BBMP Solid Waste Management",
      confidence: isPothole ? 0.92 : 0.88,
      location: input.location,
      coordinates: input.coordinates,
      createdAt: new Date().toISOString(),
      photo: input.photo,
    };
    complaints = [complaint, ...complaints];
    return complaint;
  },

  async uploadAfterPhoto(id: string, afterPhoto: string): Promise<Complaint | null> {
    await pause(680);
    complaints = complaints.map((complaint) =>
      complaint.id === id ? { ...complaint, afterPhoto } : complaint,
    );
    return complaints.find((complaint) => complaint.id === id) ?? null;
  },

  async confirmResolution(id: string, outcome: "fixed" | "not-fixed"): Promise<Complaint | null> {
    await pause(760);
    complaints = complaints.map((complaint) =>
      complaint.id === id
        ? {
            ...complaint,
            status: outcome === "fixed" ? "Resolved" : "Disputed",
            resolutionNote:
              outcome === "fixed"
                ? "Before/after photo checked by the reporter."
                : "Reporter says the issue remains after the reported resolution.",
          }
        : complaint,
    );
    return complaints.find((complaint) => complaint.id === id) ?? null;
  },
};

export { images };
