import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export const ArrowLeft = (props: IconProps) => (
  <Icon {...props}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </Icon>
)

export const ArrowRight = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
)

export const ArrowUpRight = (props: IconProps) => (
  <Icon {...props}>
    <path d="M7 17 17 7M8 7h9v9" />
  </Icon>
)

export const ArrowUp = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </Icon>
)

export const ArrowDown = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 5v14M18 13l-6 6-6-6" />
  </Icon>
)

export const Check = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Icon>
)

export const Cross = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
)

export const Copy = (props: IconProps) => (
  <Icon {...props}>
    <rect x="8" y="8" width="12" height="12" rx="3" />
    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
  </Icon>
)

export const Search = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4.2-4.2" />
  </Icon>
)

export const Skip = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 6l7 6-7 6zM17 6v12" />
  </Icon>
)

export const Flame = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.4 2.4-5.4 3.8-7.6.9 1.4 1.7 2.2 2.7 2.7.2-2.5 1.3-4.6 3.1-6.4.4 3 3.4 5.4 3.4 10.6 0 4.2-2.6 6.9-6.5 6.9z" />
  </Icon>
)

/* Tile glyphs: simple, original shapes rather than any osu! iconography. */

export const QuestionGlyph = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.3a2.6 2.6 0 0 1 5 .9c0 1.8-2.5 2.2-2.5 3.8M12 17.2v.1" />
  </Icon>
)

export const FrameGlyph = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="M3 16l5-5 4 4 3-3 6 6" />
    <circle cx="16" cy="9" r="1.4" />
  </Icon>
)

export const UpDownGlyph = (props: IconProps) => (
  <Icon {...props}>
    <path d="M8 19V5M4 9l4-4 4 4M16 5v14M12 15l4 4 4-4" />
  </Icon>
)

export const PenGlyph = (props: IconProps) => (
  <Icon {...props}>
    <path d="M14.5 4.5l5 5L9 20H4v-5z" />
    <path d="M12.5 6.5l5 5" />
  </Icon>
)
