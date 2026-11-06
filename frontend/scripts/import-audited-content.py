"""Import only the public Markdown audit; never read SQL or private source files."""
from pathlib import Path
from html.parser import HTMLParser
import re, html, json
root=Path(__file__).resolve().parents[1]
audit=root.parent/'docs/legacy-audit'
page=(audit/'PAGE_CONTENT_MAPPING.md').read_text()
records=(audit/'SERVICES_AND_TESTIMONIALS.md').read_text()

def fields(text):
 return {m[1]:m[2].strip() for m in re.finditer(r'\*\*([\w]+)\*\*(?::)?\s*(.*?)(?=\n\*\*|\n### |\n## |\Z)',text,re.S)}
def decoded(text):
 for _ in range(3):text=html.unescape(text)
 return text.replace('\\|','|')
class Blocks(HTMLParser):
 def __init__(self):super().__init__();self.out=[];self.buf='';self.tag='p';self.skip=0
 def flush(self):
  t=re.sub(r'\s+',' ',self.buf).strip();self.buf=''
  if t:self.out.append({'kind':'item' if self.tag=='li' else 'paragraph','text':t})
 def handle_starttag(self,tag,attrs):
  if tag in ('script','style'):self.skip+=1
  if tag in ('p','li','h1','h2','h3','h4','h5','h6','br'):
   self.flush();self.tag=tag
 def handle_endtag(self,tag):
  if tag in ('script','style'):self.skip=max(0,self.skip-1)
  if tag in ('p','li','h1','h2','h3','h4','h5','h6'):self.flush()
 def handle_data(self,data):
  if not self.skip:self.buf+=data

def blocks(text):
 text=decoded(text)
 if re.search(r'<\w+',text):
  p=Blocks();p.feed(text);p.flush();return p.out
 return [{'kind':'paragraph','text':re.sub(r'\s+',' ',p).strip()} for p in text.split('\n\n') if p.strip()]
def plain(text):return ' '.join(b['text'] for b in blocks(text))
media={}
for line in page.splitlines():
 if line.startswith('| rp_'):
  cells=[c.strip() for c in line.strip('|').split('|')]
  if len(cells)==6 and cells[3].startswith('assets/'):media[(cells[0],int(cells[1]),cells[2])]= '/'+cells[3].removeprefix('assets/')
cms={}
for m in re.finditer(r'### CMS (\d+): (.*?) \((.*?)\)\n(.*?)(?=\n### CMS|\n## Public banner|\Z)',page,re.S):
 i=int(m[1]);f=fields(m[4]);cms[i]={'id':i,'name':m[2],'title':plain(f.get('cms_page_title_2','')),'body':blocks(f.get('cms_page_content','')),'extra':blocks(f.get('cms_page_other_content','')),'image':media.get(('rp_cms_page',i,'cms_page_image'),'')}
# Never ship editorial instructions, unrelated locations, or fake legal text.
for i in [6,14,20,21]:
 cms[i]['body']=[]
 cms[i]['image']=''
# Restore list semantics from the audit's plain-text transcription.
for i in [8,11,12]:
 f=fields(re.search(r'### CMS '+str(i)+r': .*?\n(.*?)(?=\n### CMS)',page,re.S)[1]);raw=decoded(f.get('cms_page_content',''))
 if i==8:
  cms[i]['body']=[]
  for part in raw.split('\n\n'):
   lines=[x.strip() for x in part.splitlines() if x.strip()]
   for line in lines:cms[i]['body'].append({'kind':'item' if line.startswith(('Late fees','Items arriving','Inflated shipping','Weeks of waiting','Little or no')) else 'paragraph','text':line})
 else:cms[i]['body']=[{'kind':'item','text':x.strip()} for x in raw.splitlines() if x.strip()]
# Headings duplicated inside original CMS bodies are promoted by page components.
for i in [8,10]:
 if cms[i]['body']:cms[i]['title']=cms[i]['body'].pop(0)['text']
