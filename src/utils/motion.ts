/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Variants, Transition } from 'motion/react';

// Premium high-end easing curves (Linear/Vercel standard)
export const TRANSITION_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]; // Custom quintic ease-out
export const TRANSITION_SMOOTH: Transition = {
  duration: 0.5,
  ease: TRANSITION_EASE
};

export const TRANSITION_FAST: Transition = {
  duration: 0.25,
  ease: TRANSITION_EASE
};

// Scroll Reveal Section Variants
export const fadeInUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
    filter: 'blur(4px)'
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.55,
      ease: TRANSITION_EASE
    }
  }
};

export const staggerContainerVariants = (staggerChildren = 0.08, delayChildren = 0.05): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren
    }
  }
});

export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
    filter: 'blur(3px)'
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.45,
      ease: TRANSITION_EASE
    }
  }
};

export const chipVariants: Variants = {
  initial: { opacity: 0, scale: 0.88, y: 4 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.2, ease: TRANSITION_EASE }
  },
  exit: { 
    opacity: 0, 
    scale: 0.85, 
    y: -4,
    transition: { duration: 0.15, ease: TRANSITION_EASE }
  }
};

// Viewport configuration for scroll reveals
export const viewportConfig = {
  once: true,
  margin: '-60px'
};
