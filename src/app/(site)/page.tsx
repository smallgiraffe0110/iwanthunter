import HeroSection from '@/components/sections/hero-section-hunter';
import UploadSection from '@/components/sections/upload-section';
import HowItWorksSection from '@/components/sections/how-it-works';
import FeaturesSection from '@/components/sections/features-section';
import UseCasesSection from '@/components/sections/use-cases-section';
import FAQSection from '@/components/sections/faq-section-hunter';

export default function Home() {
  return (
    <>
      <HeroSection />
      <UploadSection />
      <HowItWorksSection />
      <FeaturesSection />
      <UseCasesSection />
      <FAQSection />
    </>
  );
}