services=[];packages=[];reviews=[]
for tab,out in [('rp_services',services),('rp_shipping_packaging',packages),('rp_testimonial',reviews)]:
 section=records.split('## '+tab+'\n',1)[1].split('\n## ',1)[0]
 for m in re.finditer(r'### Record (\d+)\n(.*?)(?=\n### Record|\Z)',section,re.S):
  i=int(m[1]);f=fields(m[2])
  if tab=='rp_services':out.append({'id':i,'slug':f['services_slug'],'name':f['services_name'],'summary':plain(f['services_detail']),'description':blocks(f['services_field_1']),'image':media[(tab,i,'services_image')],'imageAlt':['A parcel being labeled for shipping','Freight being prepared beside a delivery truck','Palletized freight being loaded into a truck','International freight shipping'][i-1]})
  elif tab=='rp_shipping_packaging':
   body=blocks(f['shipping_packaging_short_detail']);body=[b for b in body if not any(x in b['text'] for x in ['Change all of this','Guaranteed delivery windows'])]
   if i==1:
    for b in body:b['text']=b['text'].replace(' Examples include:','')
   out.append({'id':i,'title':f['shipping_packaging_title'],'body':body,'extra':blocks(f.get('shipping_packaging_extra',''))})
  else:out.append({'id':i,'name':f['testimonial_name'],'rating':int(f['testimonial_rating']),'body':blocks(f['testimonial_detail'])})
benefits=[]
for m in re.finditer(r'### rp_what_new #(\d+)\n(.*?)(?=\n### |\n## |\Z)',page,re.S):
 i=int(m[1]);f=fields(m[2]);benefits.append({'id':i,'title':f['what_new_title'],'body':blocks(f['what_new_detail']),'image':media[('rp_what_new',i,'what_new_image')]})
banner=fields(re.search(r'### rp_banner #1\n(.*?)(?=\n### )',page,re.S)[1])
header='''// Public content transcribed from docs/legacy-audit, status=1 only.
// Editorial instructions, placeholder legal bodies and unrelated locations excluded.
export interface ContentBlock { kind: 'paragraph' | 'item'; text: string }
export interface CmsSection { id: number; name: string; title: string; body: ContentBlock[]; extra: ContentBlock[]; image: string }
export interface PackagingCategory { id: number; title: string; body: ContentBlock[]; extra: ContentBlock[] }
export interface Testimonial { id: number; name: string; rating: number; body: ContentBlock[] }
export interface Benefit { id: number; title: string; body: ContentBlock[]; image: string }
'''
data=header
for name,typ,value in [('cms','Record<number, CmsSection>',cms),('packaging','PackagingCategory[]',packages),('testimonials','Testimonial[]',list(reversed(reviews))),('benefits','Benefit[]',benefits),('banner','{title: string; eyebrow: string; description: string}',{'title':banner['banner_title'],'eyebrow':banner['banner_field_1'],'description':plain(banner['banner_detail'])}),('innerBanners','Record<string, string>',{key:media[('rp_inner_banner',i,'inner_banner_other_image')] for key,i in [('About Us',1),('Services',2),('Service Detail',2),('Reviews',3),('How It Works',4),('Contact Us',5),('Terms of Use',7),('Privacy Policy',8)]})]:
 data+=f'\nexport const {name}: {typ} = '+json.dumps(value,ensure_ascii=False,indent=2)+'\n'
(root/'src/data/content.ts').write_text(data)
(root/'src/data/services.ts').write_text("import type { ContentBlock } from './content.ts'\nexport interface Service { id: number; slug: string; name: string; image: string; imageAlt: string; summary: string; description: ContentBlock[] }\nexport const services: Service[] = "+json.dumps(services,ensure_ascii=False,indent=2)+'\n')
print('Imported public content:',len(cms),'CMS,',len(services),'services,',len(packages),'packaging,',len(reviews),'testimonials')
