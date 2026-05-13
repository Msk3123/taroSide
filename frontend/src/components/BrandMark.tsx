/** Lunaris brand mark (gold circle + crosshair + filled center) */
export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <span
      className="brand-mark"
      style={{ width: size, height: size, display: 'inline-flex' }}
      aria-hidden
    >
      <svg viewBox="0 0 32 32" fill="none" stroke="#c9a24a" strokeWidth={1.2}>
        <circle cx="16" cy="16" r="13" />
        <path d="M16 3 L16 29 M3 16 L29 16" opacity="0.5" />
        <circle cx="16" cy="16" r="4" fill="#c9a24a" stroke="none" />
        <circle cx="16" cy="16" r="8" />
      </svg>
    </span>
  )
}

export default BrandMark
