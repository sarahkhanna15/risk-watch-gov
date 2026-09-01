import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Panel, RiskChip, riskStyles } from "@/components/risk";
import { projects, riskCategory, costOverrunAmt, inr, type RiskCategory } from "@/lib/projects";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Portfolio Dashboard — PAIMANA Infrastructure Risk Monitoring" },
      {
        name: "description",
        content:
          "Portfolio-level view of infrastructure project risk: sector exposure, cost at risk and the projects needing immediate intervention.",
      },
      { property: "og:title", content: "Portfolio Dashboard — PAIMANA" },
      {
        property: "og:description",
        content:
          "Sector-wise cost exposure and top risk projects across the monitored infrastructure portfolio.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const cats: RiskCategory[] = ["Critical", "High", "Medium", "Low"];
  const bySector = Object.values(
    projects.reduce<Record<string, { sector: string; overrun: number; count: number }>>(
      (acc, p) => {
        const row = (acc[p.sector] ??= { sector: p.sector, overrun: 0, count: 0 });
        row.overrun += costOverrunAmt(p);
        row.count += 1;
        return acc;
      },
      {},
    ),
  ).sort((a, b) => b.overrun - a.overrun);

  const totalApproved = projects.reduce((s, p) => s + p.approvedCost, 0);
  const totalPredicted = projects.reduce((s, p) => s + p.predictedFinalCost, 0);
  const totalExposure = projects.reduce((s, p) => s + costOverrunAmt(p), 0);
  const avgScore = Math.round(projects.reduce((s, p) => s + p.riskScore, 0) / projects.length);
  const avgDelay = Math.round(
    projects.reduce((s, p) => s + p.timeOverrunMonths, 0) / projects.length,
  );

  const top = [...projects].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);

  const kpis = [
    { label: "Approved outlay", value: inr(totalApproved), note: "Sanctioned across portfolio" },
    { label: "Predicted final cost", value: inr(totalPredicted), note: "Model v3.4 projection" },
    { label: "Average risk score", value: `${avgScore}/100`, note: "Weighted implementation risk" },
    { label: "Average predicted delay", value: `${avgDelay} mo`, note: "Against revised schedule" },
  ];

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">Dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Project Risk Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Portfolio-level infrastructure risk monitoring · {projects.length} projects ·
            predictions refreshed 04:00 IST
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface px-4 py-3 shadow-panel">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Portfolio cost at risk
          </p>
          <p className="font-mono text-xl font-semibold text-brand-deep">{inr(totalExposure)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-border bg-surface p-4 shadow-panel transition-all hover:-translate-y-0.5 hover:shadow-lift"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {k.label}
            </p>
            <p className="mt-3 font-mono text-2xl font-semibold text-brand-deep sm:text-3xl">
              {k.value}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">{k.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Risk distribution" subtitle="Projects by category">
          <div className="space-y-4 p-4">
            {cats.map((c) => {
              const list = projects.filter((p) => riskCategory(p.riskScore) === c);
              const st = riskStyles[c];
              return (
                <div key={c}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <RiskChip level={c} />
                    <span className="font-mono text-muted-foreground">
                      {list.length} · {inr(list.reduce((s, p) => s + costOverrunAmt(p), 0))}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full", st.bar)}
                      style={{ width: `${(list.length / projects.length) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <Link
              to="/projects"
              className="mt-2 inline-block rounded-md border border-border px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              Open risk register →
            </Link>
          </div>
        </Panel>

        <Panel
          title="Predicted cost overrun by sector"
          subtitle="₹ crore above approved outlay"
          className="lg:col-span-2"
        >
          <div className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bySector} layout="vertical" margin={{ left: 24, right: 16 }}>
                <CartesianGrid horizontal={false} stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis
                  type="category"
                  dataKey="sector"
                  width={128}
                  tick={{ fontSize: 11 }}
                  stroke="var(--muted-foreground)"
                />
                <Tooltip
                  cursor={{ fill: "var(--brand-soft)" }}
                  formatter={(v: number) => [inr(v), "Predicted overrun"]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="overrun" radius={[0, 4, 4, 0]}>
                  {bySector.map((s) => (
                    <Cell key={s.sector} fill="var(--primary)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel
        className="mt-6 overflow-hidden"
        title="Projects needing intervention"
        subtitle="Top 5 by implementation risk score"
        action={
          <Link
            to="/projects"
            className="rounded-md border border-border px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            View all
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Project Name
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Sector
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Risk Score
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Predicted Cost Overrun
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  Risk Category
                </th>
              </tr>
            </thead>
            <tbody>
              {top.map((p) => {
                const cat = riskCategory(p.riskScore);
                const st = riskStyles[cat];
                return (
                  <tr
                    key={p.id}
                    tabIndex={0}
                    role="link"
                    onClick={() =>
                      navigate({ to: "/projects/$projectId", params: { projectId: p.id } })
                    }
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
                          <span className="block">{p.name}</span>
                          <span className="block font-mono text-[11px] text-muted-foreground">
                            {p.code}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.sector}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono text-base font-semibold">{p.riskScore}</span>
                      <span className="text-[11px] text-muted-foreground">/100</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      <span className={st.text}>{inr(costOverrunAmt(p))}</span>
                      <span className="block text-[11px] text-muted-foreground">
                        +{p.timeOverrunMonths} mo delay
                      </span>
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
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
