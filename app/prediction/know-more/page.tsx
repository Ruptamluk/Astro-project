'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
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
} from 'lucide-react'

interface Prediction {
  driver_number: number
  conductor_number: number
  personal_year: number
  analysis: string
  lucky_color: string
  lucky_number: number | string
  dob: string
  dob_chart?: string[][]
  strength_number?: number
  strength_prediction?: string
  strength_remedy?: string
  gochor_number?: number
  gochor_prediction?: string
  gochor_remedy?: string
  mahadasha_prediction?: string
  mahadasha_remedy?: string
  antardasha_prediction?: string
  antardasha_remedy?: string
}

type InsightKey = 'strength' | 'gochor' | 'mahadasha' | 'antardasha' | 'dobChart' | 'yog'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

const missingNumberAnalysis: Record<number, string> = {
  1: 'Weak expression power, do not have proper goal, do not maintain relationship.',
  2: 'Less sensitive power, weak intuition power, do not accept mistake.',
  3: 'Creativity will not support, do not have imagination power, face relationship issue.',
  4: 'Do not have discipline and not organized. Do not use knowledge properly and laziness.',
  5: 'Do not have balance in life, ups and down in life, always need support.',
  6: 'Luxury is missing, weak bonding in family, do not express thought, may do false commitment.',
  7: 'Detachment and restless mind, can cheat anyone, do not have proper planning.',
  8: 'Finance problem, unstable person, spend too much money, do not do hard work.',
  9: 'Do not have humanity, do not help others, problem in education.',
}

const repeatedNumberNegativeAnalysis: Record<number, string> = {
  1: 'Egoistic, dominating, stubborn, self-centered.',
  2: 'Mood swings, oversensitive, dependent.',
  3: 'Overconfidence, laziness, preaching nature.',
  4: 'Confusion, obsession, sudden ups/downs.',
  5: 'Restless, overthinking, laziness.',
  6: 'Overindulgence, laziness.',
  7: 'Isolation, confusion, detachment from reality.',
  8: 'Delays, pessimism, loneliness.',
  9: 'Anger, aggression.',
}

interface YogDefinition {
  numbers: number[]
  missingNumbers?: number[]
  name: string
  icon: typeof Star
  gradient: string
  borderColor: string
  traits: string[]
}

