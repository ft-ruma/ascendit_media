/** Click-to-chat link with the page pre-filled, so the team knows what the visitor was reading. */
export function whatsappLink(number: string, page: string, text?: string) {
  const n = number.replace(/[^0-9]/g, '')
  const msg = text ?? `Hi, I was looking at ${page === '/' ? 'your website' : page}`
  return `https://wa.me/${n}?text=${encodeURIComponent(msg)}`
}
