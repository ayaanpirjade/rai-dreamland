import type { ReactNode } from 'react'

interface GlassPanelProps {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'article' | 'aside' | 'li'
  strong?: boolean
  dark?: boolean
  id?: string
  style?: React.CSSProperties
}

/**
 * The liquid-glass surface used across the site: translucent, blurred,
 * with a fine illuminated border and a soft specular sweep on top.
 */
export function GlassPanel({ children, className = '', as: Tag = 'div', strong, dark, id, style }: GlassPanelProps) {
  const classes = [
    'glass',
    strong ? 'glass--strong' : '',
    dark ? 'glass--dark' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag className={classes} id={id} style={style}>
      {children}
    </Tag>
  )
}
