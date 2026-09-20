// ==============================================================================
// NammaFix AI — Cedar Authorization Policies (BBMP Civic Action Pipeline)
// Language: Cedar Policy Language (cedarpolicy.com)
// Spec: AWS Build It Hackathon & BBMP Ward Governance Rules
// ==============================================================================

// Rule 1: Allow routing civic reports when required fields and image quality thresholds pass
permit (
    principal,
    action == Action::"RouteReport",
    resource in ResourceType::"CivicReport"
)
when {
    resource.location != "" &&
    (resource.category == "Pothole" || resource.category == "Garbage accumulation") &&
    context.imageQuality >= 0.60
};

// Rule 2: Explicitly forbid routing if location is empty or image quality is below threshold
forbid (
    principal,
    action == Action::"RouteReport",
    resource in ResourceType::"CivicReport"
)
when {
    resource.location == "" ||
    context.imageQuality < 0.60
};

// Rule 3: Allow resolution confirmation when verified distinct after-evidence is submitted
permit (
    principal,
    action == Action::"ConfirmResolution",
    resource in ResourceType::"CivicReport"
)
when {
    context.hasAfterPhoto == true &&
    context.isIdentical == false
};

// Rule 4: Strictly forbid resolution if before and after photos are identical (Anti-Fraud Guard)
forbid (
    principal,
    action == Action::"ConfirmResolution",
    resource in ResourceType::"CivicReport"
)
when {
    context.isIdentical == true
};
