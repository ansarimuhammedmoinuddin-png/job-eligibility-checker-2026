/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ValueStrip } from './components/ValueStrip';
import { CheckerForm } from './components/CheckerForm';
import { HowItWorks } from './components/HowItWorks';
import { JobRolesSection } from './components/JobRolesSection';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { JobRoleKey } from './types/eligibility';

export default function App() {
  const [selectedRoleFromExternal, setSelectedRoleFromExternal] = useState<JobRoleKey | null>(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -72;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleRoleSelection = (roleKey: JobRoleKey) => {
    setSelectedRoleFromExternal(roleKey);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 selection:bg-zinc-800 selection:text-white dark:selection:bg-zinc-200 dark:selection:text-black">
        
        {/* 1. Top Sticky Navbar */}
        <Navbar />

        <main>
          {/* 2. Hero Section with AI Analysis Visualization */}
          <Hero
            onCheckEligibilityClick={() => scrollToSection('checker')}
            onSeeHowItWorksClick={() => scrollToSection('how-it-works')}
          />

          {/* 3. Trust & Value Strip */}
          <ValueStrip />

          {/* 4. Main Eligibility Checker Form Section */}
          <CheckerForm
            selectedRoleFromExternal={selectedRoleFromExternal}
            onRoleSelectionHandled={() => setSelectedRoleFromExternal(null)}
          />

          {/* 5. How It Works (3 Steps) */}
          <HowItWorks />

          {/* 6. Explore Job Roles Catalog */}
          <JobRolesSection onSelectRole={handleRoleSelection} />

          {/* 7. Final High-Impact CTA */}
          <FinalCTA onCheckClick={() => scrollToSection('checker')} />
        </main>

        {/* 8. Professional Footer */}
        <Footer />
        
      </div>
    </ThemeProvider>
  );
}
