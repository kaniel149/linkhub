// ═══════════════════════════════════════════════════════════
// LINKHUB MOTION SYSTEM
// Centralized animation tokens, variants, and utilities
// ═══════════════════════════════════════════════════════════

import { type Transition, type Variants } from 'motion/react'

// ─────────────────────────────────────────────────────────────
// DURATION TOKENS
// ─────────────────────────────────────────────────────────────

export const duration = {
  instant: 0.1,    // Micro-feedback (press states)
  fast: 0.15,      // Hover states, toggles
  normal: 0.25,    // Most transitions
  slow: 0.4,       // Page transitions, modals
  slower: 0.6,     // Hero animations, reveals
} as const

// ─────────────────────────────────────────────────────────────
// EASING TOKENS
// ─────────────────────────────────────────────────────────────

export const ease = {
  // Default - smooth and natural
  default: [0.25, 0.1, 0.25, 1] as const,

  // Enter - starts slow, ends fast (elements appearing)
  enter: [0, 0, 0.2, 1] as const,

  // Exit - starts fast, ends slow (elements leaving)
  exit: [0.4, 0, 1, 1] as const,

  // Bounce - playful overshoot
  bounce: [0.34, 1.56, 0.64, 1] as const,
} as const

// ─────────────────────────────────────────────────────────────
// SPRING PRESETS
// ─────────────────────────────────────────────────────────────

export const spring = {
  // Soft - for large movements
  soft: { type: 'spring', stiffness: 200, damping: 25 } as Transition,

  // Default - balanced feel
  default: { type: 'spring', stiffness: 400, damping: 30 } as Transition,

  // Snappy - for small interactions
  snappy: { type: 'spring', stiffness: 500, damping: 35 } as Transition,

  // Bouncy - playful feedback
  bouncy: { type: 'spring', stiffness: 300, damping: 15 } as Transition,

  // Stiff - immediate response
  stiff: { type: 'spring', stiffness: 700, damping: 40 } as Transition,
} as const

// ─────────────────────────────────────────────────────────────
// STAGGER DELAYS
// ─────────────────────────────────────────────────────────────

export const stagger = {
  fast: 0.03,      // Quick lists
  normal: 0.05,    // Default stagger
  slow: 0.1,       // Dramatic reveals
} as const

// ─────────────────────────────────────────────────────────────
// COMMON TRANSITIONS
// ─────────────────────────────────────────────────────────────

export const transition = {
  // Fast interactions
  fast: {
    duration: duration.fast,
    ease: ease.default,
  } as Transition,

  // Normal transitions
  normal: {
    duration: duration.normal,
    ease: ease.default,
  } as Transition,

  // Enter animations
  enter: {
    duration: duration.normal,
    ease: ease.enter,
  } as Transition,

  // Exit animations
  exit: {
    duration: duration.fast,
    ease: ease.exit,
  } as Transition,

  // Slow reveals
  slow: {
    duration: duration.slow,
    ease: ease.enter,
  } as Transition,
} as const

// ─────────────────────────────────────────────────────────────
// COMPONENT VARIANTS
// ─────────────────────────────────────────────────────────────

// Button variants
export const buttonVariants: Variants = {
  idle: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
}

// Card variants
export const cardVariants: Variants = {
  idle: {
    scale: 1,
    y: 0,
    boxShadow: '0 0 0 rgba(139, 92, 246, 0)',
  },
  hover: {
    scale: 1.01,
    y: -2,
    boxShadow: '0 8px 30px rgba(139, 92, 246, 0.15)',
  },
}

// Draggable card variants
export const draggableCardVariants: Variants = {
  idle: {
    scale: 1,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    cursor: 'grab',
  },
  hover: {
    scale: 1.01,
    boxShadow: '0 8px 30px rgba(139, 92, 246, 0.15)',
  },
  dragging: {
    scale: 1.03,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
    cursor: 'grabbing',
    zIndex: 50,
  },
}

// Fade in variants
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

// Fade up variants
export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
}

// Fade up with blur variants (premium feel)
export const fadeUpBlurVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: 'blur(4px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
  },
}

// Scale up variants
export const scaleUpVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
  },
}

// Slide in from left variants
export const slideInLeftVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
  },
}

// Slide in from right variants
export const slideInRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
  },
}

// ─────────────────────────────────────────────────────────────
// CONTAINER VARIANTS (for staggered children)
// ─────────────────────────────────────────────────────────────

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger.normal,
      delayChildren: 0.1,
    },
  },
}

export const staggerContainerFastVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger.fast,
      delayChildren: 0.05,
    },
  },
}

export const staggerContainerSlowVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger.slow,
      delayChildren: 0.2,
    },
  },
}

// ─────────────────────────────────────────────────────────────
// MODAL/DIALOG VARIANTS
// ─────────────────────────────────────────────────────────────

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
}

// ─────────────────────────────────────────────────────────────
// TOAST VARIANTS
// ─────────────────────────────────────────────────────────────

export const toastVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    x: 100,
  },
}

// ─────────────────────────────────────────────────────────────
// TOGGLE VARIANTS
// ─────────────────────────────────────────────────────────────

export const toggleTrackVariants: Variants = {
  off: { backgroundColor: 'rgb(63, 63, 70)' },  // zinc-700
  on: { backgroundColor: 'rgb(139, 92, 246)' }, // purple-500
}

export const toggleKnobVariants: Variants = {
  off: { x: 2 },
  on: { x: 22 },
}

// ─────────────────────────────────────────────────────────────
// SKELETON ANIMATION
// ─────────────────────────────────────────────────────────────

export const skeletonVariants: Variants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 0.8, 0.5],
  },
}

export const skeletonTransition: Transition = {
  duration: 1.5,
  repeat: Infinity,
  ease: 'easeInOut',
}

// ─────────────────────────────────────────────────────────────
// UTILITY: Create stagger children
// ─────────────────────────────────────────────────────────────

export function createStaggerVariants(
  staggerDelay: number = stagger.normal,
  childDelay: number = 0.1
): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: childDelay,
      },
    },
  }
}

// ─────────────────────────────────────────────────────────────
// UTILITY: Create item variants with custom animation
// ─────────────────────────────────────────────────────────────

export function createItemVariants(
  hiddenState: { opacity?: number; y?: number; x?: number; scale?: number; filter?: string } = { opacity: 0, y: 20 },
  visibleState: { opacity?: number; y?: number; x?: number; scale?: number; filter?: string } = { opacity: 1, y: 0 },
  transitionConfig: Transition = transition.enter
): Variants {
  return {
    hidden: hiddenState,
    visible: {
      ...visibleState,
      transition: transitionConfig,
    },
  }
}
