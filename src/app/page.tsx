import fs from 'fs';
import path from 'path';
import Hero from "@/components/Hero";
import ForAnimals from "@/components/ForAnimals";
import ForPeople from "@/components/ForPeople";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import AboutTapas from "@/components/AboutTapas";
import Footer from "@/components/Footer";

function getHeroImages() {
  const dir = path.join(process.cwd(), 'public/images/hero');
  try {
    return fs.readdirSync(dir)
      .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
      .map(f => ({ src: `/images/hero/${f}`, alt: 'A calm animal moment' }));
  } catch {
    return [{ src: '/images/tat_animal_calm.jpg', alt: 'A calm animal moment' }];
  }
}

export default function Home() {
  const heroImages = getHeroImages();
  return (
    <div className="flex flex-col">
      <Hero images={heroImages} />        {/* 1. 약속 */}
      <ForAnimals />                      {/* 2. 즉각 증명 */}
      <ForPeople />                       {/* 3. 개념 이해 */}
      <Testimonials />                    {/* 4. 사회적 증명 */}
      <Pricing />                         {/* 5. 전환 */}
      <AboutTapas />                      {/* 6. 최후 신뢰 */}
      <Footer />                          {/* 7. 내비게이션 */}
    </div>
  );
}
