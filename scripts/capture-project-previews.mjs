import { chromium } from 'playwright'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
const directory = 'public/project-previews'
await mkdir(directory, { recursive: true })
const previous = JSON.parse(await readFile(`${directory}/manifest.json`, 'utf8').catch(()=>'{}'))
const manifest = { ...previous }
const content = await fetch('https://www.ericyikeda.com.br/api/content', { signal: AbortSignal.timeout(20000) }).then(r=>{if(!r.ok)throw Error('Portfolio unavailable');return r.json()})
// Only public static hosting providers are captured. No arbitrary or private network URLs.
function publicSite(value) {
  try { const u=new URL(value); return u.protocol==='https:' && !u.username && !u.password && !u.port && ['.vercel.app','.netlify.app','.pages.dev','.github.io'].some(host=>u.hostname.endsWith(host)) ? u : null } catch { return null }
}
async function github(path) {
  const r=await fetch(`https://api.github.com/repos/${path}`,{headers:{Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(15000)})
  if(!r.ok)throw Error(`GitHub: ${r.status}`)
  return r.json()
}
const browser=await chromium.launch({headless:true})
try {
  for(const project of content.projects.slice(0,30)) {
    const match=/^https:\/\/github\.com\/([\w.-]+\/[\w.-]+)\/?$/.exec(project.github || '')
    if((!match && !publicSite(project.github)) || project.image_url || /mobile|flutter|android|ios/i.test(`${project.type} ${project.tags?.join(' ')}`))continue
    const repo=match ? match[1].replace(/\.git$/,'') : project.github.replace(/\/$/,'')
    let context
    try {
      const info=match ? await github(repo) : null
      let site=publicSite(project.github) || publicSite(info?.homepage)
      if(!site && match) {
        const readme=await github(`${repo}/readme`).catch(()=>null)
        const md=readme?.content ? Buffer.from(readme.content,'base64').toString('utf8') : ''
        site=(md.match(/https:\/\/[^\s<>"'\)\]]+/g)||[]).map(publicSite).find(Boolean)
      }
      if(!site){console.log(`${repo}: no supported public deployment`);continue}
      context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,serviceWorkers:'block',acceptDownloads:false})
      // Isolate each capture and block navigations away from the selected deployment.
      await context.route('**/*',async route=>{
        const request=route.request(), url=new URL(request.url())
        if(url.protocol!=='https:' || (request.isNavigationRequest() && url.hostname!==site.hostname))return route.abort()
        if(/^(localhost|127\.|10\.|192\.168\.|169\.254\.|\[)/.test(url.hostname))return route.abort()
        return route.continue()
      })
      const page=await context.newPage()
      const captureUrl=new URL(site.href)
      if(captureUrl.hostname==='webshopeyi.vercel.app')captureUrl.searchParams.set('portfolioPreview','1')
      const response=await page.goto(captureUrl.href,{waitUntil:'domcontentloaded',timeout:45000,referer:'https://www.ericyikeda.com.br/'})
      if(!response?.ok())throw Error(`Site response ${response?.status()}`)
      await page.waitForLoadState('networkidle',{timeout:12000}).catch(()=>{})
      await page.evaluate(()=>document.fonts.ready)
      // Only the portfolio owner's non-binding demo notice has an explicit capture action.
      if(site.hostname==='webshopeyi.vercel.app') {
        const demo=page.getByRole('button',{name:'Entendi, entrar na loja',exact:true})
        if(await demo.isVisible())await demo.click()
        await page.getByText('Carregando seus próximos favoritos...', {exact:true}).waitFor({state:'hidden',timeout:45000})
        await page.locator('h1').first().waitFor({state:'visible',timeout:45000})
        await page.waitForLoadState('networkidle',{timeout:12000}).catch(()=>{})
        await page.evaluate(()=>document.fonts.ready)
      }
      // Never sign in, submit forms, or accept third-party agreements.
      const title=await page.title()
      if(await page.locator('input[type=password]').count())throw Error('Login page: no public preview')
      if(/404|deployment.not.found|just a moment|access denied/i.test(title))throw Error('Unavailable page')
      const filename=createHash('sha256').update(repo).digest('hex').slice(0,16)+'.jpg'
      await page.screenshot({path:`${directory}/${filename}`,type:'jpeg',quality:88,fullPage:false,animations:'disabled'})
      manifest[repo.toLowerCase()]={image_url:`/project-previews/${filename}`,site_url:site.href,captured_at:new Date().toISOString()}
      console.log(`${repo}: captured`)
    } catch(error){console.warn(`${repo}: ${error.message}`)} finally {await context?.close()}
  }
} finally {await browser.close()}
await writeFile(`${directory}/manifest.json`,JSON.stringify(manifest,null,2)+'\n')
