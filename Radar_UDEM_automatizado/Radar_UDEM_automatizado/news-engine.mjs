export const SOURCES=[
  {
    "id": "who",
    "name": "OMS",
    "url": "https://www.who.int/news",
    "region": "Global",
    "group": "Organizaciones",
    "pattern": "^/news/item/\\d{2}-\\d{2}-\\d{4}-"
  },
  {
    "id": "paho",
    "name": "PAHO / OPS",
    "url": "https://www.paho.org/en/news/news-releases",
    "region": "Américas",
    "group": "Organizaciones",
    "pattern": "^/en/news/\\d{1,2}-\\d{1,2}-\\d{4}-"
  },
  {
    "id": "unesco",
    "name": "UNESCO",
    "url": "https://www.unesco.org/en/newsroom/press-release",
    "region": "Global",
    "group": "Organizaciones",
    "pattern": "^/en/articles/[^/]+/?$"
  },
  {
    "id": "amee",
    "name": "AMEE",
    "url": "https://amee.org/news/",
    "region": "Global",
    "group": "Organizaciones",
    "pattern": "^/news/articles/[^/]+/?$"
  },
  {
    "id": "aamc",
    "name": "AAMC",
    "url": "https://www.aamc.org/news",
    "region": "Estados Unidos",
    "group": "Organizaciones",
    "pattern": "^/news/[^/]+/?$"
  },
  {
    "id": "funsalud",
    "name": "FUNSALUD",
    "url": "https://funsalud.org.mx/actualidad/",
    "region": "México",
    "group": "Organizaciones",
    "pattern": "^/[^/]{25,}/?$"
  },
  {
    "id": "oecd",
    "listingUrl": "https://www.oecd.org/en/topics/health.html",
    "collectionNote": "Selección de publicaciones de la sección Salud; no es el catálogo completo.",
    "name": "OECD Health",
    "url": "https://www.oecd.org/en/search/publications.html?facetTags=oecd-policy-areas%3Apa11%2Coecd-languages%3Aen&orderBy=mostRelevant&page=0",
    "region": "Global",
    "group": "Organizaciones",
    "pattern": "^/en/publications/[^/]+\\.html$"
  },
  {
    "id": "bmc",
    "name": "BMC Medical Education",
    "url": "https://link.springer.com/journal/12909/articles",
    "region": "Global",
    "group": "Organizaciones",
    "pattern": "^/article/10\\.1186/s12909-",
    "hosts": [
      "link.springer.com",
      "link.springernature.com"
    ]
  },
  {
    "id": "mayo",
    "name": "Mayo Clinic College of Medicine & Science",
    "url": "https://college.mayo.edu/about/news/",
    "region": "Estados Unidos",
    "group": "Instituciones referencia",
    "pattern": "^/about/news/news-archive/[^/]+/?$"
  },
  {
    "id": "harvard",
    "name": "Harvard Medical School",
    "url": "https://hms.harvard.edu/news/search?topic%5BEducation%5D=Education",
    "region": "Estados Unidos",
    "group": "Instituciones referencia",
    "pattern": "^/news/[^/]+/?$"
  },
  {
    "id": "stanford",
    "name": "Stanford Medicine",
    "url": "https://medicine.stanford.edu/news.html",
    "region": "Estados Unidos",
    "group": "Instituciones referencia",
    "pattern": "^/news/stories/\\d{4}/\\d{2}/[^/]+\\.html$"
  },
  {
    "id": "duke",
    "name": "Duke School of Medicine",
    "url": "https://medschool.duke.edu/newsroom",
    "region": "Estados Unidos",
    "group": "Instituciones referencia",
    "pattern": "^/news/[^/]+/?$"
  },
  {
    "id": "mcmaster",
    "name": "McMaster University – Faculty of Health Sciences",
    "url": "https://healthsci.mcmaster.ca/news-events/latest-news/",
    "region": "Canadá",
    "group": "Instituciones referencia",
    "pattern": "^/[^/]{20,}/?$"
  },
  {
    "id": "hopkins",
    "listingUrl": "https://www.hopkinsmedicine.org/news/newsroom/news-releases",
    "collectionNote": "Comunicados recientes de la sala de prensa.",
    "name": "Johns Hopkins Medicine",
    "url": "https://www.hopkinsmedicine.org/news",
    "region": "Estados Unidos",
    "group": "Instituciones referencia",
    "pattern": "^/news/(?:articles|newsroom/news-releases)/\\d{4}/\\d{2}/"
  },
  {
    "id": "mit",
    "name": "MIT – Health Sciences and Technology",
    "url": "https://hst.mit.edu/news-events",
    "region": "Estados Unidos",
    "group": "Instituciones referencia",
    "pattern": "^/news-events/[^/]{25,}/?$"
  },
  {
    "id": "imperial",
    "name": "Imperial College London – Faculty of Medicine",
    "url": "https://www.imperial.ac.uk/medicine/news-events/all-news/",
    "region": "Reino Unido",
    "group": "Instituciones referencia",
    "pattern": "^/news/\\d+/[^/]+/?$"
  },
  {
    "id": "tec",
    "name": "TecSalud",
    "url": "https://www.tecsalud.mx/noticias",
    "region": "México",
    "group": "Competencia México",
    "pattern": "^/(?:noticias|es/noticias)/.+",
    "hosts": [
      "www.tecsalud.mx",
      "conecta.tec.mx"
    ]
  },
  {
    "id": "uanl",
    "name": "UANL – Facultad de Medicina",
    "url": "https://www.medicina.uanl.mx/noticias/",
    "region": "México / Nuevo León",
    "group": "Competencia México",
    "pattern": "^/noticias/[^/]+/[^/]+/?$"
  },
  {
    "id": "unam",
    "name": "UNAM – Facultad de Medicina",
    "url": "https://gaceta.facmed.unam.mx/",
    "region": "México",
    "group": "Competencia México",
    "pattern": "^/index.php/\\d{4}/\\d{2}/\\d{2}/"
  },
  {
    "id": "udg",
    "name": "Universidad de Guadalajara – CUCS",
    "url": "https://www.cucs.udg.mx/noticias",
    "region": "México",
    "group": "Competencia México",
    "pattern": "^/(?:noticias|noticia)/[^/]+"
  },
  {
    "id": "uc",
    "name": "Pontificia Universidad Católica de Chile – Facultad de Medicina",
    "url": "https://medicina.uc.cl/extension-y-vinculacion-con-el-medio/extension/noticias/",
    "region": "Chile",
    "group": "Competencia LATAM",
    "pattern": "^/extension-y-vinculacion-con-el-medio/extension/noticias/[^/]+/?$"
  },
  {
    "id": "inova",
    "name": "USP / Hospital das Clínicas – InovaHC",
    "url": "https://inovahc.com.br/conteudos/",
    "region": "Brasil",
    "group": "Competencia LATAM",
    "pattern": "^/[^/]{25,}/?$"
  }
];
export function clean(text=''){return text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&apos;|&#039;/g,"'").replace(/&nbsp;/g,' ').replace(/&rsquo;/g,'’').replace(/&lsquo;/g,'‘').replace(/&ndash;/g,'–').replace(/&mdash;/g,'—').replace(/\s+/g,' ').trim()}
function attr(html,name){return [...html.matchAll(/<meta\b[^>]*>/gi)].map(m=>m[0]).map(tag=>{const attrs=Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(m=>[m[1].toLowerCase(),m[2]]));return attrs.property===name||attrs.name===name?clean(attrs.content):null}).find(Boolean)||''}
export const CATEGORIES=['Educación con recursos limitados','Aprendizaje permanente · LLL','Tecnología e innovación','Práctica clínica','Investigación'];
export function classify(text,source){
 const t=text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),categories=[];
 const education=/educat|educac|ensin|aprendiz|learning|train|formaci|capacita|curricul|competenc|docen|student|estudiant/.test(t);
 if(education&&/low.resource|resource.limit|low[\s-]+and[\s-]+middle[\s-]+income|\blmics?\b|ingresos.(bajos|medios)|recursos.limit|bajos.recursos|low.cost|bajo.costo|conectividad|underserved|rural|low.income|income.countr|pocos.recursos|recursos.escass|equidad.educ|educational.inequal/.test(t))categories.push(CATEGORIES[0]);
 if(/lifelong|life.long|continuing.educ|continuous.professional|educacion.continua|aprendizaje.permanente|professional.development|faculty.development|desarrollo.profesional|microcred|upskill|reskill|actualizacion|diplomado|capacitacion|formacao.continuada/.test(t))categories.push(CATEGORIES[1]);
 if(/artificial.intelligence|inteligencia.artificial|\bai\b|\bia\b|digital|technolog|tecnolog|simulat|simulac|virtual|robot|biodesign|innovaci|inovacao|innovation/.test(t))categories.push(CATEGORIES[2]);
 if(/patient|pacient|care.delivery|health.care.delivery|surg|cirug|diagnos|treatment|treating|tratam|clinical.(practice|care|skill|rotation|placement|training)|practica.clinica|pratica.clinica|atencion.(clinica|medica|sanitaria)|seguridad.del.paciente|patient.safety|supervised.clinical|clinical.supervision|supervision.clinica/.test(t))categories.push(CATEGORIES[3]);
 if(/research|investiga|pesquisa|study|studies|estudio|ensaio|trial|evidence|evidencia|cientific|scientific|grant|funding|beca/.test(t)||source.id==='bmc')categories.push(CATEGORIES[4]);
 // Policy and general institutional notices remain excluded unless an agreed topic matches.
 return categories;
}
export const implications={
 [CATEGORIES[0]]:'Explorar la viabilidad de soluciones de formación en contextos con recursos limitados.',
 [CATEGORIES[1]]:'Identificar oportunidades de actualización y educación continua para profesionales de salud.',
 [CATEGORIES[2]]:'Valorar el aporte de la tecnología a la formación, la atención o la investigación.',
 [CATEGORIES[3]]:'Revisar la posible relación con campos clínicos, aprendizaje supervisado y seguridad del paciente.',
 [CATEGORIES[4]]:'Explorar evidencia, preguntas de investigación y oportunidades de colaboración científica.'};
