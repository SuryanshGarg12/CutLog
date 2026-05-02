#!/usr/bin/env python3
import os, sys
root = os.path.dirname(__file__) + '/../'
root = os.path.abspath(root)
errors = []

# Read index.html
index_path = os.path.join(root, 'index.html')
if not os.path.exists(index_path):
    print('FAIL: index.html not found')
    sys.exit(2)
with open(index_path, 'r', encoding='utf-8') as f:
    html = f.read()

# String checks
checks = {
    'title': '<title>CutLog</title>',
    'view-today': 'id="view-today"',
    'ringArc': 'id="ringArc"',
    'macroBars': 'id="macroBars"',
    'nav': 'id="nav"',
    'onboarding': 'id="onboarding"',
}
for name, token in checks.items():
    if token not in html:
        errors.append(f"Missing '{token}' in index.html")

# File checks
files = [
    'app.js',
    'js/supabase.js',
    'js/storage.js',
    'js/macros.js',
    'js/charts.js',
    'js/notifications.js',
    'service-worker.js',
    'reference-theme.css',
]
for p in files:
    if not os.path.exists(os.path.join(root, p)):
        errors.append(f"Missing file: {p}")

# Report
if errors:
    print('SMOKE TEST: FAIL')
    for e in errors:
        print(' -', e)
    sys.exit(1)
else:
    print('SMOKE TEST: PASS')
    sys.exit(0)
