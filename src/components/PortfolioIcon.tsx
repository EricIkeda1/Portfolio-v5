type IconName = 'code' | 'mobile' | 'server' | 'product' | 'home' | 'user' | 'mail' | 'star' | 'check' | 'menu' | 'layers'
const paths: Record<IconName, string> = {
  code: 'm8 7-5 5 5 5m8-10 5 5-5 5m-3-15-2 20',
  mobile: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm3 3h4m-3 14h2',
  server: 'M4 3h16v6H4V3Zm0 12h16v6H4v-6Zm3-9h.01M7 18h.01M12 9v6',
  product: 'M3 4h18v13H3V4Zm5 17h8m-4-4v4',
  home: 'm3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9',
  user: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2H4Z',
  mail: 'M3 5h18v14H3V5Zm0 0 9 8 9-8',
  star: 'm12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z',
  check: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Zm-16 0 4 4 8-8',
  menu: 'M4 6h16M4 12h16M4 18h16',
  layers: 'm12 2 10 5-10 5L2 7l10-5Zm-10 10 10 5 10-5M2 17l10 5 10-5',
}
export function PortfolioIcon({ name }: { name: IconName }) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
}
