# TAT for Animals — 할 일 목록

*Last updated: April 24, 2026*

---

## 📋 이번 미팅 팔로업 (Tapas 확인 필요)

- [ ] **디자인 방향 확정** — 색상/폰트/전체 비주얼 방향 ("overall vision" 재검토 요청)
- [ ] **폰트 선택** — `/font-preview` 페이지 보여주고 Sans-serif 옵션 중 선택 받기
- [ ] **홈페이지 영상 확인** — YouTube 채널에 TAT for Animals 전용 공개 영상 없음. 기존 영상 중 공개 가능한 것 있는지, 또는 짧은 소개 영상(2-3분) 신규 촬영 필요 여부 확인
- [ ] **멤버십 가격 확정** — 티어 구성/혜택은 SRS에 확정. Basic($X/월) + Premium($X/월) 가격만 미확정

---

## 🔴 즉시 (지금 당장)

- [ ] tatlife.com 백엔드 로그인 → TAT for Animals 멤버십 섹션 구조 파악
- [x] 비디오 12개 검토 → 재촬영 필요 여부 판단 후 Tapas에게 피드백
  - Chapter 2 (Tips, TAT Terms, Poses), Chapter 3 (Three Blockages, Cat/Dog Happier, Five Essential Ways, Animal Has Passed, Is Your Animal Acting Weird) 분석 완료
  - 결론: 기존 영상은 대시보드 콘텐츠로 충분. 홈페이지용 신규 소개 영상(2-3분) 필요

---

## 🟠 다음 미팅 전 (준비물)

- [x] 산세리프 폰트 옵션 2-3종 시각 비교 자료 — `/font-preview` 페이지 구현 완료 (Tapas 확인 대기)
- [ ] 타임라인 + 비용 견적 작성
- [ ] SRS — tatlife.com 검토 후 대시보드 요구사항 보완

---

## 🟡 개발 (지금 시작 가능)

- [x] 네비게이션 변경 — `[Logo] + [Join]` 구조로
- [x] 불필요한 페이지 제거 — `/for-your-animal`, `/work-with-tapas`, `/session`
- [x] `/faq` 페이지 초안 구현 — 아코디언 형식, 첫 방문자 대상 12개 Q&A
- [x] Supabase `video_watch_events` 테이블 생성 + RLS + 인덱스 설정
- [ ] 홈페이지 섹션 재구성 — Animals 전용 구조로 (Hero → How It Works → Stories → Membership → About Tapas)
- [ ] Sanity CMS 스키마 설계 — 비디오 + 웨비나 녹화
- [ ] 대시보드 — 웨비나 일정 + 초대 이메일 + 녹화 업로드 알림 구현

---

## 🔵 대기 중 (상대방 액션 필요)

- [ ] **Jez** — 기존 TAT for Animals 구독자 목록 확인
- [ ] **Jez** — 비디오, 웨비나 녹화, 후기, Tapas 사진 수집 중
- [ ] **Tapas** — 멤버십 티어 이름 + 가격 + 혜택 확정
- [x] **Tapas** — tatforanimals.com 도메인 구입 + Vercel DNS 연결 완료

---

## 🟢 다음 단계 (나중에)

- [ ] 마케팅 전략 리서치 및 문서화
- [ ] 경쟁사/레퍼런스 사이트 분석
- [ ] SEO 키워드 리서치 (반려동물 치유 관련)
- [ ] 론칭 전/후 마케팅 플랜 구체화
