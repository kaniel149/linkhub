// ═══════════════════════════════════════════════════════════
// LINKHUB MOTION SYSTEM
// Apple-inspired animation tokens, variants, and utilities
// ═══════════════════════════════════════════════════════════

import { type Transition, type Variants } from 'motion/react'

// ─────────────────────────────────────────────────────────────
// DURATION TOKENS
// ─────────────────────────────────────────────────────────────

export const duration = {
  instant: 0.1,    // Micro-feedback (press states)
  fast: 0.15,      // Hover states, toggles
  normal: 0.3,     // Most transitions (Apple standard)
  slow: 0.5,       // Page transitions, modals
  slower: 0.7,     // Hero animations, reveals
} as const

// ─────────────────────────────────────────────────────────────
// EASING TOKENS (Apple curves)
// ─────────────────────────────────────────────────────────────

export const ease = {
  // Apple standard — smooth and precise
  default: [0.25, 0.1, 0.25, 1.0] as const,

  // Enter — elements appearing (decelerate)
  enter: [0, 0, 0.2, 1] as const,

  // Exit — elements leaving (accelerate)
  exit: [0.4, 0, 1, 1] as const,

  // Bounce — subtle overshoot for playful moments
  bounce: [0.34, 1.56, 0.64, 1] as const,

  // Page — smooth page-level transitions
  page: [0.42, 0, 0.58, 1] as const,
} as const

// ─────────────────────────────────────────────────────────────
// SPRING PRESETS (smoother, less bouncy — Apple feel)
// ─────────────────────────────────────────────────────────────

export const spring = {
  // Soft — for large movements, dialogs
  soft: { type: 'spring', stiffness: 200, damping: 28 } as Transition,

  // Default — balanced, smooth (Apple-like)
  default: { type: 'spring', stiffness: 300, damping: 30 } as Transition,

  // Snappy — for small interactions, toggles
  snappy: { type: 'spring', stiffness: 400, damping: 35 } as Transition,

  // Bouncy — playful feedback (cards, icons)
  bouncy: { type: 'spring', stiffness: 300, damping: 18 } as Transition,

  // Stiff — immediate response, no overshoot
  stiff: { type: 'spring', stiffness: 600, damping: 40 } as Transition,
} as const

// ─────────────────────────────────────────────────────────────
// STAGGER DELAYS
// ─────────────────────────────────────────────────────────────

export const stagger = {
  fast: 0.03,      // Quick lists
  normal: 0.05,    // Default stagger
  slow: 0.08,      // Dramatic reveals
} as const

// ─────────────────────────────────────────────────────────────
// COMMON TRANSITIONS
// ─────────────────────────────────────────────────────────────

export const transition = {
  // Fast interactions (hover, toggle)
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

  // Slow reveals (hero sections, page enters)
  slow: {
    duration: duration.slow,
    ease: ease.enter,
  } as Transition,

  // Page transitions
  page: {
    duration: 0.4,
    ease: ease.page,
  } as Transition,
} as const

// ─────────────────────────────────────────────────────────────
// COMPONENT VARIANTS
// ─────────────────────────────────────────────────────────────

// Button variants — subtle, no scale on hover (Apple-style: brightness change)
export const buttonVariants: Variants = {
  idle: { scale: 1, opacity: 1 },
  hover: { scale: 1, opacity: 0.88 },
  tap: { scale: 0.98, opacity: 0.8 },
}

// Card variants — subtle lift, accent glow
export const cardVariants: Variants = {
  idle: {
    scale: 1,
    y: 0,
    boxShadow: '0 0 0 rgba(0, 113, 227, 0)',
  },
  hover: {
    scale: 1.005,
    y: -1,
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
  },
}

// Draggable card variants
export const draggableCardVariants: Variants = {
  idle: {
    scale: 1,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
    cursor: 'grab',
  },
  hover: {
    scale: 1.005,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
  },
  dragging: {
    scale: 1.02,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
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
    y: 16,
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
    y: 16,
    filter: 'blur(6px)',
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
    scale: 0.96,
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
    x: -16,
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
    x: 16,
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
      delayChildren: 0.15,
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
    scale: 0.96,
    y: 8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
  },
}

// ─────────────────────────────────────────────────────────────
// TOAST VARIANTS
// ─────────────────────────────────────────────────────────────

export const toastVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    x: 80,
  },
}

// ─────────────────────────────────────────────────────────────
// TOGGLE VARIANTS
// ─────────────────────────────────────────────────────────────

export const toggleTrackVariants: Variants = {
  off: { backgroundColor: 'rgb(72, 72, 74)' },   // Apple gray
  on: { backgroundColor: 'rgb(0, 113, 227)' },    // Apple blue
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
  hiddenState: { opacity?: number; y?: number; x?: number; scale?: number; filter?: string } = { opacity: 0, y: 16 },
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
