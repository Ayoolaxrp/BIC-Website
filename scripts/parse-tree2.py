import re, os, json, sys
p = os.environ.get('TMP', r'C:\Users\User\AppData\Local\Temp')
fname = sys.argv[1] if len(sys.argv) > 1 else 'state1.txt'
raw = open(os.path.join(p, fname), encoding='utf-8', errors='replace').read()
m = re.search(r'"tree":"((?:[^"\\]|\\.)*)"', raw)
if not m:
    print('NO TREE FOUND'); sys.exit(1)
tree = json.loads('"' + m.group(1) + '"')
pat = re.compile(r'error|invalid|required|enter a |please|must be|babcock|submit|alert|status|application|paystack', re.I)
for line in tree.split('\n'):
    if pat.search(line):
        print(line.strip()[:150])
