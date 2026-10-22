"""Fetch a Phosphor icon subset from the Iconify API and write it as a
self-contained JS file (window.MOREAD_ICONS) so the demo works offline.

Usage: python tools/fetch_icons.py
"""
import json
import urllib.request

ICONS = """
house compass books book-open book-bookmark bookmark-simple chat-circle
user-circle magnifying-glass moon sun list x caret-down caret-right caret-left
caret-up arrow-right arrow-left arrow-up-right arrow-square-out plus check
check-circle check-fat heart heart-straight share-network clock fire star
quotes notebook sparkle highlighter text-aa library headphones chart-line
chart-bar chart-line-up chart-donut users user-plus trash pencil-simple eye
eye-slash sign-out gear gear-six sliders-horizontal trend-up dots-three
dots-three-vertical flag seal-check medal timer note-pencil sidebar-simple
download-simple printer magic-wand robot paper-plane-tilt question info
warning-circle play pause upload-simple funnel arrows-clockwise arrow-counter-clockwise
arrow-clockwise bookmarks coffee plant lamp pen-nib list-dashes columns rows
lock-key envelope-simple database cloud-arrow-up tree-structure path thumbs-up
chat-centered-text bell calendar-blank hourglass-medium book-open-text article
newspaper-clipping folder-simple sun-horizon monitor device-mobile star-four
magnifying-glass-plus crown trophy feather scroll copy clipboard-text
""".split()

url = "https://api.iconify.design/ph.json?icons=" + ",".join(ICONS)
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req, timeout=30) as resp:
    data = json.load(resp)

missing = data.get("not_found", [])
if missing:
    print("not found:", missing)
print("icons:", len(data.get("icons", {})))

out = "demo/assets/js/icons.js"
with open(out, "w", encoding="utf-8") as fh:
    fh.write("/* Phosphor icons fetched from api.iconify.design (MIT). */\n")
    fh.write("window.MOREAD_ICONS = ")
    json.dump(data, fh, ensure_ascii=False, separators=(",", ":"))
    fh.write(";\n")
print("wrote", out)
