export type IconName = 'arrow' | 'external' | 'github' | 'linkedin' | 'mail' | 'code' | 'search' | 'close' | 'menu' | 'home' | 'projects' | 'user' | 'check' | 'pin' | 'database' | 'tools' | 'book' | 'pause' | 'play'
export default function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M4 12h15M13 6l6 6-6 6" /></>,
    external: <><path d="M8 5H5v14h14v-3M12 4h8v8M10 14 20 4" /></>,
    github: <><path d="M9 19c-4 1-4-2-6-2M15 22v-4a3.5 3.5 0 0 0-1-3c3-.3 6-1.5 6-6a5 5 0 0 0-1.4-3.5 4.5 4.5 0 0 0-.1-3.5s-1-.3-3.5 1.4a12 12 0 0 0-6 0C6.5 1.7 5.5 2 5.5 2a4.5 4.5 0 0 0-.1 3.5A5 5 0 0 0 4 9c0 4.5 3 5.7 6 6a3.5 3.5 0 0 0-1 3v4" /></>,
    linkedin: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M7 10v7M7 7v.1M11 17v-7M11 13a3 3 0 0 1 6 0v4" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m3 7 9 6 9-6" /></>,
    code: <><path d="m7 6-6 6 6 6m10-12 6 6-6 6m-3-17-4 22" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    home: <><path d="m3 10 9-7 9 7v10H3ZM9 20v-7h6v7" /></>,
    projects: <><rect x="3" y="6" width="18" height="15" rx="3" /><path d="M8 6V3h8v3M3 12h18" /></>,
    user: <><circle cx="12" cy="7" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    database: <><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 4 18 4 18 0V5M3 12c0 4 18 4 18 0" /></>,
    tools: <><path d="m15 4 5 5-4 4-5-5ZM10 10l-7 7 4 4 7-7M15 4l2-2 5 5-2 2" /></>,
    book: <><path d="M3 4h7l2 2 2-2h7v16h-7l-2 2-2-2H3ZM12 6v16" /></>,
    pause: <><path d="M8 5v14M16 5v14" /></>,
    play: <path d="m8 4 12 8-12 8Z" />,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
