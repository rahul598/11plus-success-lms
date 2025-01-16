import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, ShoppingCart } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@/hooks/use-user";

function getDashboardRoute(role?: string) {
  switch (role) {
    case "student":
      return "/dashboard/student";
    case "tutor":
      return "/dashboard/tutor";
    case "parent":
      return "/dashboard/parent";
    default:
      return "/auth/login";
  }
}

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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.ok) {
        setLocation("/auth/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <img
              src="https://vinsonedge.com/wp-content/uploads/2025/01/Logo-3.png"
              alt="11Plus Success"
              className="h-10 cursor-pointer"
            />
          </Link>

          {/* Navigation Links - Hidden on Mobile */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-[#2D3648] hover:text-[#00AA9B] font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/mock-exams"
              className="text-[#2D3648] hover:text-[#00AA9B] font-medium transition-colors"
            >
              Mock Exams
            </Link>
            <Link
              href="/reports"
              className="text-[#2D3648] hover:text-[#00AA9B] font-medium transition-colors"
            >
              Reports
            </Link>
            <Link
              href="/tution"
              className="text-[#2D3648] hover:text-[#00AA9B] font-medium transition-colors"
            >
              Tution
            </Link>
            <Link
              href="/about-us"
              className="text-[#2D3648] hover:text-[#00AA9B] font-medium transition-colors"
            >
              About Us
            </Link>
            <Link
              href="/contact-us"
              className="text-[#2D3648] hover:text-[#00AA9B] font-medium transition-colors"
            >
              Contact Us
            </Link>
          </nav>

          {/* Right side buttons/user menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="relative">
                    <img 
                      src="https://vinsonedge.com/wp-content/uploads/2025/01/Cart.png"
                      alt="Cart"
                      className="h-5 w-5"
                    />
                    <span className="absolute -top-1 -right-1 bg-[#00AA9B] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      0
                    </span>
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {user.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuItem
                      onClick={() => setLocation(getDashboardRoute(user.role))}
                    >
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
              </>
            ) : (
              <>
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="relative">
                    <img 
                      src="https://vinsonedge.com/wp-content/uploads/2025/01/Cart.png"
                      alt="Cart"
                      className="h-5 w-5"
                    />
                    <span className="absolute -top-1 -right-1 bg-[#00AA9B] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      0
                    </span>
                  </Button>
                </Link>
                <div className="hidden md:block">
                  <Button
                    onClick={() => setLocation("/auth/login")}
                    className="bg-[#00AA9B] text-white hover:bg-[#009488] border-none px-6"
                  >
                    Login
                  </Button>
                </div>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-[#2D3648]" />
              ) : (
                <Menu className="h-6 w-6 text-[#2D3648]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg rounded-b-lg">
            <nav className="flex flex-col space-y-4 py-4">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-[#2D3648] hover:text-[#00AA9B] font-medium px-4"
              >
                Home
              </Link>
              <Link
                href="/mock-exams"
                onClick={() => setIsMenuOpen(false)}
                className="text-[#2D3648] hover:text-[#00AA9B] font-medium px-4"
              >
                Mock Exams
              </Link>
              <Link
                href="/reports"
                onClick={() => setIsMenuOpen(false)}
                className="text-[#2D3648] hover:text-[#00AA9B] font-medium px-4"
              >
                Reports
              </Link>
              <Link
                href="/tution"
                onClick={() => setIsMenuOpen(false)}
                className="text-[#2D3648] hover:text-[#00AA9B] font-medium px-4"
              >
                Tution
              </Link>
              <Link
                href="/about-us"
                onClick={() => setIsMenuOpen(false)}
                className="text-[#2D3648] hover:text-[#00AA9B] font-medium px-4"
              >
                About Us
              </Link>
              <Link
                href="/contact-us"
                onClick={() => setIsMenuOpen(false)}
                className="text-[#2D3648] hover:text-[#00AA9B] font-medium px-4"
              >
                Contact Us
              </Link>
              {!user && (
                <div className="px-4">
                  <Button
                    onClick={() => {
                      setLocation("/auth/login");
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-[#00AA9B] text-white hover:bg-[#009488] border-none"
                  >
                    Login / Sign up
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}