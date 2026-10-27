#!/usr/bin/env python3
"""Define/troca a linha ⚖️ de questões (posição 1-based) e preenche o campo Artigo (para fechar o portão do pop-up).
Uso: python3 definir_base.py <entrada.md> <saida.md> "33=**Art. 59** ▸ **IV** · Lei 14.133/2021" "64=**Art. 48** ▸ **parágrafo único** · Lei 14.133/2021"
Só use dispositivo CONFERIDO no texto carregado (node lei.js "Lei 14.133" 59). Opcional: n=- remove o ⚖️."""
import re, subprocess, sys, os
aqui = os.path.dirname(os.path.abspath(__file__))
p = re.split(r'(?m)^(## QUESTÃO \d+\s*\n)', open(sys.argv[1], encoding='utf-8').read())
for arg in sys.argv[3:]:
    n, base = arg.split('=', 1); i = 2 * int(n); blk = p[i]; k = blk.index('### Resolução\n') + len('### Resolução\n')
    cab, res = blk[:k], blk[k:]
    res = re.sub(r'(?m)^⚖️[^\n]*\n', '', res, count=1)
    if base != '-': res = '⚖️ %s\n' % base + res
    if base != '-': cab = re.sub(r'(?m)^\*\*Artigo:\*\*[^\n]*\n', '', cab)   # será refeito pelo preencher_artigo
    p[i] = cab + res
tmp = sys.argv[2] + '.tmp'; open(tmp, 'w', encoding='utf-8').write(''.join(p))
subprocess.run(['python3', os.path.join(aqui, 'preencher_artigo.py'), tmp, sys.argv[2]], check=True); os.remove(tmp)
