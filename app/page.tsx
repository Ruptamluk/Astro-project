'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mail, Phone, User } from 'lucide-react'
import { toast } from 'sonner'

export default function AuthPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'request' | 'verify'>('request')
  const [loading, setLoading] = useState(false)

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setStep('request')
    setName('')
    setEmail('')
    setPhone('')
    setOtp('')
  }

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (activeTab === 'register') {
      if (!name.trim()) { toast.error('Please enter your name'); return }
      if (!email) { toast.error('Please enter your email'); return }
      if (!phone) { toast.error('Please enter your mobile number'); return }
    } else {
      if (!email) { toast.error('Please enter your email'); return }
    }

    setLoading(true)
    try {
      const endpoint = activeTab === 'register' ? '/api/auth/register' : '/api/auth/login'
      const body = activeTab === 'register'
        ? { name: name.trim(), email, phone }
        : { email }

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      if (response.ok) {
        toast.success(data.message)
        setStep('verify')
      } else {
        toast.error(data.detail || 'Failed to send OTP')
      }
    } catch {
      toast.error('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp) { toast.error('Please enter OTP'); return }

    setLoading(true)
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })
      const data = await response.json()
      if (response.ok) {
        localStorage.setItem('userId', data.user.id)
        toast.success('Login successful!')
        router.push(data.user.dob ? '/prediction' : '/dob-selection')
      } else {
        toast.error(data.detail || 'Invalid OTP')
      }
    } catch {
      toast.error('Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 px-4 py-6 sm:px-6 sm:py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl sm:h-72 sm:w-72" />
        <div className="absolute bottom-20 left-20 h-64 w-64 rounded-full bg-secondary/10 blur-3xl sm:h-96 sm:w-96" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full items-center justify-center">
        <div className="mx-auto w-fit max-w-full">
          <div className="grid items-center gap-8 lg:grid-cols-[300px_minmax(380px,460px)] lg:items-stretch lg:gap-12">

            {/* Hero image */}
            <div className="flex justify-center lg:justify-end lg:self-stretch">
              <div className="relative w-full max-w-[180px] sm:max-w-[220px] md:max-w-[260px] lg:h-full lg:max-w-[300px]">
                <div className="absolute inset-0 rounded-[2rem] bg-primary/15 blur-3xl" />
                <div className="relative aspect-[2/3] overflow-hidden rounded-[1.75rem] shadow-[0_30px_80px_-30px_rgba(58,28,146,0.35)] lg:h-full lg:aspect-auto">
                  <Image
                    src="/gochor_guru.png"
                    alt="Gochar Guru"
                    width={700}
                    height={1050}
                    priority
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              </div>
            </div>

            {/* Auth card */}
            <div>
              <Card className="border-primary/20 bg-card/70 shadow-2xl backdrop-blur-xl lg:h-full">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 rounded-t-lg">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  <div className="p-4 sm:p-6">

                    {/* ── LOGIN ── */}
                    <TabsContent value="login" className="space-y-6">
                      <p className="text-center text-sm text-muted-foreground">
                        Enter your registered email to login via OTP
                      </p>
                      {step === 'request' ? (
                        <form onSubmit={handleRequestOTP} className="space-y-4">
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="Enter your email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="bg-input pl-10"
                            />
                          </div>
                          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                          </Button>
                        </form>
                      ) : (
                        <>
                          <p className="text-center text-sm text-muted-foreground">
                            OTP sent to <span className="font-medium">{email}</span>
                          </p>
                          <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <Input
                              type="text"
                              placeholder="Enter 6-digit OTP"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              className="bg-input text-center text-xl tracking-[0.35em] sm:text-2xl sm:tracking-widest"
                              maxLength={6}
                            />
                            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                              {loading ? 'Verifying...' : 'Verify OTP'}
                            </Button>
                            <Button type="button" variant="ghost" className="w-full"
                              onClick={() => { setStep('request'); setOtp('') }}>
                              Back
                            </Button>
                          </form>
                        </>
                      )}
                    </TabsContent>

                    {/* ── REGISTER ── */}
                    <TabsContent value="register" className="space-y-6">
                      <p className="text-center text-sm text-muted-foreground">
                        Create your account — OTP will be sent to your email
                      </p>
                      {step === 'request' ? (
                        <form onSubmit={handleRequestOTP} className="space-y-4">
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="text"
                              placeholder="Full name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="bg-input pl-10"
                            />
                          </div>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="email"
                              placeholder="Email address"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="bg-input pl-10"
                            />
                          </div>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="tel"
                              placeholder="Mobile number"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="bg-input pl-10"
                            />
                          </div>
                          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                          </Button>
                        </form>
                      ) : (
                        <>
                          <p className="text-center text-sm text-muted-foreground">
                            OTP sent to <span className="font-medium">{email}</span>
                          </p>
                          <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <Input
                              type="text"
                              placeholder="Enter 6-digit OTP"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              className="bg-input text-center text-xl tracking-[0.35em] sm:text-2xl sm:tracking-widest"
                              maxLength={6}
                            />
                            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                              {loading ? 'Verifying...' : 'Verify OTP'}
                            </Button>
                            <Button type="button" variant="ghost" className="w-full"
                              onClick={() => { setStep('request'); setOtp('') }}>
                              Back
                            </Button>
                          </form>
                        </>
                      )}
                    </TabsContent>

                  </div>
                </Tabs>
              </Card>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
