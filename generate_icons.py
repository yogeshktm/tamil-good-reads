import sys
from PIL import Image
import os

source_img = r"C:\Users\91805\.gemini\antigravity\brain\eeca109a-e42b-4686-a033-9a102dd53e6f\book_app_icon_1775407352743.png"
out_dir = r"c:\Users\91805\.gemini\antigravity\scratch\book-manager\public"

if not os.path.exists(source_img):
    print("Source image not found.")
    sys.exit(1)

with Image.open(source_img) as img:
    # Generate 192x192
    img_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
    img_192.save(os.path.join(out_dir, "pwa-192x192.png"))
    
    # Generate 512x512
    img_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    img_512.save(os.path.join(out_dir, "pwa-512x512.png"))
    
    # Generate apple-touch-icon 180x180
    img_apple = img.resize((180, 180), Image.Resampling.LANCZOS)
    img_apple.save(os.path.join(out_dir, "apple-touch-icon.png"))
    
    # Generate favicon.ico 32x32
    img_ico = img.resize((32, 32), Image.Resampling.LANCZOS)
    img_ico.save(os.path.join(out_dir, "favicon.ico"))

print("Successfully generated all PWA icons.")
