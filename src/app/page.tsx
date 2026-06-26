import { PublicLayout } from "@/components/public/PublicLayout";
import { HeroSection } from "./_sections/Hero";
import { FeaturesSection } from "./_sections/Features";
import { HowItWorksSection } from "./_sections/HowItWorks";
import { ServicesShowcase } from "./_sections/ServicesShowcase";
import { AppSpacesSection } from "./_sections/AppSpaces";
import { AiAssistantSection } from "./_sections/AiAssistant";
import { WellnessArticlesSection } from "./_sections/WellnessArticles";
import { TestimonialsSection } from "./_sections/Testimonials";
import { StatsSection } from "./_sections/Stats";
import { CTASection } from "./_sections/CTA";

export default function HomePage() {
  return (
    <PublicLayout>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ServicesShowcase />
      <AppSpacesSection />
      <AiAssistantSection />
      <WellnessArticlesSection />
      <TestimonialsSection />
      <StatsSection />
      <CTASection />
    </PublicLayout>
  );
}
