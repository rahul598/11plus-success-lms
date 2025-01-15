import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen pt-20 overflow-hidden bg-[#FFF6E9]">
      {/* Background decorations */}
      <motion.img
        src="https://dtthemes.kinsta.cloud/a-for-apple/wp-content/uploads/sites/2/2024/02/slider-2-star-bg.png"
        alt="Star background"
        className="absolute inset-0 w-full h-full object-cover z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      
      {/* Floating circle */}
      <motion.img
        src="https://dtthemes.kinsta.cloud/a-for-apple/wp-content/uploads/sites/2/2024/02/slider-2-circel.webp"
        alt="Circle decoration"
        className="absolute right-[10%] top-[20%] w-32 h-32"
        animate={{ 
          y: [0, -20, 0],
          rotate: 360
        }}
        transition={{
          y: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          },
          rotate: {
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }
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
            Let's Make Learning Fun & Engaging
          </motion.h1>

          <motion.p 
            className="text-xl mb-8 text-[#545F71]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Interactive educational games and activities for children
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button
              size="lg"
              className="bg-[#FF6B00] hover:bg-[#FF8533] text-white px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              Start Learning Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>

        {/* Character image */}
        <motion.img
          src="https://dtthemes.kinsta.cloud/a-for-apple/wp-content/uploads/sites/2/2024/02/slider-2-char.webp"
          alt="Learning character"
          className="absolute bottom-0 right-0 w-1/3 max-w-md"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        />
      </div>
    </section>
  );
}
