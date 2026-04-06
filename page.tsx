import { prisma } from "@/lib/prisma";
import { Receipt, StickyNote, CheckSquare, Calendar, Brain, Activity, TrendingUp, DollarSign, Cpu, Clock, AlertCircle, Users, Briefcase, GraduationCap } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import Link from 'next/link';
import { AgentMonitor } from "@/components/AgentMonitor";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const [tasks, expensesData, notes, events, traces, metrics] = await Promise.all([
    prisma.task.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.expense.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.note.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.event.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.agentTrace.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    prisma.metric.findMany({ orderBy: { recordedAt: 'desc' }, take: 50 }),
  ]);

  // Aggregate Performance Metrics
  const totalHoursSaved = metrics.filter(m => m.key === 'hours_saved').reduce((sum, m) => sum + m.value, 0);
  const avgLatency = traces.length > 0 ? Math.round(traces.reduce((sum, t) => sum + t.latency, 0) / traces.length) : 0;
  const activeTasksCount = await prisma.task.count({ where: { status: "PENDING" } });
  const expensesSum = await prisma.expense.aggregate({ _sum: { amount: true } });
  const totalExpense = expensesSum._sum.amount ? `₹${expensesSum._sum.amount.toLocaleString()}` : "₹0";

  // Combine and sort activities
  const allActivities = [
    ...tasks.map(t => ({ type: 'Task', title: t.title, time: t.createdAt, icon: CheckSquare, color: 'text-blue-500', bg: 'bg-blue-500/10' })),
    ...expensesData.map(e => ({ type: 'Expense', title: `${e.category}: ₹${e.amount}`, time: e.createdAt, icon: Receipt, color: 'text-rose-500', bg: 'bg-rose-500/10' })),
    ...notes.map(n => ({ type: 'Note', title: n.content.substring(0, 30) + '...', time: n.createdAt, icon: StickyNote, color: 'text-amber-500', bg: 'bg-amber-500/10' })),
    ...events.map(ev => ({ type: 'Event', title: ev.title, time: ev.createdAt, icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-500/10' })),
  ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 6);

  const unifiedStats = [
    { label: "Total Recorded Spend", value: totalExpense, icon: Receipt, color: "text-rose-500", bg: "bg-rose-500/10" },
    { label: "Active Objectives", value: activeTasksCount.toString(), icon: CheckSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Hours Optimized", value: `${totalHoursSaved.toFixed(1)}h`, icon: Clock, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "System Latency", value: `${avgLatency}ms`, icon: Cpu, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20 animate-pulse">
              Unified Command
            </span>
            <div className="h-px w-12 bg-gradient-to-r from-primary/50 to-transparent" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tighter text-foreground bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground to-foreground/30 leading-tight">
            Agentic Workspace
          </h1>
          <p className="text-muted-foreground/80 max-w-xl font-medium">
            Strategic oversight of your multi-agent fleet operations and personal productivity flows.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {unifiedStats.map((stat, i) => {
          const Icon = stat.icon;
          return <StatCard key={stat.label} label={stat.label} value={stat.value} icon={<Icon size={24} />} color={stat.color} bg={stat.bg} index={i} />;
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="p-10 rounded-[2.5rem] bg-card/40 backdrop-blur-3xl border border-white/10 min-h-[600px] flex flex-col shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden group transition-all duration-700 hover:border-primary/20">
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-[120px] group-hover:bg-primary/20 transition-colors duration-1000" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] group-hover:bg-purple-500/10 transition-colors duration-1000" />
            
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div>
                <h3 className="text-2xl font-black text-foreground tracking-tight">
                  Unified Intelligence Feed
                </h3>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1 opacity-50">Real-time Agent & System Sync</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-inner">
                <Activity size={20} className="text-primary animate-pulse" />
              </div>
            </div>

            <div className="space-y-4 flex-1 relative z-10 overflow-y-auto pr-2 max-h-[600px] scrollbar-hide">
              {/* Combine Traces and Activities for a rich orchestration view */}
              {[
                ...traces.map(t => ({ ...t, isTrace: true, time: t.createdAt })),
                ...allActivities.map(a => ({ ...a, isTrace: false, time: a.time }))
              ].sort((a, b) => b.time.getTime() - a.time.getTime()).map((item: any, i) => {
                if (item.isTrace) {
                  return (
                    <div key={`trace-${i}`} className="flex items-center gap-5 p-5 rounded-3xl border border-white/5 bg-background/40 hover:bg-white/5 transition-all group/trace border-l-4 border-l-primary/50 shadow-sm">
                      <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover/trace:scale-110 transition-transform">
                        <Cpu size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-black text-foreground">{item.agentName} <span className="mx-2 text-muted-foreground/30">→</span> {item.action}</p>
                          <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">{item.latency}ms</span>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium italic opacity-70">"{item.details}"</p>
                        <p className="text-[10px] text-muted-foreground/40 font-bold mt-2 uppercase tracking-tighter">{new Date(item.time).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                } else {
                  const Icon = item.icon;
                  return (
                    <div key={`activity-${i}`} className="flex items-center gap-6 p-5 rounded-3xl border border-white/5 bg-background/40 hover:bg-white/5 transition-all group/item shadow-sm hover:shadow-xl hover:-translate-y-1 duration-300">
                      <div className={cn("p-4 rounded-2xl transition-all duration-500 group-hover/item:rotate-12", item.bg, item.color)}>
                        <Icon size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-bold text-foreground group-hover/item:text-primary transition-colors">{item.title}</p>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5 opacity-60">{item.type} — {new Date(item.time).toLocaleDateString()}</p>
                      </div>
                      <div className="text-[11px] font-black text-muted-foreground/30 font-mono">
                        {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                }
              })}

              {(traces.length === 0 && allActivities.length === 0) && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border-4 border-dashed border-white/5 rounded-[3rem] text-muted-foreground/30">
                  <Brain className="mb-6 opacity-10" size={80} />
                  <p className="text-xl font-black uppercase tracking-widest">Neural Void</p>
                  <p className="text-sm font-medium">Capture notes or chat with clones to seed your workspace.</p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between relative z-10">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Operational Visibility Level: High</p>
              <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline transition-all">Export Report</button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Agent Monitor - Premium Component integration */}
          <div className="p-10 rounded-[2.5rem] bg-card/40 backdrop-blur-3xl border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <AgentMonitor />
          </div>

          <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-purple-500/5 border border-primary/20 shadow-xl group">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20">
                  <TrendingUp size={18} />
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Fleet Health</h4>
             </div>
             <p className="text-xs text-muted-foreground font-medium mb-4 leading-relaxed">Agent performance across all sectors is operating at peak efficiency.</p>
             <div className="space-y-4">
                {[
                  { label: "Stability", value: "99.9%" },
                  { label: "Accuracy", value: "96.4%" },
                ].map(metric => (
                  <div key={metric.label}>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1.5 px-1">
                      <span>{metric.label}</span>
                      <span className="text-primary">{metric.value}</span>
                    </div>
                    <div className="h-1.5 w-full bg-background/50 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-primary rounded-full" style={{ width: metric.value }} />
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
