import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-brand-primary text-white hover:bg-brand-primary-hover hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(13,124,140,0.25)]',
  secondary: 'bg-white/15 text-white border-2 border-white/30 hover:bg-white/25 hover:border-white/50',
  energy: 'bg-brand-energy text-white hover:bg-[#D55A4E] hover:-translate-y-0.5',
  outline: 'bg-transparent text-brand-primary border-2 border-brand-primary hover:bg-brand-primary-light',
};

export default function Button({ variant = 'primary', children, className = '', href, onClick, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-[10px] font-semibold text-base transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer';
  const cls = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <motion.a
        href={href}
        className={cls}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      className={cls}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  );
}
