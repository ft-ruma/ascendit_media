/** A "HELLO my name is" name tag, drawn in our palette. */
export function HelloSticker({ name, rotate = -4 }: { name: string; rotate?: number }) {
  return (
    <span className="inline-block w-[150px] overflow-hidden rounded-[14px] border border-ink/15 bg-window text-center shadow-[0_10px_18px_-10px_rgb(14_14_18/.45)]" style={{ rotate: `${rotate}deg` }}>
      <span className="block bg-tangerine px-2 pb-1 pt-1.5 text-ink">
        <span className="block text-[17px] font-bold leading-none tracking-wide">HELLO</span>
        <span className="block text-[10px] font-medium uppercase tracking-wider">my name is</span>
      </span>
      <span className="block px-2 py-2.5 font-serif text-[26px] italic leading-none text-ink">{name}</span>
      <span className="block h-2 bg-tangerine" />
    </span>
  )
}
