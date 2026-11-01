import { useId } from 'react'

const Logo = ({ size = 32, className }) => {
  // Each copy needs its own gradient id, or a hidden copy can blank the others
  const gradient = `logo-${useId().replace(/:/g, '')}`

  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#2563eb" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <path d="M22 24v-7a10 10 0 0 1 20 0v7" fill="none" stroke={`url(#${gradient})`} strokeWidth="5" strokeLinecap="round" />
      <path d="M14 22h36a3 3 0 0 1 3 2.7l3 31A4 4 0 0 1 52 60H12a4 4 0 0 1-4-4.3l3-31A3 3 0 0 1 14 22Z" fill={`url(#${gradient})`} />
      <path fill="#fff" fillRule="evenodd" d="M25 30h9.5a8 8 0 0 1 0 16H31v8h-6Zm6 5.5v5h3a2.5 2.5 0 0 0 0-5Z" />
    </svg>
  )
}

export default Logo
