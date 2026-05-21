#!/usr/bin/env python3
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'scripts'))
from site_generator import normalize_all, sync_all

data_file = ROOT / 'data' / 'games.json'
data = normalize_all(json.loads(data_file.read_text(encoding='utf-8')))
data_file.write_text(json.dumps(data, indent=2), encoding='utf-8')
sync_all(data)
print('synced', len(data.get('games', [])))
