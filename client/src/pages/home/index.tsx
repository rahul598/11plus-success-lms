import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, Star, Book, UserCheck, GraduationCap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#1A1A1A] text-white py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Your Path to 11 Plus Success Starts Here
            </h1>
            <p className="text-xl mb-8">
              Comprehensive preparation for grammar and independent school entrance exams
            </p>
            <Button 
              size="lg"
              className="bg-[#FF6B00] hover:bg-[#FF8533] text-white px-8 py-6 text-lg rounded-lg"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Why Choose 11 Plus Success?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Star,
                title: "Expert Tutors",
                description: "Learn from experienced teachers who understand the exam requirements"
              },
              {
                icon: Book,
                title: "Comprehensive Resources",
                description: "Access a wide range of practice papers and study materials"
              },
              {
                icon: UserCheck,
                title: "Personalized Learning",
                description: "Get customized study plans tailored to your needs"
              }
            ].map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <feature.icon className="h-12 w-12 text-[#FF6B00] mb-4" />
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stats */}
      <section className="bg-[#F5F5F5] py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-4xl font-bold text-[#FF6B00] mb-2">95%</h3>
              <p className="text-gray-600">Pass Rate</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-[#FF6B00] mb-2">1000+</h3>
              <p className="text-gray-600">Students Helped</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-[#FF6B00] mb-2">15+</h3>
              <p className="text-gray-600">Years Experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Key Benefits
          </h2>
          <div className="max-w-3xl mx-auto">
            {[
              "Structured learning path with clear milestones",
              "Regular mock tests and assessments",
              "Detailed performance analytics and feedback",
              "Interactive learning materials and video lessons",
              "Expert support whenever you need it"
            ].map((benefit, index) => (
              <div key={index} className="flex items-center mb-6">
                <CheckCircle2 className="h-6 w-6 text-[#FF6B00] mr-4 flex-shrink-0" />
                <p className="text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#1A1A1A] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of successful students who have achieved their goals with 11 Plus Success
          </p>
          <Button 
            size="lg"
            className="bg-[#FF6B00] hover:bg-[#FF8533] text-white px-8 py-6 text-lg rounded-lg"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}
