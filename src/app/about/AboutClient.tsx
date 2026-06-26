'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Pricing from '@/components/Pricing'
import { BOOKING_URL } from '@/lib/links'

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
}

// Real reviews Tapas chose (2026-06-26). Session reviews sit by the private-session
// booking CTA; recording reviews sit after the membership offer. Quotes are verbatim
// from TATLife, lightly tidied for the site (ampersands spelled out, emojis dropped).
// Each carries a short `context` line drawn strictly from the reviewer's own words
// (no invented facts). With no photos available, this context is what gives an
// anonymous quote a human face — who the session was for, why it mattered.
const sessionTestimonials = [
  {
    name: 'Kymberly',
    context: 'Session for her dog',
    quote:
      'I had a wonderful session that was centered around my dog and a few health limitations. Tapas was kind and discussed what she saw throughout the session. We worked on my beloved pup and would then check back to see if any additional work was needed. It was a wonderful experience that brought about great results for my guy. Many thanks Tapas for all that you do!',
  },
  {
    name: 'AJ',
    context: 'A returning client',
    quote:
      'It’s always a pleasure to work with Tapas. She’s on time, efficient and insightful. And she’s gentle, compassionate and caring. Our session was for one of my dogs who experienced an unidentified injury to his spine, hip and leg. He feels better today and I look forward to his full recovery in the next few days ahead. Thanks, Tapas!',
  },
  {
    name: 'Zoey',
    context: 'For her dog — and herself',
    quote:
      'I had a session for both my dog and I with Tapas. I could feel the difference in myself even after doing TAT with Tapas for my dog! Tapas is a great Facilitator and I felt very supported during our session. Energy shifted and I was feeling lighter and happier afterwards!',
  },
]

// Two recording reviews, intentionally NOT uniform: Michele is a calm observation
// (smaller, quiet), Betsey is the emotional crescendo (large display) — rendered
// explicitly below rather than mapped, so their differing treatment is clear.
const recordingMichele = {
  name: 'Michele',
  context: 'On the TAT® recording for pets',
  quote:
    'My pets love TAT in general and usually wander over when there is some going on, but they have a notable reaction to the tape specifically for pets. I was surprised the first time because I hadn’t thought there was anything out of sorts with them when I put it on, and yet they were noticeably calmer, more peaceful and more cheerful for at least 2 days after.',
}
const recordingBetsey = {
  name: 'Betsey',
  context: 'After watching TAT® for Dogs',
  quote:
    'I just watched the video for TAT for Dogs. That was amazing! I’m still crying with joy! Thank you, what a gift! You’re always an inspiration!',
}

