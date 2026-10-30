from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse,unquote
import urllib.request,json
class Inspect(HTMLParser):
 def __init__(self):super().__init__();self.assets=[];self.headings=0;self.og=False
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='h1':self.headings+=1
  if tag in ['img','script','iframe'] and a.get('src','').startswith('/'):self.assets.append(a['src'])
  if tag=='link' and a.get('href','').startswith('/'):self.assets.append(a['href'])
  if tag=='meta' and a.get('property')=='og:title':self.og=True
root=Path('dist');errors=[];pages=list(root.rglob('index.html'))
for page in pages:
 p=Inspect();p.feed(page.read_text(encoding='utf-8'))
 if p.headings!=1:errors.append(f'{page}: h1={p.headings}')
 if not p.og:errors.append(f'{page}: no OG title')
 for asset in p.assets:
  target=root/unquote(urlparse(asset).path.lstrip('/'))
  if not target.exists():errors.append(f'{page}: missing {asset}')
prop=(root/'propuesta/bodas-colombia/index.html').read_text(encoding='utf-8')
assert 'og:title' in prop and 'Preguntas frecuentes' in prop and '130.500' in prop and 'noindex' in prop
for route in ['/','/propuesta/bodas-colombia','/propuesta/bodas-colombia/','/demo/jardin-botanico','/celebraciones/16-anos','/celebraciones/primera-comunion','/celebraciones/grado','/celebraciones/infantil','/celebraciones/baby-shower']:
 response=urllib.request.urlopen('http://127.0.0.1:4173'+route);content=response.read().decode();assert response.status==200 and '<h1' in content
 if route.startswith('/propuesta/'):assert 'og:title' in content and 'Preguntas frecuentes' in content
assert not errors, '\n'.join(errors)
print(json.dumps({'static_pages':len(pages),'missing_assets':len(errors),'initial_proposal_html':'verified','direct_routes':'verified','public_domain':'pending configuration'},indent=2))
