# tatlife.com 재구축 — 준비 계획서

> **목적:** 워드프레스로 운영 중인 **tatlife.com**(TAT 본 브랜드)을, TAT for Animals와
> 동일한 최신 스택(Next.js 16 + Supabase + Stripe/PayPal + Sanity)으로 재구축·이전한다.
>
> 이 문서는 "무엇부터, 어떤 순서로, 무엇을 결정해야 하는가"를 정리한 **착수 전 준비 문서**다.
> 아직 tatlife.com의 실제 콘텐츠/회원/URL 구조를 코드로 확보하지 못했으므로,
> §4의 "결정·확인 필요 항목"을 먼저 채운 뒤 실제 구축을 시작한다.
> 작성일: 2026-07-16

---

## 0. 핵심 전제 — 이건 "신규 구축"이 아니라 "이전(migration)"이다

TAT for Animals는 **백지에서** 만들었다. tatlife.com은 다르다. **이미 살아있는 사이트**를
옮기는 작업이라, 아래 4가지가 근본적으로 더 어렵고, 여기서 사고가 난다:

| 리스크 | 왜 위험한가 | 대응 원칙 |
|--------|-------------|-----------|
| **기존 유료회원 결제** | 워드프레스에서 이미 매달 과금 중인 구독을 끊거나 이중청구하면 신뢰·환불 사고 | 결제는 **가장 마지막에, 무중단으로**. 기존 구독은 건드리지 않고 신규만 새 시스템으로 (§3-D) |
| **SEO / 기존 URL** | tatlife.com은 검색 순위가 쌓인 오래된 도메인. URL이 바뀌면 트래픽 증발 | **모든 기존 URL → 301 리다이렉트 맵** 필수. 재구축 전에 URL 전수조사 |
| **기존 회원 계정** | 이메일/비밀번호가 워드프레스 DB에 있음. 그대로 못 옮김(해시 방식 다름) | 마이그레이션 + **최초 로그인 시 비밀번호 재설정** 유도 (§3-D) |
| **콘텐츠 양** | animals보다 콘텐츠(영상/글)가 많을 가능성. 수작업 이전은 비현실적 | Sanity 스키마 설계 후 **스크립트 일괄 이전** (§3-C) |

> **한 줄 요약:** animals는 "만들기"가 90%였고, tatlife는 "안 깨고 옮기기"가 90%다.

---

## 1. 그대로 가져가는 기반 (animals에서 검증 완료)

TAT for Animals 구축·하드닝·보안감사를 거치며 만든 자산은 **대부분 재사용 가능**하다.
tatlife.com은 이걸 복사해서 시작하므로, animals의 몇 달치 작업이 곧 tatlife의 출발선이다.

### 1-A. 거의 수정 없이 복사 (인프라·유틸)
- **결제 코어**: `lib/stripe.ts`, `lib/paypal.ts` — 월/연 이중 결제, 업/다운그레이드, 취소, 환불
- **접근 판정**: `lib/access.ts`, `lib/subscriptionAccess.ts`, `lib/reconcileAccess.ts` — 가격→역할 매핑, 자가치유
- **웹훅 하드닝**: `lib/onceGuard.ts`(멱등성), `webhooks/stripe`·`webhooks/paypal`(실패 롤백+알림)
- **보안**: `lib/sanityWebhookAuth.ts`(fail-closed), `lib/rateLimit.ts`(Supabase 기반), `profiles` 권한 잠금 마이그레이션
- **운영**: `lib/alertOps.ts`(실패 알림), `api/health`, gitleaks CI, 보안 헤더, CSP
- **인증 뼈대**: `lib/supabase/{client,server,admin}.ts`, `middleware.ts`(보호 라우트)
- **이메일 자동화**: `lib/resend.ts` + `lib/emails/*`(환영/취소/플랜변경/갱신/삭제 템플릿 — 카피만 교체)
- **빌드 안전장치**: `lib/lazyClient.ts`(env 없이 빌드), Jest 셋업, zero-env 빌드 검증

### 1-B. 구조는 재사용, 내용은 교체 (컴포넌트·페이지)
- `components/`: Navbar, Footer, Hero, Pricing, Testimonials, ComparisonTable, NewsletterSignup, CookieBanner, ui/Button 등 — **레이아웃/로직은 유지, 카피·이미지·색상 토큰만 교체**
- `app/`: membership → checkout → thank-you → dashboard → library 플로우 전체 구조 재사용
- 법률 페이지(Termageddon 임베드), FAQ, contact 구조

### 1-C. tatlife 고유로 새로 만들 것
- **디자인 토큰**: animals는 오렌지+포레스트그린. tatlife는 별도 브랜드 팔레트 → `globals.css`의 `@theme` 교체
- **콘텐츠 모델**: tatlife의 콘텐츠 종류(강의? 코스? 세션 유형?)에 맞는 Sanity 스키마
- **가격/플랜 구조**: tatlife의 멤버십 티어(animals와 다를 것)
- **홈 서사**: animals는 Tapas 중심. tatlife는 브랜드 주인공/스토리가 다름

> **재사용률 추정:** 인프라/결제/보안/이메일 ≈ 80–90% 그대로, UI ≈ 50%(구조 재사용), 콘텐츠·디자인 ≈ 0%(신규).

