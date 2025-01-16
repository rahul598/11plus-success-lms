import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQSection() {
  const faqs = [
    {
      question: "What is 11 Plus-Success, and how does it help students?",
      answer: "11+ Success is an interactive platform designed to provide Year 5 students with comprehensive preparation and personalized learning tools to help students excel in their preparation journey."
    },
    {
      question: "How do I book a mock exam?",
      answer: "You can easily book mock exams through our platform. Simply log in, navigate to the mock exam section, and choose your preferred date and time slot."
    },
    {
      question: "Can I track my child's performance?",
      answer: "Yes, our platform provides detailed performance tracking and analytics for each student, allowing parents to monitor progress and identify areas for improvement."
    },
    {
      question: "What subjects are included in the mock exams?",
      answer: "Our mock exams cover all key 11+ subjects including Verbal Reasoning, Non-Verbal Reasoning, English, and Mathematics."
    },
    {
      question: "Is there a free trial available?",
      answer: "Yes, we offer a free trial period to help you experience our platform and its features before making a commitment."
    },
    {
      question: "What are the subscription plans available?",
      answer: "We offer flexible subscription plans including monthly, annual, and custom packages to suit your needs."
    }
  ];

  return (
    <section className="container mx-auto px-4 py-16 bg-[#E6FAF8]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left side - FAQs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-8 text-[#2D3648]">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-[#2D3648] hover:text-[#32DBC9]">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[#545F71]">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Right side - Support & App Download */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center justify-center"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4 text-[#2D3648]">
              Need Support?
            </h3>
            <p className="text-[#545F71]">
              Reach out to us for quick and reliable assistance
            </p>
            <div className="flex gap-4 mt-4 justify-center">
              <Button className="bg-[#32DBC9] hover:bg-[#2BC4B4] text-white">
                Chat
              </Button>
              <Button className="bg-[#32DBC9] hover:bg-[#2BC4B4] text-white">
                Call
              </Button>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 text-[#2D3648]">
              Download Our App
            </h3>
            <div className="flex gap-4 justify-center">
              <a href="#" className="hover:opacity-80">
                <img
                  src="/google-play-badge.png"
                  alt="Get it on Google Play"
                  className="h-12"
                />
              </a>
              <a href="#" className="hover:opacity-80">
                <img
                  src="/app-store-badge.png"
                  alt="Download on App Store"
                  className="h-12"
                />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
