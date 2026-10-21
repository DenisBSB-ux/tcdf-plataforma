#!/usr/bin/env python3
"""Troca o bloco ⚠️ ERROS das questões de múltipla escolha por linhas POR ALTERNATIVA (correção + termo errado riscado).
Uso: python3 aplicar_erros.py <final.md> <erros.py> <saida.md>
erros.py define  E = { idx: {'A': 'o certo, ~~o errado da alternativa~~.', ...}, ... }   (idx = posição 0-based da questão)
UMA letra por linha, cada uma com a sua motivação. O bloco vai antes do 💡 (ou no fim da resolução)."""
import re, sys
def junta(ls): return ls[0] if len(ls) == 1 else ', '.join(ls[:-1]) + ' e ' + ls[-1]
def main():
    ent, errs, sai = sys.argv[1:4]; ns = {}; exec(open(errs, encoding='utf-8').read(), ns); E = ns['E']
    txt = open(ent, encoding='utf-8').read(); partes = re.split(r'(?m)^(## QUESTÃO \d+\s*$)', txt); out = [partes[0]]; n = 0
    for i, k in enumerate(range(1, len(partes), 2)):
        cab, b = partes[k], partes[k + 1]
        if i in E:
            g = re.search(r'\*\*Gabarito:\*\*\s*(\S+)', b).group(1).strip().upper()
            falt = [L for L in 'ABCDE' if L in E[i]]   # vale o que o erros.py traz (o arquivo pode ter alternativa espúria vinda do importador)
            assert g not in E[i] and falt, (i, g, sorted(E[i]))
            faltam = [L for L in 'ABCDE' if re.search(r'(?m)^- \*\*' + L + r'\)\*\*', b) and L != g and L not in E[i]]
            if faltam: print(f'aviso: questão {i}: sem linha para as letras {faltam}')
            bloco = '⚠️ ERROS\n' + ''.join(f"- Letra {L}: {E[i][L].strip()}\n" for L in falt)   # UMA letra por linha (pedido do usuário, 21/10/2026)
            b = re.sub(r'(?m)^⚠️ ERROS\n(?:- .*\n?)*', '', b)                      # tira o bloco antigo
            m = re.search(r'(?m)^💡 .*$', b)
            if m: b = b[:m.start()] + bloco + b[m.start():]
            else:
                m = re.search(r'(?ms)^### Resolução\n.*?(?=\n---|\Z)', b); fim = m.end()
                b = b[:fim].rstrip('\n') + '\n' + bloco + b[fim:].lstrip('\n') if b[fim:].strip() else b[:fim].rstrip('\n') + '\n' + bloco
            b = re.sub(r'(?<!\n)\n---', '\n\n---', b)   # mantém a linha em branco antes do separador
            n += 1
        out += [cab, b]
    open(sai, 'w', encoding='utf-8').write(''.join(out)); print('questões com ERROS por letra:', n)
main()
