# 유지보수 후속 작업 (런칭 후 / tatlife 템플릿 준비 단계)

> 2026-07-16 핸드오프 유지보수 리뷰 결과. **모두 품질/명료성 항목이며 버그·보안·블로커가 아니다**
> (리뷰 판정: "핸드오프 준비됨, 신규 개발자 1~2일 내 생산성 가능"). 배포를 막지 않으므로
> 런칭 후, 또는 tatlife.com을 이 코드로 재구축하기 직전에 처리한다. tatlife로 **복사되기 전에**
> 정리하면 같은 부채를 두 번 안 만든다.

## 우선순위 3 (핸드오프 + tatlife 재구축에 가장 도움)

### 1. 하드코딩 색상 → 기존 토큰으로 (가장 큰 효과, 리팩터 큼)
- **현상:** `globals.css:28-59`에 `--color-brand`(#D4703A), `--color-green`(#467826), `--color-cream`,
  `--color-charcoal` 토큰이 있고 `ui/Button.tsx`는 올바르게 `bg-brand`/`text-green`으로 소비한다.
  그런데 38개 파일에서 **같은 색을 인라인 hex/rgba로 127곳** 직접 지정
  (예: `Pricing.tsx:132,161,208,258`, `DashboardClient.tsx:646,657,713`).
- **왜:** 신규 개발자가 "토큰을 고쳐야 하나 리터럴을 고쳐야 하나" 혼란. tatlife 리브랜딩 시
  `globals.css` 6줄 대신 127곳을 사냥해야 함.
- **수정:** 인라인 hex를 토큰 클래스(`text-green`, `bg-brand` 등)로 교체. 진짜 일회성 값만 `style` 유지.
- **주의:** 38파일 시각 회귀 위험 → 배포 직후 말고 여유 있을 때, 스크린샷 비교하며.

### 2. Navbar 죽은 코드 삭제 (안전)
- **현상:** `components/Navbar.tsx:86` `const darkHeroPages: string[] = []` 항상 빈 배열 →
  `isDarkHero`(87) 항상 false → 91,100-101,140-141,158,164의 dark 분기 전부 도달 불가.
- **왜:** 읽는 사람이 실행되지 않는 스크롤 인지 light/dark 로직을 추적해야 함. tatlife로 그대로 복사됨.
- **수정:** dark 분기 삭제하고 삼항식 단순화. (다크 히어로 페이지가 실제 계획이면 `darkHeroPages` 배선.)

### 3. Stripe 웹훅의 role 매핑 중복 제거 (작음, critical path)
- **현상:** `lib/subscriptionAccess.ts:20` `roleForSubscription()` 존재, `reconcileAccess.ts:52`는 사용.
  그러나 `webhooks/stripe/route.ts:99-100`, `:244-245`가 동일 로직
  `priceId ? (PRICE_ROLE_MAP[priceId] ?? 'subscriber') : 'subscriber'`을 손인라인.
- **왜:** 가격→역할 규칙이 가장 안전 민감한 경로에 3곳. 헬퍼만 고치면 웹훅 2곳이 조용히 누락.
- **수정:** 두 웹훅 분기에서 `roleForSubscription(subscription)` 호출.

## 그 외 (선택 / 확인 필요)
- **혼용 주석 언어:** 공유 인프라(`lib/`, `api/`)에 한/영 주석 혼재 70곳. 인수자가 비한국어 개발자면 마찰 →
  공유 인프라는 한 언어로 통일 고려. (같은 팀이 유지하면 무시 가능.)
- **`Footer.tsx:2` `'use client'`** 인데 훅/핸들러 없음 → 정적 푸터가 불필요하게 클라이언트 번들로.
  숨은 상호작용 없으면 서버 컴포넌트로 강등 (자식 `NewsletterSignup`은 독립적으로 클라이언트 유지).
- **`DashboardClient.tsx` 1000줄:** 읽을 만하지만(섹션+주석 잘됨) 큼. 멤버십 카드/계정 카드 섹션을
  형제 컴포넌트로 추출 고려 (선택).

## 건드리지 말 것 (모범 — tatlife가 보존해야 할 참조)
돈/웹훅/인증 코어는 "exemplary" 판정: `onceGuard`, `sendWelcomeOnce`, `reconcileAccess`,
`subscriptionAccess`, `alertOps`, `rateLimit`, `refundWindow`, `sanityWebhookAuth`, `lazyClient`,
`paypal`, `supabase/{client,server,admin}` — 비자명한 결정마다 "왜" 주석 있음. 라우트의 critical-path
에러 처리(`reportOpsError` + `releaseOnce` 롤백)는 일관적. TS 위생 깨끗(`as any`/`@ts-ignore` 없음).
