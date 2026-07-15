#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import html
import json
import re
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path

SOURCE_ROOT = Path('source').resolve()
STAGING_ROOT = Path('staging').resolve()
RESTAURANTS_ROOT = STAGING_ROOT / 'restaurants'
OUT = Path('out').resolve()
SOURCE_SHA = subprocess.check_output(['git', '-C', str(SOURCE_ROOT), 'rev-parse', 'HEAD'], text=True).strip()
STAGING_SHA_BEFORE = subprocess.check_output(['git', '-C', str(STAGING_ROOT), 'rev-parse', 'HEAD'], text=True).strip()
STAMP = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')

GROUPS = {
    'A': [
        ('aj-family-restaurant', 'AJ Family Restaurant'),
        ('alice-jules-coffee-house', 'Alice Jules Coffee House'),
        ('amina', 'Amina'),
        ('anatolia-cafe-and-cuisine', 'Anatolia Cafe & Cuisine'),
        ('food-soul', 'Food For Your Soul CLT'),
        ('hathaways-fried-chicken', "Hathaway's Fried Chicken"),
        ('house-of-leng', 'House of Leng'),
        ('kits-trackside-crafts', "Kit's Trackside Crafts"),
        ('lang-van', 'Lang Van'),
        ('laurel-market', 'Laurel Market'),
        ('le-kebab-grill', 'Le Kebab Grill'),
        ('les-sandwiches-cafe', "Le's Sandwiches & Café"),
        ('machu-picchu', 'Machu Picchu Peruvian Cuisine'),
        ('matthews-social-house', 'Matthews Social House'),
        ('miguels-restaurant', "Miguel's Restaurant"),
        ('mj-donuts', 'MJ Donuts'),
        ('picadelis-pub-in-deli', "Picadeli's Pub-In-Deli"),
        ('queens-soul', "Queen's Soul Food"),
        ('republica', 'República Restaurant & Lounge'),
        ('the-dive-n', 'The Dive N'),
        ('palace-monroe', 'The Palace Restaurant'),
        ('portrait-gallery', 'The Portrait Gallery'),
    ],
    'B': [
        ('dbs-tavern', "DB's Tavern"),
        ('doans-vietnamese-cuisine', "Doan's Vietnamese Cuisine"),
        ('dolce-osteria', 'Dolce Osteria'),
        ('east-74-restaurant', 'East 74 Restaurant'),
        ('el-valle-mexican-restaurant', 'El Valle Mexican Restaurant'),
        ('geno-ds-pizza', "Geno D's Pizza"),
        ('giddy-goat-coffee-roasters', 'Giddy Goat Coffee Roasters'),
        ('gotcha-matcha-espresso', 'Gotcha Matcha & Espresso'),
        ('greys-diner', "Grey's Diner"),
    ],
    'C': [
        ('deejai-thai', 'Deejai Thai'),
        ('devils-logic-brewing', "Devil's Logic Brewing"),
        ('doms-dive-bar', "Dom's Dive Bar"),
        ('dozo-japanese-american-kitchen', 'DŌZO Japanese-American Kitchen'),
        ('dukes-grill', "Duke's Grill"),
        ('fenians-keep', "Fenian's Keep"),
        ('flour-shop', 'Flour Shop'),
        ('harpers-cafe', "Harper's Cafe"),
        ('lula-banh-mi-and-bakery', 'Lula Bánh Mì + Bakery'),
        ('marias-mexican-restaurant', "Maria's Mexican Restaurant"),
    ],
}
TARGETS = [(group, slug, name) for group, items in GROUPS.items() for slug, name in items]
assert len(TARGETS) == 41

EXCLUDED = {
    '.git', '.github', '.migration', '.staging-do-not-use.txt', 'node_modules',
    '.DS_Store', 'Thumbs.db', 'qa', 'restaurant.json'
}
BOOLEAN_FIELDS = [
    'desktopReviewed', 'tabletReviewed', 'mobileReviewed', 'linksVerified',
    'contentVerified', 'performanceReviewed', 'accessibilityReviewed',
    'comparisonButtonAdded', 'comparisonButtonNotApplicable',
    'productionBuildPassed', 'approvedForPresentation'
]


def ignored(path: Path) -> bool:
    return any(part in EXCLUDED or part.startswith('.') for part in path.parts)


