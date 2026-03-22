'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { format, differenceInYears } from 'date-fns'
import { CalendarIcon, Star, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export default function DOBSelectionPage() {
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [showCalendar, setShowCalendar] = useState(true)

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      router.push('/')
    }
  }, [router])

  const getAge = (birthDate: Date) => {
    return differenceInYears(new Date(), birthDate)
  }

  const handleSubmitDOB = async () => {
    if (!date) {
      toast.error('Please select your date of birth')
      return
    }

    setLoading(true)
    try {
      const userId = localStorage.getItem('userId')
      const formattedDate = format(date, 'yyyy-MM-dd')

      const response = await fetch(
        `${BACKEND_URL}/api/predictions/submit-dob/${userId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dob: formattedDate }),
        }
      )

      const data = await response.json()
      if (response.ok) {
        localStorage.setItem('prediction', JSON.stringify(data))
        toast.success('Date submitted! Getting your prediction...')
        router.push('/prediction')
      } else {
        toast.error(data.detail || 'Failed to submit date')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to submit date')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10 p-4">
      {/* Background cosmic effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Star className="w-12 h-12 text-primary" fill="currentColor" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Your Cosmic Birth</h1>
          <p className="text-muted-foreground">Select your date of birth to reveal your destiny</p>
        </div>

        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm p-8">
          <div className="space-y-8">
            {/* Calendar Section */}
            <div className="space-y-4">
              <p className="text-sm font-semibold text-muted-foreground text-center uppercase tracking-wider">
                Your Birth Moment
              </p>

              <div className="bg-gradient-to-br from-primary/20 via-background to-secondary/20 rounded-2xl p-8 border border-primary/30">
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(dateObj) => dateObj > new Date() || dateObj < new Date('1900-01-01')}
                    captionLayout="dropdown"              // ✅ month & year dropdown in header
                    fromYear={1900}                       // ✅ earliest year
                    toYear={new Date().getFullYear()}     // ✅ latest year
                    className="[&_button]:h-10 [&_button]:w-10 [&_.bg-accent]:bg-primary/30 [&_.text-primary]:text-primary rounded-xl"
                  />
                </div>
              </div>
            </div>

            {date && (
              <div className="space-y-4">
                <div className="p-6 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/20 border border-primary/40 backdrop-blur-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                        Birth Date
                      </p>
                      <p className="text-3xl font-bold text-primary mb-2">
                        {format(date, 'MMMM d')}
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">
                        {format(date, 'EEEE')}, {format(date, 'yyyy')}
                      </p>
                      <p className="text-xs text-accent font-semibold">
                        Age: {getAge(date)} years old
                      </p>
                    </div>
                    <div className="text-right">
                      <Sparkles className="w-8 h-8 text-primary/60 mb-2" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="space-y-3">
              <Button
                onClick={handleSubmitDOB}
                disabled={!date || loading}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white h-14 font-semibold text-base rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Star className="w-5 h-5 mr-2" fill="currentColor" />
                {loading ? 'Discovering your destiny...' : 'Reveal My Prediction'}
              </Button>

              {!date && (
                <p className="text-xs text-muted-foreground text-center">
                  Select your birth date to continue
                </p>
              )}
            </div>

            <Button
              variant="ghost"
              onClick={() => {
                localStorage.removeItem('userId')
                router.push('/')
              }}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              Change Account
            </Button>
          </div>
        </Card>

        <p className="text-xs text-center text-muted-foreground mt-4">
          ✨ Your cosmic journey begins with understanding your birth moment
        </p>
      </div>
    </div>
  )
}
