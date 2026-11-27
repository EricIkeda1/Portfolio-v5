import { chromium } from 'playwright'
const browser=await chromium.launch()
try {
  const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1})
  // The dashboard's event feed is intentionally empty; never contact a real backend.
  await page.route('**/api/eventos/', route=>route.fulfill({json:[]}))
  await page.routeWebSocket('**/ws/eventos/', socket=>socket.close())
  await page.goto('http://127.0.0.1:8765',{waitUntil:'networkidle'})
  await page.evaluate(()=>document.fonts.ready)
  await page.waitForFunction(()=>document.querySelectorAll('.plotly-graph-div.js-plotly-plot').length>=6)
  await page.waitForFunction(()=>Array.from(document.images).every(img=>img.complete))
  await page.getByRole('button',{name:'Opções'}).click()
  await page.locator('#sliderMenu').evaluate(el=>el.getAnimations().map(a=>a.finish()))
  await page.screenshot({path:'public/project-previews/x4glass.jpg',type:'jpeg',quality:90,animations:'disabled'})
} finally {await browser.close()}
