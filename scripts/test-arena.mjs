import assert from 'node:assert/strict'
import { createServer } from 'vite'
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
 const { createGame, freshInput, step, distance, WEAPONS } = await server.ssrLoadModule('/src/game/engine.ts')
 const calm = () => { const g = createGame(123); g.actors = g.actors.slice(0,2); g.actors[1].x = 70; g.actors[1].y = 70; g.obstacles=[]; g.loot=[]; return g }
 const advance = (g,input,frames) => { for(let i=0;i<frames;i++) step(g,input,1/60) }
 assert.equal(createGame(3).actors.length,16)
 assert.deepEqual(createGame(3).obstacles,createGame(3).obstacles)
 let g=calm(), input=freshInput(); input.x=1; const start=g.actors[0].x; advance(g,input,60); assert.ok(Math.abs(g.actors[0].x-start-182)<.1)
 g=calm(); input=freshInput(); input.x=1;input.y=1; const origin={...g.actors[0]};advance(g,input,60);assert.ok(Math.abs(distance(g.actors[0],origin)-182)<.1)
 g=calm();input=freshInput();input.x=1;g.obstacles=[{x:1200,y:1100,r:30,kind:'rock',hp:Infinity}];advance(g,input,80);assert.ok(distance(g.actors[0],g.obstacles[0])>=46.9)
 g=calm();input=freshInput();input.fire=true;step(g,input,1/60);assert.equal(g.actors[0].ammo,11);assert.equal(g.bullets.length,1)
 input.fire=false;g.actors[0].ammo=0;input.reload=true;advance(g,input,90);assert.equal(g.actors[0].ammo,WEAPONS[0].clip);assert.equal(g.actors[0].reserve,78)
 g=calm();input=freshInput();g.actors[0].hp=30;input.heal=true;advance(g,input,145);assert.equal(g.actors[0].hp,85);assert.equal(g.actors[0].kits,1)
 g=calm();input=freshInput();g.loot=[{x:1100,y:1100,kind:'rifle'}];step(g,input,1/60);assert.equal(g.actors[0].weapon,1);assert.ok(g.unlocked.includes(1));assert.equal(g.loot.length,0)
 g=calm();input=freshInput();input.weapon=2;step(g,input,1/60);assert.equal(g.actors[0].weapon,0)
 g=calm();g.actors[1].x=1145;g.actors[1].y=1100;g.actors[1].hp=24;input=freshInput();input.fire=true;advance(g,input,150);assert.ok(!g.actors[1].alive);assert.ok(g.victory);assert.equal(g.actors[0].kills,1)
 const endingTime=g.elapsed;advance(g,input,10);assert.equal(g.elapsed,endingTime)
 g=calm();g.elapsed=160;g.actors[0].x=2100;g.actors[0].y=2100;input=freshInput();const hp=g.actors[0].hp;advance(g,input,60);assert.ok(g.actors[0].hp<hp);assert.ok(g.zone<400)
 g=createGame(42);input=freshInput();advance(g,input,60*240);assert.ok(g.ended);assert.ok(g.bullets.length<100);assert.ok(g.particles.length<150)
 console.log('Arena: geração, velocidade, diagonal, colisão, tiros, recarga, cura, coleta, desbloqueios, vitória, zona e simulação prolongada verificados.')
} catch(error) { console.error(error);process.exitCode=1 }
finally { const timer=setTimeout(()=>process.exit(process.exitCode??0),2000);timer.unref();await server.close();clearTimeout(timer) }
