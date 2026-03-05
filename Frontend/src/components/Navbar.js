import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronRight } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // Hide navbar on dashboard and portal pages
  const hideNavbarPaths = [
    "/candidate/dashboard",
    "/candidate/settings",
    "/candidate/interview",
    "/candidate/analyze-resume",
    "/candidate/resume",
    "/recruiter/dashboard",
    "/recruiter/job-posting",
    "/recruiter/cv-screening",
    "/recruiter/settings",
    "/recruiter/report",
    "/template/",
    "/resume-builder"
  ];

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Detect scroll position (only for large screens)
  // Navbar is hidden whenever user is not at the top of the page
  useEffect(() => {
    const handleScroll = () => {
      if (!isLargeScreen) {
        setIsScrolling(false);
        return;
      }

      // Hide navbar if not at top position
      if (window.scrollY > 50) {
        setIsScrolling(true);
      } else {
        setIsScrolling(false);
      }
    };

    // Check initial position
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isLargeScreen]);

  if (hideNavbarPaths.some(path => location.pathname.includes(path))) {
    return null;
  }

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/how-it-works", label: "How it Works" },
    { to: "/pricing", label: "Pricing" },
    { to: "/candidate/signin", label: "Candidates" },
    { to: "/recruiter/signin", label: "Recruiters" },
    { to: "/about", label: "About Us" },
    { to: "/contact", label: "Contact Us" },
  ];

  return (
    <nav
      className={`bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 transition-all duration-300 ${isScrolling && isLargeScreen
        ? "opacity-0 pointer-events-none -translate-y-2"
        : "opacity-100 translate-y-0"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-xl sm:text-2xl font-bold text-[#0a2a5e]">
          RecruBotX
        </Link>

        {/* Desktop Menu Links - Right aligned with increased gap */}
        <div className="gap-8 hidden md:flex items-center ml-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to ||
              (link.to !== "/" && location.pathname.startsWith(link.to));

            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative py-2 font-medium transition-colors
                  ${isActive
                    ? "text-[#0a2a5e]"
                    : "text-gray-600 hover:text-[#0a2a5e]"
                  }
                  after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:transition-all after:duration-300
                  ${isActive
                    ? "after:w-full after:bg-[#0a2a5e]"
                    : "after:w-0 hover:after:w-full after:bg-blue-300"
                  }
                `}
              >
                {link.label}
              </Link>
            );
          })}
        </div>



        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-3 px-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#0a2a5e] transition-colors"
              >
                <span className="font-medium">{link.label}</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
