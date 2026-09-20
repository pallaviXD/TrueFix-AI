import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Bot,
  HelpCircle,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  User,
  X,
  Zap,
} from "lucide-react";
import { Streamdown } from "streamdown";

type Message = {
  role: "user" | "assistant";
  content: string;
  time?: string;
};

const SUGGESTED_PROMPTS = [
  "What is BBMP's resolution timeline for potholes?",
  "How do I report overflowing garbage in Domlur?",
  "How does Before / After photo verification work?",
  "What happens if my issue is flagged as a duplicate?",
];

const PREDEFINED_CIVIC_KNOWLEDGE: Record<string, string> = {
  pothole: `### 🚧 BBMP Road Infrastructure SLA for Potholes

- **Standard Resolution Window**: **48 to 72 hours** from verified intake.
- **Priority Corridors**: Major arterial roads (e.g., 80 Feet Road, Outer Ring Road, Hosur Road) receive emergency cold-mix asphalt patch within **24 hours**.
- **Ward Assignment**: Managed by the **BBMP Major Roads & Road Infrastructure Department** under the respective Ward Assistant Executive Engineer (AEE).
- **Verification Rule**: NammaFix will prompt you for an **After Photo** at the same GPS coordinates to verify that the asphalt fill holds up against traffic.`,

  garbage: `### 🗑️ BBMP Solid Waste Management (SWM) Guidelines

- **Standard Clearing Window**: **12 to 24 hours** for blackspots and overflowing public collection bins.
- **Door-to-Door Collection**: 6:30 AM to 1:00 PM daily across all 243 BBMP wards.
- **Assigned Authority**: BBMP Junior Health Inspector (JHI) and dry/wet waste compactor fleet coordinators.
- **Escalation**: If uncollected for > 48 hours, NammaFix automatically tags the issue for Zonal Chief Health Officer review.`,

  verification: `### 📸 How Before / After Photo Verification Works

1. **Intake Photo**: When you report an issue, Amazon Rekognition extracts geotags, AI confidence scores, and categorical labels.
2. **Ward Action**: The municipal team marks the work done and provides field notes.
3. **Reporter Proof Loop**: Unlike traditional portals that auto-close tickets, NammaFix returns the case to **you**.
4. **Your Verdict**: You take a photo of the resolved spot using our interactive Before/After slider. If it's not fixed, you can dispute it in one click!`,

  duplicate: `### 🔍 AI Deduplication & Civic Signal Merging

- **How It Works**: When multiple citizens report the same garbage pile or pothole within a **50-meter radius**, NammaFix matches the GPS coordinates and Rekognition image embedding.
- **Why It Matters**: Instead of opening 10 conflicting municipal work orders, NammaFix links your report to the existing ticket (e.g., \`NF-2026-0919-024\`).
- **Benefit**: Your evidence strengthens the priority of the issue without wasting civic contractor funds on duplicate tenders!`,
};

