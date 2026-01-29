'use client'

import { m } from 'motion/react'
import { cn } from '@/lib/utils'
import { spring, toggleTrackVariants, toggleKnobVariants } from '@/lib/motion'
import { forwardRef, type ComponentPropsWithoutRef } from 'react'

interface ToggleProps extends Omit<ComponentPropsWithoutRef<'button'>, 'onChange'> {
  checked?: boolean
  onChange?: (checked: boolean) => void
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const sizeStyles = {
  sm: {
    track: 'w-8 h-5',
    knob: 'w-3.5 h-3.5',
    knobOn: { x: 14 },
    knobOff: { x: 2 },
  },
  md: {
    track: 'w-11 h-6',
    knob: 'w-4 h-4',
    knobOn: { x: 22 },
    knobOff: { x: 2 },
  },
  lg: {
    track: 'w-14 h-7',
    knob: 'w-5 h-5',
    knobOn: { x: 28 },
    knobOff: { x: 2 },
  },
}

/**
 * Toggle
 *
 * Animated toggle/switch component with spring physics.
 * Respects reduced motion preferences.
 *
 * Usage:
 * ```tsx
 * const [isEnabled, setIsEnabled] = useState(false)
 *
 * <Toggle
 *   checked={isEnabled}
 *   onChange={setIsEnabled}
 *   label="Enable notifications"
 * />
 * ```
 */
const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ checked = false, onChange, size = 'md', label, className, disabled, ...props }, ref) => {
    const styles = sizeStyles[size]

    const handleClick = () => {
      if (!disabled && onChange) {
        onChange(!checked)
      }
    }

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          'relative inline-flex shrink-0 cursor-pointer rounded-full',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900',
          'disabled:cursor-not-allowed disabled:opacity-40',
          styles.track,
          className
        )}
        {...props}
      >
        {/* Track */}
        <m.span
          className={cn(
            'absolute inset-0 rounded-full',
            styles.track
          )}
          variants={toggleTrackVariants}
          animate={checked ? 'on' : 'off'}
          transition={spring.default}
        />

        {/* Knob */}
        <m.span
          className={cn(
            'absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-md',
            styles.knob
          )}
          animate={checked ? styles.knobOn : styles.knobOff}
          transition={spring.bouncy}
        />
      </button>
    )
  }
)

Toggle.displayName = 'Toggle'

/**
 * ToggleWithLabel
 *
 * Toggle with an associated label.
 *
 * Usage:
 * ```tsx
 * <ToggleWithLabel
 *   checked={isEnabled}
 *   onChange={setIsEnabled}
 *   label="Dark mode"
 *   description="Enable dark theme across the app"
 * />
 * ```
 */
interface ToggleWithLabelProps extends ToggleProps {
  description?: string
  labelPosition?: 'left' | 'right'
}

function ToggleWithLabel({
  label,
  description,
  labelPosition = 'left',
  className,
  ...props
}: ToggleWithLabelProps) {
  const labelContent = (
    <div className={cn(
      'flex flex-col',
      labelPosition === 'right' ? 'text-left' : 'text-right'
    )}>
      {label && (
        <span className="text-sm font-medium text-zinc-100">
          {label}
        </span>
      )}
      {description && (
        <span className="text-xs text-zinc-500">
          {description}
        </span>
      )}
    </div>
  )

  return (
    <div className={cn(
      'flex items-center gap-3',
      labelPosition === 'right' && 'flex-row-reverse',
      className
    )}>
      <Toggle {...props} label={label} />
      {(label || description) && labelContent}
    </div>
  )
}

export { Toggle, ToggleWithLabel }
