import { NextResponse, type NextRequest } from 'next/server'
import { FIRST_TOUCH_COOKIE, firstTouchFrom } from './lib/utm'

// Decide currency at the edge so the first paint is already right:
// LKR for Sri Lanka, USD for everyone else. If hosting moves to Azure Front
// Door, read its geo header instead; the cookie logic stays the same.
export function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const year = 60 * 60 * 24 * 365

  if (!req.cookies.get('currency')) {
    const country = req.headers.get('x-vercel-ip-country') ?? req.headers.get('x-azure-clientip-country') ?? ''
    res.cookies.set('currency', country.toUpperCase() === 'LK' ? 'LKR' : 'USD', { path: '/', maxAge: year, sameSite: 'lax' })
  }
  if (!req.cookies.get(FIRST_TOUCH_COOKIE)) {
    const ft = firstTouchFrom(req.nextUrl, req.headers.get('referer'))
    res.cookies.set(FIRST_TOUCH_COOKIE, JSON.stringify(ft), { path: '/', maxAge: 60 * 60 * 24 * 90, sameSite: 'lax', httpOnly: true })
  }
  return res
}

export const config = {
  // Public pages only: never admin, API, Next internals or files with an extension.
  matcher: ['/((?!admin|api|_next|.*\\..*).*)'],
}
