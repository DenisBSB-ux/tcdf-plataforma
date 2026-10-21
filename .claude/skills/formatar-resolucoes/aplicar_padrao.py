#!/usr/bin/env python3
"""Aplica o padrão final a uma lista preparada.
Uso: python3 aplicar_padrao.py <base.md> <respostas.py> <saida.md>
Faz: Trecho + Correção nos itens errados; Trecho (palavras-chave) nos certos; ERROS objetivo (sem repetição) nas múltipla escolha.
Valida: trecho literal e único no enunciado, mesmo nº de partes, letras de ERROS conferem. Sai com código 1 se houver problema."""
import re, sys, os, collections
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from preparar_lista import blocos, enun, gab, sugestao_chaves
from dedup_erros import processa

def main():
    base, resp, saida = sys.argv[1:4]
    ns = {}; exec(open(resp, encoding='utf-8').read(), ns); E, C, M = ns.get('E', {}), ns.get('C', {}), ns.get('M', {})
    head, Q = blocos(open(base, encoding='utf-8').read()); erros = []
    for n, q in enumerate(Q, 1):
        g = gab(q); e = enun(q)
        if g == 'Errado':
            if n not in E: erros.append((n, 'falta E')); continue
            tr, co = E[n]
            pt, pc = tr.split(' | '), co.split(' | ')
            if len(pt) != len(pc): erros.append((n, 'partes diferentes')); continue
            bad = [p for p in pt if e.count(p) != 1]
            if bad: erros.append((n, 'trecho não literal/único', bad)); continue
            if any(not c.strip() for c in pc) or tr == co: erros.append((n, 'correção vazia/igual')); continue
            novo = '**Trecho:** %s\n**Correção:** %s' % (tr, co)
            if re.search(r'(?m)^\*\*Trecho:\*\* .*$', q): q = re.sub(r'(?m)^\*\*Trecho:\*\* .*\n?(\*\*Correção:\*\* .*\n?)?', lambda m: novo + '\n', q, count=1)
            else:
                q, c = re.subn(r'(?m)^(\*\*Armadilha:\*\* .*)$', lambda m: m.group(1) + '\n' + novo, q, count=1)
                if not c: erros.append((n, 'sem Armadilha (classificar antes)')); continue
        elif g == 'Certo':
            k = C.get(n) or sugestao_chaves(q)
            if not k: erros.append((n, 'sem palavras-chave')); continue
            if any(e.count(p) < 1 for p in k): erros.append((n, 'chave ausente', k)); continue
            linha = '**Trecho:** ' + ' | '.join(k)
            if re.search(r'(?m)^\*\*Trecho:\*\* .*$', q): q = re.sub(r'(?m)^\*\*Trecho:\*\* .*$', lambda m: linha, q, count=1)
            else:
                q, c = re.subn(r'(?m)^(\*\*Sinal:\*\* .*)$', lambda m: m.group(1) + '\n' + linha, q, count=1)
                if not c: erros.append((n, 'sem Sinal (classificar antes)')); continue
        elif len(g) == 1 and g in 'ABCDE' and '⚠️ ERROS' in q:
            letras = re.findall(r'(?m)^- Letra ([A-E]):', q)
            d = M.get(n)
            if not d: erros.append((n, 'falta M')); continue
            if set(d) != set(letras): erros.append((n, 'letras', sorted(letras), sorted(d))); continue
            for L, txt in d.items(): q = re.sub(r'(?m)^- Letra %s: .*$' % L, lambda m: '- Letra %s: %s' % (L, txt), q)
            q = processa(q)
        Q[n-1] = q
    for x in erros: print('PROBLEMA', x)
    open(saida, 'w', encoding='utf-8').write(head + '\n' + '\n'.join(Q))
    print('itens:', len(Q), '| problemas:', len(erros)); sys.exit(1 if erros else 0)
if __name__ == "__main__":
    main()
