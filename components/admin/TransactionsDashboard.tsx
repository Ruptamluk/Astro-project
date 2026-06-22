'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
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
  Banknote, Copy, CreditCard, Download, IndianRupee, RefreshCw, Search,
  TrendingDown, TrendingUp, Wallet, XCircle, RotateCcw, Receipt,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  adminApi, getAdminToken, type AuditWindow, type TxnSummary,
  type TxnTimelinePoint, type MethodCount, type TypeCount, type TxnRow, type TxnDetail,
} from '@/lib/adminApi'

const C = { revenue: '#7c3aed', success: '#16a34a', failure: '#dc2626' }
const METHOD_COLORS = ['#6366f1', '#16a34a', '#f59e0b', '#ec4899', '#06b6d4', '#f97316']

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
const inr2 = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })

function fmtTs(ts: string | null) {
  if (!ts) return '—'
  const d = new Date(ts)
  return isNaN(d.getTime()) ? '—' : d.toLocaleString()
}

function statusBadge(s: string | null) {
  return s === 'captured'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : s === 'failed'
      ? 'bg-red-50 text-red-700 border-red-200'
      : s === 'refunded'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-slate-50 text-slate-700 border-slate-200'
}

const TYPE_LABELS: Record<string, string> = {
  know_more_token: 'Know More tokens',
  report_logo: 'Report logo',
  unknown: 'Token',
}

