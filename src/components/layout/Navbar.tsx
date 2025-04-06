
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Languages, Menu, X } from "lucide-react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { name: "Text", path: "/" },
    { name: "PDF", path: "/pdf" },
    { name: "Webpage", path: "/webpage" },
    { name: "Chat", path: "/chat" },
    { name: "About Us", path: "/about" },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 py-4 px-6 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 z-50">
          <div className="relative">
            <Languages size={28} className="text-blue-600" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-indigo-500 rounded-full animate-pulse"></span>
          </div>
          <span className="text-2xl font-semibold text-gray-900 translator-text">
            <span className="text-blue-600">Trans</span>
            <span className="text-indigo-600">lo</span>
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative px-1 py-2 font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 ${
                location.pathname === link.path ? "text-blue-600" : ""
              }`}
            >
              {link.name}
              {location.pathname === link.path && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>
        
        {/* Mobile menu button */}
        <div className="block md:hidden z-50">
          <button 
            onClick={toggleMobileMenu} 
            className="text-gray-700 hover:text-blue-600 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white flex flex-col items-center justify-center gap-8"
          >
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-xl font-medium ${
                  location.pathname === link.path 
                    ? "text-blue-600" 
                    : "text-gray-700"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Navbar;
