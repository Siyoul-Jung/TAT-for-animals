// src/components/LogoMark.tsx
// Option A: Vesica Piscis — two overlapping circles
// Orange (left) + Green (right) — two beings sharing a space

interface LogoMarkProps {
  size?: number;
  orange?: string;
  green?: string;
}

export default function LogoMark({
  size = 40,
  orange = '#D4703A',
  green = '#6B7A52',
}: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Left circle — orange */}
      <circle
        cx="22"
        cy="30"
        r="13"
        stroke={orange}
        strokeWidth="2"
        fill={orange}
        fillOpacity="0.08"
      />
      {/* Right circle — green */}
      <circle
        cx="38"
        cy="30"
        r="13"
        stroke={green}
        strokeWidth="2"
        fill={green}
        fillOpacity="0.08"
      />
    </svg>
  );
}
