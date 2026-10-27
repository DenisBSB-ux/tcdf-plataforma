#!/usr/bin/env python3
"""Aplica no built.md as propostas de gabarito (GAB) dos subagentes quando o TEXTO DE LEI CARREGADO contradiz o gabarito do arquivo (PADRAO §4: a lei prevalece).
Uso: python3 aplicar_gab.py <pasta>   (lê pasta/gab.json e pasta/built.md; reescreve built.md; grava pasta/.gab_alt com os índices 0-based alterados)
Só use com gabarito de CERTO/ERRADO ou letra apoiado em dispositivo carregado; fato/doutrina nunca entra aqui."""
import json, os, re, sys
d = sys.argv[1]; G = json.load(open(os.path.join(d, 'gab.json'), encoding='utf-8')) if os.path.exists(os.path.join(d, 'gab.json')) else {}
b = os.path.join(d, 'built.md'); p = re.split(r'(?m)^(## QUESTÃO \d+\s*\n)', open(b, encoding='utf-8').read()); alt = []
for idx, (de, para, disp) in ((int(k), v) for k, v in G.items()):
    i = 2 * (idx + 1); m = re.search(r'\*\*Gabarito:\*\* (\S+)', p[i]); assert m and m.group(1) == de, (idx, m and m.group(1), de)
    p[i] = p[i].replace(m.group(0), '**Gabarito:** ' + para, 1); alt.append(idx); print('gabarito alterado: idx', idx, de, '->', para, '|', disp)
open(b, 'w', encoding='utf-8').write(''.join(p)); open(os.path.join(d, '.gab_alt'), 'w').write(','.join(map(str, sorted(alt))))
