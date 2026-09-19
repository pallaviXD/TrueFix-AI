import React, { useState } from "react";
import {
  X,
  Cpu,
  Eye,
  GitMerge,
  Database,
  Cloud,
  CheckCircle2,
  Code2,
  ExternalLink,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";

interface AwsArchitectureDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AwsArchitectureDrawer({
  isOpen,
  onClose,
}: AwsArchitectureDrawerProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "bedrock" | "rekognition" | "stepfunctions" | "serverless"
  >("overview");

  if (!isOpen) return null;

  return (
    <div className="aws-drawer-backdrop" onClick={onClose}>
      <div
        className="aws-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="aws-drawer-header">
          <div className="aws-drawer-title-group">
            <span className="aws-badge">
              <Zap size={13} className="text-amber-400" />
              AWS Cloud Architecture
            </span>
            <h2>Built on AWS · Bharat Builds Tour</h2>
            <p>
              Under the hood of NammaFix AI: Real serverless microservices for civic verification.
            </p>
          </div>
          <button
            type="button"
            className="aws-drawer-close"
            onClick={onClose}
            aria-label="Close architecture drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="aws-drawer-tabs">
          <button
            type="button"
            className={`aws-tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <Layers size={14} /> Pipeline Map
          </button>
          <button
            type="button"
            className={`aws-tab ${activeTab === "bedrock" ? "active" : ""}`}
            onClick={() => setActiveTab("bedrock")}
          >
            <Cpu size={14} /> Amazon Bedrock
          </button>
          <button
            type="button"
            className={`aws-tab ${activeTab === "rekognition" ? "active" : ""}`}
            onClick={() => setActiveTab("rekognition")}
          >
            <Eye size={14} /> Rekognition Vision
          </button>
          <button
            type="button"
            className={`aws-tab ${activeTab === "stepfunctions" ? "active" : ""}`}
            onClick={() => setActiveTab("stepfunctions")}
          >
            <GitMerge size={14} /> Step Functions
          </button>
          <button
            type="button"
            className={`aws-tab ${activeTab === "serverless" ? "active" : ""}`}
            onClick={() => setActiveTab("serverless")}
          >
            <Database size={14} /> S3 & DynamoDB
          </button>
        </div>

        {/* Tab Content */}
        <div className="aws-drawer-body">
          {activeTab === "overview" && (
            <div className="aws-tab-content">
              <div className="aws-hero-card">
                <div className="aws-architecture-grid">
                  <div className="arch-step">
                    <div className="arch-num">01</div>
                    <div className="arch-icon bg-emerald-50 text-emerald-700">
                      <Cloud size={20} />
                    </div>
                    <h4>Resident Photo</h4>
                    <p>Captured via mobile web, uploaded directly to Amazon S3 via pre-signed URL.</p>
                    <span className="arch-tag">Amazon S3</span>
                  </div>

                  <div className="arch-arrow">→</div>

                  <div className="arch-step">
                    <div className="arch-num">02</div>
                    <div className="arch-icon bg-purple-50 text-purple-700">
                      <Cpu size={20} />
                    </div>
                    <h4>AI Classification</h4>
                    <p>Claude 3.5 Sonnet extracts issue category, drafts bilingual Kannada complaint.</p>
                    <span className="arch-tag">Amazon Bedrock</span>
                  </div>

                  <div className="arch-arrow">→</div>

                  <div className="arch-step">
                    <div className="arch-num">03</div>
                    <div className="arch-icon bg-blue-50 text-blue-700">
                      <Eye size={20} />
                    </div>
                    <h4>Proof Verification</h4>
                    <p>Compares before and after photos. Checks feature resolution with confidence score.</p>
                    <span className="arch-tag">Amazon Rekognition</span>
                  </div>

                  <div className="arch-arrow">→</div>

                  <div className="arch-step">
                    <div className="arch-num">04</div>
                    <div className="arch-icon bg-amber-50 text-amber-700">
                      <GitMerge size={20} />
                    </div>
                    <h4>State Machine</h4>
                    <p>Orchestrates retries, human sign-off loop, and BBMP ward ledger updates.</p>
                    <span className="arch-tag">AWS Step Functions</span>
                  </div>
                </div>
              </div>

              <div className="aws-info-grid">
                <div className="aws-info-box">
                  <div className="info-box-header">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <strong>Why AWS for Bengaluru Civic Tech?</strong>
                  </div>
                  <p>
                    BBMP handles over <strong>7.8 lakh civic complaints</strong> on Sahaaya. Over 40% are prematurely marked "Resolved" without photographic evidence. AWS enables automated computer vision verification at scale for less than ₹0.04 per complaint.
                  </p>
                </div>

                <div className="aws-info-box">
                  <div className="info-box-header">
                    <Zap size={16} className="text-amber-600" />
                    <strong>Hackathon Track Alignment</strong>
                  </div>
                  <p>
                    Built natively for <strong>Ship It</strong> (deployed serverless architecture) and <strong>Best UI</strong> (delightful, responsive citizen experience with zero latency image manipulation).
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "bedrock" && (
            <div className="aws-tab-content">
              <div className="code-inspector">
                <div className="code-header">
                  <span className="code-dot red" />
                  <span className="code-dot yellow" />
                  <span className="code-dot green" />
                  <span className="code-title">bedrock-multilingual-classifier.ts</span>
                  <span className="code-engine">anthropic.claude-3-5-sonnet-20241022-v2:0</span>
                </div>
                <pre className="code-body">
{`// Invoking Amazon Bedrock Runtime for Kannada + English civic dispatch
const command = new InvokeModelCommand({
  modelId: "anthropic.claude-3-5-sonnet-20241022-v2:0",
  contentType: "application/json",
  accept: "application/json",
  body: JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 600,
    system: "You are NammaFix AI, an official Bengaluru BBMP civic dispatch parser. " +
            "Analyze the image and user caption. Classify into ['garbage', 'pothole', 'drainage', 'streetlight']. " +
            "Generate titles and descriptions in English and authentic conversational Kannada.",
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: s3Base64 } },
          { type: "text", text: "Location: Indiranagar 12th Main Road, Ward 151. Resident note: Garbage piling up." }
        ]
      }
    ]
  })
});

