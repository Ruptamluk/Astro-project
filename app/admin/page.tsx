'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Activity, Coins, FileBadge, LogOut, Receipt, Search, ShieldCheck, Users } from 'lucide-react'
import { toast } from 'sonner'
import AuditDashboard from '@/components/admin/AuditDashboard'
import TransactionsDashboard from '@/components/admin/TransactionsDashboard'
import {
  adminApi, getAdminInfo, getAdminToken, clearAdminSession,
  type AdminUser, type ActivityEvent,
} from '@/lib/adminApi'

function fmt(ts: string | null): string {
  if (!ts) return '—'
  const d = new Date(ts)
  return isNaN(d.getTime()) ? '—' : d.toLocaleString()
}

export default function AdminPage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [adminName, setAdminName] = useState('')

  // grant form
  const [grantEmail, setGrantEmail] = useState('')
  const [amount, setAmount] = useState('200')
  const [mode, setMode] = useState<'set' | 'add'>('set')
  const [granting, setGranting] = useState(false)

  // report logo
  const [logoEmail, setLogoEmail] = useState('')
  const [logoBusy, setLogoBusy] = useState(false)

  // users
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const limit = 25

  // stats
  const [stats, setStats] = useState<{ total_users: number; active_24h: number; tokens_outstanding: number } | null>(null)

  // activity dialog
  const [activityOpen, setActivityOpen] = useState(false)
  const [activityUser, setActivityUser] = useState<AdminUser | null>(null)
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [loadingActivity, setLoadingActivity] = useState(false)

  useEffect(() => {
    if (!getAdminToken()) {
      router.replace('/admin/login')
      return
    }
    setAdminName(getAdminInfo()?.name || 'Admin')
    setReady(true)
  }, [router])

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true)
    try {
      const data = await adminApi.listUsers(search, page, limit)
      setUsers(data.users)
      setTotal(data.total)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoadingUsers(false)
    }
  }, [search, page])

  const loadStats = useCallback(async () => {
    try {
      setStats(await adminApi.stats())
    } catch {
      /* non-critical */
    }
  }, [])

  useEffect(() => {
    if (ready) loadUsers()
  }, [ready, loadUsers])

  useEffect(() => {
    if (ready) loadStats()
  }, [ready, loadStats])

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault()
    const n = parseInt(amount, 10)
    if (!grantEmail) { toast.error('Enter an email'); return }
    if (isNaN(n) || n < 0) { toast.error('Enter a valid amount'); return }
    setGranting(true)
    try {
      const res = await adminApi.grantTokens(grantEmail.trim(), n, mode)
      toast.success(`${res.email}: ${res.previous} → ${res.new_balance} tokens`)
      setGrantEmail('')
      loadUsers()
      loadStats()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Grant failed')
    } finally {
      setGranting(false)
    }
  }

  const handleReportLogo = async (grant: boolean) => {
    if (!logoEmail) { toast.error('Enter an email'); return }
    setLogoBusy(true)
    try {
      const res = await adminApi.grantReportLogo(logoEmail.trim(), grant)
      toast.success(`${res.email}: report-logo ${res.report_logo_access ? 'granted' : 'revoked'}`)
      setLogoEmail('')
      loadUsers()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setLogoBusy(false)
    }
  }

  const openActivity = async (u: AdminUser) => {
    setActivityUser(u)
    setActivityOpen(true)
    setEvents([])
    setLoadingActivity(true)
    try {
      const data = await adminApi.userActivity(u.id)
      setEvents(data.events)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load activity')
    } finally {
      setLoadingActivity(false)
    }
  }

  const handleLogout = async () => {
    try { await adminApi.logout() } catch { /* ignore */ }
    clearAdminSession()
    router.replace('/admin/login')
  }

  if (!ready) return null

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        {/* header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-600 to-indigo-700 text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-700 bg-clip-text text-xl font-bold text-transparent">
                Admin Portal
              </h1>
              <p className="text-sm text-muted-foreground">Signed in as {adminName}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        {/* stats */}
        {stats && (
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard label="Total users" value={stats.total_users} />
            <StatCard label="Active (24h)" value={stats.active_24h} />
            <StatCard label="Tokens outstanding" value={stats.tokens_outstanding} />
          </div>
        )}

        <Tabs defaultValue="grant" className="gap-4">
          <TabsList>
            <TabsTrigger value="grant"><Coins className="mr-1.5 h-4 w-4" /> Grant access</TabsTrigger>
            <TabsTrigger value="users"><Users className="mr-1.5 h-4 w-4" /> Users & Activity</TabsTrigger>
            <TabsTrigger value="transactions"><Receipt className="mr-1.5 h-4 w-4" /> Transactions</TabsTrigger>
            <TabsTrigger value="audit"><Activity className="mr-1.5 h-4 w-4" /> Audit Logs</TabsTrigger>
          </TabsList>

          {/* grant tab */}
          <TabsContent value="grant">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card className="border-black/5 bg-white/60 p-6 backdrop-blur-2xl rounded-3xl">
                <h2 className="mb-4 flex items-center gap-2 font-semibold">
                  <Coins className="h-4 w-4 text-primary" /> Know More tokens
                </h2>
                <form onSubmit={handleGrant} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="g-email">User email</Label>
                    <Input id="g-email" type="email" placeholder="user@example.com"
                      value={grantEmail} onChange={(e) => setGrantEmail(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="g-amount">Amount</Label>
                    <Input id="g-amount" type="number" min={0}
                      value={amount} onChange={(e) => setAmount(e.target.value)} />
                  </div>
                  <RadioGroup value={mode} onValueChange={(v) => setMode(v as 'set' | 'add')}
                    className="grid-cols-2">
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-black/10 bg-white/60 px-3 py-2 text-sm">
                      <RadioGroupItem value="set" id="m-set" />
                      <span><strong>Set</strong> balance to amount</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-black/10 bg-white/60 px-3 py-2 text-sm">
                      <RadioGroupItem value="add" id="m-add" />
                      <span><strong>Add</strong> to balance</span>
                    </label>
                  </RadioGroup>
                  <Button type="submit" disabled={granting} className="w-full">
                    {granting ? 'Granting…' : 'Grant tokens'}
                  </Button>
                </form>
              </Card>

              <Card className="border-black/5 bg-white/60 p-6 backdrop-blur-2xl rounded-3xl">
                <h2 className="mb-4 flex items-center gap-2 font-semibold">
                  <FileBadge className="h-4 w-4 text-primary" /> Report-logo access
                </h2>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="l-email">User email</Label>
                    <Input id="l-email" type="email" placeholder="user@example.com"
                      value={logoEmail} onChange={(e) => setLogoEmail(e.target.value)} />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => handleReportLogo(true)} disabled={logoBusy} className="flex-1">
                      Grant
                    </Button>
                    <Button onClick={() => handleReportLogo(false)} disabled={logoBusy}
                      variant="outline" className="flex-1">
                      Revoke
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Toggles the ₹5000 report-logo perk for this user.
                  </p>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* users tab */}
          <TabsContent value="users">
            <Card className="border-black/5 bg-white/60 p-4 backdrop-blur-2xl rounded-3xl sm:p-6">
              <form
                onSubmit={(e) => { e.preventDefault(); setPage(0); loadUsers() }}
                className="mb-4 flex gap-2"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search by email…" value={search}
                    onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Button type="submit" variant="outline">Search</Button>
              </form>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last login</TableHead>
                      <TableHead className="text-right">Tokens</TableHead>
                      <TableHead>Last view</TableHead>
                      <TableHead>Logo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingUsers ? (
                      <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Loading…</TableCell></TableRow>
                    ) : users.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No users</TableCell></TableRow>
                    ) : users.map((u) => (
                      <TableRow key={u.id} className="cursor-pointer" onClick={() => openActivity(u)}>
                        <TableCell className="font-medium">{u.email || '—'}</TableCell>
                        <TableCell>{u.phone || '—'}</TableCell>
                        <TableCell>{fmt(u.created_at)}</TableCell>
                        <TableCell>{fmt(u.last_login_at)}</TableCell>
                        <TableCell className="text-right">{u.know_more_tokens}</TableCell>
                        <TableCell>{fmt(u.know_more_view_expires_at)}</TableCell>
                        <TableCell>
                          {u.report_logo_access
                            ? <Badge>Yes</Badge>
                            : <Badge variant="outline">No</Badge>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {total} users · page {page + 1} / {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}>Prev</Button>
                  <Button variant="outline" size="sm" disabled={page + 1 >= totalPages}
                    onClick={() => setPage((p) => p + 1)}>Next</Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* transactions tab */}
          <TabsContent value="transactions">
            <TransactionsDashboard />
          </TabsContent>

          {/* audit tab */}
          <TabsContent value="audit">
            <AuditDashboard />
          </TabsContent>
        </Tabs>
      </div>

      {/* activity dialog */}
      <Dialog open={activityOpen} onOpenChange={setActivityOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{activityUser?.email || 'User'} activity</DialogTitle>
            <DialogDescription>
              Read-only timeline from existing data. View count is not tracked — only last view is shown.
            </DialogDescription>
          </DialogHeader>
          {loadingActivity ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
          ) : events.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No activity</p>
          ) : (
            <ul className="space-y-2">
              {events.map((ev, i) => (
                <li key={i} className="flex items-start gap-3 rounded-xl border border-black/5 bg-white/50 px-3 py-2">
                  <span className="mt-0.5"><Badge variant="outline">{ev.type}</Badge></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{ev.detail}</p>
                    <p className="text-xs text-muted-foreground">{fmt(ev.ts)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="border-black/5 bg-white/60 p-4 backdrop-blur-2xl rounded-2xl">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </Card>
  )
}
