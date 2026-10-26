#!/usr/bin/env python3
"""Deixa cada linha do bloco ⚠️ ERROS no formato do usuário (21/10/2026):  `- Letra B: Errada; <motivo: fato correto + dispositivo>.`  (UMA letra por linha, SEM reescrever a alternativa errada).
Faz: (1) separa "Letras A, B e C: ..." em uma linha por letra; (2) "~~x~~ está errado: M" -> "Errada; M"; "~~x~~ está certo: M" -> "Certa; M"; "<correto>, ~~errado~~ (art.)" -> "Errada; <correto> (art.)";
(3) em qualquer outra linha, tira as marcas ~~ ~~ (mantém o texto) e põe o prefixo "Errada;". Linhas já em "Errada;/Certa;" ficam como estão.
Uso: python3 motivar_erros.py <entrada.md> <saida.md>"""
import re, sys
LETRAS = re.compile(r'^- Letras? ([A-E](?:(?:, | e )[A-E])*): (.*)$')
ST = r'~~.+?~~(?:(?:,| e) ?~~.+?~~)*'
def reescreve(t):
    t = t.strip()
    if re.match(r'(Errada|Certa);', t): return t
    m = re.match(r'^' + ST + r' está (errado|certo): (.*)$', t)
    if m: return ('Errada; ' if m.group(1) == 'errado' else 'Certa; ') + m.group(2)
    m = re.match(r'^(?P<rem>.*?),? ' + ST + r'(?: \((?P<cit>[^)]*)\))?\.?$', t)
    if m and m.group('rem').strip():
        rem = m.group('rem').strip().rstrip(',;'); cit = m.group('cit')
        if cit and cit not in rem and re.match(r'(?i)(art|arts|§|súmula|sv)', cit): rem += f' ({cit})'
        return 'Errada; ' + rem + '.'
    return 'Errada; ' + re.sub(r'~~(.+?)~~', r'\1', t)
def main():
    ent, sai = sys.argv[1:3]; txt = open(ent, encoding='utf-8').read(); n = 0
    def troca(m):
        nonlocal n
        out = []
        for l in m.group(2).strip().split('\n'):
            mm = LETRAS.match(l)
            if not mm: out.append(l); continue
            t = reescreve(mm.group(2)); n += 1
            out += [f'- Letra {L}: {t}' for L in re.findall(r'[A-E]', mm.group(1))]
        return m.group(1) + '\n'.join(out) + '\n'
    open(sai, 'w', encoding='utf-8').write(re.sub(r'(?<!\n)\n---', '\n\n---', re.sub(r'(?m)^(⚠️ ERROS\n)((?:- .*\n?)+)', troca, txt))); print('linhas de ERROS no formato "Errada; motivo":', n)
main()