export default function TransactionsDashboard() {
  const [window, setWindow] = useState<AuditWindow>('30d')
  const [summary, setSummary] = useState<TxnSummary | null>(null)
  const [timeline, setTimeline] = useState<TxnTimelinePoint[]>([])
  const [methods, setMethods] = useState<MethodCount[]>([])
  const [types, setTypes] = useState<TypeCount[]>([])
  const [syncInfo, setSyncInfo] = useState<{ last_sync_at: string | null; total: number; configured: boolean } | null>(null)
  const [syncing, setSyncing] = useState(false)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [method, setMethod] = useState('all')
  const [page, setPage] = useState(0)
  const [rows, setRows] = useState<TxnRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const limit = 25

  const [detail, setDetail] = useState<TxnDetail | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const loadOverview = useCallback(async () => {
    try {
      const [s, t, m, ty] = await Promise.all([
        adminApi.transactions.summary(window),
        adminApi.transactions.timeline(window),
        adminApi.transactions.byMethod(window),
        adminApi.transactions.byType(window),
      ])
      setSummary(s)
      setTimeline(t.series)
      setMethods(m.methods)
      setTypes(ty.types)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load transactions')
    }
  }, [window])

  const loadList = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminApi.transactions.list({ search, status, method, window, page, limit })
      setRows(data.transactions)
      setTotal(data.total)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load list')
    } finally {
      setLoading(false)
    }
  }, [search, status, method, window, page])

  const loadSyncStatus = useCallback(async () => {
    try { setSyncInfo(await adminApi.transactions.syncStatus()) } catch { /* ignore */ }
  }, [])

  useEffect(() => { loadOverview() }, [loadOverview])
  useEffect(() => { loadList() }, [loadList])
  useEffect(() => { loadSyncStatus() }, [loadSyncStatus])

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await adminApi.transactions.sync()
      if (!res.configured) {
        toast.error('Razorpay keys not configured on the server')
      } else {
        toast.success(`Synced ${res.synced} new · ${res.total} total`)
        loadOverview(); loadList(); loadSyncStatus()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  const openDetail = async (id: string) => {
    setDetailOpen(true); setDetail(null)
    try { setDetail(await adminApi.transactions.detail(id)) }
    catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to load') }
  }

  const handleExport = () => {
    const url = adminApi.transactions.exportUrl({ search, status, method, window })
    const token = getAdminToken()
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'transactions.csv'
        a.click()
        URL.revokeObjectURL(a.href)
      })
      .catch(() => toast.error('Export failed'))
  }

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const methodData = useMemo(
    () => methods.map((m, i) => ({ name: m.method, value: m.revenue, count: m.count, color: METHOD_COLORS[i % METHOD_COLORS.length] })),
    [methods],
  )
  const maxType = Math.max(1, ...types.map((t) => t.revenue))

  const notConfigured = summary && !summary.configured
  const empty = syncInfo && syncInfo.total === 0

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Receipt className="h-5 w-5 text-primary" /> Transactions &amp; Revenue
          </h2>
          <p className="text-sm text-muted-foreground">
            All Razorpay payments — historical and latest.
            {syncInfo?.last_sync_at && <> Last sync: {fmtTs(syncInfo.last_sync_at)}.</>}
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
          <Button size="sm" onClick={handleSync} disabled={syncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing…' : 'Sync now'}
          </Button>
        </div>
      </div>

      {(notConfigured || empty) && (
        <Card className="border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-800 rounded-2xl">
          {notConfigured
            ? 'Razorpay keys are not configured on the server (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET). Configure them to pull transactions.'
            : 'No transactions synced yet. Click “Sync now” to pull payments from Razorpay.'}
        </Card>
      )}

      {/* stat cards */}
      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <Stat icon={<IndianRupee className="h-4 w-4" />} label="Gross Revenue" value={inr.format(summary.gross_revenue)} delta={summary.delta_gross_pct} accent="text-violet-600" />
          <Stat icon={<Banknote className="h-4 w-4" />} label="Net Revenue" value={inr.format(summary.net_revenue)} accent="text-emerald-600" />
          <Stat icon={<Receipt className="h-4 w-4" />} label="Transactions" value={summary.total_transactions.toLocaleString()} delta={summary.delta_txns_pct} accent="text-indigo-600" />
          <Stat icon={<CreditCard className="h-4 w-4" />} label="Avg Order Value" value={inr.format(summary.avg_order_value)} accent="text-sky-600" />
          <Stat icon={<TrendingUp className="h-4 w-4" />} label="Successful" value={summary.successful.toLocaleString()} accent="text-emerald-600" />
          <Stat icon={<XCircle className="h-4 w-4" />} label="Failed" value={summary.failed.toLocaleString()} accent="text-red-600" />
          <Stat icon={<RotateCcw className="h-4 w-4" />} label="Refunded" value={summary.refunded.toLocaleString()} accent="text-amber-600" />
          <Stat icon={<Wallet className="h-4 w-4" />} label="Synced Total" value={(syncInfo?.total ?? 0).toLocaleString()} accent="text-slate-600" />
        </div>
      )}

      {/* charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-black/5 bg-white/70 p-4 backdrop-blur-xl rounded-2xl lg:col-span-2">
          <h3 className="mb-1 text-sm font-semibold">Revenue Over Time</h3>
          <p className="mb-3 text-xs text-muted-foreground">Captured revenue (₹)</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 5, right: 10, left: -4, bottom: 0 }}>
                <defs>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.revenue} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={C.revenue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="bucket" tick={{ fontSize: 10 }} tickFormatter={(v) => String(v).slice(5)} minTickGap={24} />
                <YAxis tick={{ fontSize: 10 }} width={52} tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                <Tooltip formatter={(v: number, n) => n === 'revenue' ? inr2.format(v) : v} />
                <Area type="monotone" dataKey="revenue" stroke={C.revenue} fill="url(#gRev)" strokeWidth={2} name="revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-black/5 bg-white/70 p-4 backdrop-blur-xl rounded-2xl">
          <h3 className="mb-1 text-sm font-semibold">Payment Methods</h3>
          <p className="mb-3 text-xs text-muted-foreground">By revenue</p>
          <div className="flex items-center gap-3">
            <div className="h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={methodData} dataKey="value" nameKey="name" innerRadius={46} outerRadius={70} paddingAngle={2}>
                    {methodData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => inr2.format(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 space-y-1.5 text-sm">
              {methods.length === 0 ? <li className="text-muted-foreground">No data</li> : methods.map((m, i) => (
                <li key={m.method} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 capitalize">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: METHOD_COLORS[i % METHOD_COLORS.length] }} />
                    {m.method}
                  </span>
                  <span className="tabular-nums text-muted-foreground">{inr.format(m.revenue)}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <Card className="border-black/5 bg-white/70 p-4 backdrop-blur-xl rounded-2xl">
        <h3 className="mb-3 text-sm font-semibold">Revenue by Type</h3>
        <div className="space-y-2">
          {types.length === 0 ? <p className="text-sm text-muted-foreground">No data yet</p> : types.map((t) => (
            <div key={t.type} className="flex items-center gap-3">
              <span className="w-40 shrink-0 truncate text-sm">{TYPE_LABELS[t.type || 'unknown'] || t.type}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-600" style={{ width: `${(t.revenue / maxType) * 100}%` }} />
              </div>
              <span className="w-24 shrink-0 text-right text-sm tabular-nums text-muted-foreground">{inr.format(t.revenue)}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* table */}
      <Card className="border-black/5 bg-white/70 p-4 backdrop-blur-xl rounded-2xl">
        <form onSubmit={(e) => { e.preventDefault(); setPage(0); loadList() }} className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search payment id, email, user, order…" value={search}
              onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0) }}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="captured">Captured</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="authorized">Authorized</SelectItem>
            </SelectContent>
          </Select>
          <Select value={method} onValueChange={(v) => { setMethod(v); setPage(0) }}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Method" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All methods</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="netbanking">Netbanking</SelectItem>
              <SelectItem value="wallet">Wallet</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" variant="outline">Apply</Button>
          <Button type="button" variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Export</Button>
        </form>

        <div className="mb-2 text-xs text-muted-foreground">{total} transactions</div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Payment ID</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Loading…</TableCell></TableRow>
              ) : rows.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No transactions</TableCell></TableRow>
              ) : rows.map((r) => (
                <TableRow key={r.id} className="cursor-pointer" onClick={() => openDetail(r.id)}>
                  <TableCell className="whitespace-nowrap text-xs">{fmtTs(r.created_at)}</TableCell>
                  <TableCell className="font-mono text-xs">{r.id}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.amount_rupees != null ? inr2.format(r.amount_rupees) : '—'}</TableCell>
                  <TableCell><Badge variant="outline" className={statusBadge(r.status)}>{r.status}</Badge></TableCell>
                  <TableCell className="text-xs capitalize">{r.method || '—'}</TableCell>
                  <TableCell className="text-xs">{r.email || '—'}</TableCell>
                  <TableCell className="text-xs">{TYPE_LABELS[r.payment_type || 'unknown'] || r.payment_type || '—'}</TableCell>
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
            <SheetTitle className="font-mono text-sm">{detail?.id}</SheetTitle>
            <SheetDescription>
              {detail ? `${detail.status} · ${detail.amount_rupees != null ? inr2.format(detail.amount_rupees) : ''}` : 'Loading…'}
            </SheetDescription>
          </SheetHeader>
          {detail && (
            <div className="space-y-5 px-4 pb-8">
              <Section title="Payment">
                <Row k="Amount" v={detail.amount_rupees != null ? inr2.format(detail.amount_rupees) : '—'} />
                <Row k="Razorpay fee+tax" v={detail.fee_rupees != null ? inr2.format(detail.fee_rupees) : '—'} />
                <Row k="Status" v={detail.status} />
                <Row k="Method" v={detail.method} />
                <Row k="Date" v={fmtTs(detail.created_at)} />
              </Section>
              <Section title="Customer">
                <Row k="Email" v={detail.email} />
                <Row k="Contact" v={detail.contact} />
                <Row k="User ID" v={detail.user_id} mono />
              </Section>
              <Section title="Order">
                <Row k="Type" v={TYPE_LABELS[detail.payment_type || 'unknown'] || detail.payment_type} />
                <Row k="Tokens" v={detail.tokens} />
                <Row k="Order ID" v={detail.order_id} mono />
              </Section>
              {(detail.error_code || detail.error_description) && (
                <Section title="Error">
                  <Row k="Code" v={detail.error_code} />
                  <Row k="Description" v={detail.error_description} />
                </Section>
              )}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground">Raw Payload</h4>
                  <Button variant="ghost" size="sm" onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(detail.raw_payload, null, 2)); toast.success('Copied')
                  }}><Copy className="mr-1 h-3.5 w-3.5" /> Copy</Button>
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

function Stat({ icon, label, value, delta, accent }: {
  icon: React.ReactNode; label: string; value: string; delta?: number | null; accent: string
}) {
  return (
    <Card className="border-black/5 bg-white/70 p-4 backdrop-blur-xl rounded-2xl">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span className={accent}>{icon}</span> {label}
      </p>
      <p className={`mt-2 text-xl font-bold ${accent}`}>{value}</p>
      {delta != null ? (
        <p className={`flex items-center gap-1 text-xs ${delta >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(delta)}% vs prev. period
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">&nbsp;</p>
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
