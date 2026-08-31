import { Link } from "@tanstack/react-router";
import { LayoutDashboard, FolderKanban, X, Menu, ShieldAlert } from "lucide-react";
import { useState, type ReactNode } from "react";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, desc: "Portfolio overview" },
  { to: "/", label: "Projects", icon: FolderKanban, desc: "Risk register" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1500px] items-center gap-3 px-4 sm:px-6">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            className="grid size-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <Menu className="size-4" />
          </button>
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-mono text-sm font-semibold tracking-tight text-brand-deep">
              PAIMANA
            </span>
            <span className="hidden text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:inline">
              MoSPI · Project Risk Intelligence
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-[11px] font-medium text-muted-foreground md:flex">
              <span className="size-1.5 rounded-full bg-low" />
              Live · model v3.4
            </span>
            <span className="rounded-md border border-border bg-brand-soft px-2 py-1 font-mono text-[10px] text-brand-deep">
              SIH 26103
            </span>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <button
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-brand-deep/40 backdrop-blur-[2px]"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-sidebar text-sidebar-foreground shadow-lift">
            <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
              <span className="font-mono text-sm font-semibold">PAIMANA</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="grid size-8 place-items-center rounded-md border border-sidebar-border text-sidebar-foreground/70 hover:text-sidebar-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 p-3">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: true }}
                  activeProps={{
                    className: "bg-sidebar-accent text-sidebar-accent-foreground",
                  }}
                  inactiveProps={{ className: "text-sidebar-foreground/70" }}
                  className="flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-sidebar-accent"
                >
                  <n.icon className="mt-0.5 size-4 shrink-0" />
                  <span>
                    <span className="block text-sm font-medium">{n.label}</span>
                    <span className="block text-[11px] opacity-70">{n.desc}</span>
                  </span>
                </Link>
              ))}
            </nav>
            <div className="border-t border-sidebar-border p-4 text-[11px] leading-relaxed opacity-70">
              <ShieldAlert className="mb-2 size-4" />
              Decision-support outputs are model predictions and must be read with the latest
              agency progress report.
            </div>
          </aside>
        </div>
      )}

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
