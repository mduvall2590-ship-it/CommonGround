import { motion } from 'framer-motion';
import { LANDING_COPY } from './copy';

export default function LandingTestimonials() {
  return (
    <section className="py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12 max-w-[1200px]">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-[2.5rem] leading-[1.2] text-brand-text-heading text-center mb-16"
        >
          {LANDING_COPY.testimonials.headline}
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {LANDING_COPY.testimonials.quotes.map((quote, i) => (
            <motion.div
              key={quote.author}
              initial={{ opacity: 0, x: i === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="bg-brand-surface rounded-[16px] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
            >
              <div className="text-4xl text-brand-primary/20 mb-4 leading-none">"</div>
              <p className="font-sans text-brand-text leading-relaxed mb-6 italic">
                "{quote.text}"
              </p>
              <div className="border-t border-brand-primary/10 pt-4">
                <p className="font-sans font-semibold text-brand-text-heading">{quote.author}</p>
                <p className="font-sans text-sm text-brand-text/60">{quote.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}