#!/usr/bin/env python3
"""Generate tools/{slug}.html and sitemap.xml from data.json. Run from repo root."""

from __future__ import annotations

import html
import json
import re
from pathlib import Path
from urllib.parse import quote, urlparse

ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT / "data.json"
TOOLS_DIR = ROOT / "tools"
SITEMAP_PATH = ROOT / "sitemap.xml"
SITE = "https://www.no1tool.com"
CATEGORIES = [
    "AI写作",
    "AI图像",
    "AI视频",
    "AI办公",
    "AI聊天",
    "AI开发",
    "AI音频",
    "AI内容",
    "AI学习",
    "AI搜索",
]
SUBMIT = "https://github.com/HeyEden0314/no1tool/issues/new?template=tool-submission.yml"


def slugify_stem(stem: str) -> str:
    text = stem.strip().lower()
    text = re.sub(r"[^\w\u4e00-\u9fff-]+", "-", text, flags=re.UNICODE)
    text = re.sub(r"-{2,}", "-", text).strip("-")
    return text[:80] or "tool"


def assign_slugs(items: list[dict]) -> None:
    used: set[str] = set()
    for item in items:
        img = item.get("img") or ""
        stem = Path(img).stem if img else ""
        base = slugify_stem(stem) if stem else slugify_stem(str(item.get("title") or "tool"))
        slug = base
        n = 2
        while slug in used:
            slug = f"{base}-{n}"
            n += 1
        used.add(slug)
        item["slug"] = slug


def related_for(tool: dict, published: list[dict], limit: int = 6) -> list[dict]:
    same = [
        other
        for other in published
        if other["category"] == tool["category"] and other["slug"] != tool["slug"]
    ]
    return same[:limit]


def nav_html(active: str) -> str:
    def link(href: str, label: str, key: str) -> str:
        cls = "nav-link active" if active == key else "nav-link"
        extra = ' target="_blank" rel="noopener noreferrer"' if key == "submit" else ""
        return f'<a href="{href}" class="{cls}"{extra}>{label}</a>'

    return f"""        <nav class="topnav">
          {link("../index.html", "首页", "home")}
          {link("../list.html", "全部工具", "list")}
          {link(SUBMIT, "提交工具", "submit")}
        </nav>"""


FAVICON = (
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E"
    "%3Crect width='100' height='100' rx='8' fill='%233D9AD6'/%3E"
    "%3Ctext x='50' y='68' font-family='serif' font-size='52' font-weight='700' "
    "fill='%23F4FAFE' text-anchor='middle'%3E%E5%A3%B9%3C/text%3E%3C/svg%3E"
)


def host_of(href: str) -> str:
    if not href:
        return ""
    try:
        host = urlparse(href).netloc
        return host[4:] if host.startswith("www.") else host
    except ValueError:
        return ""


def page_shell_head(title: str, description: str, canonical: str) -> str:
    esc_title = html.escape(title)
    esc_desc = html.escape(description)
    return f"""<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#3d9ad6" />
    <title>{esc_title}</title>
    <meta name="description" content="{esc_desc}" />
    <link rel="canonical" href="{html.escape(canonical, quote=True)}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="zh_CN" />
    <meta property="og:site_name" content="No.1工具导航" />
    <meta property="og:title" content="{esc_title}" />
    <meta property="og:description" content="{esc_desc}" />
    <meta property="og:url" content="{html.escape(canonical, quote=True)}" />
    <meta name="twitter:card" content="summary" />
    <link rel="icon" type="image/svg+xml" href="{FAVICON}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&family=Noto+Serif+SC:wght@600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="../style.css" />
  </head>"""


