# Tapas에게 보내는 이메일 — 기술 방향 답변

_작성일: 2026-04-16_

---

## 한국어 초안

Tapas에게,

따뜻한 편지 감사했습니다. 그리고 부모님 방문을 이렇게 세심하게 기억해주시고 배려해주신 것, 진심으로 감동받았습니다.

직접적으로 물어봐 주셨으니 저도 솔직하게 답드리고 싶습니다. 기술적인 방향에 대한 질문이 이 프로젝트에서 가장 중요한 결정이 될 것 같아서, 최대한 명확하게 설명드리려 합니다.

**두 가지 방향**

먼저 선택지를 명확히 설명드리고 싶습니다. 실은 두 가지 방향이 있습니다.

**방향 1 — 디자인만 교체, 나머지는 그대로**
Thrive Themes를 걷어내고 현대적인 커스텀 디자인으로 교체합니다. WooCommerce, Amelia, 멤버십, 플러그인 — 그 아래에 있는 모든 것은 손대지 않습니다. Jez도 지금 하던 방식 그대로 관리할 수 있습니다. 충분히 가능한 방향이고, TATLife에 진짜 아름다운 새 얼굴을 줄 수 있습니다.

**방향 2 — 전체 플랫폼 재구축**
디자인과 기반 인프라를 함께 새로 만드는 것입니다. 작업량은 더 많지만, 방향 1로는 해결되지 않는 것들도 함께 해결됩니다.

**제 솔직한 생각**

저는 개인적으로 방향 2가 TATLife의 비전에 더 잘 맞는다고 생각합니다. 설득하려는 게 아니라, 판단을 물어봐 주셨으니 솔직하게 드리는 말씀입니다.

*첫째, 데이터 인사이트입니다.* Tapas께서 원하신다고 하셨던 것들 — 어떤 서비스가 가장 오래 머무는 고객을 끌어들이는지, 사람들이 예약이나 멤버십 과정 어디에서 이탈하는지, TATLife를 어떻게 발견하는지 — 이런 인사이트는 현재 플러그인 구조 위에서는 깔끔하게 구현하기가 어렵습니다. 각 플러그인이 서로 독립적으로 작동하다 보니 데이터가 한 곳에 모이지 않습니다. 재구축된 플랫폼에서는 결제, 예약, 콘텐츠 접근 — 모든 데이터가 한 곳에 통합되어, TATLife가 성장하고 새로운 방향을 모색할 때 실질적인 의사결정 도구가 됩니다.

*둘째, 성장의 관점입니다.* Jez와 직접 이야기하면서 현재 시스템의 불편한 지점들을 구체적으로 확인했습니다. Jez 본인도 말했듯, 지금 50명 규모에서는 감당할 수 있는 수준입니다. 하지만 목표가 300명이라면 이야기가 달라집니다. 지금 Jez 혼자서 수동으로 처리하고 있는 것들이 구독자 규모가 커질수록 한 사람이 감당하기 어려운 수준이 됩니다. 그리고 지금 50명일 때가 이 전환을 가장 깔끔하게 할 수 있는 시점입니다.

*셋째, Jez의 역할입니다.* 이 부분은 조심스럽게 말씀드리고 싶습니다. 재구축 후에도 Jez는 TATLife의 콘텐츠 — 영상, 이벤트, 텍스트 — 를 관리하는 사람으로 계속 남습니다. 다만 도구가 바뀝니다. 코드가 전혀 필요 없는 단순한 콘텐츠 관리 도구를 사용하게 됩니다. 그리고 지금 Jez가 쓰는 시간들은 자동화로 대체되어, 고객 관리나 마케팅처럼 실제로 사람이 해야 하는 일에 집중할 수 있게 됩니다.

*넷째, 앞으로 가능해지는 것들입니다.* AI 기반 고객 응대 시스템 — 구독자가 언제든 질문을 남겨도 즉각적이고 적절한 답변을 받는 경험 — 은 나중에 논의할 사항이지만, 현대적인 플랫폼 위에서만 제대로 구현될 수 있는 것입니다. WordPress에서는 외부 위젯을 붙이는 수준에 그치지만, 재구축된 플랫폼에서는 구독 상태와 사용 이력까지 인식하는 완전히 통합된 경험이 가능합니다.

