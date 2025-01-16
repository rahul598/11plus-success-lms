import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screens pt-32 overflow-hidden bg-gradient-to-b from-[#E6FAF8] to-white">
      {/* Background decorations */}
      <div className="elemenBackgroundOverlay"></div>
      <motion.img
        src="https://vinsonedge.com/wp-content/uploads/2025/01/star-slider-01.png"
        alt="Star background"
        className="absolute right-[5%] top-[26%] w-16 h-16"
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

      {/* Additional Star Decorations */}
      <motion.img
        src="https://vinsonedge.com/wp-content/uploads/2025/01/rotating-star-01-3.png"
        alt="Star decoration"
        className="absolute left-[20%] top-[15%] w-4 h-4"
        animate={{
          rotate: -360,
          scale: [1, 1.3, 1],
        }}
        transition={{
          rotate: {
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          },
          scale: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      />

      {/* Small Star */}
      <motion.img
        src="https://vinsonedge.com/wp-content/uploads/2025/01/star-slider-01.png"
        alt="Star decoration"
        className="absolute right-[30%] bottom-[30%] w-3 h-3"
        animate={{
          rotate: 360,
          scale: [1, 1.4, 1],
        }}
        transition={{
          rotate: {
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          },
          scale: {
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-12 gap-8 items-center">
          {/* Content Column (8/12) */}
          <div className="col-span-12 lg:col-span-8">
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
              Boost your chances of securing a place at a Trafford Grammar with
              11Plus Success! With decades of experience specialising in 11+
              preparation, our services are student-focused to develop skills
              that will maximise your chances of success in the ever-competitive
              Trafford Examination process
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button
                size="lg"
                className="relative mbtn transition-all duration-300"
              >
                <span className="absolute -bottom-1 left-0 right-0 mx-auto h-2 w-full bg-[#14756F] rounded-full blur-md -z-10"></span>
                Book Your Mock Exam Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>

          {/* Image Column (4/12) */}
          <div className="col-span-12 lg:col-span-4">
            <div className="relative">
              <motion.img
                src="https://vinsonedge.com/wp-content/uploads/2025/01/slider-2-char-1.png"
                alt="Student"
                className="w-full"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              />

              {/* Floating backpack */}
              <motion.img
                src="https://vinsonedge.com/wp-content/uploads/2025/01/Bag-slider-01-1.png"
                alt="Floating backpack"
                className="absolute left-[-39%] bottom-[0%] w-64 h-64"
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
