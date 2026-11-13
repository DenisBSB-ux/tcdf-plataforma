#!/usr/bin/env python3
"""mapa_cobertura.py — mostra O QUE a rotina semanal cobre automaticamente (base oficial do Senado) e o que depende de pesquisa.
Uso (raiz do repositório): python3 .claude/skills/atualizacao-legal-semanal/mapa_cobertura.py
Saída: (1) normas com texto no site e como são conferidas; (2) por matéria, as normas da base do Senado; (3) matérias que
só ficam completas com pesquisa. Serve de lista de tarefas para os subagentes por grupo (SKILL, item 1c)."""
import json, os, re
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
fs = json.load(open(os.path.join(os.path.dirname(__file__), 'fontes_senado.json'), encoding='utf-8'))
senado = {k: v for k, v in fs.items() if not k.startswith('_')}
teoria = open(os.path.join(RAIZ, 'js/teoria.js'), encoding='utf-8').read()
i = teoria.index('LEI_FONTES = {'); j = teoria.index('\n};', i)
normas = re.findall(r"^\s*(?:'([^']+)'|([A-Za-z0-9_]+)):\{ arquivo:", teoria[i:j], re.M)
normas = [a or b for a, b in normas]
print('NORMAS COM TEXTO NO SITE (%d)' % len(normas))
for n in normas:
    print('  %-16s %s' % (n, 'base do Senado (automática, workflow de segunda 05:17)' if n in senado else 'SÓ PESQUISA (Planalto/SINJ-DF/DODF/TCDF/STF) — o subagente precisa abrir a fonte'))
print('\nMATÉRIAS E NORMAS DA BASE DO SENADO')
por = {}
for n, f in senado.items():
    for m in f.get('materias', []): por.setdefault(m, []).append(n)
for m in sorted(por): print('  %-26s %s' % (m, ', '.join(por[m])))
extras = fs.get('_materias_extras', [])
print('\nMATÉRIAS EXTRAS (sem norma própria na base): ' + ', '.join(extras))
print('\nREGRA: a base do Senado cobre só alteração por norma posterior das normas federais acima. Normas distritais (LC 769/932, LODF, LC 1, RI TCDF,')
print('LC 840, Decretos 44.330/42.590/32.598), IN 5, jurisprudência e súmulas dependem de pesquisa: sem fonte aberta, o selo NÃO avança.')
