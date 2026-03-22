'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Star, Sparkles, Heart, Zap, LogOut, Palette, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Navbar } from '@/components/Navbar'
import { AnalysisModal } from '@/components/AnalysisModal'

interface Analysis {
  title: string
  personality: string
  career: string
  love: string
  strength: string
  challenge: string
}

interface Prediction {
  driver_number: number
  conductor_number: number
  strength_number: number
  personal_year: number
  prediction: string
  lucky_color: string
  lucky_number: number
  dob: string
  analysis: Analysis
  gochor: string
}

export default function PredictionPage() {
  const router = useRouter()
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAnalysis, setShowAnalysis] = useState(false)

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      router.push('/')
      return
    }

    const storedPrediction = localStorage.getItem('prediction')
    if (storedPrediction) {
      setPrediction(JSON.parse(storedPrediction))
      setLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('userId')
    localStorage.removeItem('prediction')
    router.push('/')
  }



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10">
        <div className="text-center">
          <Star className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Reading the stars...</p>
        </div>
      </div>
    )
  }

  if (!prediction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10">
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm p-6 max-w-md">
          <p className="text-muted-foreground mb-4">No prediction found. Please start over.</p>
          <Button onClick={handleLogout} className="w-full bg-primary hover:bg-primary/90">
            Go Back
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10 p-4">
        {/* Background cosmic effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-accent/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative z-10 w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Sparkles className="w-12 h-12 text-primary" fill="currentColor" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Your Cosmic Insights</h1>
            <p className="text-muted-foreground text-sm">Date of Birth: {prediction.dob}</p>
          </div>

          {/* Numerology Card - Driver, Conductor, Personal Year */}
          <Card className="border-primary/20 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 px-8 py-6 border-b border-primary/20">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Star className="w-6 h-6 text-primary" fill="currentColor" />
                Your Numerology Numbers
              </h2>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-3 gap-4">
                {/* Driver Number */}
                <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl p-6 border border-primary/30 text-center">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Driver Number
                  </p>
                  <div className="text-5xl font-bold text-primary mb-2">
                    {prediction.driver_number}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your Life Path
                  </p>
                </div>

                {/* Conductor Number */}
                <div className="bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl p-6 border border-secondary/30 text-center">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Conductor Number
                  </p>
                  <div className="text-5xl font-bold text-secondary mb-2">
                    {prediction.conductor_number}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your Expression
                  </p>
                </div>

                {/* Personal Year */}
                <div className="bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl p-6 border border-accent/30 text-center">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Personal Year
                  </p>
                  <div className="text-5xl font-bold text-accent mb-2">
                    {prediction.personal_year}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This Year's Theme
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Driver-Conductor Analysis Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-secondary/30 to-primary/30 px-8 py-6 border-b border-primary/20">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Heart className="w-6 h-6 text-secondary" fill="currentColor" />
                Your Number Profile
              </h2>
            </div>

            <div className="p-8">
              <div className="space-y-4">
                <div className="flex items-start justify-between p-4 rounded-lg bg-input/30">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground uppercase mb-1">Your Number Type</p>
                    <p className="text-2xl font-bold text-foreground">{prediction.analysis.title}</p>
                  </div>
                  <Button
                    onClick={() => setShowAnalysis(true)}
                    className="bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center gap-2"
                  >
                    Know More
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-foreground/90 leading-relaxed italic">
                  {prediction.analysis.personality}
                </p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-accent/10 p-3 rounded-lg border border-accent/20">
                    <p className="text-muted-foreground font-semibold mb-1">Strengths</p>
                    <p className="text-foreground">{prediction.analysis.strength}</p>
                  </div>
                  <div className="bg-orange-100/20 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200/50 dark:border-orange-800/30">
                    <p className="text-muted-foreground font-semibold mb-1">Challenges</p>
                    <p className="text-foreground">{prediction.analysis.challenge}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Lucky Color Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-card/80 to-card/50 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-accent/30 to-secondary/30 px-8 py-6 border-b border-accent/20">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Palette className="w-6 h-6 text-accent" />
                Lucky Color & Number
              </h2>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-2 gap-6">
                {/* Lucky Color */}
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Lucky Color
                  </p>
                  <div className="w-24 h-24 rounded-2xl border-4 border-accent/30 shadow-lg"
                    style={{ backgroundColor: prediction.lucky_color.toLowerCase() }}
                  />
                  <p className="text-2xl font-bold text-foreground">{prediction.lucky_color}</p>
                </div>

                {/* Lucky Number */}
                <div className="flex flex-col items-center justify-center gap-4">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Lucky Number
                  </p>
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 border-2 border-primary/40 flex items-center justify-center">
                    <p className="text-5xl font-bold text-primary">{prediction.lucky_number}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-8 py-6 border-t border-primary/20 flex gap-3">
              <Button
                onClick={handleLogout}
                className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-lg"
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
                className="flex-1 rounded-lg"
              >
                Select Another Date
              </Button>
            </div>
          </Card>

          <p className="text-xs text-center text-muted-foreground">
            ✨ May the stars guide your path
          </p>
        </div>

        {/* Analysis Modal */}
        {prediction && (
          <AnalysisModal
            isOpen={showAnalysis}
            onClose={() => setShowAnalysis(false)}
            driverNumber={prediction.driver_number}
            conductorNumber={prediction.conductor_number}
            strengthNumber={prediction.strength_number}
            analysis={prediction.analysis}
            gochor={prediction.gochor}
          />
        )}
      </div>
    </>
  )
}
