#!/usr/bin/env python3
"""Tira da linha 🔑 os termos que não aparecem no enunciado, nas alternativas nem no 📌 (rótulos abstratos como "generalização", "inversão", "negação absoluta"). Mantém sempre pelo menos 1 termo.
Uso: python3 limpar_chaves.py <entrada.md> <saida.md>"""
import re, sys, unicodedata
def norm(s):
    s = unicodedata.normalize('NFD', s.lower()); s = ''.join(c for c in s if unicodedata.category(c) != 'Mn'); return re.sub(r'[^a-z0-9 ]+', ' ', s)
def main():
    ent, sai = sys.argv[1:3]; partes = re.split(r'(?m)^(## QUESTÃO \d+\s*$)', open(ent, encoding='utf-8').read()); out = [partes[0]]; n = 0
    for k in range(1, len(partes), 2):
        cab, b = partes[k], partes[k + 1]
        m = re.search(r'(?m)^🔑 (.*)$', b)
        if m:
            en = re.search(r'### Enunciado\n(.*?)\n\*\*Gabarito', b, re.S); alts = re.findall(r'(?m)^- \*\*[A-E]\)\*\* (.*)$', b); pi = re.search(r'(?m)^📌 (.*)$', b)
            ref = norm((en.group(1) if en else '') + ' ' + ' '.join(alts) + ' ' + (pi.group(1) if pi else ''))
            termos = [x.strip() for x in m.group(1).split('·') if x.strip()]
            bons = [t for t in termos if not [w for w in norm(t).split() if len(w) >= 4] or any(w in ref for w in norm(t).split() if len(w) >= 4)]
            if bons and len(bons) < len(termos):
                b = b[:m.start()] + '🔑 ' + ' · '.join(bons) + b[m.end():]; n += len(termos) - len(bons)
        out += [cab, b]
    open(sai, 'w', encoding='utf-8').write(''.join(out)); print('termos 🔑 removidos (sem relação com a questão):', n)
main()
