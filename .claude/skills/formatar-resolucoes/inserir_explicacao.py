#!/usr/bin/env python3
"""Insere `**Explicação:**` (item Errado) entre Correção e Origem, a partir de X.py; remove `Origem da classificação` duplicada.
Uso: python3 inserir_explicacao.py <final.md> <X.py> <saida.md>"""
import re, sys
ns = {}; exec(open(sys.argv[2], encoding='utf-8').read(), ns); X = ns['X']
p = re.split(r'(?m)^(## QUESTÃO \d+\s*\n)', open(sys.argv[1], encoding='utf-8').read()); n = 0
sem_item_errado = []; falhou = []; errados_sem_x = []
for i in range(1, len(p), 2):
    pos = (i + 1) // 2; b = p[i + 1]; k = b.index('### Enunciado'); cab = b[:k]
    ors = re.findall(r'(?m)^\*\*Origem da classificação:\*\*[^\n]*\n', cab)
    if len(ors) > 1: cab = cab.replace(ors[0], '', 1)
    errado = bool(re.search(r'(?m)^\*\*Gabarito:\*\* Errado\s*$', b))
    if pos in X and not errado: sem_item_errado.append(pos)
    if errado and pos not in X and '**Explicação:**' not in cab: errados_sem_x.append(pos)
    if pos in X and '**Explicação:**' not in cab:
        cab, c = re.subn(r'(?m)^(\*\*Origem da classificação:\*\*)', lambda m: '**Explicação:** %s\n' % X[pos].strip() + m.group(1), cab, count=1)
        if c: n += 1
        else: falhou.append(pos)
    p[i + 1] = cab + b[k:]
open(sys.argv[3], 'w', encoding='utf-8').write(''.join(p)); print('explicações inseridas:', n)

if errados_sem_x: print('AVISO: itens Errados sem Explicação em X.py:', errados_sem_x[:30])
if sem_item_errado or falhou:
    print('ERRO: X.py tem chaves que não são item Errado:', sem_item_errado[:30], '| sem linha "Origem da classificação" para inserir:', falhou[:30]); sys.exit(1)
