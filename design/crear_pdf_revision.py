from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/pdf'
OUT.mkdir(parents=True, exist_ok=True)
FILE = OUT / 'Invitaciones-de-boda-10-vistas-para-revision.pdf'
for name, file in [('Body', 'calibri.ttf'), ('Bold', 'calibrib.ttf'), ('Display', 'georgia.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(Path('C:/Windows/Fonts') / file)))

W, H = 900, 675
INK, GREEN, PAPER, MUTED = map(HexColor, ['#263B33', '#557363', '#F5F1E9', '#67736B'])
C = canvas.Canvas(str(FILE), pagesize=(W, H), pageCompression=1)
C.setTitle('Invitaciones de boda | 5 conceptos, 10 vistas')
C.setAuthor('Proyecto de invitaciones de boda')
C.setSubject('Dossier visual para revisión: cinco conceptos con portada y sección interior')
style = ParagraphStyle('body', fontName='Body', fontSize=12, leading=17, textColor=INK)

def text(x, y, value, font='Body', size=12, color=INK):
    C.setFillColor(color); C.setFont(font, size); C.drawString(x, y, value)

def paragraph(x, top, width, value, size=12, color=INK):
    s = ParagraphStyle('local', parent=style, fontSize=size, leading=size*1.45, textColor=color)
    p = Paragraph(value, s); _, h = p.wrap(width, 500); p.drawOn(C, x, top-h)
    return top-h

def base(page, label='EXPLORACIÓN VISUAL / BODAS'):
    C.setFillColor(PAPER); C.rect(0,0,W,H,fill=1,stroke=0)
    text(40,H-28,label,'Bold',9,MUTED)
    C.setFillColor(MUTED); C.setFont('Body',9); C.drawRightString(W-40,H-28,'26 OCTUBRE 2026')
    C.setStrokeColor(HexColor('#D6DBD2')); C.setLineWidth(.5); C.line(40,43,W-40,43)
    text(40,25,'CONCEPTOS PARA REVISIÓN · DISEÑOS Y DATOS ILUSTRATIVOS','Body',8,MUTED)
    C.drawRightString(W-40,25,f'{page:02d} / 07')

items = [
    ('01-magnolia-editorial.png','Magnolia editorial','Elegancia floral','Marfil, magnolia protagonista y composición editorial.', '#A58B57'),
    ('02-memorias-de-pelicula.png','Memorias de película','Historia de la pareja','Fotografía cálida y recuerdos con estética de película.', '#754A34'),
    ('03-jardin-botanico.png','Jardín botánico','Naturaleza y lugar','Verde profundo, ilustración botánica y mapa del evento.', '#173F35'),
    ('04-rosa-contemporanea.png','Rosa contemporánea','Romanticismo expresivo','Flor de gran escala, tonos rosa y cereza, tipografía protagonista.', '#7E243B'),
    ('05-vino-de-gala.png','Vino de gala','Celebración nocturna','Tonos vino y champán, geometría y atmósfera de gala.', '#481D2C'),
]

base(1)
C.bookmarkPage('inicio'); C.addOutlineEntry('Presentación', 'inicio', level=0)
text(46,571,'Una nueva forma', 'Display', 43)
text(46,516,'de anunciar el amor.', 'Display', 43)
text(48,469,'5 CONCEPTOS  /  10 VISTAS MÓVILES', 'Bold', 12, GREEN)
paragraph(48,438,645,'Propuestas visuales para elegir la dirección de una colección de invitaciones digitales de boda. Cada concepto incluye una portada y una sección interior.',15)

for i,(filename,title,kind,desc,color) in enumerate(items):
    x=48+i*163
    C.setFillColor(HexColor(color)); C.circle(x+7,332,6,fill=1,stroke=0)
    text(x+22,328,f'0{i+1}', 'Bold',11)
    C.drawImage(ImageReader(str(ROOT/'design/mockups'/filename)),x,209,width=151,height=101,mask='auto')
    paragraph(x,192,151,title,12)
    paragraph(x,151,151,kind,10,MUTED)

paragraph(48,105,798,'Para revisar: estilo favorito, elementos que conservarías y cambios que propondrías. Las imágenes son mockups estáticos generados con IA; fotografías, nombres y datos son ficticios.',10,MUTED)
C.showPage()

for i,(filename,title,kind,desc,color) in enumerate(items,2):
    base(i, f'CONCEPTO {i-1:02d} / {kind.upper()}')
    key=f'concepto-{i-1}'; C.bookmarkPage(key); C.addOutlineEntry(title,key,level=0)
    C.drawImage(ImageReader(str(ROOT/'design/mockups'/filename)),27,75,width=846,height=564,mask='auto')
    text(42,56,desc,'Body',10,MUTED)
    C.showPage()

base(7,'REVISIÓN / DECISIÓN CREATIVA')
C.bookmarkPage('revision'); C.addOutlineEntry('Hoja de revisión','revision',level=0)
text(45,579,'¿Qué dirección elegimos?', 'Display', 32)
paragraph(46,547,780,'Marquen sus favoritas y anoten qué conservar o ajustar. Pueden combinar elementos de diferentes conceptos.',13)

C.setFillColor(INK); C.roundRect(45,454,810,39,5,fill=1,stroke=0)
text(60,468,'CONCEPTO','Bold',10,HexColor('#FFFFFF'))
text(286,468,'VALORACIÓN','Bold',10,HexColor('#FFFFFF'))
text(539,468,'CONSERVAR / CAMBIAR','Bold',10,HexColor('#FFFFFF'))

for idx,(_,title,kind,desc,color) in enumerate(items):
    y=454-idx*64
    C.setStrokeColor(HexColor('#D6DBD2')); C.line(45,y-64,855,y-64)
    text(60,y-26,f'{idx+1:02d}  {title}','Bold',12)
    text(82,y-44,kind,'Body',10,MUTED)
    for j,label in enumerate(['Favorita','Ajustar','Descartar']):
        x=286+j*80
        C.setStrokeColor(MUTED); C.rect(x,y-31,8,8,fill=0,stroke=1)
        text(x+12,y-30,label,'Body',9,MUTED)
    C.setStrokeColor(HexColor('#CCD2C7')); C.line(539,y-28,837,y-28); C.line(539,y-47,837,y-47)

text(46,105,'Mis dos favoritas:', 'Bold',12)
C.setStrokeColor(MUTED); C.line(144,102,370,102)
text(420,105,'El cambio más importante:', 'Bold',12)
C.line(560,102,850,102)
text(46,65,'Esta revisión orientará la siguiente etapa de diseño antes de programar las invitaciones.','Body',10,MUTED)
C.showPage(); C.save()

r=PdfReader(FILE)
assert len(r.pages)==7
assert len(r.outline)==7
assert all(page.extract_text().strip() for page in r.pages)
print(FILE)
print(f'Verificado: {len(r.pages)} páginas, {FILE.stat().st_size/1024/1024:.1f} MB, 5 láminas originales con 10 vistas.')
