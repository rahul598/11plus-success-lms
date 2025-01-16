import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { VideoSection } from "@/components/video-section";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <VideoSection />
      <Footer />
    </div>
  );
}