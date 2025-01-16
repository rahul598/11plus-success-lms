import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PricingSection() {
  const pricingPlans = [
    {
      name: "Basic Plan",
      monthlyPrice: "15.99",
      features: [
        "Lorem ipsum dolor",
        "Lorem ipsum dolor Lorem",
        "Lorem ipsum dolor",
        "Lorem ipsum dolor Lorem",
        "Lorem ipsum dolor Lorem"
      ]
    },
    {
      name: "Popular",
      monthlyPrice: "49.99",
      features: [
        "Lorem ipsum dolor",
        "Lorem ipsum dolor Lorem",
        "Lorem ipsum dolor Lorem",
        "Lorem ipsum dolor Lorem",
        "Lorem ipsum dolor Lorem",
        "Lorem ipsum dolor Lorem"
      ],
      highlight: true
    },
    {
      name: "Pro Plan",
      monthlyPrice: "65.99",
      features: [
        "Lorem ipsum dolor",
        "Lorem ipsum dolor Lorem",
        "Lorem ipsum dolor Lorem",
        "Lorem ipsum dolor Lorem",
        "Lorem ipsum dolor Lorem",
        "Lorem ipsum dolor Lorem"
      ]
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
            Flexible Pricing
          </h2>
        </motion.div>

        <Tabs defaultValue="monthly" className="w-full max-w-md mx-auto">
          <TabsList className="grid w-full grid-cols-4 bg-[#E6FAF8] rounded-full p-1">
            <TabsTrigger
              value="monthly"
              className="data-[state=active]:bg-[#32DBC9] data-[state=active]:text-white rounded-full"
            >
              Monthly
            </TabsTrigger>
            <TabsTrigger
              value="annually"
              className="data-[state=active]:bg-[#32DBC9] data-[state=active]:text-white rounded-full"
            >
              Annually
            </TabsTrigger>
            <TabsTrigger
              value="lifetime"
              className="data-[state=active]:bg-[#32DBC9] data-[state=active]:text-white rounded-full"
            >
              Lifetime
            </TabsTrigger>
            <TabsTrigger
              value="prepaid"
              className="data-[state=active]:bg-[#32DBC9] data-[state=active]:text-white rounded-full"
            >
              Pre Paid
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monthly">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Card className={`p-6 h-full ${plan.highlight ? 'bg-gradient-to-br from-[#E6FAF8] to-white border-2 border-[#32DBC9]/20' : 'bg-white'}`}>
                    <div className="flex flex-col h-full">
                      <div className="text-sm text-gray-500 mb-2">Basic Plan</div>
                      <div className="flex items-baseline mb-6">
                        <span className="text-2xl font-semibold text-[#2D3648]">$</span>
                        <span className="text-4xl font-bold text-[#2D3648] mx-1">{plan.monthlyPrice}</span>
                        <span className="text-gray-500">/month</span>
                      </div>
                      
                      <ul className="space-y-4 mb-8 flex-grow">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-[#32DBC9]" />
                            <span className="text-[#545F71] text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={`w-full ${
                          plan.highlight
                            ? 'bg-[#32DBC9] hover:bg-[#2BC4B4] text-white'
                            : 'bg-white border-2 border-[#32DBC9] text-[#32DBC9] hover:bg-[#E6FAF8]'
                        }`}
                      >
                        Sign up now
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
