// Public GitHub files only: no arbitrary URL fetching, tokens or database writes.
const cache = new Map<string, { expires: number; url: string | null }>()
const pending = new Map<string, Promise<string | null>>()
export function repositoryPath(value: string): string | null {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.hostname !== 'github.com' || url.username || url.password) return null
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts.length < 2 || !parts.slice(0, 2).every(p => /^[\w.-]+$/.test(p))) return null
    return `${parts[0]}/${parts[1].replace(/\.git$/, '')}`
  } catch { return null }
}
export function imageScore(path: string): number {
  if (!/\.(png|jpe?g|webp)$/i.test(path) || /(^|[/_.-])(icon|icons|logo|logos|favicon|badge|badges|splash|avatar)([/_.-]|$)/i.test(path)) return 0
  if (/(screenshot|screen.?shot|captura|preview|mockup)/i.test(path)) return 100
  if (/(^|\/)(screens|screenshots|telas|previews)\//i.test(path)) return 90
  return 0 // Never mistake arbitrary product photos for a project interface.
}
async function github(path: string) {
  const response = await fetch(`https://api.github.com/repos/${path}`, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'EricIkeda-Portfolio' },
    redirect: 'error', signal: AbortSignal.timeout(6000),
  })
  if (!response.ok) throw Error('Public repository unavailable')
  const length = Number(response.headers.get('content-length') || 0)
  if (length > 4_000_000) throw Error('Repository response too large')
  const text = await response.text()
  if (text.length > 4_000_000) throw Error('Repository response too large')
  return JSON.parse(text)
}
async function discover(repo: string): Promise<string | null> {
  const info = await github(repo)
  const [tree, readme] = await Promise.all([
    github(`${repo}/git/trees/${encodeURIComponent(info.default_branch)}?recursive=1`),
    github(`${repo}/readme`).catch(()=>null),
  ])
  const markdown = readme?.content ? Buffer.from(readme.content, 'base64').toString('utf8') : ''
  const mentioned = (path: string) => markdown.includes(path) || markdown.includes(encodeURI(path))
  const images = (tree.tree || []).filter((file: any) => file.type === 'blob' && file.size > 8000 && file.size < 4_000_000 && (imageScore(file.path) > 0 || (mentioned(file.path) && /\.(png|jpe?g|webp)$/i.test(file.path) && !/(logo|icon|badge|avatar|splash)/i.test(file.path))))
  images.sort((a: any, b: any) => (imageScore(b.path) + (mentioned(b.path) ? 50 : 0)) - (imageScore(a.path) + (mentioned(a.path) ? 50 : 0)) || a.path.localeCompare(b.path))
  if (!images.length) return null
  // Fixed GitHub asset host; never fetch arbitrary README URLs.
  return `https://raw.githubusercontent.com/${repo}/${encodeURIComponent(info.default_branch)}/${images[0].path.split('/').map(encodeURIComponent).join('/')}`
}
export async function findProjectImage(repository: string): Promise<string | null> {
  const repo = repositoryPath(repository)
  if (!repo) return null
  const hit = cache.get(repo)
  if (hit && hit.expires > Date.now()) return hit.url
  if (pending.has(repo)) return pending.get(repo)!
  const task = discover(repo).then(url => {
    if (cache.size >= 100) cache.delete(cache.keys().next().value!)
    cache.set(repo, { url, expires: Date.now() + 3600_000 })
    return url
  }).catch(() => {
    cache.set(repo, {url: null, expires: Date.now() + 60_000})
    return null
  }).finally(() => pending.delete(repo))
  pending.set(repo, task)
  return task
}
