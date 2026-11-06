#!/usr/bin/env python3
"""Padroniza as resoluções de uma lista enviada pelo usuário usando uma cópia já no padrão (casando pelo ENUNCIADO COMPLETO).
Uso: padronizar_lista.py <lista_do_usuario.md> <copia_no_padrao.md> <saida.md> [--renumerar]
- Só a seção '### Resolução' muda, e só nas questões que ainda não têm a linha 📌; ID, enunciado, gabarito e metadados ficam como estão.
- Remove '### Resumo Flash' (decisão fixa do projeto) e, com --renumerar, numera os cabeçalhos de 1 a N (os IDs não mudam).
- Questões sem par na cópia e sem 📌 são listadas no fim: precisam de resolução nova (pipeline de formatar-resolucoes).
Depois: preencher_artigo.py, verificar_resolucoes.py e verificar_importador.js (ver formatar-resolucoes)."""
import re, sys, unicodedata
def norm(s):
    s = unicodedata.normalize('NFD', (s or '').lower()); s = ''.join(c for c in s if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+', '', s)
def enun(b):
    x = b.split('### Enunciado', 1)[1] if '### Enunciado' in b else ''
    return norm(re.split(r'\n\*\*Gabarito', x)[0])
def blocos(t):
    p = re.split(r'(?m)^(?=## QUESTÃO )', t); return p[0], p[1:]
def resolucao(b):
    return b.split('### Resolução', 1)[1] if '### Resolução' in b else ''
def main():
    a = [x for x in sys.argv[1:] if not x.startswith('--')]; renum = '--renumerar' in sys.argv
    up = open(a[0], encoding='utf8').read(); cp = open(a[1], encoding='utf8').read()
    head, ub = blocos(up); _, cb = blocos(cp)
    mapa = {}
    for b in cb: mapa.setdefault(enun(b), b)
    out = []; st = {'ja_padrao': 0, 'da_copia': 0, 'sem_par': []}
    for i, b in enumerate(ub, 1):
        n = re.match(r'## QUESTÃO (\d+)', b).group(1)
        if re.search(r'(?m)^📌', b): st['ja_padrao'] += 1
        else:
            m = mapa.get(enun(b))
            if not m: st['sem_par'].append(n); out.append(b); continue
            r = resolucao(m).split('\n---')[0]
            r = re.sub(r'\n### Resumo Flash.*', '', r, flags=re.S).strip('\n') + '\n'
            b = b.split('### Resolução', 1)[0] + '### Resolução\n' + r.lstrip('\n') + '\n---\n\n'; st['da_copia'] += 1
        b = re.sub(r'\n### Resumo Flash.*?(?=\n---)', '', b, flags=re.S)
        if renum: b = re.sub(r'^## QUESTÃO \d+', '## QUESTÃO %d' % i, b, count=1)
        out.append(b)
    open(a[2], 'w', encoding='utf8').write(head + ''.join(out))
    print(st)
main()
