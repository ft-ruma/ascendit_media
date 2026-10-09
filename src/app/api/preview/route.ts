import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

/** Live preview entry from Payload: turns on draft mode, then shows the route with drafts. */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const path = url.searchParams.get('path') ?? '/'
  if (!process.env.PREVIEW_SECRET || url.searchParams.get('secret') !== process.env.PREVIEW_SECRET || !path.startsWith('/')) {
    return new Response('Invalid preview link', { status: 401 })
  }
  ;(await draftMode()).enable()
  redirect(path)
}
