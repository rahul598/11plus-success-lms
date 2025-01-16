import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { GraduationCap, Users, Brain, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ResultsSection() {
  const results = [
    {
      title: "High Academic Standards",
      description: "Our students consistently outperform university averages, demonstrating exceptional academic growth.",
      icon: GraduationCap,
    },
    {
      title: "Parental Satisfaction",
      description: "Trusted by Parents and Guardians High satisfaction rates reflect our safe and enriching environment.",
      icon: Users,
    },
    {
      title: "Holistic Development",
      description: "Nurturing Well-Rounded Individuals Our approach focuses on character building, creativity, and critical thinking skills.",
      icon: Brain,
    },
    {
      title: "Extracurricular Achievements",
      description: "Excellence Beyond Academics Our students shine in sports, arts, and community service, showcasing diverse talents.",
      icon: Trophy,
    },
  ];

  return (
    <section className="relative py-16 overflow-hidden bg-gradient-to-b from-white to-[#E6FAF8]">
      {/* Wave background */}
      <div className="absolute inset-0 bg-[url('https://vinsonedge.com/wp-content/uploads/2025/01/wave.svg')] bg-repeat-x opacity-10" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4 text-[#2D3648]">
              Our Results Speak for Themselves
            </h2>
            <p className="text-xl text-[#545F71]">
              Lorem ipsum is simply dummy text of the printing and typesetting industry.
            </p>
            <Button className="mt-4 bg-[#32DBC9] hover:bg-[#2BC4B4] text-white">
              Read more →
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {results.map((result, index) => (
            <motion.div
              key={result.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="p-6 h-full bg-white/80 backdrop-blur-sm border-2 border-[#32DBC9]/20 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[#E6FAF8] flex items-center justify-center mb-4">
                    <result.icon className="h-8 w-8 text-[#32DBC9]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#2D3648] mb-3">
                    {result.title}
                  </h3>
                  <p className="text-[#545F71] text-sm">
                    {result.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
