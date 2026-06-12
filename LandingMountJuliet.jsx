import { motion } from 'framer-motion';
import { LANDING_COPY } from '../copy';

export default function LandingMountJuliet() {
  return (
    <section className="py-20 lg:py-24 bg-brand-primary-light">
      <div className="container mx-auto px-6 lg:px-12 max-w-[1200px]">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-[2.5rem] leading-[1.2] text-brand-text-heading text-center mb-4"
        >
          {LANDING_COPY.mountJuliet.headline}
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {LANDING_COPY.mountJuliet.features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="bg-white rounded-[16px] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] transition-all duration-200"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-sans font-bold text-lg text-brand-text-heading mb-3">{feature.title}</h3>
              <p className="font-sans text-brand-text leading-relaxed text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-sans text-center text-brand-text/70 mt-12 max-w-2xl mx-auto italic"
        >
          {LANDING_COPY.mountJuliet.tagline}
        </motion.p>
      </div>
    </section>
  );
}