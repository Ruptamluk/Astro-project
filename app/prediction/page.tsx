'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Star,
  Sparkles,
  Heart,
  LogOut,
  Palette,
  Zap,
  Orbit,
  MoonStar,
  Clock3,
  Stars,
  X,
} from 'lucide-react'

interface Prediction {
  driver_number: number
  conductor_number: number
  personal_year: number
  analysis: string
  lucky_color: string
  lucky_number: number
  dob: string

  strength_number?: number
  strength_prediction?: string
  strength_remedy?: string

  gochor_prediction?: string
  gochor_remedy?: string

  mahadasha_prediction?: string
  mahadasha_remedy?: string

  antardasha_prediction?: string
  antardasha_remedy?: string
}

type InsightKey = 'strength' | 'gochor' | 'mahadasha' | 'antardasha'

const colorMap: Record<string, string> = {
  Red: 'red',
  Blue: 'blue',
  Green: 'green',
  Yellow: 'yellow',
  Black: 'black',
  White: 'white',
  Purple: 'purple',
  Pink: 'pink',
  Orange: 'orange',
  Brown: 'brown',
  Gray: 'gray',
  Grey: 'gray',
  Gold: 'gold',
  Silver: 'silver',
  Maroon: 'maroon',
  Turquoise: 'turquoise',
  'Sea Green': 'seagreen',
  'Sky Blue': 'skyblue',
  Violet: 'violet',
}

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

