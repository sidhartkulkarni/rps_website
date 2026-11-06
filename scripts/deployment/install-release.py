#!/usr/bin/env python3
"""Verify before extraction; stage only. Never alters Nginx, services or current symlink."""
import argparse
import hashlib
import json
import re
import shutil
import tarfile
from pathlib import Path, PurePosixPath


def validate(archive, manifest):
    if manifest.get('schema') != 1 or not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._-]{0,63}',manifest.get('tag','')):
        raise ValueError('Invalid manifest')
    files=manifest['files']
    if len(files)>2000 or 'index.html' not in files: raise ValueError('Invalid file list')
    allowed=re.compile(r'(?:index\.html|404\.html|robots\.txt|sitemap\.xml|(?:[a-z0-9-]+/)+index\.html|assets/[A-Za-z0-9_-]+\.(?:js|css)|(?:uploads|front_assets)/[A-Za-z0-9_./-]+\.(?:png|jpg|jpeg|webp|mp4))')
    for name,meta in files.items():
        if not isinstance(name,str) or not allowed.fullmatch(name) or '..' in PurePosixPath(name).parts or name.startswith('/'):
            raise ValueError('Unsafe file path')
        if not isinstance(meta.get('bytes'),int) or not 0<=meta['bytes']<=1024**3 or not re.fullmatch(r'[a-f0-9]{64}',meta.get('sha256','')):
            raise ValueError('Invalid file metadata')
    if sum(meta['bytes'] for meta in files.values()) != manifest['total_bytes'] or manifest['total_bytes']>2*1024**3:
        raise ValueError('Invalid payload size')
    seen=set()
    with tarfile.open(archive,'r:') as tar:
        for member in tar:
            if not member.isfile() or member.name not in files or member.name in seen:
                raise ValueError('Unexpected, duplicate, or non-regular archive entry')
            seen.add(member.name)
            if member.size != files[member.name]['bytes']: raise ValueError('Size mismatch')
            digest=hashlib.sha256()
            with tar.extractfile(member) as stream:
                for block in iter(lambda:stream.read(1024*1024),b''): digest.update(block)
            if digest.hexdigest()!=files[member.name]['sha256']: raise ValueError('Hash mismatch')
    if seen!=set(files): raise ValueError('Missing archive files')


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--archive',type=Path,required=True)
    parser.add_argument('--manifest',type=Path,required=True)
    parser.add_argument('--root',type=Path,default=Path('/var/www/rps-website'))
    parser.add_argument('--check-only',action='store_true')
    args=parser.parse_args()
    manifest=json.loads(args.manifest.read_text())
    validate(args.archive,manifest)
    if args.check_only:
        print('PASS: archive paths, types, sizes, completeness and SHA-256 verified; no installation performed.')
        return
    if not manifest.get('publishable') or not re.fullmatch(r'[a-f0-9]{40,64}',manifest.get('source_commit') or ''):
        raise ValueError('Preview/uncommitted artifacts cannot be installed')
    root=args.root.absolute()
    # A dedicated empty root or this release layout only; never adopt an Admin directory.
    if any(p.is_symlink() for p in [root,*root.parents]): raise ValueError('Linked installation root refused')
    if not root.is_dir(): raise ValueError('Operator must provision a dedicated website root first')
    if any(p.name not in ('releases','current') for p in root.iterdir()): raise ValueError('Unexpected files in target; manual review required')
    releases=root/'releases'
    if releases.is_symlink(): raise ValueError('Linked release directory refused')
    releases.mkdir(exist_ok=True)
    target=releases/manifest['tag']
    if target.exists(): raise ValueError('Release already exists; refusing overwrite')
    if shutil.disk_usage(root).free < manifest['total_bytes']+256*1024*1024:
        raise ValueError('Insufficient free disk for extraction plus 256 MiB reserve')
    # extractall intentionally avoided. Files are created exclusively, with fixed permissions.
    target.mkdir(mode=0o755)
    with tarfile.open(args.archive,'r:') as tar:
        for member in tar:
            destination=target/member.name
            destination.parent.mkdir(parents=True,exist_ok=True,mode=0o755)
            with destination.open('xb') as output, tar.extractfile(member) as source:
                shutil.copyfileobj(source,output,1024*1024)
            destination.chmod(0o644)
    print('Staged verified release. Activation is a separate operator command. No services changed.')

if __name__=='__main__':
    try: main()
    except (ValueError,KeyError,OSError,tarfile.TarError) as error:
        raise SystemExit(f'Release rejected: {error}')
