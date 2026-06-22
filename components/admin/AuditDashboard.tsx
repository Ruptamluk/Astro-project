'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import {
  Activity, AlertTriangle, CheckCircle2, Copy, Download, Layers,
  RefreshCw, Search, ShieldAlert, TrendingDown, TrendingUp, UserX, Users, XCircle, Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  adminApi, getAdminToken, type AuditWindow, type AuditSummary,
  type TimelinePoint, type StatusSlice, type ModuleCount,
  type AuditEventRow, type AuditEventDetail, type StatCard,
} from '@/lib/adminApi'

const C = {
  success: '#16a34a',
  failure: '#dc2626',
  warning: '#f59e0b',
  denied: '#f97316',
  info: '#6366f1',
}

function fmtTs(ts: string | null) {
  if (!ts) return '—'
  const d = new Date(ts)
  return isNaN(d.getTime()) ? '—' : d.toLocaleString()
}

function fmtDur(ms: number | null) {
  if (ms == null) return '—'
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${ms} ms`
}

function severityBadge(sev: string | null) {
  const map: Record<string, string> = {
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-red-50 text-red-700 border-red-200',
  }
  return map[sev || 'info'] || map.info
}

function statusBadge(status: string | null) {
  return status === 'success'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : status === 'failure'
      ? 'bg-red-50 text-red-700 border-red-200'
      : 'bg-amber-50 text-amber-700 border-amber-200'
}

export default function AuditDashboard() {
  const [window, setWindow] = useState<AuditWindow>('7d')
  const [summary, setSummary] = useState<AuditSummary | null>(null)
  const [timeline, setTimeline] = useState<TimelinePoint[]>([])
  const [breakdown, setBreakdown] = useState<StatusSlice[]>([])
  const [modules, setModules] = useState<ModuleCount[]>([])

  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState('all')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(0)
  const [events, setEvents] = useState<AuditEventRow[]>([])
  const [total, setTotal] = useState(0)
  const [loadingEvents, setLoadingEvents] = useState(false)
  const limit = 25

  const [detail, setDetail] = useState<AuditEventDetail | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const loadOverview = useCallback(async () => {
    try {
      const [s, t, b, m] = await Promise.all([
        adminApi.audit.summary(window),
        adminApi.audit.timeline(window),
        adminApi.audit.statusBreakdown(window),
        adminApi.audit.topModules(window),
      ])
      setSummary(s)
      setTimeline(t.series)
      setBreakdown(b.breakdown)
      setModules(m.modules)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load audit data')
    }
  }, [window])

  const loadEvents = useCallback(async () => {
    setLoadingEvents(true)
    try {
      const data = await adminApi.audit.events({ search, severity, status, window, page, limit })
      setEvents(data.events)
      setTotal(data.total)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load events')
    } finally {
      setLoadingEvents(false)
    }
  }, [search, severity, status, window, page])

  useEffect(() => { loadOverview() }, [loadOverview])
  useEffect(() => { loadEvents() }, [loadEvents])

  const openDetail = async (id: string) => {
    setDetailOpen(true)
    setDetail(null)
    try {
      setDetail(await adminApi.audit.eventDetail(id))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load event')
    }
  }

  const refreshAll = () => { loadOverview(); loadEvents() }

  const handleExport = () => {
    const url = adminApi.audit.exportUrl({ search, severity, status, window })
    const token = getAdminToken()
    // export needs the bearer header; fetch as blob then download
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'audit_logs.csv'
        a.click()
        URL.revokeObjectURL(a.href)
      })
      .catch(() => toast.error('Export failed'))
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))

  const donutData = useMemo(
    () => breakdown.filter((b) => b.count > 0).map((b) => ({
      name: b.key, value: b.count,
      color: b.key === 'success' ? C.success : b.key === 'warning' ? C.warning : b.key === 'denied' ? C.denied : C.failure,
    })),
    [breakdown],
  )
  const donutTotal = breakdown.reduce((a, b) => a + b.count, 0)
  const maxModule = Math.max(1, ...modules.map((m) => m.count))

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Activity className="h-5 w-5 text-primary" /> Audit Logs &amp; Observability
          </h2>
          <p className="text-sm text-muted-foreground">
            Monitor activity, investigate failures, and trace the full lifecycle of every event.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={window} onValueChange={(v) => { setWindow(v as AuditWindow); setPage(0) }}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={refreshAll}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* stat cards */}
      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Stat icon={<Activity className="h-4 w-4" />} label="Total Events" card={summary.total_events} accent="text-indigo-600" />
          <Stat icon={<CheckCircle2 className="h-4 w-4" />} label="Success" card={summary.success} accent="text-emerald-600" />
          <Stat icon={<AlertTriangle className="h-4 w-4" />} label="Warnings" card={summary.warnings} accent="text-amber-600" />
          <Stat icon={<XCircle className="h-4 w-4" />} label="Errors" card={summary.errors} accent="text-red-600" />
          <Stat icon={<ShieldAlert className="h-4 w-4" />} label="Security Events" card={summary.security_events} accent="text-violet-600" />
          <Stat icon={<UserX className="h-4 w-4" />} label="Failed Logins" card={summary.failed_logins} accent="text-rose-600" />
          <Stat icon={<Zap className="h-4 w-4" />} label="Critical (24h)" card={summary.critical_24h} accent="text-red-600" />
          <Stat icon={<Users className="h-4 w-4" />} label="Active Users" card={summary.active_users} accent="text-sky-600" />
          <div className="col-span-2 sm:col-span-1 lg:col-span-1">
            <Card className="h-full border-black/5 bg-white/70 p-4 backdrop-blur-xl rounded-2xl">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Layers className="h-4 w-4" /> Top Module
              </p>
              <p className="mt-2 truncate text-base font-bold">{summary.top_module.name}</p>
              <p className="text-xs text-muted-foreground">most active · {summary.top_module.share_pct}%</p>
            </Card>
          </div>
        </div>
      )}

      {/* charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-black/5 bg-white/70 p-4 backdrop-blur-xl rounded-2xl lg:col-span-2">
          <h3 className="mb-1 text-sm font-semibold">Events Over Time</h3>
          <p className="mb-3 text-xs text-muted-foreground">Volume by result status</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.success} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={C.success} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gFailure" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.failure} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={C.failure} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="bucket" tick={{ fontSize: 10 }} tickFormatter={(v) => String(v).slice(5)} minTickGap={24} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={36} />
                <Tooltip />
                <Area type="monotone" dataKey="success" stroke={C.success} fill="url(#gSuccess)" strokeWidth={2} name="Success" />
                <Area type="monotone" dataKey="failure" stroke={C.failure} fill="url(#gFailure)" strokeWidth={2} name="Failure" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-black/5 bg-white/70 p-4 backdrop-blur-xl rounded-2xl">
          <h3 className="mb-1 text-sm font-semibold">Status Breakdown</h3>
          <p className="mb-3 text-xs text-muted-foreground">Across selected window</p>
          <div className="flex items-center gap-3">
            <div className="relative h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={70} paddingAngle={2}>
                    {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold">{donutTotal >= 1000 ? `${(donutTotal / 1000).toFixed(1)}k` : donutTotal}</span>
                <span className="text-[10px] text-muted-foreground">EVENTS</span>
              </div>
            </div>
            <ul className="flex-1 space-y-1.5 text-sm">
              {breakdown.map((b) => (
                <li key={b.key} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 capitalize">
                    <span className="h-2.5 w-2.5 rounded-full" style={{
                      background: b.key === 'success' ? C.success : b.key === 'warning' ? C.warning : b.key === 'denied' ? C.denied : C.failure,
                    }} />
                    {b.key}
                  </span>
                  <span className="tabular-nums text-muted-foreground">{b.count} · {b.pct}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <Card className="border-black/5 bg-white/70 p-4 backdrop-blur-xl rounded-2xl">
        <h3 className="mb-3 text-sm font-semibold">Top Modules</h3>
        <div className="space-y-2">
          {modules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet</p>
          ) : modules.map((m) => (
            <div key={m.module} className="flex items-center gap-3">
              <span className="w-40 shrink-0 truncate text-sm">{m.module}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-600"
                  style={{ width: `${(m.count / maxModule) * 100}%` }} />
              </div>
              <span className="w-12 shrink-0 text-right text-sm tabular-nums text-muted-foreground">{m.count}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* filter bar */}
      <Card className="border-black/5 bg-white/70 p-4 backdrop-blur-xl rounded-2xl">
        <form onSubmit={(e) => { e.preventDefault(); setPage(0); loadEvents() }}
          className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search action, user, module, path, correlation ID, error…"
              value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={severity} onValueChange={(v) => { setSeverity(v); setPage(0) }}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Severity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severities</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0) }}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failure">Failure</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" variant="outline">Apply</Button>
          <Button type="button" variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </form>

        <div className="mb-2 text-xs text-muted-foreground">{total} events</div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Event / Action</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Error code</TableHead>
                <TableHead className="text-right">Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingEvents ? (
                <TableRow><TableCell colSpan={8} className="py-8 text-center text-muted-foreground">Loading…</TableCell></TableRow>
              ) : events.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="py-8 text-center text-muted-foreground">No events in this window</TableCell></TableRow>
              ) : events.map((e) => (
                <TableRow key={e.id} className="cursor-pointer" onClick={() => openDetail(e.id)}>
                  <TableCell className="whitespace-nowrap text-xs">{fmtTs(e.ts)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{e.action}</div>
                    <div className="text-xs text-muted-foreground">{e.event_type}</div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className={severityBadge(e.severity)}>{e.severity}</Badge></TableCell>
                  <TableCell className="text-xs">{e.user_id || '—'}</TableCell>
                  <TableCell className="text-xs">{e.module}</TableCell>
                  <TableCell><Badge variant="outline" className={statusBadge(e.status)}>{e.status}</Badge></TableCell>
                  <TableCell className="text-xs">{e.error_code || '—'}</TableCell>
                  <TableCell className="text-right text-xs tabular-nums">{fmtDur(e.duration_ms)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">page {page + 1} / {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Prev</Button>
            <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </Card>

      {/* detail panel */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {detail?.method} {detail?.path}
            </SheetTitle>
            <SheetDescription>
              {detail ? `${detail.status} · ${detail.status_code} · ${detail.environment}` : 'Loading…'}
            </SheetDescription>
          </SheetHeader>

          {detail && (
            <div className="space-y-5 px-4 pb-8">
              <Section title="Event Summary">
                <Row k="Event" v={detail.action} mono />
                <Row k="Timestamp" v={fmtTs(detail.ts)} />
                <Row k="Severity" v={detail.severity} />
                <Row k="Module" v={detail.module} />
                <Row k="Status" v={`${detail.status} (${detail.status_code})`} />
                <Row k="Duration" v={fmtDur(detail.duration_ms)} />
              </Section>

              <Section title="Request Details">
                <Row k="Correlation ID" v={detail.correlation_id} mono />
                <Row k="User" v={detail.user_id} />
                <Row k="IP Address" v={detail.ip} />
                <Row k="User Agent" v={detail.user_agent} />
                <Row k="Method" v={detail.method} />
                <Row k="Query" v={detail.query} />
              </Section>

              {(detail.error_message || detail.error_code) && (
                <Section title="Error Details">
                  <Row k="Category" v={detail.error_category} />
                  <Row k="Error Code" v={detail.error_code} />
                  <Row k="Exception" v={detail.exception_type} />
                  <Row k="Message" v={detail.error_message} />
                </Section>
              )}

              {detail.stack_trace && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Stack Trace</h4>
                  <pre className="max-h-64 overflow-auto rounded-xl bg-zinc-900 p-3 text-[11px] leading-relaxed text-zinc-100">
                    {detail.stack_trace}
                  </pre>
                </div>
              )}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground">Raw Payload</h4>
                  <Button variant="ghost" size="sm" onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(detail.raw_payload, null, 2))
                    toast.success('Copied')
                  }}>
                    <Copy className="mr-1 h-3.5 w-3.5" /> Copy
                  </Button>
                </div>
                <pre className="max-h-72 overflow-auto rounded-xl bg-zinc-900 p-3 text-[11px] leading-relaxed text-zinc-100">
                  {JSON.stringify(detail.raw_payload, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function Stat({ icon, label, card, accent }: {
  icon: React.ReactNode; label: string; card: StatCard; accent: string
}) {
  const delta = card.delta_pct
  return (
    <Card className="border-black/5 bg-white/70 p-4 backdrop-blur-xl rounded-2xl">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span className={accent}>{icon}</span> {label}
      </p>
      <p className={`mt-2 text-2xl font-bold ${accent}`}>{card.value.toLocaleString()}</p>
      {delta != null ? (
        <p className={`flex items-center gap-1 text-xs ${delta >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(delta)}% vs prev. period
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">vs prev. period</p>
      )}
    </Card>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{title}</h4>
      <div className="divide-y divide-black/5 rounded-xl border border-black/5">{children}</div>
    </div>
  )
}

function Row({ k, v, mono }: { k: string; v: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 px-3 py-2 text-sm">
      <span className="shrink-0 text-muted-foreground">{k}</span>
      <span className={`min-w-0 break-all text-right ${mono ? 'font-mono text-xs' : ''}`}>{v || '—'}</span>
    </div>
  )
}
