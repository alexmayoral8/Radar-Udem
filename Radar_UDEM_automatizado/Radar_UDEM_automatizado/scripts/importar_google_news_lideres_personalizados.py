#!/usr/bin/env python3
"""Lee líderes activos de Cloudflare y busca sus noticias en Google News RSS.
Requiere RADAR_URL y AUTOMATION_TOKEN. No usa Gemini ni claves de pago.
"""
import json
import os
import time
import urllib.parse
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime

BASE=os.environ['RADAR_URL'].rstrip('/')
TOKEN=os.environ['AUTOMATION_TOKEN']
HEADERS={'Authorization':'Bearer '+TOKEN,'User-Agent':'RadarUdem/1.0','Accept':'application/json'}

def request_json(url,method='GET',payload=None):
    content=json.dumps(payload,ensure_ascii=False).encode('utf-8') if payload is not None else None
    headers={**HEADERS,**({'Content-Type':'application/json'} if content else {})}
    req=urllib.request.Request(url,headers=headers,data=content,method=method)
    with urllib.request.urlopen(req,timeout=45) as res:
        return json.loads(res.read().decode('utf-8'))

def rss_for(query):
    endpoint='https://news.google.com/rss/search?'+urllib.parse.urlencode({'q':query+' when:365d','hl':'es-419','gl':'MX','ceid':'MX:es-419'})
    req=urllib.request.Request(endpoint,headers={'User-Agent':'Mozilla/5.0 (compatible; RadarUDEM/1.0)','Accept':'application/rss+xml,application/xml,text/xml'})
    with urllib.request.urlopen(req,timeout=35) as res: xml=res.read()
    root=ET.fromstring(xml)
    items=[];seen=set();cutoff=datetime.now(timezone.utc)-timedelta(days=365)
    for item in root.findall('./channel/item'):
        title=(item.findtext('title') or '').strip()
        url=(item.findtext('link') or '').strip()
        source=(item.findtext('source') or '').strip()
        stamp=item.findtext('pubDate') or ''
        try: dt=parsedate_to_datetime(stamp).astimezone(timezone.utc)
        except (ValueError,TypeError): continue
        if dt<cutoff or dt>datetime.now(timezone.utc)+timedelta(days=1): continue
        if not url.startswith('https://news.google.com/rss/articles/') or len(title)<12 or url in seen: continue
        seen.add(url)
        items.append({'title':title[:400],'url':url,'source':source[:150],'publishedAt':dt.isoformat()})
        if len(items)>=60: break
    return items

def main():
    leaders=request_json(BASE+'/api/automation/run?leaderCustomList=1','POST',{})['leaders']
    print('Perfiles personalizados activos:',len(leaders))
    for leader in leaders:
        lid=leader['id']
        print('Líder:',leader['name'],'|',leader['institution'])
        try:
            items=rss_for(leader['search_query'])
            print('  Candidatos RSS:',len(items))
            for offset in range(0,len(items),8):
                payload={'leaderId':lid,'items':items[offset:offset+8]}
                outcome=request_json(BASE+'/api/automation/run?leaderRssImport=1','POST',payload)
                print('  Lote:',offset//8+1,'guardadas=',outcome.get('saved'),'existentes=',outcome.get('existing'),'descartadas=',outcome.get('discarded'))
                time.sleep(0.35)
        except Exception as error:
            print('  ERROR:',type(error).__name__,str(error)[:220])
        time.sleep(1.5)

if __name__=='__main__':main()

