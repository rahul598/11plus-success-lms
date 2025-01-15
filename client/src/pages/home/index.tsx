import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Book, UserCheck, CheckCircle2, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-primary pt-32 pb-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center relative z-10">
            <h1 className="text-5xl font-bold mb-6 text-[#2D3648]">
              Step Up Your Game For the 11+ Exams
            </h1>
            <p className="text-xl mb-8 text-[#545F71]">
              Unique Approaches To Teaching Combined Technology & Learning
            </p>
            <Button
              size="lg"
              className="button-gradient text-white px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-20">
              <Sparkles className="h-8 w-8 text-[#00AA9B] animate-bounce" />
            </div>
            <div className="absolute bottom-20 right-20">
              <Star className="h-8 w-8 text-[#FF6B00] animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-[#2D3648]">
            Why Choose 11 Plus Success?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Star,
                title: "Expert Tutors",
                description:
                  "Learn from experienced teachers who understand the exam requirements",
              },
              {
                icon: Book,
                title: "Comprehensive Resources",
                description:
                  "Access a wide range of practice papers and study materials",
              },
              {
                icon: UserCheck,
                title: "Personalized Learning",
                description:
                  "Get customized study plans tailored to your needs",
              },
            ].map((feature, index) => (
              <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-8">
                  <feature.icon className="h-12 w-12 text-[#00AA9B] mb-6" />
                  <h3 className="text-2xl font-bold mb-4 text-[#2D3648]">{feature.title}</h3>
                  <p className="text-[#545F71] leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stats */}
      <section className="bg-[#F8FFFE] py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { value: "95%", label: "Pass Rate" },
              { value: "1000+", label: "Students Helped" },
              { value: "15+", label: "Years Experience" },
            ].map((stat, index) => (
              <div key={index} className="stats-card">
                <h3 className="stats-value text-gradient">{stat.value}</h3>
                <p className="stats-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-[#2D3648]">
            Key Benefits
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              "Structured learning path with clear milestones",
              "Regular mock tests and assessments",
              "Detailed performance analytics and feedback",
              "Interactive learning materials and video lessons",
              "Expert support whenever you need it",
            ].map((benefit, index) => (
              <div key={index} className="flex items-center p-4 bg-[#F8FFFE] rounded-lg hover:shadow-md transition-all duration-300">
                <CheckCircle2 className="h-6 w-6 text-[#00AA9B] mr-4 flex-shrink-0" />
                <p className="text-lg text-[#2D3648]">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#2D3648] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-300">
            Join thousands of successful students who have achieved their goals
            with 11 Plus Success
          </p>
          <Button
            size="lg"
            className="button-gradient text-white px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}