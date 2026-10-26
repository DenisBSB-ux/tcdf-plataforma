# Uso: python3 preencher_artigo.py <entrada.md> <saida.md>
# Passo final do padrão: (1) ⚖️ sem negrito vira `**Art. N** ▸ **inciso** · Norma`; (2) preenche **Artigo:** a partir da linha ⚖️ quando faltar.
import re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from montar_resolucoes import artigo_do_base, insere_campo

def negrito(m):
    corpo = m.group(1)
    if '**' in corpo or ' · ' not in corpo: return m.group(0)
    ref, norma = corpo.rsplit(' · ', 1)
    partes = [p.strip() for p in ref.split(' ▸ ')]
    return '⚖️ ' + ' ▸ '.join(f'**{p}**' for p in partes) + ' · ' + norma

txt = open(sys.argv[1], encoding='utf-8').read()
txt = re.sub(r'(?m)^⚖️ (.+)$', negrito, txt)
partes = re.split(r'(?m)^(## QUESTÃO \d+\s*\n)', txt)
out = [partes[0]]; n = 0
for k in range(1, len(partes), 2):
    b = partes[k + 1]
    m = re.search(r'(?m)^⚖️ (.+)$', b)
    if m:
        art = artigo_do_base(m.group(1))
        if art:
            b, ok = insere_campo(b, 'Artigo', art); n += ok
    out += [partes[k], b]
open(sys.argv[2], 'w', encoding='utf-8').write(''.join(out)); print('campo Artigo preenchido em', n)
