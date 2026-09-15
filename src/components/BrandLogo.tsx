import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
}

/**
 * Job Eligibility Checker Brand Mark.
 * Minimalist geometric mark combining:
 * - Candidate profile dossier / evaluation badge
 * - Technical skill / scoring benchmark indicators
 * - Verified eligibility checkmark
 * - Subtle AI / intelligence precision spark
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = 'w-4 h-4',
  size = 24,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Assessment Dossier / Candidate Credential Frame */}
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Candidate Profile Silhouette inside Dossier */}
      <circle cx="8" cy="7" r="1.8" stroke="currentColor" strokeWidth="1.9" />
      <path
        d="M5.5 12c0-1.4 1.1-2.2 2.5-2.2s2.5.8 2.5 2.2"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      {/* Verified Eligibility Checkmark (Bold, precise) */}
      <path
        d="M8 16.5l2.5 2.5 7.5-7.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Subtle AI Precision Sparkle */}
      <path
        d="M18.5 2.5l.6 1.7 1.9.8-1.9.8-.6 1.7-.6-1.7-1.9-.8 1.9-.8.6-1.7z"
        fill="currentColor"
      />
    </svg>
  );
};
