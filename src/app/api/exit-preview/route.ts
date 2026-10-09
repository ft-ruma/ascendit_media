import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(req: Request) {
  ;(await draftMode()).disable()
  redirect(new URL(req.url).searchParams.get('path') ?? '/')
}
