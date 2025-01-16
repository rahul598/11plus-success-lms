import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen pt-20 overflow-hidden bg-gradient-to-b from-[#E6FAF8] to-white">
      {/* Background decorations */}
      <motion.img
        src="https://vinsonedge.com/wp-content/uploads/2025/01/rotating-star-01-3.png"
        alt="Star background"
        className="absolute right-[10%] top-[20%] w-8 h-8"
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          rotate: {
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          },
          scale: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      />

      {/* Floating backpack */}
      <motion.img
        src="https://vinsonedge.com/wp-content/uploads/2025/01/Bag-slider-01-1.png"
        alt="Floating backpack"
        className="absolute left-[15%] bottom-[30%] w-24 h-24"
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center pt-32">
          <motion.h1
            className="text-6xl font-bold mb-6 font-display text-[#2D3648]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            11Plus-Success Empower Your 11+ Journey
          </motion.h1>

          <motion.p
            className="text-xl mb-8 text-[#545F71]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            11 Plus preparation you can trust
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button
              size="lg"
              className="bg-[#32DBC9] hover:bg-[#2BC4B4] text-white px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <img
                src="https://vinsonedge.com/wp-content/uploads/2025/01/CTA-1.png"
                alt="Book Your Mock Exam Now"
                className="h-8"
              />
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>

        {/* Student image */}
        <motion.img
          src="https://vinsonedge.com/wp-content/uploads/2025/01/slider-2-char-1.png"
          alt="Student"
          className="absolute bottom-0 right-0 w-1/3 max-w-md"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        />
      </div>
    </section>
  );
}
