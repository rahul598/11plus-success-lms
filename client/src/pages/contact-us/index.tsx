import { Header } from "@/components/header";

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-gradient-primary">
      <Header />
      <div className="container mx-auto px-4 pt-32">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-[#2D3648] mb-6">
          Contact Us
        </h1>
        <p className="text-lg text-[#545F71] mb-8">
          Get in touch with us for any questions or support
        </p>
        {/* Contact form will be added here */}
      </div>
    </div>
  );
}
