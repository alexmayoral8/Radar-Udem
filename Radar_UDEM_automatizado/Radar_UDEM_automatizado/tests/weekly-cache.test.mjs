import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync,mkdtempSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { CATEGORIES } from '../news-engine.mjs';
globalThis.CATEGORIES=CATEGORIES;
const {weeklyGroups,weeklySaveSnapshot,weeklySummaryResponse}=await import('../weekly-engine.mjs');
const schema=readFileSync(new URL('../drizzle/0000_weekly_summaries.sql',import.meta.url),'utf8');
function d1(filename=':memory:'){
 const sqlite=new DatabaseSync(filename);
 const db={sqlite,prepare(sql){let values=[];return {bind(...v){values=v;return this},async first(){return sqlite.prepare(sql).get(...values)||null},async run(){return {meta:{changes:sqlite.prepare(sql).run(...values).changes}}}}},async batch(statements){return Promise.all(statements.map(s=>s.run()))}};
 return db;
}
const date=new Date().toISOString().slice(0,10);
const news=[{url:'https://example.org/a',title:'Training in rural clinics',summary:'The study examined training in rural clinics.',source:'Example',publishedAt:date,categories:[CATEGORIES[0],CATEGORIES[4]]},{url:'https://example.org/b',title:'New simulation course',summary:'The school introduced a clinical simulation course.',source:'Another',publishedAt:date,categories:[CATEGORIES[2]]}];
function setup(filename){const DB=d1(filename);DB.sqlite.exec(schema);return {DB,GEMINI_API_KEY:'unit-test-placeholder',GEMINI_MODEL:'test-model'}}
const fakeFetch=async(_url,options)=>{
 const groups=JSON.parse(JSON.parse(options.body).contents[0].parts[0].text);
 const text=JSON.stringify({summaries:groups.map(g=>({category:g.category,paragraphs:[{text:'Las publicaciones describen actividades de formación y sus contextos específicos.',articleIds:[1]}]}))});
 return Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text}]}}]});
};
test('fingerprints ignore order, capture time, stale and browser translations; detect actual content and membership',async()=>{
 const a=await weeklyGroups(news,'test-model');
 const translated=[...news].reverse().map(n=>({...n,originalTitle:n.title,originalSummary:n.summary,title:'Traducción',summary:'Texto traducido.',stale:true,capturedAt:'changed'}));
 assert.deepEqual(await weeklyGroups(translated,'test-model'),a);
 const changed=await weeklyGroups(news.map((n,i)=>i?{...n,summary:'The course now includes a new assessment.'}:n),'test-model');
 assert.deepEqual(changed.filter((g,i)=>g.fingerprint!==a[i].fingerprint).map(g=>g.category),[CATEGORIES[2]]);
 const expired=await weeklyGroups(news,'test-model',Date.now()+8*86400000);assert.ok(expired.every(g=>!g.articles.length));
});
test('one call batches missing themes, then persistent cache survives new database connection and changes only affected theme',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'radar-cache-')),path=join(dir,'cache.sqlite');
 let env=setup(path),calls=0,requested=[];const original=globalThis.fetch;
 globalThis.fetch=async(url,options)=>{calls++;requested.push(JSON.parse(JSON.parse(options.body).contents[0].parts[0].text).map(g=>g.category));return fakeFetch(url,options)};
 try{
  await weeklySaveSnapshot(env.DB,{news});
  const first=await (await weeklySummaryResponse(env,{news:[]})).json();assert.equal(first.generatedCount,3);assert.equal(calls,1);
  const dates=first.summaries.map(s=>s.generatedAt);
  env.DB.sqlite.close();env={...env,DB:d1(path)};
  const second=await (await weeklySummaryResponse(env,{news:[]})).json();assert.equal(second.generatedCount,0);assert.equal(calls,1);assert.deepEqual(second.summaries.map(s=>s.generatedAt),dates);assert.ok(second.summaries.every(s=>s.cached));
  await weeklySaveSnapshot(env.DB,{news:news.map((n,i)=>i?{...n,summary:'The course now includes a new assessment.'}:n)});
  const third=await (await weeklySummaryResponse(env,{news:[]})).json();assert.equal(third.generatedCount,1);assert.equal(calls,2);assert.deepEqual(requested[1],[CATEGORIES[2]]);
 }finally{globalThis.fetch=original;env.DB.sqlite.close();rmSync(dir,{recursive:true,force:true})}
});
test('concurrent requests share a durable lease; quota failure pauses further model calls',async()=>{
 const env=setup();await weeklySaveSnapshot(env.DB,{news});let calls=0;const original=globalThis.fetch;
 globalThis.fetch=async(...args)=>{calls++;await new Promise(resolve=>setTimeout(resolve,20));return fakeFetch(...args)};
 try{
  const results=await Promise.all([weeklySummaryResponse(env,{news}),weeklySummaryResponse(env,{news})]);
  const data=await Promise.all(results.map(r=>r.json()));assert.equal(calls,1);assert.ok(data.some(r=>r.status==='generating'));assert.ok(data.some(r=>r.status==='ready'));
  await weeklySaveSnapshot(env.DB,{news:news.map(n=>({...n,title:n.title+' updated'}))});
  globalThis.fetch=async()=>{calls++;return new Response('',{status:429})};
  const failed=await (await weeklySummaryResponse(env,{news})).json();assert.equal(failed.status,'cooldown');assert.equal(calls,2);
  await weeklySummaryResponse(env,{news});assert.equal(calls,2);assert.match(failed.message,/límite/);
 }finally{globalThis.fetch=original;env.DB.sqlite.close()}
});
test('incomplete generation is never saved as a summary; empty week and absent DB never call Gemini',async()=>{
 const original=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;return Response.json({candidates:[{finishReason:'MAX_TOKENS',content:{parts:[{text:'cut off'}]}}]})};
 const env=setup();
 try{
  const empty=await (await weeklySummaryResponse(env,{news:[]})).json();assert.equal(empty.generatedCount,0);assert.equal(calls,0);
  await weeklySummaryResponse({...env,DB:null},{news});assert.equal(calls,0);
  await weeklySaveSnapshot(env.DB,{news});const failed=await (await weeklySummaryResponse(env,{news})).json();assert.equal(failed.status,'cooldown');assert.equal(calls,1);assert.equal(env.DB.sqlite.prepare('SELECT count(*) AS n FROM weekly_summaries').get().n,0);
 }finally{globalThis.fetch=original;env.DB.sqlite.close()}
});
