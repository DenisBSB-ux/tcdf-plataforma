#!/usr/bin/env python3
"""Confere o arquivo final de uma matéria contra o original.

Uso: python3 verificar_resolucoes.py <original.md> <final.md> [--gabaritos-alterados 3,17,...]

Verifica:
  1. mesmo número de questões e mesmos IDs, na mesma ordem;
  2. enunciados idênticos; gabaritos idênticos (exceto os índices declarados em --gabaritos-alterados);
  3. o arquivo, sem as seções Resolução/Resumo Flash e sem os campos Artigo/Sinal/Armadilha/Trecho/Explicação/
     Origem da classificação, é idêntico ao original (só as adições declaradas passam);
  4. cada linha da resolução começa por símbolo (⚖️ 📌 🔑 ⚠️ 🪤 💡), na ordem fixa, sem 🏷️, com ** balanceado;
  5. nenhuma resolução repete o gabarito; nenhum ### Resumo Flash no final.
Saída: lista de problemas; código de saída 1 se houver algum.
"""
import re, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from montar_resolucoes import ler

ORDEM = ['⚖', '📌', '🔑', '⚠', '🪤', '💡']
CAMPOS_ADICIONAIS = ('Artigo', 'Sinal', 'Armadilha', 'Trecho', 'Explicação', 'Origem da classificação')


def mascara(txt):
    txt = re.sub(r'(?ms)^### Resolução\n.*?(?=\n---|\n### |\Z)', '### Resolução\n', txt)
    txt = re.sub(r'(?ms)^### Resumo Flash\n.*?(?=\n---|\Z)', '', txt)
    for c in CAMPOS_ADICIONAIS:
        txt = re.sub(r'(?m)^\*\*' + c + r':\*\*.*\n', '', txt)
    return re.sub(r'\n{3,}', '\n\n', txt).strip()


def main():
    if len(sys.argv) < 3:
        print(__doc__); sys.exit(2)
    ori, fin = sys.argv[1], sys.argv[2]
    alt = set()
    if '--gabaritos-alterados' in sys.argv:
        alt = {int(x) for x in sys.argv[sys.argv.index('--gabaritos-alterados') + 1].split(',') if x}
    to, _, Qo = ler(ori); tf, _, Qf = ler(fin); erros = []
    if len(Qo) != len(Qf):
        erros.append(f'nº de questões: original {len(Qo)} × final {len(Qf)}')
    for i, (o, f) in enumerate(zip(Qo, Qf)):
        if o['id'] != f['id']: erros.append(f'#{i} ID diferente: {o["id"]} × {f["id"]}')
        if o['enun'] != f['enun']: erros.append(f'#{i} enunciado alterado ({f["id"]})')
        if o['gab'] != f['gab'] and i not in alt:
            erros.append(f'#{i} GABARITO alterado sem declaração: {o["gab"]} → {f["gab"]} ({f["id"]})')
        linhas = [l for l in f['res'].split('\n') if l.strip()]
        if not linhas:
            erros.append(f'#{i} resolução vazia'); continue
        pos = -1
        for l in linhas:
            s = l.strip()
            if s.startswith('- ') or s.startswith('⚠️ ERROS'): continue   # bloco ERROS (múltipla escolha)
            if s.startswith('🏷'):
                erros.append(f'#{i} tem linha 🏷️ (perfil não entra)'); continue
            k = next((j for j, sim in enumerate(ORDEM) if s.startswith(sim)), None)
            if k is None:
                erros.append(f'#{i} linha sem símbolo: {s[:50]!r}'); continue
            if k <= pos: erros.append(f'#{i} ordem dos símbolos fora do padrão')
            pos = k
        if f['res'].count('**') % 2 or f['res'].count('==') % 2: erros.append(f'#{i} marcação (** ou ==) desbalanceada')
        for l in linhas:
            if l.strip().startswith('📌') and l.count('**') > 4: erros.append(f'#{i} negrito demais no 📌')
        if re.search(r'(?i)gabarito:\s*(certo|errado)|o item (est[aá]|é) (certo|errado)', f['res']):
            erros.append(f'#{i} resolução repete o gabarito')
    if re.search(r'(?m)^### Resumo Flash', tf): erros.append('arquivo final ainda contém ### Resumo Flash')
    if mascara(to) != mascara(tf): erros.append('fora da Resolução/campos declarados o arquivo difere do original')
    print(f'{len(Qf)} questões verificadas;', 'OK' if not erros else f'{len(erros)} problema(s)')
    for e in erros: print(' -', e)
    sys.exit(1 if erros else 0)


if __name__ == '__main__':
    main()
