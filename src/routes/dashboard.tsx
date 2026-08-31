import { createFileRoute, Link } from "@tanstack/react-router";
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
  const cats: RiskCategory[] = ["Critical", "High", "Medium", "Low"];
  const bySector = Object.values(
    projects.reduce<Record<string, { sector: string; overrun: number; count: number }>>(
      (acc, p) => {
        acc[p.sector] ??= { sector: p.sector, overrun: 0, count: 0 };
        acc[p.sector].overrun += costOverrunAmt(p);
        acc[p.sector].count += 1;
        return acc;
      },
      {},
    ),
  ).sort((a, b) => b.overrun - a.overrun);

  const totalApproved = projects.reduce((s, p) => s + p.approvedCost, 0);
  const totalPredicted = projects.reduce((s, p) => s + p.predictedFinalCost, 0);
  const avgScore = Math.round(projects.reduce((s, p) => s + p.riskScore, 0) / projects.length);
  const avgDelay = Math.round(
    projects.reduce((s, p) => s + p.timeOverrunMonths, 0) / projects.length,
  );

  const top = [...projects].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);

  const kpis = [
    { label: "Approved outlay", value: inr(totalApproved) },
    { label: "Predicted final cost", value: inr(totalPredicted) },
    { label: "Average risk score", value: `${avgScore}/100` },
    { label: "Average predicted delay", value: `${avgDelay} months` },
  ];

  return (
    <AppShell>
      <div className="mb-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">Dashboard</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Portfolio Risk Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aggregated implementation risk across all monitored central-sector projects.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-border bg-surface p-4 shadow-panel">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {k.label}
            </p>
            <p className="mt-2 font-mono text-xl font-semibold text-brand-deep">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Risk distribution" subtitle="Projects by category" className="p-0">
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
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full", st.bar)}
                      style={{ width: `${(list.length / projects.length) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <Link
              to="/"
              className="mt-2 inline-block rounded-md border border-border px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-brand-soft"
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

      <Panel className="mt-4" title="Projects needing intervention" subtitle="Top 5 by risk score">
        <ul className="divide-y divide-border">
          {top.map((p) => (
            <li key={p.id}>
              <Link
                to="/projects/$projectId"
                params={{ projectId: p.id }}
                className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-brand-soft/60"
              >
                <span className="font-mono text-lg font-semibold">{p.riskScore}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{p.name}</span>
                  <span className="block font-mono text-[11px] text-muted-foreground">
                    {p.code} · {p.sector}
                  </span>
                </span>
                <RiskChip level={riskCategory(p.riskScore)} />
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </AppShell>
  );
}
