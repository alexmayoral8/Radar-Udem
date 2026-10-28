#!/usr/bin/env python3
"""Búsqueda RSS de menciones Tec desde GitHub Actions, entrega por curl a Worker."""
import json, os, subprocess, time, urllib.error, urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from urllib.parse import urlencode, urlparse

BASE=os.environ['RADAR_URL'].rstrip('/')
TOKEN=os.environ['AUTOMATION_TOKEN']
QUERIES=[
    '"Universidad Autónoma de Nuevo León"',
]
CUTOFF=datetime.now(timezone.utc)-timedelta(days=90)

def fetch_rss(query):
    url='https://news.google.com/rss/search?'+urlencode({'q':query,'hl':'es-419','gl':'MX','ceid':'MX:es-419'})
    request=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0','Accept':'application/rss+xml, application/xml'})
    with urllib.request.urlopen(request,timeout=25) as response:
        payload=response.read(2_000_001)
    if len(payload)>2_000_000:raise ValueError('RSS demasiado grande')
    rows=ET.fromstring(payload).findall('.//item')
    items=[]
    for row in rows:
        title=(row.findtext('title') or '').strip()
        link=(row.findtext('link') or '').strip()
        source=(row.findtext('source') or '').strip()
        try:
            date=parsedate_to_datetime(row.findtext('pubDate') or '')
            if date.tzinfo is None:date=date.replace(tzinfo=timezone.utc)
        except (ValueError,TypeError,IndexError):continue
        u=urlparse(link)
        if not title or len(title)<12 or date<CUTOFF or date>datetime.now(timezone.utc)+timedelta(days=1):continue
        if u.scheme!='https' or u.hostname!='news.google.com' or not u.path.startswith('/rss/articles/'):continue
        items.append({'title':title[:400],'url':link,'source':source[:150],'publishedAt':date.isoformat()})
    return len(rows),items

def upload(items):
    totals={'received':0,'saved':0,'existing':0,'discarded':0}
    chunks=[items[n:n+8] for n in range(0,len(items),8)]
    for i,batch in enumerate(chunks,1):
        cmd=['curl','--silent','--show-error','--max-time','45','--request','POST','--header','Authorization: Bearer '+TOKEN,'--header','Content-Type: application/json','--data-binary','@-','--write-out','\n__HTTP_STATUS__:%{http_code}',BASE+'/api/automation/run?competitorUanlRssImport=1']
        p=subprocess.run(cmd,input=json.dumps({'items':batch},ensure_ascii=False),text=True,capture_output=True,timeout=50)
        if '\n__HTTP_STATUS__:' not in p.stdout:raise RuntimeError('Sin HTTP: '+p.stderr[:180])
        body,code=p.stdout.rsplit('\n__HTTP_STATUS__:',1)
        if p.returncode or code.strip()!='200':raise RuntimeError(f'Lote {i}: HTTP {code.strip()} {body[:250]}')
        result=json.loads(body)
        if not result.get('ok'):raise RuntimeError(f'Lote {i}: {str(result)[:220]}')
        for field in totals:totals[field]+=int(result.get(field,0))
        print(f'  Lote {i}/{len(chunks)}: nuevas={result["saved"]}, existentes={result["existing"]}, descartadas={result["discarded"]}',flush=True)
    return totals

def main():
    seen=set();all_items=[];working=0
    for i,query in enumerate(QUERIES):
        if i:time.sleep(2)
        try:
            count,items=fetch_rss(query);working+=1;added=0
            for item in items:
                if item['url'] in seen:continue
                seen.add(item['url']);all_items.append(item);added+=1
            print(f'Búsqueda {i+1}: {query!r} | RSS={count}, candidatos nuevos={added}',flush=True)
        except (urllib.error.URLError,ET.ParseError,ValueError) as e:
            print(f'AVISO búsqueda {i+1}: {type(e).__name__}: {str(e)[:150]}',flush=True)
    if working==0:raise RuntimeError('Ninguna búsqueda RSS pudo completarse')
    print(f'Candidatos únicos encontrados: {len(all_items)}',flush=True)
    result=upload(all_items)
    print('Importación Competencia UANL:',json.dumps(result,ensure_ascii=False),flush=True)

if __name__=='__main__':main()
