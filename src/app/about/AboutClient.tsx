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

export default function AboutClient() {
  return (
    <main className="bg-cream">

      {/* 1. 헤더 */}
      <section className="pt-28 sm:pt-32 pb-4 px-6">
        <div className="max-w-4xl mx-auto">
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
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">

          {/* 사진 */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
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
              <span className="text-xs text-charcoal/65 font-light tracking-wide">TATLife® Founded</span>
            </motion.div>
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

            <div className="h-px bg-charcoal/8 my-2" />

            <blockquote className="font-serif text-xl sm:text-2xl text-charcoal/80 leading-snug">
              &ldquo;I love to help people and animals find peace &mdash;
              one person, one animal at a time.&rdquo;
            </blockquote>
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

      {/* 4. Kai 세션 영상 + 1:1 예약 — "영상 보고 감동 → 바로 신청"이 끊기지 않게 한 블록으로 묶음.
          영상은 현행 ~9분 Kai 클립(1080084066, Tapas "~9분" 사양). Jez가 52분 풀세션(1074372917,
          "2025-04-04 TAT for Dogs") 교체 제안 — 길이/제목 충돌로 확인 대기(교체 보류).
          연결 문구는 우리 카피, 예약 문구는 Tapas 원문 그대로. */}
      <section className="pb-20 lg:pb-28 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp}>
            {/* 영상 — Kai 클립 (Vimeo 1080084066, ~9분). autoplay 미설정(프로젝트 자동재생 금지 규칙). */}
            <div
              className="relative aspect-video rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 0 0 1px rgba(28,16,7,0.06)' }}
            >
              <iframe
                src="https://player.vimeo.com/video/1080084066?title=0&byline=0&portrait=0&dnt=1"
                title="Kai&rsquo;s Journey — a full TAT&reg; session"
                className="absolute inset-0 w-full h-full"
                allow="fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="text-center text-sm text-muted mt-4">
              A full TAT&reg; session with Kai
            </p>

            {/* 영상 → 예약: 새 카피 없이 같은 블록·좁은 간격만으로 흐름을 이음.
                연결 문장이 필요하면 Tapas에게 한 줄 요청 (콘텐츠는 Tapas 영역). */}
            <div className="text-center mt-6">
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center min-h-[44px] gap-1.5 text-base sm:text-lg font-semibold underline underline-offset-4 hover:opacity-70 transition-opacity"
                style={{ color: '#467826' }}
              >
                Book a session for your animal&rsquo;s calm and well-being →
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. 구독 2단계 재노출 (Tapas 요청: "offer two subscription tiers again as on homepage").
          showBooking=false — 위 Book a session이 1:1 예약을 담당하므로 중복 방지.
          bg-cream — 위 Kai/예약 섹션(bg-white)과 색을 갈라 멤버십을 별도 섹션으로 구분. */}
      <Pricing showHeader bg="bg-cream" showBooking={false} />

    </main>
  )
}