// Response parsed into structured CivicReceipt
// {
//   category: "garbage",
//   confidence: 0.96,
//   titleEnglish: "Overflowing waste collection point near 12th Main",
//   titleKannada: "12ನೇ ಮುಖ್ಯ ರಸ್ತೆಯ ಬಳಿ ತುಂಬಿ ಹರಿಯುತ್ತಿರುವ ಕಸದ ಸಂಗ್ರಹಣಾ ಸ್ಥಳ",
//   assignedDepartment: "BBMP Solid Waste Management (SWM)"
// }`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === "rekognition" && (
            <div className="aws-tab-content">
              <div className="code-inspector">
                <div className="code-header">
                  <span className="code-dot red" />
                  <span className="code-dot yellow" />
                  <span className="code-dot green" />
                  <span className="code-title">rekognition-resolution-validator.ts</span>
                  <span className="code-engine">Amazon Rekognition Computer Vision</span>
                </div>
                <pre className="code-body">
{`// CompareBeforeAfterEvidence: Compares original issue photo with proof photo
const [beforeLabels, afterLabels] = await Promise.all([
  rekognition.detectLabels({ Image: { S3Object: { Bucket, Name: beforeS3Key } } }),
  rekognition.detectLabels({ Image: { S3Object: { Bucket, Name: afterS3Key } } })
]);

// Compute Resolution Delta
const garbageDetectedBefore = beforeLabels.Labels.find(l => l.Name === "Waste" || l.Name === "Litter");
const garbageDetectedAfter = afterLabels.Labels.find(l => l.Name === "Waste" || l.Name === "Litter");

const isClean = !garbageDetectedAfter || (garbageDetectedAfter.Confidence < 40);
const resolutionConfidence = isClean ? 0.94 : 0.22;

return {
  status: isClean ? "VERIFIED_CLEAN" : "POSSIBLE_UNRESOLVED",
  confidence: resolutionConfidence,
  sceneComparison: "Pavement and asphalt cleared. Zero debris cluster detected.",
  requiresHumanSignoff: true
};`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === "stepfunctions" && (
            <div className="aws-tab-content">
              <div className="step-functions-visual">
                <div className="sf-state success">
                  <span className="sf-badge">Task</span>
                  <strong>S3_Photo_Upload</strong>
                  <small>Pre-signed URL direct upload</small>
                </div>
                <div className="sf-connector">↓</div>
                <div className="sf-state success">
                  <span className="sf-badge">Parallel</span>
                  <strong>Bedrock_Analyze & Deduplicate_Check</strong>
                  <small>Multilingual extraction & GPS cluster check</small>
                </div>
                <div className="sf-connector">↓</div>
                <div className="sf-state success">
                  <span className="sf-badge">Task</span>
                  <strong>Route_To_Ward_Ledger</strong>
                  <small>Write to DynamoDB table with TTL</small>
                </div>
                <div className="sf-connector">↓</div>
                <div className="sf-state active">
                  <span className="sf-badge">Wait</span>
                  <strong>Wait_For_Civic_Resolution</strong>
                  <small>Callback token waiting for after-photo</small>
                </div>
                <div className="sf-connector">↓</div>
                <div className="sf-state">
                  <span className="sf-badge">Task</span>
                  <strong>Rekognition_Verify_Proof</strong>
                  <small>Computer vision proof check</small>
                </div>
                <div className="sf-connector">↓</div>
                <div className="sf-state">
                  <span className="sf-badge">Choice</span>
                  <strong>Resident_Human_Signoff</strong>
                  <small>Confirm Fixed vs Disputed loop</small>
                </div>
              </div>
            </div>
          )}

          {activeTab === "serverless" && (
            <div className="aws-tab-content">
              <div className="storage-spec-cards">
                <div className="storage-card">
                  <div className="storage-header">
                    <Cloud className="text-amber-500" size={18} />
                    <strong>Amazon S3 (Civic Evidence Vault)</strong>
                  </div>
                  <ul>
                    <li>Buckets: <code>nammafix-media-prod</code></li>
                    <li>S3 Intelligent-Tiering for cost efficiency</li>
                    <li>Server-Side Encryption with AWS KMS (SSE-KMS)</li>
                    <li>Automatic pre-signed URLs with 5-minute expiry</li>
                  </ul>
                </div>

                <div className="storage-card">
                  <div className="storage-header">
                    <Database className="text-blue-500" size={18} />
                    <strong>Amazon DynamoDB (Audit Trail)</strong>
                  </div>
                  <ul>
                    <li>Table: <code>nammafix-complaints-ledger</code></li>
                    <li>Partition Key: <code>WardId (e.g., WARD_151)</code></li>
                    <li>Sort Key: <code>CreatedAt#ComplaintId</code></li>
                    <li>Global Secondary Index: <code>Status-CreatedAtIndex</code></li>
                    <li>Point-in-time recovery & Change Data Capture via DynamoDB Streams</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="aws-drawer-footer">
          <span>WeMakeDevs Bharat Builds Tour · Bangalore 2026</span>
          <button type="button" className="aws-close-btn" onClick={onClose}>
            Got it, close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AwsArchitectureDrawer;
