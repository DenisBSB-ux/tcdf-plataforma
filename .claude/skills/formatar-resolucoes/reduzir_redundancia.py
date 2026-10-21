#!/usr/bin/env python3
"""Tira da ### Resolução as linhas que só repetem o 📌 (essência): 💡, 🪤, ⚠️ e linhas do bloco ⚠️ ERROS sem termo riscado.
Uso: python3 reduzir_redundancia.py <entrada.md> <saida.md> [--limiar 0.7] [--so-relatorio]
Critério: fração das palavras de conteúdo da linha (≥4 letras, sem acento, sem stopwords) que já aparecem no 📌.
Linhas com ~~termo riscado~~ (contraste certo × errado) são sempre mantidas."""
import re, sys, unicodedata
STOP = set('para como mais pela pelo pelas pelos entre sobre desde ate apos sem com uma umas uns dos das nas nos esta este estas estes essa esse isso aquele aquela seus suas sera serao deve devem pode podem quando onde cujo cuja qual quais porque pois assim tambem ainda apenas somente so'.split())
def toks(t):
    t = unicodedata.normalize('NFD', t.lower()); t = ''.join(c for c in t if unicodedata.category(c) != 'Mn')
    t = re.sub(r'[*=~_`]', '', t)
    return {w for w in re.findall(r'[a-z0-9]{4,}', t) if w not in STOP}
def overlap(x, ref):
    a = toks(x)
    return (len(a & ref) / len(a)) if a else 0.0
def main():
    ent, sai = sys.argv[1], sys.argv[2]
    lim = float(sys.argv[sys.argv.index('--limiar') + 1]) if '--limiar' in sys.argv else 0.7
    txt = open(ent, encoding='utf-8').read()
    partes = re.split(r'(?m)^(## QUESTÃO \d+\s*$)', txt); out = [partes[0]]; cont = {'💡': 0, '🪤': 0, '⚠️': 0, 'ERROS': 0}; blocos_erros = 0
    for k in range(1, len(partes), 2):
        cab, b = partes[k], partes[k + 1]
        m = re.search(r'(?ms)^### Resolução\n(.*?)(?=\n---|\Z)', b)
        if m:
            linhas = m.group(1).split('\n'); ess = next((l for l in linhas if l.lstrip().startswith('📌')), '')
            ref = toks(re.sub(r'^\s*📌', '', ess)); novas = []; em_erros = False
            for l in linhas:
                s = l.strip()
                if s.startswith('⚠️ ERROS') or s.startswith('⚠ ERROS'): em_erros = True; novas.append(l); continue
                if em_erros and s.startswith('- '):
                    corpo = re.sub(r'^-\s*Letras?\s+[A-E](?:(?:,| e) [A-E])*\s*:\s*', '', s)
                    if '~~' not in s and ref and overlap(corpo, ref) >= lim: cont['ERROS'] += 1; continue
                    novas.append(l); continue
                em_erros = False if s else em_erros
                if s[:1] in ('💡', '🪤') or s.startswith('⚠️'):
                    simb = '⚠️' if s.startswith('⚠️') else s[:1]
                    if ref and '~~' not in s and overlap(re.sub(r'^\S+\s*', '', s), ref) >= lim: cont[simb] += 1; continue
                novas.append(l)
            # cabeçalho ERROS sem linhas depois dele
            fin = []
            for i, l in enumerate(novas):
                if l.strip().startswith('⚠️ ERROS') and not (i + 1 < len(novas) and novas[i + 1].strip().startswith('- ')): blocos_erros += 1; continue
                fin.append(l)
            b = b[:m.start(1)] + '\n'.join(fin) + b[m.end(1):]
        out += [cab, b]
    if '--so-relatorio' not in sys.argv: open(sai, 'w', encoding='utf-8').write(''.join(out))
    print(f"linhas removidas por redundância com o 📌 (limiar {lim}): 💡 {cont['💡']} · 🪤 {cont['🪤']} · ⚠️ {cont['⚠️']} · linhas de ERROS {cont['ERROS']} · blocos ERROS esvaziados {blocos_erros}")
main()
