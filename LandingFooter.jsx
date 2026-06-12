import { motion } from 'framer-motion';
import { LANDING_COPY } from './copy';

export default function LandingFooter() {
  return (
    <footer className="py-16" style={{ backgroundColor: '#1A202C' }}>
      <div className="container mx-auto px-6 lg:px-12 max-w-[1200px]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {LANDING_COPY.footer.columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-sans font-semibold text-white/80 mb-4 text-sm uppercase tracking-wider">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="font-sans text-white/50 hover:text-white/80 transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-white/10 pt-8 text-center"
        >
          <p className="font-display text-xl text-white/60 mb-2">
            CommonGround — {LANDING_COPY.footer.tagline}
          </p>
          <p className="font-sans text-sm text-white/40">
            {LANDING_COPY.footer.copyright} · {LANDING_COPY.footer.location}
          </p>
        </motion.div>
      </div>
    </footer>
  );
}