export function assertNewsPage(html){
 const visible=clean(html).slice(0,1000);
 const restricted=/incapsula incident|verify you are human|just a moment|access denied|request rejected|request blocked|the request could not be satisfied/i.test(visible)||(/<iframe\b[^>]*src=["'][^"']*_Incapsula_Resource/i.test(html)&&clean(html).length<2000);
 if(restricted)throw Error('La respuesta recibida es una página de bloqueo, no el contenido de noticias. No se pudo consultar automáticamente en este intento.');
}
export function candidates(source,html){
 const seen=new Map(),allowed=source.hosts||[new URL(source.url).host],pattern=new RegExp(source.pattern);
 assertNewsPage(html);
 const main=source.id==='funsalud'?[...html.matchAll(/<article\b[^>]*>[\s\S]*?<\/article>/gi)].map(m=>m[0]).join('\n'):html;
 for(const m of main.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)){
  let url;try{url=new URL(clean(m[1]),source.url)}catch{continue}
  if(!['http:','https:'].includes(url.protocol)||!allowed.includes(url.host)||!pattern.test(url.pathname))continue;
  if(/\/(category|tag|feed|page|wp-content)\//.test(url.pathname)||/\.(pdf|png|jpg|jpeg|webp)$/.test(url.pathname))continue;
  if(source.id==='oecd'&&!/_[a-z0-9]{8}-en\.html$/.test(url.pathname))continue;
  if(source.id==='aamc'&&/press-center/.test(url.pathname))continue;
  if(source.id==='mit'&&/events-academic-calendar|community-awards|hst-graduation-celebration|twihst/.test(url.pathname))continue;
  if(source.id==='harvard'&&/\/news\/(search|education|research|community|care-delivery)\/?$/.test(url.pathname))continue;
  let title=clean(m[2])||clean(m[2].match(/alt=["']([^"']+)/i)?.[1])||decodeURIComponent(url.pathname.split('/').filter(Boolean).at(-1)).replace(/[-_]/g,' ');if(title.length<12)title=decodeURIComponent(url.pathname.split('/').filter(Boolean).at(-1)).replace(/[-_]/g,' ');if(/fundrais|donation|support the fund/i.test(title))continue;
  if(source.id==='oecd'&&!/health|medical|medic|care|hospital|nurs|enferm/i.test(title))continue;
  const listedDate=source.id==='hopkins'?title.match(/^(\d{2})\/(\d{2})\/(20\d{2})\s+/):null;
  const publishedAt=listedDate?listedDate[3]+'-'+listedDate[1]+'-'+listedDate[2]:null;
  if(listedDate)title=title.slice(listedDate[0].length);
  url.hash='';url.search='';url.protocol='https:';const href=url.href;
  if(href===source.url.split('?')[0])continue;
  if(!seen.has(href)||title.length>(seen.get(href).listText||'').length)seen.set(href,{url:href,listText:title,...(publishedAt?{publishedAt}:{})});
 }
 return [...seen.values()].filter(n=>n.listText.length>=12).slice(0,6);
}
export function articleParagraphs(html,title=''){
 const titleKey=clean(title).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const stripped=html.replace(/<(nav|header|footer|aside|form|script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,' ');
 const main=stripped.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]||stripped;
 const headingAt=main.search(/<h1\b/i);
 const body=headingAt>=0?main.slice(headingAt):main;
 return [...body.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map(m=>clean(m[1])).filter(t=>t.split(/\s+/).length>=12&&t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()!==titleKey&&!/^(read more|learn more|subscribe|sign up|share|related|copyright|cookie|privacy|contact|follow us|by |leer mas|suscrib|compartir|aviso de privacidad)/i.test(t)&&!/all rights reserved|accept all cookies|enable javascript|todos los derechos reservados/i.test(t)).slice(0,6);
}
export function briefArticleSummary(html,title,description=''){
 const normalize=t=>clean(t).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const titleKey=normalize(title);
 const meaningful=t=>t.split(/\s+/).length>=12&&normalize(t)!==titleKey&&!/^(read more|learn more|subscribe|sign up|share|related|copyright|cookie|privacy|contact|follow us|by |leer mas|suscrib|compartir|aviso de privacidad)/i.test(t)&&!/all rights reserved|accept all cookies|enable javascript|todos los derechos reservados/i.test(t);
 // Use source text only; do not infer a conclusion from a headline.
 const paragraphs=articleParagraphs(html,title);
 const metadata=clean(description);
 const sentenceSegments=text=>{
  const segments=[...new Intl.Segmenter('en',{granularity:'sentence'}).segment(text)].map(s=>s.segment.trim());
  const joined=[];
  for(let i=0;i<segments.length;i++){
   let sentence=segments[i];
   while(/(?:\bDr|\bProf|\bFig|\bNo|\bet al|\be\.g|\bi\.e)\.$/i.test(sentence)&&i+1<segments.length)sentence+=' '+segments[++i];
   if(sentence.split(/\s+/).length>=8&&/[.!?][”"’')\]]*$/.test(sentence)&&!/[.]{3}|…/.test(sentence))joined.push(sentence);
  }
  return joined;
 };
 const metadataSentences=meaningful(metadata)?sentenceSegments(metadata):[];
 const bodySentences=paragraphs.slice(0,6).flatMap(sentenceSegments);
 const candidates=metadataSentences.length?metadataSentences:bodySentences;
 const limit=Math.max(25,Math.min(75,85-clean(title).split(/\s+/).length));
 const chosen=[];let words=0;
 for(const sentence of candidates){
  const count=sentence.split(/\s+/).length;
  if(words+count>limit)continue;
  if(chosen.some(t=>normalize(t)===normalize(sentence)))continue;
  chosen.push(sentence);words+=count;if(chosen.length===2)break;
 }
 // If metadata contains only an overlong sentence, use complete body sentences.
 if(!chosen.length&&metadataSentences.length){
  for(const sentence of bodySentences){const count=sentence.split(/\s+/).length;if(words+count>limit)continue;chosen.push(sentence);words+=count;if(chosen.length===2)break;}
 }
 if(!chosen.length)return {summary:'',summaryBasis:null};
 const fromMetadata=chosen.every(t=>metadataSentences.includes(t));
 return {summary:chosen.join(' '),summaryBasis:fromMetadata?'Oraciones completas de la descripción de la fuente':'Oraciones completas del contenido de la noticia'};
}
const PT_TRANSLATION_CACHE=new Map();
export function translationChunks(text,limit=450){
 const bytes=t=>new TextEncoder().encode(t).length;
 const chunks=[];let current='';
 const sentences=[...new Intl.Segmenter('pt',{granularity:'sentence'}).segment(text)].map(s=>s.segment.trim()).filter(Boolean);
 for(const sentence of sentences){
  if(bytes(sentence)>limit){
   if(current){chunks.push(current);current='';}
   for(const word of sentence.split(/\s+/)){if(bytes(word)>limit)throw Error('Texto no traducible en esta consulta.');if(bytes(current?current+' '+word:word)>limit){chunks.push(current);current=word}else current=current?current+' '+word:word;}
   if(current){chunks.push(current);current='';}
  }else if(bytes(current?current+' '+sentence:sentence)>limit){chunks.push(current);current=sentence}else current=current?current+' '+sentence:sentence;
 }
 if(current)chunks.push(current);return chunks;
}
export async function translatePortugueseText(text,fetcher=fetch){
 if(!text)return '';
 const cached=PT_TRANSLATION_CACHE.get(text);if(cached&&Date.now()-cached.at<86400000)return cached.value;
 const output=[];
 for(const chunk of translationChunks(text)){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  try{
   const r=await fetcher('https://api.mymemory.translated.net/get?'+new URLSearchParams({q:chunk,langpair:'pt|es'}),{signal:controller.signal,headers:{Accept:'application/json'}});
   if(!r.ok)throw Error('Servicio de traducción no disponible.');
   const data=await r.json();if(Number(data.responseStatus)!==200||data.quotaFinished||!data.responseData?.translatedText)throw Error('Servicio de traducción no disponible.');
   output.push(clean(data.responseData.translatedText));
  }finally{clearTimeout(timer)}
 }
 let value=output.join(' ');const punctuation=text.match(/[.!?][”"’')\]]*$/)?.[0];if(punctuation&&!/[.!?][”"’')\]]*$/.test(value))value+=punctuation;
 if(PT_TRANSLATION_CACHE.size>=300)PT_TRANSLATION_CACHE.delete(PT_TRANSLATION_CACHE.keys().next().value);
 PT_TRANSLATION_CACHE.set(text,{at:Date.now(),value});return value;
}
export async function translatePortugueseArticle(n,fetcher=fetch){
 if(!n||n.language!=='pt'||n.translationStatus==='translated')return n;
 try{
  const [title,summary]=await Promise.all([translatePortugueseText(n.originalTitle||n.title,fetcher),translatePortugueseText(n.originalSummary||n.summary||'',fetcher)]);
  return {...n,title,summary,originalTitle:n.originalTitle||n.title,originalSummary:n.originalSummary||n.summary||'',language:'es',originalLanguage:'pt',translationStatus:'translated',translationProvider:'MyMemory'};
 }catch{return {...n,translationStatus:'unavailable'};}
}
export function article(source,candidate,html,now=Date.now()){
 assertNewsPage(html);
 const heading=clean(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]);
 const title=(['hopkins','funsalud'].includes(source.id)?attr(html,'og:title'):heading)||attr(html,'og:title')||candidate.listText;
 if(!title||title.length<12||/page not found|forbidden|access denied|just a moment/i.test(title))throw Error('No se pudo identificar el artículo.');
 const description=attr(html,'description')||attr(html,'og:description');
 let date=attr(html,'article:published_time')||attr(html,'datePublished')||attr(html,'pubdate')||attr(html,'citation_publication_date')||attr(html,'DC.date.issued');
 if(!date)date=html.match(/"datePublished"\s*:\s*"([^"]+)"/)?.[1]||html.match(/<time\b[^>]*datetime=["']([^"']+)/i)?.[1];
 if(!date){const m=candidate.url.match(/\/(20\d{2})\/(\d{2})\/(\d{2})\//);if(m)date=m.slice(1).join('-')}
 if(!date){const m=candidate.url.match(/\/(\d{1,2})-(\d{1,2})-(20\d{2})-/);if(m)date=m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0')}
 if(!date){const h=html.search(/<h1\b/i);const near=clean(html.slice(Math.max(0,h),h+7000));date=near.match(/(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+20\d{2}/i)?.[0]}
 if(!date&&candidate.publishedAt)date=candidate.publishedAt;
 const timestamp=date?Date.parse(date):NaN,publishedAt=Number.isFinite(timestamp)?new Date(timestamp).toISOString().slice(0,10):null;
 if(publishedAt&&(timestamp>now+86400000||now-timestamp>120*86400000))return null;
 const brief=briefArticleSummary(html,title,description);
 const content=[title,description,brief.summary,...articleParagraphs(html,title)].join(' ');
 if(/concert|concierto|estacionamiento|parking|sociedad.de.estudiantes|heritage.month|celebrates.pride/i.test(title))return null;
 if(source.id==='oecd'&&!/health|medical|medic|care|hospital|nurs|enferm/i.test(content))return null;
 if(source.id==='unesco'&&!/educat|educac|learn|school|digital|research|science|cientif/i.test(content))return null;
 const categories=classify(content,source);if(!categories.length)return null;
 // Keep a short source excerpt rather than reproducing the article.
 const excerpt=description.split(/\s+/).slice(0,Math.max(0,25-title.split(/\s+/).length)).join(' ');
 return {...brief,language:source.id==='inovahc'||/<html\b[^>]*lang=["']pt(?:[-_][^"']*)?["']/i.test(html)?'pt':null,id:candidate.url,sourceId:source.id,source:source.name,group:source.group,url:candidate.url,title,excerpt:excerpt+(excerpt&&excerpt!==description?'…':''),categories,category:categories[0],publishedAt,capturedAt:new Date(now).toISOString(),implication:implications[categories[0]]};
}
async function request(url){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),url.includes('who.int/api/hubs/newsitems')?30000:20000);try{const r=await fetch(url,{signal:controller.signal,headers:{Accept:'text/html,application/json','User-Agent':'UDEM-Radar/0.2 (official public news)'}});if(!r.ok)throw Error(r.status===403?'El sitio rechazó la consulta automática (HTTP 403).':r.status===404?'La página consultada no se encontró (HTTP 404).':r.status===503?'El servidor no pudo atender la consulta (HTTP 503). Inténtalo más tarde.':r.status===522?'Se agotó el tiempo de conexión entre Cloudflare y el servidor de la fuente (HTTP 522). Inténtalo más tarde.':'HTTP '+r.status);const t=await r.text();if(t.length>3000000)throw Error('Página demasiado grande.');return t}finally{clearTimeout(timer)}}
async function pool(items,fn,limit=6){let cursor=0;const result=new Array(items.length);await Promise.all(Array.from({length:Math.min(limit,items.length)},async()=>{while(cursor<items.length){const i=cursor++;result[i]=await fn(items[i])}}));return result}
export async function sourceCandidates(s,fetchPage){
 if(s.id==='who'){
  const u=new URL('https://www.who.int/api/hubs/newsitems');
  for(const [k,v] of Object.entries({sf_site:'15210d59-ad60-47ff-a542-7ed76645f0c7',sf_provider:'OpenAccessDataProvider',sf_culture:'en','$orderby':'PublicationDateAndTime desc','$top':'6','$select':'Title,ItemDefaultUrl,FormatedDate'}))u.searchParams.set(k,v);
  const data=JSON.parse(await fetchPage(u.href));if(!Array.isArray(data.value))throw Error('OMS no devolvió un listado de noticias válido.');
  return data.value.map(n=>{const path=String(n.ItemDefaultUrl||'');return {url:new URL(path.startsWith('/news/item/')?path:path.replace(/^\/+/,''),'https://www.who.int/news/item/').href,listText:clean(n.Title),publishedAt:n.FormatedDate?new Date(n.FormatedDate).toISOString().slice(0,10):null}}).filter(n=>new URL(n.url).hostname==='www.who.int'&&/^\/news\/item\//.test(new URL(n.url).pathname));
 }
 const html=await fetchPage(s.listingUrl||s.url);
 return candidates(s,html);
}
export async function collect(fetchPage=request, sourceIds=null){
 const selected=sourceIds?SOURCES.filter(s=>sourceIds.includes(s.id)):SOURCES;
 const checkedAt=new Date().toISOString();
 const results=await pool(selected,async s=>{try{
  const links=await sourceCandidates(s,fetchPage);if(!links.length)throw Error('No se identificaron enlaces de artículos en la respuesta recibida. Esto no confirma un bloqueo: el listado puede cargar dinámicamente o haber cambiado de estructura.');
  const errors=[];let discarded=0;
  const articles=(await pool(links.slice(0,12),async link=>{try{const item=article(s,link,await fetchPage(link.url));if(!item)discarded++;return item}catch(e){errors.push({error:e.name==='AbortError'?'Tiempo de espera agotado':e.message});return null}},2)).filter(Boolean);
  return {sourceId:s.id,name:s.name,url:s.url,group:s.group,collectionNote:s.collectionNote||null,status:errors.length===links.length?'error':errors.length?'partial':'ok',checkedAt,articles,errors,scanned:Math.min(links.length,12),discarded};
 }catch(e){return {sourceId:s.id,name:s.name,url:s.url,group:s.group,collectionNote:s.collectionNote||null,status:'error',checkedAt,articles:[],errors:[{error:e.name==='AbortError'?'Tiempo de espera agotado':e.message}],scanned:0,discarded:0}}},8);
 const news=[...new Map(results.flatMap(r=>r.articles).map(a=>[a.url,a])).values()].sort((a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||''));
 return {checkedAt,news,sources:results.map(({articles,...r})=>({...r,count:articles.length})),windowDays:120,mode:'live',categories:CATEGORIES};
}
