import LandingHero from '../sections/LandingHero';
import LandingProblem from '../sections/LandingProblem';
import LandingHowItWorks from '../sections/LandingHowItWorks';
import LandingCostComparison from '../sections/LandingCostComparison';
import LandingFeatures from '../sections/LandingFeatures';
import LandingTestimonials from '../sections/LandingTestimonials';
import LandingMountJuliet from '../sections/LandingMountJuliet';
import LandingSignup from '../sections/LandingSignup';
import LandingFooter from '../sections/LandingFooter';

export default function Landing() {
  return (
    <main className="min-h-screen bg-brand-surface">
      <LandingHero />
      <LandingProblem />
      <LandingHowItWorks />
      <LandingCostComparison />
      <LandingFeatures />
      <LandingTestimonials />
      <LandingMountJuliet />
      <LandingSignup />
      <LandingFooter />
    </main>
  );
}
