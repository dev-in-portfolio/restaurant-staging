#!/usr/bin/env python3
import json
import re
import subprocess
from pathlib import Path

root = Path('staging').resolve()
out = Path('out').resolve()
report_path = out / 'phase4-sync-report.json'
report = json.loads(report_path.read_text(encoding='utf-8'))

files = [
    root / 'restaurants' / 'hathaways-fried-chicken' / 'about.html',
    root / 'restaurants' / 'the-dive-n' / 'about.html',
    root / 'restaurants' / 'portrait-gallery' / 'about.html',
    root / 'restaurants' / 'lang-van' / 'about.html',
]

style = '''
<style data-phase4-mobile-overflow-fix>
@media (max-width: 600px) {
  html, body { max-width: 100%; overflow-x: clip; }
  .nav-container { width: 100%; max-width: 100%; min-width: 0; height: auto; flex-wrap: wrap; gap: .65rem; padding: .75rem 1rem; }
  .back-to-directory { width: 100%; min-width: 0; }
  .brand-wrapper { max-width: 100%; min-width: 0; flex: 1 1 12rem; }
  .brand-name { min-width: 0; max-width: 100%; font-size: 1.05rem; overflow-wrap: anywhere; }
  .brand-name span { letter-spacing: .08em; }
  .nav-links { width: 100%; max-width: 100%; min-width: 0; display: flex; flex-wrap: wrap; gap: .35rem; }
  .nav-links a { padding: .3rem .45rem; }
  .nav-container > a:last-child { max-width: 100%; }
  img, svg, video, canvas, iframe { max-width: 100%; height: auto; }
}
</style>
'''

changed = []
for file in files:
    if not file.is_file():
        raise SystemExit(f'Missing targeted mobile-fix file: {file}')
    raw = file.read_text(encoding='utf-8')
    if 'data-phase4-mobile-overflow-fix' in raw:
        continue
    if not re.search(r'</head\s*>', raw, flags=re.I):
        raise SystemExit(f'Missing closing head element: {file}')
    updated = re.sub(r'</head\s*>', style + '</head>', raw, count=1, flags=re.I)
    file.write_text(updated, encoding='utf-8')
    changed.append(file.relative_to(root).as_posix())

report['mobileOverflowFixFiles'] = changed
report['changedFileCount'] = len(subprocess.check_output(
    ['git', '-C', str(root), 'diff', '--name-only'], text=True
).splitlines())
report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print(json.dumps({'mobileOverflowFixFiles': changed, 'changedFileCount': report['changedFileCount']}, indent=2))
