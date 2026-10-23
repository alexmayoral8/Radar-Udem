#!/usr/bin/env python3
"""Lee RSS público de Google Noticias en GitHub Actions y envía candidatos a D1.
No descarga artículos ni infiere declaraciones personales.
"""
import json
import os
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime
from urllib.parse import urlencode, urlparse

SEARCHES = [
    ('tec', 'guillermo torre amione tecsalud'),
    ('udem', 'lilia garcia universidad de monterrey'),
    ('who', 'Tedros Adhanom Ghebreyesus WHO'),
    ('paho', 'Jarbas Barbosa OPS'),
    ('mayo', 'Gianrico Farrugia Mayo Clinic'),
    ('uanl', 'Oscar Vidal Gutierrez UANL medicina'),
    ('up_medicine', 'Lourdes Gonzalez del Rincon Universidad Panamericana medicina'),
    ('up', 'Gregorio Obrador Vera Universidad Panamericana'),
]
BASE=os.environ['RADAR_URL'].rstrip('/')
TOKEN=os.environ['AUTOMATION_TOKEN']
CUTOFF=datetime.now(timezone.utc)-timedelta(days=365)


def read_rss(query):
    url='https://news.google.com/rss/search?'+urlencode({
        'q':query, 'hl':'es-419', 'gl':'MX', 'ceid':'MX:es-419'})
    req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0','Accept':'application/rss+xml, application/xml'})
    with urllib.request.urlopen(req,timeout=25) as response:
        payload=response.read(2_000_001)
        if len(payload)>2_000_000:
            raise ValueError('RSS demasiado grande')
    root=ET.fromstring(payload)
    seen=set();items=[];old=0
    for e in root.findall('.//item'):
        title=(e.findtext('title') or '').strip()
        link=(e.findtext('link') or '').strip()
        source=(e.findtext('source') or '').strip()
        try:
            date=parsedate_to_datetime(e.findtext('pubDate') or '')
            date=date if date.tzinfo else date.replace(tzinfo=timezone.utc)
        except (TypeError, ValueError, IndexError):
            continue
        if date<CUTOFF or date>datetime.now(timezone.utc)+timedelta(days=1):
            old+=1;continue
        parsed=urlparse(link)
        if not title or parsed.scheme!='https' or parsed.hostname!='news.google.com' or not parsed.path.startswith('/rss/articles/'):
            continue
        key=title.casefold().split(' - ')[0].strip()
        if key in seen:continue
        seen.add(key)
        items.append({'title':title[:400], 'url':link, 'source':source[:150], 'publishedAt':date.isoformat()})
        if len(items)>=60:break
    return items,len(root.findall('.//item')),old


def ingest(leader, items):
    data=json.dumps({'leaderId':leader,'items':items},ensure_ascii=False).encode('utf-8')
    req=urllib.request.Request(BASE+'/api/automation/run?leaderRssImport=1',data=data,method='POST',headers={
        'Authorization':'Bearer '+TOKEN, 'Content-Type':'application/json',
        'Accept':'application/json'})
    with urllib.request.urlopen(req,timeout=35) as res:
        response=json.loads(res.read(20000))
    return response


def main():
    successes=0
    for i,(leader,query) in enumerate(SEARCHES):
        if i:time.sleep(3)
        print(f'\nLíder {leader}: buscando «{query}»',flush=True)
        try:
            items,seen,expired=read_rss(query)
            print(f'  RSS: {seen} entradas, {len(items)} candidatas en últimos 365 días, {expired} antiguas',flush=True)
            result=ingest(leader,items)
            print('  Importación D1: '+json.dumps(result,ensure_ascii=False),flush=True)
            if not result.get('ok'):raise RuntimeError('El Worker rechazó la importación')
            successes+=1
        except (urllib.error.HTTPError,urllib.error.URLError,ValueError,ET.ParseError,RuntimeError) as error:
            print(f'  AVISO: {type(error).__name__}: {str(error)[:180]}',flush=True)
    if not successes:
        raise SystemExit('No fue posible importar ninguna fuente RSS: verifica el despliegue del Worker y los secretos.')
    print(f'\nImportaciones completadas: {successes}/{len(SEARCHES)}',flush=True)

if __name__=='__main__':main()
