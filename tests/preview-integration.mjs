// Executar somente em branch de teste do Neon. Não faz chamadas pagas de IA.
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { createServer } from 'vite'
const server=await createServer({server:{middlewareMode:true},appType:'custom'})
let sql, projectId
function response(){return {statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v},status(c){this.statusCode=c;return this},json(b){this.body=b;return this},send(b){this.bytes=b;return this}}}
try{
 const helpers=await server.ssrLoadModule('/api/_lib/github-preview.ts')
 const context=await helpers.readRepository({owner:'EricIkeda1',repo:'webshop'})
 assert.ok(context.sources.length>0)
 assert.ok(context.sources.some(s=>/App|css|package/.test(s.path)))
 console.log(JSON.stringify({github:'read',files:context.sources.map(s=>s.path),images:context.images.length}))
 if(process.env.ALLOW_PREVIEW_TEST_WRITES!=='1') throw Error('Para testar persistência, configure uma branch isolada e ALLOW_PREVIEW_TEST_WRITES=1.')
 const db=await server.ssrLoadModule('/api/_lib/db.ts');await db.ensureSchema();sql=db.getSql()
 const store=await server.ssrLoadModule('/api/_lib/preview-store.ts');await store.ensurePreviewSchema()
 const created=await sql`INSERT INTO portfolio_projects (name,type,description,tags,github,category,published) VALUES ('QA - preview storage','Sistema web','Registro temporário do teste de prévias','[]'::jsonb,'https://github.com/EricIkeda1/webshop','web',false) RETURNING id`
 projectId=Number(created[0].id)
 const id=randomUUID(), url=`/api/project-preview?id=${id}`
 const data='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l8sAAAAASUVORK5CYII='
 await sql`INSERT INTO portfolio_project_previews (id,project_id,image_base64,media_type,source_url,model) VALUES (${id},${projectId},${data},'image/png','https://github.com/EricIkeda1/webshop','test-fixture-not-ai')`
 const {default:serve}=await server.ssrLoadModule('/api/project-preview.ts')
 let res=response();await serve({method:'GET',query:{id},headers:{}},res);assert.equal(res.statusCode,404)
 const auth=await server.ssrLoadModule('/api/_lib/auth.ts');const token=auth.createSessionToken({id:1,email:'qa@example.invalid'})
 res=response();await serve({method:'GET',query:{id},headers:{cookie:`portfolio_admin_session=${token}`}},res);assert.equal(res.statusCode,200);assert.equal(res.headers['Content-Type'],'image/png')
 await sql`UPDATE portfolio_projects SET image_url=${url},published=true WHERE id=${projectId}`
 res=response();await serve({method:'GET',query:{id},headers:{}},res);assert.equal(res.statusCode,200);assert.ok(res.bytes.length>0)
 console.log(JSON.stringify({storage:'Neon ok',draft:'admin only',publishedImage:'public ok',paidGeneration:'not executed'}))
}finally{
 if(sql&&projectId)await sql`DELETE FROM portfolio_projects WHERE id=${projectId} AND name='QA - preview storage'`
 await server.close()
}
