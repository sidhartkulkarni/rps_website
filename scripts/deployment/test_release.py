"""Standard-library tests: synthetic archives only, no production filesystem/network."""
import hashlib
import importlib.util
import io
import json
import subprocess
import sys
import tarfile
import tempfile
import unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('installer',Path(__file__).with_name('install-release.py'))
installer=importlib.util.module_from_spec(spec);spec.loader.exec_module(installer)

class ArchiveTests(unittest.TestCase):
    def check(self,name='index.html',content=b'safe',kind=tarfile.REGTYPE,duplicate=False,digest=None):
        with tempfile.TemporaryDirectory() as tmp:
            archive=Path(tmp)/'site.tar'
            with tarfile.open(archive,'w') as tar:
                for _ in range(2 if duplicate else 1):
                    entry=tarfile.TarInfo(name);entry.type=kind;entry.size=len(content) if kind==tarfile.REGTYPE else 0
                    tar.addfile(entry,io.BytesIO(content) if kind==tarfile.REGTYPE else None)
            manifest={'schema':1,'tag':'test','total_bytes':len(content),'files':{'index.html':{'bytes':len(content),'sha256':digest or hashlib.sha256(content).hexdigest()}}}
            installer.validate(archive,manifest)
    def test_staging_and_preview_guard(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp).resolve()/'website';root.mkdir()
            archive=Path(tmp)/'site.tar';body=b'<html>test</html>'
            with tarfile.open(archive,'w') as tar:
                info=tarfile.TarInfo('index.html');info.size=len(body)
                tar.addfile(info,io.BytesIO(body))
            manifest={'schema':1,'tag':'test','source_commit':'a'*40,'publishable':False,'total_bytes':len(body),'files':{'index.html':{'bytes':len(body),'sha256':hashlib.sha256(body).hexdigest()}}}
            metadata=Path(tmp)/'manifest.json';metadata.write_text(json.dumps(manifest))
            command=[sys.executable,str(Path(__file__).with_name('install-release.py')),'--archive',str(archive),'--manifest',str(metadata),'--root',str(root)]
            self.assertNotEqual(subprocess.run(command,capture_output=True).returncode,0)
            self.assertEqual(list(root.iterdir()),[])
            manifest['publishable']=True;metadata.write_text(json.dumps(manifest))
            self.assertEqual(subprocess.run(command,capture_output=True).returncode,0)
            self.assertEqual((root/'releases/test/index.html').read_bytes(),body)
            self.assertFalse((root/'current').exists())
            self.assertNotEqual(subprocess.run(command,capture_output=True).returncode,0)
    def test_regular(self): self.check()
    def test_traversal(self):
        with self.assertRaises(ValueError):self.check('../index.html')
    def test_symlink(self):
        with self.assertRaises(ValueError):self.check(kind=tarfile.SYMTYPE)
    def test_duplicate(self):
        with self.assertRaises(ValueError):self.check(duplicate=True)
    def test_hash(self):
        with self.assertRaises(ValueError):self.check(digest='0'*64)
    def test_unapproved(self):
        with self.assertRaises(ValueError):self.check('.env')

if __name__=='__main__':unittest.main()
