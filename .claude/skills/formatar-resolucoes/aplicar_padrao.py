#!/usr/bin/env python3
"""Aplica o padrão final a uma lista preparada.
Uso: python3 aplicar_padrao.py <base.md> <respostas.py> <saida.md>
Faz: Trecho + Correção nos itens errados; Trecho (palavras-chave) nos certos; ERROS objetivo (sem repetição) nas múltipla escolha
(cria o bloco ERROS se a questão ainda não tiver). Item sem Sinal/Armadilha recebe o Trecho no fim do cabeçalho e é listado para classificar.
Valida: trecho literal e único no enunciado, mesmo nº de partes, letras de ERROS conferem. Sai com código 1 se houver problema."""
import re, sys, os
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from preparar_lista import blocos, enun, gab, sugestao_chaves
from dedup_erros import processa

def no_cabecalho(q, linhas):
    """insere as linhas no fim do cabeçalho (antes de ### Enunciado)"""
    return re.sub(r'\n\n### Enunciado', lambda m: '\n' + linhas + '\n\n### Enunciado', q, count=1)

def main():
    base, resp, saida = sys.argv[1:4]
    ns = {}; exec(open(resp, encoding='utf-8').read(), ns); E, C, M = ns.get('E', {}), ns.get('C', {}), ns.get('M', {})
    head, Q = blocos(open(base, encoding='utf-8').read()); erros = []; avisos = []
    for n, q in enumerate(Q, 1):
        g = gab(q); e = enun(q)
        if g == 'Errado':
            if n not in E: erros.append((n, 'falta E')); continue
            tr, co = E[n]; pt, pc = tr.split(' | '), co.split(' | ')
            if len(pt) != len(pc): erros.append((n, 'partes diferentes')); continue
            bad = [p for p in pt if e.count(p) != 1]
            if bad: erros.append((n, 'trecho não literal/único', bad)); continue
            if any(not c.strip() for c in pc) or tr == co: erros.append((n, 'correção vazia/igual')); continue
            novo = '**Trecho:** %s\n**Correção:** %s' % (tr, co)
            if re.search(r'(?m)^\*\*Trecho:\*\* ', q):
                q = re.sub(r'(?m)^\*\*Trecho:\*\* .*\n(?:\*\*Correção:\*\* .*\n)?', lambda m: novo + '\n', q, count=1)
            elif re.search(r'(?m)^\*\*Armadilha:\*\* ', q):
                q = re.sub(r'(?m)^(\*\*Armadilha:\*\* .*)$', lambda m: m.group(1) + '\n' + novo, q, count=1)
            else:
                q = no_cabecalho(q, novo); avisos.append(n)
        elif g == 'Certo':
            k = C.get(n) or sugestao_chaves(q)
            if not k: erros.append((n, 'sem palavras-chave')); continue
            if any(e.count(p) < 1 for p in k): erros.append((n, 'chave ausente', k)); continue
            linha = '**Trecho:** ' + ' | '.join(k)
            if re.search(r'(?m)^\*\*Trecho:\*\* ', q):
                q = re.sub(r'(?m)^\*\*Trecho:\*\* .*$', lambda m: linha, q, count=1)
            elif re.search(r'(?m)^\*\*Sinal:\*\* ', q):
                q = re.sub(r'(?m)^(\*\*Sinal:\*\* .*)$', lambda m: m.group(1) + '\n' + linha, q, count=1)
            else:
                q = no_cabecalho(q, linha); avisos.append(n)
        elif len(g) == 1 and g in 'ABCDE':
            alts = re.findall(r'(?m)^- \*\*([A-E])\)\*\*', q)
            tem = '⚠️ ERROS' in q
            if tem: esperadas = sorted({L for m in re.findall(r'(?m)^- Letras? ([A-E](?:(?:, | e )[A-E])*):', q) for L in re.findall(r'[A-E]', m)})
            else: esperadas = sorted(L for L in set(alts) if L != g)
            d = M.get(n)
            if not d: erros.append((n, 'falta M')); continue
            if set(d) != set(esperadas): erros.append((n, 'letras', esperadas, sorted(d))); continue
            d = {L: re.sub(r'(?<=[ ,])([a-e])(?=\)[\s.;,)]|\)$)', r'"\1"', t) for L, t in d.items()}   # "a)" no meio do texto vira alínea entre aspas (o leitor trataria como alternativa)
            corpo = '\n'.join('- Letra %s: %s' % (L, d[L]) for L in sorted(d)) + '\n'
            if tem:
                q = re.sub(r'(?m)^- Letras? [A-E](?:(?:, | e )[A-E])*: .*\n?', '', q)
                q = re.sub(r'(?m)^⚠️ ERROS\n', lambda m: '⚠️ ERROS\n' + corpo, q, count=1)
            else:
                bloco = '⚠️ ERROS\n' + corpo
                if re.search(r'(?m)^💡', q): q = re.sub(r'(?m)^💡', lambda m: bloco + '💡', q, count=1)
                else: q = re.sub(r'(?m)^(---\s*)$', lambda m: bloco + m.group(1), q, count=1) if re.search(r'(?m)^---\s*$', q) else q.rstrip('\n') + '\n' + bloco
            q = processa(q)
        Q[n-1] = q
    for x in erros: print('PROBLEMA', x)
    if avisos: print('SEM CLASSIFICAÇÃO (propor ao usuário):', avisos)
    open(saida, 'w', encoding='utf-8').write(head + '\n' + '\n'.join(Q))
    print('itens:', len(Q), '| problemas:', len(erros)); sys.exit(1 if erros else 0)
if __name__ == '__main__':
    main()
