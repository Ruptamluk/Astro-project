'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { loadRazorpayScript, openRazorpayCheckout } from '@/lib/razorpay'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MoonStar,
  Orbit,
  Sparkles,
  Star,
  Zap,
  Trophy,
  Brain,
  Gem,
  Dumbbell,
  GraduationCap,
  Eye,
  Briefcase,
  TrendingUp,
  Sword,
  CheckCircle2,
  XCircle,
  Shield,
  Download,
  FileText,
  Coins,
  Lock,
} from 'lucide-react'
import ReportStudio from '@/components/report/ReportStudio'
import {
  Prediction,
  getStrengthNumber,
  yogDefinitions,
  DOB_CHART_LAYOUT,
  missingNumberAnalysis,
  repeatedNumberNegativeAnalysis,
  GAYATRI_MANTRAS,
  PLANET_YANTRAS,
  PERSONAL_YEAR_REMEDIES,
  CRYSTAL_REMEDIES,
  yogRemedyData,
  getYogRemedyKey,
  driverNumberProfiles,
  conductorNumberProfiles,
  PLANET_DESCRIPTIONS,
} from '@/lib/numerology'


type InsightKey = 'driver' | 'conductor' | 'strength' | 'gochor' | 'mahadasha' | 'antardasha' | 'dobChart' | 'yog' | 'dashas' | 'remedy' | 'report'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

function isInsightKey(value: string | null): value is InsightKey {
  return value === 'driver' ||
    value === 'conductor' ||
    value === 'strength' ||
    value === 'gochor' ||
    value === 'mahadasha' ||
    value === 'antardasha' ||
    value === 'dobChart' ||
    value === 'yog' ||
    value === 'dashas' ||
    value === 'remedy' ||
    value === 'report'
}

// ── Dasha helpers ──────────────────────────────────────────────────────────

function calculateProgress(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime()
  const end   = new Date(endDate).getTime()
  const now   = Date.now()
  if (end <= start) return 0
  return Math.min(Math.max(((now - start) / (end - start)) * 100, 0), 100)
}

