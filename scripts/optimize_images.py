import os, sys
from PIL import Image, ImageOps

DIRS = ["/app/frontend/public/images", "/app/frontend/public/media"]
EXTS = (".jpg", ".jpeg", ".png")
MAX_W = 1920

def process(path):
    ext = os.path.splitext(path)[1].lower()
    if ext not in EXTS:
        return
    try:
        im = Image.open(path)
        im = ImageOps.exif_transpose(im)
    except Exception as e:
        print("skip", path, e); return
    # Resize down if huge
    if im.width > MAX_W:
        h = round(im.height * MAX_W / im.width)
        im = im.resize((MAX_W, h), Image.LANCZOS)
    # Recompress original in place (strip metadata)
    rgb = im.convert("RGB") if ext in (".jpg", ".jpeg") else im
    if ext in (".jpg", ".jpeg"):
        rgb.save(path, "JPEG", quality=82, optimize=True, progressive=True)
    else:  # png -> keep png optimized
        im.save(path, optimize=True)
    # WebP sibling
    webp = os.path.splitext(path)[0] + ".webp"
    im.convert("RGB").save(webp, "WEBP", quality=80, method=6)
    print("ok", os.path.basename(path))

for d in DIRS:
    for f in sorted(os.listdir(d)):
        process(os.path.join(d, f))
print("DONE")