**Jez의 우려에 대해 직접 말씀드리자면**

맞습니다 — 현재 연결된 시스템들은 처음부터 다시 만들어야 합니다. 이 점은 솔직히 인정합니다.

다만 제가 말씀드리고 싶은 것은, 그 연결들을 *같은 방식으로* 다시 만드는 게 아니라는 점입니다. 예약 시스템은 Amelia보다 목적에 맞게 설계된 도구로, 결제는 WooCommerce 대신 Stripe로, 멤버십 관리는 자동화된 구조로 대체됩니다. 이것들은 서로 충돌하지 않고, 지금 감내하고 있는 수동 작업들이 애초에 발생하지 않는 구조입니다.

각 시스템을 어떤 도구로 어떻게 대체할지에 대해서는 비즈니스 전략이 좀 더 구체화되면 소프트웨어 요구사항 명세서를 작성해서 공유드리려 했습니다. 말이 나온 김에 간략히 말씀드렸지만, 그 문서에서 전체 그림을 훨씬 명확하게 보실 수 있을 겁니다.

**이전 과정에서 실제로 일어나는 일**

구독자 이전은 생각보다 단순합니다. 구독자 50명 기준으로:

- 결제 시스템을 Stripe로 옮깁니다. 현재 WooCommerce가 이미 Stripe를 통해 결제를 처리하고 있다면 구독자의 결제 정보는 이미 Stripe에 있으므로 구독자 입장에서 아무것도 할 필요가 없습니다.
- 이전 후 구독자들에게 새 사이트에서 비밀번호를 재설정해달라는 이메일을 한 번 보냅니다. 구독자 입장에서 필요한 행동은 이것뿐입니다.
- 2~4주 동안 두 사이트를 병행 운영합니다. 혼란을 겪는 분이 있다면 기존 사이트를 그대로 사용하면서 해결할 수 있고, 아무도 접근을 잃지 않습니다.

50명은 제가 각 계정을 직접 확인하면서 옮길 수 있는 규모입니다.

**런칭 이후에는 어떻게 되나요**

Jez는 영상, 이벤트, 가격, 후기 같은 콘텐츠를 문서 편집기처럼 직관적인 도구로 관리하게 됩니다. 코드는 전혀 필요 없습니다. 새로운 기능이나 디자인 변경이 필요할 때는 개발자가 필요합니다. 다만 WordPress와 가장 크게 달라지는 점은, 예측하기 어려운 플러그인 충돌이나 업데이트 이후 오류 같은 문제들이 사라진다는 겁니다. 시스템 자체의 운영 안정성은 비약적으로 높아집니다.

**그렇지만**

Jez가 현재 시스템을 충분히 감당할 수 있고 방향 1이 TATLife에 필요한 것을 준다고 판단한다면, 그것도 충분히 유효한 선택입니다. 이 시스템을 누구보다 잘 아는 사람은 Jez이고, 그 판단을 가볍게 보고 싶지 않습니다. 어느 방향이든 제가 최선을 다해 함께하겠습니다.

---

Jez가 자동화 파이프라인을 이미 구현했다는 소식 정말 기뻤습니다. 제 제안서가 그 계기가 되었다고 해주셔서 감사하고 — 그걸 실제로 실행에 옮긴 건 Jez입니다. 좋은 출발이라고 생각합니다.

가격 리서치는 보류한다고 하셨는데, 충분히 이해합니다. 새로운 방향이 더 명확해지면 그때 다시 이야기 나눠요.

TAT for Animals 홈페이지 관련해서 보여드리고 싶은 것이 있습니다. 이번 주말 편하신 때 잠깐 만날 수 있으면 좋겠습니다. 정말 편하실 때만 말씀해 주세요.

부모님 방문을 이렇게 따뜻하게 기억해주시고 배려해주신 것, 진심으로 감사드립니다. 그 마음이 큰 힘이 됩니다.

따뜻한 마음을 담아,
시율

---

## English Version

Dear Tapas,

Thank you for your letter — and for remembering my parents' visit so warmly. That kind of care means more than I can easily say.

You asked me directly, so I want to answer directly. The question of technical direction feels like the most important decision we'll make together at the start of this project, and I want to explain it as clearly as I can.

**Two paths**

I want to make sure we're looking at the same options, because there are actually two different directions here.

