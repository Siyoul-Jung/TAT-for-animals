@AGENTS.md
@docs/srs.md
@docs/design_spec.md

# TAT® Calm — 프로젝트 가이드라인

## ⭐ 핵심 설계 원칙 (모든 작업의 최우선 기준)

> 모든 UI, 기능, 카피, 인터랙션 결정 전에 이 다섯 가지를 먼저 확인한다.

| 원칙 | 의미 |
|------|------|
| **Simple / Minimal** | 불필요한 요소 없음. 한 화면에 하나의 목적. |
| **Easy** | 설명 없이 직관적으로 사용 가능. "70세 사용자가 혼자 쓸 수 있는가?" |
| **Senior-friendly** | Tapas의 핵심 사용자층. 이들이 편하면 모두가 편함. |
| **WCAG AA** | 대비율 4.5:1 이상, 터치 타겟 44px 이상, 포커스 표시 필수. |
| **경험/체험 중심** | 정보 전달 ❌ → 감각적 체험 ✅. 방문자가 먼저 느끼고, 그 다음 이해한다. |
| **사람 냄새** | AI 감성 ❌ → 인간적 온기 ✅. 완벽하게 정제된 느낌보다 Tapas라는 실존 인물의 체온이 느껴져야 한다. |

**AI 감성 체크리스트 (이런 게 보이면 다시 생각):**
- 떠다니는 뱃지, 완벽한 그라디언트 카드, 과도하게 둥근 모서리
- "Empowering your journey" 같은 공허한 마케팅 카피
- 숫자 통계 나열 ("500K+ 도달", "80+ 개국") — 숫자보다 실제 이야기
- 격자형으로 딱 맞아떨어지는 기능 카드 3개 나란히
- 주인공이 없는 디자인 — Tapas의 얼굴과 목소리가 항상 중심에 있어야 함

**실전 체크리스트:**
- 드롭다운, 탭, 아코디언 같은 "숨겨진 UI" → 기본적으로 지양
- 기술 용어 ("Dashboard", "Magic Link") → 평문으로 대체
- 에러 메시지 → 박스 형태 + 해결 방법 안내
- 로딩 상태 → 반드시 시각적 피드백
- "Cancel anytime" → 항상 눈에 띄게

---

## 프로젝트 개요
tatlife.com의 전면 리디자인 프로젝트입니다.
동물을 치유의 첫 진입점으로 내세우는 새로운 포지셔닝을 구현합니다.
자세한 내용은 위에 참조된 `srs.md` 및 `design_spec.md`를 확인하세요.

---

## 기술 스택
- **프레임워크**: Next.js 15 (App Router) + TypeScript
- **스타일링**: Tailwind CSS v4 (`@theme inline` 방식 — `tailwind.config` 없음)
- **애니메이션**: Framer Motion v12
- **아이콘**: lucide-react
- **유틸리티**: clsx + tailwind-merge (`cn()` 헬퍼, `src/lib/utils.ts`)

---

## 컴포넌트 구조 (홈페이지 섹션 순서)

```
src/
├── app/
│   ├── layout.tsx         — 폰트 설정 (Playfair Display + DM Sans)
│   ├── globals.css        — CSS 변수 및 Tailwind @theme 토큰
│   └── page.tsx           — 홈페이지 (섹션 조립)
│
└── components/
    ├── Navbar.tsx          — 고정 내비게이션 (스크롤 감지)
    ├── Hero.tsx            — 다크 앰버 Hero (섹션 1)
    ├── SevenBeliefs.tsx    — 7가지 믿음 인터랙션 (섹션 2)
    ├── HealingLoop.tsx     — For Your Animal (섹션 3)
    ├── VideoSection.tsx    — 비디오 체험 (섹션 4)
    ├── Community.tsx       — 커뮤니티 (섹션 5)
    ├── Pricing.tsx         — 멤버십 카드 (섹션 6)
    ├── AboutTapas.tsx      — Tapas 소개 (섹션 7)
    ├── Footer.tsx          — 푸터 (섹션 8)
    └── ui/
        └── Button.tsx      — 재사용 버튼 컴포넌트
```

