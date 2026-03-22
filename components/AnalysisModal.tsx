'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, Star, Zap, Heart, Brain } from 'lucide-react'

interface Analysis {
  title: string
  personality: string
  career: string
  love: string
  strength: string
  challenge: string
}

interface AnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  driverNumber: number
  conductorNumber: number
  strengthNumber: number
  analysis: Analysis
  gochor: string
}

export function AnalysisModal({
  isOpen,
  onClose,
  driverNumber,
  conductorNumber,
  strengthNumber,
  analysis,
  gochor,
}: AnalysisModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border-primary/20 bg-card shadow-2xl rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 px-8 py-6 border-b border-primary/20 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Star className="w-8 h-8 text-primary" fill="currentColor" />
            {analysis.title}
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="rounded-full"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="p-8 space-y-8">
          {/* Numerology Numbers Summary */}
          <div className="grid grid-cols-3 gap-4">
            {/* Driver */}
            <div className="bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl p-6 border border-primary/30 text-center">
              <p className="text-sm font-semibold text-muted-foreground uppercase mb-2">Driver Number</p>
              <p className="text-4xl font-bold text-primary mb-2">{driverNumber}</p>
              <p className="text-xs text-muted-foreground">Birth Day</p>
            </div>

            {/* Conductor */}
            <div className="bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-xl p-6 border border-secondary/30 text-center">
              <p className="text-sm font-semibold text-muted-foreground uppercase mb-2">Conductor Number</p>
              <p className="text-4xl font-bold text-secondary mb-2">{conductorNumber}</p>
              <p className="text-xs text-muted-foreground">Life Path</p>
            </div>

            {/* Strength */}
            <div className="bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl p-6 border border-accent/30 text-center">
              <p className="text-sm font-semibold text-muted-foreground uppercase mb-2">Strength Number</p>
              <p className="text-4xl font-bold text-accent mb-2">{strengthNumber}</p>
              <p className="text-xs text-muted-foreground">Combined Power</p>
            </div>
          </div>

          {/* Gochor */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/20">
            <p className="text-sm font-semibold text-muted-foreground uppercase mb-2">Gochor (Cosmic Indicator)</p>
            <p className="text-lg font-semibold text-foreground">{gochor}</p>
          </div>

          {/* Personality */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold text-foreground">Personality & Nature</h3>
            </div>
            <p className="text-foreground/90 leading-relaxed bg-input/30 p-4 rounded-lg">
              {analysis.personality}
            </p>
          </div>

          {/* Career */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-secondary" />
              <h3 className="text-xl font-bold text-foreground">Career & Profession</h3>
            </div>
            <p className="text-foreground/90 leading-relaxed bg-input/30 p-4 rounded-lg">
              {analysis.career}
            </p>
          </div>

          {/* Love & Relationships */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-accent" fill="currentColor" />
              <h3 className="text-xl font-bold text-foreground">Love & Relationships</h3>
            </div>
            <p className="text-foreground/90 leading-relaxed bg-input/30 p-4 rounded-lg">
              {analysis.love}
            </p>
          </div>

          {/* Strengths & Challenges */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800/30">
              <p className="text-sm font-semibold text-green-900 dark:text-green-300 uppercase mb-2">Key Strengths</p>
              <p className="text-foreground">
                {analysis.strength}
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800/30">
              <p className="text-sm font-semibold text-orange-900 dark:text-orange-300 uppercase mb-2">Challenges to Address</p>
              <p className="text-foreground">
                {analysis.challenge}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg py-6 text-lg font-semibold"
          >
            Close Analysis
          </Button>
        </div>
      </Card>
    </div>
  )
}