def tool_page(tool: dict, related: list[dict]) -> str:
    title = tool["title"]
    subtitle = tool.get("subtitle") or ""
    category = tool.get("category") or ""
    slug = tool["slug"]
    href = tool.get("href") or ""
    img = tool.get("img") or "images/placeholder.svg"
    desc = subtitle[:80] if subtitle else f"{title} - No.1工具导航"
    canonical = f"{SITE}/tools/{quote(slug)}.html"
    cat_q = quote(category)
    related_html = ""
    if related:
        cards = []
        for other in related:
            other_img = other.get("img") or "images/placeholder.svg"
            cards.append(
                f"""          <a class="related-card" href="{html.escape(quote(other['slug']), quote=True)}.html">
            <img src="../{html.escape(other_img, quote=True)}" alt="" />
            <div>
              <strong>{html.escape(other['title'])}</strong>
              <span>{html.escape(other.get('subtitle') or '')}</span>
            </div>
          </a>"""
            )
        related_html = f"""      <section class="section">
        <div class="section-header">
          <h2 class="section-title">同类工具</h2>
          <p class="section-desc">同一分类下的其他收录</p>
        </div>
        <div class="related-grid">
{chr(10).join(cards)}
        </div>
      </section>"""
    else:
        related_html = ""

    official = ""
    if href:
        official = (
            f'<a class="btn btn-primary" href="{html.escape(href, quote=True)}" '
            f'target="_blank" rel="noopener noreferrer">打开官网</a>'
        )

    host = host_of(href)
    host_row = ""
    if host:
        host_row = f"""            <div>
              <dt>官网</dt>
              <dd>{html.escape(host)}</dd>
            </div>"""

    return f"""{page_shell_head(f"{title} - No.1工具导航", desc, canonical)}
  <body class="page-detail">
    <div class="page-shell">
      <header class="masthead">
        <a href="../index.html" class="wordmark">
          <span class="wordmark-mark" aria-hidden="true">壹</span>
          <span class="wordmark-copy">
            <h1>No.1工具导航</h1>
            <p>中文 AI 工具目录</p>
          </span>
        </a>
{nav_html("list")}
      </header>

      <nav class="breadcrumb" aria-label="面包屑">
        <a href="../index.html">首页</a>
        <span>/</span>
        <a href="../list.html">全部工具</a>
        <span>/</span>
        <a href="../list.html?category={html.escape(cat_q, quote=True)}">{html.escape(category)}</a>
      </nav>

      <article class="detail-panel">
        <div class="detail-cover">
          <img src="../{html.escape(img, quote=True)}" alt="{html.escape(title)}" />
        </div>
        <div class="detail-copy">
          <a class="detail-cat" href="../list.html?category={html.escape(cat_q, quote=True)}">{html.escape(category)}</a>
          <h1>{html.escape(title)}</h1>
          <p>{html.escape(subtitle)}</p>
          <dl class="detail-meta">
            <div>
              <dt>分类</dt>
              <dd>{html.escape(category)}</dd>
            </div>
{host_row}
          </dl>
          <div class="hero-actions">
            {official}
            <a class="btn btn-secondary" href="../list.html?category={html.escape(cat_q, quote=True)}">更多{html.escape(category)}</a>
          </div>
        </div>
      </article>

{related_html}

      <footer class="page-footer">
        <div class="footer-content">
          <div class="footer-links">
            <a href="../index.html">首页</a>
            <a href="../list.html">全部工具</a>
            <a href="{SUBMIT}" target="_blank" rel="noopener noreferrer">提交工具</a>
          </div>
          <p class="footer-copy">© 2026 No.1工具导航</p>
        </div>
      </footer>
    </div>
  </body>
</html>
"""


def write_sitemap(published: list[dict]) -> None:
    urls = [
        f"{SITE}/",
        f"{SITE}/list.html",
    ]
    for cat in CATEGORIES:
        urls.append(f"{SITE}/list.html?category={quote(cat)}")
    for tool in published:
        urls.append(f"{SITE}/tools/{quote(tool['slug'])}.html")

    body = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc in urls:
        body.append("  <url>")
        body.append(f"    <loc>{html.escape(loc)}</loc>")
        body.append("  </url>")
    body.append("</urlset>")
    body.append("")
    SITEMAP_PATH.write_text("\n".join(body), encoding="utf-8")


def main() -> None:
    items = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    if not isinstance(items, list):
        raise SystemExit("data.json must be a list")
    assign_slugs(items)
    DATA_PATH.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    published = [item for item in items if item.get("status") != "unpublished"]
    if TOOLS_DIR.exists():
        for old in TOOLS_DIR.glob("*.html"):
            old.unlink()
    TOOLS_DIR.mkdir(exist_ok=True)

    for tool in published:
        related = related_for(tool, published)
        (TOOLS_DIR / f"{tool['slug']}.html").write_text(tool_page(tool, related), encoding="utf-8")

    write_sitemap(published)
    print(f"wrote {len(published)} detail pages, {len(items)} tools with slugs")


if __name__ == "__main__":
    main()
