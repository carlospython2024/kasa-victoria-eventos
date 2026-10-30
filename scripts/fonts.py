import urllib.request,re,pathlib,hashlib
p=pathlib.Path('public/assets/fonts');p.mkdir(parents=True,exist_ok=True)
url='https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap'
req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
css=urllib.request.urlopen(req).read().decode()
for src in set(re.findall(r'url\((https://[^)]+)\)',css)):
 name=hashlib.sha256(src.encode()).hexdigest()[:12]+'.'+src.split('.')[-1]
 (p/name).write_bytes(urllib.request.urlopen(src).read())
 css=css.replace(src,'/assets/fonts/'+name)
pathlib.Path('src/fonts.css').write_text(css,encoding='utf-8')
from PIL import Image
for f in ['magnolia','rose','botanical']:
 im=Image.open('public/assets/'+f+'.png');print(f,im.mode,im.getextrema()[-1] if im.mode=='RGBA' else 'no alpha')
print('Fonts saved locally')