def copy_site(src: Path, dst: Path) -> None:
    if dst.exists():
        shutil.rmtree(dst)
    dst.mkdir(parents=True)
    for item in src.rglob('*'):
        rel = item.relative_to(src)
        if ignored(rel):
            continue
        target = dst / rel
        if item.is_dir():
            target.mkdir(parents=True, exist_ok=True)
        elif item.is_file():
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(item, target)


def digest_map(root: Path) -> dict[str, str]:
    result: dict[str, str] = {}
    for file in sorted(p for p in root.rglob('*') if p.is_file()):
        rel = file.relative_to(root)
        if ignored(rel):
            continue
        result[rel.as_posix()] = hashlib.sha256(file.read_bytes()).hexdigest()
    return result


def adapt_staging_routes(dst: Path, slug: str) -> list[str]:
    changed: list[str] = []
    escaped = re.escape(slug)
    pattern = re.compile(
        rf'(?P<prefix>\b(?:href|src)\s*=\s*)(?P<quote>["\'])(?P<url>/{escaped}(?P<tail>(?:/|[?#])[^"\']*|))(?P=quote)',
        flags=re.I,
    )

    def replacement(match: re.Match[str]) -> str:
        tail = match.group('tail') or ''
        if tail in ('', '/'):
            target = 'index.html'
        elif tail.startswith('/'):
            target = tail[1:]
        else:
            target = 'index.html' + tail
        return f'{match.group("prefix")}{match.group("quote")}{target}{match.group("quote")}'

    for file in sorted(dst.rglob('*.html')):
        raw = file.read_text(encoding='utf-8')
        updated = pattern.sub(replacement, raw)
        if updated != raw:
            file.write_text(updated, encoding='utf-8')
            changed.append(file.relative_to(STAGING_ROOT).as_posix())
    return changed