export default function KnowMorePage() {
  const router = useRouter()
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeInsight, setActiveInsight] = useState<InsightKey>('driver')
  const [mantraOpen, setMantraOpen] = useState<string | null>(null)
  const [yantraOpen, setYantraOpen] = useState(false)
  const [clientName, setClientName] = useState<string>('')
  const [clientPhone, setClientPhone] = useState<string>('')
  const [reportLogoAccess, setReportLogoAccess] = useState(false)
  const [isPayingLogo, setIsPayingLogo] = useState(false)
  // Ensures the token spend runs only once per mount (guards against React
  // StrictMode's double-invoked effect double-charging / racing the spend).
  const consumeStartedRef = useRef(false)
  // Carries the viewing-window expiry across StrictMode's double effect pass so
  // the surviving pass can still schedule auto-logout without re-spending.
  const viewExpiresRef = useRef<string | null>(null)

  useEffect(() => {
    // Try dedicated userInfo key first (set by dob-selection)
    const info = localStorage.getItem('userInfo')
    if (info) {
      try {
        const parsed = JSON.parse(info)
        if (parsed.name) setClientName(parsed.name)
        if (parsed.phone) setClientPhone(parsed.phone)
        return
      } catch {}
    }
    // Fallback: read name/phone from prediction key (older sessions)
    const stored = localStorage.getItem('prediction')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.name) setClientName(parsed.name)
        if (parsed.phone) setClientPhone(parsed.phone)
      } catch {}
    }
  }, [])

  useEffect(() => {
    const nextTab = new URLSearchParams(window.location.search).get('tab')
    if (isInsightKey(nextTab)) {
      setActiveInsight(nextTab)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    let logoutTimer: ReturnType<typeof setTimeout> | undefined

    const logout = () => {
      localStorage.removeItem('userId')
      localStorage.removeItem('prediction')
      router.push('/')
    }

    const loadPrediction = async () => {
      try {
        const userId = localStorage.getItem('userId')

        if (!userId) {
          router.push('/')
          return
        }

        // Spend a token at most once per mount. React StrictMode invokes effects
        // twice in dev; the ref guards only the spend (not the rest of this
        // effect) so the surviving pass still loads the prediction below.
        if (!consumeStartedRef.current) {
          consumeStartedRef.current = true

          // Spending a token is the authoritative gate. The backend atomically
          // deducts one token (or reuses the active viewing window) and returns
          // when the 15-minute window expires. No token / no window -> 402.
          try {
            const consumeRes = await fetch(
              `${API_BASE_URL}/api/payment/consume-token/${userId}`,
              { method: 'POST' }
            )
            if (consumeRes.ok) {
              const consumeData = await consumeRes.json()
              viewExpiresRef.current = consumeData.expires_at ?? null
            } else {
              // 402 (no token) can also happen on a benign race. Only bounce if
              // the user is genuinely outside an active paid window.
              let activeWindow = false
              try {
                const checkRes = await fetch(`${API_BASE_URL}/api/auth/user/${userId}`)
                if (checkRes.ok) {
                  const checkData = await checkRes.json()
                  const exp = checkData.know_more_view_expires_at
                  if (exp && new Date(exp).getTime() > Date.now()) {
                    activeWindow = true
                    viewExpiresRef.current = exp
                  }
                }
              } catch {
                /* fall through to redirect */
              }
              if (!activeWindow) {
                consumeStartedRef.current = false
                router.push('/prediction')
                return
              }
            }
          } catch {
            consumeStartedRef.current = false
            router.push('/prediction')
            return
          }
        }

        // Load report-logo access (no longer gates the page, but drives UI).
        try {
          const userRes = await fetch(`${API_BASE_URL}/api/auth/user/${userId}`)
          if (userRes.ok) {
            const userData = await userRes.json()
            if (isMounted) setReportLogoAccess(userData.report_logo_access === true)
          }
        } catch {
          // Non-fatal — access was already granted by the token spend above.
        }

        // Auto-logout when the viewing window expires.
        if (viewExpiresRef.current) {
          const msLeft = new Date(viewExpiresRef.current).getTime() - Date.now()
          logoutTimer = setTimeout(logout, Math.max(msLeft, 0))
        }

        const storedPrediction = localStorage.getItem('prediction')

        if (storedPrediction) {
          try {
            const parsed = JSON.parse(storedPrediction)
            if (isMounted) {
              setPrediction(parsed)
            }
          } catch (err) {
            console.error('Invalid localStorage prediction JSON:', err)
            localStorage.removeItem('prediction')
          }
        }

        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 8000)

        try {
          const res = await fetch(
            `${API_BASE_URL}/api/predictions/get-prediction/${userId}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              signal: controller.signal,
            }
          )

          clearTimeout(timeout)

          if (res.ok) {
            const latest = await res.json()
            const stored = localStorage.getItem('prediction')
            const storedParsed = stored ? JSON.parse(stored) : {}
            const merged = { ...latest, name: storedParsed.name, phone: storedParsed.phone }
            if (isMounted) {
              setPrediction(merged)
            }
            localStorage.setItem('prediction', JSON.stringify(merged))
          } else {
            console.error('Prediction fetch failed with status:', res.status)
          }
        } catch (fetchErr) {
          clearTimeout(timeout)
          console.error('Prediction fetch error:', fetchErr)
        }
      } catch (error) {
        console.error('Failed to load prediction:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadPrediction()

    return () => {
      isMounted = false
      if (logoutTimer) clearTimeout(logoutTimer)
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.12),_transparent_24%),linear-gradient(to_bottom_right,_#fcf7ff,_#f5f3ff,_#eef2ff)]">
        <div className="text-center">
          <Star className="w-14 h-14 text-violet-500 mx-auto mb-4 animate-spin" />
          <p className="text-slate-600 text-lg">Loading detailed insights...</p>
        </div>
      </div>
    )
  }

  if (!prediction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.12),_transparent_24%),linear-gradient(to_bottom_right,_#fcf7ff,_#f5f3ff,_#eef2ff)] p-4">
        <Card className="border-violet-200/60 bg-white/85 backdrop-blur-sm p-6 max-w-md shadow-xl rounded-3xl">
          <p className="text-slate-600 mb-4">No details found. Please return and try again.</p>
          <Button
            onClick={() => router.push('/prediction')}
            className="w-full bg-violet-600 hover:bg-violet-700 rounded-xl"
          >
            Back to Prediction
          </Button>
        </Card>
      </div>
    )
  }

  const strengthNumber =
    prediction.strength_number ?? getStrengthNumber(prediction.dob, prediction.driver_number)

  const dobChart = prediction.dob_chart ?? [
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ]

  const presentDobNumbers = new Set(
    dobChart
      .flat()
      .flatMap((cell) => cell.split(''))
      .filter(Boolean)
      .map((digit) => Number(digit))
      .filter((digit) => digit >= 1 && digit <= 9)
  )

  const dobNumberCounts = dobChart
    .flat()
    .flatMap((cell) => cell.split(''))
    .filter(Boolean)
    .reduce<Record<number, number>>((counts, digit) => {
      const parsedDigit = Number(digit)
      if (parsedDigit >= 1 && parsedDigit <= 9) {
        counts[parsedDigit] = (counts[parsedDigit] ?? 0) + 1
      }
      return counts
    }, {})

  const missingDobNumbers = Array.from({ length: 9 }, (_, index) => index + 1).filter(
    (digit) => !presentDobNumbers.has(digit)
  )

  const repeatedNegativeDobNumbers = Array.from({ length: 9 }, (_, index) => index + 1).filter(
    (digit) => (dobNumberCounts[digit] ?? 0) > 2
  )

  const yogResults = yogDefinitions.map((yog) => {
    const active =
      yog.numbers.every((n) => presentDobNumbers.has(n)) &&
      (!yog.missingNumbers || yog.missingNumbers.every((n) => !presentDobNumbers.has(n)))
    return { ...yog, active }
  })
  const activeYogCount = yogResults.filter((y) => y.active).length

  // Save the generated report so it stays available in the Report Archive even
  // after the user checks a different DOB (which overwrites `prediction`).
  const handleArchiveReport = async () => {
    const userId = localStorage.getItem('userId')
    if (!userId || !prediction) return

    try {
      await fetch(`${API_BASE_URL}/api/reports/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dob: prediction.dob,
          name: clientName || prediction.name || '',
          phone: clientPhone || prediction.phone || '',
          prediction,
        }),
      })
    } catch (err) {
      // Archiving is best-effort: the user already has their download.
      console.error('Failed to archive report:', err)
    }
  }

  const handleLogoPayment = async () => {
    const userId = localStorage.getItem('userId')
    if (!userId) return

    setIsPayingLogo(true)
    try {
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        toast.error('Failed to load payment gateway. Please try again.')
        return
      }

      const orderRes = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, payment_type: 'report_logo' }),
      })

      if (!orderRes.ok) {
        toast.error('Could not create payment order. Please try again.')
        return
      }

      const orderData = await orderRes.json()

      openRazorpayCheckout({
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.order_id,
        name: 'Astrology App',
        description: 'Report Logo & Name Unlock',
        theme: { color: '#7c3aed' },
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/api/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                user_id: userId,
                payment_type: 'report_logo',
              }),
            })

            if (verifyRes.ok) {
              toast.success('Logo & Name unlocked!')
              setReportLogoAccess(true)
            } else {
              toast.error('Payment verification failed. Contact support.')
            }
          } catch {
            toast.error('Network error during verification.')
          }
        },
        modal: {
          ondismiss: () => setIsPayingLogo(false),
        },
      })
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsPayingLogo(false)
    }
  }


  const insightCards = [
    {
      key: 'driver' as InsightKey,
      title: 'Driver Number',
      subtitle: 'Core identity insights',
      icon: Star,
      value: prediction.driver_number,
      prediction: '',
      remedy: '',
    },
    {
      key: 'conductor' as InsightKey,
      title: 'Conductor Number',
      subtitle: 'Outer expression insights',
      icon: Sparkles,
      value: prediction.conductor_number,
      prediction: '',
      remedy: '',
    },
    {
      key: 'strength' as InsightKey,
      title: 'Strength Number',
      subtitle: 'Inner vibrational force',
      icon: Zap,
      value: strengthNumber,
      prediction: prediction.strength_prediction || 'No strength number prediction available yet.',
      remedy: (prediction.strength_remedy && !prediction.strength_remedy.toLowerCase().startsWith('no ')) ? prediction.strength_remedy : '',
    },
    {
      key: 'gochor' as InsightKey,
      title: 'Gochor',
      subtitle: 'Transit based insight',
      icon: Orbit,
      value: prediction.gochor_number ?? null,
      prediction: prediction.gochor_prediction || 'No gochor prediction available yet.',
      remedy: (prediction.gochor_remedy && !prediction.gochor_remedy.toLowerCase().startsWith('no ')) ? prediction.gochor_remedy : '',
    },
    {
      key: 'dobChart' as InsightKey,
      title: 'Vedic DOB Chart',
      subtitle: 'DOB digit matrix',
      icon: Sparkles,
      value: null,
      prediction: '',
      remedy: '',
    },
    {
      key: 'yog' as InsightKey,
      title: 'YOG',
      subtitle: 'Vedic yog analysis',
      icon: Trophy,
      value: null,
      prediction: '',
      remedy: '',
    },
    {
      key: 'dashas' as InsightKey,
      title: 'Dashas',
      subtitle: 'Current planetary periods',
      icon: CalendarDays,
      value: null,
      prediction: '',
      remedy: '',
    },
    {
      key: 'remedy' as InsightKey,
      title: 'Remedy',
      subtitle: 'Personalized spiritual remedies',
      icon: Shield,
      value: null,
      prediction: '',
      remedy: '',
    },
    {
      key: 'report' as InsightKey,
      title: 'Download Report',
      subtitle: 'Download as PDF or DOCX',
      icon: Download,
      value: null,
      prediction: '',
      remedy: '',
    },
  ]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.16),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.10),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.10),_transparent_22%),linear-gradient(to_bottom_right,_#fcf7ff,_#f5f3ff,_#eef2ff)] px-4 py-6 md:px-6 md:py-8 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-[32px] border border-white/80 bg-white/75 backdrop-blur-xl shadow-[0_32px_90px_-40px_rgba(76,29,149,0.45)] overflow-hidden">
          <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.26),_transparent_34%),linear-gradient(135deg,_#7c3aed,_#c026d3_58%,_#4f46e5)] px-5 py-6 md:px-8 md:py-8">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.12)_45%,transparent_100%)] pointer-events-none" />
            <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/90">
                  <Sparkles className="w-3.5 h-3.5 text-white/80" />
                  Insight Studio
                </div>
                <h1 className="mt-3 text-3xl md:text-4xl font-bold text-white">
                  Deep Numerology Insights
                </h1>
                <p className="mt-2 text-sm md:text-base leading-7 text-violet-100">
                  Explore your Strength Number, Gochor, Mahadasha, Antardasha, Vedic DOB Chart, and YOG Analysis in a full-screen tab view.
                </p>
              </div>

              <div className="relative flex flex-col items-start md:items-end gap-3">
                <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white/90">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/70">Date of Birth</p>
                  <p className="mt-1 text-lg font-semibold">{prediction.dob}</p>
                </div>
                <Button
                  onClick={() => router.push('/prediction')}
                  variant="secondary"
                  className="rounded-xl border border-white/20 bg-white/15 text-white hover:bg-white/25 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Prediction
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 lg:p-8">
            <Tabs value={activeInsight} onValueChange={(value) => setActiveInsight(value as InsightKey)} className="gap-6">
              <div className="overflow-x-auto pb-2">
                <TabsList className="h-auto w-max min-w-full justify-start gap-3 bg-transparent p-0">
                  {insightCards.map((item) => {
                    const Icon = item.icon
                    return (
                      <TabsTrigger
                        key={item.key}
                        value={item.key}
                        className="h-auto min-h-[148px] min-w-[220px] shrink-0 flex-none items-start justify-start rounded-[24px] border border-violet-100 bg-white/90 px-5 py-5 text-left text-slate-700 shadow-sm data-[state=active]:border-violet-300 data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-[0_18px_40px_-26px_rgba(124,58,237,0.7)]"
                      >
                        <div className="flex w-full flex-col gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100">
                            <Icon className="w-5 h-5 text-violet-600" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-lg font-bold leading-6 whitespace-normal">{item.title}</p>
                              {item.value !== null && (
                                <span className="inline-flex min-w-9 items-center justify-center rounded-full bg-violet-50 px-3 py-1 text-sm font-bold leading-none text-violet-700 border border-violet-100">
                                  {item.value}
                                </span>
                              )}
                            </div>
                            <p className="mt-3 text-sm leading-6 whitespace-normal text-slate-500">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
              </div>

              {insightCards.map((item) => (
                <TabsContent key={item.key} value={item.key}>
                  {item.key === 'driver' ? (
                    driverNumberProfiles[prediction.driver_number] ? (() => {
                      const profile = driverNumberProfiles[prediction.driver_number]
                      const insightBlocks = [
                        { title: 'Strengths', items: profile.strengths, icon: CheckCircle2, border: 'border-emerald-100', bg: 'bg-emerald-50/50', iconColor: 'text-emerald-600', dot: 'bg-emerald-500' },
                        { title: 'Weaknesses', items: profile.weaknesses, icon: XCircle, border: 'border-rose-100', bg: 'bg-rose-50/50', iconColor: 'text-rose-600', dot: 'bg-rose-500' },
                        { title: 'Suitable Careers', items: profile.careers, icon: Briefcase, border: 'border-indigo-100', bg: 'bg-indigo-50/50', iconColor: 'text-indigo-600', dot: 'bg-indigo-500' },
                        { title: 'Advice', items: profile.advice, icon: Sparkles, border: 'border-blue-100', bg: 'bg-blue-50/50', iconColor: 'text-blue-600', dot: 'bg-blue-500' },
                      ]
                      return (
                        <Card className="rounded-[28px] border-violet-100 bg-white/90 overflow-hidden shadow-sm">
                          <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50 px-5 py-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-violet-600" />
                            <div>
                              <h2 className="text-lg font-bold text-slate-800">Driver Number Insights</h2>
                              <p className="text-sm text-slate-600">
                                Driver <span className="font-semibold text-slate-800">{prediction.driver_number}</span>
                                {' · '}
                                <span className="font-semibold text-slate-800">{profile.planet}</span>
                              </p>
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {insightBlocks.map((block) => {
                                const BlockIcon = block.icon
                                return (
                                  <div key={block.title} className={`rounded-2xl border ${block.border} ${block.bg} p-5 shadow-sm flex flex-col gap-3`}>
                                    <div className="flex items-center gap-2">
                                      <BlockIcon className={`w-5 h-5 ${block.iconColor}`} />
                                      <h4 className="font-bold text-slate-800">{block.title}</h4>
                                    </div>
                                    <ul className="space-y-2">
                                      {block.items.map((entry, index) => (
                                        <li key={index} className="flex gap-2.5 text-slate-700 text-sm md:text-base leading-relaxed">
                                          <span className={`mt-2 w-1.5 h-1.5 rounded-full ${block.dot} shrink-0`} />
                                          <span>{entry}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </Card>
                      )
                    })() : (
                      <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-8 text-center">
                        <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No driver number insights available for this number.</p>
                      </div>
                    )
                  ) : item.key === 'conductor' ? (
                    conductorNumberProfiles[prediction.conductor_number] ? (() => {
                      const conductorProfile = conductorNumberProfiles[prediction.conductor_number]
                      return (
                        <Card className="rounded-[28px] border-fuchsia-100 bg-white/90 overflow-hidden shadow-sm">
                          <div className="border-b border-fuchsia-100 bg-gradient-to-r from-fuchsia-50 to-pink-50 px-5 py-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-fuchsia-600" />
                            <div>
                              <h2 className="text-lg font-bold text-slate-800">Conductor Number Insights</h2>
                              <p className="text-sm text-slate-600">
                                Conductor <span className="font-semibold text-slate-800">{prediction.conductor_number}</span>
                                {' · '}
                                <span className="font-semibold text-slate-800">{conductorProfile.planet}</span>
                              </p>
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50/50 p-5 shadow-sm">
                              <ul className="space-y-3">
                                {conductorProfile.paragraphs.map((paragraph, index) => (
                                  <li key={index} className="flex gap-2.5 text-slate-700 text-sm md:text-base leading-relaxed">
                                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-fuchsia-500 shrink-0" />
                                    <span>{paragraph}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </Card>
                      )
                    })() : (
                      <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-8 text-center">
                        <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No conductor number insights available for this number.</p>
                      </div>
                    )
                  ) : item.key === 'dashas' ? (
                    <div className="space-y-6">
                      {prediction.current_mahadasha_number ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* ── Current Mahadasha ── */}
                            <Card className="rounded-[28px] border-violet-100 overflow-hidden shadow-sm bg-white/90">
                              <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50 px-5 py-4 flex items-center gap-2">
                                <MoonStar className="w-5 h-5 text-violet-600" />
                                <h2 className="text-lg font-bold text-slate-800">Current Mahadasha</h2>
                              </div>
                              <div className="p-6 space-y-4">
                                <div className="flex items-start gap-4">
                                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shrink-0">
                                    <span className="text-3xl font-bold text-white">{prediction.current_mahadasha_number}</span>
                                  </div>
                                  <div>
                                    <p className="text-2xl font-bold text-slate-800">{prediction.current_mahadasha_planet}</p>
                                    <p className="text-sm font-medium text-violet-600 mt-0.5">Major Planetary Period</p>
                                  </div>
                                </div>
                                <div className="space-y-1.5 text-sm text-slate-600">
                                  <div className="flex items-center gap-2">
                                    <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
                                    <span>From: <span className="font-semibold text-slate-800">{prediction.mahadasha_start}</span></span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
                                    <span>Until: <span className="font-semibold text-slate-800">{prediction.mahadasha_end}</span></span>
                                  </div>
                                </div>
                                {prediction.mahadasha_start && prediction.mahadasha_end && (
                                  <div>
                                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                                      <span>Period Progress</span>
                                      <span className="font-semibold text-violet-700">
                                        {Math.round(calculateProgress(prediction.mahadasha_start, prediction.mahadasha_end))}%
                                      </span>
                                    </div>
                                    <div className="h-2.5 rounded-full bg-violet-100 overflow-hidden">
                                      <div
                                        className="h-2.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-500"
                                        style={{ width: `${calculateProgress(prediction.mahadasha_start, prediction.mahadasha_end)}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                                <div className="rounded-xl bg-violet-50 border border-violet-100 p-3">
                                  <p className="text-sm leading-6 text-violet-800">
                                    {PLANET_DESCRIPTIONS[prediction.current_mahadasha_number] ?? ''}
                                  </p>
                                </div>
                              </div>
                            </Card>

                            {/* ── Current Antardasha ── */}
                            <Card className="rounded-[28px] border-fuchsia-100 overflow-hidden shadow-sm bg-white/90">
                              <div className="border-b border-fuchsia-100 bg-gradient-to-r from-fuchsia-50 to-pink-50 px-5 py-4 flex items-center gap-2">
                                <Star className="w-5 h-5 text-fuchsia-600" />
                                <h2 className="text-lg font-bold text-slate-800">Current Antardasha</h2>
                              </div>
                              <div className="p-6 space-y-4">
                                <div className="flex items-start gap-4">
                                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-700 flex items-center justify-center shadow-lg shrink-0">
                                    <span className="text-3xl font-bold text-white">{prediction.current_antardasha_number}</span>
                                  </div>
                                  <div>
                                    <p className="text-2xl font-bold text-slate-800">{prediction.current_antardasha_planet}</p>
                                    <p className="text-sm font-medium text-fuchsia-600 mt-0.5">Sub Planetary Period</p>
                                  </div>
                                </div>
                                <div className="space-y-1.5 text-sm text-slate-600">
                                  <div className="flex items-center gap-2">
                                    <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
                                    <span>From: <span className="font-semibold text-slate-800">{prediction.antardasha_start}</span></span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
                                    <span>Until: <span className="font-semibold text-slate-800">{prediction.antardasha_end}</span></span>
                                  </div>
                                </div>
                                {prediction.antardasha_start && prediction.antardasha_end && (
                                  <div>
                                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                                      <span>Period Progress</span>
                                      <span className="font-semibold text-fuchsia-700">
                                        {Math.round(calculateProgress(prediction.antardasha_start, prediction.antardasha_end))}%
                                      </span>
                                    </div>
                                    <div className="h-2.5 rounded-full bg-fuchsia-100 overflow-hidden">
                                      <div
                                        className="h-2.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-600 transition-all duration-500"
                                        style={{ width: `${calculateProgress(prediction.antardasha_start, prediction.antardasha_end)}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                                <div className="rounded-xl bg-fuchsia-50 border border-fuchsia-100 p-3">
                                  <p className="text-sm leading-6 text-fuchsia-800">
                                    {PLANET_DESCRIPTIONS[prediction.current_antardasha_number ?? 0] ?? ''}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          </div>

                          {/* Combined influence summary */}
                          <Card className="rounded-[28px] border-slate-100 bg-gradient-to-br from-slate-50 to-violet-50/40 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-1.5 h-6 rounded-full bg-violet-500" />
                              <h2 className="text-lg font-bold text-slate-800">Combined Period Influence</h2>
                            </div>
                            <p className="text-base leading-8 text-slate-700">
                              You are currently in the{' '}
                              <span className="font-bold text-violet-700">{prediction.current_mahadasha_planet} Mahadasha</span>
                              {' '}(Number {prediction.current_mahadasha_number}) with{' '}
                              <span className="font-bold text-fuchsia-700">{prediction.current_antardasha_planet} Antardasha</span>
                              {' '}(Number {prediction.current_antardasha_number}). The combined energies of{' '}
                              <strong>{prediction.current_mahadasha_planet}</strong> and{' '}
                              <strong>{prediction.current_antardasha_planet}</strong> are actively shaping your life experiences.
                              Align your actions with these planetary vibrations for the best results.
                            </p>
                          </Card>

                          {/* ── Next 12 months ── */}
                          {prediction.dasha_timeline && prediction.dasha_timeline.length > 0 && (
                            <Card className="rounded-[28px] border-indigo-100 overflow-hidden shadow-sm bg-white/90">
                              <div className="border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-5 py-4 flex items-center gap-2">
                                <Clock3 className="w-5 h-5 text-indigo-600" />
                                <h2 className="text-lg font-bold text-slate-800">Next 12 Months</h2>
                              </div>
                              <div className="divide-y divide-slate-100">
                                {prediction.dasha_timeline.map((period) => (
                                  <div
                                    key={`${period.mahadasha_number}-${period.antardasha_number}-${period.start}`}
                                    className={`flex gap-4 p-5 ${period.is_current ? 'bg-violet-50/40 border-l-4 border-l-violet-500' : 'border-l-4 border-l-transparent'}`}
                                  >
                                    <div
                                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0 ${
                                        period.is_current
                                          ? 'bg-gradient-to-br from-fuchsia-500 to-pink-700'
                                          : 'bg-gradient-to-br from-slate-300 to-slate-400'
                                      }`}
                                    >
                                      <span className="text-xl font-bold text-white">{period.antardasha_number}</span>
                                    </div>

                                    <div className="min-w-0 flex-1 space-y-2">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-bold text-slate-800">
                                          {period.antardasha_planet} Antardasha
                                        </p>
                                        {period.is_current && (
                                          <span className="inline-flex items-center rounded-full bg-violet-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
                                            NOW
                                          </span>
                                        )}
                                        <span className="text-xs text-slate-500">
                                          in {period.mahadasha_planet} Mahadasha
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span className="font-semibold text-slate-800">{period.start}</span>
                                        <span className="text-slate-400">→</span>
                                        <span className="font-semibold text-slate-800">{period.end}</span>
                                      </div>

                                      {period.is_current && (
                                        <div className="h-2 rounded-full bg-violet-100 overflow-hidden max-w-sm">
                                          <div
                                            className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-600"
                                            style={{ width: `${calculateProgress(period.start, period.end)}%` }}
                                          />
                                        </div>
                                      )}

                                      <p className="text-sm leading-7 text-slate-600">
                                        {period.analysis || PLANET_DESCRIPTIONS[period.antardasha_number] || ''}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </Card>
                          )}

                          <Card className="rounded-[28px] border-amber-100 overflow-hidden shadow-sm bg-white/90">
                            <div className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-amber-600" />
                              <h2 className="text-lg font-bold text-slate-800">Dasha Analysis</h2>
                            </div>
                            <div className="p-6 space-y-4">
                              <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 border border-violet-100">
                                  Mahadasha {prediction.current_mahadasha_number} | {prediction.current_mahadasha_planet}
                                </span>
                                <span className="inline-flex items-center rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-semibold text-fuchsia-700 border border-fuchsia-100">
                                  Antardasha {prediction.current_antardasha_number} | {prediction.current_antardasha_planet}
                                </span>
                              </div>

                              {prediction.dasha_analysis ? (
                                <p className="text-base leading-8 text-slate-700">
                                  {prediction.dasha_analysis}
                                </p>
                              ) : (
                                <p className="text-sm leading-7 text-slate-500">
                                  No dasha analysis is available yet for this Mahadasha and Antardasha combination.
                                </p>
                              )}
                            </div>
                          </Card>
                        </>
                      ) : (
                        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-8 text-center">
                          <MoonStar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-500">Dasha information is being computed. Please re-submit your date of birth to activate this feature.</p>
                        </div>
                      )}
                    </div>
                  ) : item.key === 'yog' ? (
                    <div className="space-y-6">
                      <div className="rounded-2xl border border-violet-100 bg-white/75 px-4 py-4">
                        <p className="text-sm text-slate-600">
                          Showing <span className="font-semibold text-violet-700">{activeYogCount}</span> active yog{activeYogCount !== 1 ? 's' : ''} for this DOB.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {yogResults.filter((yog) => yog.active).map((yog, index) => {
                          const YogIcon = yog.icon
                          return (
                            <Card
                              key={index}
                              className={`rounded-[24px] ${yog.borderColor} bg-white p-5 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300`}
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${yog.gradient} shadow-md`}>
                                  <YogIcon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between gap-3">
                                    <h3 className="font-bold text-base text-slate-800">
                                      {yog.name}
                                    </h3>
                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                      Active
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-xs font-mono text-slate-500">
                                      {yog.numbers.join(' \u2013 ')}
                                      {yog.missingNumbers && yog.missingNumbers.length > 0 && ` (${yog.missingNumbers.join(', ')} missing)`}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <ul className="space-y-1.5 mt-3 ml-1">
                                {yog.traits.map((trait, tIndex) => (
                                  <li key={tIndex} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                                    {trait}
                                  </li>
                                ))}
                              </ul>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  ) : item.key === 'dobChart' ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-6">
                        <Card className="rounded-[28px] border-violet-100 bg-[radial-gradient(circle_at_top,_rgba(217,70,239,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.10),_transparent_24%),linear-gradient(135deg,_rgba(245,243,255,0.96),_rgba(255,255,255,1))] p-4 md:p-5 shadow-inner">
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-500">Vedic Grid</p>
                              <h2 className="mt-1 text-lg font-bold text-slate-800">DOB Energy Matrix</h2>
                            </div>
                            <div className="rounded-2xl border border-violet-100 bg-white/80 px-3 py-2 text-right shadow-sm">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Active Cells</p>
                              <p className="mt-1 text-lg font-bold text-violet-700">
                                {presentDobNumbers.size}/9
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-[520px] mx-auto">
                            {dobChart.flatMap((row, rowIndex) =>
                              row.map((cell, colIndex) => (
                                <div
                                  key={`${rowIndex}-${colIndex}`}
                                  className={`group relative aspect-square overflow-hidden rounded-[24px] border shadow-[0_16px_34px_-24px_rgba(124,58,237,0.45)] transition-all ${
                                    cell
                                      ? 'border-violet-200/80 bg-white'
                                      : 'border-dashed border-violet-100 bg-white/60'
                                  }`}
                                >
                                  <div className={`absolute inset-x-0 top-0 h-1.5 ${
                                    cell
                                      ? 'bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400'
                                      : 'bg-gradient-to-r from-violet-100 via-fuchsia-100 to-indigo-100'
                                  }`} />
                                  <div className="absolute left-3 top-3 inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-violet-100 bg-violet-50 px-2 text-xs font-bold text-violet-500">
                                    {DOB_CHART_LAYOUT[rowIndex][colIndex]}
                                  </div>
                                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(196,181,253,0.16),_transparent_40%)] pointer-events-none" />

                                  <div className="flex h-full items-center justify-center p-4">
                                    {cell ? (
                                      <div className="flex max-w-full flex-wrap items-center justify-center gap-2">
                                        {cell.split('').map((digit, digitIndex) => (
                                          <span
                                            key={`${rowIndex}-${colIndex}-${digitIndex}`}
                                            className="inline-flex h-12 min-w-12 items-center justify-center rounded-2xl bg-violet-100 px-3 text-2xl font-bold leading-none text-violet-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] sm:h-14 sm:min-w-14 sm:text-3xl"
                                          >
                                            {digit}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center justify-center text-violet-200">
                                        <div className="h-10 w-10 rounded-full border border-dashed border-violet-200/80" />
                                        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                          Missing
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </Card>

                        <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-4">
                          <Card className="rounded-[24px] border-violet-100 bg-white/90 p-5 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Missing</p>
                            <p className="mt-3 text-3xl font-bold text-violet-700">
                              {missingDobNumbers.length > 0
                                ? `${missingDobNumbers.join(', ')} (${missingDobNumbers.length})`
                                : 'None (0)'}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-500">Numbers absent in the chart</p>
                          </Card>
                          <Card className="rounded-[24px] border-rose-100 bg-white/90 p-5 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Repeated</p>
                            <p className="mt-3 text-3xl font-bold text-rose-600">
                              {repeatedNegativeDobNumbers.length > 0
                                ? `${repeatedNegativeDobNumbers.join(', ')} (${repeatedNegativeDobNumbers.length})`
                                : 'None (0)'}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-500">Numbers repeated more than twice</p>
                          </Card>
                          <Card className="rounded-[24px] border-slate-100 bg-white/90 p-5 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Chart Note</p>
                            <p className="mt-3 text-sm leading-7 text-slate-600">
                              Repeated digits intensify tendencies, while missing digits highlight areas that may need conscious effort and balance.
                            </p>
                          </Card>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <Card className="rounded-[28px] border-violet-100 bg-white/90 overflow-hidden shadow-sm">
                          <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50 px-5 py-4">
                            <h2 className="text-lg font-bold text-slate-800">Missing Number Analysis</h2>
                          </div>
                          {missingDobNumbers.length > 0 ? (
                            <div className="divide-y divide-slate-200">
                              {missingDobNumbers.map((digit) => (
                                <div
                                  key={digit}
                                  className="px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4"
                                >
                                  <span className="shrink-0 inline-flex items-center justify-center min-w-11 h-11 rounded-full bg-violet-100 text-violet-700 font-bold">
                                    {digit}
                                  </span>
                                  <p className="text-base leading-7 text-slate-700">
                                    {missingNumberAnalysis[digit]}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="px-5 py-5">
                              <p className="text-base leading-7 text-slate-700">
                                No missing numbers found in this Vedic DOB chart.
                              </p>
                            </div>
                          )}
                        </Card>

                        <Card className="rounded-[28px] border-rose-100 bg-white/90 overflow-hidden shadow-sm">
                          <div className="border-b border-rose-100 bg-gradient-to-r from-rose-50 to-orange-50 px-5 py-4">
                            <h2 className="text-lg font-bold text-slate-800">Negative Repeat Analysis</h2>
                          </div>
                          {repeatedNegativeDobNumbers.length > 0 ? (
                            <div className="divide-y divide-slate-200">
                              {repeatedNegativeDobNumbers.map((digit) => (
                                <div
                                  key={digit}
                                  className="px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4"
                                >
                                  <span className="shrink-0 inline-flex items-center justify-center min-w-11 h-11 rounded-full bg-rose-100 text-rose-700 font-bold">
                                    {digit}
                                  </span>
                                  <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                      Repeated {dobNumberCounts[digit]} times
                                    </p>
                                    <p className="text-base leading-7 text-slate-700">
                                      {repeatedNumberNegativeAnalysis[digit]}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="px-5 py-5">
                              <p className="text-base leading-7 text-slate-700">
                                No number is repeated more than two times in this Vedic DOB chart.
                              </p>
                            </div>
                          )}
                        </Card>
                      </div>
                    </div>
                  ) : item.key === 'remedy' ? (
                    <div className="space-y-4">
                      {/* 2×2 grid for the 4 main remedy cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Driver-Conductor Remedy */}
                        <Card className="rounded-[24px] border-emerald-100 overflow-hidden shadow-sm bg-white/90">
                          <div className="p-5 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className="rounded-lg p-1.5 bg-emerald-100 shrink-0">
                                  <Shield className="w-4 h-4 text-emerald-600" />
                                </div>
                                <h2 className="text-sm font-bold text-slate-800">Driver-Conductor Remedy</h2>
                              </div>
                              <div className="flex gap-1.5 shrink-0">
                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
                                  D{prediction.driver_number}
                                </span>
                                <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 border border-teal-100">
                                  C{prediction.conductor_number}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm leading-7 text-slate-700">
                              {prediction.driver_conductor_remedy || 'No remedy available for this combination.'}
                            </p>
                          </div>
                        </Card>

                        {/* Mahadasha Remedy */}
                        <Card className="rounded-[24px] border-violet-100 overflow-hidden shadow-sm bg-white/90">
                          <div className="p-5 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className="rounded-lg p-1.5 bg-violet-100 shrink-0">
                                  <MoonStar className="w-4 h-4 text-violet-600" />
                                </div>
                                <h2 className="text-sm font-bold text-slate-800">Mahadasha Remedy</h2>
                              </div>
                              {prediction.current_mahadasha_planet && (
                                <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700 border border-violet-100 shrink-0">
                                  {prediction.current_mahadasha_planet}
                                </span>
                              )}
                            </div>
                            {(() => {
                              const planet = prediction.current_mahadasha_planet
                              const mantra = planet ? GAYATRI_MANTRAS[planet] : undefined
                              return mantra ? (
                                <button
                                  onClick={() => setMantraOpen(planet ?? null)}
                                  className="text-violet-700 font-semibold underline underline-offset-4 hover:text-violet-900 transition-colors text-sm text-left"
                                >
                                  {mantra.label}
                                </button>
                              ) : (
                                <p className="text-sm leading-7 text-slate-700">
                                  {prediction.mahadasha_remedy || 'No mahadasha remedy available yet.'}
                                </p>
                              )
                            })()}
                          </div>
                        </Card>

                        {/* Yantra */}
                        <Card className="rounded-[24px] border-fuchsia-100 overflow-hidden shadow-sm bg-white/90">
                          <div className="p-5 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className="rounded-lg p-1.5 bg-fuchsia-100 shrink-0">
                                  <Star className="w-4 h-4 text-fuchsia-600" />
                                </div>
                                <h2 className="text-sm font-bold text-slate-800">Yantra</h2>
                              </div>
                              <span className="inline-flex items-center rounded-full bg-fuchsia-50 px-2.5 py-0.5 text-xs font-semibold text-fuchsia-700 border border-fuchsia-100 shrink-0">
                                Driver {prediction.driver_number}
                              </span>
                            </div>
                            {(() => {
                              const yantra = PLANET_YANTRAS[prediction.driver_number]
                              return yantra ? (
                                <button
                                  onClick={() => setYantraOpen(true)}
                                  className="text-fuchsia-700 font-semibold underline underline-offset-4 hover:text-fuchsia-900 transition-colors text-sm text-left"
                                >
                                  {yantra.label}
                                </button>
                              ) : (
                                <p className="text-sm leading-7 text-slate-700">No yantra available.</p>
                              )
                            })()}
                          </div>
                        </Card>

                        {/* Personal Year Remedy */}
                        <Card className="rounded-[24px] border-indigo-100 overflow-hidden shadow-sm bg-white/90">
                          <div className="p-5 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className="rounded-lg p-1.5 bg-indigo-100 shrink-0">
                                  <CalendarDays className="w-4 h-4 text-indigo-600" />
                                </div>
                                <h2 className="text-sm font-bold text-slate-800">Personal Year Remedy</h2>
                              </div>
                              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-100 shrink-0">
                                Year {prediction.personal_year}
                              </span>
                            </div>
                            <p className="text-sm leading-7 text-slate-700 font-medium">
                              {PERSONAL_YEAR_REMEDIES[prediction.personal_year] ?? 'No remedy available for this personal year.'}
                            </p>
                          </div>
                        </Card>

                      </div>

                      {/* Crystal — full width below grid */}
                      {missingDobNumbers.length > 0 && (
                        <Card className="rounded-[24px] border-fuchsia-100 overflow-hidden shadow-sm bg-white/90">
                          <div className="p-5 space-y-4">
                            <div className="flex items-center gap-2.5">
                              <div className="rounded-lg p-1.5 bg-fuchsia-100 shrink-0">
                                <Gem className="w-4 h-4 text-fuchsia-600" />
                              </div>
                              <h2 className="text-sm font-bold text-slate-800">Crystal</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {missingDobNumbers.map((digit) => {
                                const crystal = CRYSTAL_REMEDIES[digit]
                                if (!crystal) return null
                                return (
                                  <div key={digit} className="rounded-xl bg-fuchsia-50 border border-fuchsia-100 p-3.5 space-y-2.5">
                                    <p className="text-sm font-bold text-fuchsia-800">{crystal.name}</p>
                                    <ul className="space-y-1.5">
                                      {crystal.benefits.map((benefit, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-fuchsia-900 leading-6">
                                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-fuchsia-400 shrink-0" />
                                          {benefit}
                                        </li>
                                      ))}
                                    </ul>
                                    <div className="rounded-lg bg-white border border-fuchsia-100 p-3">
                                      <p className="text-xs font-bold text-fuchsia-700 uppercase tracking-wide mb-1">
                                        Crystal Affirmation — Chant it 5 times in the morning
                                      </p>
                                      <p className="text-sm italic text-slate-700 leading-6">“{crystal.affirmation}”</p>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                            <p className="text-sm leading-7 text-slate-600 font-medium">
                              As per your chart, we recommend the above crystals for your progress and stability.
                            </p>
                          </div>
                        </Card>
                      )}

                      {/* Yog Remedies — full width below grid */}
                      {(() => {
                        const activeYogsWithRemedies = yogResults
                          .filter((y) => y.active)
                          .map((y) => ({
                            name: y.name,
                            remedies: yogRemedyData[getYogRemedyKey(y.numbers, y.missingNumbers)],
                          }))
                          .filter((y) => y.remedies && y.remedies.length > 0)

                        if (activeYogsWithRemedies.length === 0) return null

                        return (
                          <Card className="rounded-[24px] border-amber-100 overflow-hidden shadow-sm bg-white/90">
                            <div className="p-5 space-y-4">
                              <div className="flex items-center gap-2.5">
                                <div className="rounded-lg p-1.5 bg-amber-100 shrink-0">
                                  <Trophy className="w-4 h-4 text-amber-600" />
                                </div>
                                <h2 className="text-sm font-bold text-slate-800">Yog Remedies</h2>
                                <span className="ml-auto inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-100">
                                  {activeYogsWithRemedies.length} active yog{activeYogsWithRemedies.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {activeYogsWithRemedies.map((yog, idx) => (
                                  <div key={idx} className="rounded-xl bg-amber-50 border border-amber-100 p-3.5 space-y-2">
                                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                                      {yog.name}
                                    </p>
                                    <ul className="space-y-1.5">
                                      {yog.remedies.map((remedy, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-amber-900 leading-6">
                                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                          {remedy}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </Card>
                        )
                      })()}


                    </div>
                  ) : item.key === 'report' ? (
                      <ReportStudio
                        prediction={prediction}
                        reportLogoAccess={reportLogoAccess}
                        clientName={clientName}
                        clientPhone={clientPhone}
                        onUnlockLogo={handleLogoPayment}
                        isUnlockingLogo={isPayingLogo}
                        onArchive={handleArchiveReport}
                      />
                  ) : (
                    <div className={`grid grid-cols-1 ${item.remedy ? 'lg:grid-cols-2' : ''} gap-6`}>
                      <Card className="rounded-[28px] border-violet-100 bg-violet-50/60 p-6 md:p-7 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1.5 h-6 rounded-full bg-violet-500" />
                          <h2 className="text-lg font-bold text-slate-800">Prediction</h2>
                        </div>
                        <p className="text-base leading-8 whitespace-pre-line text-slate-700">
                          {item.prediction}
                        </p>
                      </Card>

                      {item.remedy && (
                        <Card className="rounded-[28px] border-fuchsia-100 bg-fuchsia-50/60 p-6 md:p-7 shadow-sm">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-6 rounded-full bg-fuchsia-500" />
                            <h2 className="text-lg font-bold text-slate-800">Remedy</h2>
                          </div>
                          <p className="text-base leading-8 whitespace-pre-line text-slate-700">
                            {item.remedy}
                          </p>
                        </Card>
                      )}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>

      {mantraOpen && GAYATRI_MANTRAS[mantraOpen] && (
        <Dialog open={!!mantraOpen} onOpenChange={(open) => { if (!open) setMantraOpen(null) }}>
          <DialogContent className="max-w-lg rounded-[28px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-800">
                {GAYATRI_MANTRAS[mantraOpen].label}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="rounded-xl bg-violet-50 border border-violet-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-violet-500 mb-2">Sanskrit</p>
                <p className="text-lg leading-9 text-violet-900 whitespace-pre-line font-serif">
                  {GAYATRI_MANTRAS[mantraOpen].sanskrit}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">English Transliteration</p>
                <p className="text-base leading-8 text-slate-700 whitespace-pre-line italic">
                  {GAYATRI_MANTRAS[mantraOpen].transliteration}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-3">Benefits</p>
                <ul className="space-y-1.5">
                  {GAYATRI_MANTRAS[mantraOpen].benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {yantraOpen && (() => {
        const yantra = PLANET_YANTRAS[prediction?.driver_number ?? 0]
        if (!yantra) return null
        return (
          <Dialog open={yantraOpen} onOpenChange={(open) => { if (!open) setYantraOpen(false) }}>
            <DialogContent className="max-w-lg rounded-[28px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-800">
                  {yantra.label}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="rounded-xl bg-fuchsia-50 border border-fuchsia-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-fuchsia-500 mb-3">Numerological Yantra</p>
                  <div className="grid grid-cols-3 gap-2 max-w-[180px] mx-auto">
                    {yantra.grid.flat().map((num, i) => (
                      <div
                        key={i}
                        className={`flex items-center justify-center h-12 w-full rounded-lg border text-lg font-bold ${
                          i < 3
                            ? 'bg-fuchsia-600 text-white border-fuchsia-700'
                            : 'bg-white text-slate-800 border-fuchsia-200'
                        }`}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-2">Benefits</p>
                  <ul className="space-y-1.5">
                    {yantra.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-fuchsia-400 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-2">How to Use</p>
                  <ul className="space-y-1.5">
                    {yantra.howToUse.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )
      })()}
    </div>
  )
}