const yogDefinitions: YogDefinition[] = [
  {
    numbers: [3, 1, 9],
    name: 'Intellectual Yog',
    icon: Brain,
    gradient: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-200',
    traits: [
      'Intellectual success and growth in career',
      'Name and fame in society',
      'Late marriage',
    ],
  },
  {
    numbers: [6, 7, 5],
    name: 'Comfort Yog',
    icon: Gem,
    gradient: 'from-pink-500 to-rose-600',
    borderColor: 'border-pink-200',
    traits: [
      'Creative person',
      'Business minded, work independently',
      'Luxury & love marriage',
      'Extra relationship possibility',
    ],
  },
  {
    numbers: [2, 8, 4],
    name: 'Hard Working Success Yog',
    icon: Dumbbell,
    gradient: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-200',
    traits: [
      'Health issues & probability of accident',
      'Relationship issues',
      'Success comes through hard work',
      'Needs to be disciplined in life',
    ],
  },
  {
    numbers: [3, 6, 2],
    name: 'Education Yog',
    icon: GraduationCap,
    gradient: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-200',
    traits: [
      'Higher education & highly intellectual',
      'Manipulating & sensitive nature',
      'Less speaking person',
      'Need to control food habits',
    ],
  },
  {
    numbers: [1, 7, 8],
    name: 'Spiritual Yog',
    icon: Eye,
    gradient: 'from-purple-500 to-violet-600',
    borderColor: 'border-purple-200',
    traits: [
      '6th sense is high',
      'Multiple sources of income',
    ],
  },
  {
    numbers: [9, 5, 4],
    name: 'Workaholic Yog',
    icon: Briefcase,
    gradient: 'from-slate-500 to-gray-700',
    borderColor: 'border-slate-200',
    traits: [
      'Hard working person',
      'Appreciation will come late',
      'Can create enemies by words',
      'Helpful but creates disputes with siblings',
    ],
  },
  {
    numbers: [7, 3, 4],
    name: 'Success Yog',
    icon: TrendingUp,
    gradient: 'from-cyan-500 to-sky-600',
    borderColor: 'border-cyan-200',
    traits: [
      'High success rate with positive & spiritual mindset',
      'Money flow and growth in life',
      'Follow discipline in life',
    ],
  },
  {
    numbers: [9, 7, 2],
    name: 'Courageous Yog',
    icon: Sword,
    gradient: 'from-red-500 to-rose-700',
    borderColor: 'border-red-200',
    traits: [
      'Unstable mind',
      'Possibility of health issues',
      'Initial stage of life struggle may come',
      'Need to follow discipline & set goals',
    ],
  },
  {
    numbers: [3, 1],
    missingNumbers: [9],
    name: 'Partial Intellectual Yog',
    icon: Brain,
    gradient: 'from-blue-400 to-indigo-500',
    borderColor: 'border-blue-200',
    traits: [
      'Good thinker, leader',
      'Simple living, high thinking',
      'Good relationship with father and son',
      'Possibility of doctor and engineer',
    ],
  },
  {
    numbers: [1, 9],
    missingNumbers: [3],
    name: 'Partial Intellectual Yog',
    icon: Brain,
    gradient: 'from-blue-400 to-indigo-500',
    borderColor: 'border-blue-200',
    traits: [
      'High energy, working in freedom',
      'High confidence, leadership quality',
      'Anger issue',
      'Higher education',
    ],
  },
  {
    numbers: [2, 8],
    missingNumbers: [4],
    name: 'Partial Hard Working Yog',
    icon: Dumbbell,
    gradient: 'from-amber-400 to-orange-500',
    borderColor: 'border-amber-200',
    traits: [
      'Emotional with bad habit',
      'Family disturbance',
      'Struggle / injury in life',
      'Maintain distance from water',
    ],
  },
  {
    numbers: [8, 4],
    missingNumbers: [2],
    name: 'Partial Hard Working Yog',
    icon: Dumbbell,
    gradient: 'from-amber-400 to-orange-500',
    borderColor: 'border-amber-200',
    traits: [
      'Struggle and negativity too much',
      'Relationship issue',
      'Bad habit can make lazy',
      'Do not trust other, taking unwanted responsibility',
    ],
  },
  {
    numbers: [6, 7],
    missingNumbers: [5],
    name: 'Partial Comfort Yog',
    icon: Gem,
    gradient: 'from-pink-400 to-rose-500',
    borderColor: 'border-pink-200',
    traits: [
      'Support luxury and comfort life',
      'Knowledge in fine art',
      'Attract opposite gender, addiction',
    ],
  },
  {
    numbers: [5, 7],
    missingNumbers: [6],
    name: 'Partial Comfort Yog',
    icon: Gem,
    gradient: 'from-pink-400 to-rose-500',
    borderColor: 'border-pink-200',
    traits: [
      'Do not give correct answer',
      'Always make support, argumentity',
      'Can be good writer or good judge',
    ],
  },
  {
    numbers: [3, 6],
    missingNumbers: [2],
    name: 'Partial Education Yog',
    icon: GraduationCap,
    gradient: 'from-emerald-400 to-teal-500',
    borderColor: 'border-emerald-200',
    traits: [
      'Knowledgeable person, good professional life',
      'Higher education',
      'Always follows rules and regulation',
      'Health issue or marriage issue (get success after marriage)',
    ],
  },
  {
    numbers: [6, 2],
    missingNumbers: [3],
    name: 'Partial Education Yog',
    icon: GraduationCap,
    gradient: 'from-emerald-400 to-teal-500',
    borderColor: 'border-emerald-200',
    traits: [
      'Charming and attractive personality',
      'Attract opposite gender',
      'Good person by heart',
      'Interest in fine art, break in education',
    ],
  },
  {
    numbers: [1, 7],
    missingNumbers: [8],
    name: 'Partial Spiritual Yog',
    icon: Eye,
    gradient: 'from-purple-400 to-violet-500',
    borderColor: 'border-purple-200',
    traits: [
      'Noble hearted person',
      'Good growth in life if spiritual',
      'They can have ego problem',
      'Good possibility of government job',
    ],
  },
  {
    numbers: [7, 8],
    missingNumbers: [1],
    name: 'Partial Spiritual Yog',
    icon: Eye,
    gradient: 'from-purple-400 to-violet-500',
    borderColor: 'border-purple-200',
    traits: [
      'Family disturbance',
      'Bad habit',
      'Multiple relationship',
    ],
  },
  {
    numbers: [9, 5],
    missingNumbers: [4],
    name: 'Partial Workaholic Yog',
    icon: Briefcase,
    gradient: 'from-slate-400 to-gray-500',
    borderColor: 'border-slate-200',
    traits: [
      'Action oriented, sharp minded',
      'May be out spoken',
      'Can be good businessman, good doctor, good engineer',
      'Easily make bad relationship by their words',
    ],
  },
  {
    numbers: [5, 4],
    missingNumbers: [9],
    name: 'Partial Workaholic Yog',
    icon: Briefcase,
    gradient: 'from-slate-400 to-gray-500',
    borderColor: 'border-slate-200',
    traits: [
      'Intellectual, clever',
      'Do not follow other advice, can win anyone mind',
      'High risk taking capacity, strong will power',
      'Chance visit court or hospital due to some issues',
    ],
  },
  {
    numbers: [3, 7],
    missingNumbers: [4],
    name: 'Partial Success Yog',
    icon: TrendingUp,
    gradient: 'from-cyan-400 to-sky-500',
    borderColor: 'border-cyan-200',
    traits: [
      'Very good combination, knowledgeable person',
      'Feel emotional for others',
      'Do good for society, interest in occult science',
    ],
  },
  {
    numbers: [7, 4],
    missingNumbers: [3],
    name: 'Partial Success Yog',
    icon: TrendingUp,
    gradient: 'from-cyan-400 to-sky-500',
    borderColor: 'border-cyan-200',
    traits: [
      'May be good or bad, need family support',
      'Can have addiction',
      'Do not give time value',
    ],
  },
  {
    numbers: [9, 7],
    missingNumbers: [2],
    name: 'Partial Courageous Yog',
    icon: Sword,
    gradient: 'from-red-400 to-rose-500',
    borderColor: 'border-red-200',
    traits: [
      'Growth or blame in life',
      'Do not have good relationship with opposite gender',
      'Restless energy, blood loss',
    ],
  },
  {
    numbers: [7, 2],
    missingNumbers: [9],
    name: 'Partial Courageous Yog',
    icon: Sword,
    gradient: 'from-red-400 to-rose-500',
    borderColor: 'border-red-200',
    traits: [
      'Emotionally weak',
      'Living in past',
      'Health issue',
    ],
  },
]

