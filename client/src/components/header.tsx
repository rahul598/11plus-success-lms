import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@/hooks/use-user";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [, setLocation] = useLocation();
  const { user, logout } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setLocation('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <Link href="/">
              <img 
                src="https://vinsonedge.com/wp-content/uploads/2025/01/Logo-3.png" 
                alt="11Plus Success" 
                className="h-12 cursor-pointer"
              />
            </Link>
          </motion.div>

          {/* Navigation Links - Hidden on Mobile */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/mock-exams" className="text-[#2D3648] hover:text-[#00AA9B] font-medium">
              Mock Exams
            </Link>
            <Link href="/reports" className="text-[#2D3648] hover:text-[#00AA9B] font-medium">
              Reports
            </Link>
            <Link href="/tution" className="text-[#2D3648] hover:text-[#00AA9B] font-medium">
              Tution
            </Link>
            <Link href="/about-us" className="text-[#2D3648] hover:text-[#00AA9B] font-medium">
              About Us
            </Link>
            <Link href="/contact-us" className="text-[#2D3648] hover:text-[#00AA9B] font-medium">
              Contact Us
            </Link>
          </nav>

          {/* Right side icons and auth buttons */}
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10">
                        {user.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation('/dashboard')}>
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button 
                    variant="outline"
                    className="hidden md:flex bg-[#00AA9B] text-white hover:bg-[#009488] border-none"
                  >
                    Login
                  </Button>
                </Link>

                <Link href="/auth/signup">
                  <Button 
                    className="hidden md:flex bg-[#32DBC9] text-white hover:bg-[#2BC4B4] border-none"
                  >
                    Sign up
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-[#2D3648]" />
              ) : (
                <Menu className="h-6 w-6 text-[#2D3648]" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white"
            >
              <nav className="flex flex-col space-y-4 py-4">
                <Link href="/mock-exams" onClick={() => setIsMenuOpen(false)} className="text-[#2D3648] hover:text-[#00AA9B] font-medium px-4">
                  Mock Exams
                </Link>
                <Link href="/reports" onClick={() => setIsMenuOpen(false)} className="text-[#2D3648] hover:text-[#00AA9B] font-medium px-4">
                  Reports
                </Link>
                <Link href="/tution" onClick={() => setIsMenuOpen(false)} className="text-[#2D3648] hover:text-[#00AA9B] font-medium px-4">
                  Tution
                </Link>
                <Link href="/about-us" onClick={() => setIsMenuOpen(false)} className="text-[#2D3648] hover:text-[#00AA9B] font-medium px-4">
                  About Us
                </Link>
                <Link href="/contact-us" onClick={() => setIsMenuOpen(false)} className="text-[#2D3648] hover:text-[#00AA9B] font-medium px-4">
                  Contact Us
                </Link>
                {user ? (
                  <>
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-[#2D3648] hover:text-[#00AA9B] font-medium px-4">
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="text-[#2D3648] hover:text-[#00AA9B] font-medium px-4 text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2 px-4">
                    <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                      <Button 
                        variant="outline"
                        className="w-full bg-[#00AA9B] text-white hover:bg-[#009488] border-none"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                      <Button 
                        className="w-full bg-[#32DBC9] text-white hover:bg-[#2BC4B4] border-none"
                      >
                        Sign up
                      </Button>
                    </Link>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}