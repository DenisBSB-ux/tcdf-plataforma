#!/usr/bin/env python3
"""Classifica (Sinal nos Certos, Armadilha nos Errados) os itens Certo/Errado ainda sem classificação. Pré-autorizado pelo usuário (21/10/2026).
Uso: python3 classificar_auto.py <entrada.md> <saida.md>
Regra: Certo -> REL se o enunciado traz relativizador (pode, em regra, geralmente...), LIT se Cobrança começa com L, senão COE.
       Errado -> pelo código de Cobrança (T:inv INV, T:ter TRO, T:ext EXT, T:num PRAZ, T:res RES, T:mis TRO...); sem código: PRAZ se Trecho e Correção têm número, INV se há 'não/sem', senão TRO.
Grava o campo antes do **Trecho:** e `Origem da classificação: ia` depois do último Trecho/Correção."""
import re, sys
REL = re.compile(r'\b(pode|podem|em regra|geralmente|principalmente|especialmente|sobretudo|alguns|algumas|em geral|tende|tendem|pelo menos)\b', re.I)
COB = {'T:inv': 'INV', 'T:ter': 'TRO', 'T:ext': 'EXT', 'T:num': 'PRAZ', 'T:res': 'RES', 'T:mis': 'TRO', 'R:INV': 'INV', 'I:EXT': 'EXT', 'I:INV': 'INV', 'I:TER': 'TRO'}
def campo(b, n):
    m = re.search(r'\*\*' + n + r':\*\*\s*(.*)', b); return m.group(1).strip() if m else ''
def main():
    ent, sai = sys.argv[1:3]; partes = re.split(r'(?m)^(## QUESTÃO \d+\s*$)', open(ent, encoding='utf-8').read()); out = [partes[0]]; n = 0
    for k in range(1, len(partes), 2):
        cab, b = partes[k], partes[k + 1]; g = campo(b, 'Gabarito')
        if g in ('Certo', 'Errado') and not (campo(b, 'Sinal') or campo(b, 'Armadilha')) and re.search(r'(?m)^\*\*Trecho:\*\*', b):
            cob = campo(b, 'Cobrança'); enun = re.search(r'### Enunciado\n(.*?)\n\*\*Gabarito', b, re.S).group(1)
            if g == 'Certo': nome, val = 'Sinal', ('REL' if REL.search(enun) else ('LIT' if cob.startswith('L') else 'COE'))
            else:
                val = COB.get(cob)
                if not val:
                    tr, co = campo(b, 'Trecho'), campo(b, 'Correção')
                    val = 'PRAZ' if re.search(r'\d', tr) and re.search(r'\d', co) else ('INV' if re.search(r'\bnão\b|\bsem\b', tr + ' ' + co) else 'TRO')
                nome = 'Armadilha'
            b = re.sub(r'(?m)^(\*\*Trecho:\*\*)', f'**{nome}:** {val}\n\\1', b, count=1)
            m = list(re.finditer(r'(?m)^\*\*(?:Trecho|Correção):\*\*.*\n', b))[-1]
            b = b[:m.end()] + '**Origem da classificação:** ia\n' + b[m.end():]; n += 1
        out += [cab, b]
    open(sai, 'w', encoding='utf-8').write(''.join(out)); print('itens classificados (ia):', n)
main()
