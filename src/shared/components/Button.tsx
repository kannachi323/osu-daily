import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { buttonClass, type Variant } from './buttonClass'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  icon?: ReactNode
}

export function Button({ variant = 'primary', icon, className = '', children, ...props }: ButtonProps) {
  return (
    <button type="button" className={buttonClass(variant, className)} {...props}>
      {icon}
      {children}
    </button>
  )
}
