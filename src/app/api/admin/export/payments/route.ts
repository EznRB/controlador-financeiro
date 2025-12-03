import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const events = await prisma.paymentEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 1000 })
  const header = ['created_at','type','utm_source','utm_medium','utm_campaign','utm_content']
  const rows = events.map((e) => [
    e.createdAt.toISOString(),
    e.type,
    e.utmSource || '',
    e.utmMedium || '',
    e.utmCampaign || '',
    e.utmContent || '',
  ])
  const csv = [header.join(','), ...rows.map((r) => r.map((c) => String(c).replace(/"/g,'"')).join(','))].join('\n')
  return new NextResponse(csv, { status: 200, headers: { 'Content-Type': 'text/csv; charset=utf-8' } })
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
