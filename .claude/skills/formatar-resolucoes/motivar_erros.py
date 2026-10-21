#!/usr/bin/env python3
"""Deixa cada linha do bloco ⚠️ ERROS no formato: `- Letra X: ~~termo errado~~ está errado: <motivo/o que é o correto>.`  (UMA letra por linha).
Faz: (1) separa linhas de várias letras ("Letras A, B e C: ...") em uma linha por letra; (2) reescreve "<correto>, ~~errado~~ (art.)" como "~~errado~~ está errado: <correto>." ; linhas já motivadas ficam como estão.
Uso: python3 motivar_erros.py <entrada.md> <saida.md>"""
import re, sys
LETRAS = re.compile(r'^- Letras? ([A-E](?:(?:, | e )[A-E])*): (.*)$')
FIM = re.compile(r'^(?P<rem>.*?),? (?P<st>~~.+?~~(?:(?:,| e) ?~~.+?~~)*)(?: \((?P<cit>[^)]*)\))?\.?$')
def reescreve(t):
    m = FIM.match(t.strip())
    if not m or not m.group('rem').strip(): return t
    st = m.group('st'); rem = m.group('rem').strip().rstrip(',;')
    cit = m.group('cit')
    if cit and cit not in rem and re.match(r'(?i)(art|arts|§|súmula|sv)', cit): rem += f' ({cit})'
    return f'{st} está errado: {rem}.'
def main():
    ent, sai = sys.argv[1:3]; txt = open(ent, encoding='utf-8').read(); n = 0
    def troca(m):
        nonlocal n
        out = []
        for l in m.group(2).strip().split('\n'):
            mm = LETRAS.match(l)
            if not mm: out.append(l); continue
            letras = re.findall(r'[A-E]', mm.group(1)); t = reescreve(mm.group(2))
            if t != mm.group(2): n += len(letras)
            out += [f'- Letra {L}: {t}' for L in letras]
        return m.group(1) + '\n'.join(out) + '\n'
    open(sai, 'w', encoding='utf-8').write(re.sub(r'(?m)^(⚠️ ERROS\n)((?:- .*\n?)+)', troca, txt)); print('linhas de ERROS reescritas com motivo:', n)
main()
