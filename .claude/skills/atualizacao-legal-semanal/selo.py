#!/usr/bin/env python3
"""selo.py — atualiza o selo ⚖️ de UMA matéria por vez, só com conferência real (proíbe troca de data em massa).
Uso: python3 .claude/skills/atualizacao-legal-semanal/selo.py "<trecho do nome ou regex do selo>" --conferido "Planalto: Lei 14.133 (aberta); STF: sem súmula nova" [--nao-conferido "SINJ-DF não abriu"]
Efeito em js/atualizacoes-legais.js: data = hoje e acrescenta ao resumo 'Reconferido em DD/MM/AAAA: <conferido>. Não conferido: <...>.'
Sem --conferido o script se recusa (data sem fonte é falsa garantia). Rode uma vez por matéria."""
import re, sys, os, datetime, argparse
ap = argparse.ArgumentParser(); ap.add_argument('selo'); ap.add_argument('--conferido', required=True); ap.add_argument('--nao-conferido', default='')
a = ap.parse_args()
if len(a.conferido.strip()) < 15: sys.exit('--conferido precisa citar as fontes realmente abertas (mín. 15 caracteres)')
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')); p = os.path.join(RAIZ, 'js/atualizacoes-legais.js')
s = open(p, encoding='utf-8').read(); hoje = datetime.date.today(); iso = hoje.isoformat(); br = hoje.strftime('%d/%m/%Y')
out, achou = [], 0
for linha in s.split('\n'):
    m = re.match(r"(\s*\{ re: ')([^']*)(', data: ')(\d{4}-\d{2}-\d{2})(', resumo: ')(.*)(' \},?\s*)$", linha)
    if m and (a.selo.lower() in m.group(2).lower() or re.search(a.selo, m.group(2).replace('\\\\', '\\'), re.I)):
        res = re.sub(r" Reconferido em \d{2}/\d{2}/\d{4}:[^.]*\.( Não conferido:[^.]*\.)?", '', m.group(6))
        nota = " Reconferido em %s: %s." % (br, a.conferido.strip().rstrip('.').replace("'", '’'))
        if a.nao_conferido.strip(): nota += " Não conferido: %s." % a.nao_conferido.strip().rstrip('.').replace("'", '’')
        linha = m.group(1) + m.group(2) + m.group(3) + iso + m.group(5) + res + nota + m.group(7); achou += 1
    out.append(linha)
if achou != 1: sys.exit('o termo "%s" casou %d selos (precisa casar exatamente 1)' % (a.selo, achou))
open(p, 'w', encoding='utf-8').write('\n'.join(out)); print('selo atualizado:', a.selo, '->', iso)
