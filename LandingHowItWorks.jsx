import { motion } from 'framer-motion';
import { LANDING_COPY } from '../copy';

export default function LandingHowItWorks() {
  return (
    <section id="pricing" className="py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12 max-w-[1200px]">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-[2.5rem] leading-[1.2] text-brand-text-heading text-center mb-16 max-w-3xl mx-auto"
        >
          {LANDING_COPY.howItWorks.headline}
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-px border-t-2 border-dashed border-brand-primary/20" />

          {LANDING_COPY.howItWorks.steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative text-center"
            >
              <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 shadow-[0_4px_12px_rgba(13,124,140,0.2)]">
                <span className="text-white font-sans font-bold text-xl">{step.number}</span>
              </div>
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="font-sans font-bold text-xl text-brand-text-heading mb-3">{step.title}</h3>
              <p className="font-sans text-brand-text leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}