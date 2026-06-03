# 개발 표준 & 참조 (Standards & References)

> 모든 작업의 기준선. 매 작업에서 **"정확하게 쓰고 있나"(§1)** 와 **"잘 설계하고 있나"(§2)** 를 둘 다 확인한다.
> 이 프로젝트 규모(단일 DB + 몇 개의 라우트 + 외부 결제 연동)의 풀스택 앱에 맞춘 **실전 큐레이션**.
> 600쪽짜리 학술서는 이 규모엔 과잉이다 — 짧고 바로 매핑되는 출처를 우선한다.

---

## 0. 메타 규율 (가장 중요 — 출처보다 이 습관이 먼저다)

1. **기억보다 버전-핀 공식 출처.** 타입이 "그 필드 없다"고 하면 `as any`로 뚫지 말고 **타입을 믿어라.**
   - 근거: 2026-06 `current_period_end` 버그 — Stripe가 필드를 item 레벨로 옮겼는데 코드는 옛 위치를 가정했고, `as any`가 그 드리프트를 가렸다.
2. **보안 surface(인증·결제·리다이렉트·접근제어)** 작업 → 손대기 전 **OWASP 해당 Cheat Sheet** 1장.
3. **서드파티 연동** → 설치된 **버전의 changelog / upgrade guide** 먼저. (`node_modules/<pkg>` 의 타입·docs를 직접 읽는다 — AGENTS.md)
4. **DB 스키마 변경** → 데이터가 쌓이면 못 고친다. PR 전 **§2의 DB 체크리스트**로 셀프리뷰.

---

## 1. 정확성 레퍼런스 — "이 API를 플랫폼 기대대로 쓰는가"

> 검증 가능 · 버전 종속 · 수시로 확인. 해당 영역을 만질 때 그 줄을 연다.

| 영역 | 권위 있는 출처 | 언제 |
|------|---------------|------|
| Next.js 15 | 공식 docs + `node_modules/next/dist/docs` | App Router·라우팅·캐싱 |
| React 19 | react.dev | 훅·Server/Client 경계 |
| TypeScript | TS Handbook | 타입 좁히기·제네릭 |
| Tailwind v4 | tailwindcss.com/docs | `@theme inline` (v4 신규) |
| **Stripe** | **API ref(버전 핀) + Upgrades/Changelog + "Best practices for webhooks"** | **결제·웹훅** |
| PayPal | developer.paypal.com (Subscriptions, Webhook verify) | 구독·웹훅 검증 |
| Supabase | supabase.com/docs (Auth, **RLS**, `@supabase/ssr`) | 인증·접근제어 |
| Sanity | sanity.io/docs (GROQ, schema) | CMS 쿼리·스키마 |
| 보안(교차) | OWASP Top 10 + OWASP Cheat Sheet Series | 인증·결제·리다이렉트·접근제어 |

---

## 2. 품질·설계 레퍼런스 — "구조가 옳은가" (백엔드 & DB 중심)

> 판단의 영역 · 시간 불변 · 내재화 후 결정 시점에 참조.
> 이 규모에선 **무료·짧은 웹 리소스가 종종 책보다 낫다** — 바로 우리 문제에 매핑되니까.

### 무료·실전 (여기서 시작)
| 출처 | 무엇 | 우리/커머스 연결 |
|------|------|-----------------|
| **12-Factor App** (12factor.net) | 설정·백킹서비스·무상태 | env 변수·시크릿·배포 위생 |
| **Use The Index, Luke!** (use-the-index-luke.com) | 인덱스/쿼리 성능을 그림으로 | `profiles` 조회, 주문/상품 조회 |
| **patterns.dev** | 웹/React/Next 아키텍처 패턴 | 컴포넌트·데이터 페칭 구조 |
| 공식 docs (Next.js Route Handlers · Supabase RLS · Stripe) | 실제 백엔드가 사는 곳 | 라우트·접근제어·웹훅 |

### 접근성 좋은 책 (학술적이지 않음)
| 책 | 왜 이 레벨에 맞나 |
|----|------------------|
| **SQL Antipatterns** (Karwin) | "하지 말 것" 요리책. 스키마 설계 직격 |
| **Database Design for Mere Mortals** (Hernandez) | 정규화·관계를 가장 부드럽게 |
| **A Philosophy of Software Design** (Ousterhout, ~190p) | "모듈을 어떻게 쪼개나" — 두껍지 않음 |
| **The Pragmatic Programmer** | 엔지니어링 습관(DRY·직교성). 챕터 독립 |

### DB 설계 셀프리뷰 체크리스트 (스키마 변경 PR 전 — 우리 스키마에 바로 적용)
- [ ] 모든 컬럼이 **가능한 값만** 갖나? (`text` 상태/역할 → `CHECK` 또는 enum — *31 Flavors* 안티패턴)
- [ ] FK에 **`ON DELETE`** 동작 정의했나? (cascade / set null / restrict)
- [ ] 자주 **조회·조인**하는 컬럼에 인덱스 있나? — 단, **`UNIQUE`는 이미 인덱스를 만든다** → 중복 인덱스 금지
- [ ] **`public` 테이블에 RLS 켰나?** (Supabase: RLS 없으면 anon 키로 API 노출됨. service_role 전용 테이블도 RLS enable + 정책 없음으로)
- [ ] 시간 컬럼은 **`timestamptz`** 인가? (`timestamp` 아님)
- [ ] **시점 박제(snapshot)** 필요한 값을 참조로 두지 않았나? (커머스: 주문의 가격은 주문 시점 값을 복사 — 상품 가격이 나중에 바뀌어도 영수증은 불변)
- [ ] 마이그레이션 SQL **스타일 일관성** (대소문자·정책 네이밍)

### 나중에 (스케일이 요구할 때만)
- **Designing Data-Intensive Applications** 11·12장 — 멱등성·시스템 동기화. (2026-06 웹훅 idempotency가 이 내용)

---

*마지막 업데이트: 2026-06-02 — 결제/웹훅 정확성 버그 수정 세션에서 도출.*
