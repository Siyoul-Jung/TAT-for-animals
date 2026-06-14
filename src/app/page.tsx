import fs from 'fs';
import path from 'path';
import { Suspense } from 'react';
import AccountNotice from "@/components/AccountNotice";
import Hero from "@/components/Hero";
import TrySession from "@/components/TrySession";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import AboutTapas from "@/components/AboutTapas";

function getHeroImages() {
  const dir = path.join(process.cwd(), 'public/images/hero/vertical');
  try {
    return fs.readdirSync(dir)
      .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
      .map(f => ({ src: `/images/hero/vertical/${f}`, alt: 'A calm animal moment' }));
  } catch {
    return [{ src: '/images/tat_animal_calm.jpg', alt: 'A calm animal moment' }];
  }
}

export default function Home() {
  const heroImages = getHeroImages();
  return (
    <div className="flex flex-col">
      <Suspense fallback={null}><AccountNotice /></Suspense>
      <Hero images={heroImages} />        {/* 1. 약속 */}
      <TrySession />                      {/* 2. 즉각 증명 */}
      <Testimonials />                    {/* 4. 사회적 증명 */}
      <Pricing />                         {/* 5. 전환 */}
      <AboutTapas />                      {/* 6. 최후 신뢰 */}
    </div>
  );
}
