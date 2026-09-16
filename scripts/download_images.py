import json
import os
import re
import urllib.parse
from pathlib import Path

import requests
from bs4 import BeautifulSoup

BASE_DIR = Path(__file__).resolve().parent.parent  # repo root (script lives in scripts/)
IMAGES_DIR = BASE_DIR / 'images'
IMAGES_DIR.mkdir(exist_ok=True)

DATA_PATH = BASE_DIR / 'data.json'
SOURCE_URL = 'https://ai.codefather.cn/tool'

session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Referer': SOURCE_URL,
})


def parse_image_url(img_value):
    if not img_value:
        return None
    if img_value.startswith('images/'):
        return img_value
    if img_value.startswith('/_next/image'):
        return 'https://ai.codefather.cn' + img_value
    if img_value.startswith('//'):
        return 'https:' + img_value
    if img_value.startswith('http'):
        return img_value
    return None


def sanitize_filename(text):
    text = text.strip().lower()
    text = re.sub(r"[^0-9a-z\u4e00-\u9fff]+", '-', text)
    text = re.sub(r'-{2,}', '-', text).strip('-')
    return text[:50] or 'image'


def download_image(url, filename):
    path = IMAGES_DIR / filename
    if path.exists():
        return path
    resp = session.get(url, timeout=30)
    resp.raise_for_status()
    path.write_bytes(resp.content)
    return path


def restore_image_sources():
    print('Fetching tool listing from source site...')
    r = session.get(SOURCE_URL, timeout=30)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, 'html.parser')
    mapping = {}
    for a in soup.select('a[href^="/tool/"]'):
        title = None
        img = None
        h5 = a.find('h5')
        if h5:
            title = h5.get_text(strip=True)
        image = a.find('img')
        if image and image.has_attr('src'):
            img = image['src']
        if title and img:
            mapping[title] = img
    print(f'Restored {len(mapping)} image sources from site.')
    return mapping


def ensure_placeholder():
    placeholder = IMAGES_DIR / 'placeholder.svg'
    if not placeholder.exists():
        placeholder.write_text(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280"><rect width="280" height="280" rx="32" fill="#eef2ff"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#4f46e5" font-family="Arial, sans-serif" font-size="24">AI</text></svg>',
            encoding='utf-8',
        )
    return placeholder


with open(DATA_PATH, 'r', encoding='utf-8') as f:
    items = json.load(f)

mapping = restore_image_sources()
placeholder_path = ensure_placeholder()
updated = 0
errors = []

for idx, item in enumerate(items, start=1):
    title = item.get('title', f'tool-{idx}')
    raw_img = item.get('img', '')
    placeholder_name = placeholder_path.name
    if raw_img.startswith('images/') and raw_img != f'images/{placeholder_name}' and (IMAGES_DIR / os.path.basename(raw_img)).exists():
        continue

    if raw_img.startswith('images/'):
        raw_img = ''

    if not raw_img and title in mapping:
        raw_img = mapping[title]
    elif not raw_img:
        raw_img = ''

    src = parse_image_url(raw_img)
    if not src:
        item['img'] = f'images/{placeholder_path.name}'
        continue

    if src.startswith('images/'):
        item['img'] = src
        continue

    parsed = urllib.parse.urlparse(src)
    ext = os.path.splitext(parsed.path)[1].lower()
    if ext not in {'.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'}:
        ext = '.png'

    safe_name = sanitize_filename(title)
    filename = f'{idx:03d}-{safe_name}{ext}'

    try:
        download_image(src, filename)
        item['img'] = f'images/{filename}'
        updated += 1
    except Exception as exc:
        item['img'] = f'images/{placeholder_path.name}'
        errors.append((idx, title, src, str(exc)))
        print(f'ERROR {idx} {title}: {exc}')

with open(DATA_PATH, 'w', encoding='utf-8') as f:
    json.dump(items, f, ensure_ascii=False, indent=2)

print(f'updated {updated} items')
print(f'errors {len(errors)}')
if errors:
    for err in errors[:10]:
        print(err)
