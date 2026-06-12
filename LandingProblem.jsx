import { motion } from 'framer-motion';
import Button from './Button';
import { LANDING_COPY } from './copy';

export default function LandingProblem() {
  return (
    <section id="problem" className="py-20 lg:py-24 bg-brand-surface">
      <div className="container mx-auto px-6 lg:px-12 max-w-[1200px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-[2.5rem] leading-[1.2] text-brand-text-heading mb-4">
            {LANDING_COPY.problem.subheadline}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {LANDING_COPY.problem.painPoints.map((point, i) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-[16px] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-center hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] transition-all duration-200"
            >
              <div className="text-4xl mb-4">{point.icon}</div>
              <h3 className="font-sans font-bold text-xl text-brand-text-heading mb-2">{point.title}</h3>
              <p className="font-sans text-brand-text leading-relaxed">{point.desc}</p>
              <p className="font-sans text-sm text-brand-text/60 mt-3 italic">{point.sub}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button href="#features" variant="primary">
            {LANDING_COPY.problem.cta}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}