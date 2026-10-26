# Uso: python3 aplicar_modelo.py <entrada.md> <saida.md> rev_0.py [rev_1.py ...]
# Aplica a revisão das justificativas ao MODELO (sem artigo nas linhas 📌/⚠️/💡/ERROS; palavras certas em destaque; erradas ~~riscadas~~).
# Cada rev_K.py define REV = { pos(1-based): {'📌': texto, '⚠️': texto|None, '💡': texto|None, '🪤': texto|None, 'ERROS': {'A': 'Errada; ...'}} }
import re, sys
txt = open(sys.argv[1], encoding='utf-8').read()
REV = {}
for f in sys.argv[3:]:
    ns = {}; exec(open(f, encoding='utf-8').read(), ns); REV.update(ns['REV'])
partes = re.split(r'(?m)^(## QUESTÃO \d+\s*\n)', txt)
n = 0
for pos, nova in REV.items():
    i = 2 * pos
    b = partes[i]; k = b.index('### Resolução'); cab, res = b[:k], b[k:]
    for sim in ('📌', '⚠️', '💡', '🪤'):
        if sim not in nova: continue
        v = nova[sim]
        if sim == '⚠️': pad = r'(?m)^⚠️ (?!ERROS)[^\n]*\n?'
        else: pad = r'(?m)^' + sim + r' [^\n]*\n?'
        if v is None: res = re.sub(pad, '', res, count=1)
        else: res, c = re.subn(pad, lambda m: f'{sim} {v}\n', res, count=1); assert c == 1, (pos, sim)
    for letra, motivo in (nova.get('ERROS') or {}).items():
        res, c = re.subn(r'(?m)^- Letra ' + letra + r': [^\n]*$', lambda m: f'- Letra {letra}: {motivo}', res, count=1); assert c == 1, (pos, letra)
    partes[i] = cab + res; n += 1
open(sys.argv[2], 'w', encoding='utf-8').write(''.join(partes)); print('questões revisadas:', n)
