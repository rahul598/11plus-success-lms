import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ChartBar, Puzzle, Calendar, Brain } from "lucide-react";

export function FeatureSection() {
  const features = [
    {
      title: "Performance",
      description: "Skill-Based Feedback Reports highlighting specific strengths and weaknesses in Verbal Reasoning, English, Mathematics",
      icon: ChartBar,
      bgColor: "from-[#E6FAF8] to-white"
    },
    {
      title: "Gamification",
      description: "Gamification for Students Badges for milestones like 'First Mock Completed' or 'Top 10 in Verbal Reasoning'",
      icon: Puzzle,
      bgColor: "from-[#E6FAF8] to-white"
    },
    {
      title: "Availability",
      description: "Scheduling and Availability Management Flexible booking options with multiple dates and timeslots for mock exams",
      icon: Calendar,
      bgColor: "from-[#E6FAF8] to-white"
    },
    {
      title: "Analytics",
      description: "Advanced Analytics and Recommendations Highlight topics over time, showing improvement or areas needing extra attention",
      icon: Brain,
      bgColor: "from-[#E6FAF8] to-white"
    }
  ];

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-4 text-[#2D3648]">
            Unique Approaches To Teaching
          </h2>
          <p className="text-xl text-[#545F71]">
            Combined Technology & Learning.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <Card className="p-6 h-full bg-gradient-to-br from-[#E6FAF8] to-white border-2 border-[#32DBC9]/20">
              <div className="flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <feature.icon className="h-6 w-6 text-[#32DBC9] mr-3" />
                  <h3 className="text-xl font-semibold text-[#2D3648]">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-[#545F71] mb-4 flex-grow">
                  {feature.description}
                </p>
                <button className="text-[#32DBC9] hover:underline text-left">
                  Learn more →
                </button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}