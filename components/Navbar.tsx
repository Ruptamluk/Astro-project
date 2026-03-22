'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sparkles, LogOut, Home } from 'lucide-react'

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.removeItem('userId')
    localStorage.removeItem('prediction')
    router.push('/')
  }

  const handleHome = () => {
    router.push('/')
  }

  // Don't show navbar on login/register page
  if (pathname === '/') {
    return null
  }

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-background to-background/80 backdrop-blur-md border-b border-primary/20 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleHome}>
          <Sparkles className="w-6 h-6 text-primary" fill="currentColor" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AstroNumerology
          </h1>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleHome}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 text-destructive hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}
