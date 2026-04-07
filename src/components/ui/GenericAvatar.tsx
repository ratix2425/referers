interface GenericAvatarProps {
  size?: number
  className?: string
}

export function GenericAvatar({ size = 36, className = '' }: GenericAvatarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="18" cy="18" r="18" fill="#fff9c4" />
      <circle cx="18" cy="14" r="6" fill="#fdd835" />
      <ellipse cx="18" cy="28" rx="10" ry="7" fill="#fdd835" />
    </svg>
  )
}
