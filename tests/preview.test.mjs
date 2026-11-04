import assert from 'node:assert/strict'
import { before, after, test } from 'node:test'
import { createServer } from 'vite'
let server, helpers, handler, auth
before(async()=>{
 server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'})
 helpers=await server.ssrLoadModule('/api/_lib/github-preview.ts')
 handler=(await server.ssrLoadModule('/api/admin-project-preview.ts')).default
 auth=await server.ssrLoadModule('/api/_lib/auth.ts')
 process.env.SESSION_SECRET='preview-tests-only-32-character-secret-key'
})
after(async()=>{await server?.close()})
const response=()=>({statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v},status(c){this.statusCode=c;return this},json(b){this.body=b;return this}})
function signedHeaders(){const token=auth.createSessionToken({id:1,email:'preview@example.invalid'});return {'content-type':'application/json',origin:'http://localhost',host:'localhost',cookie:`portfolio_admin_session=${token}`}}
test('A análise aceita apenas GitHub HTTPS e não permite URLs de servidor local',()=>{
 assert.deepEqual(helpers.parseRepository('https://github.com/EricIkeda1/webshop.git'),{owner:'EricIkeda1',repo:'webshop'})
 for(const url of ['http://github.com/EricIkeda1/webshop','https://github.com.evil.example/u/r','https://user:pass@github.com/u/r','https://127.0.0.1/u/r','https://github.com/u/r/blob/main/a']) assert.throws(()=>helpers.parseRepository(url))
})
test('Arquivos de credenciais, API e autenticação não entram no contexto visual',()=>{
 for(const path of ['.env','src/.env.local','src/auth.tsx','api/index.tsx','src/secrets.tsx','node_modules/react/index.html']) assert.equal(helpers.isUiSource(path),false)
 assert.equal(helpers.isUiSource('src/App.tsx'),true)
 assert.equal(helpers.isUiSource('src/pages/Home.tsx'),true)
 const secret='postgresql://user:private-password@host/db'
 const prompt=helpers.buildImagePrompt({name:'WebShop',description:secret},{repository:'https://github.com/EricIkeda1/webshop',revision:'ref',sources:[{path:'src/App.tsx',content:helpers.redactSource('const API_KEY="do-not-send-this"; '+secret)}],images:[]})
 assert.ok(!prompt.includes('private-password'));assert.ok(!prompt.includes('do-not-send-this'))
 assert.ok(prompt.includes('untrusted'));assert.ok(prompt.includes('AI reconstruction'))
})
test('Capturas não são confundidas com logos, produtos ou ícones',()=>{
 const list=helpers.screenshotCandidates(['docs/screenshots/home.png','public/logo.png','public/product-images/preview.png','public/icons/screenshot.png'],{owner:'EricIkeda1',repo:'webshop'},'main')
 assert.equal(list.length,1);assert.equal(list[0].path,'docs/screenshots/home.png')
})
test('Geração é restrita ao admin e não chama a IA sem configuração',async()=>{
 let res=response();await handler({method:'POST',headers:{},body:{project_id:7,action:'generate'}},res);assert.equal(res.statusCode,401)
 const key=process.env.AI_GATEWAY_API_KEY, oidc=process.env.VERCEL_OIDC_TOKEN
 delete process.env.AI_GATEWAY_API_KEY;delete process.env.VERCEL_OIDC_TOKEN
 try{res=response();await handler({method:'POST',headers:signedHeaders(),body:{project_id:7,action:'generate'}},res);assert.equal(res.statusCode,503);assert.ok(res.body.error.includes('AI_GATEWAY_API_KEY'))}
 finally{if(key)process.env.AI_GATEWAY_API_KEY=key;if(oidc)process.env.VERCEL_OIDC_TOKEN=oidc}
})
test('Requisição cruzada não inicia leitura do GitHub ou geração',async()=>{
 const res=response();await handler({method:'POST',headers:{...signedHeaders(),'sec-fetch-site':'cross-site',origin:'https://evil.example'},body:{project_id:7,action:'inspect'}},res);assert.equal(res.statusCode,403)
})
