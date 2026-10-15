const BROWSER_TRANSLATIONS=new Map(),TRANSLATION_REQUESTS=new Map();
const TRANSLATION_STORE='udem_pt_es_translations_v1';
try{for(const [key,value] of JSON.parse(localStorage.getItem(TRANSLATION_STORE)||'[]'))if(Date.now()-value.at<7*86400000)BROWSER_TRANSLATIONS.set(key,value)}catch{}
function saveTranslations(){try{localStorage.setItem(TRANSLATION_STORE,JSON.stringify([...BROWSER_TRANSLATIONS].slice(-300)))}catch{}}
function translationDecode(t){return String(t).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').trim();}
function translationChunks(text,limit=450){
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

async function translateBrowserText(text,fetcher=fetch){
 if(!text)return '';
 const previous=BROWSER_TRANSLATIONS.get(text);if(previous&&Date.now()-previous.at<7*86400000)return previous.value;
 if(TRANSLATION_REQUESTS.has(text))return TRANSLATION_REQUESTS.get(text);
 const pending=(async()=>{
  const output=[];
  for(const chunk of translationChunks(text)){
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
   try{
    const r=await fetcher('https://api.mymemory.translated.net/get?'+new URLSearchParams({q:chunk,langpair:'pt|es'}),{signal:controller.signal});
    if(!r.ok)throw Error(r.status===429?'Se alcanzó el límite de uso del traductor.':'El traductor rechazó la consulta (HTTP '+r.status+').');
    const data=await r.json();
    if(data.quotaFinished===true||data.quotaFinished==='true'||Number(data.responseStatus)===429||/USED ALL AVAILABLE FREE/i.test(data.responseDetails||''))throw Error('Se alcanzó el límite de uso del traductor.');
    if(Number(data.responseStatus)!==200||!data.responseData?.translatedText)throw Error('El traductor devolvió una respuesta no válida.');
    output.push(translationDecode(data.responseData.translatedText));
   }catch(e){if(e.name==='AbortError')throw Error('El traductor agotó el tiempo de espera.');if(e instanceof SyntaxError)throw Error('La respuesta del traductor no se pudo leer.');if(e instanceof TypeError)throw Error('El navegador no pudo conectar con el traductor.');throw e}finally{clearTimeout(timer)}
  }
  let value=output.join(' ');const punctuation=text.match(/[.!?][”"’')\]]*$/)?.[0];if(punctuation&&!/[.!?][”"’')\]]*$/.test(value))value+=punctuation;
  BROWSER_TRANSLATIONS.set(text,{at:Date.now(),value});saveTranslations();return value;
 })();
 TRANSLATION_REQUESTS.set(text,pending);try{return await pending}finally{TRANSLATION_REQUESTS.delete(text)}
}
async function translateNewsInBrowser(news,fetcher=fetch){
 const output=[...news];let cursor=0;
 await Promise.all(Array.from({length:Math.min(2,news.length)},async()=>{
  while(cursor<news.length){const i=cursor++,n=news[i];
   if(n.translationStatus==='translated'||!(n.language==='pt'||n.originalLanguage==='pt'||n.sourceId==='inovahc'))continue;
   const result={...n,originalTitle:n.originalTitle||n.title,originalSummary:n.originalSummary||n.summary||'',originalLanguage:'pt'},errors=[];
   let done=0,total=result.originalSummary?2:1;
   for(const [field,original] of [['title',result.originalTitle],['summary',result.originalSummary]]){
    if(!original)continue;
    try{result[field]=await translateBrowserText(original,fetcher);done++}catch(e){result[field]=original;errors.push(e.message||'La traducción no se pudo completar.');}
   }
   result.translationStatus=done===total?'translated':done?'partial':'unavailable';result.language=done===total?'es':'pt';result.translationProvider='MyMemory';result.translationError=[...new Set(errors)].join(' ');output[i]=result;
  }
 }));return output;
}
