import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpDown, Search, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Panel, RiskChip, riskStyles } from "@/components/risk";
import {
  projects,
  riskCategory,
  costOverrunPct,
  costOverrunAmt,
  inr,
  type RiskCategory,
} from "@/lib/projects";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Projects Risk Register — PAIMANA Infrastructure Risk Monitoring" },
      {
        name: "description",
        content:
          "AI-assisted risk register for national infrastructure projects: cost overrun, time overrun and implementation risk scores by category.",
      },
      { property: "og:title", content: "Projects Risk Register — PAIMANA" },
      {
        property: "og:description",
        content:
          "Filter infrastructure projects by Critical, High, Medium and Low implementation risk and open full project intelligence.",
      },
    ],
  }),
  component: ProjectsRisk,
});

type SortKey = "name" | "sector" | "cost" | "time" | "score";

const categories: RiskCategory[] = ["Critical", "High", "Medium", "Low"];
const blurb: Record<RiskCategory, string> = {
  Critical: "Immediate intervention",
  High: "Escalating exposure",
  Medium: "Active monitoring",
  Low: "Broadly on track",
};

function ProjectsRisk() {
  const navigate = useNavigate();
  const [active, setActive] = useState<RiskCategory | null>(null);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "score", dir: -1 });

  const stats = useMemo(() => {
    return categories.map((c) => {
      const list = projects.filter((p) => riskCategory(p.riskScore) === c);
      return {
        category: c,
        count: list.length,
        exposure: list.reduce((s, p) => s + costOverrunAmt(p), 0),
      };
    });
  }, []);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const filtered = projects.filter((p) => {
      const catOk = !active || riskCategory(p.riskScore) === active;
      const qOk =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term) ||
        p.sector.toLowerCase().includes(term);
      return catOk && qOk;
    });
    const get = (p: (typeof projects)[number]) => {
      switch (sort.key) {
        case "name":
          return p.name.toLowerCase();
        case "sector":
          return p.sector.toLowerCase();
        case "cost":
          return costOverrunPct(p);
        case "time":
          return p.timeOverrunMonths;
        default:
          return p.riskScore;
      }
    };
    return [...filtered].sort((a, b) => {
      const x = get(a);
      const y = get(b);
      if (x === y) return 0;
      return (x > y ? 1 : -1) * sort.dir;
    });
  }, [active, q, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: key === "name" || key === "sector" ? 1 : -1 }));

  const th = (key: SortKey, label: string, align: "left" | "right" = "left") => (
    <th className={cn("px-4 py-3", align === "right" && "text-right")}>
      <button
        onClick={() => toggleSort(key)}
        className={cn(
          "inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors hover:text-primary",
          sort.key === key ? "text-primary" : "text-muted-foreground",
        )}
      >
        {label}
        <ArrowUpDown className="size-3" />
      </button>
    </th>
  );

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
            Projects Risk
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Implementation Risk Register
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {projects.length} monitored projects · 11 sectors · predictions refreshed 04:00 IST
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface px-4 py-3 shadow-panel">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Portfolio cost at risk
          </p>
          <p className="font-mono text-xl font-semibold text-brand-deep">
            {inr(projects.reduce((s, p) => s + costOverrunAmt(p), 0))}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => {
          const st = riskStyles[s.category];
          const isActive = active === s.category;
          return (
            <button
              key={s.category}
              onClick={() => setActive(isActive ? null : s.category)}
              aria-pressed={isActive}
              className={cn(
                "group rounded-xl border bg-surface p-4 text-left shadow-panel transition-all hover:-translate-y-0.5 hover:shadow-lift",
                isActive ? cn(st.ring, "ring-2 ring-offset-1", "ring-current", st.text) : "border-border",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-[0.16em]",
                    st.text,
                  )}
                >
                  {s.category}
                </span>
                <span className={cn("size-2.5 rounded-full", st.dot)} />
              </div>
              <div className="mt-3 font-mono text-3xl font-semibold text-foreground">
                {String(s.count).padStart(2, "0")}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">{blurb[s.category]}</div>
              <div className="mt-3 h-1.5 rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", st.bar)}
                  style={{ width: `${(s.count / projects.length) * 100}%` }}
                />
              </div>
              <div className="mt-2 font-mono text-[11px] text-muted-foreground">
                {inr(s.exposure)} predicted overrun
              </div>
            </button>
          );
        })}
      </div>

      <Panel
        className="mt-6 overflow-hidden"
        title="Projects"
        subtitle={
          active
            ? `Filtered to ${active} risk · ${rows.length} project${rows.length === 1 ? "" : "s"}`
            : `All risk levels · ${rows.length} projects`
        }
        action={
          <div className="flex items-center gap-2">
            {active && (
              <button
                onClick={() => setActive(null)}
                className="rounded-md border border-border px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                Clear filter
              </button>
            )}
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, code, sector…"
                className="w-48 rounded-md border border-border bg-background py-1.5 pl-8 pr-3 text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 sm:w-64"
              />
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                {th("name", "Project Name")}
                {th("sector", "Sector")}
                {th("cost", "Predicted Cost Overrun", "right")}
                {th("time", "Predicted Time Overrun", "right")}
                {th("score", "Risk Score", "right")}
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Risk Category
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const cat = riskCategory(p.riskScore);
                const st = riskStyles[cat];
                return (
                  <tr
                    key={p.id}
                    tabIndex={0}
                    role="link"
                    onClick={() => navigate({ to: "/projects/$projectId", params: { projectId: p.id } })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter")
                        navigate({ to: "/projects/$projectId", params: { projectId: p.id } });
                    }}
                    className="cursor-pointer border-b border-border/70 outline-none transition-colors last:border-0 hover:bg-brand-soft/60 focus-visible:bg-brand-soft"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 font-medium">
                        <span className={cn("h-8 w-0.5 rounded-full", st.bar)} />
                        <span>
                          {p.name}
                          <span className="block font-mono text-[11px] font-normal text-muted-foreground">
                            {p.code}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.sector}</td>
                    <td className="px-4 py-3 text-right font-mono">
                      <span className={st.text}>+{costOverrunPct(p).toFixed(1)}%</span>
                      <span className="block text-[11px] text-muted-foreground">
                        {inr(costOverrunAmt(p))}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      <span className={st.text}>+{p.timeOverrunMonths} mo</span>
                      <span className="block text-[11px] text-muted-foreground">
                        {p.physicalProgress}% physical
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono text-base font-semibold">{p.riskScore}</span>
                      <span className="text-[11px] text-muted-foreground">/100</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <RiskChip level={cat} />
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No projects match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