export default function PredictionPage() {
  const router = useRouter()
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [loading, setLoading] = useState(true)
  const [openKnowMore, setOpenKnowMore] = useState(false)
  const [activeInsight, setActiveInsight] = useState<InsightKey>('strength')

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      router.push('/')
      return
    }

    const storedPrediction = localStorage.getItem('prediction')
    if (storedPrediction) {
      setPrediction(JSON.parse(storedPrediction))
    }

    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('userId')
    localStorage.removeItem('prediction')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.12),_transparent_24%),linear-gradient(to_bottom_right,_#fcf7ff,_#f5f3ff,_#eef2ff)]">
        <div className="text-center">
          <Star className="w-16 h-16 text-violet-500 mx-auto mb-4 animate-spin" />
          <p className="text-slate-600 text-lg">Loading your astrology insights...</p>
        </div>
      </div>
    )
  }

  if (!prediction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.12),_transparent_24%),linear-gradient(to_bottom_right,_#fcf7ff,_#f5f3ff,_#eef2ff)] p-4">
        <Card className="border-violet-200/60 bg-white/80 backdrop-blur-sm p-6 max-w-md shadow-xl rounded-3xl">
          <p className="text-slate-600 mb-4">No details found. Please start over.</p>
          <Button onClick={handleLogout} className="w-full bg-violet-600 hover:bg-violet-700 rounded-xl">
            Go Back
          </Button>
        </Card>
      </div>
    )
  }

  const luckyColorValue =
    colorMap[prediction.lucky_color] || prediction.lucky_color.toLowerCase() || '#999999'

  const strengthNumber =
    prediction.strength_number ?? getStrengthNumber(prediction.dob, prediction.driver_number)

  const insightContent = {
    strength: {
      title: 'Strength Number',
      value: strengthNumber,
      icon: Zap,
      prediction:
        prediction.strength_prediction ||
        'No strength number prediction available yet.',
      remedy:
        prediction.strength_remedy ||
        'No remedy available yet.',
    },
    gochor: {
      title: 'Gochor',
      value: null,
      icon: Orbit,
      prediction:
        prediction.gochor_prediction ||
        'No gochor prediction available yet.',
      remedy:
        prediction.gochor_remedy ||
        'No gochor remedy available yet.',
    },
    mahadasha: {
      title: 'Mahadasha',
      value: null,
      icon: MoonStar,
      prediction:
        prediction.mahadasha_prediction ||
        'No mahadasha prediction available yet.',
      remedy:
        prediction.mahadasha_remedy ||
        'No mahadasha remedy available yet.',
    },
    antardasha: {
      title: 'Antardasha',
      value: null,
      icon: Clock3,
      prediction:
        prediction.antardasha_prediction ||
        'No antardasha prediction available yet.',
      remedy:
        prediction.antardasha_remedy ||
        'No antardasha remedy available yet.',
    },
  } as const

  const currentInsight = insightContent[activeInsight]
  const CurrentInsightIcon = currentInsight.icon

  const insightCards = [
    {
      key: 'strength' as InsightKey,
      title: 'Strength Number',
      subtitle: 'Inner vibrational force',
      icon: Zap,
      value: strengthNumber,
    },
    {
      key: 'gochor' as InsightKey,
      title: 'Gochor',
      subtitle: 'Transit based insight',
      icon: Orbit,
      value: null,
    },
    {
      key: 'mahadasha' as InsightKey,
      title: 'Mahadasha',
      subtitle: 'Major planetary period',
      icon: MoonStar,
      value: null,
    },
    {
      key: 'antardasha' as InsightKey,
      title: 'Antardasha',
      subtitle: 'Sub-period insight',
      icon: Clock3,
      value: null,
    },
  ]

  return (
    <>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.12),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.10),_transparent_22%),linear-gradient(to_bottom_right,_#fcf7ff,_#f5f3ff,_#eef2ff)] p-4 md:p-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-80 h-80 bg-violet-300/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/2 w-72 h-72 bg-pink-200/20 rounded-full blur-3xl -translate-x-1/2" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-white/60 backdrop-blur-sm border border-violet-200/60 shadow-lg flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-violet-500" fill="currentColor" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-700 via-fuchsia-600 to-indigo-700 bg-clip-text text-transparent mb-3">
              Your Astrology Insights
            </h1>
            <p className="text-slate-600 text-sm md:text-base">
              Date of Birth: <span className="font-semibold text-slate-800">{prediction.dob}</span>
            </p>
          </div>

          <Card className="border-violet-200/60 bg-white/70 backdrop-blur-md shadow-2xl rounded-3xl mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-violet-200/70 via-fuchsia-200/60 to-indigo-200/70 px-6 md:px-8 py-5 border-b border-violet-200/60">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Stars className="w-6 h-6 text-violet-600" />
                Your Sacred Numbers
              </h2>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-5">
                <div className="rounded-2xl p-5 md:p-6 border border-violet-200 bg-gradient-to-br from-violet-100/70 to-white shadow-sm text-center min-h-[170px] flex flex-col justify-center">
                  <p className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Driver Number
                  </p>
                  <div className="text-4xl md:text-5xl font-bold text-violet-600 mb-2">
                    {prediction.driver_number}
                  </div>
                  <p className="text-xs text-slate-500">Core identity</p>
                </div>

                <div className="rounded-2xl p-5 md:p-6 border border-fuchsia-200 bg-gradient-to-br from-fuchsia-100/70 to-white shadow-sm text-center min-h-[170px] flex flex-col justify-center">
                  <p className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Conductor Number
                  </p>
                  <div className="text-4xl md:text-5xl font-bold text-fuchsia-600 mb-2">
                    {prediction.conductor_number}
                  </div>
                  <p className="text-xs text-slate-500">Outer expression</p>
                </div>

                <div className="rounded-2xl p-5 md:p-6 border border-indigo-200 bg-gradient-to-br from-indigo-100/70 to-white shadow-sm text-center min-h-[170px] flex flex-col justify-center">
                  <p className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Personal Year
                  </p>
                  <div className="text-4xl md:text-5xl font-bold text-indigo-600 mb-2">
                    {prediction.personal_year}
                  </div>
                  <p className="text-xs text-slate-500">Yearly influence</p>
                </div>

                <div className="rounded-2xl p-5 md:p-6 border border-pink-200 bg-gradient-to-br from-pink-100/70 to-white shadow-sm text-center min-h-[170px] flex flex-col justify-center">
                  <p className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Lucky Number
                  </p>
                  <div className="text-4xl md:text-5xl font-bold text-pink-600 mb-2">
                    {prediction.lucky_number}
                  </div>
                  <p className="text-xs text-slate-500">Supportive vibration</p>
                </div>

                <div className="rounded-2xl p-5 md:p-6 border border-sky-200 bg-gradient-to-br from-sky-100/70 to-white shadow-sm text-center min-h-[170px] flex flex-col justify-center">
                  <p className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Lucky Color
                  </p>
                  <div
                    className="w-16 h-16 rounded-2xl mx-auto mb-3 border-4 border-white shadow-md"
                    style={{ backgroundColor: luckyColorValue }}
                  />
                  <div className="text-lg md:text-xl font-bold text-slate-800">
                    {prediction.lucky_color}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-violet-200/60 bg-white/70 backdrop-blur-md shadow-2xl rounded-3xl mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-violet-200/70 via-fuchsia-200/60 to-indigo-200/70 px-6 md:px-8 py-5 border-b border-violet-200/60">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Heart className="w-6 h-6 text-fuchsia-600" />
                Driver–Conductor Analysis
              </h2>
            </div>

            <div className="p-6 md:p-8">
              <div className="rounded-2xl border border-violet-100 bg-white/70 p-6 md:p-7 shadow-sm">
                <p className="text-slate-700 leading-8 text-base md:text-lg whitespace-pre-line">
                  {prediction.analysis}
                </p>
              </div>

              <div className="mt-6">
                <Button
                  variant="link"
                  className="px-0 text-violet-700 text-base font-semibold hover:text-fuchsia-600"
                  onClick={() => {
                    setActiveInsight('strength')
                    setOpenKnowMore(true)
                  }}
                >
                  Know more
                </Button>
              </div>
            </div>
          </Card>

          <Card className="border-violet-200/60 bg-white/70 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-violet-200/70 via-fuchsia-200/60 to-indigo-200/70 px-6 md:px-8 py-5 border-b border-violet-200/60">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Palette className="w-6 h-6 text-indigo-600" />
                Auspicious Elements
              </h2>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-violet-100 bg-white/80 p-8 flex flex-col items-center justify-center shadow-sm min-h-[220px]">
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                    Lucky Color
                  </p>
                  <div
                    className="w-28 h-28 rounded-3xl border-4 border-white shadow-xl mb-4"
                    style={{ backgroundColor: luckyColorValue }}
                  />
                  <p className="text-2xl font-bold text-slate-800">{prediction.lucky_color}</p>
                </div>

                <div className="rounded-2xl border border-violet-100 bg-white/80 p-8 flex flex-col items-center justify-center shadow-sm min-h-[220px]">
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                    Lucky Number
                  </p>
                  <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-violet-100 to-fuchsia-100 border border-violet-200 flex items-center justify-center shadow-lg mb-4">
                    <p className="text-5xl font-bold text-violet-700">{prediction.lucky_number}</p>
                  </div>
                  <p className="text-slate-600">Your fortunate number vibration</p>
                </div>
              </div>
            </div>

            <div className="px-6 md:px-8 py-6 border-t border-violet-200/50 flex flex-col md:flex-row gap-3">
              <Button
                onClick={handleLogout}
                className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-xl h-11"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              <Button
                onClick={() => {
                  localStorage.removeItem('prediction')
                  router.push('/dob-selection')
                }}
                variant="outline"
                className="flex-1 rounded-xl h-11 border-violet-200 hover:bg-violet-50"
              >
                Select Another Date
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={openKnowMore} onOpenChange={setOpenKnowMore}>
        <DialogContent className="w-[96vw] max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-0 rounded-2xl shadow-2xl [&>button]:top-4 [&>button]:right-4 [&>button]:text-white [&>button]:opacity-80 [&>button:hover]:opacity-100 [&>button]:bg-white/20 [&>button]:rounded-full [&>button]:border-0">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600 px-7 py-6 rounded-t-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white/80" />
                Know More
              </DialogTitle>
              <DialogDescription className="text-violet-100 text-sm mt-1">
                Explore deeper astrology insights for Strength Number, Gochor, Mahadasha, and Antardasha.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="bg-[#f8f7ff] p-6">
            {/* Tab Cards */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {insightCards.map((item) => {
                const Icon = item.icon
                const isActive = activeInsight === item.key

                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveInsight(item.key)}
                    className={`rounded-xl border p-3 text-left transition-all duration-200 flex flex-col gap-1.5 w-full min-w-0 overflow-hidden ${
                      isActive
                        ? 'border-violet-400 bg-white shadow-md ring-1 ring-violet-300'
                        : 'border-slate-200 bg-white hover:border-violet-200 hover:shadow-sm'
                    }`}
                  >
                    <div className={`w-6 h-6 shrink-0 rounded-md flex items-center justify-center ${isActive ? 'bg-violet-100' : 'bg-slate-100'}`}>
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-violet-600' : 'text-slate-500'}`} />
                    </div>
                    <span className={`text-xs font-semibold leading-tight w-full ${isActive ? 'text-violet-700' : 'text-slate-600'}`}>
                      {item.title}
                    </span>
                    {item.value !== null && (
                      <div className={`text-2xl font-bold ${isActive ? 'text-violet-600' : 'text-slate-400'}`}>{item.value}</div>
                    )}
                    <p className="text-[11px] text-slate-400 leading-snug">{item.subtitle}</p>
                  </button>
                )
              })}
            </div>

            {/* Insight Content */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Section header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-violet-50 to-fuchsia-50">
                <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                  <CurrentInsightIcon className="w-5 h-5 text-violet-600" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-800">{currentInsight.title}</h3>
                  {activeInsight === 'strength' && (
                    <span className="text-xs font-bold text-violet-700 bg-violet-100 px-2.5 py-1 rounded-full border border-violet-200">
                      {strengthNumber}
                    </span>
                  )}
                </div>
              </div>

              {/* Prediction & Remedy */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-5 rounded-full bg-violet-500" />
                    <h4 className="font-bold text-slate-800">Prediction</h4>
                  </div>
                  <p className="text-slate-600 text-sm leading-7 whitespace-pre-line">
                    {currentInsight.prediction}
                  </p>
                </div>

                <div className="rounded-xl border border-fuchsia-100 bg-fuchsia-50/50 p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-5 rounded-full bg-fuchsia-500" />
                    <h4 className="font-bold text-slate-800">Remedy</h4>
                  </div>
                  <p className="text-slate-600 text-sm leading-7 whitespace-pre-line">
                    {currentInsight.remedy}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-5">
              <Button
                onClick={() => setOpenKnowMore(false)}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-6"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}