**Path 1 — Replace only the design, keep everything else**
Remove Thrive Themes and replace it with a fully custom modern frontend. WooCommerce, Amelia, memberships, plugins — everything underneath stays exactly as it is. Jez continues managing the site the way she already does. This is entirely possible, and it would give TATLife a genuinely beautiful new look.

**Path 2 — Rebuild the full platform**
New design and new infrastructure together. More work upfront, but it also addresses things Path 1 cannot.

**My honest thinking**

I personally believe Path 2 serves TATLife's vision better — not to push you in that direction, but because you asked for my judgment and I want to give it to you honestly.

*First, the data insights.* The things you described wanting — which services attract your most engaged long-term clients, where people drop off in the booking or membership journey, how clients find TATLife — these are genuinely difficult to build cleanly on top of the current plugin structure. Each plugin operates independently, and the data doesn't come together in one place. On a rebuilt platform, payments, bookings, and content access all live in one place, giving you a real tool for making decisions as TATLife grows and evolves.

*Second, the scale you're building toward.* I've spoken directly with Jez and confirmed the specific friction points in the current system. As Jez herself said, at 50 subscribers it's manageable. But the goal is 300. The manual work Jez is currently handling on her own — the kind that quietly accumulates across updates, notifications, cancellations, and support emails — becomes a different problem at that scale. And 50 subscribers is the cleanest possible moment to make this transition. It only gets more complex from here.

*Third, Jez's role.* I want to say this carefully. After a rebuild, Jez remains the person who manages TATLife's content — videos, events, pricing, the words on the page — through a tool that requires no technical knowledge at all. What changes is that the time she currently spends on manual workarounds gets replaced by automation, freeing her to focus on the things only a person can do: supporting clients, managing relationships, contributing to marketing.

*Fourth, what becomes possible.* An AI-assisted support system — where subscribers get an immediate, relevant response any time they have a question — is something to discuss later. But it's the kind of experience that can only be built properly on a modern platform. On WordPress, it would mean embedding a third-party widget. On a rebuilt platform, it can be fully integrated, aware of each subscriber's history and membership level.

**On Jez's concern directly**

She's right — the current connections would need to be rebuilt from the ground up. I want to acknowledge that honestly.

But what I'd like you to see is that we wouldn't be rebuilding them the same way. The booking system would move to a tool designed specifically for this purpose, payments to Stripe, membership management to an automated structure. These systems don't conflict with each other, and the recurring manual work that exists today simply wouldn't arise.

I had planned to share a full software requirements document once the business strategy becomes clearer — it would lay out exactly which tool replaces which, and why. Since the topic has come up, I've touched on it briefly here, but that document will give you a much more complete picture when the time is right.

**What the migration actually involves**

The subscriber transition is simpler than it might sound. With 50 active subscribers:

- The payment system moves from WooCommerce to Stripe. If WooCommerce is already processing payments through Stripe — which is common — your subscribers' payment information is already there, and nothing changes for them.
- After migration, subscribers receive a single email asking them to set a new password on the new site. That's the only action required of them.
- Both sites run in parallel for two to four weeks. Anyone who runs into any confusion can still access the old site while we resolve it. No one loses access.

At 50 people, I can personally verify each account to make sure the transition is clean.

**After launch**

Jez will manage all content — videos, events, pricing, testimonials — through a clean, intuitive tool that works like a document editor. No code required. New features or design changes will still need a developer when the time comes. But the biggest difference from WordPress is that unpredictable plugin conflicts and post-update breakages simply go away. The operational stability of the system improves dramatically.

**That said**

If Jez feels the current system is working well enough, and Path 1 gives TATLife what it needs, that is a completely valid direction. She knows this system better than anyone, and I don't want to dismiss that. Whichever path you choose, I'll give it everything I have.

---

I was genuinely glad to hear that Jez has already implemented the automation pipeline. Thank you for saying my proposal helped make that happen — but the one who actually built it is Jez. That feels like a good start.

Pricing research is on hold — completely understood. I'll wait to hear from you when the new direction becomes clearer.

I have something I'd love to show you for the TAT for Animals homepage. If there's a moment this weekend that works for you, I'd be happy to get together — only if it truly fits.

And thank you again for what you said about my parents. I'll carry that with me.

With warmth,
Siyoul
