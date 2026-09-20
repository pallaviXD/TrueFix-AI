import fs from "node:fs";
import path from "node:path";

export interface CedarEntity {
  id: string;
  type: string;
  attributes?: Record<string, any>;
}

export interface CedarContext {
  [key: string]: any;
}

export interface CedarRequest {
  principal: string | CedarEntity;
  action: string;
  resource: CedarEntity;
  context: CedarContext;
}

export interface CedarResponse {
  decision: "ALLOW" | "DENY";
  reasons: string[];
  errors: string[];
}

export interface CedarRule {
  effect: "permit" | "forbid";
  action: string;
  resourceType: string;
  rawCondition: string;
  evaluator: (req: CedarRequest) => boolean;
}

/**
 * Parses and evaluates Cedar policy files against authorization requests.
 * Complies with Cedar's authorization semantics:
 * 1. Default decision is DENY.
 * 2. If any matching FORBID rule evaluates to true, decision is DENY (forbid overrides permit).
 * 3. If at least one matching PERMIT rule evaluates to true and no FORBID rule evaluates to true, decision is ALLOW.
 */
export class CedarEngine {
  private rules: CedarRule[] = [];
  private rawPolicyText: string = "";

  constructor(policyFilePath?: string) {
    if (policyFilePath) {
      this.loadPolicyFile(policyFilePath);
    }
  }

  public loadPolicyFile(filePath: string): void {
    const fullPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Cedar policy file not found at: ${fullPath}`);
    }
    const content = fs.readFileSync(fullPath, "utf-8");
    this.parsePolicyText(content);
  }

  public parsePolicyText(text: string): void {
    this.rawPolicyText = text;
    this.rules = [];

    // Simple robust tokenizer and rule extractor for Cedar policies
    const statementRegex = /(permit|forbid)\s*\(\s*principal\s*,\s*action\s*(?:==|in)\s*Action::"([^"]+)"\s*,\s*resource(?:\s+in\s+ResourceType::"([^"]+)")?\s*\)\s*when\s*\{([^}]+)\};/g;

    let match: RegExpExecArray | null;
    while ((match = statementRegex.exec(text)) !== null) {
      const effect = match[1] as "permit" | "forbid";
      const action = match[2];
      const resourceType = match[3] || "CivicReport";
      const rawCondition = match[4].trim();

      const evaluator = this.compileCondition(rawCondition);
      this.rules.push({
        effect,
        action,
        resourceType,
        rawCondition,
        evaluator,
      });
    }
  }

  private compileCondition(conditionStr: string): (req: CedarRequest) => boolean {
    return (req: CedarRequest) => {
      try {
        const resource = {
          ...req.resource.attributes,
          id: req.resource.id,
          type: req.resource.type,
        };
        const context = req.context || {};
        const principal = typeof req.principal === "string" ? req.principal : req.principal.id;

        // Condition safe evaluator
        // Replace Cedar boolean operators if any
        // Allowed variables: resource, context, principal
        const fn = new Function(
          "resource",
          "context",
          "principal",
          `return Boolean(${conditionStr});`
        );
        return fn(resource, context, principal);
      } catch (err) {
        console.warn(`[CedarEngine] Condition evaluation error on "${conditionStr}":`, err);
        return false;
      }
    };
  }

  public isAuthorized(req: CedarRequest): CedarResponse {
    const reasons: string[] = [];
    const errors: string[] = [];
    let hasPermit = false;
    let hasForbid = false;

    for (const rule of this.rules) {
      if (rule.action !== req.action) continue;
      if (req.resource.type && rule.resourceType && req.resource.type !== rule.resourceType) continue;

      const conditionMet = rule.evaluator(req);
      if (conditionMet) {
        if (rule.effect === "forbid") {
          hasForbid = true;
          reasons.push(`Explicit forbid rule matched for action ${rule.action}: ${rule.rawCondition}`);
        } else if (rule.effect === "permit") {
          hasPermit = true;
          reasons.push(`Permit rule matched for action ${rule.action}: ${rule.rawCondition}`);
        }
      }
    }

    if (hasForbid) {
      return { decision: "DENY", reasons, errors };
    }

    if (hasPermit) {
      return { decision: "ALLOW", reasons, errors };
    }

    return {
      decision: "DENY",
      reasons: ["Default deny: no matching permit rule evaluated to true."],
      errors,
    };
  }

  public getLoadedRules(): Array<{ effect: string; action: string; rawCondition: string }> {
    return this.rules.map(r => ({ effect: r.effect, action: r.action, rawCondition: r.rawCondition }));
  }
}

// Singleton default instance loaded from policies/nammafix.cedar
let defaultEngine: CedarEngine | null = null;

export function getCedarEngine(): CedarEngine {
  if (!defaultEngine) {
    defaultEngine = new CedarEngine();
    const policyPath = path.join(process.cwd(), "policies", "nammafix.cedar");
    if (fs.existsSync(policyPath)) {
      defaultEngine.loadPolicyFile(policyPath);
    }
  }
  return defaultEngine;
}

/**
 * Cedar evaluator wrapper for routing decision
 */
export function evaluateCedarRouting(input: {
  location: string;
  category: string;
  imageQuality: number;
  userId?: string;
}): { allowed: boolean; reason: string } {
  const engine = getCedarEngine();
  const req: CedarRequest = {
    principal: input.userId || "Citizen::Anonymous",
    action: "RouteReport",
    resource: {
      id: "report-draft",
      type: "CivicReport",
      attributes: {
        location: input.location.trim(),
        category: input.category,
      },
    },
    context: {
      imageQuality: input.imageQuality,
    },
  };

  const res = engine.isAuthorized(req);
  return {
    allowed: res.decision === "ALLOW",
    reason: res.decision === "ALLOW"
      ? "Cedar authorization granted: valid location, category, and evidence quality."
      : (res.reasons[0] || "Cedar authorization denied."),
  };
}

/**
 * Cedar evaluator wrapper for resolution confirmation
 */
export function evaluateCedarResolution(input: {
  reportId: string;
  hasAfterPhoto: boolean;
  isIdentical: boolean;
  verifierId?: string;
}): { allowed: boolean; reason: string } {
  const engine = getCedarEngine();
  const req: CedarRequest = {
    principal: input.verifierId || "Official::WardEngineer",
    action: "ConfirmResolution",
    resource: {
      id: input.reportId,
      type: "CivicReport",
      attributes: {},
    },
    context: {
      hasAfterPhoto: input.hasAfterPhoto,
      isIdentical: input.isIdentical,
    },
  };

  const res = engine.isAuthorized(req);
  return {
    allowed: res.decision === "ALLOW",
    reason: res.decision === "ALLOW"
      ? "Cedar authorization granted: valid resolution evidence."
      : (res.reasons[0] || "Cedar authorization denied: invalid or fraudulent evidence."),
  };
}
