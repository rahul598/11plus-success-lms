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
              src="/images/logo.png" 
              alt="A for Apple" 
              className="h-12"
            />
          </motion.a>

          {/* Right side icons */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2"
            >
              <Search className="h-6 w-6 text-[#2D3648]" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2"
            >
              <ShoppingCart className="h-6 w-6 text-[#2D3648]" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              <Menu className="h-6 w-6 text-[#2D3648]" />
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}
