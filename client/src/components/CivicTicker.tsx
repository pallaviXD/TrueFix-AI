import React from "react";
import { Activity, ShieldCheck, MapPin, Sparkles } from "lucide-react";

const civicUpdates = [
  { ward: "Ward 151 · Domlur", action: "Garbage cleared & verified by citizen proof", time: "4m ago", status: "Resolved" },
  { ward: "Ward 150 · Koramangala", action: "80 Ft Rd pothole scheduled for BBMP patch", time: "11m ago", status: "Routed" },
  { ward: "Ward 154 · Jayanagar", action: "Road surface repaired near 4th Block school", time: "22m ago", status: "Resolved" },
  { ward: "Ward 147 · HSR Layout", action: "Mixed waste pile flagged near 27th Main", time: "35m ago", status: "Submitted" },
  { ward: "Ward 149 · BTM Layout", action: "Dispute opened: Resident submitted uncleaned proof", time: "48m ago", status: "Disputed" },
  { ward: "Ward 112 · Malleshwaram", action: "Drain silt removed following citizen report", time: "1h ago", status: "Resolved" },
];

export function CivicTicker() {
  return (
    <div className="civic-ticker-strip">
      <div className="ticker-label">
        <span className="ticker-pulse" />
        <Activity size={13} className="text-emerald-400" />
        <span>BENGALURU LIVE PULSE</span>
      </div>
      <div className="ticker-track-wrap">
        <div className="ticker-track">
          {civicUpdates.concat(civicUpdates).map((item, idx) => (
            <div key={idx} className="ticker-item">
              <span className="ticker-ward">
                <MapPin size={11} /> {item.ward}
              </span>
              <span className="ticker-action">{item.action}</span>
              <span className="ticker-time">{item.time}</span>
              <span className={`ticker-tag tag-${item.status.toLowerCase().replace(/\s+/g, "-")}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CivicTicker;
