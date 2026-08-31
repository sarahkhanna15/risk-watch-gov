import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, ArrowLeft, Clock, IndianRupee, Radar, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Panel, RiskChip, riskStyles } from "@/components/risk";
import { getProject, riskCategory, costOverrunAmt, costOverrunPct, inr } from "@/lib/projects";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects/$projectId")({
  loader: ({ params }) => {
    const project = getProject(params.projectId);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        meta: [
          { title: "Project not found — PAIMANA" },
          { name: "robots", content: "noindex" },
        ],
      };
    const p = loaderData.project;
    const title = `${p.name} — Project Intelligence | PAIMANA`;
    const description = `Risk score ${p.riskScore}/100. Predicted cost overrun ${inr(costOverrunAmt(p))} and ${p.timeOverrunMonths} months delay for ${p.name} (${p.code}).`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ProjectDetail,
});

function Field({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</dt>
      <dd className={cn("mt-1 truncate text-sm font-medium", accent)} title={value}>
        {value}
      </dd>
    </div>
  );
}

function ProjectDetail() {
  const { project: p } = Route.useLoaderData();
  const cat = riskCategory(p.riskScore);
  const st = riskStyles[cat];

  const timelineRows = [
    { label: "Original schedule", end: p.originalCompletion, months: 0, tone: "bg-primary/40" },
    {
      label: "Latest revised schedule",
      end: p.revisedCompletion,
      months: Math.round(p.timeOverrunMonths * 0.65),
      tone: "bg-high",
    },
    {
      label: "AI predicted completion",
      end: p.predictedCompletion,
      months: p.timeOverrunMonths,
      tone: st.bar,
    },
  ];
  const maxMonths = p.timeOverrunMonths || 1;

  const peers = [
    { label: "This project", value: p.riskScore, tone: st.bar },
    { label: "Sector median", value: p.sectorMedianScore, tone: "bg-primary/60" },
    { label: "Best in sector", value: p.sectorBestScore, tone: "bg-low" },
  ];

  return (
    <AppShell>
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-3.5" /> Back to risk register
      </Link>

      <div className="mt-3 rounded-xl border border-border bg-surface p-5 shadow-panel">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
              Project Intelligence
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{p.name}</h1>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {p.code} · {p.sector} · {p.agency}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Implementation risk score
              </p>
              <p className={cn("font-mono text-3xl font-semibold", st.text)}>
                {p.riskScore}
                <span className="text-base text-muted-foreground">/100</span>
              </p>
            </div>
            <div
              className="relative size-16 rounded-full"
              style={{
                background: `conic-gradient(${st.hex} 0 ${p.riskScore}%, var(--muted) ${p.riskScore}% 100%)`,
              }}
            >
              <div className="absolute inset-[6px] grid place-items-center rounded-full bg-surface">
                <RiskChip level={cat} className="scale-90" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Project Information" className="lg:col-span-1">
          <dl className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-1">
            <Field label="Project name" value={p.name} />
            <Field label="Project code" value={p.code} />
            <Field label="Sector" value={p.sector} />
            <Field label="Line ministry / department" value={p.ministry} />
            <Field label="Implementing agency" value={p.agency} />
          </dl>
        </Panel>

        <Panel
          title="Cost Intelligence"
          subtitle="₹ crore"
          className="lg:col-span-2"
          action={<IndianRupee className="size-4 text-muted-foreground" />}
        >
          <dl className="grid grid-cols-2 gap-4 border-b border-border p-4 sm:grid-cols-5">
            <Field label="Original approved" value={inr(p.approvedCost)} />
            <Field label="Latest revised" value={inr(p.revisedCost)} />
            <Field label="Cumulative expenditure" value={inr(p.expenditure)} />
            <Field label="Predicted final cost" value={inr(p.predictedFinalCost)} accent={st.text} />
            <Field
              label="Predicted cost overrun"
              value={`${inr(costOverrunAmt(p))} (+${costOverrunPct(p).toFixed(1)}%)`}
              accent={st.text}
            />
          </dl>
          <div className="h-56 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={p.costSeries} margin={{ left: 8, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="costFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="stage" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" width={54} />
                <Tooltip
                  formatter={(v: number) => [inr(v), "Cost"]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#costFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel
          title="Timeline Intelligence"
          className="lg:col-span-2"
          action={<Clock className="size-4 text-muted-foreground" />}
        >
          <dl className="grid grid-cols-2 gap-4 border-b border-border p-4 sm:grid-cols-5">
            <Field label="Project start" value={p.startDate} />
            <Field label="Original completion" value={p.originalCompletion} />
            <Field label="Latest revised completion" value={p.revisedCompletion} />
            <Field label="AI predicted completion" value={p.predictedCompletion} accent={st.text} />
            <Field
              label="Predicted time overrun"
              value={`${p.timeOverrunMonths} months`}
              accent={st.text}
            />
          </dl>
          <div className="space-y-4 p-4">
            {timelineRows.map((r) => (
              <div key={r.label}>
                <div className="mb-1.5 flex justify-between text-[11px]">
                  <span className="font-medium">{r.label}</span>
                  <span className="font-mono text-muted-foreground">
                    {r.end}
                    {r.months > 0 && ` · +${r.months} mo`}
                  </span>
                </div>
                <div className="h-3 rounded-md bg-muted">
                  <div
                    className={cn("h-full rounded-md transition-all", r.tone)}
                    style={{ width: `${45 + (r.months / maxMonths) * 55}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Progress & Risk" action={<TrendingUp className="size-4 text-muted-foreground" />}>
          <div className="space-y-5 p-4">
            <div>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-muted-foreground">Physical progress</span>
                <span className="font-mono font-semibold">{p.physicalProgress}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${p.physicalProgress}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-muted-foreground">Financial progress</span>
                <span className="font-mono font-semibold">
                  {Math.round((p.expenditure / p.revisedCost) * 100)}%
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-chart-2"
                  style={{ width: `${(p.expenditure / p.revisedCost) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-muted-foreground">Implementation risk score</span>
                <span className={cn("font-mono font-semibold", st.text)}>{p.riskScore}/100</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", st.bar)}
                  style={{ width: `${p.riskScore}%` }}
                />
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
              Physical progress trails financial progress by{" "}
              <span className="font-mono font-semibold text-foreground">
                {Math.max(
                  0,
                  Math.round((p.expenditure / p.revisedCost) * 100) - p.physicalProgress,
                )}{" "}
                points
              </span>
              , a standard leading indicator of cost overrun in this sector.
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface shadow-panel">
        <header className="flex items-center gap-2 border-b border-border px-5 py-4">
          <AlertTriangle className={cn("size-5", st.text)} />
          <div>
            <h2 className="text-base font-semibold tracking-tight">Why is this project at risk?</h2>
            <p className="text-[11px] text-muted-foreground">
              AI risk intelligence · attribution model v3.4 · reviewed against {p.sector} sector
              baseline
            </p>
          </div>
        </header>

        <div className="grid gap-4 p-5 lg:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Top contributing factors
            </h3>
            <ul className="mt-3 space-y-3">
              {p.factors.map((f, i) => (
                <li key={f.label}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">
                      <span className="mr-2 font-mono text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {f.label}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">{f.weight}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full", st.bar)}
                      style={{ width: `${f.weight}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                    {f.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-border p-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Possible reasons for cost escalation
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                {p.costReasons.map((r) => (
                  <li key={r} className="flex gap-2 leading-relaxed">
                    <IndianRupee className="mt-0.5 size-3.5 shrink-0 text-high" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-border p-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Possible reasons for time delay
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                {p.timeReasons.map((r) => (
                  <li key={r} className="flex gap-2 leading-relaxed">
                    <Clock className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Early warning signals
            </h3>
            <ul className="mt-3 space-y-2">
              {p.earlyWarnings.map((w) => (
                <li
                  key={w.text}
                  className="flex items-start gap-2.5 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm leading-relaxed"
                >
                  <span
                    className={cn("mt-1.5 size-2 shrink-0 rounded-full", riskStyles[w.level].dot)}
                  />
                  <span>{w.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Compared with similar {p.sector} projects
              </h3>
              <Radar className="size-4 text-muted-foreground" />
            </div>
            <div className="mt-4 space-y-3">
              {peers.map((peer) => (
                <div key={peer.label} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-[11px] text-muted-foreground">
                    {peer.label}
                  </span>
                  <div className="h-2 flex-1 rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full", peer.tone)}
                      style={{ width: `${peer.value}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-xs font-semibold">
                    {peer.value}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-md bg-brand-soft p-3 text-[11px] leading-relaxed text-brand-deep">
              <span className="font-semibold">Recommended action: </span>
              this project sits {p.riskScore - p.sectorMedianScore} points above the {p.sector}{" "}
              median. Escalate to the line ministry review committee, freeze further scope
              additions, and require a fortnightly recovery plan against the top two contributing
              factors.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
