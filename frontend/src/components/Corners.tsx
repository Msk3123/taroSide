/** Four decorative gold corners — replaces shared.js body injection. */
const CornerSVG = () => (
  <svg viewBox="0 0 60 60" fill="none" stroke="#c9a24a" strokeWidth={0.8}>
    <path d="M2 2 L2 24 M2 2 L24 2" />
    <circle cx="2" cy="2" r="2" fill="#c9a24a" stroke="none" />
    <path d="M2 14 L10 14 M14 2 L14 10" opacity="0.5" />
  </svg>
)

export function Corners() {
  return (
    <>
      <div className="corner tl" aria-hidden><CornerSVG /></div>
      <div className="corner tr" aria-hidden><CornerSVG /></div>
      <div className="corner bl" aria-hidden><CornerSVG /></div>
      <div className="corner br" aria-hidden><CornerSVG /></div>
    </>
  )
}

export default Corners
