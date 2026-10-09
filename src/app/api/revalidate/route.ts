import { NextResponse } from 'next/server'
import { revalidate } from '@/lib/revalidate'

/** Cache purge for callers outside this app (n8n, scripts): POST { paths: string[] } with the shared secret. */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const body = (await req.json().catch(() => ({}))) as { paths?: unknown }
  const paths = Array.isArray(body.paths) ? body.paths.filter((p): p is string => typeof p === 'string' && p.startsWith('/')) : []
  if (!paths.length) return NextResponse.json({ ok: false, error: 'paths required' }, { status: 400 })
  await revalidate(paths)
  return NextResponse.json({ ok: true, revalidated: paths })
}
