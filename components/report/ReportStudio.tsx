'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FileText, Lock, Star, Coins, Download } from 'lucide-react'
import {
  Prediction, numberCharacteristics, missingNumberAnalysis,
  repeatedNumberNegativeAnalysis, yogDefinitions, DOB_CHART_LAYOUT,
  GAYATRI_MANTRAS, PLANET_YANTRAS, PERSONAL_YEAR_REMEDIES, CRYSTAL_REMEDIES, yogRemedyData,
  getYogRemedyKey, getStrengthNumber, driverNumberProfiles, conductorNumberProfiles,
} from '@/lib/numerology'

interface ReportStudioProps {
  prediction: Prediction
  reportLogoAccess: boolean
  clientName?: string
  clientPhone?: string
  /** When provided, renders the paid logo-unlock CTA (Know More). Omit on the archive. */
  onUnlockLogo?: () => void
  isUnlockingLogo?: boolean
  /** Called after a report is successfully generated, to archive it. Omit on the
   *  archive itself so a re-download doesn't re-save what it just read. */
  onArchive?: () => void
}

export default function ReportStudio({
  prediction,
  reportLogoAccess,
  clientName = '',
  clientPhone = '',
  onUnlockLogo,
  isUnlockingLogo = false,
  onArchive,
}: ReportStudioProps) {
  const [userName, setUserName] = useState<string>('')
  const [userLogo, setUserLogo] = useState<string | null>(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  const strengthNumber =
    prediction.strength_number ?? getStrengthNumber(prediction.dob, prediction.driver_number)

  const driverProfile = driverNumberProfiles[prediction.driver_number]

  const conductorProfile = conductorNumberProfiles[prediction.conductor_number]

  const dobChart = prediction.dob_chart ?? [
    ['', '', ''],
    ['', '', ''],
    ['', '', ''],
  ]

  const presentDobNumbers = new Set(
    dobChart
      .flat()
      .flatMap((cell) => cell.split(''))
      .filter(Boolean)
      .map((digit) => Number(digit))
      .filter((digit) => digit >= 1 && digit <= 9)
  )

  const dobNumberCounts = dobChart
    .flat()
    .flatMap((cell) => cell.split(''))
    .filter(Boolean)
    .reduce<Record<number, number>>((counts, digit) => {
      const parsedDigit = Number(digit)
      if (parsedDigit >= 1 && parsedDigit <= 9) {
        counts[parsedDigit] = (counts[parsedDigit] ?? 0) + 1
      }
      return counts
    }, {})

  const missingDobNumbers = Array.from({ length: 9 }, (_, index) => index + 1).filter(
    (digit) => !presentDobNumbers.has(digit)
  )

  const repeatedNegativeDobNumbers = Array.from({ length: 9 }, (_, index) => index + 1).filter(
    (digit) => (dobNumberCounts[digit] ?? 0) > 2
  )

  const yogResults = yogDefinitions.map((yog) => {
    const active =
      yog.numbers.every((n) => presentDobNumbers.has(n)) &&
      (!yog.missingNumbers || yog.missingNumbers.every((n) => !presentDobNumbers.has(n)))
    return { ...yog, active }
  })
  const activeYogCount = yogResults.filter((y) => y.active).length

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setUserLogo(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleGeneratePdf = async () => {
    if (!reportRef.current || !prediction) return
    setIsGeneratingPdf(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: html2canvas } = await import('html2canvas')
      const el = reportRef.current

      // Make element visible and positioned off-screen for capture
      el.style.display = 'block'
      el.style.position = 'absolute'
      el.style.left = '-9999px'
      el.style.top = '0'
      el.style.width = '794px'

      // Wait two animation frames + extra time for images/fonts to settle
      await new Promise((r) => requestAnimationFrame(r))
      await new Promise((r) => requestAnimationFrame(r))
      await new Promise((r) => setTimeout(r, 300))

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 794,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          // Strip all stylesheets — they contain lab() colors html2canvas can't parse.
          // The report div uses only inline styles so nothing is lost.
          clonedDoc.querySelectorAll('link[rel="stylesheet"], style').forEach((el) => el.remove())
        },
      })

      // Hide again
      el.style.display = 'none'

      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const pdfW = 210  // A4 width in mm
      const imgHeightMm = (canvas.height * pdfW) / canvas.width
      // Single custom-height page — avoids cutting sections across page boundaries
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [pdfW, imgHeightMm] })
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, imgHeightMm)

      pdf.save(`${userName ? userName.replace(/\s+/g, '_') + '_' : ''}numerology_report.pdf`)
      onArchive?.()
    } catch (err) {
      console.error('PDF generation failed:', err)
      alert('PDF generation failed. Please try again.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const handleGenerateDocx = async () => {
    if (!prediction) return
    setIsGeneratingDocx(true)
    try {
      const {
        Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        WidthType, AlignmentType, ShadingType, BorderStyle, ImageRun, VerticalAlign,
      } = await import('docx')

      const reportDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

      // ── styling helpers (mirror the on-screen / PDF report) ──
      type Border = { style: (typeof BorderStyle)[keyof typeof BorderStyle]; size: number; color: string }
      const HP = (px: number) => Math.round(px * 1.5) // px → half-points (TextRun size)
      const NONE: Border = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
      const bd = (color: string, px = 1, dashed = false): Border =>
        ({ style: dashed ? BorderStyle.DASHED : BorderStyle.SINGLE, size: Math.max(4, Math.round(px * 6)), color })
      const noTableBorders = { top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE }
      const SHADE = (fill: string) => ({ type: ShadingType.CLEAR, fill, color: 'auto' as const })

      type RunOpts = { c?: string; b?: boolean; i?: boolean; s?: number }
      const tr = (text: string | number, o: RunOpts = {}) =>
        new TextRun({ text: String(text), color: o.c, bold: o.b, italics: o.i, size: o.s })
      // multi-line text → runs separated by soft line breaks
      const trLines = (text: string, o: RunOpts = {}) =>
        String(text).split('\n').map((ln, i) => new TextRun({ text: ln, color: o.c, bold: o.b, italics: o.i, size: o.s, break: i > 0 ? 1 : 0 }))
      const P = (runs: InstanceType<typeof TextRun>[] | InstanceType<typeof TextRun>, opts: Record<string, unknown> = {}) =>
        new Paragraph({ children: Array.isArray(runs) ? runs : [runs], ...opts })
      const label = (text: string, color: string) =>
        P(tr(text.toUpperCase(), { c: color, b: true, s: HP(10) }), { spacing: { after: 50 } })
      const body = (text: string, color = '475569', s = HP(13)) =>
        P(trLines(text, { c: color, s }), { spacing: { after: 50 } })
      const bullets = (items: string[], color = '475569') =>
        items.map((it) => P(tr(it, { c: color, s: HP(12) }), { bullet: { level: 0 }, spacing: { after: 30 } }))

      const out: (InstanceType<typeof Paragraph> | InstanceType<typeof Table>)[] = []
      const add = (...els: (InstanceType<typeof Paragraph> | InstanceType<typeof Table>)[]) => { for (const e of els) out.push(e) }
      const spacer = (after = 90) => new Paragraph({ text: '', spacing: { after } })
      // a table must be followed by a paragraph or Word merges adjacent tables
      const addTable = (tbl: InstanceType<typeof Table>) => { out.push(tbl); out.push(spacer()) }

      // section heading with the purple underline used across the report
      // keepNext keeps the heading on the same page as the block that follows it
      const section = (text: string) =>
        new Paragraph({ keepNext: true, spacing: { before: 300, after: 160 }, border: { bottom: { style: BorderStyle.SINGLE, size: 20, color: '7C3AED' } }, children: [tr(text.toUpperCase(), { c: '7C3AED', b: true, s: HP(15) })] })
      // colored heading bar for sub-sections (Strength, Gochor, DOB, Yogs, Dashas…)
      const subBar = (text: string, fill = 'EDE9FE', color = '5B21B6') =>
        new Paragraph({ keepNext: true, shading: SHADE(fill), spacing: { before: 180, after: 90 }, children: [tr(text, { c: color, b: true, s: HP(12) })] })

      // single full-width "card" (colored box with border + padding)
      const card = (fill: string, border: string, kids: (InstanceType<typeof Paragraph> | InstanceType<typeof Table>)[], bw = 1) =>
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: { top: bd(border, bw), bottom: bd(border, bw), left: bd(border, bw), right: bd(border, bw), insideHorizontal: NONE, insideVertical: NONE },
          rows: [new TableRow({ children: [new TableCell({ shading: SHADE(fill), margins: { top: 120, bottom: 120, left: 160, right: 160 }, children: kids })] })],
        })
      // label + body convenience card (used heavily in Remedies)
      const remedyCard = (fill: string, border: string, labelText: string, labelColor: string, text: string, textColor: string) =>
        card(fill, border, [label(labelText, labelColor), body(text, textColor)])

      // a row of equal "stat"/value boxes
      const box = (fill: string, border: string, kids: InstanceType<typeof Paragraph>[], widthPct: number) =>
        new TableCell({ width: { size: widthPct, type: WidthType.PERCENTAGE }, verticalAlign: VerticalAlign.CENTER, shading: SHADE(fill), borders: { top: bd(border), bottom: bd(border), left: bd(border), right: bd(border) }, margins: { top: 110, bottom: 110, left: 110, right: 110 }, children: kids })
      const boxRow = (cells: InstanceType<typeof TableCell>[]) =>
        new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: noTableBorders, rows: [new TableRow({ cantSplit: true, children: cells })] })
      const center = (runs: InstanceType<typeof TextRun>[] | InstanceType<typeof TextRun>, opts: Record<string, unknown> = {}) =>
        P(runs, { alignment: AlignmentType.CENTER, ...opts })

      // ── HEADER (purple band, white text) ──
      const headerLeft: InstanceType<typeof Paragraph>[] = []
      if (userLogo) {
        try {
          const [meta, b64] = userLogo.split(',')
          const mime = /data:(image\/[a-z+]+);/i.exec(meta)?.[1] ?? ''
          const typeMap: Record<string, 'png' | 'jpg' | 'gif' | 'bmp'> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/gif': 'gif', 'image/bmp': 'bmp' }
          const imgType = typeMap[mime.toLowerCase()]
          if (imgType && b64) {
            const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
            headerLeft.push(new Paragraph({ spacing: { after: 60 }, children: [new ImageRun({ type: imgType, data: bytes, transformation: { width: 52, height: 52 } })] }))
          }
        } catch { /* skip logo on failure */ }
      }
      headerLeft.push(P(tr(userName ? `Numerology Report by ${userName}` : 'Numerology Report', { c: 'FFFFFF', b: true, s: HP(20) })))
      const headerRight: InstanceType<typeof Paragraph>[] = []
      if (clientName) headerRight.push(P(tr(clientName, { c: 'FFFFFF', b: true, s: HP(16) }), { alignment: AlignmentType.RIGHT, spacing: { after: 20 } }))
      if (clientPhone) headerRight.push(P(tr(clientPhone, { c: 'E9D5FF', s: HP(12) }), { alignment: AlignmentType.RIGHT, spacing: { after: 20 } }))
      headerRight.push(P(tr(reportDate, { c: 'E9D5FF', s: HP(12) }), { alignment: AlignmentType.RIGHT, spacing: { after: 20 } }))
      headerRight.push(P(tr(`Date of Birth: ${prediction.dob}`, { c: 'E9D5FF', s: HP(11) }), { alignment: AlignmentType.RIGHT }))
      addTable(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE }, borders: noTableBorders,
        rows: [new TableRow({ children: [
          new TableCell({ width: { size: 55, type: WidthType.PERCENTAGE }, verticalAlign: VerticalAlign.CENTER, shading: SHADE('7C3AED'), margins: { top: 200, bottom: 200, left: 220, right: 120 }, children: headerLeft }),
          new TableCell({ width: { size: 45, type: WidthType.PERCENTAGE }, verticalAlign: VerticalAlign.CENTER, shading: SHADE('7C3AED'), margins: { top: 200, bottom: 200, left: 120, right: 220 }, children: headerRight }),
        ] })],
      }))

      // ── PREDICTION SUMMARY ──
      add(section('Prediction Summary'))
      const sacred = [
        { label: 'Driver Number', value: prediction.driver_number, fill: 'F5F3FF', border: 'C4B5FD', color: '7C3AED' },
        { label: 'Conductor Number', value: prediction.conductor_number, fill: 'FDF4FF', border: 'E879F9', color: 'C026D3' },
        { label: 'Personal Year', value: prediction.personal_year, fill: 'EEF2FF', border: 'A5B4FC', color: '4F46E5' },
        { label: 'Lucky Number', value: prediction.lucky_number ?? '—', fill: 'F0FDF4', border: '6EE7B7', color: '059669' },
      ]
      addTable(boxRow(sacred.map((s) => box(s.fill, s.border, [
        center(tr(s.label.toUpperCase(), { c: '64748B', b: true, s: HP(9) }), { spacing: { after: 60 } }),
        center(tr(s.value, { c: s.color, b: true, s: HP(26) })),
      ], 25))))

      const luckyText = Array.isArray(prediction.lucky_color) ? prediction.lucky_color.join(', ') : (prediction.lucky_color ?? '—')
      const colorCells = [box('F0FDF4', '86EFAC', [
        label(Array.isArray(prediction.lucky_color) ? 'Lucky Colors' : 'Lucky Color', '15803D'),
        P(tr(luckyText, { c: '166534', b: true, s: HP(14) })),
      ], prediction.unlucky_color ? 50 : 100)]
      if (prediction.unlucky_color) {
        const unluckyText = Array.isArray(prediction.unlucky_color) ? prediction.unlucky_color.join(', ') : prediction.unlucky_color
        colorCells.push(box('FFF1F2', 'FCA5A5', [
          label(Array.isArray(prediction.unlucky_color) ? 'Unlucky Colors' : 'Unlucky Color', 'BE123C'),
          P(tr(unluckyText, { c: '9F1239', b: true, s: HP(14) })),
        ], 50))
      }
      addTable(boxRow(colorCells))

      const charKids = [label('Numerology Characteristics', '5B21B6'),
        P([tr(`Driver (${prediction.driver_number}): `, { c: '7C3AED', b: true, s: HP(12) }), tr(numberCharacteristics[prediction.driver_number] || '—', { c: '475569', s: HP(13) })], { spacing: { after: 40 } })]
      if (prediction.driver_number !== prediction.conductor_number) {
        charKids.push(P([tr(`Conductor (${prediction.conductor_number}): `, { c: 'C026D3', b: true, s: HP(12) }), tr(numberCharacteristics[prediction.conductor_number] || '—', { c: '475569', s: HP(13) })]))
      }
      addTable(card('F8F7FF', 'DDD6FE', charKids))

      if (driverProfile) {
        add(subBar(`Driver Number Insights — ${prediction.driver_number} (${driverProfile.planet})`))
        addTable(card('F0FDF4', '86EFAC', [label('Strengths', '15803D'), ...bullets(driverProfile.strengths, '166534')]))
        addTable(card('FFF1F2', 'FCA5A5', [label('Weaknesses', 'BE123C'), ...bullets(driverProfile.weaknesses, '9F1239')]))
        addTable(card('EEF2FF', 'A5B4FC', [label('Suitable Careers', '4338CA'), ...bullets(driverProfile.careers, '312E81')]))
        addTable(card('EFF6FF', 'BFDBFE', [label('Advice', '1D4ED8'), ...bullets(driverProfile.advice, '1E40AF')]))
      }

      if (conductorProfile) {
        add(subBar(`Conductor Number Insights — ${prediction.conductor_number} (${conductorProfile.planet})`))
        addTable(card('FDF4FF', 'E879F9', [
          label('Overview', 'C026D3'),
          ...bullets(conductorProfile.paragraphs, '86198F'),
        ]))
      }

      if (prediction.analysis) {
        add(subBar('Driver–Conductor Analysis'))
        if (typeof prediction.analysis === 'object') {
          if (prediction.analysis.positive) addTable(remedyCard('F0FDF4', '86EFAC', 'Positive', '15803D', prediction.analysis.positive, '166534'))
          if (prediction.analysis.negative) addTable(remedyCard('FFF1F2', 'FCA5A5', 'Challenges', 'BE123C', prediction.analysis.negative, '9F1239'))
          if (prediction.analysis.advice) addTable(remedyCard('EFF6FF', 'BFDBFE', 'Advice', '1D4ED8', prediction.analysis.advice, '1E40AF'))
        } else {
          addTable(card('FFFFFF', 'DDD6FE', [body(String(prediction.analysis))]))
        }
      }

      // ── DEEP INSIGHTS ──
      add(section('Deep Numerology Insights'))

      {
        const kids = [P(tr(`Strength Number: ${strengthNumber}`, { c: '5B21B6', b: true, s: HP(13) }), { spacing: { after: 60 } })]
        if (prediction.strength_prediction) kids.push(body(prediction.strength_prediction))
        if (prediction.strength_remedy) kids.push(P([tr('Remedy: ', { c: '5B21B6', b: true, s: HP(13) }), tr(prediction.strength_remedy, { c: '475569', s: HP(13) })]))
        addTable(card('F5F3FF', 'DDD6FE', kids))
      }

      if (prediction.gochor_number != null) {
        const kids = [P(tr(`Gochor Number: ${prediction.gochor_number}`, { c: '86198F', b: true, s: HP(13) }), { spacing: { after: 60 } })]
        if (prediction.gochor_prediction) kids.push(body(prediction.gochor_prediction))
        if (prediction.gochor_remedy) kids.push(P([tr('Remedy: ', { c: '86198F', b: true, s: HP(13) }), tr(prediction.gochor_remedy, { c: '475569', s: HP(13) })]))
        addTable(card('FDF4FF', 'F5D0FE', kids))
      }

      // Vedic DOB Chart
      add(subBar('Vedic DOB Chart'))
      const dobGrid = new Table({
        width: { size: 62, type: WidthType.PERCENTAGE }, borders: noTableBorders,
        rows: dobChart.map((row, ri) => new TableRow({ children: row.map((c, ci) => {
          const present = !!c
          return new TableCell({
            width: { size: 33, type: WidthType.PERCENTAGE }, verticalAlign: VerticalAlign.CENTER, shading: SHADE(present ? 'FFFFFF' : 'FAF5FF'),
            borders: { top: bd(present ? 'C4B5FD' : 'DDD6FE', 2, !present), bottom: bd(present ? 'C4B5FD' : 'DDD6FE', 2, !present), left: bd(present ? 'C4B5FD' : 'DDD6FE', 2, !present), right: bd(present ? 'C4B5FD' : 'DDD6FE', 2, !present) },
            margins: { top: 80, bottom: 80, left: 40, right: 40 },
            children: [center(tr(DOB_CHART_LAYOUT[ri][ci], { c: 'A78BFA', b: true, s: HP(9) }), { spacing: { after: 20 } }), center(tr(c || '–', { c: present ? '7C3AED' : 'DDD6FE', b: true, s: HP(18) }))],
          })
        }) })),
      })
      // Wrap the grid in a single unsplittable row so the whole 3×3 chart stays on one page
      addTable(new Table({
        width: { size: 62, type: WidthType.PERCENTAGE }, borders: noTableBorders,
        rows: [new TableRow({ cantSplit: true, children: [new TableCell({ borders: { top: NONE, bottom: NONE, left: NONE, right: NONE }, margins: { top: 0, bottom: 0, left: 0, right: 0 }, children: [dobGrid, new Paragraph({ text: '' })] })] })],
      }))
      addTable(boxRow([
        box('EDE9FE', 'C4B5FD', [label('Active Cells', '7C3AED'), P(tr(`${presentDobNumbers.size}/9`, { c: '5B21B6', b: true, s: HP(20) }))], 34),
        box('FFF1F2', 'FECDD3', [label('Missing', 'BE123C'), P(tr(missingDobNumbers.length > 0 ? `${missingDobNumbers.join(', ')} (${missingDobNumbers.length})` : 'None', { c: '9F1239', b: true, s: HP(13) }))], 33),
        box('FEF3C7', 'FDE68A', [label('Repeated (>2×)', '92400E'), P(tr(repeatedNegativeDobNumbers.length > 0 ? `${repeatedNegativeDobNumbers.join(', ')} (${repeatedNegativeDobNumbers.length})` : 'None', { c: '78350F', b: true, s: HP(13) }))], 33),
      ]))
      if (missingDobNumbers.length > 0) {
        add(subBar('Missing Number Analysis', 'EDE9FE', '5B21B6'))
        missingDobNumbers.forEach((d) => addTable(card('FFFFFF', 'DDD6FE', [P([tr(`${d}  `, { c: '7C3AED', b: true, s: HP(14) }), tr(missingNumberAnalysis[d] || '—', { c: '475569', s: HP(13) })])])))
      }
      if (repeatedNegativeDobNumbers.length > 0) {
        add(subBar('Negative Repeat Analysis', 'FFF1F2', 'BE123C'))
        repeatedNegativeDobNumbers.forEach((d) => addTable(card('FFFFFF', 'FECDD3', [P([tr(`${d}  `, { c: 'BE123C', b: true, s: HP(14) }), tr(repeatedNumberNegativeAnalysis[d] || '—', { c: '475569', s: HP(13) })])])))
      }
      if (missingDobNumbers.length === 0 && repeatedNegativeDobNumbers.length === 0) {
        add(P(tr('All numbers present — an exceptionally harmonious chart.', { c: '64748B', i: true, s: HP(13) }), { spacing: { after: 90 } }))
      }

      // Active Yogs
      const activeYogs = yogResults.filter((y) => y.active)
      if (activeYogs.length > 0) {
        add(subBar(`Active Yogs (${activeYogs.length})`, 'FFFBEB', '92400E'))
        activeYogs.forEach((yog) => {
          addTable(card('FFFFFF', 'FDE68A', [
            P(tr(yog.name, { c: '78350F', b: true, s: HP(13) }), { spacing: { after: 30 } }),
            P(tr(`Numbers: ${yog.numbers.join(' – ')}${yog.missingNumbers?.length ? ` (missing: ${yog.missingNumbers.join(', ')})` : ''}`, { c: '92400E', s: HP(11) }), { spacing: { after: 60 } }),
            ...bullets(yog.traits),
          ]))
        })
      }

      // Current Dashas
      if (prediction.current_mahadasha_number != null) {
        add(subBar('Current Dashas'))
        const dashaCells = [box('EDE9FE', 'DDD6FE', [
          label('Mahadasha', '7C3AED'),
          P(tr(prediction.current_mahadasha_number, { c: '5B21B6', b: true, s: HP(28) }), { spacing: { after: 20 } }),
          P(tr(prediction.current_mahadasha_planet ?? '', { c: '5B21B6', b: true, s: HP(13) })),
          ...(prediction.mahadasha_start ? [P(tr(`${prediction.mahadasha_start} → ${prediction.mahadasha_end}`, { c: '64748B', s: HP(11) }))] : []),
        ], prediction.current_antardasha_number != null ? 50 : 100)]
        if (prediction.current_antardasha_number != null) {
          dashaCells.push(box('FDF4FF', 'F5D0FE', [
            label('Antardasha', 'C026D3'),
            P(tr(prediction.current_antardasha_number, { c: '86198F', b: true, s: HP(28) }), { spacing: { after: 20 } }),
            P(tr(prediction.current_antardasha_planet ?? '', { c: '86198F', b: true, s: HP(13) })),
            ...(prediction.antardasha_start ? [P(tr(`${prediction.antardasha_start} → ${prediction.antardasha_end}`, { c: '64748B', s: HP(11) }))] : []),
          ], 50))
        }
        addTable(boxRow(dashaCells))
        if (prediction.dasha_analysis) addTable(card('F5F3FF', 'DDD6FE', [body(prediction.dasha_analysis)]))
      }

      // ── REMEDIES ──
      add(section('Remedies'))
      if (prediction.driver_conductor_remedy) addTable(remedyCard('DCFCE7', '86EFAC', 'Driver-Conductor Remedy', '15803D', prediction.driver_conductor_remedy, '166534'))
      if (prediction.strength_remedy && prediction.strength_remedy !== 'No remedy available yet.') addTable(remedyCard('EDE9FE', 'C4B5FD', 'Strength Number Remedy', '6D28D9', prediction.strength_remedy, '5B21B6'))
      if (prediction.gochor_remedy) addTable(remedyCard('FDF4FF', 'E879F9', 'Gochor Remedy', '86198F', prediction.gochor_remedy, '701A75'))

      const mahaMantra = prediction.current_mahadasha_planet ? GAYATRI_MANTRAS[prediction.current_mahadasha_planet] : undefined
      if (mahaMantra) {
        addTable(card('F5F3FF', 'DDD6FE', [
          label(`Mahadasha Remedy — ${mahaMantra.label}`, '6D28D9'),
          label('Sanskrit Mantra', '7C3AED'),
          P(trLines(mahaMantra.sanskrit, { c: '4C1D95', i: true, s: HP(13) }), { spacing: { after: 80 } }),
          label('Transliteration', '7C3AED'),
          P(trLines(mahaMantra.transliteration, { c: '475569', s: HP(12) }), { spacing: { after: 80 } }),
          label('Benefits', '059669'),
          ...bullets(mahaMantra.benefits),
        ]))
      }

      if (prediction.antardasha_remedy) addTable(remedyCard('FDF4FF', 'F5D0FE', 'Antardasha Remedy', '86198F', prediction.antardasha_remedy, '701A75'))
      if (prediction.mahadasha_remedy) addTable(remedyCard('EFF6FF', 'BFDBFE', 'Mahadasha Guidance', '1D4ED8', prediction.mahadasha_remedy, '1E40AF'))

      const yantra = PLANET_YANTRAS[prediction.driver_number]
      if (yantra) {
        add(subBar(`Yantra — ${yantra.label}`, 'FDF2F8', 'BE185D'))
        addTable(new Table({
          width: { size: 55, type: WidthType.PERCENTAGE }, borders: noTableBorders,
          rows: yantra.grid.map((row, ri) => new TableRow({ children: row.map((num, ci) => {
            const top = ri * 3 + ci < 3
            return new TableCell({ width: { size: 33, type: WidthType.PERCENTAGE }, verticalAlign: VerticalAlign.CENTER, shading: SHADE(top ? 'DB2777' : 'FFFFFF'), borders: { top: bd(top ? 'BE185D' : 'F9A8D4', top ? 2 : 1), bottom: bd(top ? 'BE185D' : 'F9A8D4', top ? 2 : 1), left: bd(top ? 'BE185D' : 'F9A8D4', top ? 2 : 1), right: bd(top ? 'BE185D' : 'F9A8D4', top ? 2 : 1) }, margins: { top: 100, bottom: 100, left: 40, right: 40 }, children: [center(tr(num, { c: top ? 'FFFFFF' : 'BE185D', b: true, s: HP(15) }))] })
          }) })),
        }))
        addTable(card('FDF2F8', 'F9A8D4', [label('Benefits', '059669'), ...bullets(yantra.benefits), label('How to Use', 'D97706'), ...bullets(yantra.howToUse)]))
      }

      if (PERSONAL_YEAR_REMEDIES[prediction.personal_year]) {
        addTable(card('EEF2FF', 'A5B4FC', [label(`Personal Year Remedy — Year ${prediction.personal_year}`, '4338CA'), P(tr(PERSONAL_YEAR_REMEDIES[prediction.personal_year], { c: '312E81', b: true, s: HP(14) }))]))
      }

      const activeYogsWithRemedies = activeYogs
        .map((y) => ({ name: y.name, remedies: yogRemedyData[getYogRemedyKey(y.numbers, y.missingNumbers)] }))
        .filter((y) => y.remedies && y.remedies.length > 0)
      if (activeYogsWithRemedies.length > 0) {
        add(subBar(`Yog Remedies (${activeYogsWithRemedies.length} active yog${activeYogsWithRemedies.length !== 1 ? 's' : ''})`, 'FFFBEB', '92400E'))
        activeYogsWithRemedies.forEach((yog) => {
          addTable(card('FFFFFF', 'FDE68A', [label(yog.name, '78350F'), ...bullets(yog.remedies)]))
        })
      }

      const crystalDigits = missingDobNumbers.filter((d) => CRYSTAL_REMEDIES[d])
      if (crystalDigits.length > 0) {
        add(subBar('Crystal', 'FDF4FF', '86198F'))
        crystalDigits.forEach((digit) => {
          const c = CRYSTAL_REMEDIES[digit]
          addTable(card('FDF4FF', 'F0ABFC', [
            P(tr(c.name, { c: '86198F', b: true, s: HP(13) }), { spacing: { after: 50 } }),
            ...bullets(c.benefits, '701A75'),
            label('Crystal Affirmation — Chant it 5 times in the morning', 'A21CAF'),
            body(`“${c.affirmation}”`, '701A75'),
          ]))
        })
        add(body('As per your chart, we recommend the above crystals for your progress and stability.', '86198F'))
      }

      // ── FOOTER ──
      addTable(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE }, borders: { top: bd('DDD6FE', 2), bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE },
        rows: [new TableRow({ children: [
          new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, shading: SHADE('F5F3FF'), margins: { top: 100, bottom: 100, left: 160, right: 80 }, children: [P(tr(`Generated on ${reportDate}`, { c: '94A3B8', s: HP(11) }))] }),
          new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, shading: SHADE('F5F3FF'), margins: { top: 100, bottom: 100, left: 80, right: 160 }, children: [P(tr('Numerology Report — Confidential', { c: '94A3B8', s: HP(11) }), { alignment: AlignmentType.RIGHT })] }),
        ] })],
      }))

      // ── COMMENTS PAGE (page break + ruled lines for handwritten notes) ──
      out.push(new Paragraph({ pageBreakBefore: true, shading: SHADE('7C3AED'), spacing: { before: 120, after: 60 }, children: [tr('Comments', { c: 'FFFFFF', b: true, s: HP(20) })] }))
      out.push(P(tr('Personal notes & observations', { c: 'E9D5FF', s: HP(12) }), { shading: SHADE('7C3AED'), spacing: { after: 280 } }))
      for (let i = 0; i < 22; i++) {
        out.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'E2E8F0' } }, spacing: { after: 260 }, children: [tr('')] }))
      }

      const doc = new Document({
        sections: [{ properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } }, children: out }],
      })
      const blob = await Packer.toBlob(doc)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${userName ? userName.replace(/\s+/g, '_') + '_' : ''}numerology_report.docx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      onArchive?.()
    } catch (err) {
      console.error('DOCX generation failed:', err)
      alert('DOCX generation failed. Please try again.')
    } finally {
      setIsGeneratingDocx(false)
    }
  }

  return (
    <>
                    <div className="space-y-8 max-w-2xl mx-auto">
                      {/* Personalise card */}
                      <Card className="rounded-[28px] border-violet-100 bg-white/90 overflow-hidden shadow-sm">
                        <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50 px-5 py-4 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-violet-600" />
                          <h2 className="text-lg font-bold text-slate-800">Personalise Your Report</h2>
                        </div>
                        <div className="p-6 space-y-5">
                          {!reportLogoAccess && onUnlockLogo && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-center justify-between gap-4 flex-wrap">
                              <div className="flex items-center gap-3">
                                <Lock className="w-5 h-5 text-amber-500 shrink-0" />
                                <div>
                                  <p className="text-sm font-semibold text-amber-800">Add Logo &amp; Name to Report</p>
                                  <p className="text-xs text-amber-600">Unlock to personalise your PDF header with your name and logo</p>
                                </div>
                              </div>
                              <Button
                                onClick={onUnlockLogo}
                                disabled={isUnlockingLogo}
                                className="shrink-0 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-4 py-2 h-auto disabled:opacity-60"
                              >
                                {isUnlockingLogo ? (
                                  <><Star className="w-4 h-4 mr-1.5 animate-spin" />Processing…</>
                                ) : (
                                  <><Coins className="w-4 h-4 mr-1.5" />Unlock — ₹5,000</>
                                )}
                              </Button>
                            </div>
                          )}
                          {!reportLogoAccess && !onUnlockLogo && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-center gap-3">
                              <Lock className="w-5 h-5 text-amber-500 shrink-0" />
                              <div>
                                <p className="text-sm font-semibold text-amber-800">Name &amp; logo not unlocked</p>
                                <p className="text-xs text-amber-600">Your report will download without a name or logo. Unlock Logo &amp; Name from the Know More section to personalise it.</p>
                              </div>
                            </div>
                          )}
                          <div className={`space-y-2 ${!reportLogoAccess ? 'opacity-40 pointer-events-none select-none' : ''}`}>
                            <label className="text-sm font-semibold text-slate-700" htmlFor="report-name">
                              Your Name <span className="text-slate-400 font-normal">(appears on the report header)</span>
                            </label>
                            <Input
                              id="report-name"
                              placeholder="e.g. Priya Sharma"
                              value={userName}
                              onChange={(e) => setUserName(e.target.value)}
                              className="rounded-xl h-11 border-violet-200 focus-visible:ring-violet-400"
                              disabled={!reportLogoAccess}
                            />
                          </div>
                          <div className={`space-y-2 ${!reportLogoAccess ? 'opacity-40 pointer-events-none select-none' : ''}`}>
                            <label className="text-sm font-semibold text-slate-700" htmlFor="report-logo">
                              Logo or Photo <span className="text-slate-400 font-normal">(optional)</span>
                            </label>
                            <div className="flex items-center gap-4 flex-wrap">
                              <label
                                htmlFor="report-logo"
                                className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-100 transition-colors"
                              >
                                <FileText className="w-4 h-4" />
                                {userLogo ? 'Change Logo' : 'Upload Logo'}
                              </label>
                              <input
                                id="report-logo"
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={handleLogoUpload}
                                disabled={!reportLogoAccess}
                              />
                              {userLogo && (
                                <div className="flex items-center gap-2">
                                  <img
                                    src={userLogo}
                                    alt="Logo preview"
                                    className="h-10 w-10 rounded-lg object-contain border border-violet-100 bg-white p-1"
                                  />
                                  <button
                                    onClick={() => setUserLogo(null)}
                                    className="text-xs text-rose-500 hover:text-rose-700 font-medium"
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-slate-400">Accepted: PNG, JPG, SVG. Max recommended 1 MB.</p>
                          </div>
                        </div>
                      </Card>

                      {/* Preview summary */}
                      <Card className="rounded-[28px] border-slate-100 bg-gradient-to-br from-slate-50 to-violet-50/40 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1.5 h-6 rounded-full bg-violet-500" />
                          <h2 className="text-lg font-bold text-slate-800">Report Preview</h2>
                        </div>
                        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-inner text-sm text-slate-600 space-y-3">
                          <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="font-semibold text-slate-500 uppercase tracking-wide text-xs">Header</span>
                            <span className="text-slate-700">{userLogo ? 'Logo + ' : ''}{userName ? `${userName} · ` : ''}{clientName || '(Client name)'}{clientPhone ? ` · ${clientPhone}` : ''}</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-slate-100">
                            <span className="font-semibold text-slate-500 uppercase tracking-wide text-xs">Page 1</span>
                            <span className="text-slate-700">Driver {prediction.driver_number} · Conductor {prediction.conductor_number} · Year {prediction.personal_year} · Colors · Driver Insights · Analysis</span>
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <span className="font-semibold text-slate-500 uppercase tracking-wide text-xs">Page 2+</span>
                            <span className="text-slate-700">Strength {strengthNumber} · Gochor · DOB Chart · {activeYogCount} Yog{activeYogCount !== 1 ? 's' : ''} · Dashas · Remedies</span>
                          </div>
                        </div>
                      </Card>

                      {/* Generate buttons */}
                      <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button
                          onClick={handleGeneratePdf}
                          disabled={isGeneratingPdf}
                          className="h-13 px-10 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold text-base shadow-lg shadow-violet-300/40 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isGeneratingPdf ? (
                            <>
                              <Star className="w-5 h-5 mr-2 animate-spin" />
                              Generating PDF…
                            </>
                          ) : (
                            <>
                              <Download className="w-5 h-5 mr-2" />
                              Generate &amp; Download PDF
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleGenerateDocx}
                          disabled={isGeneratingDocx}
                          variant="outline"
                          className="h-13 px-10 rounded-2xl border-2 border-violet-300 bg-white text-violet-700 hover:bg-violet-50 font-bold text-base shadow-lg shadow-violet-200/40 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isGeneratingDocx ? (
                            <>
                              <Star className="w-5 h-5 mr-2 animate-spin" />
                              Generating DOCX…
                            </>
                          ) : (
                            <>
                              <Download className="w-5 h-5 mr-2" />
                              Download DOCX
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

      <div
        ref={reportRef}
        style={{
          display: 'none',
          position: 'absolute',
          left: '-9999px',
          top: 0,
          width: '794px',
          backgroundColor: '#ffffff',
          fontFamily: 'Georgia, "Times New Roman", serif',
          color: '#1e293b',
          boxSizing: 'border-box',
        }}
      >
        {prediction && (
          <>
            {/* ── HEADER ── */}
            <div style={{ background: 'linear-gradient(135deg,#7c3aed,#c026d3 55%,#4f46e5)', padding: '28px 40px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody><tr>
                <td style={{ verticalAlign: 'middle' }}>
                  <table style={{ borderCollapse: 'collapse' }}><tbody><tr>
                    {userLogo && (
                      <td style={{ verticalAlign: 'middle', paddingRight: '14px' }}>
                        <img src={userLogo} alt="logo" style={{ height: '56px', width: '56px', objectFit: 'contain', borderRadius: '8px', background: '#fff', padding: '4px', display: 'block' }} />
                      </td>
                    )}
                    <td style={{ verticalAlign: 'middle' }}>
                      <div style={{ color: '#fff', fontSize: userName ? '20px' : '15px', fontWeight: 700, letterSpacing: '0.01em', fontFamily: 'system-ui,sans-serif' }}>
                        {userName ? `Numerology Report by ${userName}` : 'Numerology Report'}
                      </div>
                    </td>
                  </tr></tbody></table>
                </td>
                <td style={{ verticalAlign: 'middle', textAlign: 'right' }}>
                  {clientName && (
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '16px', marginBottom: '3px', fontFamily: 'system-ui,sans-serif' }}>{clientName}</div>
                  )}
                  {clientPhone && (
                    <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', marginBottom: '6px', fontFamily: 'system-ui,sans-serif' }}>{clientPhone}</div>
                  )}
                  <div style={{ color: clientName ? 'rgba(255,255,255,0.65)' : '#fff', fontWeight: clientName ? 400 : 700, fontSize: clientName ? '12px' : '15px', fontFamily: 'system-ui,sans-serif' }}>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', marginTop: '3px', fontFamily: 'system-ui,sans-serif' }}>Date of Birth: {prediction.dob}</div>
                </td>
              </tr></tbody></table>
            </div>

            {/* ── PREDICTION SUMMARY ── */}
            <div style={{ padding: '28px 40px 0' }}>
              <div style={{ borderBottom: '3px solid #7c3aed', paddingBottom: '6px', marginBottom: '20px' }}>
                <span style={{ fontSize: '17px', fontWeight: 700, color: '#7c3aed', fontFamily: 'system-ui,sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Prediction Summary</span>
              </div>

              {/* Sacred Numbers — 4-column table */}
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '8px', marginBottom: '16px' }}><tbody><tr>
                {([
                  { label: 'Driver Number', value: prediction.driver_number, bg: '#f5f3ff', border: '#c4b5fd', color: '#7c3aed' },
                  { label: 'Conductor Number', value: prediction.conductor_number, bg: '#fdf4ff', border: '#e879f9', color: '#c026d3' },
                  { label: 'Personal Year', value: prediction.personal_year, bg: '#eef2ff', border: '#a5b4fc', color: '#4f46e5' },
                  { label: 'Lucky Number', value: prediction.lucky_number, bg: '#f0fdf4', border: '#6ee7b7', color: '#059669' },
                ] as const).map((item) => (
                  <td key={item.label} style={{ width: '25%', background: item.bg, border: `1px solid ${item.border}`, borderRadius: '10px', padding: '14px 10px', textAlign: 'center', verticalAlign: 'middle' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontFamily: 'system-ui,sans-serif' }}>{item.label}</div>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: item.color, lineHeight: 1, fontFamily: 'system-ui,sans-serif' }}>{item.value}</div>
                  </td>
                ))}
              </tr></tbody></table>

              {/* Colors — 2-column table */}
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '8px', marginBottom: '16px' }}><tbody><tr>
                <td style={{ width: '50%', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '12px 16px', verticalAlign: 'top' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'system-ui,sans-serif', marginBottom: '5px' }}>Lucky Color{Array.isArray(prediction.lucky_color) ? 's' : ''}</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#166534', fontFamily: 'system-ui,sans-serif' }}>{Array.isArray(prediction.lucky_color) ? prediction.lucky_color.join(', ') : prediction.lucky_color}</div>
                </td>
                {prediction.unlucky_color && (
                  <td style={{ width: '50%', background: '#fff1f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '12px 16px', verticalAlign: 'top' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#be123c', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'system-ui,sans-serif', marginBottom: '5px' }}>Unlucky Color{Array.isArray(prediction.unlucky_color) ? 's' : ''}</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#9f1239', fontFamily: 'system-ui,sans-serif' }}>{Array.isArray(prediction.unlucky_color) ? prediction.unlucky_color.join(', ') : prediction.unlucky_color}</div>
                  </td>
                )}
              </tr></tbody></table>

              {/* Numerology Characteristics */}
              <div style={{ background: '#f8f7ff', border: '1px solid #ddd6fe', borderRadius: '10px', padding: '14px 18px', marginBottom: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#5b21b6', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'system-ui,sans-serif', marginBottom: '10px' }}>Numerology Characteristics</div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>
                  <tr><td style={{ paddingBottom: '6px', verticalAlign: 'top', width: '140px' }}><span style={{ fontSize: '12px', fontWeight: 700, color: '#7c3aed', fontFamily: 'system-ui,sans-serif' }}>Driver ({prediction.driver_number}):</span></td><td style={{ paddingBottom: '6px', fontSize: '13px', color: '#475569', lineHeight: '1.6', fontFamily: 'system-ui,sans-serif' }}>{numberCharacteristics[prediction.driver_number] || '—'}</td></tr>
                  {prediction.driver_number !== prediction.conductor_number && (
                    <tr><td style={{ verticalAlign: 'top' }}><span style={{ fontSize: '12px', fontWeight: 700, color: '#c026d3', fontFamily: 'system-ui,sans-serif' }}>Conductor ({prediction.conductor_number}):</span></td><td style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', fontFamily: 'system-ui,sans-serif' }}>{numberCharacteristics[prediction.conductor_number] || '—'}</td></tr>
                  )}
                </tbody></table>
              </div>

              {/* Driver Number Insights */}
              {driverProfile && (
                <div style={{ background: '#ffffff', border: '1px solid #ddd6fe', borderRadius: '10px', padding: '14px 18px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#5b21b6', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'system-ui,sans-serif', marginBottom: '12px' }}>
                    Driver Number Insights — {prediction.driver_number} ({driverProfile.planet})
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '8px' }}><tbody>
                    <tr>
                      {([
                        { title: 'Strengths', items: driverProfile.strengths, bg: '#f0fdf4', border: '#86efac', label: '#15803d', text: '#166534' },
                        { title: 'Weaknesses', items: driverProfile.weaknesses, bg: '#fff1f2', border: '#fca5a5', label: '#be123c', text: '#9f1239' },
                      ] as const).map((block) => (
                        <td key={block.title} style={{ width: '50%', background: block.bg, border: `1px solid ${block.border}`, borderRadius: '8px', padding: '10px 14px', verticalAlign: 'top' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: block.label, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'system-ui,sans-serif', marginBottom: '6px' }}>{block.title}</div>
                          {block.items.map((item, index) => (
                            <div key={index} style={{ fontSize: '12px', color: block.text, lineHeight: '1.55', fontFamily: 'system-ui,sans-serif', marginBottom: '3px' }}>• {item}</div>
                          ))}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      {([
                        { title: 'Suitable Careers', items: driverProfile.careers, bg: '#eef2ff', border: '#a5b4fc', label: '#4338ca', text: '#312e81' },
                        { title: 'Advice', items: driverProfile.advice, bg: '#eff6ff', border: '#bfdbfe', label: '#1d4ed8', text: '#1e40af' },
                      ] as const).map((block) => (
                        <td key={block.title} style={{ width: '50%', background: block.bg, border: `1px solid ${block.border}`, borderRadius: '8px', padding: '10px 14px', verticalAlign: 'top' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: block.label, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'system-ui,sans-serif', marginBottom: '6px' }}>{block.title}</div>
                          {block.items.map((item, index) => (
                            <div key={index} style={{ fontSize: '12px', color: block.text, lineHeight: '1.55', fontFamily: 'system-ui,sans-serif', marginBottom: '3px' }}>• {item}</div>
                          ))}
                        </td>
                      ))}
                    </tr>
                  </tbody></table>
                </div>
              )}

              {/* Conductor Number Insights */}
              {conductorProfile && (
                <div style={{ background: '#ffffff', border: '1px solid #ddd6fe', borderRadius: '10px', padding: '14px 18px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#5b21b6', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'system-ui,sans-serif', marginBottom: '12px' }}>
                    Conductor Number Insights — {prediction.conductor_number} ({conductorProfile.planet})
                  </div>
                  <div style={{ background: '#fdf4ff', border: '1px solid #e879f9', borderRadius: '8px', padding: '10px 14px' }}>
                    {conductorProfile.paragraphs.map((paragraph, index) => (
                      <div
                        key={index}
                        style={{
                          fontSize: '12px',
                          color: '#86198f',
                          lineHeight: '1.55',
                          fontFamily: 'system-ui,sans-serif',
                          marginBottom: index === conductorProfile.paragraphs.length - 1 ? 0 : '6px',
                        }}
                      >
                        • {paragraph}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Driver-Conductor Analysis */}
              {prediction.analysis && (
                <div style={{ border: '1px solid #ddd6fe', borderRadius: '10px', padding: '14px 18px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#5b21b6', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'system-ui,sans-serif', marginBottom: '10px' }}>Driver–Conductor Analysis</div>
                  {typeof prediction.analysis === 'object' ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>
                      {prediction.analysis.positive && <tr><td style={{ paddingBottom: '8px', verticalAlign: 'top' }}><div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '10px 14px' }}><span style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', fontFamily: 'system-ui,sans-serif' }}>Positive: </span><span style={{ fontSize: '13px', color: '#166534', lineHeight: '1.6', fontFamily: 'system-ui,sans-serif' }}>{prediction.analysis.positive}</span></div></td></tr>}
                      {prediction.analysis.negative && <tr><td style={{ paddingBottom: '8px', verticalAlign: 'top' }}><div style={{ background: '#fff1f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 14px' }}><span style={{ fontSize: '11px', fontWeight: 700, color: '#be123c', textTransform: 'uppercase', fontFamily: 'system-ui,sans-serif' }}>Challenges: </span><span style={{ fontSize: '13px', color: '#9f1239', lineHeight: '1.6', fontFamily: 'system-ui,sans-serif' }}>{prediction.analysis.negative}</span></div></td></tr>}
                      {prediction.analysis.advice && <tr><td style={{ verticalAlign: 'top' }}><div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px 14px' }}><span style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', fontFamily: 'system-ui,sans-serif' }}>Advice: </span><span style={{ fontSize: '13px', color: '#1e40af', lineHeight: '1.6', fontFamily: 'system-ui,sans-serif' }}>{prediction.analysis.advice}</span></div></td></tr>}
                    </tbody></table>
                  ) : (
                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: 0, fontFamily: 'system-ui,sans-serif' }}>{String(prediction.analysis)}</p>
                  )}
                </div>
              )}
            </div>

            {/* ── DEEP INSIGHTS ── */}
            <div style={{ padding: '20px 40px 32px' }}>
              <div style={{ borderBottom: '3px solid #7c3aed', paddingBottom: '6px', marginBottom: '20px' }}>
                <span style={{ fontSize: '17px', fontWeight: 700, color: '#7c3aed', fontFamily: 'system-ui,sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Deep Numerology Insights</span>
              </div>

              {/* Strength */}
              <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '10px', padding: '16px 18px', marginBottom: '14px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#5b21b6', fontFamily: 'system-ui,sans-serif', marginBottom: '8px' }}>Strength Number: {strengthNumber}</div>
                {prediction.strength_prediction && <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.7', margin: '0 0 6px 0', fontFamily: 'system-ui,sans-serif' }}>{prediction.strength_prediction}</p>}
                {prediction.strength_remedy && <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.7', margin: 0, fontFamily: 'system-ui,sans-serif' }}><strong>Remedy:</strong> {prediction.strength_remedy}</p>}
              </div>

              {/* Gochor */}
              {prediction.gochor_number != null && (
                <div style={{ background: '#fdf4ff', border: '1px solid #f5d0fe', borderRadius: '10px', padding: '16px 18px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#86198f', fontFamily: 'system-ui,sans-serif', marginBottom: '8px' }}>Gochor Number: {prediction.gochor_number}</div>
                  {prediction.gochor_prediction && <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.7', margin: '0 0 6px 0', fontFamily: 'system-ui,sans-serif' }}>{prediction.gochor_prediction}</p>}
                  {prediction.gochor_remedy && <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.7', margin: 0, fontFamily: 'system-ui,sans-serif' }}><strong>Remedy:</strong> {prediction.gochor_remedy}</p>}
                </div>
              )}

              {/* ── VEDIC DOB CHART ── */}
              <div style={{ background: '#f8f7ff', border: '1px solid #ede9fe', borderRadius: '10px', padding: '16px 18px', marginBottom: '14px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#5b21b6', fontFamily: 'system-ui,sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px', borderBottom: '1px solid #ede9fe', paddingBottom: '8px' }}>Vedic DOB Chart</div>

                {/* Grid table + stats side by side using outer table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}><tbody><tr>
                  {/* 3×3 DOB grid as a table */}
                  <td style={{ verticalAlign: 'top', paddingRight: '20px', width: '260px' }}>
                    <table style={{ borderCollapse: 'separate', borderSpacing: '6px' }}><tbody>
                      {dobChart.map((row, ri) => (
                        <tr key={ri}>
                          {row.map((cell, ci) => (
                            <td key={ci} style={{ width: '72px', height: '64px', border: cell ? '2px solid #c4b5fd' : '2px dashed #ddd6fe', borderRadius: '10px', background: cell ? '#ffffff' : '#faf5ff', textAlign: 'center', verticalAlign: 'middle' }}>
                              <div style={{ fontSize: '10px', fontWeight: 600, color: '#a78bfa', fontFamily: 'system-ui,sans-serif', marginBottom: '2px' }}>{DOB_CHART_LAYOUT[ri][ci]}</div>
                              <div style={{ fontSize: '17px', fontWeight: 800, color: cell ? '#7c3aed' : '#ddd6fe', fontFamily: 'system-ui,sans-serif', lineHeight: 1 }}>{cell || '–'}</div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody></table>
                  </td>

                  {/* Stats column */}
                  <td style={{ verticalAlign: 'top' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}><tbody>
                      <tr><td style={{ background: '#ede9fe', borderRadius: '8px', padding: '10px 14px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', fontFamily: 'system-ui,sans-serif', marginBottom: '3px' }}>Active Cells</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#5b21b6', fontFamily: 'system-ui,sans-serif', lineHeight: 1 }}>{presentDobNumbers.size}/9</div>
                      </td></tr>
                      <tr><td style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', padding: '10px 14px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#be123c', textTransform: 'uppercase', fontFamily: 'system-ui,sans-serif', marginBottom: '3px' }}>Missing</div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#9f1239', fontFamily: 'system-ui,sans-serif' }}>{missingDobNumbers.length > 0 ? `${missingDobNumbers.join(', ')} (${missingDobNumbers.length})` : 'None'}</div>
                      </td></tr>
                      <tr><td style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 14px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', fontFamily: 'system-ui,sans-serif', marginBottom: '3px' }}>Repeated (&gt;2×)</div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: '#78350f', fontFamily: 'system-ui,sans-serif' }}>{repeatedNegativeDobNumbers.length > 0 ? `${repeatedNegativeDobNumbers.join(', ')} (${repeatedNegativeDobNumbers.length})` : 'None'}</div>
                      </td></tr>
                    </tbody></table>
                  </td>
                </tr></tbody></table>

                {/* Missing Number Analysis */}
                {missingDobNumbers.length > 0 && (
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#5b21b6', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'system-ui,sans-serif', background: '#ede9fe', padding: '5px 10px', borderRadius: '5px', display: 'inline-block', marginBottom: '8px' }}>Missing Number Analysis</div>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 5px' }}><tbody>
                      {missingDobNumbers.map((digit) => (
                        <tr key={digit}>
                          <td style={{ width: '40px', verticalAlign: 'middle', textAlign: 'center', paddingRight: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ede9fe', border: '1px solid #c4b5fd', textAlign: 'center', lineHeight: '32px', fontSize: '13px', fontWeight: 700, color: '#7c3aed', fontFamily: 'system-ui,sans-serif', display: 'inline-block' }}>{digit}</div>
                          </td>
                          <td style={{ background: '#fff', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '9px 13px', fontSize: '13px', color: '#475569', lineHeight: '1.6', fontFamily: 'system-ui,sans-serif', verticalAlign: 'middle' }}>{missingNumberAnalysis[digit]}</td>
                        </tr>
                      ))}
                    </tbody></table>
                  </div>
                )}

                {/* Repeated Number Analysis */}
                {repeatedNegativeDobNumbers.length > 0 && (
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#be123c', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'system-ui,sans-serif', background: '#fff1f2', padding: '5px 10px', borderRadius: '5px', display: 'inline-block', marginBottom: '8px' }}>Negative Repeat Analysis</div>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 5px' }}><tbody>
                      {repeatedNegativeDobNumbers.map((digit) => (
                        <tr key={digit}>
                          <td style={{ width: '40px', verticalAlign: 'middle', textAlign: 'center', paddingRight: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff1f2', border: '1px solid #fca5a5', textAlign: 'center', lineHeight: '32px', fontSize: '13px', fontWeight: 700, color: '#be123c', fontFamily: 'system-ui,sans-serif', display: 'inline-block' }}>{digit}</div>
                          </td>
                          <td style={{ background: '#fff', border: '1px solid #fecdd3', borderRadius: '8px', padding: '9px 13px', fontSize: '13px', color: '#475569', lineHeight: '1.6', fontFamily: 'system-ui,sans-serif', verticalAlign: 'middle' }}>{repeatedNumberNegativeAnalysis[digit]}</td>
                        </tr>
                      ))}
                    </tbody></table>
                  </div>
                )}

                {missingDobNumbers.length === 0 && repeatedNegativeDobNumbers.length === 0 && (
                  <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', margin: 0, fontFamily: 'system-ui,sans-serif' }}>All numbers present — an exceptionally harmonious chart.</p>
                )}
              </div>

              {/* ── ACTIVE YOGs ── */}
              {yogResults.filter((y) => y.active).length > 0 && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '16px 18px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#92400e', fontFamily: 'system-ui,sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px', borderBottom: '1px solid #fde68a', paddingBottom: '8px' }}>
                    Active Yogs ({yogResults.filter((y) => y.active).length})
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}><tbody>
                    {yogResults.filter((y) => y.active).map((yog, i) => (
                      <tr key={i}>
                        <td style={{ background: '#fff', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 14px', verticalAlign: 'top' }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#78350f', fontFamily: 'system-ui,sans-serif', marginBottom: '3px' }}>{yog.name}</div>
                          <div style={{ fontSize: '11px', color: '#92400e', fontFamily: 'system-ui,sans-serif', marginBottom: '8px' }}>
                            Numbers: {yog.numbers.join(' – ')}{yog.missingNumbers?.length ? ` (missing: ${yog.missingNumbers.join(', ')})` : ''}
                          </div>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>
                            {yog.traits.map((t, ti) => (
                              <tr key={ti}><td style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6', fontFamily: 'system-ui,sans-serif', paddingLeft: '14px', paddingBottom: '2px', verticalAlign: 'top' }}>• {t}</td></tr>
                            ))}
                          </tbody></table>
                        </td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>
              )}

              {/* ── CURRENT DASHAS ── */}
              {prediction.current_mahadasha_number != null && (
                <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '10px', padding: '16px 18px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#5b21b6', fontFamily: 'system-ui,sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px', borderBottom: '1px solid #ddd6fe', paddingBottom: '8px' }}>Current Dashas</div>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '10px 0', marginBottom: prediction.dasha_analysis ? '12px' : 0 }}><tbody><tr>
                    <td style={{ width: '50%', background: '#ede9fe', borderRadius: '8px', padding: '12px 14px', verticalAlign: 'top' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', fontFamily: 'system-ui,sans-serif', marginBottom: '4px' }}>Mahadasha</div>
                      <div style={{ fontSize: '30px', fontWeight: 800, color: '#5b21b6', fontFamily: 'system-ui,sans-serif', lineHeight: 1, marginBottom: '4px' }}>{prediction.current_mahadasha_number}</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#5b21b6', fontFamily: 'system-ui,sans-serif' }}>{prediction.current_mahadasha_planet}</div>
                      {prediction.mahadasha_start && <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'system-ui,sans-serif', marginTop: '4px' }}>{prediction.mahadasha_start} → {prediction.mahadasha_end}</div>}
                    </td>
                    {prediction.current_antardasha_number != null && (
                      <td style={{ width: '50%', background: '#fdf4ff', borderRadius: '8px', padding: '12px 14px', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#c026d3', textTransform: 'uppercase', fontFamily: 'system-ui,sans-serif', marginBottom: '4px' }}>Antardasha</div>
                        <div style={{ fontSize: '30px', fontWeight: 800, color: '#86198f', fontFamily: 'system-ui,sans-serif', lineHeight: 1, marginBottom: '4px' }}>{prediction.current_antardasha_number}</div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#86198f', fontFamily: 'system-ui,sans-serif' }}>{prediction.current_antardasha_planet}</div>
                        {prediction.antardasha_start && <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'system-ui,sans-serif', marginTop: '4px' }}>{prediction.antardasha_start} → {prediction.antardasha_end}</div>}
                      </td>
                    )}
                  </tr></tbody></table>
                  {prediction.dasha_analysis && <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.7', margin: 0, fontFamily: 'system-ui,sans-serif' }}>{prediction.dasha_analysis}</p>}
                </div>
              )}

              {/* ── REMEDIES ── */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px 18px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#166534', fontFamily: 'system-ui,sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px', borderBottom: '1px solid #bbf7d0', paddingBottom: '8px' }}>Remedies</div>

                {/* Driver-Conductor */}
                {prediction.driver_conductor_remedy && (
                  <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px', padding: '12px 14px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'system-ui,sans-serif', marginBottom: '5px' }}>Driver-Conductor Remedy</div>
                    <p style={{ fontSize: '13px', color: '#166534', lineHeight: '1.7', margin: 0, fontFamily: 'system-ui,sans-serif' }}>{prediction.driver_conductor_remedy}</p>
                  </div>
                )}

                {/* Strength */}
                {prediction.strength_remedy && prediction.strength_remedy !== 'No remedy available yet.' && (
                  <div style={{ background: '#ede9fe', border: '1px solid #c4b5fd', borderRadius: '8px', padding: '12px 14px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'system-ui,sans-serif', marginBottom: '5px' }}>Strength Number Remedy</div>
                    <p style={{ fontSize: '13px', color: '#5b21b6', lineHeight: '1.7', margin: 0, fontFamily: 'system-ui,sans-serif' }}>{prediction.strength_remedy}</p>
                  </div>
                )}

                {/* Gochor */}
                {prediction.gochor_remedy && (
                  <div style={{ background: '#fdf4ff', border: '1px solid #e879f9', borderRadius: '8px', padding: '12px 14px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#86198f', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'system-ui,sans-serif', marginBottom: '5px' }}>Gochor Remedy</div>
                    <p style={{ fontSize: '13px', color: '#701a75', lineHeight: '1.7', margin: 0, fontFamily: 'system-ui,sans-serif' }}>{prediction.gochor_remedy}</p>
                  </div>
                )}

                {/* Mahadasha Gayatri Mantra */}
                {(() => {
                  const planet = prediction.current_mahadasha_planet
                  const mantra = planet ? GAYATRI_MANTRAS[planet] : undefined
                  if (!mantra) return null
                  return (
                    <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '12px 14px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'system-ui,sans-serif', marginBottom: '10px' }}>Mahadasha Remedy — {mantra.label}</div>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>
                        <tr><td style={{ paddingBottom: '8px', verticalAlign: 'top' }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', fontFamily: 'system-ui,sans-serif', marginBottom: '4px' }}>Sanskrit Mantra</div>
                          <p style={{ fontSize: '13px', color: '#4c1d95', lineHeight: '1.9', margin: 0, fontFamily: 'Georgia,serif', fontStyle: 'italic' }}>{mantra.sanskrit}</p>
                        </td></tr>
                        <tr><td style={{ paddingBottom: '8px', verticalAlign: 'top' }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', fontFamily: 'system-ui,sans-serif', marginBottom: '4px' }}>Transliteration</div>
                          <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.7', margin: 0, fontFamily: 'system-ui,sans-serif' }}>{mantra.transliteration}</p>
                        </td></tr>
                        <tr><td style={{ verticalAlign: 'top' }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', fontFamily: 'system-ui,sans-serif', marginBottom: '4px' }}>Benefits</div>
                          {mantra.benefits.map((b, i) => (
                            <p key={i} style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6', margin: '0 0 3px 0', fontFamily: 'system-ui,sans-serif', paddingLeft: '12px' }}>• {b}</p>
                          ))}
                        </td></tr>
                      </tbody></table>
                    </div>
                  )
                })()}

                {/* Antardasha */}
                {prediction.antardasha_remedy && (
                  <div style={{ background: '#fdf4ff', border: '1px solid #f5d0fe', borderRadius: '8px', padding: '12px 14px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#86198f', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'system-ui,sans-serif', marginBottom: '5px' }}>Antardasha Remedy</div>
                    <p style={{ fontSize: '13px', color: '#701a75', lineHeight: '1.7', margin: 0, fontFamily: 'system-ui,sans-serif' }}>{prediction.antardasha_remedy}</p>
                  </div>
                )}

                {/* Mahadasha text */}
                {prediction.mahadasha_remedy && (
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px 14px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'system-ui,sans-serif', marginBottom: '5px' }}>Mahadasha Guidance</div>
                    <p style={{ fontSize: '13px', color: '#1e40af', lineHeight: '1.7', margin: 0, fontFamily: 'system-ui,sans-serif' }}>{prediction.mahadasha_remedy}</p>
                  </div>
                )}

                {/* Yantra */}
                {(() => {
                  const yantra = PLANET_YANTRAS[prediction.driver_number]
                  if (!yantra) return null
                  return (
                    <div style={{ background: '#fdf2f8', border: '1px solid #f9a8d4', borderRadius: '8px', padding: '12px 14px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#be185d', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'system-ui,sans-serif', marginBottom: '12px' }}>Yantra — {yantra.label}</div>
                      {/* Yantra grid as HTML table */}
                      <table style={{ borderCollapse: 'separate', borderSpacing: '5px', marginBottom: '12px' }}><tbody>
                        {yantra.grid.map((row, ri) => (
                          <tr key={ri}>
                            {row.map((num, ci) => {
                              const idx = ri * 3 + ci
                              return (
                                <td key={ci} style={{ width: '68px', height: '50px', background: idx < 3 ? '#db2777' : '#fff', border: idx < 3 ? '2px solid #be185d' : '1px solid #f9a8d4', borderRadius: '7px', textAlign: 'center', verticalAlign: 'middle', fontSize: '16px', fontWeight: 700, color: idx < 3 ? '#fff' : '#be185d', fontFamily: 'system-ui,sans-serif' }}>{num}</td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody></table>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>
                        <tr><td style={{ verticalAlign: 'top', paddingBottom: '8px' }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', fontFamily: 'system-ui,sans-serif', marginBottom: '4px' }}>Benefits</div>
                          {yantra.benefits.map((b, i) => <p key={i} style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6', margin: '0 0 3px 0', fontFamily: 'system-ui,sans-serif', paddingLeft: '12px' }}>• {b}</p>)}
                        </td></tr>
                        <tr><td style={{ verticalAlign: 'top' }}>
                          <div style={{ fontSize: '10px', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', fontFamily: 'system-ui,sans-serif', marginBottom: '4px' }}>How to Use</div>
                          {yantra.howToUse.map((h, i) => <p key={i} style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6', margin: '0 0 3px 0', fontFamily: 'system-ui,sans-serif', paddingLeft: '12px' }}>• {h}</p>)}
                        </td></tr>
                      </tbody></table>
                    </div>
                  )
                })()}

                {/* Personal Year Remedy — right after Yantra, matching UI layout */}
                {PERSONAL_YEAR_REMEDIES[prediction.personal_year] && (
                  <div style={{ background: '#eef2ff', border: '1px solid #a5b4fc', borderRadius: '8px', padding: '12px 14px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'system-ui,sans-serif', marginBottom: '5px' }}>Personal Year Remedy — Year {prediction.personal_year}</div>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#312e81', lineHeight: '1.7', margin: 0, fontFamily: 'system-ui,sans-serif', letterSpacing: '0.02em' }}>{PERSONAL_YEAR_REMEDIES[prediction.personal_year]}</p>
                  </div>
                )}

                {/* Yog Remedies */}
                {(() => {
                  const activeYogsWithRemedies = yogResults
                    .filter((y) => y.active)
                    .map((y) => ({
                      name: y.name,
                      remedies: yogRemedyData[getYogRemedyKey(y.numbers, y.missingNumbers)],
                    }))
                    .filter((y) => y.remedies && y.remedies.length > 0)
                  if (activeYogsWithRemedies.length === 0) return null
                  return (
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 14px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'system-ui,sans-serif', marginBottom: '10px' }}>
                        Yog Remedies ({activeYogsWithRemedies.length} active yog{activeYogsWithRemedies.length !== 1 ? 's' : ''})
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}><tbody>
                        {activeYogsWithRemedies.map((yog, idx) => (
                          <tr key={idx}>
                            <td style={{ background: '#fff', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 13px', verticalAlign: 'top' }}>
                              <div style={{ fontSize: '11px', fontWeight: 700, color: '#78350f', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'system-ui,sans-serif', marginBottom: '6px' }}>{yog.name}</div>
                              {yog.remedies.map((r, i) => (
                                <p key={i} style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6', margin: '0 0 3px 0', fontFamily: 'system-ui,sans-serif', paddingLeft: '12px' }}>• {r}</p>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </tbody></table>
                    </div>
                  )
                })()}

                {/* Crystal */}
                {(() => {
                  const crystalDigits = missingDobNumbers.filter((d) => CRYSTAL_REMEDIES[d])
                  if (crystalDigits.length === 0) return null
                  return (
                    <div style={{ background: '#fdf4ff', border: '1px solid #f0abfc', borderRadius: '8px', padding: '12px 14px', marginBottom: '10px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#86198f', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'system-ui,sans-serif', marginBottom: '10px' }}>Crystal</div>
                      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}><tbody>
                        {crystalDigits.map((digit) => {
                          const c = CRYSTAL_REMEDIES[digit]
                          return (
                            <tr key={digit}>
                              <td style={{ background: '#fff', border: '1px solid #f0abfc', borderRadius: '8px', padding: '10px 13px', verticalAlign: 'top' }}>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#86198f', fontFamily: 'system-ui,sans-serif', marginBottom: '6px' }}>{c.name}</div>
                                {c.benefits.map((b, i) => (
                                  <p key={i} style={{ fontSize: '12px', color: '#701a75', lineHeight: '1.6', margin: '0 0 3px 0', fontFamily: 'system-ui,sans-serif', paddingLeft: '12px' }}>• {b}</p>
                                ))}
                                <div style={{ fontSize: '10px', fontWeight: 700, color: '#a21caf', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'system-ui,sans-serif', margin: '8px 0 3px 0' }}>Crystal Affirmation — Chant it 5 times in the morning</div>
                                <p style={{ fontSize: '12px', fontStyle: 'italic', color: '#701a75', lineHeight: '1.6', margin: 0, fontFamily: 'system-ui,sans-serif' }}>“{c.affirmation}”</p>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody></table>
                      <p style={{ fontSize: '12px', color: '#86198f', lineHeight: '1.6', margin: '4px 0 0 0', fontFamily: 'system-ui,sans-serif' }}>As per your chart, we recommend the above crystals for your progress and stability.</p>
                    </div>
                  )
                })()}

              </div>
            </div>

            {/* ── FOOTER ── */}
            <div style={{ background: '#f5f3ff', borderTop: '2px solid #ddd6fe', padding: '14px 40px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody><tr>
                <td style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'system-ui,sans-serif' }}>Generated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                <td style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'system-ui,sans-serif', textAlign: 'right' }}>Numerology Report — Confidential</td>
              </tr></tbody></table>
            </div>

            {/* ── COMMENTS PAGE (blank, for handwritten notes) ── */}
            <div style={{ pageBreakBefore: 'always', minHeight: '1050px', background: '#ffffff', padding: '40px 40px 40px' }}>
              {/* Comment page header */}
              <div style={{ background: 'linear-gradient(135deg,#7c3aed,#c026d3 55%,#4f46e5)', padding: '22px 32px', borderRadius: '14px', marginBottom: '36px' }}>
                <div style={{ color: '#fff', fontSize: '20px', fontWeight: 700, letterSpacing: '0.04em', fontFamily: 'system-ui,sans-serif' }}>Comments</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '4px', fontFamily: 'system-ui,sans-serif' }}>Personal notes &amp; observations</div>
              </div>

              {/* Ruled lines for writing */}
              {Array.from({ length: 22 }).map((_, i) => (
                <div key={i} style={{ borderBottom: '1px solid #e2e8f0', marginBottom: '30px', width: '100%' }} />
              ))}

              {/* Footer on comment page */}
              <div style={{ borderTop: '2px solid #ddd6fe', paddingTop: '12px', marginTop: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody><tr>
                  <td style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'system-ui,sans-serif' }}>{userName || 'Numerology Report'}</td>
                  <td style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'system-ui,sans-serif', textAlign: 'right' }}>Page — Comments</td>
                </tr></tbody></table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
