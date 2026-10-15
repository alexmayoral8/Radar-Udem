export const MENTION_QUERIES=[
 {id:'nombre',label:'Universidad de Monterrey',query:'"Universidad de Monterrey"'},
 {id:'siglas',label:'UDEM + Monterrey / Nuevo León',query:'UDEM AND (Monterrey OR "Nuevo León")'}
];
function xmlText(text=''){return text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim()}
function field(item,name){return xmlText(item.match(new RegExp('<'+name+'(?:\\s[^>]*)?>([\\s\\S]*?)<\\/'+name+'>','i'))?.[1]||'')}
export const MENTION_TOPICS=[
 'Educación y experiencia estudiantil',
 'Salud',
 'Investigación e innovación',
 'Vinculación y reconocimiento',
 'Cultura, deportes y comunidad',
 'Institucional y otros'
];
export function classifyMention(title='',description=''){
 const t=xmlText(String(title)+' '+String(description)).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),topics=[];
 if(/educa|academic|formaci|carrera|clases|estudiant|alumn|docent|profesor|beca|admision|graduac|egresad|vida.universitaria|experiencia.estudiantil|student|learning|teaching|curricul|campus/.test(t))topics.push(MENTION_TOPICS[0]);
 if(/salud|hospital|medic|clinica|clinico|enfermer|pacient|nutrici|health|patient|nursing/.test(t))topics.push(MENTION_TOPICS[1]);
 if(/investiga|cientific|research|science|ciencia|descubri|tecnolog|technolog|innov|inteligencia.artificial|artificial.intelligence|\bia\b|\bai\b|digital|patente/.test(t))topics.push(MENTION_TOPICS[2]);
 if(/convenio|alianza|colabor|vincula|premi|reconoc|ranking|acredit|award|partnership|agreement|distincion/.test(t))topics.push(MENTION_TOPICS[3]);
 if(/\barte\b|\bartes\b|cultura|deport|exposicion|musica|festival|concierto|torneo|competencia.deportiva|voluntari|comunidad|participacion.social|sports|basketball|basquet|futbol|football|teatro|danza/.test(t))topics.push(MENTION_TOPICS[4]);
 return topics.length?topics:[MENTION_TOPICS[5]];
}
export function mentionLabels(title,description=''){
 const topics=classifyMention(title,description);return {topics,topic:topics[0]};
}
export function hasClearUdemMention(title='',excerpt=''){
 const context=xmlText(String(title)+' '+String(excerpt)).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 if(/\buniversidad de monterrey\b/.test(context))return true;
 if(/universidad de medellin|universidad de montreal|universite de montreal|university of montreal|universidad de montemorelos/.test(context))return false;
 return /\budem\b/.test(context);
}
export function parseGnews(data,q,now=Date.now()){
 if(!data||!Array.isArray(data.articles))throw Error('GNews no devolvió una respuesta de noticias válida.');
 const items=[];for(const article of data.articles){
  const title=xmlText(String(article.title||''));if(!title)continue;
  const excerpt=xmlText(String(article.description||''));
  if(!hasClearUdemMention(title,excerpt))continue;
  let url;try{url=new URL(article.url);if(!['https:','http:'].includes(url.protocol))continue}catch{continue}
  const timestamp=Date.parse(article.publishedAt);if(!Number.isFinite(timestamp)||timestamp>now+86400000||now-timestamp>90*86400000)continue;
  const source=xmlText(String(article.source?.name||url.hostname));let sourceUrl=null;try{const u=new URL(article.source?.url);if(['https:','http:'].includes(u.protocol))sourceUrl=u.href}catch{}
  const institutional=/(^|\.)udem\.edu\.mx$/.test(url.hostname)||(sourceUrl&&/(^|\.)udem\.edu\.mx$/.test(new URL(sourceUrl).hostname));
  const id=(title+'|'+source).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9|]/g,'');
  items.push({id,title,source,sourceUrl,url:url.href,publishedAt:new Date(timestamp).toISOString().slice(0,10),publishedTime:new Date(timestamp).toISOString(),capturedAt:new Date(now).toISOString(),kind:institutional?'institutional':'external',...mentionLabels(title,excerpt),provenance:'gnews',excerpt,queryId:q.id,matchBasis:hasClearUdemMention(title)?'Mención de UDEM en el titular':'Mención de UDEM en el extracto'});
 }return items;
}
export async function requestGnews(apiKey,q,now=Date.now(),fetcher=fetch){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
 let phase='connection',httpStatus=null;
 const params=new URLSearchParams({q:q.query,max:'10',in:'title,description',nullable:'description,content,image',sortby:'publishedAt',from:new Date(now-30*86400000).toISOString(),apikey:apiKey});
 try{
  const r=await fetcher('https://gnews.io/api/v4/search?'+params,{signal:controller.signal,headers:{Accept:'application/json'}});
  httpStatus=r.status;
  if(!r.ok){const messages={400:'GNews no aceptó los parámetros de búsqueda.',401:'GNews no aceptó la clave de acceso.',403:'GNews restringió el acceso. Revisa el plan y la cuota de la cuenta.',429:'GNews alcanzó el límite de consultas de la cuenta (HTTP 429). Inténtalo cuando se restablezca la cuota.'};throw Error(messages[r.status]||'GNews no está disponible en este momento (HTTP '+r.status+').');}
  phase='json';const data=await r.json();phase='validation';const items=parseGnews(data,q,now);return {id:q.id,label:q.label,provider:'GNews API',status:'ok',items,count:items.length,received:data.articles.length,discarded:data.articles.length-items.length,totalMatches:Number(data.totalArticles)||0,limited:!!data.articlesRemovedFromResponse||Number(data.totalArticles)>data.articles.length,delayed:!!data.information?.realTimeArticles};
 }catch(e){return {id:q.id,label:q.label,provider:'GNews API',status:'error',items:[],count:0,httpStatus,errorCode:e.name==='AbortError'?'timeout':httpStatus&&httpStatus!==200?'http_'+httpStatus:phase==='json'?'invalid_response':phase==='validation'?'invalid_data':'connection',error:e.name==='AbortError'?'GNews tardó demasiado en responder.':e.message?.startsWith('GNews ')?e.message:phase==='json'?'GNews respondió con un formato que no se pudo leer. Inténtalo nuevamente.':phase==='validation'?'GNews devolvió una respuesta de noticias no válida.':'No se pudo establecer la conexión con GNews en este intento. Inténtalo nuevamente.'}}finally{clearTimeout(timer)}
}
async function fetchMentionFeed(url){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);try{const r=await fetch(url,{signal:controller.signal,headers:{Accept:'application/rss+xml,application/xml,text/xml,text/html','User-Agent':'Mozilla/5.0'}});if(!r.ok)throw Error('HTTP '+r.status);return await r.text()}finally{clearTimeout(timer)}}
const MENTION_MONTHS=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
export function clippingQueries(now=Date.now()){
 const current=new Date(now);return Array.from({length:4},(_,i)=>{const date=new Date(Date.UTC(current.getUTCFullYear(),current.getUTCMonth()-i,1));const month=MENTION_MONTHS[date.getUTCMonth()],year=date.getUTCFullYear();return {id:'prensa-'+year+'-'+month,label:'UDEM en la prensa · '+month+' '+year,url:'https://www.udem.edu.mx/es/institucional/udem-en-la-prensa-'+month+'-'+year,year,month:date.getUTCMonth()}});
}
export function parseClippings(html,q,now=Date.now()){
 if(!/UDEM en la prensa/i.test(html))throw Error('No se encontró el archivo de prensa.');
 const items=[];for(const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)){
  const body=match[2],title=xmlText(body.match(/<h5\b[^>]*>([\s\S]*?)<\/h5>/i)?.[1]||'');if(!title)continue;
  const lines=body.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1]?.split(/<br\s*\/?\s*>/i).map(xmlText)||[];
  const source=lines[0],date=lines.slice(1).join(' ').match(/(\d{1,2}) de ([a-záéíóú]+)/i);if(!source||!date||MENTION_MONTHS.indexOf(date[2].toLowerCase())!==q.month)continue;
  const stamp=Date.UTC(q.year,q.month,Number(date[1]),12);if(stamp>now+86400000||now-stamp>90*86400000)continue;
  let url;try{url=new URL(xmlText(match[1]),q.url);if(!['https:','http:'].includes(url.protocol)||!/(^|\.)udem\.edu\.mx$/.test(url.hostname))continue}catch{continue}
  const key=(title+'|'+source).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9|]/g,'');
  items.push({id:key,title,source,sourceUrl:null,url:url.href,publishedAt:new Date(stamp).toISOString().slice(0,10),publishedTime:new Date(stamp).toISOString(),capturedAt:new Date(now).toISOString(),kind:'external',...mentionLabels(title),provenance:'clipping',archiveUrl:q.url,dateBasis:'Fecha indicada en el archivo de prensa de UDEM'});
 }return items;
}
export const YOUTUBE_QUERIES=[
 {id:'youtube-nombre',label:'YouTube · UDEM + Universidad de Monterrey',query:'UDEM "Universidad de Monterrey"'},
 {id:'youtube-siglas',label:'YouTube · UDEM + Monterrey',query:'UDEM Monterrey'}
];
export function hasYoutubeUdemMention(title='',excerpt=''){
 const context=xmlText(String(title)+' '+String(excerpt)).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 return /\budem\b/.test(context)&&hasClearUdemMention(title,excerpt)&&/\buniversidad de monterrey\b|\bmonterrey\b|\bnuevo leon\b/.test(context);
}
export function parseYoutube(data,q,now=Date.now()){
 if(!data||!Array.isArray(data.items))throw Error('YouTube no devolvió una respuesta válida.');
 const items=[];
 for(const video of data.items){
  const id=video.id?.videoId,s=video.snippet||{},title=xmlText(s.title||''),excerpt=xmlText(s.description||'');
  if(!/^[A-Za-z0-9_-]{11}$/.test(id||'')||!hasYoutubeUdemMention(title,excerpt))continue;
  const stamp=Date.parse(s.publishedAt);if(!Number.isFinite(stamp)||stamp>now+86400000||now-stamp>90*86400000)continue;
  const channelId=/^[A-Za-z0-9_-]{24}$/.test(s.channelId||'')?s.channelId:null;
  items.push({id:'youtube:'+id,videoId:id,title,excerpt,source:xmlText(s.channelTitle||'Canal de YouTube'),sourceUrl:channelId?'https://www.youtube.com/channel/'+channelId:null,channelId,url:'https://www.youtube.com/watch?v='+id,publishedAt:new Date(stamp).toISOString().slice(0,10),publishedTime:new Date(stamp).toISOString(),capturedAt:new Date(now).toISOString(),kind:'unverified',...mentionLabels(title,excerpt),provenance:'youtube',queryId:q.id,matchBasis:'Mención explícita de UDEM en el título o descripción, con contexto de Monterrey / Nuevo León. Origen del canal pendiente de verificación.'});
 }
 return items;
}
export async function requestYoutube(apiKey,q,now=Date.now(),fetcher=fetch){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
 try{
  const params=new URLSearchParams({part:'snippet',type:'video',q:q.query,maxResults:'25',order:'date',publishedAfter:new Date(now-90*86400000).toISOString(),key:apiKey});
  const r=await fetcher('https://www.googleapis.com/youtube/v3/search?'+params,{signal:controller.signal,headers:{Accept:'application/json'}});
  if(!r.ok){let reason='';try{reason=(await r.json()).error?.errors?.[0]?.reason||''}catch{}
   if(/quotaExceeded|dailyLimitExceeded/.test(reason))throw Error('YouTube alcanzó la cuota diaria de consultas.');
   if(reason==='accessNotConfigured'||reason==='SERVICE_DISABLED')throw Error('Habilita YouTube Data API v3 en el proyecto de Google Cloud.');
   if(/keyInvalid|ipRefererBlocked|forbidden/.test(reason)||[400,401,403].includes(r.status))throw Error('YouTube rechazó la conexión. Revisa la clave, las restricciones de acceso y la API habilitada.');
   throw Error('YouTube no está disponible en este momento.');
  }
  const data=await r.json(),items=parseYoutube(data,q,now);
  return {id:q.id,label:q.label,provider:'YouTube API',status:'ok',items,count:items.length,received:data.items.length,discarded:data.items.length-items.length,limited:!!data.nextPageToken};
 }catch(e){return {id:q.id,label:q.label,provider:'YouTube API',status:'error',items:[],count:0,error:e.name==='AbortError'?'YouTube tardó demasiado en responder.':e.message?.startsWith('YouTube ')||e.message?.startsWith('Habilita ')?e.message:'No se pudo conectar con YouTube.'}}finally{clearTimeout(timer)}
}
export const NEWSDATA_QUERIES=[
 {id:'newsdata-nombre',label:'NewsData.io · Universidad de Monterrey',query:'"Universidad de Monterrey"'},
 {id:'newsdata-siglas',label:'NewsData.io · UDEM',query:'UDEM'}
];
export function parseNewsdata(data,q,now=Date.now()){
 if(data?.status!=='success'||!Array.isArray(data.results))throw Error('NewsData.io no devolvió una respuesta válida.');
 const articles=data.results.map(n=>({title:n.title,description:n.description,url:n.link,publishedAt:typeof n.pubDate==='string'?n.pubDate.replace(' ','T')+(n.pubDateTZ==='UTC'&&!/[Zz]|[+-]\d{2}:?\d{2}$/.test(n.pubDate)?'Z':''):n.pubDate,source:{name:n.source_name||n.source_id,url:n.source_url}}));
 return parseGnews({articles},q,now).map(n=>({...n,provenance:'newsdata',foundVia:['NewsData.io'],dateBasis:'Fecha proporcionada por NewsData.io'}));
}
export async function requestNewsdata(apiKey,q,now=Date.now(),fetcher=fetch){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
 const failure=error=>({id:q.id,label:q.label,provider:'NewsData.io',status:'error',items:[],count:0,error});
 try{
  const params=new URLSearchParams({apikey:apiKey,q:q.query,size:'10'});
  const r=await fetcher('https://newsdata.io/api/1/latest?'+params,{signal:controller.signal,headers:{Accept:'application/json'}});
  if(!r.ok)return failure(({400:'NewsData.io no aceptó los parámetros.',401:'NewsData.io no aceptó la clave de acceso.',403:'NewsData.io restringió el acceso. Revisa la clave y el plan.',429:'NewsData.io alcanzó el límite de consultas.'})[r.status]||'NewsData.io no está disponible (HTTP '+r.status+').');
  const data=await r.json(),items=parseNewsdata(data,q,now);
  return {id:q.id,label:q.label,provider:'NewsData.io',status:'ok',items,count:items.length,received:data.results.length,discarded:data.results.length-items.length,totalMatches:Number(data.totalResults)||0,limited:!!data.nextPage};
 }catch(e){return failure(e.name==='AbortError'?'NewsData.io tardó demasiado en responder.':e.message?.startsWith('NewsData.io ')?e.message:'No se pudo conectar con NewsData.io en este intento.')}finally{clearTimeout(timer)}
}
export function mergeMentions(items){
 const map=new Map(),urls=new Map();
 for(const n of items){
  let urlKey=n.url;try{const u=new URL(n.url);u.hash='';for(const key of [...u.searchParams.keys()])if(/^utm_|^(fbclid|gclid)$/i.test(key))u.searchParams.delete(key);urlKey=u.href.replace(/\/$/,'')}catch{}
  const key=urls.get(urlKey)||n.id,previous=map.get(key);
  const provider=n.provenance==='gnews'?'GNews':n.provenance==='newsdata'?'NewsData.io':n.provenance==='youtube'?'YouTube':'UDEM en la prensa';
  map.set(key,previous?{...previous,foundVia:[...new Set([...(previous.foundVia||[]),...(n.foundVia||[provider])])]}:{...n,foundVia:n.foundVia||[provider]});urls.set(urlKey,key);
 }
 return [...map.values()];
}
export async function collectMentions(options={},now=Date.now()){
 const checkedAt=new Date(now).toISOString(),fetchFeed=options.fetchFeed||fetchMentionFeed;
 const active=options.enabled===true&&!!options.apiKey;
 const searches=active?Promise.all(MENTION_QUERIES.map(q=>requestGnews(options.apiKey,q,now,options.fetcher||fetch))):Promise.resolve(MENTION_QUERIES.map(q=>({id:q.id,label:q.label,provider:'GNews API',status:'pending',items:[],count:0,error:'Conexión preparada; pendiente de activar un plan apto para la página publicada.'})));
 const archives=Promise.all(clippingQueries(now).map(async q=>{try{const items=parseClippings(await fetchFeed(q.url),q,now);return {id:q.id,label:q.label,provider:'UDEM en la prensa',status:'ok',items,count:items.length}}catch(e){return {id:q.id,label:q.label,provider:'UDEM en la prensa',status:'error',items:[],count:0,error:e.name==='AbortError'?'Tiempo de espera agotado':'No se pudo consultar este archivo mensual.'}}}));
 const youtube=options.youtubeApiKey?Promise.all(YOUTUBE_QUERIES.map(q=>requestYoutube(options.youtubeApiKey,q,now,options.fetcher||fetch))):Promise.resolve(YOUTUBE_QUERIES.map(q=>({id:q.id,label:q.label,provider:'YouTube API',status:'pending',items:[],count:0,error:'YouTube pendiente de configurar la clave de API.'})));
 const newsdata=options.newsdataApiKey?Promise.all(NEWSDATA_QUERIES.map(q=>requestNewsdata(options.newsdataApiKey,q,now,options.fetcher||fetch))):Promise.resolve([]);
 const results=(await Promise.all([searches,archives,youtube,newsdata])).flat(),merged=mergeMentions(results.flatMap(r=>r.items));
 const providers=[...new Set(results.filter(r=>r.status==='ok').map(r=>r.provider))],warnings=[];
 if(!active)warnings.push('La búsqueda de GNews está pendiente de activación; se muestran los resultados disponibles de las otras fuentes.');
 else if(!results.some(r=>r.provider==='GNews API'&&r.status==='ok'))warnings.push('GNews no respondió; se muestran los resultados disponibles de las otras fuentes.');
 if(results.some(r=>r.provider==='GNews API'&&r.delayed))warnings.push('La cuenta de prueba de GNews entrega noticias con 12 horas de retraso.');
 if(results.some(r=>r.provider==='GNews API'&&r.limited))warnings.push('GNews devolvió una selección limitada de coincidencias.');
 if(options.youtubeApiKey&&!results.some(r=>r.provider==='YouTube API'&&r.status==='ok'))warnings.push('YouTube no respondió; se conserva la cobertura disponible de las demás fuentes.');
 if(results.some(r=>r.provider==='YouTube API'&&r.limited))warnings.push('YouTube devuelve hasta 25 videos por búsqueda; la cobertura no es exhaustiva.');
 if(options.newsdataApiKey&&!results.some(r=>r.provider==='NewsData.io'&&r.status==='ok'))warnings.push('NewsData.io no respondió; se muestran los resultados disponibles de las otras fuentes.');
 if(results.some(r=>r.provider==='NewsData.io'&&r.limited))warnings.push('NewsData.io devuelve hasta 10 resultados por búsqueda; la cobertura no es exhaustiva.');
 if(results.some(r=>r.status==='error'))warnings.push('Algunas consultas no estuvieron disponibles.');
 return {checkedAt,mentions:merged.sort((a,b)=>b.publishedTime.localeCompare(a.publishedTime)),queries:results.map(({items,...q})=>q),mode:providers.length?'live':'unavailable',windowDays:90,searchWindowDays:30,searchActive:active,youtubeActive:!!options.youtubeApiKey,newsdataActive:!!options.newsdataApiKey,provider:providers.join(' + ')||'GNews API + UDEM en la prensa',warning:warnings.join(' ')};
}
