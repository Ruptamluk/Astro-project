'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Lock, Mail, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { adminApi, setAdminSession } from '@/lib/adminApi'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Enter email and password')
      return
    }
    setLoading(true)
    try {
      const data = await adminApi.login(email, password)
      setAdminSession(data.token, data.admin)
      toast.success('Welcome back')
      router.push('/admin')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 px-4 py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl sm:h-72 sm:w-72" />
        <div className="absolute bottom-20 left-20 h-64 w-64 rounded-full bg-secondary/10 blur-3xl sm:h-96 sm:w-96" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[80vh] w-full max-w-md items-center justify-center">
        <Card className="w-full border-black/5 bg-white/60 p-8 backdrop-blur-2xl rounded-[2rem] shadow-[0_0_50px_-12px] shadow-primary/20">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-600 to-indigo-700 text-white">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-700 bg-clip-text text-2xl font-bold text-transparent">
              Admin Portal
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to manage tokens & users</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  autoComplete="username"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  autoComplete="current-password"
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
