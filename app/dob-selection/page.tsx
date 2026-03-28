'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { format, differenceInYears } from 'date-fns'
import { CalendarIcon, Star, Sparkles, Moon, Sun, Compass } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#fafaf9] p-4 text-slate-800">
      {/* Mystical Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/light_astrology_bg.png"
          alt="Astrology Background"
          fill
          priority
          className="object-cover opacity-60 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#fafaf9] via-[#fafaf9]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#fafaf9]/80 via-transparent to-[#fafaf9]/80" />
      </div>

      {/* Large Side Ornaments - Right */}
      <div className="absolute top-[10%] -right-32 w-[600px] h-[600px] z-10 opacity-60 pointer-events-none hidden lg:block">
        <Image
          src="/light_cosmic_accent.png"
          alt="Cosmic Accent"
          fill
          className="object-contain mix-blend-multiply drop-shadow-2xl animate-[spin_80s_linear_infinite]"
        />
      </div>
      
      {/* Large Side Ornaments - Left */}
      <div className="absolute -bottom-20 -left-40 w-[650px] h-[650px] z-10 opacity-50 pointer-events-none hidden lg:block">
        <Image
          src="/light_cosmic_accent.png"
          alt="Cosmic Accent"
          fill
          className="object-contain mix-blend-multiply drop-shadow-xl animate-[spin_60s_linear_infinite_reverse]"
        />
      </div>

      {/* Subtle Background Icons to fill remaining vertical gaps */}
      <Moon 
        strokeWidth={0.5} 
        className="absolute left-16 top-32 w-72 h-72 text-primary/5 -rotate-12 pointer-events-none hidden xl:block" 
      />
      <Sun 
        strokeWidth={0.5} 
        className="absolute right-24 bottom-24 w-80 h-80 text-secondary/5 rotate-45 pointer-events-none hidden xl:block animate-[pulse_10s_ease-in-out_infinite]" 
      />
      <Star 
        strokeWidth={0.5} 
        className="absolute left-1/4 bottom-10 w-48 h-48 text-amber-500/5 rotate-12 pointer-events-none hidden xl:block" 
      />

      <div className="relative z-20 w-full max-w-lg mt-12 py-8">
        <div className="text-center mb-10 space-y-4">
          <div className="flex justify-center items-center gap-4 mb-2">
            <Moon className="w-8 h-8 text-primary/80 animate-[pulse_3s_ease-in-out_infinite]" strokeWidth={1.5} />
            <div className="relative">
              <Star className="w-14 h-14 text-amber-500 animate-[spin_10s_linear_infinite]" fill="currentColor" />
              <div className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full" />
            </div>
            <Sun className="w-8 h-8 text-secondary/80 animate-[pulse_4s_ease-in-out_infinite]" strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-slate-800 to-secondary drop-shadow-sm">
            Cosmic Alignment
          </h1>
          <p className="text-lg text-slate-600 font-medium max-w-[80%] mx-auto drop-shadow-sm">
            Discover the celestial forces present at your exact moment of birth
          </p>
        </div>

        <Card className="relative block border-black/5 bg-white/40 backdrop-blur-2xl p-1 mb-8 rounded-[2rem] shadow-[0_0_50px_-12px] shadow-primary/20 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
          
          <div className="relative bg-white/70 backdrop-blur-3xl rounded-[1.9rem] p-8 space-y-8 h-full border border-black/5 disabled-text-selection">
            {/* Calendar Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-2 text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary/90 to-secondary/90 uppercase tracking-widest drop-shadow-sm">
                <Compass className="w-4 h-4 text-primary" />
                Select Your Earthly Arrival
                <Compass className="w-4 h-4 text-secondary" />
              </div>

              <div className="relative group/calendar">
                <div className="absolute -inset-1 bg-gradient-to-b from-primary/20 to-secondary/20 rounded-3xl blur opacity-30 group-hover/calendar:opacity-60 transition duration-1000 group-hover/calendar:duration-200" />
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-amber-500/30 shadow-2xl flex justify-center pb-8 pt-4 overflow-hidden">
                  <div className="absolute inset-0 z-0 mix-blend-multiply opacity-90">
                    <Image
                      src="/divine_bg.png"
                      alt="Divine Background"
                      fill
                      className="object-cover scale-110 group-hover/calendar:scale-100 transition-transform duration-[15000ms] ease-out"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/40 z-0 pointer-events-none" />
                  
                  <div className="relative z-10 w-full flex justify-center">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(dateObj) => dateObj > new Date() || dateObj < new Date('1900-01-01')}
                      captionLayout="dropdown"
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                      className="bg-transparent shadow-none [&_div]:bg-transparent [&_table]:bg-transparent [&_button]:h-11 [&_button]:w-11 [&_button]:text-base [&_button]:rounded-full [&_.bg-accent]:bg-primary/20 [&_.bg-accent]:text-primary [&_.bg-accent]:shadow-sm [&_.bg-accent]:font-bold [&_.text-primary]:text-primary [&_.text-primary]:font-bold [&_caption]:text-lg [&_select]:bg-white/90 [&_select]:text-slate-800 [&_select]:border-slate-200 [&_select]:rounded-md font-medium text-slate-900 p-0 drop-shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {date && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="relative p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-white to-secondary/10 border border-primary/10 backdrop-blur-xl group/date overflow-hidden shadow-lg shadow-primary/5">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover/date:scale-150 duration-700" />
                  <div className="flex items-center justify-between gap-4 relative z-10">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-secondary" /> 
                        Your Celestial Code
                      </p>
                      <p className="text-4xl font-extrabold text-slate-800 mb-2 drop-shadow-sm">
                        {format(date, 'MMMM d')}
                      </p>
                      <p className="text-base text-slate-600 font-medium mb-3 flex items-center gap-2">
                        {format(date, 'EEEE')}, <span className="text-primary">{format(date, 'yyyy')}</span>
                      </p>
                      <div className="inline-flex py-1 px-3 rounded-full bg-primary/5 border border-primary/10 text-xs font-bold text-secondary shadow-inner">
                        Orbiting for {getAge(date)} years
                      </div>
                    </div>
                    <div className="text-right flex items-center justify-center p-4 bg-white rounded-full border border-primary/10 shadow-md">
                      <Star className="w-10 h-10 text-amber-400 drop-shadow-sm" fill="currentColor" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="space-y-4 pt-4 relative z-10">
              <Button
                onClick={handleSubmitDOB}
                disabled={!date || loading}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary via-accent to-secondary text-white h-16 font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-secondary/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white/40"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <Sparkles className="w-6 h-6 animate-spin" />
                      Consulting the Stars...
                    </>
                  ) : (
                    <>
                      <Moon className="w-5 h-5 fill-white/80" />
                      Reveal My Destiny
                      <Sun className="w-5 h-5 fill-white/80" />
                    </>
                  )}
                </span>
              </Button>

              {!date && (
                <p className="text-sm font-medium text-slate-500 text-center flex items-center justify-center gap-2">
                  <Star className="w-3 h-3 text-amber-400/70" /> Connect with your birth moment <Star className="w-3 h-3 text-amber-400/70" />
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-black/5">
              <Button
                variant="ghost"
                onClick={() => {
                  localStorage.removeItem('userId')
                  router.push('/')
                }}
                className="w-full text-slate-500 hover:text-slate-800 hover:bg-black/5 rounded-xl text-sm font-medium"
              >
                Sign in as another soul
              </Button>
            </div>
          </div>
        </Card>

        <p className="text-sm flex items-center justify-center gap-2 text-center text-slate-500 font-medium">
          <Sparkles className="w-4 h-4 text-amber-400/60" /> 
          Your cosmic journey begins with your moment of arrival 
          <Sparkles className="w-4 h-4 text-amber-400/60" />
        </p>
      </div>
    </div>
  )
}

