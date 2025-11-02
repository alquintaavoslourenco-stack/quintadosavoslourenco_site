import os, re, subprocess, html
from datetime import datetime, timezone
from urllib.parse import urljoin

BASE_URL = "https://quintadosavoslourenco.pt"

IGNORE_DIRS = {".git", ".github", "_site", "node_modules", "vendor", "assets", "css", "js", "fonts"}
IGNORE_FILES = {"404.html"}

IMG_EXT = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}

def git_lastmod(path):
    try:
        iso = subprocess.check_output(["git", "log", "-1", "--format=%cI", "--", path], text=True).strip()
        if iso:
            return iso
    except Exception:
        pass
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def to_url(filepath):
    if filepath == "index.html":
        return "/"
    if filepath.endswith("/index.html"):
        return "/" + filepath[:-len("/index.html")] + "/"
    return "/" + filepath

def changefreq_for(url):
    if url in ("/", "/reservas/"): return "weekly"
    if url in ("/politica-privacidade/", "/termos-e-condicoes/"): return "yearly"
    return "monthly"

def priority_for(url):
    if url == "/": return "1.0"
    if url in ("/sobre/", "/galeria/", "/contactos/", "/reservas/"): return "0.9"
    return "0.6"

def find_images_in_html(html_text, page_dir_url):
    imgs = set()
    for m in re.finditer(r'<img\b[^>]*\bsrc=["\']([^"\']+)["\']', html_text, flags=re.IGNORECASE):
        src = m.group(1).strip()
        if not src or src.startswith("data:"):
            continue
        if src.startswith("http://") or src.startswith("https://"):
            abs_url = src
        elif src.startswith("//"):
            abs_url = "https:" + src
        elif src.startswith("/"):
            abs_url = BASE_URL + src
        else:
            abs_url = urljoin(page_dir_url.rstrip("/") + "/", src)
        lower = abs_url.lower()
        if any(lower.endswith(ext) for ext in IMG_EXT):
            imgs.add(abs_url)
    return sorted(imgs)

html_files = []
for root, dirs, files in os.walk("."):
    dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith(".")]
    for f in files:
        if f.endswith(".html") and f not in IGNORE_FILES:
            path = os.path.join(root, f).lstrip("./")
            html_files.append(path)

entries = []
image_map = {}

for f in sorted(html_files):
    url_path = to_url(f)
    page_url = BASE_URL + url_path
    lastmod = git_lastmod(f)
    entries.append((page_url, lastmod[:10], changefreq_for(url_path), priority_for(url_path)))

    try:
        with open(f, "r", encoding="utf-8") as fh:
            txt = fh.read()
    except UnicodeDecodeError:
        with open(f, "r", encoding="latin-1", errors="ignore") as fh:
            txt = fh.read()
    dir_url = BASE_URL if "/" not in f else (BASE_URL + "/" + f.rsplit("/", 1)[0])
    imgs = find_images_in_html(txt, dir_url)
    if imgs:
        image_map[page_url] = imgs

seen = set()
unique_pages = []
for e in entries:
    if e[0] in seen: continue
    seen.add(e[0])
    unique_pages.append(e)

with open("sitemap.xml", "w", encoding="utf-8") as out:
    out.write('<?xml version="1.0" encoding="UTF-8"?>\n')
    out.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
    for loc, lastmod, freq, prio in unique_pages:
        out.write("  <url>\n")
        out.write(f"    <loc>{html.escape(loc)}</loc>\n")
        out.write(f"    <lastmod>{lastmod}</lastmod>\n")
        out.write(f"    <changefreq>{freq}</changefreq>\n")
        out.write(f"    <priority>{prio}</priority>\n")
        out.write("  </url>\n")
    out.write("</urlset>\n")
print(f"Generated sitemap.xml with {len(unique_pages)} URLs.")

with open("sitemap-images.xml", "w", encoding="utf-8") as out:
    out.write('<?xml version="1.0" encoding="UTF-8"?>\n')
    out.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n')
    out.write('        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n')
    for loc, lastmod, _, _ in unique_pages:
        imgs = image_map.get(loc, [])
        if not imgs:
            continue
        out.write("  <url>\n")
        out.write(f"    <loc>{html.escape(loc)}</loc>\n")
        for img in imgs:
            out.write("    <image:image>\n")
            out.write(f"      <image:loc>{html.escape(img)}</image:loc>\n")
            out.write("    </image:image>\n")
        out.write("  </url>\n")
    out.write("</urlset>\n")
print(f"Generated sitemap-images.xml for {sum(len(v) for v in image_map.values())} images across {len(image_map)} pages.")

robots_lines = [
    "User-agent: *",
    "Allow: /",
    "",
    f"Sitemap: {BASE_URL}/sitemap.xml",
    f"Sitemap: {BASE_URL}/sitemap-images.xml",
    "",
]
with open("robots.txt", "w", encoding="utf-8") as wf:
    wf.write("\n".join(robots_lines))
print("robots.txt updated ✅")