---

## 접근성 & 사용자층 원칙

TAT®의 핵심 사용자층은 **시니어 및 기술에 익숙하지 않은 사용자**입니다.
모든 UI/UX 결정은 이 기준을 우선으로 합니다.

### 최소 기준 — WCAG AA
- **색상 대비율**: 일반 텍스트 4.5:1 이상 / 대형 텍스트(18px bold 또는 24px) 3:1 이상
- **터치 타겟**: 최소 44×44px (버튼, 링크, 인터랙티브 요소 전체)
- **포커스 표시**: 키보드 탐색 시 포커스 링 항상 표시
- **움직임**: `prefers-reduced-motion` 미디어 쿼리 항상 고려

### 시니어 UX 가이드라인
- **폰트 크기**: 본문 최소 16px / 보조 텍스트 최소 14px (12px 이하 금지)
- **줄 간격**: 본문 `leading-relaxed` 이상 (1.625+)
- **한 번에 하나**: 한 화면에 하나의 주요 행동만. 선택지 최소화.
- **기술 용어 금지**: "Magic Link", "Dashboard" 같은 용어는 평문으로 대체
- **에러 메시지**: 빨간 텍스트 한 줄이 아닌 박스 형태 + 해결 방법 안내
- **로딩 상태**: 버튼 클릭 후 반드시 시각적 피드백 (스피너 또는 텍스트 변경)
- **"Cancel anytime"**: 구독 관련 모든 CTA 근처에 눈에 띄게 표시 (opacity 0.5 이상)
- **자동재생 금지**: 오디오/비디오 자동재생 금지. 배경 장식 영상만 예외 (음소거 필수).

---

## 코딩 규칙

### 색상 사용
- **메인 컬러**: 오렌지 (`#D4703A`) + 다크 그린 (`#1F2E14`) — 이 두 가지가 브랜드의 핵심
- Tailwind 토큰 우선: `bg-cream`, `text-charcoal`, `text-brand` 등
- 다크 섹션 배경: `style={{ backgroundColor: '#1F2E14' }}`
- rgba gradient 값: `rgba(31,46,20,...)` (#1F2E14의 rgba 표현)
- 골드 강조색: `rgba(212,168,67,...)` (#D4A843의 rgba 표현)

### 폰트
- 헤딩: `className="font-serif"` → Playfair Display
- 본문: `className="font-sans"` → DM Sans (기본값)
- 이탤릭 강조: `className="font-serif italic"`

### 다크 섹션 vs 라이트 섹션
| 섹션 | 배경 | 텍스트 |
|------|------|--------|
| Hero, HealingLoop, Pricing | `#1F2E14` (다크 그린) | `text-cream` |
| SevenBeliefs, VideoSection, AboutTapas | `bg-cream` (라이트) | `text-charcoal` |
| Community | `bg-surface` (라이트) | `text-charcoal` |
| Footer | `#1F2E14` (다크 그린) | cream 계열 |

### 애니메이션 패턴
```tsx
// 스크롤 등장 — 표준 패턴
<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
>
```

### 클라이언트 컴포넌트
- 이벤트 핸들러, useState, useEffect, Framer Motion 사용 시 파일 최상단에 `'use client'` 필수
- 인터랙션 없는 순수 표시 컴포넌트는 서버 컴포넌트로 유지 가능

---

## 미결 항목 (코드 작업 전 확인 필요)
- 멤버십 가격: $24/$47 확정 여부 (Tapas 확인 필요)
- 홈페이지 비디오: 실제 영상 (Jez 제공 예정)
- Tapas 실제 고해상도 사진 (현재 Unsplash 플레이스홀더)
- 실제 후기 콘텐츠 — Kai/Bowie/Misty 이야기 (Jez/Tapas 제공 예정)
