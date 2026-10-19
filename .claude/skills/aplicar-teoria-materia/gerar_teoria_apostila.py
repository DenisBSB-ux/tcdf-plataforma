#!/usr/bin/env python3
"""Gera js/teoria-<chave>.js (trechos da apostila por artigo) a partir do secoes.json produzido por um parser de apostila
(ver apostila_parse_exemplo.py, que é específico do layout da apostila de Direito Tributário; adapte para outra apostila).
Cada seção: {norma, titulo, pagina, lei, pegadinha, artigos}. Uso (da raiz do repositório):
  python3 .claude/skills/aplicar-teoria-materia/gerar_teoria_apostila.py secoes.json js/teoria-dt.js direito-tributario d-tributario
Os últimos argumentos são as chaves (início do slug da matéria) que usarão estes trechos."""
import json,re,sys
sec,saida,*chaves=sys.argv[1:]
d=json.load(open(sec,encoding='utf-8')); out=[]
for s in d:
    paras=[]
    for l in s['lei'].split('\n'):
        l=l.strip()
        if not l: continue
        if paras and not re.match(r'^(Art\.|§|Parágrafo|[IVXL]+\s*[-–]|[a-z]\)|\d+\.)',l): paras[-1]+=' '+l
        else: paras.append(l)
    paras=[re.sub(r'\s*Página \d+$','',p) for p in paras]
    out.append({'norma':s['norma'],'titulo':s['titulo'],'pagina':s['pagina'],'artigos':s['artigos'],'lei':paras,'peg':s['pegadinha']})
js="/* Trechos da apostila por artigo (dispositivo, página e pegadinha). Carregado só ao abrir o pop-up de lei. */\nconst TEORIA_TEXTO = {'%s':%s};\n"%(chaves[0],json.dumps(out,ensure_ascii=False,separators=(',',':')))
for c in chaves[1:]: js+="TEORIA_TEXTO['%s']=TEORIA_TEXTO['%s'];\n"%(c,chaves[0])
open(saida,'w',encoding='utf-8').write(js); print(saida,len(out),'seções')
