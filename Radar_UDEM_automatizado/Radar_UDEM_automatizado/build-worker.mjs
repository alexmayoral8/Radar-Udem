import fs from 'node:fs/promises';
const assets={};
for(const [file,type] of [['index.html','text/html; charset=utf-8'],['style.css','text/css; charset=utf-8'],['app.js','application/javascript; charset=utf-8'],['translation.js','application/javascript; charset=utf-8'],['favicon.svg','image/svg+xml']])assets['/'+file]={type,body:await fs.readFile('dist/'+file,'utf8')};
const seed=JSON.parse(await fs.readFile('dist/initial-news.json','utf8'));
const engine=await fs.readFile('news-engine.mjs','utf8');
const weeklyEngine=await fs.readFile('weekly-engine.mjs','utf8');
const mentionsEngine=await fs.readFile('mentions-engine.mjs','utf8');
const mentionsSeed=JSON.parse(await fs.readFile('dist/initial-mentions.json','utf8'));
const worker=engine.replace(/export /g,'')+'\n'+mentionsEngine.replace(/export /g,'')+'\n'+weeklyEngine.replace(/export /g,'')+'\nconst MENTIONS_SEED='+JSON.stringify(mentionsSeed)+';\n'+'\nconst ASSETS='+JSON.stringify(assets)+';\nconst SEED='+JSON.stringify(seed)+';\n'+`
let inflight=null,lastResult=null,lastResultAt=0;
let mentionsInflight=null,lastMentions=null,lastMentionsAt=0;
export default {async fetch(request,env,ctx){
 const url=new URL(request.url);
 if(url.pathname==='/api/automation/run'){
  if(request.method!=='POST')return new Response('Método no permitido',{status:405});
  const expected=env.AUTOMATION_TOKEN;
  if(!expected||request.headers.get('Authorization')!=='Bearer '+expected)return new Response('No autorizado',{status:401});
  try{
   const persisted=await weeklySnapshot(env.DB,lastResult||SEED);
   const fresh=await collect();
   const failed=new Set(fresh.sources.filter(s=>s.status==='error').map(s=>s.sourceId));
   const previous=(persisted.news||[]).filter(n=>failed.has(n.sourceId)).map(n=>({...n,stale:true}));
   if(previous.length)fresh.news=[...fresh.news,...previous].sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||''));
   if(fresh.sources.every(s=>s.status==='error')){
    return Response.json({ok:false,status:'sources_unavailable',checkedAt:fresh.checkedAt},{status:503});
   }
   await weeklySaveSnapshot(env.DB,fresh);
   lastResult=fresh;lastResultAt=Date.now();
   const weekday=new Intl.DateTimeFormat('en-US',{timeZone:'America/Monterrey',weekday:'short'}).format(new Date());
   let weekly={status:'skipped'};
   if(weekday==='Fri'){
    const res=await weeklySummaryResponse(env,fresh);
    weekly=await res.json();
   }
   return Response.json({ok:true,checkedAt:fresh.checkedAt,articleCount:fresh.news.length,sourceCount:fresh.sources.length,failedSources:[...failed],weeklyStatus:weekly.status,weeklyGeneratedCount:weekly.generatedCount||0},{status:weekday==='Fri'&&weekly.status==='unavailable'?503:200,headers:{'Cache-Control':'no-store'}});
  }catch(e){return Response.json({ok:false,status:'error',message:'La ejecución automática falló.'},{status:500});}
 }
 if(url.pathname==='/api/weekly-summary'){
  if(request.method!=='GET')return new Response('Método no permitido',{status:405});
  try{return await weeklySummaryResponse(env,lastResult||SEED);}catch{return Response.json({summaries:[],status:'unavailable',message:'No se pudo completar la consulta del resumen guardado. Las noticias siguen disponibles.'},{status:503,headers:{'Cache-Control':'no-store'}});}
 }
 if(url.pathname==='/api/sources')return Response.json(SOURCES);
 if(url.pathname==='/api/mentions'){
  if(!['GET','POST'].includes(request.method))return new Response('Método no permitido',{status:405});
  if(request.method==='GET'&&lastMentions&&Date.now()-lastMentionsAt<900000)return Response.json(lastMentions,{headers:{'Cache-Control':'no-store'}});
  if(!mentionsInflight)mentionsInflight=collectMentions({apiKey:env.GNEWS_API_KEY,enabled:env.GNEWS_ENABLED==='true',youtubeApiKey:env.YOUTUBE_API_KEY,newsdataApiKey:env.NEWSDATA_API_KEY}).finally(()=>{mentionsInflight=null});
  let data=await mentionsInflight;
  if(data.mode==='unavailable'){
   const history=lastMentions||MENTIONS_SEED;
   if(history.mentions.length)data={...data,attemptedAt:data.checkedAt,checkedAt:history.checkedAt,provider:history.provider,mode:'fallback',mentions:history.mentions.filter(n=>Date.now()-Date.parse(n.publishedTime)<=90*86400000&&(!['gnews','newsdata'].includes(n.provenance)||hasClearUdemMention(n.title,n.excerpt))&&(n.provenance!=='youtube'||hasYoutubeUdemMention(n.title,n.excerpt))).map(n=>({...n,stale:true})),warning:'El buscador no respondió. Se muestran menciones de una consulta anterior.'};
  }
  data={...data,mentions:data.mentions.map(n=>({...n,...mentionLabels(n.title,n.excerpt)}))};
  lastMentions=data;lastMentionsAt=Date.now();return Response.json(data,{headers:{'Cache-Control':'no-store'}});
 }
 if(url.pathname==='/api/news'){
  if(!['GET','POST'].includes(request.method))return new Response('Método no permitido',{status:405});
  if(request.method==='GET'&&lastResult&&Date.now()-lastResultAt<900000)return Response.json(lastResult,{headers:{'Cache-Control':'no-store'}});
  const persisted=await weeklySnapshot(env.DB,lastResult||SEED);
  if(request.method==='GET'&&persisted.checkedAt&&Date.now()-Date.parse(persisted.checkedAt)<900000){lastResult=persisted;lastResultAt=Date.parse(persisted.checkedAt);return Response.json(persisted,{headers:{'Cache-Control':'no-store'}});}
  if(!inflight)inflight=collect().finally(()=>{inflight=null});
  let data=await inflight;
  const history=persisted;
  const failed=new Set(data.sources.filter(s=>s.status==='error').map(s=>s.sourceId));
  const previous=history.news.filter(n=>failed.has(n.sourceId)).map(n=>({...n,stale:true}));
  if(previous.length)data={...data,news:[...data.news,...previous].sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||'')),warning:'Algunas fuentes no respondieron. Sus publicaciones anteriores están identificadas con la fecha de captura.'};
  if(data.sources.every(s=>s.status==='error'))data={...data,mode:'fallback',attemptedAt:data.checkedAt,checkedAt:history.checkedAt};
  data.sources=data.sources.map(s=>({...s,historicalCount:previous.filter(n=>n.sourceId===s.sourceId).length}));
  const response=Response.json(data,{headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  await weeklySaveSnapshot(env.DB,data);
  lastResult=data;lastResultAt=Date.now();
  return response;
 }
 if(!['GET','HEAD'].includes(request.method))return new Response('Método no permitido',{status:405});
 const path=url.pathname==='/'?'/index.html':url.pathname,asset=ASSETS[path];
 if(!asset)return new Response('Página no encontrada',{status:404});
 return new Response(request.method==='HEAD'?null:asset.body,{headers:{'Content-Type':asset.type,'X-Content-Type-Options':'nosniff','Cache-Control':'no-cache','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://api.mymemory.translated.net; object-src 'none'; base-uri 'self'; form-action 'self'"}});
}};
`;
await fs.mkdir('dist/server',{recursive:true});await fs.writeFile('dist/server/index.js',worker);
console.log('Worker ESM generado con rutas de captura y recursos de la página.');
