import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export function VideoSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <Card className="overflow-hidden rounded-xl border-2 border-[#32DBC9]/20 bg-gradient-to-br from-white to-[#E6FAF8]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
          {/* Left side - Video Player */}
          <div className="relative">
            <motion.div
              className="aspect-video rounded-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <video
                className="w-full h-full object-cover"
                controls
                poster="https://vinsonedge.com/wp-content/uploads/2025/01/Screenshot 2025-01-16 at 8.27.20 PM.png"
              >
                <source src="/path-to-your-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </motion.div>
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
                Engage with our comprehensive video lessons designed specifically for 11+ preparation. Watch expert tutors explain complex concepts in a simple and engaging way.
              </p>
            </motion.div>
          </div>
        </div>
      </Card>
    </section>
  );
}