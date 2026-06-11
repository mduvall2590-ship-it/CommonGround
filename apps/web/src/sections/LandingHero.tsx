import { motion } from 'framer-motion';
import Button from '../components/Button';
import { LANDING_COPY } from '../copy';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function LandingHero() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="relative min-h-screen flex flex-col">
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, #0D7C8C 0%, rgba(13,124,140,0.85) 50%, rgba(232,168,56,0.3) 100%), center/cover no-repeat',
        }}
      />

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold text-sm">CG</div>
          <span className="font-sans font-bold text-white text-lg">{LANDING_COPY.nav.logo}</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {LANDING_COPY.nav.links.map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`} className="font-sans text-white/80 hover:text-white transition-colors relative group">
              {link}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
            </a>
          ))}
          <Button variant="primary" className="!text-sm !py-2 !px-5">{LANDING_COPY.nav.cta}</Button>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 bg-brand-primary/95 backdrop-blur-md md:hidden px-6 py-4"
        >
          {LANDING_COPY.nav.links.map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`} className="block py-2 text-white/80 hover:text-white" onClick={() => setMenuOpen(false)}>
              {link}
            </a>
          ))}
          <Button variant="primary" className="mt-3 w-full">{LANDING_COPY.nav.cta}</Button>
        </motion.div>
      )}

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Column */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="font-sans text-sm font-medium text-white/70 uppercase tracking-widest mb-4">
                {LANDING_COPY.hero.eyebrow}
              </p>
              <h1 className="font-display text-[3.5rem] leading-[1.1] text-white mb-6 max-w-2xl">
                {LANDING_COPY.hero.headline}
              </h1>
              <p className="font-sans text-lg leading-relaxed text-white/80 mb-8 max-w-xl">
                {LANDING_COPY.hero.subheadline}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 mb-8">
                <Button variant="secondary" className="!text-lg !py-4 !px-9">
                  {LANDING_COPY.hero.cta}
                </Button>
                <a href="#cost" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors font-sans font-medium">
                  {LANDING_COPY.hero.ctaSecondary}
                </a>
              </div>

              {/* Trust bar */}
              <p className="font-sans text-sm text-white/60 flex items-center gap-2">
                <span className="text-brand-accent">✦</span> {LANDING_COPY.hero.trustBar}
              </p>
            </motion.div>

            {/* Visual Column */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:block"
            >
              <div className="relative aspect-[4/3] rounded-[16px] overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🏘️</div>
                    <p className="text-white/60 font-sans text-sm">Old Hickory Lake · Golden Hour</p>
                  </div>
                </div>
                {/* Silhouette dots */}
                <div className="absolute bottom-8 left-8 right-8 flex justify-around">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-6 h-6 bg-white/20 rounded-sm" />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-3xl"
          >
            {LANDING_COPY.hero.stats.map((stat) => (
              <div key={stat.value} className="bg-white/10 backdrop-blur-sm rounded-[10px] px-4 py-3 border border-white/10 text-center">
                <div className="font-sans font-bold text-white text-lg">{stat.value}</div>
                <div className="font-sans text-xs text-white/60">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