function reduceToSingleDigit(num: number): number {
  let value = num
  while (value > 9) {
    value = value
      .toString()
      .split('')
      .reduce((sum, digit) => sum + Number(digit), 0)
  }
  return value
}

function getStrengthNumber(dob: string, driverNumber: number): number {
  const dobParts = dob.split('-')
  const month = dobParts[1] || '0'
  const monthDigitSum = month
    .split('')
    .reduce((sum, digit) => sum + Number(digit), 0)

  return reduceToSingleDigit(driverNumber + monthDigitSum)
}

function isInsightKey(value: string | null): value is InsightKey {
  return value === 'strength' ||
    value === 'gochor' ||
    value === 'mahadasha' ||
    value === 'antardasha' ||
    value === 'dobChart' ||
    value === 'yog'
}

export default function KnowMorePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [loading, setLoading] = useState(true)
  const initialTab = searchParams.get('tab')
  const [activeInsight, setActiveInsight] = useState<InsightKey>(
    isInsightKey(initialTab) ? initialTab : 'strength'
  )

  useEffect(() => {
    const nextTab = searchParams.get('tab')
    if (isInsightKey(nextTab)) {
      setActiveInsight(nextTab)
    }
  }, [searchParams])

  useEffect(() => {
    let isMounted = true

    const loadPrediction = async () => {
      try {
        const userId = localStorage.getItem('userId')

        if (!userId) {
          router.push('/')
          return
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
            if (isMounted) {
              setPrediction(latest)
            }
            localStorage.setItem('prediction', JSON.stringify(latest))
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

  const insightCards = [
    {
      key: 'strength' as InsightKey,
      title: 'Strength Number',
      subtitle: 'Inner vibrational force',
      icon: Zap,
      value: strengthNumber,
      prediction: prediction.strength_prediction || 'No strength number prediction available yet.',
      remedy: prediction.strength_remedy || 'No remedy available yet.',
    },
    {
      key: 'gochor' as InsightKey,
      title: 'Gochor',
      subtitle: 'Transit based insight',
      icon: Orbit,
      value: prediction.gochor_number ?? null,
      prediction: prediction.gochor_prediction || 'No gochor prediction available yet.',
      remedy: prediction.gochor_remedy || 'No gochor remedy available yet.',
    },
    {
      key: 'mahadasha' as InsightKey,
      title: 'Mahadasha',
      subtitle: 'Major planetary period',
      icon: MoonStar,
      value: null,
      prediction: prediction.mahadasha_prediction || 'No mahadasha prediction available yet.',
      remedy: prediction.mahadasha_remedy || 'No mahadasha remedy available yet.',
    },
    {
      key: 'antardasha' as InsightKey,
      title: 'Antardasha',
      subtitle: 'Sub-period insight',
      icon: Clock3,
      value: null,
      prediction: prediction.antardasha_prediction || 'No antardasha prediction available yet.',
      remedy: prediction.antardasha_remedy || 'No antardasha remedy available yet.',
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
                  Deep Astrology Insights
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
                        className="h-auto min-h-[148px] min-w-[220px] items-start justify-start rounded-[24px] border border-violet-100 bg-white/90 px-5 py-5 text-left text-slate-700 shadow-sm data-[state=active]:border-violet-300 data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-[0_18px_40px_-26px_rgba(124,58,237,0.7)]"
                      >
                        <div className="flex w-full flex-col gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100">
                            <Icon className="w-5 h-5 text-violet-600" />
                          </div>
                          <div>
                            <p className="text-lg font-bold leading-6 whitespace-normal">{item.title}</p>
                            {item.value !== null && (
                              <p className="mt-3 text-4xl font-bold leading-none text-slate-600">
                                {item.value}
                              </p>
                            )}
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
                  {item.key === 'yog' ? (
                    <div className="space-y-6">
                      {activeYogCount === 0 ? (
                        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-8 text-center">
                          <p className="text-slate-500">No active yog combinations found in your DOB chart.</p>
                        </div>
                      ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {yogResults.filter((y) => y.active).map((yog, index) => {
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
                                  <h3 className="font-bold text-base text-slate-800">
                                    {yog.name}
                                  </h3>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-xs font-mono text-slate-500">
                                      {yog.numbers.join(' \u2013 ')}
                                      {yog.missingNumbers && yog.missingNumbers.length > 0 && ` (${yog.missingNumbers.join(', ')} missing)`}
                                    </span>
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
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
                      )}


                    </div>
                  ) : item.key === 'dobChart' ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-6">
                        <Card className="rounded-[28px] border-violet-100 bg-[radial-gradient(circle_at_top,_rgba(217,70,239,0.10),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.10),_transparent_28%),linear-gradient(135deg,_rgba(245,243,255,0.95),_rgba(255,255,255,1))] p-5 md:p-7 shadow-inner">
                          <div className="grid grid-cols-3 gap-4 md:gap-5 max-w-[640px] mx-auto">
                            {dobChart.flatMap((row, rowIndex) =>
                              row.map((cell, colIndex) => (
                                <div
                                  key={`${rowIndex}-${colIndex}`}
                                  className="relative aspect-square overflow-hidden rounded-[26px] border border-violet-200/80 bg-white shadow-[0_18px_38px_-24px_rgba(124,58,237,0.45)] flex items-center justify-center"
                                >
                                  <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400" />
                                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(196,181,253,0.16),_transparent_36%)] pointer-events-none" />
                                  <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-[0.12em] text-violet-700 leading-none">
                                    {cell || ''}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </Card>

                        <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-4">
                          <Card className="rounded-[24px] border-violet-100 bg-white/90 p-5 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Missing</p>
                            <p className="mt-3 text-3xl font-bold text-violet-700">{missingDobNumbers.length}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-500">Numbers absent in the chart</p>
                          </Card>
                          <Card className="rounded-[24px] border-rose-100 bg-white/90 p-5 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Repeated</p>
                            <p className="mt-3 text-3xl font-bold text-rose-600">{repeatedNegativeDobNumbers.length}</p>
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
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="rounded-[28px] border-violet-100 bg-violet-50/60 p-6 md:p-7 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1.5 h-6 rounded-full bg-violet-500" />
                          <h2 className="text-lg font-bold text-slate-800">Prediction</h2>
                        </div>
                        <p className="text-base leading-8 whitespace-pre-line text-slate-700">
                          {item.prediction}
                        </p>
                      </Card>

                      <Card className="rounded-[28px] border-fuchsia-100 bg-fuchsia-50/60 p-6 md:p-7 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1.5 h-6 rounded-full bg-fuchsia-500" />
                          <h2 className="text-lg font-bold text-slate-800">Remedy</h2>
                        </div>
                        <p className="text-base leading-8 whitespace-pre-line text-slate-700">
                          {item.remedy}
                        </p>
                      </Card>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
