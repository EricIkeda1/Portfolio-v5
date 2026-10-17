import { renderToString } from 'react-dom/server'
import App from './App'
export { seoHead } from './seo'

export function renderPage(pathname: string) {
  return renderToString(<App pathname={pathname} />)
}
