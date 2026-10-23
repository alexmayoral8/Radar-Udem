#!/usr/bin/env python3
"""Lee RSS público de Google Noticias en GitHub Actions y envía candidatos a D1.
No descarga artículos ni infiere declaraciones personales.
"""
import json
import os
import subprocess
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
# La lista de Google Noticias cambia entre solicitudes. Varias consultas complementarias
# mejoran cobertura sin atribuir automáticamente los resultados al directivo.
EXTRA_QUERIES={
    'udem': [
        '"Lilia García" "Universidad de Monterrey"',
        '"Lily García" UDEM',
        '"CHRISTUS MUGUERZA enseña a detectar un stroke a tiempo"',
    ],
    'tec': [
        '"Guillermo Torre-Amione" TecSalud',
        '"Guillermo Torre" "TecSalud"',
    ],
}

def clean_title(value):
    return value.casefold().rsplit(' - ',1)[0].strip()

def unrelated_for_udem(title):
    low=title.casefold()
    return ('morena' in low or 'elecciones de 2027' in low) and not ('udem' in low or 'universidad de monterrey' in low)



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
        if 'Lilia García' in query or 'Lily García' in query or 'lilia garcia' in query:
            if unrelated_for_udem(title):continue
        key=clean_title(title)
        if key in seen:continue
        seen.add(key)
        items.append({'title':title[:400], 'url':link, 'source':source[:150], 'publishedAt':date.isoformat()})
        if len(items)>=60:break
    return items,len(root.findall('.//item')),old


def ingest(leader, items):
    """Utiliza curl (mismo cliente que respondió HTTP 200 en el diagnóstico).

    Dividimos en lotes pequeños para reducir rechazos de seguridad o tamaño.
    Nunca imprimimos el token en los registros.
    """
    totals={'ok':True,'leader':leader,'received':0,'saved':0,'existing':0,'discarded':0}
    batches=[items[i:i+8] for i in range(0,len(items),8)] or [[]]
    for part_no, batch in enumerate(batches,1):
        data=json.dumps({'leaderId':leader,'items':batch},ensure_ascii=False)
        command=[
            'curl','--silent','--show-error','--max-time','45',
            '--request','POST',
            '--header','Authorization: Bearer '+TOKEN,
            '--header','Content-Type: application/json',
            '--header','Accept: application/json',
            '--data-binary','@-',
            '--write-out','\n__HTTP_STATUS__:%{http_code}',
            BASE+'/api/automation/run?leaderRssImport=1'
        ]
        process=subprocess.run(command,input=data,text=True,capture_output=True,timeout=50)
        output=process.stdout
        marker='\n__HTTP_STATUS__:'
        if marker not in output:
            raise RuntimeError(f'Lote {part_no}/{len(batches)}: curl no devolvió código HTTP; '+process.stderr[:180])
        body, status_text=output.rsplit(marker,1)
        try: status=int(status_text.strip())
        except ValueError: status=0
        if status!=200 or process.returncode!=0:
            # Solo muestra una muestra de la respuesta (no cabeceras ni token).
            raise RuntimeError(f'Lote {part_no}/{len(batches)}: HTTP {status}, curl={process.returncode}; respuesta: {body[:240]!r}; detalle: {process.stderr[:120]!r}')
        try: result=json.loads(body)
        except json.JSONDecodeError:
            raise RuntimeError(f'Lote {part_no}/{len(batches)}: respuesta JSON inválida: {body[:180]!r}')
        if result.get('ok') is not True:
            raise RuntimeError(f'Lote {part_no}/{len(batches)}: Worker rechazó: {str(result)[:200]}')
        for field in ('received','saved','existing','discarded'):
            totals[field]+=int(result.get(field,0))
        print(f'  Lote {part_no}/{len(batches)}: recibidas={result.get("received",0)}, guardadas={result.get("saved",0)}, existentes={result.get("existing",0)}',flush=True)
    return totals


def main():
    successes=0
    for i,(leader,query) in enumerate(SEARCHES):
        if i:time.sleep(3)
        print(f'\nLíder {leader}: buscando «{query}»',flush=True)
        try:
            combined=[]; urls=set(); titles=set(); feed_count=0; expired_total=0
            for j,search_query in enumerate([query]+EXTRA_QUERIES.get(leader,[])):
                if j:time.sleep(1.8)
                try:
                    batch,seen,expired=read_rss(search_query)
                except (urllib.error.HTTPError,urllib.error.URLError,ValueError,ET.ParseError) as suberror:
                    print(f'  Aviso consulta {j+1}: {type(suberror).__name__}: {str(suberror)[:90]}',flush=True)
                    continue
                feed_count+=seen;expired_total+=expired
                added=0
                for item in batch:
                    key=clean_title(item['title'])
                    if item['url'] in urls or key in titles:continue
                    if leader=='udem' and unrelated_for_udem(item['title']):continue
                    urls.add(item['url']);titles.add(key);combined.append(item);added+=1
                print(f'  Consulta {j+1}: RSS={seen}, nuevos candidatos únicos={added}',flush=True)
            print(f'  RSS: {feed_count} entradas entre consultas, {len(combined)} candidatas únicas en últimos 365 días, {expired_total} antiguas (puede haber repetidos entre búsquedas)',flush=True)
            result=ingest(leader,combined)
            print('  Importación D1: '+json.dumps(result,ensure_ascii=False),flush=True)
            if not result.get('ok'):raise RuntimeError('El Worker rechazó la importación')
            successes+=1
        except (urllib.error.HTTPError,urllib.error.URLError,ValueError,ET.ParseError,RuntimeError,subprocess.TimeoutExpired) as error:
            print(f'  AVISO: {type(error).__name__}: {str(error)[:180]}',flush=True)
    if not successes:
        raise SystemExit('No fue posible importar ninguna fuente RSS: verifica el despliegue del Worker y los secretos.')
    print(f'\nImportaciones completadas: {successes}/{len(SEARCHES)}',flush=True)

if __name__=='__main__':main()

