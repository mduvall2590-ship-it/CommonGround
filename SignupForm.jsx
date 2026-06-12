import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import { LANDING_COPY } from './copy';

export default function SignupForm() {
  const [formData, setFormData] = useState({
    neighborhood: '',
    name: '',
    email: '',
    phone: '',
    role: 'Board Member',
    units: '',
    currentMgmt: '',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!formData.neighborhood || formData.neighborhood.length < 3) errs.neighborhood = 'Min 3 characters';
    if (!formData.name || formData.name.length < 2) errs.name = 'Min 2 characters';
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Valid email required';
    if (!formData.units || parseInt(formData.units) <= 5) errs.units = 'Must be more than 5';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  const fields = [
    { name: 'neighborhood', label: LANDING_COPY.signup.fields.neighborhood, type: 'text', required: true },
    { name: 'name', label: LANDING_COPY.signup.fields.name, type: 'text', required: true },
    { name: 'email', label: LANDING_COPY.signup.fields.email, type: 'email', required: true },
    { name: 'phone', label: LANDING_COPY.signup.fields.phone, type: 'tel', required: false },
    { name: 'role', label: LANDING_COPY.signup.fields.role, type: 'select', required: false },
    { name: 'units', label: LANDING_COPY.signup.fields.units, type: 'number', required: true },
    { name: 'currentMgmt', label: LANDING_COPY.signup.fields.currentMgmt, type: 'text', required: false },
  ];

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[16px] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-center"
        >
          <div className="w-16 h-16 bg-brand-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h3 className="font-sans font-bold text-xl text-brand-text-heading mb-2">You're on the list!</h3>
          <p className="text-brand-text">{LANDING_COPY.signup.success}</p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-[16px] p-8 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
        >
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-brand-text mb-1">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-[10px] border bg-white text-brand-text-heading transition-all duration-200
                      ${errors[field.name] ? 'border-brand-error ring-2 ring-brand-error/20' : 'border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20'}`}
                  >
                    {['Board Member', 'Resident', 'Property Manager', 'Developer'].map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-[10px] border bg-white text-brand-text-heading transition-all duration-200
                      ${errors[field.name] ? 'border-brand-error ring-2 ring-brand-error/20' : 'border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20'}`}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                )}
                {errors[field.name] && (
                  <p className="text-sm text-brand-error mt-1">{errors[field.name]}</p>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button
              type="submit"
              variant="primary"
              className="w-full !py-4 !text-lg"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                LANDING_COPY.signup.cta
              )}
            </Button>
          </div>
          <p className="text-sm text-brand-text/70 text-center mt-4">{LANDING_COPY.signup.disclaimer}</p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
