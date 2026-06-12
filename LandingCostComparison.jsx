import { motion } from 'framer-motion';
import Button from './Button';
import { LANDING_COPY } from './copy';

function AnimatedNumber({ value }) {
  const num = parseInt(value.replace(/[^0-9]/g, ''));
  return <span>{value}</span>;
}

export default function LandingCostComparison() {
  return (
    <section id="cost" className="py-20 lg:py-24" style={{ backgroundColor: '#0D7C8C' }}>
      <div className="container mx-auto px-6 lg:px-12 max-w-[1200px]">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-[2.5rem] leading-[1.2] text-white text-center mb-16"
        >
          {LANDING_COPY.costComparison.headline}
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Traditional */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-sm rounded-[16px] p-8 border border-white/20 hover:bg-white/15 transition-colors"
          >
            <h3 className="font-sans font-bold text-xl text-white/80 mb-6">{LANDING_COPY.costComparison.traditional.title}</h3>
            <div className="mb-6">
              <span className="font-display text-5xl text-white/60 line-through">{LANDING_COPY.costComparison.traditional.price}</span>
              <span className="font-sans text-white/60 ml-2">{LANDING_COPY.costComparison.traditional.perUnit}</span>
            </div>
            <ul className="space-y-3 mb-8">
              {LANDING_COPY.costComparison.traditional.details.map((detail) => (
                <li key={detail} className="font-sans text-white/70 flex items-center gap-2">{detail}</li>
              ))}
            </ul>
            <div className="border-t border-white/20 pt-4">
              <p className="font-sans text-white/60">{LANDING_COPY.costComparison.traditional.total}</p>
              <p className="font-sans text-sm text-white/40">{LANDING_COPY.costComparison.traditional.totalLabel}</p>
            </div>
          </motion.div>

          {/* CommonGround */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[16px] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)] transition-shadow"
          >
            <h3 className="font-sans font-bold text-xl text-brand-primary mb-6">{LANDING_COPY.costComparison.commonground.title}</h3>
            <div className="mb-6">
              <span className="font-display text-5xl text-brand-primary">{LANDING_COPY.costComparison.commonground.price}</span>
              <span className="font-sans text-brand-text ml-2">{LANDING_COPY.costComparison.commonground.perUnit}</span>
            </div>
            <ul className="space-y-3 mb-8">
              {LANDING_COPY.costComparison.commonground.details.map((detail) => (
                <li key={detail} className="font-sans text-brand-text flex items-center gap-2">{detail}</li>
              ))}
            </ul>
            <div className="border-t border-brand-primary/10 pt-4">
              <p className="font-sans font-bold text-brand-primary text-xl">{LANDING_COPY.costComparison.commonground.total}</p>
              <p className="font-sans text-sm text-brand-text/60">{LANDING_COPY.costComparison.commonground.totalLabel}</p>
            </div>
          </motion.div>
        </div>

        {/* Savings banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-brand-accent/20 backdrop-blur-sm rounded-[16px] p-6 border border-brand-accent/30 text-center mb-10"
        >
          <p className="font-display text-2xl text-white">{LANDING_COPY.costComparison.savingsBanner}</p>
        </motion.div>

        {/* Neighborhood-specific table */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {LANDING_COPY.costComparison.neighborhoodSavings.map((item) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm rounded-[10px] p-4 text-center border border-white/10"
            >
              <p className="font-sans text-sm text-white/70 mb-1">{item.name}</p>
              <p className="font-sans font-bold text-white text-lg">{item.savings}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Button variant="secondary" className="!text-lg">
            {LANDING_COPY.costComparison.cta}
          </Button>
        </div>
      </div>
    </section>
  );
}