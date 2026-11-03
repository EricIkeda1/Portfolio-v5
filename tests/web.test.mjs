import assert from 'node:assert/strict'
import { before, after, test } from 'node:test'
import { createServer } from 'vite'
let server, projects, defaults, auth, handler
before(async () => {
 server=await createServer({server:{middlewareMode:true},appType:'custom'})
 projects=await server.ssrLoadModule('/src/web/projects.ts')
 defaults=await server.ssrLoadModule('/src/lib/portfolio.ts')
 auth=await server.ssrLoadModule('/api/_lib/auth.ts')
 handler=(await server.ssrLoadModule('/api/admin-projects.ts')).default
 process.env.SESSION_SECRET='test-only-secret-at-least-32-characters-long'
})
after(async()=>{await server?.close()})
function response(){return {statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v},status(c){this.statusCode=c;return this},json(b){this.body=b;return this}}}
test('Registros antigos: oculta mobile e artigos, preserva projetos web e não altera o array',()=>{
 const rows=[...defaults.DEFAULT_PROJECTS,...defaults.LEGACY_PROJECTS,{...defaults.DEFAULT_PROJECTS[0],id:90,type:'Iniciação Científica',name:'Manual ABNT',tags:[],category:'other'}]
 const length=rows.length
 const visible=projects.webProjects(rows)
 assert.ok(visible.some(p=>p.name==='WebShop'))
 assert.ok(!visible.some(p=>/Ademiconnect|Temperlights|AES|Manual ABNT/.test(p.name)))
 assert.equal(rows.length,length)
 assert.equal(projects.isWebProject({...defaults.DEFAULT_PROJECTS[0],published:false}),false)
})
test('URL legada de demonstração não é usada como link do GitHub',()=>{
 const legacy={...defaults.DEFAULT_PROJECTS[0],github:'https://webshopeyi.vercel.app',demo_url:''}
 const links=projects.projectLinks(legacy)
 assert.equal(links.repo,'https://github.com/EricIkeda1/webshop')
 assert.equal(new URL(links.demo).hostname,'webshopeyi.vercel.app')
})
test('Links e imagens rejeitam protocolos executáveis e URLs relativas ambíguas',()=>{
 for(const input of ['javascript:alert(1)','data:text/html,x','file:///etc/passwd']) assert.equal(projects.safeLink(input),'')
 assert.equal(projects.safeImage('//evil.example/x'),'')
 assert.equal(projects.safeImage('/\\evil.example'),'')
 assert.equal(projects.safeImage('/projects/delivery-hero.jpg'),'/projects/delivery-hero.jpg')
})
test('Sem imagem mantém capa tipográfica e sem demonstração não inventa link',()=>{
 const item={...defaults.DEFAULT_PROJECTS[0],name:'Sistema Novo',type:'Sistema web',image_url:null,github:'https://github.com/EricIkeda1/Sistema-Novo',demo_url:''}
 assert.equal(projects.projectCover(item).kind,'type')
 assert.equal(projects.projectLinks(item).demo,'')
})
test('Sessão adulterada e ausência de sessão não autorizam operações administrativas',async()=>{
 const token=auth.createSessionToken({id:1,email:'test@example.invalid'})
 assert.equal(auth.verifySessionToken(token).id,1)
 assert.equal(auth.verifySessionToken(token+'invalid'),null)
 const res=response()
 await handler({method:'POST',headers:{'content-type':'application/json',origin:'http://localhost',host:'localhost'},body:{name:'teste'}},res)
 assert.equal(res.statusCode,401)
})
test('POST de origem cruzada é recusado antes de qualquer escrita',async()=>{
 const res=response()
 await handler({method:'POST',headers:{'content-type':'application/json','sec-fetch-site':'cross-site',origin:'https://evil.example',host:'localhost'},body:{}},res)
 assert.equal(res.statusCode,403)
})
test('Páginas públicas são pré-renderizáveis e não reintroduzem acesso rápido no rodapé',async()=>{
 const {renderPage}=await server.ssrLoadModule('/src/entry-server.tsx')
 for(const path of ['/','/portfolio','/sobre','/contato']){
  const html=renderPage(path)
  assert.ok(html.includes('Desenvolvido por'))
  assert.ok(html.includes('Eric Y. Ikeda'))
  const footer=html.match(/<footer[\s\S]*?<\/footer>/)?.[0]
  assert.ok(footer)
  assert.ok(!footer.includes('<a '))
  assert.ok(!html.includes('WordPress'))
 }
})
