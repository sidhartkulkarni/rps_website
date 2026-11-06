"""Collect explicit public media references; exclude all legacy code/private directories."""
from pathlib import Path
from collections import Counter
import re,json
root=Path(__file__).resolve().parents[1]
refs=set()
for p in list((root/'src').rglob('*.tsx'))+list((root/'src').rglob('*.ts'))+list((root/'src').glob('*.css'))+[root/'index.html']:
 refs.update(re.findall(r'/(?:uploads|front_assets)/[^\s\x27\x22)<>`]+',p.read_text()))
refs={r for r in refs if '${' not in r}
allowed={'.png','.jpg','.jpeg','.webp','.mp4'}
for ref in refs:
 p=root/'public'/ref[1:]
 assert p.is_file() and not p.is_symlink(),ref
 assert p.suffix.lower() in allowed,ref
 assert not any(x in p.parts for x in ['user','signup','product']),ref
(root/'public-assets.json').write_text(json.dumps(sorted(refs),indent=2)+'\n')
files=[p for p in (root/'public').rglob('*') if p.is_file()]
print('Retained originals:',len(files),'Approved media:',len(refs),'Excluded from serving/build:',len(files)-len(refs))
print('Legacy code/archive counts:',dict(Counter(p.suffix for p in files if p.suffix.lower() in ['.php','.js','.zip','.sql','.pem','.crt','.exe','.dll'])))
print('Potential private upload directory names:',[p.name for p in (root/'public/uploads').iterdir() if p.is_dir() and p.name in ['user','signup','product','invoice','quotes','customer']])
