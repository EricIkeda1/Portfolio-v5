import { useEffect, useState } from 'react'
type Rating = {id:number;rating:number;updated_at:string}
export default function RatingsPanel(){
 const [rows,setRows]=useState<Rating[]>([]),[next,setNext]=useState<number|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState('')
 async function load(before?:number){setBusy(true);try{const r=await fetch(`/api/admin-messages?view=ratings${before?`&before=${before}`:''}`,{cache:'no-store'});if(!r.ok)throw Error();const data=await r.json();setRows(previous=>before?[...previous,...data.ratings]:data.ratings);setNext(data.next)}catch{setMessage('Não foi possível carregar as avaliações.')}finally{setBusy(false)}}
 useEffect(()=>{void load()},[])
 async function save(row:Rating,remove=false){
  if(remove&&!confirm('Retirar esta avaliação do site e do cálculo da média?'))return
  setBusy(true);setMessage('');try{const r=await fetch('/api/admin-messages?view=ratings',{method:remove?'DELETE':'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:Number(row.id),rating:row.rating})});if(!r.ok)throw Error();await load();setMessage(remove?'Avaliação retirada.':'Nota atualizada.')}catch{setMessage('Não foi possível salvar. Tente novamente.')}finally{setBusy(false)}
 }
 return <section className="admin-ratings"><h2>Avaliações do portfólio</h2><p>Notas de 0 a 5, sem identificação pessoal. Alterações afetam a média pública; excluir retira a nota do cálculo.</p><button onClick={()=>void load()} disabled={busy}>Atualizar lista</button><p role="status">{busy?'Carregando…':message}</p>{!busy&&!rows.length&&<p>Nenhuma avaliação disponível.</p>}<div className="admin-rating-list">{rows.map(row=><article key={row.id}><div><strong>Avaliação #{row.id}</strong><p>{new Date(row.updated_at).toLocaleString('pt-BR')}</p></div><label>Nota<select aria-label={`Nota da avaliação ${row.id}`} value={row.rating} disabled={busy} onChange={e=>setRows(rows.map(item=>item.id===row.id?{...item,rating:Number(e.target.value)}:item))}>{[0,1,2,3,4,5].map(n=><option key={n} value={n}>{n} estrelas</option>)}</select></label><button disabled={busy} onClick={()=>void save(row)}>Salvar nota</button><button disabled={busy} onClick={()=>void save(row,true)}>Excluir</button></article>)}</div>{next&&<button disabled={busy} onClick={()=>void load(next)}>Carregar mais</button>}</section>
}
