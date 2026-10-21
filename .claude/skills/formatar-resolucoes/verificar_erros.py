#!/usr/bin/env python3
"""Confere os blocos ⚠️ ERROS: (a) uma letra por linha, no formato `Letra X: Errada;|Certa; motivo`; (b) nenhuma informação repetida: cláusula (texto entre ';') que apareça em 2+ letras do bloco ou que repita o 📌 (≥80% das palavras de conteúdo).
Uso: python3 verificar_erros.py <lista.md>   (sai com código 1 se houver problema)"""
import re, sys, unicodedata
def toks(t):
    t = unicodedata.normalize('NFD', t.lower()); t = ''.join(c for c in t if unicodedata.category(c) != 'Mn'); return {w for w in re.findall(r'[a-z0-9]{4,}', t)}
def jac(a, b): return len(a & b) / max(1, min(len(a), len(b)))
def main():
    bl = re.split(r'(?m)^## QUESTÃO \d+\s*$', open(sys.argv[1], encoding='utf-8').read())[1:]; probs = []; blocos = 0
    for i, b in enumerate(bl):
        m = re.search(r'(?m)^⚠️ ERROS\n((?:- .*\n?)+)', b)
        if not m: continue
        blocos += 1; linhas = m.group(1).strip().split('\n'); pi = re.search(r'(?m)^📌 (.*)$', b); P = toks(pi.group(1)) if pi else set(); cl = []
        for l in linhas:
            mm = re.match(r'^- Letra ([A-E]): (Errada|Certa); (.+)$', l)
            if not mm: probs.append(f'#{i} linha fora do formato "Letra X: Errada; motivo": {l[:70]!r}'); cl.append([]); continue
            cl.append([c.strip() for c in mm.group(3).split(';') if c.strip()])
        for a, x in enumerate(cl):
            for c in x:
                tc = toks(c)
                if len(tc) < 3: continue
                if any(jac(tc, toks(c2)) >= 0.8 for y, z in enumerate(cl) if y != a for c2 in z): probs.append(f'#{i} informação repetida entre letras: {c[:70]!r}'); break
                if P and jac(tc, P) >= 0.8: probs.append(f'#{i} repete o 📌: {c[:70]!r}'); break
    print(f'ERROS: {blocos} blocos verificados;', 'OK' if not probs else f'{len(probs)} problema(s)')
    for p in probs[:40]: print(' -', p)
    sys.exit(1 if probs else 0)
main()
