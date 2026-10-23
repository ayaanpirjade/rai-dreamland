interface BrandMarkProps {
  size?: number
  className?: string
}

/** The Bubu × Dudu mark: a heart with two bear ears and two little eyes. */
export function BrandMark({ size = 38, className = '' }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Bubu and Dudu heart logo"
      focusable="false"
    >
      <defs>
        <linearGradient id="brand-heart" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff9ec4" />
          <stop offset="55%" stopColor="#ff7fae" />
          <stop offset="100%" stopColor="#b79cff" />
        </linearGradient>
        <linearGradient id="brand-ear" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8b48c" />
          <stop offset="100%" stopColor="#d79a72" />
        </linearGradient>
      </defs>
      <circle cx="18" cy="15" r="8.5" fill="url(#brand-ear)" />
      <circle cx="46" cy="15" r="8.5" fill="url(#brand-ear)" />
      <circle cx="18" cy="15" r="4" fill="#ffb9cd" />
      <circle cx="46" cy="15" r="4" fill="#ffb9cd" />
      <path
        d="M32 55C13 41 6 30 11.5 22.5 16 16 25 15.5 32 22.5 39 15.5 48 16 52.5 22.5 58 30 51 41 32 55Z"
        fill="url(#brand-heart)"
      />
      <circle cx="25" cy="31" r="2.6" fill="#4a3040" />
      <circle cx="39" cy="31" r="2.6" fill="#4a3040" />
      <ellipse cx="20" cy="36" rx="3.4" ry="2.2" fill="#ff7fae" opacity="0.65" />
      <ellipse cx="44" cy="36" rx="3.4" ry="2.2" fill="#ff7fae" opacity="0.65" />
    </svg>
  )
}