def build_directory() -> int:
    records = []
    for folder in RESTAURANTS_ROOT.iterdir():
        metadata_path = folder / 'restaurant.json'
        if folder.is_dir() and metadata_path.is_file():
            data = json.loads(metadata_path.read_text(encoding='utf-8'))
            records.append({
                'slug': folder.name,
                'name': data.get('name') or folder.name,
                'status': data.get('status', 'ready-for-polish'),
            })

    def key(record: dict) -> str:
        value = re.sub(r'^(the|a|an)\s+', '', record['name'].strip(), flags=re.I)
        return value.casefold()

    records.sort(key=key)
    cards = '\n'.join(
        f'<article><span>{html.escape(r["status"].replace("-", " ").upper())}</span>'
        f'<h2>{html.escape(r["name"])}</h2>'
        f'<a href="{html.escape(r["slug"])}/index.html">View Staging Build</a></article>'
        for r in records
    )
    document = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Restaurant Staging Directory</title><style>*{{box-sizing:border-box}}body{{margin:0;font-family:system-ui,sans-serif;background:#111;color:#f7f2e8}}header,main,footer{{width:min(1180px,calc(100% - 2rem));margin:auto}}header{{padding:4rem 0 2rem}}h1{{font-size:clamp(2.5rem,7vw,5rem);margin:0}}p{{color:#bbb}}main{{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem;padding:2rem 0 4rem}}article{{border:1px solid #3b3834;border-radius:1rem;padding:1.25rem;display:flex;flex-direction:column;min-height:190px;background:#1c1a18}}span{{font-size:.72rem;letter-spacing:.12em;font-weight:800;color:#e9bd72}}h2{{font-size:1.25rem}}a{{margin-top:auto;text-align:center;padding:.8rem;background:#e9bd72;color:#21180b;border-radius:.6rem;text-decoration:none;font-weight:800}}footer{{border-top:1px solid #3b3834;padding:2rem 0;color:#999}}</style></head><body><header><p>Ready for Polish</p><h1>Restaurant Staging Directory</h1><p>{len(records)} canonical builds. Internal staging and QA environment.</p></header><main id="main">{cards}</main><footer>Staging directory · {len(records)} builds</footer></body></html>'''
    (RESTAURANTS_ROOT / 'index.html').write_text(document, encoding='utf-8')
    return len(records)


OUT.mkdir(parents=True, exist_ok=True)
RESTAURANTS_ROOT.mkdir(exist_ok=True)
count_before = len([p for p in RESTAURANTS_ROOT.iterdir() if p.is_dir() and (p / 'restaurant.json').is_file()])
results = []
route_adapted_files: list[str] = []

for group, slug, canonical_name in TARGETS:
    src = SOURCE_ROOT / slug
    dst = RESTAURANTS_ROOT / slug
    if not src.is_dir():
        raise SystemExit(f'Missing source folder: {slug}')
    html_count = len(list(src.rglob('*.html')))
    if html_count < 6 or not (src / 'index.html').is_file():
        raise SystemExit(f'{slug}: source does not meet six-page/index standard')

    existing = {}
    old_metadata = dst / 'restaurant.json'
    existed = old_metadata.is_file()
    if existed:
        existing = json.loads(old_metadata.read_text(encoding='utf-8'))

    copy_site(src, dst)
    if digest_map(src) != digest_map(dst):
        raise SystemExit(f'{slug}: exact source mirror failed before staging route adaptation')

    route_adapted_files.extend(adapt_staging_routes(dst, slug))

    notes = [
        note for note in list(existing.get('notes') or [])
        if not str(note).startswith('Phase 4 synchronized from repaired source commit')
    ]
    notes.append(
        f'Phase 4 synchronized from repaired source commit {SOURCE_SHA} after successful '
        'static and desktop/tablet/mobile browser QA. Root-relative self-links were adapted '
        'only for the /restaurants/ staging route.'
    )
    metadata = dict(existing)
    metadata.update({
        'id': slug,
        'name': canonical_name,
        'slug': slug,
        'location': existing.get('location') or {'city': 'Charlotte', 'state': 'NC', 'address': ''},
        'stage': 'staging',
        'status': existing.get('status', 'ready-for-polish'),
        'sourceRepository': 'dev-in-portfolio/restaurants',
        'sourcePath': slug,
        'currentWebsiteUrl': existing.get('currentWebsiteUrl', ''),
        'currentPublicPresenceType': existing.get('currentPublicPresenceType', 'website'),
        'demoRoute': f'restaurants/{slug}/index.html',
        'informationVerifiedAt': existing.get('informationVerifiedAt'),
        'promotedToStagingAt': existing.get('promotedToStagingAt') or STAMP,
        'promotedToShowcaseAt': existing.get('promotedToShowcaseAt'),
        'notes': notes,
    })
    for field in BOOLEAN_FIELDS:
        metadata[field] = bool(existing.get(field, False))
    (dst / 'restaurant.json').write_text(
        json.dumps(metadata, indent=2, ensure_ascii=False) + '\n', encoding='utf-8'
    )
    results.append({
        'group': group,
        'slug': slug,
        'name': canonical_name,
        'existedBefore': existed,
        'htmlPages': html_count,
        'sourceFileCount': len(digest_map(src)),
    })

for shared in ['site-core.css', 'site-core.js']:
    src = SOURCE_ROOT / shared
    if not src.is_file():
        raise SystemExit(f'Missing source shared dependency: {shared}')
    shutil.copy2(src, RESTAURANTS_ROOT / shared)

directory_count = build_directory()
changed = sorted(subprocess.check_output(
    ['git', '-C', str(STAGING_ROOT), 'diff', '--name-only'], text=True
).splitlines())
allowed_prefixes = tuple(f'restaurants/{slug}/' for _, slug, _ in TARGETS)
allowed_shared = {'restaurants/site-core.css', 'restaurants/site-core.js', 'restaurants/index.html'}
unexpected = [p for p in changed if not p.startswith(allowed_prefixes) and p not in allowed_shared]
if unexpected:
    raise SystemExit(f'Unexpected changed files outside Phase 4 scope: {unexpected}')

report = {
    'phase': 4,
    'sourceSha': SOURCE_SHA,
    'stagingShaBefore': STAGING_SHA_BEFORE,
    'targetCount': 41,
    'groups': {key: len(value) for key, value in GROUPS.items()},
    'existingTargetsUpdated': sum(result['existedBefore'] for result in results),
    'newTargetsAdded': sum(not result['existedBefore'] for result in results),
    'stagingRestaurantCountBefore': count_before,
    'stagingRestaurantCountAfter': directory_count,
    'directoryCardCount': directory_count,
    'sharedDependencies': ['restaurants/site-core.css', 'restaurants/site-core.js'],
    'routeAdaptedFileCount': len(set(route_adapted_files)),
    'routeAdaptedFiles': sorted(set(route_adapted_files)),
    'changedFileCount': len(changed),
    'targets': results,
}
(OUT / 'phase4-sync-report.json').write_text(
    json.dumps(report, indent=2, ensure_ascii=False) + '\n', encoding='utf-8'
)
print(json.dumps(report, indent=2, ensure_ascii=False))
