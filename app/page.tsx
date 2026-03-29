'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, Mail, Phone } from 'lucide-react'
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
        body: JSON.stringify(
          contactMethod === 'email'
            ? { email }
            : { phone }
        ),
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
        body: JSON.stringify(
          contactMethod === 'email'
            ? { email, otp }
            : { phone, otp }
        ),
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10 p-4 sm:p-6">
      {/* Background cosmic effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-48 h-48 sm:w-72 sm:h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-64 h-64 sm:w-96 sm:h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-4">
            <Star className="w-12 h-12 text-primary" fill="currentColor" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Celestial Destiny</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Unlock your cosmic predictions</p>
        </div>

        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full grid grid-cols-2 rounded-t-lg">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <div className="p-4 sm:p-6">
              <TabsContent value="login" className="space-y-6">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Enter your registered email or phone to login
                  </p>
                  {step === 'request' ? (
                    <>
                      <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <Button
                          type="button"
                          variant={contactMethod === 'email' ? 'default' : 'outline'}
                          onClick={() => setContactMethod('email')}
                          className="flex-1 gap-2"
                        >
                          <Mail className="w-4 h-4" />
                          Email
                        </Button>
                        <Button
                          type="button"
                          variant={contactMethod === 'phone' ? 'default' : 'outline'}
                          onClick={() => setContactMethod('phone')}
                          className="flex-1 gap-2"
                        >
                          <Phone className="w-4 h-4" />
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
                      <p className="text-sm text-muted-foreground text-center">
                        OTP sent to {contactMethod === 'email' ? email : phone}
                      </p>
                      <form onSubmit={handleVerifyOTP} className="space-y-4">
                        <Input
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                          className="bg-input text-center text-xl sm:text-2xl tracking-[0.35em] sm:tracking-widest"
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
                <p className="text-sm text-muted-foreground text-center">
                  Create a new account with your email or phone - verify with OTP to get started
                </p>
                <div className="space-y-4">
                  {step === 'request' ? (
                    <>
                      <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <Button
                          type="button"
                          variant={contactMethod === 'email' ? 'default' : 'outline'}
                          onClick={() => setContactMethod('email')}
                          className="flex-1 gap-2"
                        >
                          <Mail className="w-4 h-4" />
                          Email
                        </Button>
                        <Button
                          type="button"
                          variant={contactMethod === 'phone' ? 'default' : 'outline'}
                          onClick={() => setContactMethod('phone')}
                          className="flex-1 gap-2"
                        >
                          <Phone className="w-4 h-4" />
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
                      <p className="text-sm text-muted-foreground text-center">
                        OTP sent to {contactMethod === 'email' ? email : phone}
                      </p>
                      <form onSubmit={handleVerifyOTP} className="space-y-4">
                        <Input
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                          className="bg-input text-center text-xl sm:text-2xl tracking-[0.35em] sm:tracking-widest"
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

        <p className="text-xs text-center text-muted-foreground mt-4">
          🌙 Demo Mode: OTPs will be logged to the console
        </p>
      </div>
    </div>
  )
}
