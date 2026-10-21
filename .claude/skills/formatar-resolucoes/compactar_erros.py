#!/usr/bin/env python3
"""No bloco ⚠️ ERROS, linhas de letras diferentes que só mudam o trecho ~~riscado~~ (o resto do texto é igual) viram UMA linha:
'- Letras A, B e C: <frase certa>. Erros — letra A: ~~x~~; letra B: ~~y~~; letra C: ~~z~~.' (sem ")" depois da letra: o leitor trataria como lista alfabética)
Uso: python3 compactar_erros.py <entrada.md> <saida.md>"""
import re, sys
def junta(ls): return ls[0] if len(ls) == 1 else ', '.join(ls[:-1]) + ' e ' + ls[-1]
def nucleo(t):
    n = re.sub(r'\s+', ' ', re.sub(r',? ?~~.+?~~', '', t)).replace(' .', '.').strip()
    m = re.search(r'\s*\((art\. [^)]+)\)\.?$', n)          # "(art. 3º)" no fim, se o artigo já está dito na frase: não repete
    if m and m.group(1) in n[:m.start()]: n = n[:m.start()] + '.'
    return n
def main():
    ent, sai = sys.argv[1:3]; txt = open(ent, encoding='utf-8').read(); n = 0
    def troca(m):
        nonlocal n
        linhas = [re.match(r'- Letra ([A-E]): (.*)', l).groups() for l in m.group(2).strip().split('\n') if re.match(r'- Letra ([A-E]): ', l)]
        if len(linhas) != len(m.group(2).strip().split('\n')): return m.group(0)       # só linhas de uma letra
        grupos = {}
        for L, t in linhas: grupos.setdefault(nucleo(t) if '~~' in t else None, []).append((L, t))
        saida = []
        for nuc, itens in grupos.items():
            if nuc is None or len(itens) < 2:
                saida += [f'- Letra {L}: {t}' for L, t in itens]; continue
            erros = []
            for L, t in itens:
                riscados = re.findall(r'~~(.+?)~~', t)
                erros.append(f'letra {L}: ' + ' e '.join(f'~~{r}~~' for r in riscados))
            fim = '.' if not nuc.endswith('.') else ''
            saida.append(f"- Letras {junta([L for L, _ in itens])}: {nuc}{fim} Erros — " + '; '.join(erros) + '.'); n += 1
        return m.group(1) + '\n'.join(saida) + '\n'
    out = re.sub(r'(?m)^(⚠️ ERROS\n)((?:- .*\n?)+)', troca, txt)
    open(sai, 'w', encoding='utf-8').write(out); print('blocos compactados:', n)
main()
