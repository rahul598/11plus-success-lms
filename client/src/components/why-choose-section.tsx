import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function WhyChooseSection() {
  const features = [
    "Tailored Mock Exams",
    "AI-Driven Performance Insights",
    "Engaging Learning Tools",
    "Parent-Friendly Dashboards",
    "Comprehensive Reports",
    "Real-Time Feedback",
    "Interactive & Adaptive Learning"
  ];

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left side - Features */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-8 text-[#2D3648]">
            Why Choose 11 Plus-Success
          </h2>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left p-4 hover:bg-[#E6FAF8] ${
                    index === 0 ? 'bg-[#E6FAF8] text-[#32DBC9]' : 'bg-white'
                  }`}
                >
                  {feature}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right side - Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative"
        >
          <div className="bg-[#E6FAF8] rounded-lg p-8">
            <img
              src="/dashboard-preview.png"
              alt="Dashboard Preview"
              className="w-full rounded-lg shadow-lg"
            />
            <p className="mt-4 text-sm text-[#545F71] text-center">
              Create customized exams for Verbal and Non-Verbal Reasoning, English, and Mathematics
            </p>
          </div>
          {/* Decorative elements */}
          <div className="absolute -z-10 -top-4 -right-4 w-24 h-24 bg-[#32DBC9]/10 rounded-full blur-xl" />
          <div className="absolute -z-10 -bottom-4 -left-4 w-32 h-32 bg-[#32DBC9]/10 rounded-full blur-xl" />
        </motion.div>
      </div>
    </section>
  );
}
