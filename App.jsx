import LandingHero from './LandingHero';
import LandingProblem from './LandingProblem';
import LandingHowItWorks from './LandingHowItWorks';
import LandingCostComparison from './LandingCostComparison';
import LandingFeatures from './LandingFeatures';
import LandingTestimonials from './LandingTestimonials';
import LandingMountJuliet from './LandingMountJuliet';
import LandingSignup from './LandingSignup';
import LandingFooter from './LandingFooter';

export default function App() {
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