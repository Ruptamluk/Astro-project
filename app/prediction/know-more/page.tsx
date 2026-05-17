'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  // Live-calculated dasha fields
  current_mahadasha_number?: number
  current_mahadasha_planet?: string
  current_antardasha_number?: number
  current_antardasha_planet?: string
  mahadasha_start?: string
  mahadasha_end?: string
  antardasha_start?: string
  antardasha_end?: string
  dasha_analysis?: string
  driver_conductor_remedy?: string
}

type InsightKey = 'strength' | 'gochor' | 'mahadasha' | 'antardasha' | 'dobChart' | 'yog' | 'dashas' | 'remedy'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

const DOB_CHART_LAYOUT = [
  ['3', '1', '9'],
  ['6', '7', '5'],
  ['2', '8', '4'],
]

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
    numbers: [3, 8],
    missingNumbers: [6, 2],
    name: 'Consultancy Yog',
    icon: Brain,
    gradient: 'from-blue-400 to-indigo-500',
    borderColor: 'border-blue-200',
    traits: [
      'Knowledgeable person, good for consultancy',
      'Highly spiritual person',
      'Become good judge',
      'Success come after hard work'
    ],
  },
  {
    numbers: [9, 8],
    missingNumbers: [5, 4],
    name: 'High Energy Yog',
    icon: Zap,
    gradient: 'from-amber-400 to-orange-500',
    borderColor: 'border-amber-200',
    traits: [
      'High energy, anger issue',
      'Hard working person, they can achieve target',
      'Argumentative but logical thinker',
      'They do not trust other, workaholic',
      'Others can take their advantages, progress in life'
    ],
  },
  {
    numbers: [1, 4],
    missingNumbers: [9, 5],
    name: 'Egoistic Yog',
    icon: XCircle,
    gradient: 'from-slate-400 to-gray-500',
    borderColor: 'border-slate-200',
    traits: [
      'Family disturbance',
      'Extremely egoistic',
      'Lost opportunities, depth in life',
      'Create enemy by their own words'
    ],
  },
  {
    numbers: [1, 2],
    missingNumbers: [3, 6],
    name: 'Powerful Combination Yog',
    icon: Trophy,
    gradient: 'from-fuchsia-400 to-purple-500',
    borderColor: 'border-fuchsia-200',
    traits: [
      'Very powerful combination, universal support',
      'They are friendly in nature',
      'Name frame in society',
      'Sensitive person'
    ],
  },
  {
    numbers: [5, 2],
    missingNumbers: [8, 4],
    name: 'Intuition Yog',
    icon: Sparkles,
    gradient: 'from-emerald-400 to-teal-500',
    borderColor: 'border-emerald-200',
    traits: [
      'High intuition power, sharp memory',
      'Sensitive and emotional',
      'Depend on others',
      'Do not take other financial responsibility'
    ],
  },
  {
    numbers: [3, 5],
    missingNumbers: [1, 9],
    name: 'Financial Yog',
    icon: Briefcase,
    gradient: 'from-emerald-400 to-teal-500',
    borderColor: 'border-emerald-200',
    traits: [
      'Sharp memory, good financial condition',
      'Good for business',
      'Good reputation in society',
      'Sometime face cashflow problem'
    ],
  },
  {
    numbers: [9, 6],
    missingNumbers: [3, 1],
    name: 'Attractive Personality Yog',
    icon: Gem,
    gradient: 'from-pink-400 to-rose-500',
    borderColor: 'border-pink-200',
    traits: [
      'Multiple relationship',
      'Delaying in life',
      'Help from opposite gender',
      'Highly attractive personality'
    ],
  },
  {
    numbers: [6, 4],
    missingNumbers: [2, 8],
    name: 'Luxury Yog',
    icon: Gem,
    gradient: 'from-pink-400 to-rose-500',
    borderColor: 'border-pink-200',
    traits: [
      'Luxury in life, good financial condition',
      'Self centric person',
      'Do not give values to other feelings',
      'Family disturbance'
    ],
  },
  {
    numbers: [1, 7, 5],
    missingNumbers: [9],
    name: 'Astrologer Yog',
    icon: MoonStar,
    gradient: 'from-purple-400 to-violet-500',
    borderColor: 'border-purple-200',
    traits: [
      'Good astrologer, good teacher',
      'Relationship issues, argumentative nature',
      'Addiction',
      'Do not listen to other'
    ],
  },
  {
    numbers: [1, 7, 6],
    missingNumbers: [3],
    name: 'Fun Loving Yog',
    icon: Star,
    gradient: 'from-pink-400 to-rose-500',
    borderColor: 'border-pink-200',
    traits: [
      'Fun and loving person',
      'Easily attract to all good looking things',
      'Money management is not good',
      'Multiple relationship, unstable career'
    ],
  },
  {
    numbers: [5, 7, 8],
    missingNumbers: [4],
    name: 'Ego Issue Yog',
    icon: XCircle,
    gradient: 'from-slate-400 to-gray-500',
    borderColor: 'border-slate-200',
    traits: [
      'Miss golden opportunity in life',
      'Too much ego issue',
      'Create family disturbance',
      'Communication gap with siblings'
    ],
  },
  {
    numbers: [1, 9, 5],
    missingNumbers: [7],
    name: 'Dominating Nature Yog',
    icon: Dumbbell,
    gradient: 'from-amber-400 to-orange-500',
    borderColor: 'border-amber-200',
    traits: [
      'Sharp memory, good will power',
      'Too much straight furrowed',
      'Aggressive and dominating in nature',
      'Do not serious in their professional life'
    ],
  },
  {
    numbers: [9, 1, 7],
    missingNumbers: [5],
    name: 'Strong Will Power Yog',
    icon: Zap,
    gradient: 'from-red-400 to-rose-500',
    borderColor: 'border-red-200',
    traits: [
      'Very strong will power',
      'Highly dominating and aggressive in nature',
      'Good career success',
      'Risk taking capacity high, foreign settlement'
    ],
  },
  {
    numbers: [3, 1, 7],
    missingNumbers: [6],
    name: 'High Reputation Yog',
    icon: Trophy,
    gradient: 'from-cyan-400 to-sky-500',
    borderColor: 'border-cyan-200',
    traits: [
      'High reputation in society',
      'Indicate government job and foreign travel',
      'Higher education',
      'Personal relationship issue'
    ],
  },
  {
    numbers: [1, 3, 6],
    missingNumbers: [7],
    name: 'Intellectual Success Yog',
    icon: Brain,
    gradient: 'from-blue-400 to-indigo-500',
    borderColor: 'border-blue-200',
    traits: [
      'Highly intellectual and knowledgeable person',
      'Good teaching quality',
      'Good convincing power',
      'High level of success and growth',
      'Their luck support after marriage'
    ],
  },
  {
    numbers: [7, 5, 4],
    missingNumbers: [8],
    name: 'Struggle Yog',
    icon: Dumbbell,
    gradient: 'from-slate-400 to-gray-500',
    borderColor: 'border-slate-200',
    traits: [
      'High level of struggle in life',
      'Mentally disturbance and arrogance in nature'
    ],
  },
  {
    numbers: [6, 7, 2],
    missingNumbers: [8],
    name: 'Comfort Life Yog',
    icon: Gem,
    gradient: 'from-pink-400 to-rose-500',
    borderColor: 'border-pink-200',
    traits: [
      'Comfort life',
      'Do not want to go outside for secure job',
      'Do not like changes in life',
      'Family support',
      'Health issue, good intuition power'
    ],
  },
  {
    numbers: [5, 4, 8],
    missingNumbers: [7],
    name: 'Confusion State Yog',
    icon: Orbit,
    gradient: 'from-emerald-400 to-teal-500',
    borderColor: 'border-emerald-200',
    traits: [
      'Life is going to a confusion state',
      'Family issue',
      'Ups and down in career',
      'They are kind hearted person',
      'Court case may occur'
    ],
  },
  {
    numbers: [6, 2, 8],
    missingNumbers: [7],
    name: 'Delay Yog',
    icon: Clock3,
    gradient: 'from-amber-400 to-orange-500',
    borderColor: 'border-amber-200',
    traits: [
      'Delay in luxury',
      'Late marriage indication',
      'Hurdle in education',
      'Bad relationship with spouse'
    ],
  },
  {
    numbers: [8, 7],
    missingNumbers: [2],
    name: 'Law Skill Yog',
    icon: Briefcase,
    gradient: 'from-cyan-400 to-sky-500',
    borderColor: 'border-cyan-200',
    traits: [
      'High level of luxury but need to work hard and value time',
      'Go with fixed routine',
      'Sharp memory, good for law skill',
      'Do critical work',
      'Relationship issue with opposite gender'
    ],
  },
  {
    numbers: [2, 8, 7],
    missingNumbers: [6],
    name: 'Health Issue Yog',
    icon: Dumbbell,
    gradient: 'from-red-400 to-rose-500',
    borderColor: 'border-red-200',
    traits: [
      'Health issue',
      'They need proper guidance and support in profession and personal life',
      'Do not believe other and rude in nature'
    ],
  },
  {
    numbers: [7, 8, 4],
    missingNumbers: [5],
    name: 'Hidden Talent Yog',
    icon: Dumbbell,
    gradient: 'from-slate-400 to-gray-500',
    borderColor: 'border-slate-200',
    traits: [
      'Too much struggle in life',
      'Ego and over confidence create issue',
      'They have hidden talent',
      'Success come through hard work'
    ],
  },
  {
    numbers: [3, 6, 7],
    missingNumbers: [1],
    name: 'Research Minded Yog',
    icon: Brain,
    gradient: 'from-purple-400 to-violet-500',
    borderColor: 'border-purple-200',
    traits: [
      'Always work on to improve knowledge',
      'Ego problem',
      'Want to stay alone',
      'Research minded, do not run behind money'
    ],
  },
  {
    numbers: [9, 5, 7],
    missingNumbers: [1],
    name: 'Courageous Communication Yog',
    icon: Zap,
    gradient: 'from-amber-400 to-orange-500',
    borderColor: 'border-amber-200',
    traits: [
      'Courageous and good communication skill',
      'Highly argumentative',
      'Family issue, restless mind',
      'High level of energy',
      'Do not take spicy food'
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

function isInsightKey(value: string | null): value is InsightKey {
  return value === 'strength' ||
    value === 'gochor' ||
    value === 'mahadasha' ||
    value === 'antardasha' ||
    value === 'dobChart' ||
    value === 'yog' ||
    value === 'dashas' ||
    value === 'remedy'
}

// ── Dasha helpers ──────────────────────────────────────────────────────────

const PLANET_DESCRIPTIONS: Record<number, string> = {
  1: 'Sun brings authority, vitality, career growth, and government-related opportunities during this period.',
  2: 'Moon heightens emotions, intuition, mental sensitivity, and matters related to home and family.',
  3: 'Jupiter brings wisdom, expansion, spiritual growth, higher education, and abundance.',
  4: 'Rahu amplifies desires, foreign influences, technology gains, and karmic lessons to learn.',
  5: 'Mercury sharpens intellect, communication skills, business acumen, and analytical ability.',
  6: 'Venus brings love, luxury, comfort, artistic pursuits, and harmony in relationships.',
  7: 'Ketu promotes spiritual detachment, inner wisdom, mystical insights, and past-life themes.',
  8: 'Saturn enforces discipline, karmic accountability, hard work, and long-term rewards.',
  9: 'Mars energises action, courage, ambition, physical strength, and competitive spirit.',
}

function calculateProgress(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime()
  const end   = new Date(endDate).getTime()
  const now   = Date.now()
  if (end <= start) return 0
  return Math.min(Math.max(((now - start) / (end - start)) * 100, 0), 100)
}

interface GayatriMantra {
  label: string
  sanskrit: string
  transliteration: string
  benefits: string[]
}

const GAYATRI_MANTRAS: Record<string, GayatriMantra> = {
  Sun: {
    label: 'Surya (Sun) Gayatri Mantra',
    sanskrit: 'ॐ आदित्याय विद्महे\nदिवाकराय धीमहि\nतन्नः सूर्यः प्रचोदयात्॥',
    transliteration: 'Om Adityaya Vidmahe\nDivakaraya Dhimahi\nTannah Suryah Prachodayat',
    benefits: [
      'Boosts confidence and leadership',
      'Improves health, vitality, and fame',
      'Enhances father relationship and authority',
      'Removes negativity and laziness',
    ],
  },
  Moon: {
    label: 'Chandra (Moon) Gayatri Mantra',
    sanskrit: 'ॐ क्षीरपुत्राय विद्महे\nअमृततत्त्वाय धीमहि\nतन्नः चन्द्रः प्रचोदयात्॥',
    transliteration: 'Om Kshirputraya Vidmahe\nAmrit Tatvaya Dhimahi\nTannah Chandrah Prachodayat',
    benefits: [
      'Gives mental peace and emotional balance',
      'Improves sleep and intuition',
      'Strengthens motherly support and creativity',
      'Reduces anxiety and overthinking',
    ],
  },
  Mars: {
    label: 'Mangal (Mars) Gayatri Mantra',
    sanskrit: 'ॐ अंगारकाय विद्महे\nशक्तिहस्ताय धीमहि\nतन्नो भौमः प्रचोदयात्॥',
    transliteration: 'Om Angarakaya Vidmahe\nShakti Hastaya Dhimahi\nTanno Bhaumah Prachodayat',
    benefits: [
      'Increases courage and determination',
      'Helps in property and land matters',
      'Reduces anger and conflicts',
      'Supports success in competition',
    ],
  },
  Mercury: {
    label: 'Budh (Mercury) Gayatri Mantra',
    sanskrit: 'ॐ गजध्वजाय विद्महे\nसुखहस्ताय धीमहि\nतन्नो बुधः प्रचोदयात्॥',
    transliteration: 'Om Gajadhwajaya Vidmahe\nSukh Hastaya Dhimahi\nTanno Budhah Prachodayat',
    benefits: [
      'Improves communication and intelligence',
      'Enhances business and analytical skills',
      'Helps students in studies and memory',
      'Strengthens decision-making ability',
    ],
  },
  Jupiter: {
    label: 'Guru (Jupiter) Gayatri Mantra',
    sanskrit: 'ॐ बृहस्पतये विद्महे\nदिव्यदेहाय धीमहि\nतन्नो गुरुः प्रचोदयात्॥',
    transliteration: 'Om Brihaspataye Vidmahe\nDivya Dehaya Dhimahi\nTanno Guruh Prachodayat',
    benefits: [
      'Brings wisdom and spiritual growth',
      'Supports marriage and children blessings',
      'Increases prosperity and good fortune',
      'Helps attract mentors and guidance',
    ],
  },
  Venus: {
    label: 'Shukra (Venus) Gayatri Mantra',
    sanskrit: 'ॐ शुक्राय विद्महे\nदैत्याचार्याय धीमहि\nतन्नः शुक्रः प्रचोदयात्॥',
    transliteration: 'Om Shukraya Vidmahe\nDaityacharyaya Dhimahi\nTannah Shukrah Prachodayat',
    benefits: [
      'Improves love and relationships',
      'Attracts luxury, beauty, and comforts',
      'Enhances creativity and artistic talents',
      'Helps financial stability',
    ],
  },
  Saturn: {
    label: 'Shani (Saturn) Gayatri Mantra',
    sanskrit: 'ॐ सूर्यपुत्राय विद्महे\nमृत्युरूपाय धीमहि\nतन्नः शनिः प्रचोदयात्॥',
    transliteration: 'Om Suryaputraya Vidmahe\nMrityu Rupaya Dhimahi\nTannah Shanih Prachodayat',
    benefits: [
      'Removes obstacles and karmic suffering',
      'Builds patience and discipline',
      'Protects from negativity and delays',
      'Supports long-term success',
    ],
  },
  Rahu: {
    label: 'Rahu Gayatri Mantra',
    sanskrit: 'ॐ नागमुखाय विद्महे\nसिंहिकानन्दनाय धीमहि\nतन्नो राहुः प्रचोदयात्॥',
    transliteration: 'Om Nagamukhaya Vidmahe\nSimhika Nandanaya Dhimahi\nTanno Rahuh Prachodayat',
    benefits: [
      'Helps overcome confusion and illusion',
      'Protects from sudden losses and fears',
      'Supports foreign opportunities and technology',
      'Enhances strategic thinking',
    ],
  },
  Ketu: {
    label: 'Ketu Gayatri Mantra',
    sanskrit: 'ॐ धूम्रकेतवे विद्महे\nतीक्ष्णदंष्ट्राय धीमहि\nतन्नः केतुः प्रचोदयात्॥',
    transliteration: 'Om Dhumraketave Vidmahe\nTikshna Damshtraya Dhimahi\nTannah Ketuh Prachodayat',
    benefits: [
      'Increases spirituality and intuition',
      'Helps detach from negativity and ego',
      'Protects from hidden enemies',
      'Supports meditation and inner awakening',
    ],
  },
}

interface PlanetYantra {
  label: string
  grid: number[][]
  benefits: string[]
  howToUse: string[]
}

const PLANET_YANTRAS: Record<number, PlanetYantra> = {
  1: {
    label: 'Surya (Sun) Yantra',
    grid: [[6,1,8],[7,5,3],[2,9,4]],
    benefits: ['Boosts confidence and authority','Improves leadership and recognition','Enhances vitality and success','Strengthens father-related karma'],
    howToUse: ['Worship on Sunday morning','Draw/write on copper sheet or red paper','Chant Surya mantra 108 times','Keep in office or east direction'],
  },
  2: {
    label: 'Chandra (Moon) Yantra',
    grid: [[7,2,9],[8,6,4],[3,10,5]],
    benefits: ['Emotional stability','Peaceful mind and better sleep','Improves intuition and creativity','Enhances motherly blessings'],
    howToUse: ['Use on Monday evening/night','Draw on silver or white paper','Place near bedside or meditation area'],
  },
  3: {
    label: 'Guru (Jupiter) Yantra',
    grid: [[10,5,12],[11,9,7],[6,13,8]],
    benefits: ['Wisdom and spiritual growth','Marriage and child blessings','Wealth and prosperity','Guidance and higher learning'],
    howToUse: ['Thursday morning','Use yellow paper or भोजपत्र','Place in temple or study area'],
  },
  4: {
    label: 'Rahu Yantra',
    grid: [[13,8,15],[14,12,10],[9,16,11]],
    benefits: ['Removes confusion and fear','Foreign opportunities','Success in technology/media','Protection from hidden enemies'],
    howToUse: ['Saturday or Wednesday','Worship during Rahu Kaal carefully','Keep hidden in sacred place'],
  },
  5: {
    label: 'Budh (Mercury) Yantra',
    grid: [[9,4,11],[10,8,6],[5,12,7]],
    benefits: ['Sharpens intelligence','Improves communication','Business growth','Better memory and learning'],
    howToUse: ['Wednesday morning','Write with green ink','Keep near study or work desk'],
  },
  6: {
    label: 'Shukra (Venus) Yantra',
    grid: [[11,6,13],[12,10,8],[7,14,9]],
    benefits: ['Love and relationship harmony','Luxury and beauty','Financial comfort','Artistic and creative success'],
    howToUse: ['Friday morning','Use white or pink paper','Keep in bedroom or wallet'],
  },
  7: {
    label: 'Ketu Yantra',
    grid: [[14,9,16],[15,13,11],[10,17,12]],
    benefits: ['Spiritual awakening','Strong intuition','Protection from negative energies','Helps meditation and detachment'],
    howToUse: ['Tuesday or Saturday','Use saffron or sandalwood ink','Place in meditation room'],
  },
  8: {
    label: 'Shani (Saturn) Yantra',
    grid: [[12,7,14],[13,11,9],[8,15,10]],
    benefits: ['Removes obstacles and delays','Protection from negativity','Discipline and stability','Career growth after struggles'],
    howToUse: ['Saturday evening','Use black ink on iron/copper','Keep near entrance or workplace'],
  },
  9: {
    label: 'Mangal (Mars) Yantra',
    grid: [[12,7,14],[13,11,9],[8,15,10]],
    benefits: ['Courage and strength','Protection from enemies','Property and land success','Controls anger and aggression'],
    howToUse: ['Worship on Tuesday','Use red ink or copper plate','Keep in south direction'],
  },
}

export default function KnowMorePage() {
  const router = useRouter()
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeInsight, setActiveInsight] = useState<InsightKey>('strength')
  const [mantraOpen, setMantraOpen] = useState<string | null>(null)
  const [yantraOpen, setYantraOpen] = useState(false)

  useEffect(() => {
    const nextTab = new URLSearchParams(window.location.search).get('tab')
    if (isInsightKey(nextTab)) {
      setActiveInsight(nextTab)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadPrediction = async () => {
      try {
        const userId = localStorage.getItem('userId')

        if (!userId) {
          router.push('/')
          return
        }

        try {
          const userRes = await fetch(`${API_BASE_URL}/api/auth/user/${userId}`)
          if (userRes.ok) {
            const userData = await userRes.json()
            if (!userData.know_more_access) {
              router.push('/prediction')
              return
            }
          } else {
            router.push('/prediction')
            return
          }
        } catch {
          router.push('/prediction')
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
                  {item.key === 'dashas' ? (
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
                    <div className="space-y-6">
                      {/* Driver-Conductor Remedy */}
                      <Card className="rounded-[28px] border-emerald-100 overflow-hidden shadow-sm bg-white/90">
                        <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-4 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-emerald-600" />
                          <h2 className="text-lg font-bold text-slate-800">Driver-Conductor Remedy</h2>
                        </div>
                        <div className="p-6 space-y-4">
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
                              Driver {prediction.driver_number}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 border border-teal-100">
                              Conductor {prediction.conductor_number}
                            </span>
                          </div>
                          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                            <p className="text-base leading-8 text-emerald-900">
                              {prediction.driver_conductor_remedy || 'No remedy available for this combination.'}
                            </p>
                          </div>
                        </div>
                      </Card>

                      {/* Mahadasha Remedy */}
                      <Card className="rounded-[28px] border-violet-100 overflow-hidden shadow-sm bg-white/90">
                        <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50 px-5 py-4 flex items-center gap-2">
                          <MoonStar className="w-5 h-5 text-violet-600" />
                          <h2 className="text-lg font-bold text-slate-800">Mahadasha Remedy</h2>
                        </div>
                        <div className="p-6 space-y-4">
                          {prediction.current_mahadasha_planet && (
                            <div className="flex flex-wrap gap-2">
                              <span className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 border border-violet-100">
                                Mahadasha {prediction.current_mahadasha_number} | {prediction.current_mahadasha_planet}
                              </span>
                            </div>
                          )}
                          <div className="rounded-xl bg-violet-50 border border-violet-100 p-4">
                            {(() => {
                              const planet = prediction.current_mahadasha_planet
                              const mantra = planet ? GAYATRI_MANTRAS[planet] : undefined
                              return mantra ? (
                                <button
                                  onClick={() => setMantraOpen(planet)}
                                  className="text-violet-700 font-semibold underline underline-offset-4 hover:text-violet-900 transition-colors text-base text-left"
                                >
                                  {mantra.label}
                                </button>
                              ) : (
                                <p className="text-base leading-8 text-violet-900">
                                  {prediction.mahadasha_remedy || 'No mahadasha remedy available yet.'}
                                </p>
                              )
                            })()}
                          </div>
                        </div>
                      </Card>

                      {/* Yantra */}
                      <Card className="rounded-[28px] border-fuchsia-100 overflow-hidden shadow-sm bg-white/90">
                        <div className="border-b border-fuchsia-100 bg-gradient-to-r from-fuchsia-50 to-pink-50 px-5 py-4 flex items-center gap-2">
                          <Star className="w-5 h-5 text-fuchsia-600" />
                          <h2 className="text-lg font-bold text-slate-800">Yantra</h2>
                        </div>
                        <div className="p-6 space-y-4">
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-semibold text-fuchsia-700 border border-fuchsia-100">
                              Driver {prediction.driver_number}
                            </span>
                          </div>
                          <div className="rounded-xl bg-fuchsia-50 border border-fuchsia-100 p-4">
                            {(() => {
                              const yantra = PLANET_YANTRAS[prediction.driver_number]
                              return yantra ? (
                                <button
                                  onClick={() => setYantraOpen(true)}
                                  className="text-fuchsia-700 font-semibold underline underline-offset-4 hover:text-fuchsia-900 transition-colors text-base text-left"
                                >
                                  {yantra.label}
                                </button>
                              ) : (
                                <p className="text-base leading-8 text-fuchsia-900">No yantra available.</p>
                              )
                            })()}
                          </div>
                        </div>
                      </Card>
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
