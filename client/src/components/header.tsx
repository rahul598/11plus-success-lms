import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Search, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.a 
            href="/"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <img 
              src="https://vinsonedge.com/wp-content/uploads/2025/01/Logo-3.png" 
              alt="11Plus Success" 
              className="h-12"
            />
          </motion.a>

          {/* Navigation Links - Hidden on Mobile */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/mock-exams" className="text-[#2D3648] hover:text-[#00AA9B] font-medium">
              Mock Exams
            </a>
            <a href="/reports" className="text-[#2D3648] hover:text-[#00AA9B] font-medium">
              Reports
            </a>
            <a href="/tution" className="text-[#2D3648] hover:text-[#00AA9B] font-medium">
              Tution
            </a>
            <a href="/about-us" className="text-[#2D3648] hover:text-[#00AA9B] font-medium">
              About Us
            </a>
            <a href="/contact-us" className="text-[#2D3648] hover:text-[#00AA9B] font-medium">
              Contact Us
            </a>
          </nav>

          {/* Right side icons */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="w-10 h-10">
              <img src="/images/Cart.png" alt="Cart" className="w-6 h-6" />
            </Button>

            <Button 
              variant="outline"
              className="hidden md:flex bg-[#00AA9B] text-white hover:bg-[#009488] border-none"
            >
              Login
            </Button>

            <Button 
              className="hidden md:flex bg-[#32DBC9] text-white hover:bg-[#2BC4B4] border-none"
            >
              Sign up
            </Button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              <Menu className="h-6 w-6 text-[#2D3648]" />
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}