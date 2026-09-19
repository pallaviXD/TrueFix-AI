import { createContext, useContext, useEffect, useState } from "react";
import { Link, Route, Switch, useLocation } from "wouter";
import { AlertCircle, ArrowLeft, Check, ClipboardList, ChevronRight, Plus, ShieldCheck, Zap } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Landing from "./pages/Landing";
import Upload from "./pages/Upload";
import Dashboard from "./pages/Dashboard";
import Result from "./pages/Result";
import Resolution from "./pages/Resolution";
import NotFound from "./pages/NotFound";
import { AwsArchitectureDrawer } from "./components/AwsArchitectureDrawer";
import { CivicTicker } from "./components/CivicTicker";

export const AwsDrawerContext = createContext<{ openDrawer: () => void }>({ openDrawer: () => {} });
export const useAwsDrawer = () => useContext(AwsDrawerContext);

const navItems = [
  { href: "/upload", label: "Report", icon: Plus },
  { href: "/dashboard", label: "My reports", icon: ClipboardList },
];

function LogoMark() {
  return (
    <div className="logo-mark" aria-hidden="true">
      <span className="logo-dot logo-dot-one" />
      <span className="logo-dot logo-dot-two" />
      <span className="logo-dot logo-dot-three" />
      <span className="logo-bridge" />
    </div>
  );
}

function AppHeader() {
  const [location] = useLocation();
  const isDashboard = location.startsWith("/dashboard");
  const { openDrawer } = useAwsDrawer();

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="NammaFix AI home">
          <LogoMark />
          <span><strong>NammaFix</strong><small>AI / civic action</small></span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href="/upload" className={!isDashboard ? "active" : ""}>Report an issue</Link>
          <Link href="/dashboard" className={isDashboard ? "active" : ""}>My reports</Link>
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button type="button" className="aws-inspect-header-btn" onClick={openDrawer} title="Inspect AWS Cloud Architecture">
            <Zap size={13} className="text-amber-400" />
            <span>AWS Architecture</span>
          </button>
          <div className="header-status" title="Bharat Builds Tour 2026"><span className="status-pulse" /><span>Bengaluru</span></div>
        </div>
      </div>
    </header>
  );
}

function MobileNav() {
  const [location] = useLocation();
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = location.startsWith(href);
        return <Link key={href} href={href} className={active ? "active" : ""}><Icon size={19} strokeWidth={active ? 2.5 : 1.8} /><span>{label}</span></Link>;
      })}
    </nav>
  );
}

function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-frame">
      <CivicTicker />
      <AppHeader />
      <main className="page-main">{children}</main>
      <MobileNav />
    </div>
  );
}

export function PageIntro({ eyebrow, title, children, backHref }: { eyebrow: string; title: string; children?: React.ReactNode; backHref?: string }) {
  return <div className="page-intro">{backHref ? <Link href={backHref} className="back-link"><ArrowLeft size={15} /> Back</Link> : null}<div className="eyebrow"><span className="eyebrow-rule" />{eyebrow}</div><h1 className="display-title">{title}</h1>{children ? <p className="page-lead">{children}</p> : null}</div>;
}

export function SectionLabel({ children }: { children: React.ReactNode }) { return <div className="section-label">{children}</div>; }
export function ErrorNotice({ message }: { message: string }) { return <div className="state-panel error-panel" role="alert"><span className="state-icon"><AlertCircle size={18} /></span><div><strong>Something didn’t go through.</strong><p>{message}</p></div></div>; }
export function EmptyNotice({ title, message, href, action }: { title: string; message: string; href?: string; action?: string }) { return <div className="state-panel empty-panel"><span className="state-icon"><ClipboardList size={18} /></span><div><strong>{title}</strong><p>{message}</p></div>{href ? <Link href={href} className="text-link">{action ?? "Start a report"}<ChevronRight size={15} /></Link> : null}</div>; }
export function LoadingSteps({ steps, active = 0 }: { steps: string[]; active?: number }) { return <div className="loading-steps" aria-live="polite" aria-label="Loading">{steps.map((step, index) => <div className={index < active ? "step done" : index === active ? "step current" : "step"} key={step}><span className="step-mark">{index < active ? <Check size={12} /> : index === active ? <span className="step-spinner" /> : <span />}</span><span>{step}</span></div>)}</div>; }
export function TrustNote({ children }: { children: React.ReactNode }) { return <div className="trust-note"><ShieldCheck size={16} /><span>{children}</span></div>; }

function UtilityRoutes() {
  const [, navigate] = useLocation();
  useEffect(() => { if (window.location.pathname === "/") navigate("/", { replace: true }); }, [navigate]);
  return <PageFrame><Switch><Route path="/upload" component={Upload} /><Route path="/dashboard" component={Dashboard} /><Route path="/complaint/:id" component={Result} /><Route path="/resolution/:id" component={Resolution} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch></PageFrame>;
}

export function App() {
  const [isAwsDrawerOpen, setIsAwsDrawerOpen] = useState(false);
  const openDrawer = () => setIsAwsDrawerOpen(true);
  const closeDrawer = () => setIsAwsDrawerOpen(false);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AwsDrawerContext.Provider value={{ openDrawer }}>
            <Toaster />
            <Switch>
              <Route path="/" component={Landing} />
              <Route path="/welcome" component={Landing} />
              <Route component={UtilityRoutes} />
            </Switch>
            <AwsArchitectureDrawer isOpen={isAwsDrawerOpen} onClose={closeDrawer} />
          </AwsDrawerContext.Provider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
