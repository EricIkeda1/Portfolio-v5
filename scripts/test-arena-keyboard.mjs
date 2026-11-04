import assert from 'node:assert/strict'
import { createServer } from 'vite'
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
 const { captureGameKey, gameKey, GAME_KEY_CODES } = await server.ssrLoadModule('/src/game/keyboard.ts')
 const event = (key, extra = {}) => ({key,prevented:false,stopped:false,preventDefault(){this.prevented=true},stopPropagation(){this.stopped=true},...extra})
 for (const [key,mod] of [['o',{ctrlKey:true}],['r',{ctrlKey:true}],['w',{ctrlKey:true}],['e',{metaKey:true}],['f',{altKey:true}],[' ',{}]]) {
  const e=event(key,mod);assert.equal(captureGameKey(e,true,true),true);assert.ok(e.prevented);assert.ok(e.stopped)
 }
 for (const key of ['Tab','Escape','F11']) {const e=event(key);assert.equal(captureGameKey(e,true,true),false);assert.equal(e.prevented,false)}
 for(const [playing,focused] of [[false,true],[true,false],[false,false]]) {const e=event('o',{ctrlKey:true});assert.equal(captureGameKey(e,playing,focused),false);assert.equal(e.prevented,false)}
 assert.equal(gameKey({code:'KeyW',key:'W'}),'w')
 assert.equal(gameKey({code:'KeyW',key:'z'}),'w')
 assert.equal(gameKey({code:'ArrowUp',key:'ArrowUp'}),'arrowup')
 assert.equal(gameKey({code:'Digit2',key:'@'}),'2')
 assert.equal(gameKey({code:'KeyO',key:'o'}),'')
 assert.ok(!GAME_KEY_CODES.includes('Escape') && !GAME_KEY_CODES.includes('Tab'))
 console.log('Teclado: atalhos modificados cancelados apenas durante jogo focado; saída, navegação e teclas físicas preservadas.')
} catch(error) { console.error(error);process.exitCode=1 }
finally {const timer=setTimeout(()=>process.exit(process.exitCode??0),2000);timer.unref();await server.close();clearTimeout(timer)}
