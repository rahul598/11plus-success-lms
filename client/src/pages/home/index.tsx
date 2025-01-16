import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { VideoSection } from "@/components/video-section";
import { FeatureSection } from "@/components/feature-section";
import { TestimonialSection } from "@/components/testimonial-section";
import { PricingSection } from "@/components/pricing-section";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <VideoSection />
      <FeatureSection />
      <TestimonialSection />
      <PricingSection />
      <Footer />
    </div>
  );
}