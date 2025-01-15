import { Header } from "@/components/header";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-primary">
      <Header />
      <div className="container mx-auto px-4 pt-32">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-[#2D3648] mb-6">
          About Us
        </h1>
        <p className="text-lg text-[#545F71] mb-8">
          Learn more about our mission to help students succeed in their 11+ journey
        </p>
        {/* About content will be added here */}
      </div>
    </div>
  );
}
