import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export function VideoSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <Card className="overflow-hidden rounded-xl border-2 border-[#32DBC9]/20 bg-gradient-to-br from-white to-[#E6FAF8]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          {/* Left side - Image */}
          <div className="relative">
            <motion.img
              src="https://vinsonedge.com/wp-content/uploads/2025/01/Screenshot 2025-01-16 at 8.27.20 PM.png"
              alt="Interactive Video Platform"
              className="w-full rounded-lg shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            />
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#32DBC9]/10 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#32DBC9]/10 rounded-full blur-xl" />
          </div>

          {/* Right side - Content */}
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold mb-6 text-[#2D3648]">
                Interactive Learning Platform
              </h2>
              <p className="text-lg text-[#545F71] mb-8">
                Engage with our comprehensive video lessons and interactive content designed specifically for 11+ preparation.
              </p>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-[#32DBC9]">500+</div>
                  <div className="text-sm text-[#545F71]">Video Lessons</div>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-[#32DBC9]">24/7</div>
                  <div className="text-sm text-[#545F71]">Access</div>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-[#32DBC9]">100%</div>
                  <div className="text-sm text-[#545F71]">Interactive</div>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-[#32DBC9]">95%</div>
                  <div className="text-sm text-[#545F71]">Success Rate</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Card>
    </section>
  );
}
