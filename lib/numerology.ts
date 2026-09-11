// Shared numerology data, types, and helpers.
// Single source of truth for the report generator (ReportStudio) and the
// Know More on-screen tabs. Extracted from app/prediction/know-more/page.tsx.
import {
  Star, Brain, Gem, Dumbbell, GraduationCap, Eye, Briefcase, TrendingUp,
  Sword, Zap, XCircle, Trophy, Sparkles, MoonStar, Orbit, Clock3,
} from 'lucide-react'

// Fallback blurb for a dasha period when the DB has no analysis for that combo.
export const PLANET_DESCRIPTIONS: Record<number, string> = {
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

// One Antardasha period in the rolling 12-month timeline returned by the backend.
// Dates are astrological (360-day year), matching the current-dasha fields below.
export interface DashaTimelineEntry {
  mahadasha_number: number
  mahadasha_planet: string
  mahadasha_start: string
  mahadasha_end: string
  antardasha_number: number
  antardasha_planet: string
  start: string
  end: string
  is_current: boolean
  analysis?: string
}

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
  dasha_timeline?: DashaTimelineEntry[]
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

// Per-conductor-number deep-dive: ruling planet + the explanation prose.
// Kept as narrative paragraphs (rather than the driver's bucketed lists)
// because the source material is written that way. Keyed off the conductor
// number (1-9).
export interface ConductorNumberProfile {
  planet: string
  paragraphs: string[]
}

export const conductorNumberProfiles: Record<number, ConductorNumberProfile> = {
  1: {
    planet: 'Sun',
    paragraphs: [
      'Ruler, team leader, government job and administrative power. They do new things for name and fame. If they receive good guidance, they show their talent.',
      'They are financially stable and know how to earn and spend money. They are good to their friends and support them. When they become busy in their professional life, they may have fewer friends.',
      'They do not want to live alone. They can become successful in business and achieve a top position.',
    ],
  },
  2: {
    planet: 'Moon',
    paragraphs: [
      'Good communication skills, good manners and quality speech. They know how to attract people towards them. They do not like taking responsibility. Their mother and wife may remain worried about them.',
      'They are attracted to the opposite gender and can be argumentative. They may create problems. They are lazy by nature but responsible in social work. They receive respect outside the home.',
      'They do not like spending their own money and may spend other people’s money. They have many friends from different cultures. They should not make decisions in a hurry. They save money in life.',
    ],
  },
  3: {
    planet: 'Jupiter',
    paragraphs: [
      'Their desires are very high. They do not like remaining in their comfort zone. They have very strong willpower and fight against difficult circumstances.',
      'They may receive less than what they deserve according to their efforts. When they struggle, their willpower increases, and they become more mature.',
      'They do not want to do work involving too much heat, but they are hardworking. They can achieve name and fame and are social in life. They receive support from friends and can sometimes be money-minded.',
      'They generally do not have major health issues, although stomach or digestive problems may occur. They seek perfection in life and provide solutions. They may become irritated by small words or matters.',
    ],
  },
  4: {
    planet: 'Rahu',
    paragraphs: [
      'They are disciplined and cool by nature. Remaining calm helps them improve their lives. They seek perfection and work with great dedication, but people may still doubt them.',
      'They accept challenges and changes and can undertake new developments easily. They are well-planned, good learners and very lucky. They can judge future situations very well.',
      'They are expensive by nature, which may sometimes create budget problems. Their blood relatives usually try to support them.',
    ],
  },
  5: {
    planet: 'Mercury',
    paragraphs: [
      'They do not want to continue doing the same kind of work. They frequently change their thought process.',
      'They sacrifice everything for the people they love; otherwise, they may lose the relationship.',
      'They do not want to gain knowledge from everyone and always think about doing something big. When they do not receive a proper support system, they may leave their work halfway and may not want to restart it.',
      'They love travelling and are suited to professional travel. They are always ready to help their friends.',
      'They may not remain honest in marriage, and dealing with their life partner may also be difficult. They like to show off and spend more money in life.',
    ],
  },
  6: {
    planet: 'Venus',
    paragraphs: [
      'They are very good, friendly and helpful advisers. They have a very strong thought process. They are emotional but can control their emotions.',
      'They slowly create good plans and impress other people. They are good at business and are especially suited to partnerships.',
      'They are well-known in their friend circle. They can advise and help other people. They are expensive by nature but receive support from friends.',
      'They should not believe anyone blindly. Emotional setbacks may occur. They always think about saving money. Their relationships and health need proper care.',
    ],
  },
  7: {
    planet: 'Ketu',
    paragraphs: [
      'Challenges come into their lives frequently. They have strong willpower and are courageous. They accept challenges with a smile and can reach their destination by hook or by crook.',
      'Disappointments may come, but they do not remain stuck. It may feel as though the universe is testing them. They do not accept interference from others.',
      'They have good planning abilities and a clear mind. They generally do not have confusion in life. They do not share their sorrow with others.',
      'Too many challenges make them more mature. Stomach-related health issues may occur. They may experience disappointment from friends.',
      'After the age of 35, they can achieve financial stability. They should connect with nature. They can have a good career in health-related or education-related jobs.',
      'They should avoid loneliness. When they remain social, they develop a good network and become popular in their friend circle.',
    ],
  },
  8: {
    planet: 'Saturn',
    paragraphs: [
      'They do not want to take risks or accept work involving major risks and responsibilities. They want a peaceful life.',
      'They are not secretive, so people should not share important secrets with them. They are self-loving and do not think much about the future. They have a free mind and easily believe other people.',
      'They show that they are busy, although they may not actually be busy. They always look for shortcuts and may not be interested in mathematics. They easily become irritated with others.',
      'They are expensive by nature and do not save money. They receive help from good friends. They should not act only according to their emotions and should maintain discipline in life.',
    ],
  },
  9: {
    planet: 'Mars',
    paragraphs: [
      'They have very strong willpower and are courageous. They receive the blessings of the universe but can be argumentative.',
      'They think logically and do not easily become pressurised. They can achieve name and fame when they continue working hard until they succeed.',
      'They experience struggles in life. They should not be lazy and must work hard. They are not easily satisfied in life.',
      'They are humanitarian by nature, easily make friends and are socially active. They can reach the top in any field and enjoy life.',
      'They may experience blood-pressure or blood-related health issues. Their married life may not always be good.',
      'They should control their anger and avoid excessive mental stress. They should not become involved in arguments because it is difficult for other people to win an argument against them.',
    ],
  },
}

export interface YogDetail {
  intro?: string
  numberMeanings?: string[]
  positiveTraits?: string[]
  career?: string[]
  negativeTraits?: string[]
  financialTraits?: string[]
  relationshipTraits?: string[]
  marriage?: string[]
  spiritualTraits?: string[]
  summary?: string
}

// Section order for the full yog write-ups, shared by the Know More view and the report.
export const YOG_DETAIL_SECTIONS: { key: keyof YogDetail; title: string }[] = [
  { key: 'numberMeanings', title: 'Meaning of the Numbers' },
  { key: 'positiveTraits', title: 'Positive Traits' },
  { key: 'career', title: 'Career' },
  { key: 'negativeTraits', title: 'Negative Traits' },
  { key: 'financialTraits', title: 'Financial Traits' },
  { key: 'relationshipTraits', title: 'Relationship Traits' },
  { key: 'marriage', title: 'Marriage' },
  { key: 'spiritualTraits', title: 'Spiritual Traits' },
]

export interface YogDefinition {
  numbers: number[]
  missingNumbers?: number[]
  name: string
  icon: typeof Star
  gradient: string
  borderColor: string
  traits: string[]
  legacyName?: string
  detail?: YogDetail
}

export const yogDefinitions: YogDefinition[] = [
  {
    numbers: [3, 1, 9],
    name: 'Intellectual Yog',
    icon: Brain,
    gradient: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-200',
    traits: [
      'Highly intelligent with analytical thinking',
      'Natural leadership quality',
      'Influential speaker and motivator',
      'Respect and good reputation in society',
    ],
    detail: {
      intro:
        'The combination 3-1-9 is considered a powerful Intellectual, Leadership, and Action-Oriented Yog in Vedic Numerology. When these three numbers come together, a remarkable balance of thinking ability, leadership, and execution is seen in the person.',
      numberMeanings: [
        '3 = Jupiter (Guru) → knowledge, education, intelligence, guidance',
        '1 = Sun (Surya) → leadership, self-confidence, identity, decision-making ability',
        '9 = Mars (Mangal) → courage, energy, action, victory in struggle',
      ],
      positiveTraits: [
        'Highly intelligent with analytical thinking.',
        'Ability to learn new things and teach others.',
        'Natural leadership quality.',
        'Works with complete focus on goals.',
        'Ability to make correct decisions even in difficult circumstances.',
        'Influential speaker and motivator.',
        'Courage to start new projects.',
        'Possibility of gaining respect and a good reputation in society.',
        'Success in management, administration, and strategic planning.',
        'Ability to take on major responsibilities.',
      ],
      career: [
        'CEO / Director',
        'Entrepreneur',
        'Professor / Trainer',
        'IAS / IPS / Government Officer',
        'Lawyer',
        'Judge',
        'Defence Services',
        'Motivational Speaker',
        'Consultant',
        'Political Leadership',
        'Corporate Strategy',
        'Spiritual Teacher',
      ],
      negativeTraits: [
        'If this Yog becomes imbalanced, ego may increase.',
        "A tendency to believe that only one's own view is correct.",
        'Quick temper.',
        'Hastiness.',
        "Ignoring the team's advice.",
        'Wrong decisions due to overconfidence.',
        'Dominating nature in relationships.',
      ],
      financialTraits: [
        'Good ability to earn money.',
        "Progress through one's own efforts.",
        'Benefits from leadership roles.',
        'Possibility of growth in business.',
        'Ability to take risks and achieve success.',
        'Good wealth creation if planning is correct.',
      ],
      relationshipTraits: [
        'Responsible toward the family.',
        'Expect respect from the partner.',
        'Protective nature.',
        'At times, differences may arise because of ego.',
        'Perform even better when appreciated.',
      ],
      spiritualTraits: [
        'Respect for the Guru.',
        'Inclination toward religion and morality.',
        'Spirit of social service.',
        'Live with a sense of purpose in life.',
        'Enjoy guiding others.',
      ],
      summary:
        'The 3-1-9 Intellectual Yog indicates a person who is intelligent (3), an influential leader (1), and an action-oriented warrior (9). If humility, patience, and discipline are maintained, this Yog can bring notable success in education, administration, business, politics, defence, management, and leadership.',
    },
  },
  {
    numbers: [6, 7, 5],
    name: 'Prosperity and Responsibility Yog',
    legacyName: 'Comfort Yog',
    icon: Gem,
    gradient: 'from-pink-500 to-rose-600',
    borderColor: 'border-pink-200',
    traits: [
      'Good ability to earn money and spot financial opportunities',
      'Creative and artistic thinking',
      'Impressive communication skills',
      'Possibility of success in business and management',
    ],
    detail: {
      intro:
        'When these three numbers come together, a good balance is seen between the ability to earn wealth, creative thinking, and spiritual understanding.',
      numberMeanings: [
        '6 = Venus (Shukra) → comfort, luxury, love, art, refinement',
        '7 = Ketu → spirituality, research, intuition, mystery',
        '5 = Mercury (Budh) → intelligence, business, communication, cleverness',
      ],
      positiveTraits: [
        'Good ability to earn money and identify financial opportunities.',
        'Creative and artistic thinking.',
        'Sharp intelligence and the ability to make practical decisions.',
        'Impressive communication skills.',
        'Possibility of success in business and management.',
        'Ability to build good relationships with people.',
        'Give importance to family and relationships.',
        'Curiosity to learn and understand new things.',
      ],
      career: [
        'Business',
        'Marketing and Sales',
        'Fashion and Lifestyle Industry',
        'Jewellery',
        'Interior Design',
        'Hotels and Hospitality',
        'Media and Advertising',
        'Consultancy',
      ],
      negativeTraits: [
        'Spending excessively on luxury.',
        'Occasional confusion while making decisions.',
        'Quick changes in mood.',
        'Trusting or distrusting people too quickly.',
        'Overthinking small matters.',
      ],
      financialTraits: [
        'Good ability to earn money.',
        'Possibility of developing more than one source of income.',
        'Can accumulate good wealth with proper planning.',
        'It is necessary to maintain balance between spending and saving.',
      ],
      relationshipTraits: [
        'Ability to become a loving and supportive spouse.',
        'Give priority to family.',
        'Prefer honesty in relationships.',
        'Sometimes marriage may be delayed because of career or financial goals.',
      ],
      spiritualTraits: [
        'Interest in meditation and spiritual subjects.',
        'Good intuition.',
        'Ability to understand mysterious and esoteric subjects.',
      ],
      summary:
        'The 6-7-5 Yog indicates a person who can balance wealth, intelligence, and spirituality. If discipline and self-control are maintained, notable success may be achieved in business, art, management, and financial fields.',
    },
  },
  {
    numbers: [2, 8, 4],
    name: 'Wealth Accumulation and Karma Yog',
    legacyName: 'Hard Working Success Yog',
    icon: Dumbbell,
    gradient: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-200',
    traits: [
      'Achieve success through hard work and discipline',
      'Ability to manage money properly and save',
      'Responsible and trustworthy personality',
      'Do not give up even in difficult circumstances',
    ],
    detail: {
      intro:
        'When these three numbers come together, there is a unique blend of emotional understanding (2), karma and discipline (8), and the capacity for new thinking and change (4). This Yog is considered to bring success slowly but steadily.',
      numberMeanings: [
        '2 = Moon (Chandra) → emotions, sensitivity, cooperation, imagination',
        '8 = Saturn (Shani) → karma, discipline, justice, patience, struggle',
        '4 = Rahu → innovation, technology, unconventional thinking, change',
      ],
      positiveTraits: [
        'Ability to manage money properly and save.',
        'Achieve success through hard work and discipline.',
        'Dedicated to goals and patient.',
        'Habit of working in a planned manner.',
        'Practical and analytical thinking.',
        'Responsible and trustworthy personality.',
        'Do not give up even in difficult circumstances.',
        'Skilled at finding solutions to problems.',
      ],
      career: [
        'Banking and Finance',
        'Chartered Accountancy (CA)',
        'Audit and Taxation',
        'Government Service',
        'Real Estate',
        'Manufacturing Industry',
        'Engineering',
        'Project Management',
        'Administration',
        'Logistics and Operations',
      ],
      negativeTraits: [
        'Taking too much emotional stress.',
        'Becoming disappointed because success is delayed.',
        "Difficulty expressing one's feelings.",
        'Excessive worry about the future.',
        'Getting caught in negative thoughts.',
        'Taking more responsibility on oneself than necessary.',
      ],
      financialTraits: [
        'Wealth increases slowly but steadily.',
        'Regular income is more common than sudden gains.',
        'Good ability to save and invest.',
        'Strong possibilities of building property.',
        'Financial position becomes stronger in the middle and later years of life.',
      ],
      relationshipTraits: [
        'Dedicated and responsible toward family.',
        'Prefer trust and stability in relationships.',
        'Fully supportive of the spouse.',
        'Because feelings are expressed less, misunderstandings may sometimes occur.',
        "Give priority to the family's security, comfort, and convenience.",
      ],
      marriage: [
        'There is a possibility of late marriage in this Yog, especially when the person first focuses on career and financial stability.',
        'After marriage, life tends to be relatively stable and full of responsibilities.',
        'There is a possibility of having a practical and supportive spouse.',
      ],
      spiritualTraits: [
        'Believe in karma and justice.',
        "Learn from life's experiences.",
        'Spirit of service and charity.',
        'Gain spiritual maturity through difficulties.',
      ],
      summary:
        'The 2-8-4 Wealth Accumulation and Karma Yog indicates a person who progresses in life through emotional understanding (2), hard work and discipline (8), and new thinking (4). Such people often receive success slowly but steadily. If patience, positive thinking, and discipline are maintained, this Yog can provide financial prosperity, respect, and a stable life.',
    },
  },
  {
    numbers: [3, 6, 2],
    name: 'Knowledge, Prosperity and Emotional Balance Yog',
    legacyName: 'Education Yog',
    icon: GraduationCap,
    gradient: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-200',
    traits: [
      'Intelligent, with a strong desire to gain knowledge',
      'Creative and artistic personality',
      'Influential speaker and good adviser',
      'Capacity to gain respect and popularity in society',
    ],
    detail: {
      intro:
        'When these three numbers come together, a beautiful balance is seen among knowledge (3), attraction and prosperity (6), and emotional understanding (2). This Yog is considered to provide respect, popularity, creativity, and social success.',
      numberMeanings: [
        '3 = Jupiter (Guru) → knowledge, education, intelligence, guidance',
        '6 = Venus (Shukra) → love, beauty, art, comforts, luxury',
        '2 = Moon (Chandra) → emotions, sensitivity, imagination, cooperation',
      ],
      positiveTraits: [
        'Intelligent, with a strong desire to gain knowledge.',
        'Creative and artistic personality.',
        'Remarkable ability to understand the feelings of others.',
        'Influential speaker and good adviser.',
        'Ability to bring people along together.',
        'Capacity to gain respect and popularity in society.',
        'Excellent performance in education, training, and guidance.',
        'Calm, humble, and cooperative nature.',
      ],
      career: [
        'Teacher',
        'Professor',
        'Trainer and Motivational Speaker',
        'HR and Human Resources',
        'Counsellor',
        'Writer',
        'Fashion and Design',
        'Media and Advertising',
        'Education and Training Institutions',
        'Psychology and Life Coaching',
      ],
      negativeTraits: [
        'Making decisions under the influence of emotions.',
        'Trying to keep everyone happy.',
        'Overthinking small matters.',
        'Laziness due to a comfortable lifestyle.',
        'Being easily hurt by what others say.',
        'Occasional indecision.',
      ],
      financialTraits: [
        'Good ability to earn money.',
        'Prefer luxury and a good lifestyle.',
        'Good income from education, art, and service sectors.',
        'Money comes in, but spending on comfort and hobbies may also be high.',
        'Good assets can be built with proper financial planning.',
      ],
      relationshipTraits: [
        'Ability to become a loving and understanding spouse.',
        'Give the highest priority to family.',
        'Maintain respect and trust in relationships.',
        "Respect the spouse's emotions.",
        'Try to maintain peace and harmony in the family.',
      ],
      marriage: [
        'Marriage generally takes place on time or with a slight delay.',
        'There is also a possibility of love marriage.',
        'Family life after marriage is likely to be happy.',
        'Emotional understanding strengthens married life.',
      ],
      spiritualTraits: [
        'Respect Guru and parents.',
        'Interest in religious and spiritual subjects.',
        'Attraction toward meditation, yoga, and a positive lifestyle.',
        'Gain mental peace through service and charity.',
      ],
      summary:
        'The 3-6-2 Knowledge, Prosperity and Emotional Balance Yog indicates a person who is intelligent (3), attractive and prosperous (6), and sensitive (2). This Yog can bring excellent success in education, art, management, human resources, counselling, and leadership. If the person maintains a balance between emotions and practicality, there is a strong possibility of gaining respect, comfort, prosperity, and lasting success.',
    },
  },
  {
    numbers: [1, 7, 8],
    name: 'Rajyog and Strong Leadership Yog',
    legacyName: 'Spiritual Yog',
    icon: Eye,
    gradient: 'from-purple-500 to-violet-600',
    borderColor: 'border-purple-200',
    traits: [
      'Inborn leadership ability',
      'Deep thinking and foresight',
      'Justice-loving and principled',
      'Achieve success slowly but steadily',
    ],
    detail: {
      intro:
        'When these three numbers come together, a powerful combination of leadership (1), deep spiritual thinking (7), and hard work (8) is formed. This Yog has the capacity to bring high positions, respect, and major achievements in life, but success often comes after struggle and patience.',
      numberMeanings: [
        '1 = Sun (Surya) → leadership, self-confidence, prestige, decision-making ability',
        '7 = Ketu → spirituality, intuition, research, self-reflection',
        '8 = Saturn (Shani) → karma, discipline, justice, patience, struggle',
      ],
      positiveTraits: [
        'Inborn leadership ability.',
        'Unwavering dedication to goals.',
        'A nature that does not give up even in difficult circumstances.',
        'Deep thinking and foresight.',
        'Justice-loving and principled.',
        'Ability to make major decisions.',
        'Ability to inspire people.',
        'Capacity to build respect and an influential identity in society.',
        'Achieve success slowly but steadily.',
      ],
      career: [
        'Administrative Services (IAS, IPS)',
        'Senior Government Positions',
        'Army and Defence Services',
        'Police Department',
        'Judiciary',
        'Politics',
        'Industrialist and Businessperson',
        'CEO / Director',
        'Project Management',
        'Corporate Leadership',
      ],
      negativeTraits: [
        'Ego may increase.',
        'Difficulty expressing feelings.',
        'Preference for working alone.',
        'Disappointment when success is delayed.',
        'Stubborn and rigid nature.',
        'Putting excessive pressure on oneself.',
      ],
      financialTraits: [
        'Earn money through hard work.',
        'Struggle is possible in early life.',
        'Financial position may become stronger after the age of 35-40.',
        'Possibility of benefit from land, property, and long-term investments.',
        'Wealth grows slowly but steadily.',
      ],
      relationshipTraits: [
        'Responsible and protective spouse.',
        'Take family responsibilities seriously.',
        'Want honesty and respect in relationships.',
        'Because feelings are expressed less, emotional distance may sometimes be felt.',
        'Give importance to family prestige and values.',
      ],
      marriage: [
        'Late marriage is considered more likely in this Yog.',
        'The person first focuses on career, responsibilities, and financial stability.',
        'Life after marriage tends to be relatively stable.',
        'There is a possibility of having a mature and understanding spouse.',
      ],
      spiritualTraits: [
        'Deep interest in spiritual subjects.',
        'Inclination toward meditation, yoga, and self-reflection.',
        'Believe in the principle of karma.',
        "Take deep lessons from life's experiences.",
        'Respect Guru and elders.',
      ],
      summary:
        'The 1-7-8 Rajyog and Strong Leadership Yog indicates a person who combines leadership (1), spiritual depth (7), and industriousness (8). This Yog has the capacity to bring great success after struggle, high position, respect, and lasting prestige. If humility, patience, and discipline are maintained, notable success may be achieved in administration, business, politics, defence services, and leadership.',
    },
  },
  {
    numbers: [9, 5, 4],
    name: 'Courage, Intelligence and Transformation Yog',
    legacyName: 'Workaholic Yog',
    icon: Briefcase,
    gradient: 'from-slate-500 to-gray-700',
    borderColor: 'border-slate-200',
    traits: [
      'Courageous and fearless personality',
      'Sharp intelligence and ability to make quick decisions',
      'Skilled in business and management',
      'Ahead of others in adopting new technology and ideas',
    ],
    detail: {
      intro:
        'When these three numbers come together, there is a remarkable combination of courage (9), sharp intelligence (5), and new thinking (4). This Yog is associated with people who are not afraid of challenges, recognize new opportunities, and achieve success through intelligence.',
      numberMeanings: [
        '9 = Mars (Mangal) → courage, energy, valour, leadership, action',
        '5 = Mercury (Budh) → intelligence, communication, business, logical ability',
        '4 = Rahu → innovation, technology, transformation, unconventional thinking',
      ],
      positiveTraits: [
        'Courageous and fearless personality.',
        'Sharp intelligence and ability to make quick decisions.',
        'Skilled in business and management.',
        'Influential speaker with excellent communication skills.',
        'Ahead of others in adopting new technology and new ideas.',
        'Work with full effort to achieve goals.',
        'Ability to find unique solutions to problems.',
        'Capacity to create a distinct identity in society.',
        'Courage to take risks and achieve success.',
      ],
      career: [
        'Business',
        'Sales and Marketing',
        'Digital Marketing',
        'Media and Journalism',
        'IT and Technology',
        'Police and Defence Services',
        'Politics',
        'Entrepreneurship',
        'Startups',
        'Public Relations (PR)',
        'Motivational Speaker',
      ],
      negativeTraits: [
        'Quick temper.',
        'Making decisions in haste.',
        'Sometimes using harsh language.',
        'Habit of taking excessive risks.',
        'Relationship tension because of lack of patience.',
        'Starting many tasks at once and leaving them incomplete.',
      ],
      financialTraits: [
        'Receive many opportunities to earn money.',
        'Good income from business and communication-related work.',
        'Possibility of sudden financial gains.',
        'Caution is necessary in risky investments.',
        'Can build substantial wealth with proper planning.',
      ],
      relationshipTraits: [
        'Prefer honesty and clarity in relationships.',
        "Take care of the family's security and respect.",
        'Encourage and motivate the spouse.',
        'Married life can remain happy if anger and haste are controlled.',
        'Completely loyal in love, but also desire independence.',
      ],
      marriage: [
        'Marriage may occur at a normal time or with a slight delay.',
        'The person first focuses on career and financial stability.',
        'There is a possibility of having an intelligent and practical spouse.',
        'If anger and ego are controlled, married life remains successful.',
      ],
      spiritualTraits: [
        'Ability to learn from difficult circumstances.',
        'May have devotion toward Lord Hanuman and Lord Bhairav.',
        'Prefer to live spirituality through action and karma.',
        'Ability to accept change in life.',
      ],
      summary:
        'The 9-5-4 Courage, Intelligence and Transformation Yog indicates a person who is courageous (9), intelligent (5), and full of innovation (4). This Yog can bring special success in business, technology, media, administration, and leadership. If patience, discipline, and control over anger are maintained, it can provide rapid progress, financial prosperity, social prestige, and an influential personality.',
    },
  },
  {
    numbers: [7, 3, 4],
    name: 'Research, Innovation and Divine Knowledge Yog',
    legacyName: 'Success Yog',
    icon: TrendingUp,
    gradient: 'from-cyan-500 to-sky-600',
    borderColor: 'border-cyan-200',
    traits: [
      'Exceptional intelligence and analytical thinking',
      'Ability to create new ideas and inventions',
      'Special interest in research and innovation',
      'Strong intuition',
    ],
    detail: {
      intro:
        'When these three numbers come together, a unique combination of knowledge (3), spiritual depth (7), and modern thinking (4) is formed. This Yog is associated with people who think differently from the ordinary, analyze deeply, and make new discoveries.',
      numberMeanings: [
        '3 = Jupiter (Guru) → knowledge, education, intelligence, guidance',
        '7 = Ketu → spirituality, intuition, research, mystery',
        '4 = Rahu → innovation, technology, unconventional thinking, change',
      ],
      positiveTraits: [
        'Exceptional intelligence and analytical thinking.',
        'Habit of going deeply into every subject.',
        'Ability to create new ideas and inventions.',
        'Desire to gain knowledge and keep learning.',
        'Create an identity distinct from the crowd.',
        'Ability to find unique solutions to any problem.',
        'Special interest in research and innovation.',
        'Strong intuition.',
        'Ability to understand new technologies quickly.',
      ],
      career: [
        'Scientist',
        'Research and Development (R&D)',
        'Information Technology (IT)',
        'Artificial Intelligence (AI)',
        'Data Science',
        'Astrology and Numerology',
        'Psychology',
        'Writer and Thinker',
        'Professor',
        'Innovator and Startup Founder',
      ],
      negativeTraits: [
        'Preferring to stay alone more often.',
        'Excessive thinking or overthinking.',
        'Not trusting people easily.',
        'Difficulty expressing feelings.',
        'Taking even small matters very deeply.',
        'Creating distance from social life.',
      ],
      financialTraits: [
        'Good income through knowledge and technology.',
        'Benefits from research, consultancy, and technology.',
        'Possibility of sudden major opportunities.',
        'Give more importance to knowledge and achievements than to money.',
        'Good financial success is also possible if efforts are directed correctly.',
      ],
      relationshipTraits: [
        'Seek honesty and depth in relationships.',
        'Build fewer but genuine relationships.',
        'Responsible toward family.',
        'May not express feelings openly, which can lead to misunderstandings.',
        'Want a spouse who understands their thinking and independence.',
      ],
      marriage: [
        'Late marriage is considered more likely in this Yog.',
        'The person first focuses on knowledge, career, or self-development.',
        'There is a possibility of having a mature and understanding spouse.',
        'After marriage, life tends to be relatively stable and understanding.',
      ],
      spiritualTraits: [
        'Special interest in meditation, yoga, and spiritual practice.',
        'Ability to understand mysterious and esoteric knowledge.',
        'Attraction toward spiritual experiences.',
        'Respect for the Guru and search for knowledge.',
        'Desire to understand the deeper meaning of life.',
      ],
      summary:
        'The 3-7-4 Research, Innovation and Divine Knowledge Yog indicates a person who is intelligent (3), spiritual (7), and innovative in thinking (4). This Yog can bring special success in research, technology, education, astrology, science, and innovation. If the person uses knowledge practically and maintains social balance, there is a strong possibility of gaining respect, prestige, financial success, and deep spiritual progress.',
    },
  },
  {
    numbers: [9, 7, 2],
    name: 'Service, Courage and Spiritual Success Yog',
    legacyName: 'Courageous Yog',
    icon: Sword,
    gradient: 'from-red-500 to-rose-700',
    borderColor: 'border-red-200',
    traits: [
      'Kind and compassionate personality',
      'Maintain courage even in difficult circumstances',
      'Strong intuition and ability to understand people',
      'Spirit of service and social welfare',
    ],
    detail: {
      intro:
        'When these three numbers come together, a remarkable balance of courage (9), spiritual depth (7), and compassion (2) is formed. This Yog is associated with people who like helping others, standing up for justice, and achieving spiritual progress in life.',
      numberMeanings: [
        '9 = Mars (Mangal) → courage, energy, leadership, valour, action',
        '7 = Ketu → spirituality, intuition, research, self-reflection',
        '2 = Moon (Chandra) → sensitivity, emotions, cooperation, compassion',
      ],
      positiveTraits: [
        'Kind and compassionate personality.',
        'Maintain courage even in difficult circumstances.',
        'Strong intuition and ability to understand people.',
        'Spirit of service and social welfare.',
        "Win people's trust easily.",
        'Remain firm on principles.',
        'Peace-loving, but stand against injustice.',
        'Desire to understand spirituality and the deeper meaning of life.',
        'Ability to inspire and guide others.',
      ],
      career: [
        'Doctor and Medical Field',
        'Psychologist',
        'Counsellor',
        'Social Worker / NGO',
        'Defence Services',
        'Police',
        'Spiritual Guru',
        'Yoga and Meditation Instructor',
        'Teacher',
        'Astrology and Numerology',
        'Life Coach',
      ],
      negativeTraits: [
        "Taking other people's sorrow as one's own sorrow.",
        'Getting emotionally hurt quickly.',
        'Trusting people too quickly.',
        'Neglecting oneself because of a spirit of sacrifice.',
        'Conflict between anger and emotional sensitivity.',
        'Feeling lonely.',
      ],
      financialTraits: [
        'Income comes through service, knowledge, or leadership.',
        'Financial position becomes stronger gradually.',
        'Tendency to spend more on charity and helping others.',
        'Can build good assets with proper financial planning.',
        'Honesty increases financial credibility in society.',
      ],
      relationshipTraits: [
        'Become a very devoted and loyal spouse.',
        'Give priority to the happiness of the family.',
        "Understand the spouse's feelings.",
        'Sometimes may not be able to express their own feelings.',
        'Give the greatest importance to trust and respect in relationships.',
      ],
      marriage: [
        'Marriage may be slightly later than usual.',
        'The person first focuses on goals, service, or career.',
        'After marriage, there is a possibility of receiving good support from the spouse.',
        'Because of emotional maturity, married life tends to remain stable.',
      ],
      spiritualTraits: [
        'Special interest in meditation, yoga, and spiritual practice.',
        'Deep faith in God and the principle of karma.',
        'Consider service itself to be the greatest form of worship.',
        'Very strong intuition.',
        'Gain inner satisfaction through spiritual knowledge and service to humanity.',
      ],
      summary:
        'The 9-7-2 Service, Courage and Spiritual Success Yog indicates a person who is courageous (9), spiritual (7), and compassionate (2). This Yog can bring special success in social service, education, medicine, defence, counselling, spiritual guidance, and leadership. If the person maintains balance between emotions and practicality, there is a strong possibility of gaining respect, social prestige, mental peace, and lasting success.',
    },
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
  '1,3,9|': ['Offer water to the Sun every day', 'On Thursday, donate yellow clothes or yellow lentils', 'Recite the Hanuman Chalisa on Tuesday', 'Respect parents and Guru', 'Keep ego and anger under control', 'Continue regular study and acquisition of knowledge'],
  '5,6,7|': ['Worship Goddess Lakshmi on Friday', 'Donate green-coloured items', 'Respect parents and Guru', 'Control unnecessary expenses', 'Meditate regularly'],
  '2,4,8|': ['Donate to people in need on Saturday', "To strengthen the Moon, chant the mantra 'Om Som Somaya Namah' daily", 'Respect parents and elders', 'Perform service associated with Saturn, such as helping the poor and respecting workers', 'Practice meditation and yoga regularly'],
  '2,3,6|': ['Donate yellow items on Thursday', 'Worship Goddess Lakshmi on Friday', 'To strengthen the Moon, perform Jalabhishek of Lord Shiva on Monday', 'Meditate regularly', 'Continue acquiring knowledge and share knowledge with others'],
  '1,7,8|': ['Offer water to the Sun every day', 'Help people in need on Saturday', 'Recite the Hanuman Chalisa regularly', 'Keep ego and anger under control', 'Respect parents and Guru', 'Practice meditation and yoga regularly'],
  '4,5,9|': ['Recite the Hanuman Chalisa on Tuesday', 'Worship Lord Ganesha on Wednesday', 'Keep anger and haste under control', 'Donate study materials to students in need', 'Meditate for at least 10 minutes every day'],
  '3,4,7|': ['Donate yellow items on Thursday', 'Meditate for at least 15 minutes every day', 'Respect Guru and parents', 'Help people in need on Saturday', 'Use your knowledge for the welfare of society'],
  '2,7,9|': ['Recite the Hanuman Chalisa on Tuesday', 'Perform Jalabhishek of Lord Shiva on Monday', 'Donate food and clothing to people in need', 'Meditate regularly', 'Respect parents, Guru, and elders', 'Practice making practical decisions along with considering emotions'],
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

// ── Monthly Prediction (Personal Year x Personal Month) ────────────────────
//
// Source: the "MONTH PREDICTION — Reorganized Notes" material, covering all
// nine Personal Years against all nine Personal Months. Each entry holds the
// characteristics of that month plus the remedy prescribed for the pair.

export interface MonthlyPrediction {
  characteristics: string[]
  remedy: string[]
}

export const MONTHLY_PREDICTIONS: Record<number, Record<number, MonthlyPrediction>> = {
  1: {
    1: {
      characteristics: [
        'Rude communication.',
        'Do not go into arguments.',
        'Dominating nature.',
        'Follow discipline.',
        'Success can come in life.',
        'If you become self-centric, you may face loss in life.',
        'Maintain a good relationship with your spouse.',
        'Maintain a good relationship with your father and family.',
      ],
      remedy: ['Do not hurry in life.', 'Sun remedy.'],
    },
    2: {
      characteristics: [
        'Relationship issues with spouse may arise.',
        'Do not criticize others or your spouse.',
        'Mental stability needs attention.',
        'Maintain a good relationship with parents.',
        'Do not take unnecessary risks.',
        'Emotional breakdown may occur.',
        'Maintain a good relationship with family.',
        'Universal support may help your work when your belief system is strong.',
      ],
      remedy: ['Go for meditation.'],
    },
    3: {
      characteristics: [
        'Very good time to do social work.',
        'Your fame, name and reputation may increase.',
        'Good for health.',
        'Growth in professional life.',
        'Do not get into arguments with office colleagues; otherwise negativity may come.',
      ],
      remedy: ['Respect your Guru.', 'Read a spiritual book.'],
    },
    4: {
      characteristics: [
        'Your relationship may improve.',
        'Mental disturbance may occur.',
        'Success in professional life.',
        'Do not create a virtual world; keep realistic goals.',
        'Do not make very big plans.',
        'You need to control your emotions.',
        'Finances may be good.',
      ],
      remedy: ['Sun remedy.'],
    },
    5: {
      characteristics: [
        'Communication may improve.',
        'Your reputation may also increase.',
        'Follow the advice of well-wishers if you want something new in life.',
        'Take advice before acting.',
        'Control your decisions; otherwise they may harm you or someone close to you.',
        'Do not be in a hurry in life.',
      ],
      remedy: ['Rahu Ji Puja.'],
    },
    6: {
      characteristics: [
        'Be aware in matters involving the opposite gender and maintain good relations.',
        'Support may come in professional life.',
        'Problems may arise if you have a bad relationship with the opposite gender.',
        'Respect your spouse.',
      ],
      remedy: ['Laxmi Narayan Puja.'],
    },
    7: {
      characteristics: [
        'Think twice before taking a decision that brings major change in life.',
        'Do not invest anywhere without proper consideration.',
        'Increase your spirituality.',
        'Control your emotions.',
        'Do not interfere in another person\'s life, and do not allow unnecessary interference in your own life.',
        'Take care of your health.',
      ],
      remedy: ['Read a spiritual book.'],
    },
    8: {
      characteristics: [
        'You may feel lazy.',
        'Follow a timetable.',
        'Do not become aggressive in life.',
        'Do not take unwanted responsibilities.',
        'Do not go into arguments.',
        'Focus more on your professional work.',
      ],
      remedy: ['Hanuman Ji Puja.'],
    },
    9: {
      characteristics: [
        'Good for professional life.',
        'Not very good for personal life.',
        'You may become arrogant.',
        'Dominating nature may appear.',
        'Control your anger.',
        'Success in professional life.',
        'Maintain a good relationship with the opposite gender.',
      ],
      remedy: ['Sun Puja.'],
    },
  },
  2: {
    1: {
      characteristics: [
        'High confidence level.',
        'Emotions may be weak.',
        'Maintain good communication and healthy relationships.',
        'Take proper sleep.',
        'Do not travel excessively.',
        'Maintain good relationships in professional life.',
      ],
      remedy: ['Laxmi Narayan Puja.', 'Offer a rose.'],
    },
    2: {
      characteristics: [
        'You may get hurt by small words.',
        'Maintain a good relationship with your mother and spouse.',
        'Do meditation regularly.',
        'Do not take new steps in life.',
        'Stay cool and calm.',
      ],
      remedy: ['Offer milk to Shiv Ji.'],
    },
    3: {
      characteristics: [
        'Professional life may be good.',
        'Your network may increase.',
        'Take decisions after discussion with a well-wisher.',
      ],
      remedy: ['Respect your Guru.', 'Offer banana to Narayan or Guru.', 'Offer chana to a banana tree.'],
    },
    4: {
      characteristics: [
        'Depression may arise from words.',
        'Issues may be created in the family.',
        'Do not hurt anyone\'s feelings.',
        'Control your imagination.',
        'Do not take new steps.',
        'An enemy may hurt you.',
      ],
      remedy: ['Durga Kavach chanting.'],
    },
    5: {
      characteristics: [
        'Spend time with family members.',
        'Maintain a good relationship with everyone.',
        'Respect your parents.',
        'Be active in life.',
      ],
      remedy: ['Offer green items.'],
    },
    6: {
      characteristics: [
        'Planning for new purchases may arise.',
        'Maintain a good relationship with your spouse.',
        'Maintain a good relationship with the opposite gender.',
        'Professional life requires discipline.',
        'Be limited and careful in relationships.',
      ],
      remedy: ['Maa Laxmi Puja.', 'Radha-Krishna Puja.'],
    },
    7: {
      characteristics: [
        'Health issues may occur if you do not follow a routine in life.',
        'Disappointment may arise in relationships.',
        'Professional life may receive support.',
        'Do not become overly emotionally attached.',
        'Take help from someone close if needed.',
        'Do not waste your time.',
        'Respect your mother.',
      ],
      remedy: ['Fish remedy.'],
    },
    8: {
      characteristics: [
        'Be professional in life.',
        'Follow discipline and a daily routine.',
        'Mental stress may occur.',
        'Do physical exercise.',
        'Stay away from deep water.',
      ],
      remedy: ['Offer Panchamrit to Shiv Ji.'],
    },
    9: {
      characteristics: [
        'Do not go into arguments.',
        'Emotional problems may occur in life.',
        'Do not hurt anyone.',
        'Maintain good communication.',
        'Professional life may receive support.',
        'Sudden profit may occur.',
        'Energy will be under control.',
      ],
      remedy: ['Hanuman Ji Puja.', 'Shiv Ji Puja.'],
    },
  },
  3: {
    1: {
      characteristics: [
        'Connect socially with people.',
        'A good adviser may be available during this time.',
        'Work on your growth.',
        'Personal life may get hurt.',
        'Financial growth may occur.',
        'Participate in religious activities.',
      ],
      remedy: ['Vishnu Sahasranama chanting.'],
    },
    2: {
      characteristics: [
        'Maintain a good family relationship, especially with children.',
        'Do not take new steps.',
        'Control your emotions.',
        'Do not build too many new relationships.',
      ],
      remedy: ['Chandra Shekhar Ashtakam chanting.'],
    },
    3: {
      characteristics: [
        'Growth in life.',
        'Financially strong period.',
        'Social name and fame may increase.',
        'Your decisions may support you.',
        'Do social activities.',
        'Do not have ego in life.',
      ],
      remedy: ['Laxmi Narayan: offer a rose.', 'Banana tree Puja.'],
    },
    4: {
      characteristics: [
        'Think twice before starting something.',
        'Be disciplined in life.',
        'Do not share your plan.',
        'Sudden gain may occur in professional life.',
        'Problems may arise in family life.',
      ],
      remedy: ['Read a spiritual book.'],
    },
    5: {
      characteristics: [
        'Social name and fame may increase.',
        'Family relationships need to be maintained.',
        'Increase your network.',
        'Read documents properly before signing.',
        'Spend time with family.',
        'Respect your Guru.',
      ],
      remedy: ['Ganesh Ji Puja.', 'Maa Tulsi Puja.'],
    },
    6: {
      characteristics: [
        'Maintain your relationships.',
        'Do not hurt anyone.',
        'Maintain good communication.',
        'Professional growth may occur.',
        'Improve your skills.',
        'Do not overdo multitasking.',
        'Work on your inner self/body.',
      ],
      remedy: ['Laxmi Narayan Puja.', 'Kumar Mahesh Stotra chanting.'],
    },
    7: {
      characteristics: [
        'Do not take a big financial decision.',
        'Good time to learn new things.',
        'Professional life may receive support.',
        'Control your emotions.',
        'Do not interfere in other people\'s personal life.',
        'Value your time.',
        'Social name and fame may increase.',
      ],
      remedy: ['Read a spiritual book.', 'Go to a temple.', 'Offer food to birds.'],
    },
    8: {
      characteristics: [
        'Professional support may be available.',
        'Maintain a good relationship with children.',
        'Do not dominate anyone.',
        'Control your communication.',
        'Believe in your skills.',
      ],
      remedy: ['Offer a Deepak at a Peepal tree.', 'Aditya Hridaya chanting.'],
    },
    9: {
      characteristics: [
        'Success in professional life.',
        'Make a plan and execute it.',
        'Name and fame may increase in life.',
        'People may respect your decisions.',
        'Maintain a good relationship with the opposite gender.',
        'Do not keep ego in life.',
        'Do physical exercise.',
      ],
      remedy: ['Hanuman Chalisa chanting.'],
    },
  },
  4: {
    1: {
      characteristics: [
        'Overconfidence can create problems in life.',
        'Avoid arguments in personal and family life.',
        'Spend time on your professional life.',
        'Maintain proper sleeping time.',
        'Avoid long travel.',
      ],
      remedy: ['Sun remedy.'],
    },
    2: {
      characteristics: [
        'Emotional imbalance may be high.',
        'Do not expect too much from anyone.',
        'Mental stress needs to be controlled.',
        'Do not sleep late at night.',
        'Respect your spouse and mother.',
      ],
      remedy: ['Do meditation.', 'Visit a Shiv temple.'],
    },
    3: {
      characteristics: [
        'Respect a noble person in your life.',
        'Do not take quick decisions in life.',
        'Do not become overconfident.',
        'Do not take big financial decisions.',
        'Do not become lazy in life.',
        'Involve yourself in social work.',
        'Maintain a good relationship with friends.',
      ],
      remedy: ['Sun remedy.'],
    },
    4: {
      characteristics: [
        'Anger issues may arise.',
        'Dominating nature may appear.',
        'Follow discipline.',
        'Avoid long travelling.',
        'Sudden gain may come in professional life.',
      ],
      remedy: ['Khatu Shyam Ji Puja.', 'Durga Mata Puja.'],
    },
    5: {
      characteristics: [
        'Financial condition may be good.',
        'Maintain your communication.',
        'Do not be lazy in life.',
        'Do not take quick decisions.',
      ],
      remedy: ['Rahu Ji Puja.'],
    },
    6: {
      characteristics: [
        'Maintain a good relationship with the opposite gender.',
        'Do not make unnecessary expenses.',
        'Do not show off.',
        'Do not share your secret planning.',
        'Maintain your outlook.',
        'Sudden gain may come in your life.',
      ],
      remedy: ['Laxmi Narayan Puja.'],
    },
    7: {
      characteristics: [
        'Do not insult anyone.',
        'Follow discipline.',
        'Do not take big decisions in professional life.',
        'Emotional stress may occur in life.',
        'Sudden gain may come in life.',
        'Do not do wrong to your body.',
      ],
      remedy: ['Maa Durga Ji Puja.'],
    },
    8: {
      characteristics: [
        'Respect your elders and parents.',
        'Be polite in life.',
        'Follow discipline.',
        'Do not be lazy in life.',
        'Success may come in professional life.',
        'Travelling may increase.',
        'Work hard.',
        'Do physical exercise.',
      ],
      remedy: ['Hanuman Ji Puja.'],
    },
    9: {
      characteristics: [
        'Anger issues may arise.',
        'Maintain a good relationship with your spouse.',
        'Do not hurt your spouse\'s feelings.',
        'Follow discipline.',
        'Participate in social activities.',
        'Energy may remain under control.',
        'Do future planning.',
      ],
      remedy: ['Hanuman Ji Puja.'],
    },
  },
  5: {
    1: {
      characteristics: [
        'New beginnings and new growth may come.',
        'Maintain balance in life.',
        'Your decisions may support you.',
        'Control your communication.',
        'Increase your networking.',
        'Increase your patience level.',
      ],
      remedy: ['Sun remedy.'],
    },
    2: {
      characteristics: [
        'Control your mood swings.',
        'Respect your mother and spouse.',
        'Spend time with your family.',
        'Bring balance into your family life.',
        'Universal support may be available.',
        'Sudden gain may come in your life.',
      ],
      remedy: ['Krishna Ji Puja.'],
    },
    3: {
      characteristics: [
        'Respect your Guru.',
        'Increase your knowledge.',
        'Financial growth may occur.',
        'Avoid negative persons or company.',
        'Do not become overconfident in life.',
        'Believe in yourself.',
      ],
      remedy: ['Sun remedy.', 'Bishnu Ji Puja.'],
    },
    4: {
      characteristics: [
        'Do not take big financial decisions.',
        'Avoid long travel during this time.',
        'Reputation needs to be considered during this time.',
        'Respect the opposite gender.',
        'Stay away from enemies.',
      ],
      remedy: ['Ganesh Ji Puja.', 'Khatu Shyam Ji Puja.'],
    },
    5: {
      characteristics: [
        'Think twice before you speak.',
        'Do not hurry in your life.',
        'Growth may come in professional and personal life.',
        'Do not be lazy in your life.',
      ],
      remedy: ['Ganesh Ji Puja.'],
    },
    6: {
      characteristics: [
        'Name, fame and prosperity may come in life.',
        'Financial status may be good.',
        'Do not be extravagant in your life.',
        'Respect the opposite gender.',
        'Prefer short travel.',
        'Emotional weakness may arise from family matters.',
      ],
      remedy: ['Laxmi Narayan Puja.'],
    },
    7: {
      characteristics: [
        'Follow discipline in your life.',
        'Support may come in your professional life.',
        'Universal support may be available.',
        'Sudden gain may occur.',
        'Personal-life issues may arise.',
      ],
      remedy: ['Ganesh Ji Puja.'],
    },
    8: {
      characteristics: [
        'Family issues may arise.',
        'Support may come in professional life.',
        'Maintain your communication.',
        'Spend quality time with children.',
        'Follow discipline in life.',
        'Do not be lazy in life.',
      ],
      remedy: ['Sun remedy.'],
    },
    9: {
      characteristics: [
        'High energy: take care of your health.',
        'Your decisions may support you.',
        'Name and fame may increase in professional life.',
        'Improve your networking.',
        'Be alert in matters involving the opposite gender.',
      ],
      remedy: ['Sun remedy.', 'Ganesh Ji Puja.'],
    },
  },
  6: {
    1: {
      characteristics: [
        'Name, fame and prosperity may come.',
        'Respect your spouse.',
        'Respect others\' feelings.',
        'Focus on savings.',
        'Take care of your health.',
      ],
      remedy: ['Laxmi Narayan Puja.'],
    },
    2: {
      characteristics: [
        'Attractive personality.',
        'Name, fame and prosperity may increase in life.',
        'Do not become too expensive.',
        'Maintain good communication with the opposite gender.',
        'Be patient in your life.',
        'Do not become overly emotional.',
      ],
      remedy: ['Shiv Ji Puja.'],
    },
    3: {
      characteristics: [
        'Take care of your health.',
        'Relationship issues may occur.',
        'Support may come in professional life.',
        'Use your knowledge fully.',
        'Do not share your plans.',
        'Follow discipline.',
        'Keep communication limited.',
        'Do your own work on priority.',
      ],
      remedy: ['Laxmi Narayan Puja.'],
    },
    4: {
      characteristics: [
        'Financial status may be satisfying.',
        'Avoid show-off.',
        'Maintain good relationships with the opposite gender at the workplace.',
        'Control your expenses.',
        'Travelling may increase.',
        'Support may be available.',
      ],
      remedy: ['Laxmi-Ganesh Puja.'],
    },
    5: {
      characteristics: [
        'Financial condition may be good.',
        'Control your laziness.',
        'Professional growth may occur.',
        'Maintain discipline.',
        'Travelling may increase.',
        'Do not share your plans with others.',
      ],
      remedy: ['Laxmi-Ganesh Ji Puja.'],
    },
    6: {
      characteristics: [
        'Do not argue with the opposite gender.',
        'Your reputation should be a priority.',
        'Financial growth may occur.',
        'Control your communication inside the family.',
        'Family vacation planning may arise.',
      ],
      remedy: ['Laxmi Narayan Puja.'],
    },
    7: {
      characteristics: [
        'Sudden gain may come in professional life.',
        'Do not become overconfident in life; it may harm you.',
        'Support may come in professional life.',
        'Separate personal and professional life.',
        'Control your emotions in family life.',
      ],
      remedy: ['Durga Mata Ji Puja.'],
    },
    8: {
      characteristics: [
        'Slowness may occur in professional life.',
        'Do not be lazy in life.',
        'Travelling may increase.',
        'Do not criticize family members.',
        'Hard work may give positive results.',
      ],
      remedy: ['Shiv Parbati Puja.'],
    },
    9: {
      characteristics: [
        'Maintain good communication with the opposite gender.',
        'Avoid creating unnecessary problems.',
        'Do social work.',
        'Do not do wrong with the opposite gender.',
        'Support may come in professional life.',
      ],
      remedy: ['Hanuman Ji Puja.'],
    },
  },
  7: {
    1: {
      characteristics: [
        'Good for relationships.',
        'Support may come in professional life.',
        'Take care of your health.',
        'Control your emotions in professional life.',
        'Support from family or a noble person may be needed.',
      ],
      remedy: ['Sun remedy.'],
    },
    2: {
      characteristics: [
        'Take care of your health.',
        'Do not be lazy in personal and professional life.',
        'Maintain discipline.',
        'Do not expect too much from others.',
        'Do not take big financial decisions.',
        'Do not increase your negativity.',
      ],
      remedy: ['Shiv Ji Puja.'],
    },
    3: {
      characteristics: [
        'Support your professional life.',
        'Increase your knowledge.',
        'Do not involve others in personal problems.',
        'Do not share your knowledge everywhere.',
      ],
      remedy: ['Laxmi Narayan Puja.'],
    },
    4: {
      characteristics: [
        'Do not hurry in life.',
        'Be patient in life.',
        'Do not become argumentative.',
        'Sudden gain may occur.',
        'Support may come in professional life.',
        'Maintain healthy relationships.',
      ],
      remedy: ['Khatu Shyam Ji Puja.'],
    },
    5: {
      characteristics: [
        'Have patience in life.',
        'Respect mentors and well-wishers.',
        'Think twice before taking any decision.',
        'Maintain a good relationship with siblings.',
        'Increase your knowledge.',
      ],
      remedy: ['Ganesh Ji Puja.'],
    },
    6: {
      characteristics: [
        'Maintain relationships with the opposite gender.',
        'Avoid bad company.',
        'Do not share your plans.',
        'Control unnecessary fasting.',
        'Be alert in professional life.',
      ],
      remedy: ['Laxmi Narayan Puja.'],
    },
    7: {
      characteristics: [
        'Health issues may arise.',
        'Avoid bad company and bad addictions.',
        'Do not get involved in controversy.',
        'Take advice from a mentor.',
        'Be spiritually active.',
        'Sudden gain may occur.',
        'Do not take major financial decisions.',
        'Maintain a good relationship with your spouse.',
      ],
      remedy: ['Sun remedy.', 'Ganesh Ji Puja.', 'Black cow Puja (Kala Gai).'],
    },
    8: {
      characteristics: [
        'Laziness may be present.',
        'Learn from past mistakes.',
        'Take care of your health.',
        'Do professional work seriously.',
        'Be spiritual in life.',
        'Maintain communication within the family.',
        'Do not argue with juniors.',
      ],
      remedy: ['Ganesh Ji Puja.', 'Hanuman Ji Puja.'],
    },
    9: {
      characteristics: [
        'Be careful while driving or using sharp items.',
        'Injury may occur.',
        'Think twice before doing any work.',
        'False ego may arise.',
        'Maintain good relationships in professional life.',
      ],
      remedy: ['Sun remedy.', 'Hanuman Ji Puja.'],
    },
  },
  8: {
    1: {
      characteristics: [
        'Practical thought process may increase.',
        'Practical thinking and emotions may become strong.',
        'Do not behave rudely in life.',
        'Maintain good relations with everyone.',
        'Do not behave badly with employees.',
      ],
      remedy: ['Sun remedy.'],
    },
    2: {
      characteristics: [
        'Take care of your health.',
        'Take care of your mother\'s health as well.',
        'Avoid unnecessary financial decisions.',
        'Do not behave rudely.',
        'Respect your spouse\'s feelings.',
      ],
      remedy: ['Shiv Ji Puja.'],
    },
    3: {
      characteristics: [
        'Support may come from professional life.',
        'Plan accordingly.',
        'Do not expect too much from anyone.',
        'Avoid physical rudeness.',
        'Do not behave rudely.',
        'Use your knowledge in the right direction.',
      ],
      remedy: ['Narayan Puja.'],
    },
    4: {
      characteristics: [
        'Struggle may appear in personal and professional life.',
        'Follow discipline.',
        'Do not multitask excessively.',
        'Do not hurt anyone.',
        'Sudden gain may occur in life.',
        'Travelling may increase.',
        'Do not take a big financial decision.',
      ],
      remedy: ['Hanuman Ji Puja.'],
    },
    5: {
      characteristics: [
        'Control your communication.',
        'Laziness may occur in life.',
        'Family disputes may arise.',
        'Success may come if you plan properly.',
        'Discuss important matters with well-wishers.',
      ],
      remedy: ['Hanuman Ji Puja.', 'Khatu Shyam Ji Puja.'],
    },
    6: {
      characteristics: [
        'A practical approach will help you.',
        'Do not become overly emotional.',
        'Maintain a good relationship with the opposite gender.',
        'Your hard work may pay you.',
        'Do not keep confusion in mind.',
      ],
      remedy: ['Laxmi Narayan Ji Puja.'],
    },
    7: {
      characteristics: [
        'Do spiritual activities.',
        'Maintain relationships in the family.',
        'Follow discipline.',
        'Control laziness.',
        'Do not involve yourself with anyone unnecessarily.',
        'Take care of your health.',
        'Support may come from professional life.',
        'If you make plans, implement them.',
      ],
      remedy: ['Sun remedy.', 'Durga Mata Puja.'],
    },
    8: {
      characteristics: [
        'Control your energy and communication.',
        'Do not go into arguments.',
        'Take care of your health.',
        'Emotional detachment may occur.',
        'Do not take any decision in a hurry.',
      ],
      remedy: ['Hanuman Ji Puja.'],
    },
    9: {
      characteristics: [
        'You may dominate people.',
        'Take care of your health.',
        'Do physical exercise.',
        'Do not get into arguments.',
        'Do not create enemies with your own words.',
        'Professional gain may come if you follow discipline.',
        'Take care of your food habits.',
        'Do not feel low.',
      ],
      remedy: ['Hanuman Ji Puja.'],
    },
  },
  9: {
    1: {
      characteristics: [
        'Do not take decisions in a hurry.',
        'Do not become dominating in nature.',
        'Maintain good relationships with family.',
        'New opportunities may come.',
        'Your behavior may help maintain good relationships.',
        'Follow discipline in life.',
      ],
      remedy: ['Sun remedy.', 'Hanuman Ji Puja.'],
    },
    2: {
      characteristics: [
        'Take care of your health.',
        'Financial condition may be good.',
        'Maintain good relationships with spouse and the opposite gender.',
        'Sudden gain may occur.',
        'Maintain good relationships with employees.',
        'Mental and physical health need consideration.',
        'Maintain balance in professional and personal life.',
        'Do not get into arguments.',
      ],
      remedy: ['Sun remedy.', 'Shiv Ji Puja.'],
    },
    3: {
      characteristics: [
        'Social work may help.',
        'Help needy persons.',
        'Give good advice to others.',
        'This may give you name and fame.',
        'Be spiritual.',
        'Short spiritual travel may occur.',
        'Your work may be completed.',
      ],
      remedy: ['Sun remedy.', 'Bishnu Ji Puja.'],
    },
    4: {
      characteristics: [
        'High energy may arise within you.',
        'Do not share your plans.',
        'Be disciplined in life.',
        'Maintain good relationships.',
        'Do not become overconfident in life.',
        'Do not get involved in arguments.',
        'Do not make big plans.',
      ],
      remedy: ['Hanuman Ji Puja.'],
    },
    5: {
      characteristics: [
        'Strong willpower during this time.',
        'Your energy may support you.',
        'Maintain good karma in life.',
        'Good time to start work in your profession.',
        'Travelling may increase.',
        'Spend time with family.',
        'Maintain good communication.',
        'Growth may come according to your plans.',
      ],
      remedy: ['Ram Ji Puja.'],
    },
    6: {
      characteristics: [
        'Maintain good relationships with the opposite gender.',
        'Expenses may be high.',
        'Spend time with family.',
        'Use a practical approach.',
        'Do not trust blindly in professional life.',
        'Be spiritual and honest in life.',
        'Do not insult anyone.',
        'Maintain polite communication.',
      ],
      remedy: ['Laxmi Narayan Puja.', 'Offer a rose.'],
    },
    7: {
      characteristics: [
        'Control your decisions and avoid taking new decisions.',
        'Take care of your health.',
        'Be careful with sharp items.',
        'Maintain discipline in professional life.',
        'Professional growth may occur.',
        'Respect your well-wishers and Guru.',
      ],
      remedy: ['Maa Durga Puja.'],
    },
    8: {
      characteristics: [
        'High energy.',
        'Do not get into arguments.',
        'Do not waste your time.',
        'Good for professional life.',
        'Hard work may give good results.',
        'Do not expect too much from others.',
        'Maintain self-motivation.',
      ],
      remedy: ['Hanuman Ji Puja.'],
    },
    9: {
      characteristics: [
        'High energy.',
        'Do not behave rudely.',
        'Do not hurt anyone emotionally.',
        'Name and fame may increase in professional life if you follow discipline.',
        'Take care of your health.',
        'Do not become dominating in the family.',
        'Travelling may increase.',
        'Maintain a good relationship with employees.',
      ],
      remedy: ['Sun remedy.'],
    },
  },
}

/**
 * Personal Months whose remedies apply for a given Personal Year. The Remedy
 * section of the Monthly Prediction tab is driven by the Personal Year alone —
 * it deliberately does not follow the month the user is currently in.
 */
export const PERSONAL_YEAR_REMEDY_MONTHS: Record<number, number[]> = {
  1: [1, 9],
  2: [2, 6],
  3: [3],
  4: [4, 8],
  5: [5, 1],
  6: [6, 2],
  7: [7, 1],
  8: [8],
  9: [9],
}

/**
 * Personal Year for a DOB ("YYYY-MM-DD") in a given calendar year, matching the
 * backend's calculation (birth day + birth month + calendar year, reduced).
 */
export function getPersonalYearForYear(dob: string, calendarYear: number): number {
  const [, month, day] = dob.split('-')
  const total = Number(day) + Number(month) + calendarYear
  if (!Number.isFinite(total)) return 1
  return reduceToSingleDigit(total)
}

/** Personal Month = Personal Year + calendar month (1-12), reduced. */
export function getPersonalMonth(personalYear: number, calendarMonth: number): number {
  return reduceToSingleDigit(personalYear + calendarMonth)
}
