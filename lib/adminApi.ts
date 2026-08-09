// Admin portal API helper. Kept separate from lib/api.ts so no existing code is touched.
// Always attaches the Bearer admin token; on 401 it clears the token and bounces to login.

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export const ADMIN_TOKEN_KEY = 'adminToken'
export const ADMIN_INFO_KEY = 'adminInfo'

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(ADMIN_TOKEN_KEY)
}

export function setAdminSession(token: string, info: { email: string; name: string }) {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token)
  sessionStorage.setItem(ADMIN_INFO_KEY, JSON.stringify(info))
}

export function getAdminInfo(): { email: string; name: string } | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem(ADMIN_INFO_KEY)
  return raw ? JSON.parse(raw) : null
}

export function clearAdminSession() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY)
  sessionStorage.removeItem(ADMIN_INFO_KEY)
}

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}, auth = true): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  if (auth) {
    const token = getAdminToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers })

  if (res.status === 401 && auth) {
    clearAdminSession()
    if (typeof window !== 'undefined') window.location.href = '/admin/login'
    throw new ApiError('Session expired', 401)
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError(data.detail || 'Request failed', res.status)
  }
  return data as T
}

export interface AdminUser {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  // 'free' = created through "Use as Free"; 'registered' = OTP-verified account.
  user_type: string
  created_at: string | null
  last_login_at: string | null
  know_more_tokens: number
  know_more_view_expires_at: string | null
  report_logo_access: boolean
}

export interface ActivityEvent {
  type: string
  ts: string | null
  detail: string
}

export type AuditWindow = '24h' | '7d' | '30d' | 'all'

export interface TxnSummary {
  window: string
  configured: boolean
  gross_revenue: number
  net_revenue: number
  delta_gross_pct: number | null
  total_transactions: number
  delta_txns_pct: number | null
  successful: number
  failed: number
  refunded: number
  avg_order_value: number
}

export interface TxnTimelinePoint { bucket: string; revenue: number; success: number; failure: number }
export interface MethodCount { method: string; count: number; revenue: number }
export interface TypeCount { type: string; count: number; revenue: number }

export interface TxnRow {
  id: string
  created_at: string | null
  amount_rupees: number | null
  currency: string | null
  status: string | null
  method: string | null
  email: string | null
  user_id: string | null
  payment_type: string | null
}

export interface TxnDetail extends TxnRow {
  fee_rupees: number | null
  contact: string | null
  tokens: string | null
  order_id: string | null
  error_code: string | null
  error_description: string | null
  notes: Record<string, unknown> | null
  raw_payload: Record<string, unknown>
}

export interface StatCard {
  value: number
  delta_pct: number | null
}

export interface AuditSummary {
  window: string
  total_events: StatCard
  success: StatCard
  warnings: StatCard
  errors: StatCard
  security_events: StatCard
  failed_logins: StatCard
  critical_24h: StatCard
  active_users: StatCard
  top_module: { name: string; share_pct: number }
}

export interface TimelinePoint { bucket: string; success: number; failure: number }
export interface StatusSlice { key: string; count: number; pct: number }
export interface ModuleCount { module: string; count: number }

export interface AuditEventRow {
  id: string
  ts: string | null
  action: string | null
  module: string | null
  event_type: string | null
  severity: string | null
  status: string | null
  status_code: number | null
  user_id: string | null
  path: string | null
  error_code: string | null
  duration_ms: number | null
}

export interface AuditEventDetail extends AuditEventRow {
  method: string | null
  query: string | null
  ip: string | null
  user_agent: string | null
  correlation_id: string | null
  environment: string | null
  error_category: string | null
  error_message: string | null
  exception_type: string | null
  stack_trace: string | null
  raw_payload: Record<string, unknown>
}

