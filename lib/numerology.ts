// Shared numerology data, types, and helpers.
// Single source of truth for the report generator (ReportStudio) and the
// Know More on-screen tabs. Extracted from app/prediction/know-more/page.tsx.
import {
  Star, Brain, Gem, Dumbbell, GraduationCap, Eye, Briefcase, TrendingUp,
  Sword, Zap, XCircle, Trophy, Sparkles, MoonStar, Orbit, Clock3,
} from 'lucide-react'

export interface Prediction {
  driver_number: number
  conductor_number: number
  personal_year: number
  analysis: any
  lucky_color: string | string[]
  unlucky_color?: string | string[]
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
  name?: string
  phone?: string
}

export const DOB_CHART_LAYOUT = [
  ['3', '1', '9'],
  ['6', '7', '5'],
  ['2', '8', '4'],
]

export const missingNumberAnalysis: Record<number, string> = {
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

export interface CrystalRemedy {
  name: string
  benefits: string[]
  affirmation: string
}

export const CRYSTAL_REMEDIES: Record<number, CrystalRemedy> = {
  1: { name: 'Sunstone Crystal / Bracelet', benefits: ['Increases confidence level', 'Improves self-esteem', 'Develops leadership quality'], affirmation: 'I am confident and successful.' },
  2: { name: 'Moonstone Crystal and Clear Quartz', benefits: ['Emotional balance', 'Good relationships'], affirmation: 'I am calm, loved, and emotionally balanced.' },
  3: { name: 'Yellow Citrine Crystals', benefits: ['Wisdom', 'Financial growth', 'Spirituality'], affirmation: 'Wisdom and abundance flow to me.' },
  4: { name: "Smoky Quartz, Tiger's Eye, Labradorite, and Mach Mani", benefits: ['Protection', 'Stability', 'Focus'], affirmation: 'I am protected and stable.' },
  5: { name: 'Green Aventurine and Peridot', benefits: ['Good communication', 'Good memory', 'Networking'], affirmation: 'I communicate with clarity and confidence.' },
  6: { name: 'Rose Quartz and Prehnite', benefits: ['Attraction', 'Harmony', 'Luxury'], affirmation: 'Love and harmony surround me.' },
  7: { name: "Cat's Eye, Lepidolite, and Amethyst", benefits: ['Spirituality', 'Intuition power'], affirmation: 'My intuition guides me wisely.' },
  8: { name: 'Amethyst, Mach Mani, and Black Tourmaline', benefits: ['Discipline', 'Protection', 'Grounding', 'Patience'], affirmation: 'I am disciplined, grounded, and prosperous.' },
  9: { name: 'Bloodstone Crystal and Red Jasper Crystal', benefits: ['Harmony', 'Wisdom', 'Knowledge and spiritual growth'], affirmation: 'I act with courage and strength.' },
}

export const repeatedNumberNegativeAnalysis: Record<number, string> = {
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

export const numberCharacteristics: Record<number, string> = {
  1: 'Leadership, authority, confidence, independence, Name and Fame',
  2: 'Emotional, intuitive, artistic, nurturing.',
  3: 'Wisdom, expansion, knowledge, spirituality.',
  4: 'Innovative, unconventional, technical genius.',
  5: 'Communication, intelligence, adaptability.',
  6: 'Love, luxury, beauty, harmony.',
  7: 'Spiritual, research-oriented, detached wisdom.',
  8: 'Discipline, justice, hard work.',
  9: 'Courage, action, energy, leadership.',
}

// Per-driver-number deep-dive: ruling planet + strengths, weaknesses,
// suitable careers and advice. Keyed purely off the driver number (1-9).
export interface DriverNumberProfile {
  planet: string
  strengths: string[]
  weaknesses: string[]
  careers: string[]
  advice: string[]
}

export const driverNumberProfiles: Record<number, DriverNumberProfile> = {
  1: {
    planet: 'Sun',
    strengths: [
      'Natural leader — likes to lead, manages teams well and has strong decision-making ability',
      'Strong willpower and determination — does not give up easily',
      'Independent personality — prefers making own decisions and working independently',
      'High ambition — thinks big and aims for higher positions and recognition',
      'Love for quality and luxury — drawn to branded, high-quality living (Sun = royalty & status)',
    ],
    weaknesses: [
      'Ego may increase when Sun energy is imbalanced',
      'Can become stubborn',
      'May ignore others’ opinions',
      'Can behave in a dominating or authoritarian way',
    ],
    careers: [
      'Business',
      'Government positions',
      'Politics',
      'Administration',
      'Leadership roles',
    ],
    advice: [
      'Control ego',
      'Listen to others’ opinions',
      'Work well with teams',
      'Develop patience',
    ],
  },
  2: {
    planet: 'Moon',
    strengths: [
      'Emotional and sensitive — a heart-centered thinker who feels others’ pain and happiness',
      'Caring nature — likes helping others and maintaining harmony (a caregiver personality)',
      'Creative mind — strong imagination and artistic skills',
      'Relationship-oriented — feels mentally peaceful when relationships are stable',
    ],
    weaknesses: [
      'Mood swings when Moon energy is unstable',
      'Overthinking',
      'Emotional dependency',
      'Anxiety — can get hurt easily by small things',
    ],
    careers: [
      'Writing',
      'Art and design',
      'Counseling',
      'Psychology',
      'Hospitality',
      'Social work',
    ],
    advice: [
      'Maintain emotional balance',
      'Practice meditation',
      'Avoid overthinking',
      'Build self-confidence',
    ],
  },
  3: {
    planet: 'Jupiter',
    strengths: [
      'Knowledge seeker — loves learning and expanding knowledge',
      'Teacher energy — natural guiding and teaching qualities',
      'Strong communication — a good speaker and advisor whose words carry logic and wisdom',
      'Spiritual thinking — inclined toward ethics, religion and philosophy',
    ],
    weaknesses: [
      'Overconfidence when Jupiter energy is imbalanced',
      'Gives too many lectures / tries to advise everyone',
      'May appear preachy or overly serious',
    ],
    careers: [
      'Teaching',
      'Professorship',
      'Mentoring',
      'Law',
      'Motivational speaking',
      'Spiritual leadership',
    ],
    advice: [
      'Continue learning throughout life',
      'Avoid arrogance',
      'Use knowledge positively',
      'Share wisdom with humility',
    ],
  },
  4: {
    planet: 'Rahu',
    strengths: [
      'Strong manifestation power — works intensely to achieve what they desire',
      'Strategic thinking — plans several steps ahead',
      'Highly analytical mind — good at mathematics, logic and problem solving',
      'Strong finisher — persists until a task is complete',
      'Organizational ability — a capable organizer, manager and planner',
    ],
    weaknesses: [
      'Ego, overconfidence and stubbornness can create conflicts and obstacles',
      'Relationship challenges — misunderstandings, emotional distance, unexpected separations',
      'Financial journey can be unpredictable (though rarely a long-term shortage)',
      'Questions rules and systems, preferring their own path',
    ],
    careers: [
      'Organizing and management',
      'Planning and systems',
      'Strategy and analysis',
      'Unconventional / self-made ventures',
    ],
    advice: [
      'Respect time and opportunities (the biggest lesson)',
      'Control ego',
      'Maintain discipline',
      'Use analytical power positively',
      'Stay balanced in relationships',
    ],
  },
  5: {
    planet: 'Mercury (Budh)',
    strengths: [
      'Quick decision-making ability',
      'Strong communication and persuasion skills',
      'Highly adaptable',
      'Good networking ability',
      'Intelligent and creative thinking',
    ],
    weaknesses: [
      'Lack of discipline',
      'Can be careless or lazy',
      'Easily distracted',
      'Sometimes hides true thoughts — may struggle with consistency',
    ],
    careers: [
      'Marketing',
      'Sales',
      'Media and communication',
      'Business',
      'Public relations',
      'Travel-related careers',
    ],
    advice: [
      'Maintain discipline in life',
      'Focus on completing tasks',
      'Avoid laziness and distractions',
      'Use communication positively',
    ],
  },
  6: {
    planet: 'Venus (Shukra)',
    strengths: [
      'Strong relationship-building skills',
      'Natural charm and attraction',
      'Artistic and creative talent',
      'Good social influence',
      'Connects with people easily',
    ],
    weaknesses: [
      'Ego due to luxury or status',
      'Risk of addictions',
      'Overindulgence in comfort',
      'Emotional dependency',
    ],
    careers: [
      'Fashion and beauty industry',
      'Entertainment',
      'Hospitality',
      'Luxury business',
      'Arts and design',
    ],
    advice: [
      'Avoid addictions and excess pleasures',
      'Stay humble and balanced',
      'Maintain respectful relationships',
      'Use charm and influence positively',
    ],
  },
  7: {
    planet: 'Ketu',
    strengths: [
      'Strong intuition',
      'Ability to understand others’ emotions',
      'Spiritual awareness',
      'Analytical thinking',
      'Deep observation skills',
    ],
    weaknesses: [
      'Trusts people too easily',
      'Can be emotionally vulnerable',
      'Others may take advantage of their kindness',
      'Difficulty focusing on their own needs',
    ],
    careers: [
      'Research',
      'Spiritual or healing fields',
      'Psychology',
      'Teaching',
      'Writing or analysis',
    ],
    advice: [
      'Avoid blind trust in people',
      'Focus on personal growth',
      'Maintain emotional boundaries',
      'Take care of health and routine',
    ],
  },
  8: {
    planet: 'Saturn (Shani)',
    strengths: [
      'Strong determination',
      'High endurance and patience',
      'Practical thinking',
      'Ability to handle responsibilities',
      'Long-term success mindset',
    ],
    weaknesses: [
      'Emotional expression is difficult',
      'Can appear cold or distant',
      'Life may bring early struggles',
      'Sometimes overly serious',
    ],
    careers: [
      'Administration',
      'Law and justice system',
      'Management',
      'Finance and business',
      'Government services',
    ],
    advice: [
      'Focus on one task at a time',
      'Maintain discipline and patience',
      'Avoid multitasking overload',
      'Respect workers and people around you',
      'Stay physically active',
    ],
  },
  9: {
    planet: 'Mars (Mangal)',
    strengths: [
      'Strong willpower',
      'Natural leadership ability',
      'Protective nature',
      'High motivation and enthusiasm',
      'Ability to fight against challenges',
    ],
    weaknesses: [
      'Short temper',
      'Impulsive decisions',
      'Arguments and conflicts',
      'Ego issues — anger and emotional intensity can strain relationships',
    ],
    careers: [
      'Defense services',
      'Police',
      'Sports',
      'Business leadership',
      'Politics',
      'Emergency services',
    ],
    advice: [
      'Control anger and impulsive reactions',
      'Practice patience and emotional balance',
      'Use energy for constructive work',
      'Maintain respectful relationships',
      'Stay disciplined',
    ],
  },
}

export interface YogDefinition {
  numbers: number[]
  missingNumbers?: number[]
  name: string
  icon: typeof Star
  gradient: string
  borderColor: string
  traits: string[]
}

export const yogDefinitions: YogDefinition[] = [
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

export function reduceToSingleDigit(num: number): number {
  let value = num
  while (value > 9) {
    value = value
      .toString()
      .split('')
      .reduce((sum, digit) => sum + Number(digit), 0)
  }
  return value
}

export function getStrengthNumber(dob: string, driverNumber: number): number {
  const dobParts = dob.split('-')
  const month = dobParts[1] || '0'
  const monthDigitSum = month
    .split('')
    .reduce((sum, digit) => sum + Number(digit), 0)

  return reduceToSingleDigit(driverNumber + monthDigitSum)
}


export interface GayatriMantra {
  label: string
  sanskrit: string
  transliteration: string
  benefits: string[]
}

export const GAYATRI_MANTRAS: Record<string, GayatriMantra> = {
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

export interface PlanetYantra {
  label: string
  grid: number[][]
  benefits: string[]
  howToUse: string[]
}

export const yogRemedyData: Record<string, string[]> = {
  // Main Vedic Yog
  '1,3,9|': ['Follow discipline daily', 'Avoid laziness and procrastination'],
  '5,6,7|': ['Maintain strict discipline', 'Avoid bad habits and addictions'],
  '2,4,8|': ['Worship Lord Shiva', 'Recite / listen to Chandrashekhar Ashtakam', 'Follow time discipline consistently'],
  '2,3,6|': ['Worship Lord Vishnu', 'Worship Lord Shiva', 'Maintain mental balance'],
  '1,7,8|': ['Worship Hanuman ji (most effective)', 'Worship Goddess Durga'],
  '4,5,9|': ['Worship Lord Ganesha', 'Worship Hanuman ji', 'Do not make hasty decisions'],
  '3,4,7|': ['Worship Lord Shiva', 'Worship Lord Vishnu', 'Chant the name of Ram daily', 'Maintain honesty in all dealings'],
  '2,7,9|': ['Worship Lord Shiva', 'Practice anger control', 'Maintain relationship balance'],
  // Conjunction (Partial Yogs)
  '1,3|9': ['Donate food (Anna Daan)', 'Recite Vishnu Sahasranam', 'Worship the Sun'],
  '1,9|3': ['Recite Hanuman Chalisa', 'Donate yellow-coloured items'],
  '2,8|4': ['Worship Lord Shiva'],
  '4,8|2': ['Build a consistent daily routine', 'Set small, achievable goals'],
  '6,7|5': ['Worship Lord Ram'],
  '5,7|6': ['Worship Lord Ganesha'],
  '3,6|2': ['Worship Guru (Jupiter) or Lord Shiva'],
  '2,6|3': ['Worship Lord Ram'],
  '5,9|4': ['Worship Hanuman ji'],
  '4,5|9': ['Worship Lord Ganesha or Khatu Shyam ji'],
  '1,7|8': ['Worship the Sun or Goddess Durga'],
  '7,8|1': ['Worship Hanuman ji'],
  '3,7|4': ['Worship Lord Ram'],
  '4,7|3': ['Visit temple regularly', 'Practice meditation and spiritual discipline'],
  '7,9|2': ['Worship Lord Ram or Hanuman ji'],
  '2,7|9': ['Worship Lord Shiva', 'Practice forgiveness regularly'],
  // Angular / 90 Yog
  '1,5,7|9': ['Worship Lord Ganesha', 'Practice mind grounding / meditation'],
  '1,6,7|3': ['Worship Lakshmi Narayan', 'Control ego and overconfidence'],
  '1,7,9|5': ['Worship the Sun', 'Worship Lord Ram'],
  '1,3,7|6': ['Recite Vishnu Sahasranam', 'Worship Lakshmi Narayan'],
  '1,3,6|7': ['Growth accelerates after marriage'],
  '1,5,9|7': ['Perform Sun-related remedies'],
  '5,7,8|4': ['Cultivate good company and positive friendships', 'Recite Hanuman Chalisa'],
  '5,7,9|1': ['Exercise regularly', 'Maintain food discipline', 'Worship Sun and Lord Ganesha'],
  '4,5,8|7': ['Recite Hanuman Chalisa', 'Worship Lord Ram'],
  '2,6,7|8': ['Worship Shiva-Parvati together', 'Develop and trust your intuition'],
  '2,7,8|6': ['Worship Lord Shiva', 'Seek guidance from a mentor or elder'],
  '4,7,8|5': ['Worship Hanuman ji', 'Practice planning and discipline'],
  '3,6,7|1': ['Donate towards education-related causes', 'Share your knowledge with others'],
  // Retro Aspect
  '1,4|5,9': ['Worship the Sun', 'Recite Aditya Hridaya Stotra', 'Avoid unnecessary conflicts with government bodies'],
  '1,2|3,6': ['Worship the Sun', 'Build positive and meaningful social networks'],
  '2,5|4,8': ['Worship Lord Shiva', 'Read a spiritual book daily', 'Keep expectations low'],
  '3,5|1,9': ['Worship Guru (Jupiter)', 'Recite Hanuman Chalisa', 'Perform Sun-related remedies'],
  '4,6|2,8': ['Worship Goddess Lakshmi', 'Worship Goddess Durga', 'Limit the number of close relationships'],
  '6,9|1,3': ['Worship Lord Shiva', 'Worship Lord Ram', 'Maintain discipline in relationships'],
  // Previously missing – now filled
  '2,3|6':  ['Matarani worship', 'Durga worship', 'Maa Laxmi worship'],
  '1,8|7':  ['Cats eye crystal', 'Hanuman Chalisa 5 times chanting'],
  '4,9|5':  ['Green aventurine crystal', 'Ganesh Puja on Wednesday', 'Take one time food inside kitchen'],
  '3,9|1':  ['Sun remedy', 'Offer water to Sun'],
  '5,6|7':  ['Ganesh Puja', 'Nand Kumar chanting', 'Offer mug daal to birds'],
  '2,4|8':  ['Khatusam Ji Puja', 'Hanuman Chalisa chanting'],
  '3,4|7':  ['Vishnu chanting', 'Sun remedy'],
  '2,9|7':  ['Shiva worship', 'Hanuman ji worship'],
}

export function getYogRemedyKey(numbers: number[], missingNumbers?: number[]): string {
  const sortedNums = [...numbers].sort((a, b) => a - b).join(',')
  const sortedMissing = missingNumbers ? [...missingNumbers].sort((a, b) => a - b).join(',') : ''
  return `${sortedNums}|${sortedMissing}`
}

export const PERSONAL_YEAR_REMEDIES: Record<number, string> = {
  1: 'Surya Suryani',
  2: 'Rohinish',
  3: 'Shiddhi Guru',
  4: 'Swarbhanusudan Vigraha',
  5: 'Shiddhi Buddh',
  6: 'Shiddhi Sukra',
  7: 'Shiddhi Ketu',
  8: 'Dineshaatmaz',
  9: 'Shiddhi Mangal',
}

export const PLANET_YANTRAS: Record<number, PlanetYantra> = {
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
