import type { ReactNode } from 'react'
import { useInView } from '../../hooks/useInView'

interface SectionRevealProps {
  children: ReactNode
  className?: string
  delay?: 0 | 1 | 2 | 3
}

export default function SectionReveal({ children, className = '', delay = 0 }: SectionRevealProps) {
  const { ref, isInView } = useInView()

  return (
    <div
      ref={ref}
      className={`section-reveal ${isInView ? 'section-reveal-visible' : ''} section-reveal-delay-${delay} ${className}`}
    >
      {children}
    </div>
  )
}
