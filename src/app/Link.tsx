import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { navigate } from './router'

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }

/** In-app link; modified clicks (new tab, etc.) behave like a normal anchor. */
export function Link({ to, onClick, ...props }: LinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return
    }
    event.preventDefault()
    navigate(to)
  }
  return <a href={to} onClick={handleClick} {...props} />
}
