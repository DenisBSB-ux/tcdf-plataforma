#!/usr/bin/env python3
"""Junta os arquivos dos subagentes (pasta/resp/rNN.py e eNN.py) em pasta/q/respostas.py, pasta/q/erros.py e pasta/X.py.
Uso: python3 montar_respostas.py <pasta>
rNN.py define E (trecho,correção), C, X (explicação) e GAB (propostas de gabarito); eNN.py define EE (ERROS por letra, chave = idx 0-based).
Imprime as propostas de gabarito (GAB) para o coordenador decidir (a lei carregada prevalece — PADRAO §4)."""
import glob, os, sys
d = sys.argv[1]
E, C, X, G, EE = {}, {}, {}, {}, {}
for f in sorted(glob.glob(os.path.join(d, 'resp', 'r*.py'))):
    ns = {}; exec(open(f, encoding='utf-8').read(), ns)
    E.update(ns.get('E', {})); C.update(ns.get('C', {})); X.update(ns.get('X', {})); G.update(ns.get('GAB', {}))
for f in sorted(glob.glob(os.path.join(d, 'resp', 'e*.py'))):
    ns = {}; exec(open(f, encoding='utf-8').read(), ns); EE.update(ns.get('EE', {}))
E = {k: tuple(s.replace('\xa0', ' ') for s in v) for k, v in E.items()}
M = {i + 1: {L: v for L, v in dd.items() if v.startswith('Errada')} for i, dd in EE.items()}; M = {k: v for k, v in M.items() if v}
os.makedirs(os.path.join(d, 'q'), exist_ok=True)
open(os.path.join(d, 'q', 'respostas.py'), 'w', encoding='utf-8').write('E = %r\nC = %r\nM = %r\n' % (E, C, M))
open(os.path.join(d, 'q', 'erros.py'), 'w', encoding='utf-8').write('E = %r\n' % (EE,))
open(os.path.join(d, 'X.py'), 'w', encoding='utf-8').write('X = %r\n' % (X,))
print('E:', len(E), '| X:', len(X), '| ERROS (múltipla escolha):', len(EE), '| propostas de gabarito:', G or 'nenhuma')
