import assert from 'node:assert/strict'
import { createServer } from 'vite'
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
 const module = await server.ssrLoadModule('/api/_lib/db.ts')
 const content = await module.readPortfolioContent()
 assert.ok(content.projects.length >= 1)
 assert.equal(typeof content.about_text, 'string')
 const { webProjects, projectLinks, safeLink } = await server.ssrLoadModule('/src/web/projects.ts')
 const publicProjects = webProjects(content.projects)
 assert.ok(publicProjects.length >= 2)
 assert.ok(!publicProjects.some(p => /ademiconnect|temperlights/i.test(p.name)))
 const shop = publicProjects.find(p => /webshop/i.test(p.name))
 assert.ok(projectLinks(shop).repo.includes('github.com/EricIkeda1/webshop'))
 assert.ok(projectLinks(shop).demo.includes('webshopeyi.vercel.app'))
 assert.equal(safeLink('javascript:alert(1)'), '')
 const normalize = module.normalizeProject({id: 100, name:'Sem imagem', type:'Site', tags:[], highlights:[], github:''})
 assert.equal(normalize.image_url,null)
 const {default:handler} = await server.ssrLoadModule('/api/content.ts')
 const response = { headers: {}, code:200, setHeader(k,v){this.headers[k]=v}, status(c){this.code=c;return this}, json(body){this.body=body;return this} }
 await handler({method:'GET'}, response)
 assert.equal(response.code,200)
 assert.equal(response.headers['Cache-Control'],'no-store, max-age=0')
 assert.ok(!('profile_image_url' in response.body))
 assert.ok(!('DATABASE_URL' in response.body))
 assert.ok(response.body.projects.every(p => !('password_hash' in p)))
 console.log(JSON.stringify({database:'connected',projectCount:content.projects.length,visibleWebProjects:publicProjects.map(p=>p.name),publicApi:'ok',secrets:'not exposed'}))
} finally { await server.close() }
