# 시크릿(토큰·API 키) 안전 관리 가이드

이 문서는 TAT for Animals 저장소에서 API 키·토큰 같은 **시크릿을 어떻게 안전하게 다루는지**와, 저장소에 걸려 있는 **자동 안전장치**를 설명합니다.

---

## 1. 황금 규칙 (5가지)

| # | 규칙 | 이유 |
|---|------|------|
| 1 | **코드에 키를 직접 쓰지 않는다** — 항상 `process.env.XXX` | 커밋되면 히스토리에 영원히 남음 |
| 2 | **실제 값은 `.env` 파일에만** (이미 `.gitignore` 처리됨) | git에 절대 안 올라가게 |
| 3 | **`.env.example` 에는 빈 placeholder만** | 어떤 키가 필요한지 알려주되 값은 노출 안 함 |
| 4 | **프로덕션 값은 Vercel 환경 변수에** (Production/Preview 분리) | 배포 환경별로 안전하게 주입 |
| 5 | **키가 노출되면 → "고치기"보다 "폐기(rotate)"가 먼저** | 이미 노출된 키는 못 주워담음 |

---

## 2. 이 저장소의 시크릿 구조

```
.env              ← 실제 값. gitignore됨. 절대 커밋 안 됨.
.env.example      ← 빈 placeholder만. 커밋됨. "이런 키가 필요하다"는 목록.
Vercel 환경변수    ← 배포용 실제 값. Production / Preview 환경별로 설정.
```

- 코드는 전부 `process.env.STRIPE_SECRET_KEY` 처럼 **환경 변수로만** 키를 읽습니다.
- 클라이언트(브라우저)에 노출돼도 되는 값만 `NEXT_PUBLIC_` 접두사를 씁니다. (예: `NEXT_PUBLIC_SUPABASE_URL`) — **비밀키에는 절대 `NEXT_PUBLIC_`를 붙이지 마세요.**

---

## 3. 자동 안전장치 (이 저장소에 설치됨)

### ① CI 시크릿 스캔 — `.github/workflows/secret-scan.yml`
- **main에 push하거나 PR을 올릴 때마다** gitleaks가 **전체 커밋 히스토리**를 스캔합니다.
- 실제 키(Stripe `sk_`, Supabase JWT, AWS, GitHub 토큰 등)가 발견되면 **체크가 실패**해서 merge 전에 잡힙니다.
- 오탐 방지 설정은 `.gitleaks.toml` 에 있습니다. (테스트 더미키, 공개 리뷰 토큰 등은 허용 목록에 등록)

### ② 로컬 pre-commit 훅 — `.githooks/pre-commit`
- **커밋을 만드는 순간** 스테이징된 변경에서 명백한 키 패턴을 찾아 **커밋 자체를 차단**합니다. (GitHub에 닿기도 전에 방어)
- **한 번만 켜면 됩니다** (클론마다):
  ```bash
  git config core.hooksPath .githooks
  ```
- 오탐일 때만 우회: `git commit --no-verify`

### ③ (권장) GitHub 네이티브 Push Protection
가장 강력한 층입니다. GitHub이 push 자체를 막아줍니다. 저장소에서 한 번 켜세요:
> **GitHub 저장소 → Settings → Code security and analysis → "Secret scanning" 과 "Push protection" 을 Enable**

---

## 4. 키가 실수로 노출됐다면 (사고 대응)

순서가 중요합니다:

1. **먼저 폐기(rotate)** — 해당 서비스(Stripe/Supabase/Resend 등)에서 그 키를 **무효화하고 새 키 발급**. 노출된 키는 이미 끝난 것으로 간주.
2. 새 키를 `.env` / Vercel 환경변수에 넣기.
3. 코드/히스토리에서 제거 (필요 시 `git filter-repo` 등으로 히스토리 정리 — 단, 1번을 먼저 했다면 급하지 않음).
4. 왜 커밋됐는지 점검 (훅이 꺼져 있었는지 등).

> 핵심: **노출된 키는 "지우면 안전"이 아니라 "폐기해야 안전"** 입니다. 인터넷에 한 번 나간 값은 누군가 이미 복사했을 수 있으니까요.

---

## 5. 참고 — 테스트/플레이스홀더 값

- `src/__tests__/`의 더미 키(`sk_test_dummy`, `whsec_test`, `test-service-role-key` 등)와 `.env.example`의 빈 placeholder는 실제 자격증명이 아니며 스캐너 허용 목록(`​.gitleaks.toml`)에 등록돼 있습니다.
- (과거 존재하던 `tat-content-review-2026` 공개 검수 토큰은 임시 review 도구와 함께 제거됨.)
