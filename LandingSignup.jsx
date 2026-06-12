import { motion } from 'framer-motion';
import SignupForm from './SignupForm';
import { LANDING_COPY } from './copy';

export default function LandingSignup() {
  return (
    <section id="signup" className="py-20 lg:py-24" style={{ backgroundColor: '#0D7C8C' }}>
      <div className="container mx-auto px-6 lg:px-12 max-w-[900px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-[2.5rem] leading-[1.2] text-white mb-4">
            {LANDING_COPY.signup.headline}
          </h2>
          <p className="font-sans text-lg text-white/70 max-w-xl mx-auto">
            {LANDING_COPY.signup.subheadline}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
        >
          <SignupForm />
        </motion.div>

        <p className="font-sans text-center text-white/50 mt-6">
          {LANDING_COPY.signup.phone}
        </p>
      </div>
    </section>
  );
}