export const adminApi = {
  login: (email: string, password: string) =>
    request<{ token: string; admin: { email: string; name: string } }>(
      '/api/admin/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
      false,
    ),
  logout: () => request('/api/admin/logout', { method: 'POST' }),
  grantTokens: (email: string, amount: number, mode: 'set' | 'add') =>
    request<{ email: string; previous: number; new_balance: number }>(
      '/api/admin/grant-tokens',
      { method: 'POST', body: JSON.stringify({ email, amount, mode }) },
    ),
  grantReportLogo: (email: string, grant: boolean) =>
    request<{ email: string; report_logo_access: boolean }>(
      '/api/admin/grant-report-logo',
      { method: 'POST', body: JSON.stringify({ email, grant }) },
    ),
  listUsers: (search: string, page: number, limit: number) =>
    request<{ total: number; page: number; limit: number; users: AdminUser[] }>(
      `/api/admin/users?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`,
    ),
  userActivity: (userId: string) =>
    request<{ user: Record<string, unknown>; events: ActivityEvent[] }>(
      `/api/admin/users/${userId}/activity`,
    ),
  stats: () =>
    request<{ total_users: number; active_24h: number; tokens_outstanding: number }>(
      '/api/admin/stats',
    ),

  audit: {
    summary: (window: AuditWindow) =>
      request<AuditSummary>(`/api/admin/audit/summary?window=${window}`),
    timeline: (window: AuditWindow) =>
      request<{ window: string; series: TimelinePoint[] }>(`/api/admin/audit/timeline?window=${window}`),
    statusBreakdown: (window: AuditWindow) =>
      request<{ total: number; breakdown: StatusSlice[] }>(`/api/admin/audit/status-breakdown?window=${window}`),
    topModules: (window: AuditWindow) =>
      request<{ modules: ModuleCount[] }>(`/api/admin/audit/top-modules?window=${window}`),
    events: (params: {
      search?: string; severity?: string; status?: string
      window: AuditWindow; page: number; limit: number
    }) => {
      const q = new URLSearchParams({
        search: params.search || '',
        severity: params.severity || 'all',
        status: params.status || 'all',
        window: params.window,
        page: String(params.page),
        limit: String(params.limit),
      })
      return request<{ total: number; page: number; limit: number; events: AuditEventRow[] }>(
        `/api/admin/audit/events?${q.toString()}`,
      )
    },
    eventDetail: (id: string) =>
      request<AuditEventDetail>(`/api/admin/audit/events/${id}`),
    exportUrl: (params: { search?: string; severity?: string; status?: string; window: AuditWindow }) => {
      const q = new URLSearchParams({
        search: params.search || '',
        severity: params.severity || 'all',
        status: params.status || 'all',
        window: params.window,
      })
      return `${API_BASE_URL}/api/admin/audit/events/export?${q.toString()}`
    },
  },

  transactions: {
    sync: () => request<{ configured: boolean; synced: number; total: number }>(
      '/api/admin/transactions/sync', { method: 'POST' }),
    syncStatus: () => request<{ configured: boolean; last_sync_at: string | null; total: number }>(
      '/api/admin/transactions/sync-status'),
    summary: (window: AuditWindow) =>
      request<TxnSummary>(`/api/admin/transactions/summary?window=${window}`),
    timeline: (window: AuditWindow) =>
      request<{ series: TxnTimelinePoint[] }>(`/api/admin/transactions/timeline?window=${window}`),
    byMethod: (window: AuditWindow) =>
      request<{ methods: MethodCount[] }>(`/api/admin/transactions/by-method?window=${window}`),
    byType: (window: AuditWindow) =>
      request<{ types: TypeCount[] }>(`/api/admin/transactions/by-type?window=${window}`),
    list: (params: {
      search?: string; status?: string; method?: string
      window: AuditWindow; page: number; limit: number
    }) => {
      const q = new URLSearchParams({
        search: params.search || '',
        status: params.status || 'all',
        method: params.method || 'all',
        window: params.window,
        page: String(params.page),
        limit: String(params.limit),
      })
      return request<{ total: number; page: number; limit: number; transactions: TxnRow[] }>(
        `/api/admin/transactions/transactions?${q.toString()}`)
    },
    detail: (id: string) =>
      request<TxnDetail>(`/api/admin/transactions/transactions/${id}`),
    exportUrl: (params: { search?: string; status?: string; method?: string; window: AuditWindow }) => {
      const q = new URLSearchParams({
        search: params.search || '',
        status: params.status || 'all',
        method: params.method || 'all',
        window: params.window,
      })
      return `${API_BASE_URL}/api/admin/transactions/transactions/export?${q.toString()}`
    },
  },
}
