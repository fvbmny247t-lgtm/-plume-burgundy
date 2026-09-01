import re, os, urllib.request

CSS = open("/tmp/gfonts.css").read()
OUT_DIR = "/app/frontend/public/fonts"
os.makedirs(OUT_DIR, exist_ok=True)

# Split into (comment, block) pairs. Comments look like: /* latin */
pattern = re.compile(r"/\*\s*([\w-]+)\s*\*/\s*(@font-face\s*\{[^}]*\})", re.S)
keep = {"latin", "latin-ext"}
out_blocks = []
count = 0
for m in pattern.finditer(CSS):
    subset, block = m.group(1), m.group(2)
    if subset not in keep:
        continue
    url_m = re.search(r"url\((https://[^)]+\.woff2)\)", block)
    if not url_m:
        continue
    url = url_m.group(1)
    fam = re.search(r"font-family:\s*'([^']+)'", block).group(1).replace(" ", "")
    weight = re.search(r"font-weight:\s*(\d+)", block).group(1)
    style = re.search(r"font-style:\s*(\w+)", block).group(1)
    fname = f"{fam}-{weight}-{style}-{subset}.woff2"
    dest = os.path.join(OUT_DIR, fname)
    urllib.request.urlretrieve(url, dest)
    block = block.replace(url, f"/fonts/{fname}")
    out_blocks.append(f"/* {subset} */\n{block}")
    count += 1
    print("downloaded", fname)

open("/app/frontend/src/fonts.css", "w").write("\n".join(out_blocks) + "\n")
print("TOTAL", count)