---

## 2. 스택 결정 (animals와 동일하게 갈 것)

동일 스택 유지가 정답이다. 이유: (1) 검증된 코드 재사용, (2) 두 사이트를 한 사람이 유지보수,
(3) 인수인계 문서(SRS handoff) 하나로 커버.

- Next.js 16 (App Router, Turbopack) + TypeScript
- Tailwind v4 (`@theme inline`), Framer Motion v12, lucide-react
- Supabase(인증+RLS), Stripe+PayPal, Sanity CMS, Resend, Vercel 호스팅

**단, 결정 필요:** tatlife와 animals가 **Supabase/Stripe 프로젝트를 공유할지 완전 분리할지**
→ §4 참조. (권장: **완전 분리** — animals가 이미 tatlife.com과 "완전 독립"으로 설계된 것과 동일 원칙)

---

## 3. 단계별 계획 (초안 — §4 확정 후 시작)

### Phase A — 조사·인벤토리 (코드 작성 0줄, 가장 중요)
- [ ] tatlife.com 전체 **URL 전수조사** → 리다이렉트 맵 초안 (SEO 보존의 핵심)
- [ ] 현재 **회원 수 / 구독 상품 / 결제 수단**(어떤 플러그인? WooCommerce? MemberPress?) 파악
- [ ] **콘텐츠 인벤토리**: 페이지 수, 영상 수, 블로그 글 수, 미디어 호스팅(Vimeo? 자체?)
- [ ] 현재 이메일 리스트 / 뉴스레터 도구
- [ ] 현재 도메인·DNS·호스팅 상태

### Phase B — 스캐폴딩
- [ ] animals 리포를 템플릿으로 새 리포 생성 (tatlife 전용)
- [ ] 디자인 토큰(색상/폰트) 교체, 로고 교체
- [ ] Supabase/Stripe/Sanity 프로젝트 신규 생성(또는 공유 결정 반영)
- [ ] 홈/멤버십/법률 등 정적 골격 구축

### Phase C — 콘텐츠 이전
- [ ] tatlife 콘텐츠 종류에 맞는 Sanity 스키마 설계
- [ ] 워드프레스 export(XML/DB) → Sanity 일괄 이전 **스크립트** 작성
- [ ] 미디어(영상/이미지) 이전 또는 링크 재매핑

### Phase D — 회원·결제 이전 (가장 신중하게, 무중단)
- [ ] 기존 회원 계정 → Supabase 이전(이메일만) + **최초 로그인 시 비밀번호 재설정** 유도
- [ ] 기존 구독 처리 전략 결정: **(권장)** 기존 구독은 워드프레스에서 자연 만료까지 유지,
      신규·갱신만 새 시스템으로. 절대 일괄 재과금하지 않음
- [ ] 병렬 운영 기간(구 사이트/신 사이트 공존) 설계

### Phase E — 컷오버
- [ ] **301 리다이렉트 맵 배포** (Phase A 산출물)
- [ ] 도메인 전환, DNS
- [ ] robots 해제, sitemap 제출, Search Console
- [ ] 스모크 테스트(animals 런칭 체크리스트 재사용)

---

## 4. 결정·확인 필요 항목 (이걸 먼저 채워야 착수 가능)

실제 구축 전에 아래를 확정해야 한다. 대부분 **코드가 아니라 정보/정책** 결정이다.

1. **인프라 분리 여부**: tatlife와 animals가 Supabase/Stripe 프로젝트를 **공유 vs 완전분리**?
   (권장: 완전분리. 회원/결제/데이터가 섞이지 않음)
2. **워드프레스 현황**: 어떤 멤버십/결제 플러그인을 쓰는가? (MemberPress / WooCommerce / 기타)
   → 기존 구독을 어떻게 읽어낼지가 여기서 갈림
3. **회원 규모**: 현재 유료회원 수 대략? 이전 리스크의 크기를 결정
4. **콘텐츠 규모**: 이전할 페이지/영상/글의 대략적 수량과 종류
5. **멤버십 구조**: tatlife의 티어/가격은 animals와 다른가? 어떻게 다른가?
6. **URL 보존 범위**: 유지해야 할 핵심 URL(검색 유입 상위 페이지)은?
7. **런칭 방식**: 특정일 일괄 전환(빅뱅) vs 병렬 운영 후 점진 전환?
8. **디자인 방향**: tatlife 브랜드 색상/톤 — animals와 얼마나 다르게?

---

## 5. 다음 액션

> **지금 당장 코드 작업은 없다.** tatlife.com 재구축은 위 §4가 채워지기 전에 시작하면
> 잘못된 가정 위에 쌓게 된다. 가장 값싼 다음 단계는 **Phase A 조사**다.

**추천 순서:**
1. §4의 8개 항목을 함께 확정 (특히 1·2·3 — 인프라/플러그인/회원규모)
2. Phase A 인벤토리(URL·콘텐츠·회원) 착수 — 워드프레스 export 파일이나 관리자 접근이 필요
3. 확정되면 이 문서를 tatlife 신규 리포의 SRS 초안으로 승격

---

_이 문서는 준비 단계 산출물이며, §4 확정 시 정식 SRS/설계문서로 대체된다._
