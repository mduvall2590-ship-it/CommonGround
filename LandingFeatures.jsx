import { motion } from 'framer-motion';
import Card from './Card';
import Button from './Button';
import { LANDING_COPY } from './copy';

export default function LandingFeatures() {
  return (
    <section id="features" className="py-20 lg:py-24 bg-brand-surface">
      <div className="container mx-auto px-6 lg:px-12 max-w-[1200px]">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-[2.5rem] leading-[1.2] text-brand-text-heading text-center mb-16"
        >
          {LANDING_COPY.features.headline}
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-6">
          {LANDING_COPY.features.cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card
                icon={card.icon}
                title={card.title}
                description={card.description}
                subline={card.subline}
                accent={card.accent}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Button variant="outline">{LANDING_COPY.features.cta}</Button>
        </motion.div>
      </div>
    </section>
  );
}