const categories=["Educación con recursos limitados", "Aprendizaje permanente · LLL", "Tecnología e innovación", "Práctica clínica", "Investigación"];
let mentionsData={mentions:[],queries:[]},mentionsBusy=false;
const selectedMentionTopics=new Set();
let dataset={news:[],sources:[]},activeCategory='Todas',busy=false;
let weeklyState={summaries:[],status:'idle'},weeklyBusy=false,weeklyRevision=0,weeklyRetryAt=0,weeklyPolls=0;
const $=s=>document.querySelector(s);
function escape(t=''){return String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function dateLabel(value){return value?new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(value)):'Fecha no disponible'}
function timeLabel(value){return new Intl.DateTimeFormat('es-MX',{dateStyle:'medium',timeStyle:'short',timeZone:'America/Mexico_City'}).format(new Date(value))}
const titles={udem:['La conversación sobre UDEM','Menciones en medios de noticias y videos de YouTube.'],diario:['Noticias recientes','Publicaciones oficiales para explorar oportunidades en educación y salud.'],semana:['El panorama semanal','Las publicaciones de los últimos siete días, conectadas por tema.'],fuentes:['Las fuentes del radar','22 fuentes seleccionadas y el estado real de su última consulta.']};
function show(view){if(!titles[view])view='diario';document.querySelectorAll('.view').forEach(s=>s.hidden=s.id!==view);document.querySelectorAll('.nav').forEach(b=>{const selected=b.dataset.view===view;b.classList.toggle('active',selected);b.setAttribute('aria-current',selected?'page':'false')});$('#page-title').textContent=titles[view][0]+'.';$('#page-subtitle').textContent=titles[view][1];$('#eyebrow').textContent=new Intl.DateTimeFormat('es-MX',{dateStyle:'full',timeZone:'America/Mexico_City'}).format(new Date()).toUpperCase();$('#refresh').hidden=view==='udem';if(view==='udem'&&!mentionsData.checkedAt&&!mentionsBusy)loadMentions();if(view==='semana'&&dataset.checkedAt&&!busy)loadWeeklySummary()}
document.querySelectorAll('.nav').forEach(b=>b.addEventListener('click',()=>{location.hash=b.dataset.view}));window.addEventListener('hashchange',()=>show(location.hash.slice(1)));show(location.hash.slice(1)||'diario');
function todayKey(now=new Date()){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Mexico_City',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);const values=Object.fromEntries(parts.map(p=>[p.type,p.value]));return values.year+'-'+values.month+'-'+values.day}
function dailyItems(){return [...new Map(dataset.news.filter(n=>n.publishedAt===todayKey()).map(n=>[n.url,n])).values()]}
function visible(){const days=Number($('#period-filter').value),source=$('#source-filter').value;return dataset.news.filter(n=>(source==='all'||n.sourceId===source)&&(activeCategory==='Todas'||(n.categories||[n.category]).includes(activeCategory))&&(days===1?n.publishedAt===todayKey():(!n.publishedAt||Date.now()-Date.parse(n.publishedAt)<=days*86400000)))}
function newsTranslationNote(n){
 if(n.translationStatus==='translated')return '<small class="translation-note">Traducido automáticamente del portugués al español.</small>';
 if(n.translationStatus==='partial'||n.translationStatus==='unavailable')return '<small class="translation-note">'+(n.translationStatus==='partial'?'Traducción parcial. ':'Traducción no disponible. ')+escape(n.translationError||'No se pudo completar la consulta.')+' Se conserva el texto original de los campos pendientes.</small>';
 return '';
}

function newsSummaryText(news){
 const summary=String(news.summary||'').trim();
 return summary&&/[.!?][”"’')\]]*$/.test(summary)&&!/[.]{3}|…/.test(summary)?summary:'No hay suficiente contenido recuperado para mostrar un resumen completo. Consulta la publicación original.';
}
function weeklyTopicBalance(category,news){
 const summary=weeklyState.summaries.find(s=>s.category===category);
 const heading='<div class="week-balance-heading"><span class="week-balance-mark" aria-hidden="true"></span><h3>Síntesis de la semana</h3></div>';
 if(!summary){
  const message=weeklyBusy?'Preparando la síntesis de este tema…':weeklyState.message||'La síntesis se preparará al consultar el panorama semanal.';
  return '<aside class="week-balance" aria-live="polite">'+heading+'<p>'+escape(message)+'</p><small>Las noticias y sus resúmenes individuales permanecen disponibles arriba.</small></aside>';
 }
 return '<aside class="week-balance" aria-label="Síntesis semanal de '+escape(category)+'">'+heading+summary.paragraphs.map(p=>'<div class="week-synthesis-paragraph"><p>'+escape(p.text)+'</p><div class="week-synthesis-references">Fuentes: '+p.references.map((r,i)=>'<a href="'+escape(r.url)+'" target="_blank" rel="noopener noreferrer" title="'+escape(r.title)+'">'+escape(r.source)+' '+(i+1)+'</a>').join(' · ')+'</div></div>').join('')+'<small>Generado con Gemini · '+escape(timeLabel(summary.generatedAt))+' · '+summary.articleCount+' publicaciones.<br>Síntesis guardada: se reutiliza mientras no cambien las noticias de este tema. Basada únicamente en los títulos y resúmenes recuperados.</small></aside>';
}
async function loadWeeklySummary(){
 if(weeklyBusy||weeklyState.status==='ready'||Date.now()<weeklyRetryAt||!dataset.checkedAt)return;
 const revision=weeklyRevision;weeklyBusy=true;drawWeekly();
 try{
  const response=await fetch('/api/weekly-summary',{signal:AbortSignal.timeout(105000)});
  const result=await response.json();
  if(revision!==weeklyRevision)return;
  weeklyState=result;
  if(result.status==='cooldown')weeklyRetryAt=Date.now()+(result.retryAfterSeconds||300)*1000;
  if(result.status==='generating'&&weeklyPolls++<24)setTimeout(()=>{if(location.hash==='#semana')loadWeeklySummary()},5000);
 }catch{
  if(revision===weeklyRevision){weeklyState={summaries:[],status:'unavailable',message:'No se pudo recuperar la síntesis. Puedes volver a abrir el panorama semanal para reintentar.'};weeklyRetryAt=Date.now()+30000;}
 }finally{
  weeklyBusy=false;
  drawWeekly();
  if(revision!==weeklyRevision&&location.hash==='#semana')loadWeeklySummary();
 }
}
function drawWeekly(){
 const list=dataset.news.filter(n=>n.publishedAt&&Date.parse(n.publishedAt)<=Date.now()&&Date.now()-Date.parse(n.publishedAt)<=7*86400000);
 const groups=categories.map(c=>({category:c,news:list.filter(n=>(n.categories||[n.category]).includes(c))})).filter(g=>g.news.length);
 $('#weekly').innerHTML=groups.length?groups.map(renderWeeklyTopic).join('')+'<p class="week-method">Síntesis en español generadas con Gemini a partir del contenido recuperado, con enlaces a las fuentes. Se guardan por tema y solo se vuelven a generar cuando cambia su contenido. Una publicación puede aparecer en varios temas.</p>':'<div class="panel">No hay publicaciones con fecha verificada dentro de los últimos siete días. Puedes ampliar el periodo en Noticias recientes.</div>';
}
function renderWeeklyTopic(group,index){
 const news=[...new Map(group.news.map(n=>[n.url||n.id,n])).values()];
 const sources=new Set(news.map(n=>n.source)).size;
 return '<section class="week-topic" aria-labelledby="week-topic-'+index+'"><header class="week-topic-heading"><span class="week-topic-number" aria-hidden="true">'+String(index+1).padStart(2,'0')+'</span><div><h2 id="week-topic-'+index+'">'+escape(group.category)+'</h2><p>'+news.length+' noticia'+(news.length===1?'':'s')+' · '+sources+' fuente'+(sources===1?'':'s')+'</p></div></header><div class="week-stories">'+news.map(n=>'<article class="week-story"><div class="week-story-meta"><span class="week-story-source">'+escape(n.source)+'</span><span aria-hidden="true">·</span><time datetime="'+escape(n.publishedAt)+'">'+escape(dateLabel(n.publishedAt))+'</time></div><h3><a href="'+escape(n.url)+'" target="_blank" rel="noopener noreferrer">'+escape(n.title)+'</a></h3><p class="week-story-summary">'+escape(newsSummaryText(n))+'</p>'+newsTranslationNote(n)+(n.stale?'<p class="week-story-capture">Recopilación anterior · '+escape(dateLabel(n.capturedAt))+'</p>':'')+'<a class="week-story-link" href="'+escape(n.url)+'" target="_blank" rel="noopener noreferrer" aria-label="'+escape('Leer publicación original: '+n.title)+'">Leer publicación original</a></article>').join('')+'</div>'+weeklyTopicBalance(group.category,news)+'</section>';
}

function draw(){renderDailySummary();const items=visible();$('#news-count').textContent=items.length;$('#empty').hidden=items.length>0;$('#news-grid').innerHTML=items.map(n=>'<article class="news-card"><div class="card-meta"><span class="pill">'+escape((n.categories||[n.category]).join(' · '))+'</span><span class="article-date">'+escape(dateLabel(n.publishedAt))+'</span></div><h3>'+escape(n.title)+'</h3><p class="news-card-summary">'+escape(newsSummaryText(n))+'</p>'+newsTranslationNote(n)+(n.stale?'<small class="stale-label">Recopilación anterior · '+escape(dateLabel(n.capturedAt))+'</small>':'')+'<div class="card-bottom"><span>'+escape(n.source)+'</span><button class="detail-button" data-detail="'+escape(n.id)+'">Ver detalle</button></div></article>').join('');
drawWeekly();
const status={ok:'Consultada',partial:'Consulta parcial',error:'No disponible'};
$('#sources-body').innerHTML=dataset.sources.map(s=>'<tr><td>'+escape(s.name)+(s.collectionNote?'<small class="source-checked">'+escape(s.collectionNote)+'</small>':'')+'</td><td>'+escape(s.group||'')+'</td><td><span class="source-state '+s.status+'">'+status[s.status]+'</span>'+(s.errors?.length?'<details><summary>Ver incidencia</summary><p>'+escape(s.errors.map(e=>e.error).join(' · '))+'</p></details>':'')+'</td><td>'+s.count+' publicación'+(s.count===1?'':'es')+'<small class="source-checked">'+s.scanned+' revisadas · '+s.discarded+' descartadas</small><small class="source-checked">'+escape(timeLabel(s.checkedAt))+'</small></td><td><a href="'+escape(s.url)+'" target="_blank" rel="noopener noreferrer">Fuente oficial</a></td></tr>').join('');
const count=dataset.news.length,sources=dataset.sources.filter(s=>s.status!=='error').length;
$('#brief-title').textContent=count?count+' publicaciones para explorar.':'La consulta no encontró publicaciones.';
$('#brief-text').textContent=count?'El radar reúne publicaciones recientes sobre educación de profesionales de salud. Usa los filtros para elegir la fuente, el tema y el periodo.':'Revisa el estado de las fuentes o vuelve a intentar la consulta.';
$('#brief-date').textContent='Recopilación: '+timeLabel(dataset.checkedAt);
$('#source-summary').textContent=sources+'/'+dataset.sources.length+' fuentes consultadas'+(dataset.news.some(n=>n.stale)?' · incluye recopilaciones anteriores':'');
}
document.querySelectorAll('[data-filter]').forEach(b=>{b.setAttribute('aria-pressed',b.classList.contains('selected')?'true':'false');b.addEventListener('click',()=>{activeCategory=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',x===b?'true':'false')});draw()})});
$('#source-filter').addEventListener('change',draw);$('#period-filter').addEventListener('change',draw);
const dialog=$('#detail');$('#news-grid').addEventListener('click',e=>{const button=e.target.closest('[data-detail]');if(!button)return;const n=dataset.news.find(n=>n.id===button.dataset.detail);if(!n)return;$('#detail-body').innerHTML='<span class="pill">'+escape(n.source)+'</span><h2>'+escape(n.title)+'</h2><p class="muted">'+escape(dateLabel(n.publishedAt))+' · '+escape((n.categories||[n.category]).join(' · '))+'</p>'+'<h3>Resumen de la noticia</h3><p class="detail-news-summary">'+escape(newsSummaryText(n))+'</p>'+newsTranslationNote(n)+'<div class="implication"><b>ORIENTACIÓN PARA UDEM</b><p>'+escape(n.implication)+'</p></div><a href="'+escape(n.url)+'" target="_blank" rel="noopener noreferrer">Leer la publicación original</a><small>El resumen conserva oraciones completas de la descripción o contenido recuperado de la fuente. La orientación es una sugerencia general por tema; no es una evaluación específica de la iniciativa.</small><small>Capturada: '+escape(timeLabel(n.capturedAt))+(n.stale?' · La consulta actual de esta fuente falló.':'')+'</small>';dialog.showModal()});
$('#close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
async function load(force=false){if(busy)return;busy=true;weeklyRevision++;weeklyState={summaries:[],status:'idle'};weeklyRetryAt=0;weeklyPolls=0;$('#open-daily-summary').disabled=!dataset.checkedAt;const button=$('#refresh');button.disabled=true;button.textContent='Buscando noticias…';$('#last-update').textContent='Consultando las 22 fuentes oficiales. Puede tomar hasta dos minutos.';try{const r=await fetch('/api/news',{method:force?'POST':'GET',signal:AbortSignal.timeout(180000)});if(!r.ok)throw Error('HTTP '+r.status);dataset=await r.json();if(dataset.news.some(n=>n.language==='pt'||n.originalLanguage==='pt'||n.sourceId==='inovahc')){$('#last-update').textContent='Traduciendo noticias del portugués al español…';dataset.news=await translateNewsInBrowser(dataset.news);}const selected=$('#source-filter').value;$('#source-filter').innerHTML='<option value="all">Todas las fuentes</option>'+dataset.sources.map(s=>'<option value="'+escape(s.sourceId)+'">'+escape(s.name)+'</option>').join('');$('#source-filter').value=selected;draw();$('#last-update').textContent=(dataset.mode==='fallback'?'Recopilación anterior: ':'Última recopilación: ')+timeLabel(dataset.checkedAt)+' · Ciudad de México';if(dataset.warning)$('#last-update').textContent+=' · '+dataset.warning;}catch(e){$('#last-update').textContent='No se pudo completar la búsqueda. '+(dataset.news.length?'Se conserva la consulta anterior. ':'')+'Vuelve a intentarlo.';}finally{busy=false;$('#open-daily-summary').disabled=false;button.disabled=false;button.textContent='Actualizar noticias';if(location.hash==='#semana'&&dataset.checkedAt)loadWeeklySummary()}}
$('#refresh').addEventListener('click',()=>load(true));load();

function renderDailySummary(){
 const items=dailyItems(),day=dateLabel(todayKey()),failed=dataset.sources.filter(s=>s.status!=='ok').length;
 let html='<p class="summary-date">'+escape(day)+' · Fecha de referencia: Ciudad de México</p>';
 if(!dataset.checkedAt){html+='<div class="panel">Aún no hay una recopilación disponible. Pulsa Actualizar noticias para consultar las fuentes.</div>';}
 else{
  html+='<p class="summary-updated">Recopilación: '+escape(timeLabel(dataset.checkedAt))+'</p>';
  if(failed)html+='<div class="summary-notice">'+failed+' fuentes tuvieron una consulta incompleta o no disponible. Este resumen refleja las publicaciones que el radar pudo recuperar.</div>';
  if(!items.length){html+='<div class="panel"><h3>Sin noticias del día identificadas</h3><p>No se recuperaron publicaciones pertinentes con fecha de hoy. Las noticias de días anteriores y las que no tienen fecha permanecen en Noticias recientes.</p></div>';}
  else{
   const sourceCount=new Set(items.map(n=>n.sourceId)).size;
   const groups=categories.map(c=>({category:c,news:items.filter(n=>(n.categories||[n.category])[0]===c)})).filter(g=>g.news.length);
   html+='<p class="summary-lead">La lectura de hoy reúne <b>'+items.length+' publicación'+(items.length===1?'':'es')+'</b> de '+sourceCount+' fuente'+(sourceCount===1?'':'s')+'. Los temas presentes son '+escape(groups.map(g=>g.category.toLowerCase()).join(', '))+'.</p>';
   if(items.some(n=>n.stale))html+='<div class="summary-notice">Algunas noticias de hoy provienen de una recopilación anterior, porque su fuente no respondió en la consulta actual.</div>';
   html+='<p class="summary-method">Resumen breve de cada noticia mediante oraciones completas de su descripción o contenido, conservando el idioma de la fuente salvo las traducciones del portugués al español. No se añaden interpretaciones ni datos ajenos a la publicación. Cada publicación aparece una vez, bajo su tema principal. Incluye todas las fuentes recuperadas, independientemente de los filtros de la página.</p>';
   html+=groups.map(g=>'<section class="summary-group"><h3>'+escape(g.category)+'</h3>'+g.news.map(n=>'<article class="summary-story"><h4>'+escape(n.title)+'</h4><p class="summary-label">Resumen breve</p><p>'+escape(newsSummaryText(n))+'</p>'+newsTranslationNote(n)+'<div class="summary-source"><span>'+escape(n.source)+(n.stale?' · Recopilación anterior':'')+'</span><a href="'+escape(n.url)+'" target="_blank" rel="noopener noreferrer">Leer noticia</a></div></article>').join('')+'</section>').join('');
  }
 }
 $('#daily-summary-body').innerHTML=html;
}
const summaryPanel=$('#daily-summary-panel');
$('#open-daily-summary').addEventListener('click',()=>{renderDailySummary();summaryPanel.showModal()});
$('#close-daily-summary').addEventListener('click',()=>summaryPanel.close());
summaryPanel.addEventListener('click',e=>{if(e.target!==summaryPanel)return;const r=summaryPanel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)summaryPanel.close()});

function drawMentions(){
 const days=Number($('#mention-period').value),kind=$('#mention-kind').value,source=$('#mention-source').value,platform=$('#mention-platform').value;
 const items=mentionsData.mentions.filter(n=>Date.now()-Date.parse(n.publishedTime)<=days*86400000&&(kind==='all'||n.kind===kind)&&(source==='all'||n.source===source)&&(platform==='all'||(platform==='youtube'?n.provenance==='youtube':n.provenance!=='youtube'))&&(selectedMentionTopics.size===0||(n.topics||[n.topic]).some(t=>selectedMentionTopics.has(t))));
 $('#mention-count').textContent=items.length;
 $('#mention-media').textContent=new Set(items.map(n=>n.source)).size;
 $('#mention-owned').textContent=items.filter(n=>n.kind==='institutional').length;
 $('#mentions-empty').hidden=items.length>0;
 const themes=[...new Set(items.flatMap(n=>n.topics||[n.topic]))];
 $('#mentions-reading').textContent=items.length?'En el periodo seleccionado se encontraron '+items.length+' publicaciones. Los títulos y descripciones disponibles abordan '+themes.map(t=>t.toLowerCase()).join(', ')+'. La lista incluye noticias y videos; las tarjetas indican si el origen es institucional, externo o un canal sin verificar. Revisa la publicación original para valorar el contexto.':'No hay publicaciones para resumir con los filtros seleccionados.';
 $('#mentions-grid').innerHTML=items.map(n=>'<article class="news-card"><div class="card-meta"><span class="mention-topics">'+(n.topics||[n.topic]).map(t=>'<span class="pill">'+escape(t)+'</span>').join('')+'</span><span class="article-date">'+escape(dateLabel(n.publishedAt))+'</span></div><h3>'+escape(n.title)+'</h3><p class="mention-origin">'+(n.provenance==='youtube'?'Video · YouTube · Canal sin verificar':n.provenance==='clipping'?'Medio externo · Recorte recopilado por UDEM':(n.kind==='institutional'?'Publicación institucional · ':'Medio externo · ')+escape((n.foundVia||[n.provenance==='newsdata'?'NewsData.io':'GNews']).join(' + ')))+'</p>'+(n.excerpt?'<p>'+escape(n.excerpt)+'</p>':'')+(n.matchBasis?'<small class="mention-match">'+escape(n.matchBasis)+'</small>':'')+(n.provenance==='clipping'?'<a class="mention-archive" href="'+escape(n.archiveUrl)+'" target="_blank" rel="noopener noreferrer">Archivo de prensa UDEM</a>':'')+(n.stale?'<small class="stale-label">Consulta anterior · '+escape(dateLabel(n.capturedAt))+'</small>':'')+'<div class="card-bottom"><span>'+escape(n.source)+'</span><a class="mention-link" href="'+escape(n.url)+'" target="_blank" rel="noopener noreferrer">'+(n.provenance==='youtube'?'Ver video':n.provenance==='clipping'?'Ver recorte':'Abrir noticia')+'</a></div></article>').join('');
 $('#mention-query-status').innerHTML=mentionsData.queries.map(q=>'<p><b>'+escape(q.label)+'</b>: '+(q.status==='ok'?q.count+' resultados pertinentes'+(q.discarded?' · '+q.discarded+' descartados tras validación':''):escape(q.error||'No disponible'))+'</p>').join('');
}
async function loadMentions(force=false){
 if(mentionsBusy)return;mentionsBusy=true;const button=$('#refresh-mentions');button.disabled=true;button.textContent='Buscando menciones…';$('#mentions-update').textContent='Consultando noticias y videos de YouTube…';
 try{const r=await fetch('/api/mentions',{method:force?'POST':'GET',signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error('HTTP '+r.status);mentionsData=await r.json();const current=$('#mention-source').value;$('#mention-source').innerHTML='<option value="all">Todos los medios</option>'+[...new Set(mentionsData.mentions.map(n=>n.source))].sort().map(name=>'<option value="'+escape(name)+'">'+escape(name)+'</option>').join('');$('#mention-source').value=[...new Set(mentionsData.mentions.map(n=>n.source))].includes(current)?current:'all';drawMentions();$('#mentions-update').textContent=mentionsData.mode==='unavailable'?'No se pudo consultar el buscador. Revisa las incidencias e intenta actualizar nuevamente.':(mentionsData.mode==='fallback'?'Consulta anterior: ':'Última consulta: ')+timeLabel(mentionsData.checkedAt)+' · '+mentionsData.provider+(mentionsData.warning?' · '+mentionsData.warning:'');}
 catch(e){$('#mentions-update').textContent='No se pudo actualizar el radar de menciones.'+(mentionsData.mentions.length?' Se conserva la consulta anterior.':' Intenta nuevamente.');}
 finally{mentionsBusy=false;button.disabled=false;button.textContent='Actualizar menciones'}
}
$('#refresh-mentions').addEventListener('click',()=>loadMentions(true));
['#mention-period','#mention-kind','#mention-source','#mention-platform'].forEach(selector=>$(selector).addEventListener('change',drawMentions));

document.querySelectorAll('[data-mention-topic]').forEach(button=>button.addEventListener('click',()=>{
 const topic=button.dataset.mentionTopic;
 if(topic==='all')selectedMentionTopics.clear();
 else if(selectedMentionTopics.has(topic))selectedMentionTopics.delete(topic);
 else selectedMentionTopics.add(topic);
 document.querySelectorAll('[data-mention-topic]').forEach(b=>{
  const selected=b.dataset.mentionTopic==='all'?selectedMentionTopics.size===0:selectedMentionTopics.has(b.dataset.mentionTopic);
  b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));
 });
 drawMentions();
}));
