#!/usr/bin/env python3
"""Recover the two approved videos via authenticated GitHub CLI, checking pinned hashes."""
import argparse
import hashlib
import json
import shutil
import subprocess
import tempfile
from pathlib import Path

def stream_digest(stream):
    digest=hashlib.sha256()
    for block in iter(lambda:stream.read(1024*1024),b''): digest.update(block)
    return digest.hexdigest()

root=Path(__file__).resolve().parents[2]
parser=argparse.ArgumentParser()
parser.add_argument('--repo',required=True,help='Approved OWNER/REPO (no credentials)')
parser.add_argument('--tag',required=True,help='Reviewed immutable media release tag')
args=parser.parse_args()
lock=json.loads((root/'frontend/public-assets.lock.json').read_text())
with tempfile.TemporaryDirectory(prefix='rps-media-') as temporary:
    for name, meta in lock.items():
        if not name.endswith('.mp4'): continue
        target=root/'frontend/public'/name.lstrip('/')
        if target.exists():
            with target.open('rb') as stream: digest=stream_digest(stream)
            if digest != meta['sha256']: raise SystemExit('Existing media differs; refusing overwrite')
            continue
        subprocess.run(['gh','release','download',args.tag,'--repo',args.repo,'--pattern',Path(name).name,'--dir',temporary],check=True)
        source=Path(temporary)/Path(name).name
        with source.open('rb') as stream: digest=stream_digest(stream)
        if source.stat().st_size != meta['bytes'] or digest != meta['sha256']: raise SystemExit('Downloaded media hash mismatch')
        target.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(source,target)
print('Approved media available; paths and bytes preserved.')
