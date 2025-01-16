import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/autoplay';

const instagramImages = [
  "https://dtthemes.kinsta.cloud/a-for-apple/wp-content/uploads/sites/2/2024/02/home-4-instagram-image-101.jpg",
  "https://dtthemes.kinsta.cloud/a-for-apple/wp-content/uploads/sites/2/2024/02/home-4-instagram-image-102.jpg",
  "https://dtthemes.kinsta.cloud/a-for-apple/wp-content/uploads/sites/2/2024/02/home-4-instagram-image-103.jpg",
  "https://dtthemes.kinsta.cloud/a-for-apple/wp-content/uploads/sites/2/2024/02/home-4-instagram-image-104.jpg",
  "https://dtthemes.kinsta.cloud/a-for-apple/wp-content/uploads/sites/2/2024/02/home-4-instagram-image-105.jpg",
  "https://dtthemes.kinsta.cloud/a-for-apple/wp-content/uploads/sites/2/2024/02/home-4-instagram-image-106.jpg"
];

export function Footer() {
  return (
    <footer className="bg-[#006D77] text-white">
      {/* Instagram Section */}
      <div className="container mx-auto py-12">
        <h2 className="text-3xl font-bold text-center mb-8">
          Follow Instagram @11plus_success
        </h2>
        <div className="mb-12">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={20}
            slidesPerView={3}
            loop={true}
            autoplay={{
              delay: 0,
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
              stopOnLastSlide: false,
              reverseDirection: false
            }}
            speed={5000}
            breakpoints={{
              640: {
                slidesPerView: 4,
              },
              768: {
                slidesPerView: 5,
              },
              1024: {
                slidesPerView: 6,
              },
            }}
            className="instagram-feed-swiper"
          >
            {[...instagramImages, ...instagramImages].map((image, index) => (
              <SwiperSlide key={index}>
                <div className="h-[200px] bg-white rounded-lg overflow-hidden">
                  <img 
                    src={image} 
                    alt={`Instagram post ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Wave Divider */}
        <div className="w-full h-12 bg-[url('https://vinsonedge.com/wp-content/uploads/2025/01/wave.svg')] bg-repeat-x"></div>

        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
          {/* Get In Touch */}
          <div>
            <h3 className="font-bold mb-4">Get In Touch</h3>
            <p className="text-sm mb-2">11 Plus Success, London</p>
            <p className="text-sm mb-2">12345</p>
            <p className="text-sm mb-2">Call: +44 123 456 7891</p>
            <p className="text-sm">E-Mail: info@11plus.org</p>
          </div>

          {/* Useful Links */}
          <div>
            <h3 className="font-bold mb-4">Useful Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/home" className="hover:underline">Home</a></li>
              <li><a href="/about-us" className="hover:underline">About Us</a></li>
              <li><a href="/contact-us" className="hover:underline">Contact Us</a></li>
              <li><a href="/terms" className="hover:underline">Terms & Conditions</a></li>
            </ul>
          </div>

          {/* Customer Services */}
          <div>
            <h3 className="font-bold mb-4">Customer Services</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/communication" className="hover:underline">Communication</a></li>
              <li><a href="/curriculum" className="hover:underline">Our Curriculum</a></li>
              <li><a href="/educator" className="hover:underline">Our Educator</a></li>
              <li><a href="/mock-exams" className="hover:underline">Mock Exams</a></li>
            </ul>
          </div>

          {/* Subscribe Newsletter */}
          <div>
            <h3 className="font-bold mb-4">Subscribe to Our Newsletter</h3>
            <p className="text-sm mb-4">Get latest updates and latest news.</p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter Your Email"
                className="bg-white text-black"
              />
              <Button className="bg-[#32DBC9] hover:bg-[#2BC4B4]">
                Subscribe Now
              </Button>
            </div>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="border-t border-white/20 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm mb-4 md:mb-0">
              © 2025 11Plus Success. All Rights Reserved.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-[#32DBC9]">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-[#32DBC9]">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-[#32DBC9]">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}