export function CivicAiAssistant({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Namaskara! I am **NammaFix AI Civic Copilot**. Ask me anything about Bengaluru municipal bylaws, BBMP ward jurisdiction, resolution timelines, or how to verify civic proof.",
      time: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg: Message = {
      role: "user",
      content: trimmed,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Generate smart context-aware response
    setTimeout(() => {
      let reply = "";
      const lower = trimmed.toLowerCase();

      if (lower.includes("pothole") || lower.includes("road") || lower.includes("ಗುಂಡಿ")) {
        reply = PREDEFINED_CIVIC_KNOWLEDGE.pothole;
      } else if (lower.includes("garbage") || lower.includes("waste") || lower.includes("ಕಸ")) {
        reply = PREDEFINED_CIVIC_KNOWLEDGE.garbage;
      } else if (lower.includes("verification") || lower.includes("proof") || lower.includes("after photo")) {
        reply = PREDEFINED_CIVIC_KNOWLEDGE.verification;
      } else if (lower.includes("duplicate") || lower.includes("same issue")) {
        reply = PREDEFINED_CIVIC_KNOWLEDGE.duplicate;
      } else {
        reply = `**Bengaluru Civic Advice for:** _"${trimmed}"_\n\n- **Jurisdiction**: Reports within BBMP limits are classified by Ward (Wards 1 to 243) and routed automatically to either **Solid Waste Management** or **Road Infrastructure**.\n- **Sahaya 2.0 Integration**: NammaFix issues can be cross-tracked with BBMP Sahaya (Toll-free 1533).\n- **Voice Notes**: You can also record voice evidence in Kannada, English, or Hindi on our Report page, which Whisper AI transcribes automatically.\n\nNeed help tracking an existing report? Go to **/track** with your tracking ID!`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setIsTyping(false);
    }, 750);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  if (!isOpen) return null;

  return (
    <div className="aws-drawer-backdrop" onClick={onClose}>
      <div
        className="aws-drawer-panel"
        style={{ maxWidth: "560px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="aws-drawer-header">
          <div className="aws-drawer-title-group">
            <div className="aws-badge" style={{ background: "rgba(52, 211, 153, 0.15)", color: "#34d399", borderColor: "rgba(52, 211, 153, 0.35)" }}>
              <Bot size={12} /> Civic Action Copilot
            </div>
            <h2>Ask NammaFix AI</h2>
            <p>Instant answers on BBMP bylaws, SLAs, ward teams, and civic proof.</p>
          </div>
          <button type="button" className="aws-drawer-close" onClick={onClose} aria-label="Close Assistant">
            <X size={18} />
          </button>
        </div>

        {/* Message Thread */}
        <div
          className="aws-drawer-body"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            background: "#081614",
            padding: "20px 24px",
          }}
        >
          {messages.map((msg, index) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                  flexDirection: isUser ? "row-reverse" : "row",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: isUser ? "#0b756d" : "#0d2b25",
                    border: `1px solid ${isUser ? "#10b981" : "#34d399"}`,
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    flex: "0 0 auto",
                  }}
                >
                  {isUser ? <User size={14} /> : <Bot size={15} className="text-emerald-400" />}
                </div>

                <div
                  style={{
                    maxWidth: "82%",
                    padding: "12px 16px",
                    borderRadius: "14px",
                    background: isUser ? "#0f362e" : "#0e231f",
                    border: `1px solid ${isUser ? "rgba(52, 211, 153, 0.4)" : "rgba(56, 138, 117, 0.3)"}`,
                    color: "#e8f5f1",
                    fontSize: "12.5px",
                    lineHeight: "1.55",
                  }}
                >
                  <Streamdown>{msg.content}</Streamdown>
                  {msg.time && (
                    <span
                      style={{
                        display: "block",
                        fontSize: "9px",
                        color: "#6f948a",
                        marginTop: "6px",
                        textAlign: isUser ? "right" : "left",
                      }}
                    >
                      {msg.time}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "#0d2b25",
                  border: "1px solid #34d399",
                  color: "#34d399",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Bot size={15} />
              </div>
              <div
                style={{
                  padding: "8px 14px",
                  borderRadius: "12px",
                  background: "#0e231f",
                  border: "1px solid rgba(56, 138, 117, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#a7f3d0",
                  fontSize: "11px",
                }}
              >
                <Loader2 size={13} className="animate-spin text-emerald-400" />
                <span>NammaFix AI is analyzing civic bylaws…</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Suggestions */}
        <div
          style={{
            padding: "10px 20px",
            background: "#091a17",
            borderTop: "1px solid rgba(56, 138, 117, 0.2)",
            display: "flex",
            gap: "8px",
            overflowX: "auto",
          }}
        >
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(prompt)}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(56, 138, 117, 0.3)",
                color: "#c2dfd6",
                fontSize: "10.5px",
                padding: "5px 10px",
                borderRadius: "999px",
                whiteSpace: "nowrap",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#34d399")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "rgba(56, 138, 117, 0.3)")
              }
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={onSubmit}
          style={{
            padding: "16px 20px",
            background: "#061311",
            borderTop: "1px solid rgba(56, 138, 117, 0.3)",
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about BBMP jurisdiction, potholes, SLAs, or verification…"
            style={{
              flex: 1,
              background: "#0d231f",
              border: "1px solid rgba(56, 138, 117, 0.4)",
              color: "#e6f5ef",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "12.5px",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "#059669",
              color: "#fff",
              border: "none",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              opacity: !input.trim() || isTyping ? 0.5 : 1,
              transition: "background 0.15s ease",
            }}
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default CivicAiAssistant;
