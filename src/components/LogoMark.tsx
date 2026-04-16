// src/components/LogoMark.tsx — 하트 + 줄기, 오렌지↔그린 그라데이션

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
      <defs>
        {/* 좌(오렌지/사람) → 우(그린/동물) 수평 그라데이션 */}
        <linearGradient id="heart-grad" x1="6" y1="0" x2="54" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor={orange} />
          <stop offset="100%" stopColor={green}  />
        </linearGradient>
      </defs>

      {/*
        하트 본체 — 아래가 뾰족하지 않고 줄기로 자연스럽게 연결되도록
        위 두 로브(lobe)가 넓게 벌어지고, 아래는 둥글게 좁아짐
      */}
      <path
        d="M 30 46
           C 22 42 6 34 6 22
           C 6 11 14 7 22 7
           C 27 7 30 13 30 17
           C 30 13 33 7 38 7
           C 46 7 54 11 54 22
           C 54 34 38 42 30 46
           Z"
        fill="url(#heart-grad)"
        fillOpacity="0.92"
      />

      {/* 줄기 — 하트 아래에서 자연스럽게 내려옴 */}
      <path
        d="M 30 46 C 30 50 28 54 27 57"
        stroke={orange}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
