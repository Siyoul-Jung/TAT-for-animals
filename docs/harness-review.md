# Harness Engineering 검토 (tatlife)

> AI 코딩 에이전트가 안정적으로 작업하도록 프로젝트를 4가지 요소로 점검.
> 기준: Martin Fowler, "Harness engineering for coding agent users"
> https://martinfowler.com/articles/harness-engineering.html

## 4요소 진단

| 요소 | 역할 | tatlife 현황 |
|---|---|---|
| ① 지시 문서 | 규칙 전달 | ✅ `AGENTS.md` + `CLAUDE.md` + `docs/standards.md` |
| ② 아키텍처 제약 | 잘못된 코드 차단 | ✅ ESLint + TypeScript |
| ③ 피드백 루프 | 결과 즉시 확인 | ✅ Jest (단위) + Playwright (e2e) |
| ④ 지식 저장소 | 결정·맥락 축적 | ✅ `docs/decisions/` (ADR) + db_schema·api_routes·technical_review |

→ **4요소를 모두 갖춘 상태.**

## ③ 피드백 루프 현황

- **단위 테스트(Jest)**: Stripe webhook 핸들러 테스트 구현됨
  (서명 검증 실패, 구독 생성, role 분기, 멱등성, 결제 실패/취소 등)
- **E2E(Playwright)**: 인증 페이지 기본 플로우
- 커맨드: `npm test`, `npm run test:coverage`, `npm run test:e2e`

## 보완하면 좋을 것 (우선순위)

1. **PayPal webhook 테스트** — 현재 Stripe만 있음. PayPal 핸들러는 미커버.
2. **결제→라이브러리 접근 E2E** — 구독 후 콘텐츠 접근까지의 전체 플로우.
3. **CI 게이트** — push 시 테스트 자동 실행(GitHub Actions). 현재 Vercel 자동 배포(CD)는 있으나 CI는 미연결.
