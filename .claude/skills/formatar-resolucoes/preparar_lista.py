#!/usr/bin/env python3
"""Prepara uma lista para o PADRÃO FINAL (passos 24 a 41 da skill) e gera a tarefa de redação.

Uso: python3 preparar_lista.py <lista.md> <pasta_saida>

Gera em <pasta_saida>:
  base.md      lista limpa: sem ID, sem Explicação, sem Ano redundante, sem "Fonte:" / "Atualização verificada" / "texto não carregado"
  tarefas.md   o que precisa ser escrito à mão (itens errados, itens certos sem sugestão, múltipla escolha)
  modelo_respostas.py  esqueleto do arquivo de respostas (E, C, M) para preencher
Depois: python3 aplicar_padrao.py <pasta_saida>/base.md <pasta_saida>/respostas.py <saida.md>
"""
import re, sys, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from limpar_fontes import limpa
from chaves_auto import acha

def blocos(t):
    p = re.split(r'\n(?=## QUESTÃO )', t); return p[0], p[1:]
def enun(q): return re.sub(r'\s+', ' ', re.search(r'### Enunciado\n(.*?)\n(?:### Alternativas|\n\*\*Gabarito)', q, re.S).group(1)).strip()
def gab(q): return re.search(r'\*\*Gabarito:\*\*\s*(\S+)', q).group(1)
def res(q): return q.split('### Resolução')[1] if '### Resolução' in q else ''
def sugestao_chaves(q):
    e = enun(q); r = res(q)
    m = re.search(r'^📌 (.*)', r, re.M); p = m.group(1) if m else ''
    k = re.search(r'^🔑 (.*)', r, re.M); k = k.group(1) if k else ''
    out = []
    def add(c):
        t = acha(e, re.sub(r'[*=]', '', c))
        if t and t not in out and not any(t in o or o in t for o in out): out.append(t)
    for x in re.findall(r'==(.+?)==', p): add(x)
    for x in re.findall(r'\*\*(.+?)\*\*', p): add(x)
    if not out:
        for x in k.split('·'): add(x.strip())
        out = out[:2]
    return out[:3]

def main():
    src, pasta = sys.argv[1], sys.argv[2]; os.makedirs(pasta, exist_ok=True)
    t = open(src, encoding='utf-8').read()
    tmp = os.path.join(pasta, '_tmp.md')
    subprocess.run([sys.executable, os.path.join(HERE, 'montar_resolucoes.py'), 'limpar', src, tmp], check=True, stdout=subprocess.DEVNULL)
    t = open(tmp, encoding='utf-8').read(); os.remove(tmp)
    t, _ = limpa(t)
    t = re.sub(r'(?m)^⚠️ (?:Súmula \d+ do STJ|ADI \d+ \(STF\) e Súmula \d+ do STJ|Base n[ao] [^\n]*não[^\n]*carregad[^\n]*|Texto oficial não conferido)\.?\n', '', t)
    t = re.sub(r'(?m)^(- Letra [A-E]: .*?)(?: \([^()]*(?:não conferid|não carregad)[^()]*\))', r'\1', t)
    open(os.path.join(pasta, 'base.md'), 'w', encoding='utf-8').write(t)
    head, Q = blocos(t)
    out = ['# Tarefas de redação (uma por item; escrever no respostas.py)\n']
    ce_err, ce_certo, mc = [], [], []
    for n, q in enumerate(Q, 1):
        g = gab(q)
        if g == 'Errado': ce_err.append(n)
        elif g == 'Certo': ce_certo.append(n)
        elif len(g) == 1 and g in 'ABCDE': mc.append(n)
    out.append('## E: itens ERRADOS (Trecho literal e único no enunciado + Correção)\n')
    for n in ce_err:
        q = Q[n-1]; r = res(q); p = re.search(r'^📌 (.*)', r, re.M); tr = re.search(r'^\*\*Trecho:\*\* (.*)', q, re.M)
        out.append(f'E{n}: {enun(q)}\n   TRECHO_ATUAL: {tr.group(1) if tr else "-"}\n   📌 {p.group(1) if p else "-"}\n')
    out.append('\n## C: itens CERTOS (palavras-chave que determinam a resposta; sugestão automática)\n')
    sem = []
    for n in ce_certo:
        q = Q[n-1]; s = sugestao_chaves(q)
        if not s: sem.append(n)
        out.append(f'C{n}: {enun(q)[:300]}\n   SUGESTAO: {s}\n')
    out.append('\n## M: MÚLTIPLA ESCOLHA (uma linha por letra errada)\n')
    for n in mc:
        q = Q[n-1]
        alts = re.findall(r'^- \*\*([A-E])\)\*\*\s*(.*)', q, re.M)
        erros = re.findall(r'^- Letras? .*', q, re.M)
        out.append(f'M{n} (gab {gab(q)}): {enun(q)[:300]}')
        for L, x in alts: out.append(f'   {L}) {x[:200]}')
        out.append('   ERROS_ATUAIS:'); out += ['     ' + e for e in erros]
        errad = [L for L, _ in alts if L != gab(q)]
        out.append('   LETRAS_QUE_PRECISAM_DE_LINHA: ' + ', '.join(errad) + ('' if erros else '  (a questão ainda não tem bloco ERROS: escreva todas)')); out.append('')
    open(os.path.join(pasta, 'tarefas.md'), 'w', encoding='utf-8').write('\n'.join(out))
    open(os.path.join(pasta, 'modelo_respostas.py'), 'w', encoding='utf-8').write(
        "# E = { nº: ('trecho literal e único no enunciado', 'palavra ou expressão que torna o item certo') }  (use ' | ' para várias partes, mesmo nº de partes)\nE = {}\n"
        "# C = { nº: ['palavra-chave literal', ...] }  só para sobrescrever a sugestão automática (ou quando não há sugestão)\nC = {}\n"
        "# M = { nº: { 'B': 'afirmação correta, ~~termo errado~~ (dispositivo).', ... } }  uma entrada por letra errada\nM = {}\n")
    print(f'itens errados: {len(ce_err)} | certos: {len(ce_certo)} (sem sugestão: {sem}) | MC: {len(mc)}')
if __name__ == "__main__":
    main()
