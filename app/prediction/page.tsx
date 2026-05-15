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
  analysis: any
  lucky_color: string
  unlucky_color?: string
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
  Golden: 'gold',
  Silver: 'silver',
  Maroon: 'maroon',
  Meroon: 'maroon',
  Turquoise: 'turquoise',
  'Sea Green': 'seagreen',
  'Sky Blue': 'skyblue',
  Violet: 'violet',
  'Pale Green': '#98fb98',
  'Light Blue': '#add8e6',
  'Light Green': '#90ee90',
  'Dark Blue': '#1e3a8a',
  Ashy: '#b2beb5',
  'Any Dark Color': '#1f2937',
  Navy: 'navy',
  'Navy Blue': 'navy',
  cream: '#fffdd0',
  creem: '#fffdd0',
}

const numberCharacteristics: Record<number, string> = {
  1: "Leadership, authority, confidence, independence, Name and Fame",
  2: "Emotional, intuitive, artistic, nurturing.",
  3: "Wisdom, expansion, knowledge, spirituality.",
  4: "Innovative, unconventional, technical genius.",
  5: "Communication, intelligence, adaptability.",
  6: "Love, luxury, beauty, harmony.",
  7: "Spiritual, research-oriented, detached wisdom.",
  8: "Discipline, justice, hard work.",
  9: "Courage, action, energy, leadership.",
}

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
  {
    numbers: [3, 2],
    missingNumbers: [6],
    name: 'Partial Education Yog',
    icon: GraduationCap,
    gradient: 'from-emerald-400 to-teal-500',
    borderColor: 'border-emerald-200',
    traits: [
      'Philosopher minded and emotional',
      'Can have ego, win over enemy',
      'Make relationship from heart',
      'Sometimes child happiness is missing',
    ],
  },
  {
    numbers: [1, 8],
    missingNumbers: [7],
    name: 'Partial Spiritual Yog',
    icon: Eye,
    gradient: 'from-purple-400 to-violet-500',
    borderColor: 'border-purple-200',
    traits: [
      'Health issue, financial instability',
      'Sometimes argument between father and children',
      'Ups and down in career',
      'Do bad with government body',
    ],
  },
  {
    numbers: [9, 4],
    missingNumbers: [5],
    name: 'Partial Workaholic Yog',
    icon: Briefcase,
    gradient: 'from-slate-400 to-gray-500',
    borderColor: 'border-slate-200',
    traits: [
      'Strong will power',
      'Dominating in nature',
      'Taking unwanted responsibility',
      'Do not maintain discipline',
    ],
  },
  {
    numbers: [3, 9],
    missingNumbers: [1],
    name: 'Partial Intellectual Yog',
    icon: Brain,
    gradient: 'from-blue-400 to-indigo-500',
    borderColor: 'border-blue-200',
    traits: [
      'Helpful in nature and intelligent',
      'Multi talented, good advisor, hard worker',
      'Have respect in society',
    ],
  },
  {
    numbers: [5, 6],
    missingNumbers: [7],
    name: 'Partial Comfort Yog',
    icon: Gem,
    gradient: 'from-pink-400 to-rose-500',
    borderColor: 'border-pink-200',
    traits: [
      'Luxury and materialistic life',
      'Love travelling',
      'Create conflict in family by their own behavior',
    ],
  },
  {
    numbers: [2, 4],
    missingNumbers: [8],
    name: 'Partial Hard Working Yog',
    icon: Dumbbell,
    gradient: 'from-amber-400 to-orange-500',
    borderColor: 'border-amber-200',
    traits: [
      'High level mood swing',
      'Family and health issue',
      'Can involve in criminal activity',
    ],
  },
  {
    numbers: [3, 4],
    missingNumbers: [7],
    name: 'Partial Success Yog',
    icon: TrendingUp,
    gradient: 'from-cyan-400 to-sky-500',
    borderColor: 'border-cyan-200',
    traits: [
      'Struggle in life',
      'Highly intelligent and multi talented but can be destructive',
      'Need to drive life on its own way',
      'Family tension due to behavior but maintain good relationship outside home',
    ],
  },
  {
    numbers: [2, 9],
    missingNumbers: [7],
    name: 'Partial Courageous Yog',
    icon: Sword,
    gradient: 'from-red-400 to-rose-500',
    borderColor: 'border-red-200',
    traits: [
      'Health issue due to outside food or season changes',
      'Aggressive in nature',
      'Very helpful',
      'Family disturbance',
    ],
  },
  {
    numbers: [3, 2],
    missingNumbers: [6],
    name: 'Darsonic Mindset Yog',
    icon: Brain,
    gradient: 'from-blue-400 to-indigo-500',
    borderColor: 'border-blue-200',
    traits: [
      'Darsonic mindset',
      'Emotional nature',
      'Wins over enemies',
      'Makes relationships from the heart',
      'Ego problem',
    ],
  },
  {
    numbers: [1, 8],
    missingNumbers: [7],
    name: 'Health Instability Yog',
    icon: XCircle,
    gradient: 'from-slate-400 to-gray-500',
    borderColor: 'border-slate-200',
    traits: [
      'Health issue',
      'Financial instability',
      'Sometimes arguments with father',
      'Ups and down in career',
      'Should not do wrong with government bodies',
    ],
  },
  {
    numbers: [4, 9],
    missingNumbers: [5],
    name: 'Strong Willpower Yog',
    icon: Zap,
    gradient: 'from-amber-400 to-orange-500',
    borderColor: 'border-amber-200',
    traits: [
      'Strong willpower',
      'Dominating in nature',
      'Needs to maintain discipline',
      'Takes unwanted responsibility',
      'Sometimes speaks too much',
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

export default function PredictionPage() {
  const router = useRouter()
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [loading, setLoading] = useState(true)
  const [openKnowMore, setOpenKnowMore] = useState(false)
  const [activeInsight, setActiveInsight] = useState<InsightKey>('strength')

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
          <p className="text-slate-600 mb-4">No details found. Please start again.</p>
          <Button
            onClick={() => router.push('/')}
            className="w-full bg-violet-600 hover:bg-violet-700 rounded-xl"
          >
            Go Back
          </Button>
        </Card>
      </div>
    )
  }

  const strengthNumber =
    prediction.strength_number ?? getStrengthNumber(prediction.dob, prediction.driver_number)

  const luckyColorsArray = prediction.lucky_color
    ?.split(',')
    .map((c: string) => c.trim())
    .filter(Boolean)
  const unluckyColorsArray = prediction.unlucky_color
    ?.split(',')
    .map((c: string) => c.trim())
    .filter(Boolean)
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

  const insightContent = {
    strength: {
      title: 'Strength Number',
      value: strengthNumber,
      icon: Zap,
      prediction:
        prediction.strength_prediction || 'No strength number prediction available yet.',
      remedy:
        prediction.strength_remedy || 'No remedy available yet.',
    },
    gochor: {
      title: 'Gochor',
      value: prediction.gochor_number ?? null,
      icon: Orbit,
      prediction:
        prediction.gochor_prediction || 'No gochor prediction available yet.',
      remedy:
        prediction.gochor_remedy || 'No gochor remedy available yet.',
    },
    mahadasha: {
      title: 'Mahadasha',
      value: null,
      icon: MoonStar,
      prediction:
        prediction.mahadasha_prediction || 'No mahadasha prediction available yet.',
      remedy:
        prediction.mahadasha_remedy || 'No mahadasha remedy available yet.',
    },
    antardasha: {
      title: 'Antardasha',
      value: null,
      icon: Clock3,
      prediction:
        prediction.antardasha_prediction || 'No antardasha prediction available yet.',
      remedy:
        prediction.antardasha_remedy || 'No antardasha remedy available yet.',
    },
    dobChart: {
      title: 'Vedic DOB Chart',
      value: null,
      icon: Sparkles,
      prediction: '',
      remedy: '',
    },
    yog: {
      title: 'YOG Analysis',
      value: null,
      icon: Trophy,
      prediction: '',
      remedy: '',
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
      value: prediction.gochor_number ?? null,
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
    {
      key: 'dobChart' as InsightKey,
      title: 'Vedic DOB Chart',
      subtitle: 'DOB digit matrix',
      icon: Sparkles,
      value: null,
    },
    {
      key: 'yog' as InsightKey,
      title: 'YOG',
      subtitle: 'Vedic yog analysis',
      icon: Trophy,
      value: null,
    },
  ]

  return (
    <>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.12),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.10),_transparent_22%),linear-gradient(to_bottom_right,_#fcf7ff,_#f5f3ff,_#eef2ff)] p-4 md:p-8">
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/60 backdrop-blur-sm border border-violet-200/60 shadow-lg flex items-center justify-center">
                <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-violet-500" fill="currentColor" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-700 via-fuchsia-600 to-indigo-700 bg-clip-text text-transparent mb-3">
              Your Numerology Insights
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                <div className="rounded-3xl bg-white/90 px-5 md:px-6 py-6 md:py-7 shadow-sm text-center min-h-[170px] md:min-h-[190px] flex flex-col justify-center">
                  <p className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-[0.18em] mb-3">
                    Driver Number
                  </p>
                  <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-violet-600 mb-2">
                    {prediction.driver_number}
                  </div>
                  <p className="text-sm text-slate-500">Core identity</p>
                </div>

                <div className="rounded-3xl bg-white/90 px-5 md:px-6 py-6 md:py-7 shadow-sm text-center min-h-[170px] md:min-h-[190px] flex flex-col justify-center">
                  <p className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-[0.18em] mb-3">
                    Conductor Number
                  </p>
                  <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-fuchsia-600 mb-2">
                    {prediction.conductor_number}
                  </div>
                  <p className="text-sm text-slate-500">Outer expression</p>
                </div>

                <div className="rounded-3xl bg-white/90 px-5 md:px-6 py-6 md:py-7 shadow-sm text-center min-h-[170px] md:min-h-[190px] flex flex-col justify-center sm:col-span-2 md:col-span-1">
                  <p className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-[0.18em] mb-3">
                    Personal Year
                  </p>
                  <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-indigo-600 mb-2">
                    {prediction.personal_year}
                  </div>
                  <p className="text-sm text-slate-500">Yearly influence</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-violet-200/60 bg-white/70 backdrop-blur-md shadow-2xl rounded-3xl mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-violet-200/70 via-fuchsia-200/60 to-indigo-200/70 px-6 md:px-8 py-5 border-b border-violet-200/60">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Zap className="w-6 h-6 text-violet-600" />
                Numerology Characteristics
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <div className="space-y-4">
                {prediction.driver_number === prediction.conductor_number ? (
                  <div className="rounded-2xl border border-violet-100 bg-white/80 p-6 shadow-sm flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-center">
                    <span className="font-bold text-xl text-violet-700 min-w-[140px] flex gap-2 items-center">
                      <Star className="w-5 h-5" /> Number {prediction.driver_number}
                    </span>
                    <span className="text-slate-700 text-base leading-relaxed">
                      {numberCharacteristics[prediction.driver_number] || "Characteristics not found."}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="rounded-2xl border border-violet-100 bg-white/80 p-6 shadow-sm flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-center">
                      <span className="font-bold text-xl text-violet-700 min-w-[160px] flex gap-2 items-center">
                        <Star className="w-5 h-5" /> Driver ({prediction.driver_number})
                      </span>
                      <span className="text-slate-700 text-base leading-relaxed">
                        {numberCharacteristics[prediction.driver_number] || "Characteristics not found."}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-fuchsia-100 bg-white/80 p-6 shadow-sm flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-center">
                      <span className="font-bold text-xl text-fuchsia-600 min-w-[160px] flex gap-2 items-center">
                        <Sparkles className="w-5 h-5" /> Conductor ({prediction.conductor_number})
                      </span>
                      <span className="text-slate-700 text-base leading-relaxed">
                        {numberCharacteristics[prediction.conductor_number] || "Characteristics not found."}
                      </span>
                    </div>
                  </>
                )}
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
              {typeof prediction.analysis === 'object' && prediction.analysis !== null ? (
                <div className="space-y-4">
                  {prediction.analysis.positive && (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 shadow-sm flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <h4 className="font-bold text-slate-800">Positive Traits</h4>
                      </div>
                      <p className="text-slate-700 leading-relaxed pl-7 text-sm md:text-base">
                        {prediction.analysis.positive}
                      </p>
                    </div>
                  )}
                  {prediction.analysis.negative && (
                    <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-5 shadow-sm flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-rose-600" />
                        <h4 className="font-bold text-slate-800">Challenges & Weaknesses</h4>
                      </div>
                      <p className="text-slate-700 leading-relaxed pl-7 text-sm md:text-base">
                        {prediction.analysis.negative}
                      </p>
                    </div>
                  )}
                  {prediction.analysis.advice && (
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 shadow-sm flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        <h4 className="font-bold text-slate-800">Advice & Remedies</h4>
                      </div>
                      <p className="text-slate-700 leading-relaxed pl-7 text-sm md:text-base">
                        {prediction.analysis.advice}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-violet-100 bg-white/70 p-6 md:p-7 shadow-sm">
                  <p className="text-slate-700 leading-8 text-base md:text-lg whitespace-pre-line">
                    {String(prediction.analysis || "")}
                  </p>
                </div>
              )}

              <div className="mt-6">
                <Button
                  variant="link"
                  className="px-0 text-violet-700 text-base font-semibold hover:text-fuchsia-600"
                  onClick={() => router.push('/prediction/know-more?tab=strength')}
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
                Colour & Number Guidance
              </h2>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-violet-100 bg-white/80 p-8 flex flex-col items-center justify-center shadow-sm min-h-[280px]">
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                    Lucky Colour
                  </p>

                  <div className="w-full max-w-[280px] min-h-[160px] rounded-3xl bg-gradient-to-br from-violet-100 to-fuchsia-100 border border-violet-200 flex flex-wrap items-center justify-center gap-3 shadow-lg mb-4 px-6 py-6">
                    {luckyColorsArray?.map((color: string, index: number) => {
                      const colorValue = colorMap[color] || colorMap[color.toLowerCase()] || color.toLowerCase() || '#999999'

                      return (
                        <div key={index} className="flex flex-col items-center gap-1 max-w-[70px]">
                          <div
                            className="w-10 h-10 rounded-full border-2 border-white shadow"
                            style={{ backgroundColor: colorValue }}
                          />
                          <span className="text-[10px] text-slate-600 text-center leading-4 break-words">
                            {color}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <p className="text-slate-600 text-center">Your auspicious colours</p>
                </div>

                <div className="rounded-2xl border border-rose-100 bg-white/80 p-8 flex flex-col items-center justify-center shadow-sm min-h-[280px]">
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                    Unlucky Colour
                  </p>

                  <div className="w-full max-w-[280px] min-h-[160px] rounded-3xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200 flex flex-wrap items-center justify-center gap-3 shadow-lg mb-4 px-6 py-6">
                    {unluckyColorsArray?.map((color: string, index: number) => {
                      const colorValue = colorMap[color] || colorMap[color.toLowerCase()] || color.toLowerCase() || '#999999'

                      return (
                        <div key={index} className="flex flex-col items-center gap-1 max-w-[70px]">
                          <div
                            className="w-10 h-10 rounded-full border-2 border-white shadow"
                            style={{ backgroundColor: colorValue }}
                          />
                          <span className="text-[10px] text-slate-600 text-center leading-4 break-words">
                            {color}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <p className="text-slate-600 text-center">Colours to avoid when possible</p>
                </div>

                <div className="rounded-2xl border border-violet-100 bg-white/80 p-8 flex flex-col items-center justify-center shadow-sm min-h-[280px]">
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                    Lucky Number
                  </p>

                  <div className="w-full max-w-[260px] min-h-[140px] rounded-3xl bg-gradient-to-br from-violet-100 to-fuchsia-100 border border-violet-200 flex items-center justify-center shadow-lg mb-4 px-6 py-6">
                    <p className="text-3xl md:text-4xl font-bold text-violet-700 text-center leading-tight break-words whitespace-normal">
                      {prediction.lucky_number?.toString()}
                    </p>
                  </div>

                  <p className="text-slate-600 text-center">Your fortunate number vibration</p>
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
        <DialogContent className="w-[98vw] sm:w-[96vw] max-w-7xl max-h-[94vh] overflow-y-auto p-0 border border-violet-100/80 rounded-2xl md:rounded-[28px] bg-white/95 shadow-[0_32px_100px_-40px_rgba(76,29,149,0.55)] backdrop-blur-xl [&>button]:hidden">
          <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.26),_transparent_32%),linear-gradient(135deg,_#7c3aed,_#c026d3_55%,_#4f46e5)] px-5 md:px-8 py-6 md:py-7 rounded-t-2xl md:rounded-t-[28px]">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.12)_45%,transparent_100%)] pointer-events-none" />
            <button
              type="button"
              onClick={() => setOpenKnowMore(false)}
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/15 hover:bg-white/25 transition"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-white" />
            </button>

            <DialogHeader>
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/90">
                <Sparkles className="w-3.5 h-3.5 text-white/80" />
                Insight Studio
              </div>
              <DialogTitle className="mt-3 text-2xl md:text-3xl font-bold text-white">
                Know More
              </DialogTitle>
              <DialogDescription className="text-violet-100 text-sm md:text-base mt-2 max-w-3xl leading-7">
                Explore deeper astrology insights for Strength Number, Gochor, Mahadasha, Antardasha, and Vedic DOB Chart.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="bg-[linear-gradient(180deg,_#f8f7ff_0%,_#f6f3ff_52%,_#ffffff_100%)] p-4 md:p-6 lg:p-8">
            <div className="sticky top-0 z-10 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 pb-4 bg-[linear-gradient(180deg,_rgba(248,247,255,0.96)_0%,_rgba(248,247,255,0.92)_75%,_rgba(248,247,255,0)_100%)] backdrop-blur-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
                {insightCards.map((item) => {
                  const Icon = item.icon
                  const isActive = activeInsight === item.key

                  return (
                    <button
                      key={item.key}
                      onClick={() => setActiveInsight(item.key)}
                      className={`rounded-2xl border p-4 md:p-5 text-left transition-all duration-200 flex flex-col gap-2 min-h-[150px] md:min-h-[165px] w-full ${isActive
                        ? 'border-violet-300 bg-white shadow-[0_18px_40px_-24px_rgba(124,58,237,0.65)] ring-1 ring-violet-200'
                        : 'border-white/80 bg-white/80 hover:border-violet-200 hover:bg-white hover:shadow-[0_16px_30px_-24px_rgba(15,23,42,0.35)]'
                        }`}
                    >
                      <div className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center ${isActive ? 'bg-violet-100' : 'bg-slate-100'}`}>
                        <Icon className={`w-4 h-4 ${isActive ? 'text-violet-600' : 'text-slate-500'}`} />
                      </div>

                      <span className={`text-sm font-semibold leading-5 break-words ${isActive ? 'text-violet-700' : 'text-slate-700'}`}>
                        {item.title}
                      </span>

                      {item.value !== null && (
                        <div className={`text-3xl font-bold ${isActive ? 'text-violet-600' : 'text-slate-500'}`}>
                          {item.value}
                        </div>
                      )}


                      <p className="text-xs text-slate-500 leading-5 break-words">
                        {item.subtitle}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="bg-white/90 rounded-[28px] border border-white/80 shadow-[0_24px_60px_-34px_rgba(30,41,59,0.28)] overflow-hidden backdrop-blur-sm">
              <div className="px-5 md:px-7 py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-[linear-gradient(135deg,_rgba(245,243,255,0.96),_rgba(253,242,248,0.92))]">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center shadow-inner">
                    <CurrentInsightIcon className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg md:text-xl font-bold text-slate-800">{currentInsight.title}</h3>
                    {(activeInsight === 'strength' || activeInsight === 'gochor') && currentInsight.value !== null && (
                      <span className="text-xs font-bold text-violet-700 bg-violet-100 px-2.5 py-1 rounded-full border border-violet-200">
                        {currentInsight.value}
                      </span>
                    )}
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2 rounded-full border border-violet-100 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-500">
                  <span className="inline-block w-2 h-2 rounded-full bg-violet-400" />
                  Detailed view
                </div>
              </div>


              {activeInsight === 'yog' ? (
                <div className="p-5 md:p-7">
                  <div className="rounded-[30px] border border-violet-100 bg-[radial-gradient(circle_at_top,_rgba(217,70,239,0.08),_transparent_30%),linear-gradient(135deg,_rgba(245,243,255,0.94),_rgba(255,255,255,1))] p-5 md:p-7 shadow-inner">
                    <div className="mb-5 rounded-2xl border border-violet-100 bg-white/75 px-4 py-4">
                      <p className="text-sm text-slate-600">
                        Showing <span className="font-semibold text-violet-700">{activeYogCount}</span> active yog{activeYogCount !== 1 ? 's' : ''} for this DOB.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {yogResults.filter((yog) => yog.active).map((yog, index) => {
                        const YogIcon = yog.icon
                        return (
                          <div
                            key={index}
                            className={`rounded-2xl border ${yog.borderColor} bg-white p-5 shadow-lg transition-all duration-300`}
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
                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
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
                                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
                                  {trait}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : activeInsight === 'dobChart' ? (
                <div className="p-5 md:p-7">
                  <div className="rounded-[30px] border border-violet-100 bg-[radial-gradient(circle_at_top,_rgba(217,70,239,0.12),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.10),_transparent_28%),linear-gradient(135deg,_rgba(245,243,255,0.94),_rgba(255,255,255,1))] p-5 md:p-7 shadow-inner">
                    <div className="flex flex-col xl:flex-row gap-6 xl:gap-8 items-start">
                      <div className="w-full xl:flex-1">
                        <div className="max-w-[520px] mx-auto">
                          <div className="grid grid-cols-3 gap-4 sm:gap-5">
                            {dobChart.flatMap((row, rowIndex) =>
                              row.map((cell, colIndex) => (
                                <div
                                  key={`${rowIndex}-${colIndex}`}
                                  className="relative aspect-square overflow-hidden rounded-[24px] border border-violet-200/80 bg-white shadow-[0_18px_36px_-24px_rgba(124,58,237,0.45)] flex items-center justify-center"
                                >
                                  <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400" />
                                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(196,181,253,0.16),_transparent_36%)] pointer-events-none" />
                                  <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[0.12em] text-violet-700 leading-none">
                                    {cell || ''}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="w-full xl:max-w-[280px] grid grid-cols-2 xl:grid-cols-1 gap-3">
                        <div className="rounded-2xl border border-violet-100 bg-white/75 px-4 py-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Missing</p>
                          <p className="mt-2 text-2xl font-bold text-violet-700">{missingDobNumbers.length}</p>
                          <p className="mt-1 text-sm text-slate-500">Numbers absent in the chart</p>
                        </div>
                        <div className="rounded-2xl border border-rose-100 bg-white/75 px-4 py-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Repeated</p>
                          <p className="mt-2 text-2xl font-bold text-rose-600">{repeatedNegativeDobNumbers.length}</p>
                          <p className="mt-1 text-sm text-slate-500">Numbers repeated more than twice</p>
                        </div>
                        <div className="col-span-2 xl:col-span-1 rounded-2xl border border-slate-100 bg-white/75 px-4 py-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Chart Note</p>
                          <p className="mt-2 text-sm leading-7 text-slate-600">
                            Repeated digits intensify tendencies, while missing digits highlight areas that may need conscious effort and balance.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="rounded-[24px] border border-slate-200 overflow-hidden bg-white shadow-[0_18px_40px_-30px_rgba(15,23,42,0.32)] h-full">
                      <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 px-4 md:px-5 py-3 border-b border-slate-200">
                        <h4 className="text-sm md:text-base font-bold text-slate-800">
                          Missing Number Analysis
                        </h4>
                      </div>

                      {missingDobNumbers.length > 0 ? (
                        <div className="divide-y divide-slate-200 bg-white">
                          {missingDobNumbers.map((digit) => (
                            <div
                              key={digit}
                              className="px-4 md:px-5 py-3 md:py-4 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4"
                            >
                              <span className="shrink-0 inline-flex items-center justify-center min-w-10 h-10 rounded-full bg-violet-100 text-violet-700 font-bold">
                                {digit}
                              </span>
                              <p className="text-sm md:text-base text-slate-700 leading-7">
                                {missingNumberAnalysis[digit]}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white px-4 md:px-5 py-4">
                          <p className="text-sm md:text-base text-slate-700 leading-7">
                            No missing numbers found in this Vedic DOB chart.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="rounded-[24px] border border-slate-200 overflow-hidden bg-white shadow-[0_18px_40px_-30px_rgba(15,23,42,0.32)] h-full">
                      <div className="bg-gradient-to-r from-rose-50 to-orange-50 px-4 md:px-5 py-3 border-b border-slate-200">
                        <h4 className="text-sm md:text-base font-bold text-slate-800">
                          Negative Repeat Analysis
                        </h4>
                      </div>

                      {repeatedNegativeDobNumbers.length > 0 ? (
                        <div className="divide-y divide-slate-200 bg-white">
                          {repeatedNegativeDobNumbers.map((digit) => (
                            <div
                              key={digit}
                              className="px-4 md:px-5 py-3 md:py-4 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4"
                            >
                              <span className="shrink-0 inline-flex items-center justify-center min-w-10 h-10 rounded-full bg-rose-100 text-rose-700 font-bold">
                                {digit}
                              </span>
                              <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                  Repeated {dobNumberCounts[digit]} times
                                </p>
                                <p className="text-sm md:text-base text-slate-700 leading-7">
                                  {repeatedNumberNegativeAnalysis[digit]}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-white px-4 md:px-5 py-4">
                          <p className="text-sm md:text-base text-slate-700 leading-7">
                            No number is repeated more than two times in this Vedic DOB chart.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 md:p-7 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="rounded-[24px] border border-violet-100 bg-violet-50/50 p-5 md:p-6 flex flex-col min-h-[240px] shadow-[0_18px_36px_-30px_rgba(124,58,237,0.55)]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-5 rounded-full bg-violet-500" />
                      <h4 className="font-bold text-slate-800">Prediction</h4>
                    </div>
                    <p className="text-slate-600 text-sm leading-7 whitespace-pre-line break-words">
                      {currentInsight.prediction}
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-fuchsia-100 bg-fuchsia-50/50 p-5 md:p-6 flex flex-col min-h-[240px] shadow-[0_18px_36px_-30px_rgba(217,70,239,0.45)]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-5 rounded-full bg-fuchsia-500" />
                      <h4 className="font-bold text-slate-800">Remedy</h4>
                    </div>
                    <p className="text-slate-600 text-sm leading-7 whitespace-pre-line break-words">
                      {currentInsight.remedy}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-5">
              <Button
                onClick={() => setOpenKnowMore(false)}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-6 shadow-lg"
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
