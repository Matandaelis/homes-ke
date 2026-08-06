export default function Logo({ size = 38 }: { size?: number }) {
  return (
    <span
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-gradient-to-br from-forest-700 via-forest-800 to-forest-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_6px_rgba(15,53,41,0.35)]"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 48 48" width={size * 0.66} height={size * 0.66} fill="none" aria-hidden="true">
        {/* roof */}
        <path
          d="M8 23 24 10l16 13"
          stroke="#d6bb93"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* N formed by the house structure */}
        <path
          d="M14 37V22.5L34 37V22.5"
          stroke="#faf6f0"
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* brass dot — window */}
        <circle cx="24" cy="30.5" r="2.1" fill="#d6bb93" />
      </svg>
    </span>
  )
}