export default function AboutClient() {
  return (
    <main className="bg-cream">

      {/* 1. 헤더 — 본문 그리드와 같은 max-w-6xl 로 왼쪽 끝선을 사진과 맞춤 */}
      <section className="pt-28 sm:pt-32 pb-4 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp}>
            <p className="text-[13px] tracking-[0.2em] uppercase font-semibold mb-5"
              style={{ color: '#467826' }}>
              The Founder
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-charcoal font-medium leading-tight mb-4">
              Tapas Fleming
            </h1>
            <p className="font-sans text-lg text-muted">
              Creator and Founder of TAT®
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. 사진 + 창업자 바이오 (Tapas 원문 verbatim) */}
      <section className="pt-4 pb-16 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">

          {/* 사진 + 인용구 */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col"
          >
            {/* 사진 + 뱃지 — relative 래퍼로 뱃지를 사진에 고정 (칸이 늘어나도 따라가지 않음) */}
            <div className="relative">
              <div
                className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden"
                style={{
                  boxShadow: '0 24px 64px rgba(28,16,7,0.12), 0 0 0 1px rgba(28,16,7,0.06)',
                }}
              >
                <Image
                  src="/images/Tapas-Thanks.jpg"
                  alt="Tapas Fleming — Creator of TAT®"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-top"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(28,16,7,0.20) 0%, transparent 50%)' }}
                />
              </div>

              {/* Founded badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute -bottom-7 right-3 sm:-bottom-5 sm:-right-5 bg-cream rounded-2xl px-5 py-3 sm:px-6 sm:py-4 flex flex-col gap-0.5"
                style={{ boxShadow: '0 8px 32px rgba(28,16,7,0.10), 0 0 0 1px rgba(28,16,7,0.07)' }}
              >
                <span className="font-serif text-2xl font-semibold text-charcoal">1993</span>
                <span className="text-xs text-charcoal/65 font-light tracking-wide">TAT® created</span>
              </motion.div>
            </div>

            {/* 창업자 인용구 — 사진 바로 아래 붙여 한 덩어리로 보이게 (뱃지 여유분 포함 mt-12). */}
            <blockquote className="font-serif text-xl sm:text-2xl text-charcoal/80 leading-snug mt-12">
              &ldquo;I love to help people and animals find peace &mdash;
              one person, one animal at a time.&rdquo;
            </blockquote>
          </motion.div>

          {/* 텍스트 */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-6 text-charcoal/65 font-light leading-relaxed text-base sm:text-lg pt-6"
          >
            <p>
              After years of searching for a gentler way to help people heal &mdash; without
              asking them to relive their pain &mdash; Tapas developed TAT&reg; in 1993.
            </p>
            <p>
              What began as a quiet discovery in her acupuncture practice gradually became
              something far greater than she could have imagined. Over the years, more and more
              animals came into her care, and working with animals naturally became a deeper and
              more meaningful part of her practice.
            </p>
            <p>
              Again and again, she saw how much fear, stress, and emotional tension animals can
              carry &mdash; and how profoundly things can shift when their whole system &mdash;
              emotional, physical and energetic &mdash; is given new information that naturally
              allows them to soften and feel safe.
            </p>
            <p>
              The new information allows an animal to no longer be locked in past traumas. They
              become present and at ease. They don&rsquo;t have to relive anything stressful to get
              over bad memories that had been a recurring pattern of fear, stress and negative
              influence.
            </p>
            <p>
              The communication with animals is done with natural frequencies that animals
              immediately feel and healing thoughts they understand. Most animals respond
              immediately. For others, repeating the process helps them over time.
            </p>
            <p>
              Through this work, Tapas has helped people and animals around the world find more
              peace, connection, and emotional well-being.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3. How TAT for Animals Began — Celeste Yarnall 스토리 (Tapas 원문 verbatim) */}
      <section className="py-20 lg:py-28 px-6 bg-white">
        <div className="max-w-3xl mx-auto">

          <motion.div {...fadeUp} className="mb-12">
            <div className="w-12 h-0.5 mb-8" style={{ backgroundColor: '#467826' }} />
            <p className="text-[13px] tracking-[0.2em] uppercase font-semibold mb-5"
              style={{ color: '#467826' }}>
              TAT for Animals
            </p>
            <h2 className="font-serif text-3xl lg:text-4xl text-charcoal font-medium leading-tight">
              How TAT&reg; for Animals Began
            </h2>
          </motion.div>

          <motion.div
            {...fadeUp}
            className="flex flex-col gap-6 text-charcoal/65 font-light leading-relaxed text-base sm:text-lg"
          >
            <p>
              In the 1990s, I received a phone call from a woman asking if I would make a house
              call to help her cat, who appeared to be suffering from an allergic reaction.
            </p>
            <p>I agreed and drove to her home in Beverly Hills, California.</p>
            <p>
              As she showed me around, I quickly realized this was no ordinary visit. One room was
              filled with mother cats and their kittens. Another housed playful young cats with
              climbing trees, toys, and plenty of space to explore. A third room was home to
              elegant adult cats. Everywhere I looked, I saw healthy, well-loved felines.
            </p>
            <Image
              src="/images/about/cat1.jpg"
              alt="A kitten resting calmly"
              width={5184}
              height={3456}
              sizes="(min-width: 768px) 720px, 100vw"
              className="w-full aspect-[4/3] object-cover rounded-2xl"
              style={{ boxShadow: '0 8px 32px rgba(28,16,7,0.10)' }}
            />
            <p>
              My client was Celeste Yarnall, who was writing a book on holistic cat care and was
              deeply interested in nutrition and natural approaches to animal wellness. At the
              time, I knew her only as a passionate advocate for cats and dogs. Years later, I
              learned that before becoming a respected authority on holistic animal care, she had
              also been a successful actress.
            </p>
            <p>
              Celeste explained that she had loaned one of her favorite cats, Juliet, to a friend.
              While Juliet was away, she began losing her hair and didn&rsquo;t seem to be doing
              well. After some time, Celeste brought Juliet back home and became concerned that the
              cat food her friend had been feeding her might be contributing to the problem. She
              called me to see whether I could help determine if the food was affecting
              Juliet&rsquo;s health.
            </p>
            <p>
              Celeste and I sat on the floor, with Juliet resting comfortably on my outstretched
              legs. Using the methods I was developing at the time, I was able to confirm that the
              new cat food had indeed been the problem. Celeste decided she would return Juliet to
              her original food.
            </p>
            <p>
              Then I asked whether there were other stressful experiences that might still be
              affecting Juliet and keeping her from feeling like herself again.
            </p>
            <p>
              Celeste told me that Juliet had never quite been the same after having her first
              litter. She also felt that a medication Juliet had received had affected her
              negatively. We addressed each of these experiences using TAT&reg; (Tapas Acupressure
              Technique&reg;).
            </p>
            <p>When we finished, Juliet let out a deep sigh.</p>
            <p>She stood up, gave herself a full-body shake, and calmly walked away.</p>
            <Image
              src="/images/about/cat3.jpg"
              alt="A young kitten at play with a toy"
              width={4304}
              height={3452}
              sizes="(min-width: 768px) 720px, 100vw"
              className="w-full aspect-[4/3] object-cover rounded-2xl"
              style={{ boxShadow: '0 8px 32px rgba(28,16,7,0.10)' }}
            />
            <p>I asked Celeste, &ldquo;Is there anything else we should look at for Juliet?&rdquo;</p>
            <p>She replied, &ldquo;No, that was everything.&rdquo;</p>
            <p>I sat there amazed.</p>
            <p>&ldquo;Wow,&rdquo; I said. &ldquo;I didn&rsquo;t know cats sighed.&rdquo;</p>
            <p>Celeste smiled and told me that was actually quite common for cats.</p>
            <p>
              About a week later, I called Celeste to see how Juliet was doing. She happily
              reported that Juliet&rsquo;s hair was growing back, she had regained her energy, and
              she was doing fine.
            </p>
            <p className="text-charcoal/85 font-normal">
              That experience marked the beginning of my work with animals using TAT&reg;.
            </p>
            <Image
              src="/images/about/cat2.jpg"
              alt="A young cat sitting peacefully"
              width={4368}
              height={2912}
              sizes="(min-width: 768px) 720px, 100vw"
              className="w-full aspect-[4/3] object-cover rounded-2xl"
              style={{ boxShadow: '0 8px 32px rgba(28,16,7,0.10)' }}
            />
            <p>
              Since then, working with animals&mdash;including cats, dogs, horses and birds&mdash;has
              been a continuing and rewarding part of my practice. Over the years, I have seen
              animals respond in ways that are often surprising, touching, and deeply meaningful to
              the people who love them.
            </p>
            <p>
              What began with a single house call grew into decades of experience supporting
              animals and their human companions.
            </p>
            <p>
              Today, TAT&reg; for Animals continues that journey&mdash;offering a gentle way to
              support emotional well-being, ease stress, and deepen the connection between animals
              and their humans.
            </p>
          </motion.div>

        </div>
      </section>

      {/* 4. 세션 후기 — 1:1 세션 실제 후기, 예약 CTA 바로 앞에 배치 (Tapas 2026-06-26).
          제목 문구는 Tapas 지정. 사진이 없으므로 editorial 타이포로 위계를 만든다:
          큰 장식 따옴표(초록 저투명) + 좌우 지그재그(ml/mr-auto)로 단조로운 벽을 피하고,
          이름 옆 context 라벨로 익명 텍스트에 사람 냄새를 입힌다.
          bg-cream — 위 스토리(bg-white)와 갈라, 아래 예약·Pricing까지 이어지는 "결정 존". */}
      <section className="pt-16 lg:pt-24 pb-12 px-6 bg-cream">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="mb-14 sm:mb-20 text-center">
            <p className="text-[13px] tracking-[0.2em] uppercase font-semibold mb-4"
              style={{ color: '#467826' }}>
              Sessions with Tapas
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-charcoal font-medium leading-snug">
              What People Say about their Sessions with Animals
            </h2>
          </motion.div>
          <div className="flex flex-col gap-14 sm:gap-20">
            {sessionTestimonials.map((t, i) => (
              <motion.figure
                {...fadeUp}
                key={t.name}
                className={`relative w-full max-w-[34rem] ${i % 2 === 1 ? 'ml-auto' : 'mr-auto'}`}
              >
                {/* 장식용 큰 따옴표 — 본문은 따옴표 없이 두고 이 글리프가 인용임을 표시.
                    aria-hidden: 스크린리더는 blockquote 시맨틱으로 이미 인용을 인지. */}
                <span
                  aria-hidden="true"
                  className="absolute -top-9 -left-1 font-serif leading-none select-none"
                  style={{ fontSize: '5.5rem', color: 'rgba(70,120,38,0.18)' }}
                >
                  &ldquo;
                </span>
                <blockquote className="relative font-serif text-lg sm:text-xl text-charcoal/85 leading-[1.7]">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="w-7 h-px flex-shrink-0" style={{ backgroundColor: '#467826' }} />
                  <span className="font-serif text-lg text-charcoal">{t.name}</span>
                  <span className="text-[12px] uppercase tracking-[0.12em]" style={{ color: '#467826' }}>
                    {t.context}
                  </span>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 1:1 예약 CTA — 파운더 스토리 다음, 구독 티어 앞에 두는 "다른 길".
          예약 문구는 Tapas 원문 그대로. 아래 Pricing이 showBooking=false로 예약을 끄고 있어
          (중복 방지), About의 1:1 예약 경로는 이 링크 하나뿐 — 제거 금지.
          Kai 세션 영상은 About 맥락에 안 맞아 제거 (Tapas 2026-06-25 요청).
          bg-white — 위 세션 후기(크림)와 아래 Pricing(크림) 사이의 흰 밴드로,
          섹션 배경을 크림/흰 교차시켜 Pricing 카드가 또렷이 떠 보이게 한다. */}
      <section className="pt-14 lg:pt-20 pb-20 lg:pb-28 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="text-center">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center min-h-[44px] gap-1.5 text-base sm:text-lg font-semibold underline underline-offset-4 hover:opacity-70 transition-opacity"
              style={{ color: '#467826' }}
            >
              Book a session for your animal&rsquo;s calm and well-being ↗
            </a>
          </motion.div>
        </div>
      </section>

      {/* 6. 구독 2단계 재노출 (Tapas 요청: "offer two subscription tiers again as on homepage").
          showBooking=false — 위 Book a session이 1:1 예약을 담당하므로 중복 방지.
          bg-cream — 위 예약 섹션(bg-white)과 색을 갈라 멤버십을 별도 섹션으로 구분. */}
      <Pricing showHeader bg="bg-cream" showBooking={false} />

      {/* 7. 녹화 후기 — 멤버십 offer 바로 뒤, 헤드라인 없이 가볍게 (Tapas 2026-06-26):
          멤버십이 주는 "녹화"에 동물이 반응한 후기 → 결제 직후의 조용한 안심.
          흰 여백에 띄우면 허공에 뜬 느낌이라, 부드러운 그린 틴트 패널로 바닥을 깔아
          두 후기를 한 쌍으로 묶는다. Michele=차분한 관찰, Betsey=감정의 마무리(살짝 크게). */}
      <section className="py-16 lg:py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.div
            {...fadeUp}
            className="rounded-3xl px-7 py-12 sm:px-14 sm:py-16 flex flex-col items-center gap-10 text-center"
            style={{ backgroundColor: 'rgba(70,120,38,0.05)' }}
          >
            {/* Michele — 차분한 관찰 (조용한 증거 톤) */}
            <figure className="flex flex-col items-center gap-4">
              <blockquote className="font-serif text-lg sm:text-xl text-charcoal/80 leading-relaxed">
                &ldquo;{recordingMichele.quote}&rdquo;
              </blockquote>
              <figcaption className="text-[12px] uppercase tracking-[0.12em]" style={{ color: '#467826' }}>
                {recordingMichele.name} &middot; {recordingMichele.context}
              </figcaption>
            </figure>

            {/* 짧은 구분선 — 두 후기를 한 쌍으로 잇는다 */}
            <span aria-hidden="true" className="w-10 h-px"
              style={{ backgroundColor: 'rgba(70,120,38,0.25)' }} />

            {/* Betsey — 짧고 강한 감정 (Michele과 동일 크기로 통일) */}
            <figure className="flex flex-col items-center gap-4">
              <blockquote className="font-serif text-lg sm:text-xl text-charcoal/80 leading-relaxed">
                &ldquo;{recordingBetsey.quote}&rdquo;
              </blockquote>
              <figcaption className="text-[12px] uppercase tracking-[0.12em]" style={{ color: '#467826' }}>
                {recordingBetsey.name} &middot; {recordingBetsey.context}
              </figcaption>
            </figure>
          </motion.div>
        </div>
      </section>

    </main>
  )
}
