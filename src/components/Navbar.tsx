import React, { useState, useEffect } from 'react';
import { Sun, Moon, ArrowRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { BrandLogo } from './BrandLogo';
import { useTheme } from '../context/ThemeContext';
import { TRANSITION_EASE } from '../utils/motion';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Simple active section detection
      const sections = ['hero', 'checker', 'roles', 'how-it-works'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -72;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const navLinks = [
    { id: 'hero', label: 'Home' },
    { id: 'checker', label: 'Check Eligibility' },
    { id: 'roles', label: 'Job Roles' },
    { id: 'how-it-works', label: 'How It Works' }
  ];

  return (
    <motion.header
      id="main-navbar"
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: TRANSITION_EASE }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'bg-white/85 dark:bg-black/85 backdrop-blur-md border-b border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_1px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_12px_rgba(0,0,0,0.4)]'
          : 'bg-white/50 dark:bg-black/50 backdrop-blur-sm border-b border-zinc-200/50 dark:border-zinc-800/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => scrollToSection('hero')}
          >
            <div className="h-8 w-8 rounded bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 border border-zinc-800 dark:border-zinc-200 shadow-sm transition-transform duration-200 group-hover:scale-105">
              <BrandLogo className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 font-sans">
                Job Eligibility Checker
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Career Analysis
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  id={`nav-link-${link.id}`}
                  onClick={() => scrollToSection(link.id)}
                  className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-zinc-950 dark:text-zinc-100'
                      : 'text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100'
                  }`}
                >
                  <span className="relative z-10">{link.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active-pill"
                      className="absolute inset-0 rounded-md bg-zinc-100/90 dark:bg-zinc-800/80 -z-0"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              id="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>

            {/* Get Started Button */}
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              id="navbar-get-started-btn"
              onClick={() => scrollToSection('checker')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 transition-colors border border-zinc-800 dark:border-zinc-200 shadow-sm"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="mobile-theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer with smooth slide & fade */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-nav-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: TRANSITION_EASE }}
            className="overflow-hidden md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-black/95 backdrop-blur-md px-4 pt-3 pb-5 space-y-2"
          >
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="block w-full text-left py-2 px-2 rounded text-sm text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-2">
              <button
                onClick={() => scrollToSection('checker')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
