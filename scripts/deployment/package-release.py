#!/usr/bin/env python3
"""Package only verified dist files. No Git or network mutations."""
import argparse
import hashlib
import json
import re
import shutil
import subprocess
import tarfile
from pathlib import Path

def stream_digest(stream):
    digest=hashlib.sha256()
    for block in iter(lambda:stream.read(1024*1024),b''): digest.update(block)
    return digest.hexdigest()

ROOT=Path(__file__).resolve().parents[2]
parser=argparse.ArgumentParser()
parser.add_argument('--tag',required=True)
parser.add_argument('--allow-uncommitted',action='store_true',help='Local preview only; cannot be installed')
args=parser.parse_args()
if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._-]{0,63}',args.tag): raise SystemExit('Invalid release tag')
commit=subprocess.run(['git','rev-parse','--verify','HEAD'],cwd=ROOT,capture_output=True,text=True)
dirty=subprocess.check_output(['git','status','--porcelain'],cwd=ROOT,text=True).strip()
publishable=commit.returncode==0 and not dirty
if not publishable and not args.allow_uncommitted:
    raise SystemExit('Release requires a reviewed clean commit. Use --allow-uncommitted only for local preview.')
source=commit.stdout.strip() if commit.returncode==0 else None
lock=json.loads((ROOT/'frontend/public-assets.lock.json').read_text())
dist=ROOT/'frontend/dist'
files={}
for path in sorted(dist.rglob('*')):
    if path.is_symlink(): raise SystemExit('Refusing linked build output')
    if not path.is_file(): continue
    name=path.relative_to(dist).as_posix()
    public=lock.get('/'+name)
    allowed=public or name in ('robots.txt','sitemap.xml','index.html') or re.fullmatch(r'(?:[a-z0-9-]+/)+index\.html',name) or re.fullmatch(r'assets/[A-Za-z0-9_-]+\.(?:js|css)',name)
    if not allowed: raise SystemExit('Unexpected output file; review build boundary')
    with path.open('rb') as stream: digest=stream_digest(stream)
    meta={'bytes':path.stat().st_size,'sha256':digest}
    if public and meta != public: raise SystemExit('Build media differs from approved source')
    files[name]=meta
if not files or 'index.html' not in files: raise SystemExit('Missing build')
if not all(name.lstrip('/') in files for name in lock): raise SystemExit('Missing approved media')
if len([name for name in files if name.endswith('index.html')]) != 16: raise SystemExit('Expected 12 pages plus four aliases')
output=ROOT/'artifacts'/args.tag
output.mkdir(parents=True,exist_ok=False)
manifest={'schema':1,'tag':args.tag,'source_commit':source,'publishable':publishable,'total_bytes':sum(meta['bytes'] for meta in files.values()),'files':files}
(output/'release-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
archive=output/'rps-website.tar'
# Uncompressed: videos dominate; avoid wasting EC2 CPU on decompression.
with tarfile.open(archive,'w',format=tarfile.USTAR_FORMAT) as tar:
    for name,meta in files.items():
        info=tarfile.TarInfo(name);info.size=meta['bytes'];info.mode=0o644;info.mtime=0
        with (dist/name).open('rb') as stream: tar.addfile(info,stream)
shutil.copyfile(ROOT/'scripts/deployment/install-release.py',output/'install-release.py')
checksums=[]
for name in ('rps-website.tar','release-manifest.json','install-release.py'):
    with (output/name).open('rb') as stream: digest=stream_digest(stream)
    checksums.append(f'{digest}  {name}')
(output/'SHA256SUMS').write_text('\n'.join(checksums)+'\n')
print(f'Packaged {len(files)} files, {manifest["total_bytes"]/1024/1024:.1f} MiB; publishable={publishable}; output artifacts/{args.tag}')
