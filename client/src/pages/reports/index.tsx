import { Header } from "@/components/header";

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gradient-primary">
      <Header />
      <div className="container mx-auto px-4 pt-32">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-[#2D3648] mb-6">
          Reports
        </h1>
        <p className="text-lg text-[#545F71] mb-8">
          Track your progress and understand your performance with detailed reports
        </p>
        {/* Reports content will be added here */}
      </div>
    </div>
  );
}
