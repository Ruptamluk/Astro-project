'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Coins, Sparkles, Zap } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

interface TokenPack {
  tokens: number
  price: number
  label: string
  badge?: string
  icon: React.ReactNode
}

const TOKEN_PACKS: TokenPack[] = [
  { tokens: 1, price: 49,  label: 'Starter', icon: <Coins className="w-5 h-5" /> },
  { tokens: 5, price: 199, label: 'Popular', badge: 'Best Value', icon: <Sparkles className="w-5 h-5" /> },
  { tokens: 10, price: 349, label: 'Pro',     badge: 'Save 29%', icon: <Zap className="w-5 h-5" /> },
]

interface Props {
  open: boolean
  onClose: () => void
  userId: string
  userName?: string
  userEmail?: string
  onTokensAdded: (newBalance: number) => void
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any
  }
}

export default function PaymentModal({ open, onClose, userId, userName, userEmail, onTokensAdded }: Props) {
  const [loading, setLoading] = useState<number | null>(null)

  useEffect(() => {
    if (document.getElementById('razorpay-script')) return
    const script = document.createElement('script')
    script.id = 'razorpay-script'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  const handleBuy = async (pack: TokenPack) => {
    if (!window.Razorpay) {
      toast.error('Payment gateway not loaded. Please try again.')
      return
    }

    setLoading(pack.tokens)
    try {
      const res = await fetch(`${API_BASE}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, token_pack: pack.tokens }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Failed to create order')
      }

      const { order_id, amount, currency, key_id } = await res.json()

      const rzp = new window.Razorpay({
        key: key_id,
        amount,
        currency,
        order_id,
        name: 'Astro Insights',
        description: `${pack.tokens} Insight Token${pack.tokens > 1 ? 's' : ''}`,
        prefill: { name: userName || '', email: userEmail || '' },
        theme: { color: '#7c3aed' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verifyRes = await fetch(`${API_BASE}/api/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: userId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                token_pack: pack.tokens,
              }),
            })

            if (!verifyRes.ok) throw new Error('Payment verification failed')

            const { tokens } = await verifyRes.json()
            onTokensAdded(tokens)
            toast.success(`${pack.tokens} token${pack.tokens > 1 ? 's' : ''} added!`)
            onClose()
          } catch {
            toast.error('Payment verification failed. Contact support.')
          }
        },
        modal: { ondismiss: () => setLoading(null) },
      })

      rzp.open()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl border-violet-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Coins className="w-5 h-5 text-violet-600" />
            Unlock Deep Insights
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Purchase insight tokens to access your detailed numerology analysis — Strength, Gochor, DOB Chart, Yog & Dashas.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 mt-2">
          {TOKEN_PACKS.map((pack) => (
            <div
              key={pack.tokens}
              className="relative flex items-center justify-between rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50 p-4 hover:border-violet-300 transition-colors"
            >
              {pack.badge && (
                <span className="absolute -top-2.5 right-4 rounded-full bg-violet-600 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                  {pack.badge}
                </span>
              )}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  {pack.icon}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{pack.label}</p>
                  <p className="text-sm text-slate-500">
                    {pack.tokens} token{pack.tokens > 1 ? 's' : ''} · ₹{Math.round(pack.price / pack.tokens)}/token
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-5"
                disabled={loading !== null}
                onClick={() => handleBuy(pack)}
              >
                {loading === pack.tokens ? 'Processing…' : `₹${pack.price}`}
              </Button>
            </div>
          ))}
        </div>

        <p className="mt-2 text-center text-xs text-slate-400">
          Secured by Razorpay · Tokens never expire
        </p>
      </DialogContent>
    </Dialog>
  )
}
