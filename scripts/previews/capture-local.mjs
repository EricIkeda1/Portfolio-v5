import { chromium } from 'playwright'
const browser=await chromium.launch()
try {
  const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1})
  await page.goto('http://127.0.0.1:8765',{waitUntil:'networkidle'})
  await page.evaluate(()=>document.fonts.ready)
  await page.screenshot({path:'public/project-previews/x4glass.jpg',type:'jpeg',quality:90,animations:'disabled'})
} finally {await browser.close()}
