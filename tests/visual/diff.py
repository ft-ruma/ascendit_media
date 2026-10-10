# Compare two snapshot folders; prints differing pixel counts per file.
import sys, os
from PIL import Image, ImageChops
a, b = sys.argv[1], sys.argv[2]
bad = 0
for f in sorted(os.listdir(a)):
    A = Image.open(os.path.join(a, f)).convert('RGB')
    pb = os.path.join(b, f)
    if not os.path.exists(pb): print('MISSING', f); bad += 1; continue
    B = Image.open(pb).convert('RGB')
    if A.size != B.size: print(f'SIZE {f} {A.size} -> {B.size}'); bad += 1; continue
    d = ImageChops.difference(A, B).convert('L').point(lambda v: 255 if v > 8 else 0)
    n = d.histogram()[255]
    if n: print(f'DIFF {f}: {n} px, bbox {d.getbbox()}'); bad += 1
print('identical' if not bad else f'{bad} file(s) differ')
