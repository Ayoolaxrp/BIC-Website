import re, os, json, sys
p = os.environ.get('TMP', r'C:\Users\User\AppData\Local\Temp')
raw = open(os.path.join(p, sys.argv[1] if len(sys.argv) > 1 else 'form.txt'), encoding='utf-8', errors='replace').read()
m = re.search(r'"tree":"((?:[^"\\]|\\.)*)"', raw)
if not m:
    print('NO TREE FOUND'); sys.exit(1)
tree = json.loads('"' + m.group(1) + '"')
pat = re.compile(r'textbox|combobox|button |checkbox|radio|option|alert|status')
for line in tree.split('\n'):
    if pat.search(line):
        print(line.strip()[:140])
