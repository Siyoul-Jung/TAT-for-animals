// src/app/membership/MembershipClient.tsx
'use client';

import { motion } from 'framer-motion';
import { Heart, Sparkles, Sprout, Sun, Check, HelpCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function MembershipClient() {
  const pathname = usePathname();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  async function handleCheckout(plan: string) {
    setLoadingPlan(plan);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      if (res.status === 401) {
        // 로그인 안 된 경우 → 로그인 페이지로
        router.push('/login?next=/membership');
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Something went wrong. Please try again.');
        setLoadingPlan(null);
      }
    } catch {
      alert('Something went wrong. Please try again.');
      setLoadingPlan(null);
    }
  }

  const tiers = [
    {
      plan: 'self',
      name: "The Home Practice",
      price: "24",
      icon: Sprout,
      description: "Quiet, independent space for your daily ritual of calm.",
      features: [
        "Full Practice Hub access",
        "Recorded masterclasses",
        "Progress tracking",
        "Community forum"
      ],
      buttonText: "Start Your Journey",
      popular: false
    },
    {
      plan: 'pro',
      name: "The Guided Circle",
      price: "47",
      icon: Sun,
      description: "Direct connection and weekly live support for profound healing.",
      features: [
        "Everything in Home Practice",
        "Weekly Live Support with Tapas",
        "Priority Q&A Sessions",
        "Private Group Coaching"
      ],
      buttonText: "Join the Guided Circle",
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-white selection:bg-brand/20">
      {/* Hero: Heartfelt Connection */}
      <section className="relative pt-40 pb-24 md:pb-40 overflow-hidden bg-gradient-to-br from-cream via-white to-brand/5">
        {/* Dynamic Background Decor */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[120px] -z-10 -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand/5 rounded-full blur-[100px] -z-10 translate-y-1/4 -translate-x-1/4" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-brand/10 text-brand rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-10 shadow-sm">
              <Heart size={14} className="fill-brand" />
              <span>A Shared Peace</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-charcoal mb-10 leading-[1.1] tracking-tighter">
              Their Relief, <br/>
              <span className="text-brand italic serif font-normal drop-shadow-sm">Your Release.</span>
            </h1>
            <p className="text-xl md:text-2xl text-charcoal/60 mb-12 leading-relaxed max-w-xl font-medium">
              Membership isn&apos;t just a subscription—it&apos;s a commitment to the quiet, profound bond you share with your animal.
            </p>
            <div className="flex flex-wrap gap-6">
               <Button 
                 size="lg" 
                 className="px-12 py-8 text-lg font-bold shadow-xl shadow-brand/20 hover:scale-105 transition-all"
                 onClick={() => document.getElementById('tiers')?.scrollIntoView({ behavior: 'smooth' })}
               >
                 Choose Your Path
               </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-[5rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] aspect-[4/5] md:aspect-square border-8 border-white">
               <Image 
                 src="/images/membership-hero.png"
                 alt="Woman hugging a dog calmly"
                 fill
                 className="object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-brand/20 to-transparent" />
            </div>
            {/* Playful Floating Badge */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-8 -right-8 bg-white p-8 rounded-[3rem] shadow-2xl z-20 border border-brand/10 max-w-[200px]"
            >
               <Sparkles className="text-brand w-8 h-8 mb-3" />
               <p className="text-sm font-bold text-charcoal leading-tight italic serf">&quot;The calm ripples out to everyone.&quot;</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Tiers: The Paths to Calm */}
      <section id="tiers" className="py-40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-28">
             <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 text-brand rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-8"
              >
                <Sun size={14} className="fill-brand" />
                <span>Choose Your Journey</span>
              </motion.div>
             <h2 className="text-4xl md:text-6xl font-bold text-charcoal mb-8 tracking-tighter">Choose Your <span className="text-brand italic serif font-normal">Path to Calm.</span></h2>
             <p className="text-lg md:text-xl text-charcoal/60 max-w-2xl mx-auto leading-relaxed">
                Whether you prefer the quiet rhythm of independent practice or the shared energy of a guided circle, there is a space here for you.
             </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {tiers.map((tier, idx) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, type: 'spring', stiffness: 50 }}
                className={`group relative p-14 rounded-[4rem] border-2 transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(244,114,22,0.15)] flex flex-col ${
                  tier.popular 
                    ? 'bg-white border-brand shadow-xl translate-y-[-10px]' 
                    : 'bg-white/40 backdrop-blur-sm border-brand/10'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-brand text-white text-[10px] font-bold uppercase tracking-[0.2em] px-8 py-2 rounded-full shadow-lg z-20">
                    Most Recommended
                  </div>
                )}

                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-10 shadow-sm ${tier.popular ? 'bg-brand text-cream' : 'bg-brand/10 text-brand'}`}>
                   <tier.icon size={32} />
                </div>
                
                <h3 className="text-3xl font-bold mb-4 text-charcoal">{tier.name}</h3>
                <div className="flex items-baseline gap-2 mb-10">
                  <span className="text-5xl font-bold text-charcoal tracking-tighter">${tier.price}</span>
                  <span className="text-sm text-charcoal/30 font-bold uppercase tracking-widest">/ month</span>
                </div>
                
                <p className="mb-10 text-lg italic text-charcoal/60 leading-relaxed font-medium">
                  &ldquo;{tier.description}&rdquo;
                </p>
                
                <div className="space-y-5 mb-14 flex-grow">
                  {tier.features.map(f => (
                    <div key={f} className="flex gap-4 items-center group/item">
                       <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center group-hover/item:bg-brand/20 transition-colors">
                          <Check size={14} className="text-brand shrink-0" />
                       </div>
                       <span className="text-base font-medium text-charcoal/80">{f}</span>
                    </div>
                  ))}
                </div>

                <Button
                  variant={tier.popular ? "primary" : "outline"}
                  className={`w-full py-8 text-lg font-bold rounded-[2.5rem] transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                    tier.popular
                      ? 'bg-brand text-cream border-brand shadow-lg shadow-brand/20 hover:scale-[1.02]'
                      : 'border-brand/20 text-brand hover:bg-brand/5 hover:border-brand/40'
                  }`}
                  onClick={() => handleCheckout(tier.plan)}
                  disabled={loadingPlan !== null}
                >
                  {loadingPlan === tier.plan ? 'Connecting...' : tier.buttonText}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Emotional Quote */}
      <section className="py-40 relative overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/5 rounded-full blur-[120px] -z-10" />
         <div className="max-w-4xl mx-auto text-center px-6">
            <Sparkles className="text-brand w-12 h-12 mx-auto mb-10 animate-pulse" />
            <blockquote className="text-4xl md:text-5xl font-light italic leading-[1.3] text-charcoal tracking-tight">
               &ldquo;We aren&apos;t just trying to make them behaviorally better. We are trying to make their <span className="text-brand not-italic font-bold">soul feel safe again.</span>&rdquo;
            </blockquote>
            <p className="mt-10 text-charcoal/40 font-bold uppercase tracking-[0.3em] text-xs">— Tapas Fleming</p>
         </div>
      </section>

      {/* FAQ Banner */}
      <section className="pb-40 px-6">
         <motion.div 
           initial={{ opacity: 0, scale: 0.98 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="max-w-5xl mx-auto bg-gradient-to-br from-brand/10 to-transparent rounded-[5rem] p-16 border border-brand/20 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden shadow-inner group"
         >
            <div className="absolute inset-0 bg-white/40 backdrop-blur-xl -z-10" />
            <div className="shrink-0 w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-brand/10 group-hover:scale-110 transition-transform">
               <HelpCircle className="text-brand w-10 h-10" />
            </div>
            <div className="flex-grow">
               <h4 className="text-2xl font-bold mb-4 text-charcoal">Have questions about the journey?</h4>
               <p className="text-charcoal/60 text-lg leading-relaxed font-medium">
                 We&apos;re here to ensure you and your animal feel completely supported. Explore our full library of guides or reach out directly to our team.
               </p>
            </div>
            <Button variant="outline" className="shrink-0 border-brand/20 text-brand px-10 py-8 text-lg font-bold rounded-3xl hover:bg-brand/5">Read FAQs</Button>
         </motion.div>
      </section>
    </div>
  );
}
