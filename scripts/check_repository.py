#!/usr/bin/env python3
"""Read-only candidate/tracked-file gate. Never prints file contents or secret values."""
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def run():
    assets = json.loads((ROOT/'frontend/public-assets.lock.json').read_text())
    listed = json.loads((ROOT/'frontend/public-assets.json').read_text())
    if set(assets) != set(listed): raise SystemExit('FAIL: asset manifest/lock mismatch')
    failures = []
    for name, expected in assets.items():
        file = ROOT/'frontend/public'/name.lstrip('/')
        if file.is_symlink() or not file.is_file():
            failures.append('missing or linked approved asset'); continue
        digest = hashlib.sha256()
        with file.open('rb') as stream:
            for block in iter(lambda: stream.read(1024*1024), b''): digest.update(block)
        if file.stat().st_size != expected['bytes'] or digest.hexdigest() != expected['sha256']:
            failures.append('changed approved asset; explicit review/lock update needed')
    for file in (ROOT/'frontend/public').rglob('*'):
        if file.is_file() and file.name != '.gitignore' and '/'+file.relative_to(ROOT/'frontend/public').as_posix() not in assets:
            failures.append('unapproved file in public')
    raw = subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','-z'], cwd=ROOT)
    candidates = set(p.decode() for p in raw.split(b'\0') if p)
    forbidden = re.compile(r'(^|/)(?:local-private-assets|legacy-reference|node_modules|\.venv|\.aws|\.ssh|backups|customer-uploads|private-uploads)(/|$)|^frontend/(?:views|dist)/|^artifacts/|\.(?:sql(?:\..*)?|dump|zip|tar(?:\..*)?|tgz|gz|7z|rar|pem|key|p12|pfx|jks|keystore|crt|cer|der|csv|tsv|xls|xlsx|db|sqlite.*|bak|backup)$', re.I)
    secrets = [
        re.compile(rb'-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----'),
        re.compile(rb'\b(?:AKIA|ASIA)[A-Z0-9]{16}\b'),
        re.compile(rb'\bgh[pousr]_[A-Za-z0-9]{30,}\b'),
        re.compile(rb'\bgithub_pat_[A-Za-z0-9_]{40,}\b'),
        re.compile(rb'https?://[^\s/:]+:[^\s/@]+@'),
    ]
    total = 0
    for name in candidates:
        file = ROOT/name
        if file.name in ('.npmrc','.pypirc','.netrc','.dockercfg','credentials','credentials.json') or name.endswith('/.docker/config.json') or forbidden.search(name) or (file.name.lower().startswith('.env') and name != 'backend/.env.example'):
            failures.append('forbidden Git candidate'); continue
        if name.startswith('frontend/public/') and name != 'frontend/public/.gitignore':
            asset = '/'+name.removeprefix('frontend/public/')
            if asset not in assets or asset.endswith('.mp4'): failures.append('unapproved Git media candidate')
        if file.is_symlink(): failures.append('symlink Git candidate'); continue
        if not file.is_file(): continue
        size = file.stat().st_size; total += size
        if size >= 100 * 1024 * 1024: failures.append('GitHub oversized Git candidate')
        if file.suffix.lower() not in ('.png','.jpg','.jpeg','.webp','.mp4'):
            content = file.read_bytes()
            if any(pattern.search(content) for pattern in secrets): failures.append('possible credential pattern; inspect privately')
    if failures:
        from collections import Counter
        raise SystemExit('FAIL (no values displayed): '+json.dumps(dict(Counter(failures))))
    print(f'PASS: {len(assets)} approved asset hashes; {len(candidates)} Git candidates ({total/1024/1024:.1f} MiB); no forbidden paths or recognized credential patterns.')
    print('This heuristic does not certify absence of secrets or private content. Review staged changes before committing.')

if __name__ == '__main__': run()
