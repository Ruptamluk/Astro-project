'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mail, Phone } from 'lucide-react'
import { toast } from 'sonner'

export default function AuthPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('login')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'request' | 'verify'>('request')
  const [otp, setOtp] = useState('')
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email')

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setStep('request')
    setEmail('')
    setPhone('')
    setOtp('')
  }

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (contactMethod === 'email' && !email) {
      toast.error('Please enter email')
      return
    }
    if (contactMethod === 'phone' && !phone) {
      toast.error('Please enter phone number')
      return
    }

    setLoading(true)
    try {
      const endpoint = activeTab === 'register' ? '/api/auth/register' : '/api/auth/login'
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactMethod === 'email' ? { email } : { phone }),
      })

      const data = await response.json()
      if (response.ok) {
        toast.success(data.message)
        setStep('verify')
      } else {
        toast.error(data.detail || 'Failed to send OTP')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp) {
      toast.error('Please enter OTP')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactMethod === 'email' ? { email, otp } : { phone, otp }),
      })

      const data = await response.json()
      if (response.ok) {
        localStorage.setItem('userId', data.user.id)
        toast.success('Login successful!')
        router.push('/dob-selection')
      } else {
        toast.error(data.detail || 'Invalid OTP')
      }
    } catch (error) {
      console.error('Error:', error)
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

            <div>
              <Card className="border-primary/20 bg-card/70 shadow-2xl backdrop-blur-xl lg:h-full">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 rounded-t-lg">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  <div className="p-4 sm:p-6">
                    <TabsContent value="login" className="space-y-6">
                      <div className="space-y-4">
                        <p className="text-center text-sm text-muted-foreground">
                          Enter your registered email or phone to login
                        </p>
                        {step === 'request' ? (
                          <>
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                              <Button
                                type="button"
                                variant={contactMethod === 'email' ? 'default' : 'outline'}
                                onClick={() => setContactMethod('email')}
                                className="flex-1 gap-2"
                              >
                                <Mail className="h-4 w-4" />
                                Email
                              </Button>
                              <Button
                                type="button"
                                variant={contactMethod === 'phone' ? 'default' : 'outline'}
                                onClick={() => setContactMethod('phone')}
                                className="flex-1 gap-2"
                              >
                                <Phone className="h-4 w-4" />
                                Phone
                              </Button>
                            </div>

                            <form onSubmit={handleRequestOTP} className="space-y-4">
                              {contactMethod === 'email' ? (
                                <Input
                                  type="email"
                                  placeholder="Enter your email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  className="bg-input"
                                />
                              ) : (
                                <Input
                                  type="tel"
                                  placeholder="+1 (555) 000-0000"
                                  value={phone}
                                  onChange={(e) => setPhone(e.target.value)}
                                  className="bg-input"
                                />
                              )}
                              <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90"
                                disabled={loading}
                              >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                              </Button>
                            </form>
                          </>
                        ) : (
                          <>
                            <p className="text-center text-sm text-muted-foreground">
                              OTP sent to {contactMethod === 'email' ? email : phone}
                            </p>
                            <form onSubmit={handleVerifyOTP} className="space-y-4">
                              <Input
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                                className="bg-input text-center text-xl tracking-[0.35em] sm:text-2xl sm:tracking-widest"
                                maxLength={6}
                              />
                              <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90"
                                disabled={loading}
                              >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                className="w-full"
                                onClick={() => {
                                  setStep('request')
                                  setOtp('')
                                }}
                              >
                                Back
                              </Button>
                            </form>
                          </>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="register" className="space-y-6">
                      <p className="text-center text-sm text-muted-foreground">
                        Create a new account with your email or phone - verify with OTP to get started
                      </p>
                      <div className="space-y-4">
                        {step === 'request' ? (
                          <>
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
                              <Button
                                type="button"
                                variant={contactMethod === 'email' ? 'default' : 'outline'}
                                onClick={() => setContactMethod('email')}
                                className="flex-1 gap-2"
                              >
                                <Mail className="h-4 w-4" />
                                Email
                              </Button>
                              <Button
                                type="button"
                                variant={contactMethod === 'phone' ? 'default' : 'outline'}
                                onClick={() => setContactMethod('phone')}
                                className="flex-1 gap-2"
                              >
                                <Phone className="h-4 w-4" />
                                Phone
                              </Button>
                            </div>

                            <form onSubmit={handleRequestOTP} className="space-y-4">
                              {contactMethod === 'email' ? (
                                <Input
                                  type="email"
                                  placeholder="Enter your email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  className="bg-input"
                                />
                              ) : (
                                <Input
                                  type="tel"
                                  placeholder="+1 (555) 000-0000"
                                  value={phone}
                                  onChange={(e) => setPhone(e.target.value)}
                                  className="bg-input"
                                />
                              )}
                              <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90"
                                disabled={loading}
                              >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                              </Button>
                            </form>
                          </>
                        ) : (
                          <>
                            <p className="text-center text-sm text-muted-foreground">
                              OTP sent to {contactMethod === 'email' ? email : phone}
                            </p>
                            <form onSubmit={handleVerifyOTP} className="space-y-4">
                              <Input
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                                className="bg-input text-center text-xl tracking-[0.35em] sm:text-2xl sm:tracking-widest"
                                maxLength={6}
                              />
                              <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90"
                                disabled={loading}
                              >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                className="w-full"
                                onClick={() => {
                                  setStep('request')
                                  setOtp('')
                                }}
                              >
                                Back
                              </Button>
                            </form>
                          </>
                        )}
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </Card>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground lg:ml-auto lg:w-[460px]">
            Demo Mode: OTPs will be logged to the console
          </p>
        </div>
      </div>
    </div>
  )
}
