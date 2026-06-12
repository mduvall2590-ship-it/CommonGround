import { motion } from 'framer-motion';

const accentBorders = {
  'brand-primary': 'border-l-brand-primary',
  'brand-secondary': 'border-l-brand-secondary',
  'brand-accent': 'border-l-brand-accent',
  'brand-energy': 'border-l-brand-energy',
};

export default function Card({ icon, title, description, subline, accent = 'brand-primary', className = '', children }) {
  return (
    <motion.div
      className={`bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-8 border-l-4 ${accentBorders[accent] || accentBorders['brand-primary']} ${className}`}
      whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.10)' }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {icon && (
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4 bg-brand-primary-light">
          {icon}
        </div>
      )}
      {title && <h3 className="font-sans font-bold text-xl text-brand-text-heading mb-2">{title}</h3>}
      {description && <p className="font-sans text-[0.95rem] leading-relaxed text-brand-text mb-3">{description}</p>}
      {subline && (
        <p className="font-sans text-sm italic text-brand-primary/80 border-t border-brand-primary/10 pt-3 mt-2">
          {subline}
        </p>
      )}
      {children}
    </motion.div>
  );
}
