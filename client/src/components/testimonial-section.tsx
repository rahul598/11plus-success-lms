import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { Star } from "lucide-react";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/autoplay';

const testimonials = [
  {
    name: "Saba Maaties",
    rating: 5,
    text: "The ability to collaborate in real-time, combined with powerful project tracking helps has made it indispensable for our daily operations.",
    image: "https://randomuser.me/api/portraits/women/1.jpg"
  },
  {
    name: "Nella Gerarda",
    rating: 5,
    text: "Finxter has helped me learn these firm high-quality websites with 10x the speed",
    image: "https://randomuser.me/api/portraits/women/2.jpg"
  },
  {
    name: "Saba Maaties",
    rating: 4,
    text: "I need to be a lifelong user. I wake up thinking. To all my freelance projects. However, when Fiverr was launched, I was amazed by its smooth performance.",
    image: "https://randomuser.me/api/portraits/women/3.jpg"
  },
  {
    name: "Nella Gerarda",
    rating: 5,
    text: "Finxter has helped me learn these firm high-quality websites with 10x the speed",
    image: "https://randomuser.me/api/portraits/women/4.jpg"
  }
];

export function TestimonialSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-4 text-[#2D3648]">
            What students & parents say
          </h2>
        </motion.div>
      </div>

      <div className="relative h-[600px]">
        <Swiper
          modules={[Autoplay]}
          direction="vertical"
          spaceBetween={20}
          slidesPerView={3}
          loop={true}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            reverseDirection: false
          }}
          speed={3000}
          className="h-full"
        >
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <SwiperSlide key={index}>
              <Card className="p-6 bg-white shadow-md">
                <div className="flex items-start gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                    <div className="flex gap-1 my-2">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-gray-600">{testimonial.text}</p>
                  </div>
                </div>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
