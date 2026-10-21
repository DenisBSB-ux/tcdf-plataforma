#!/bin/bash
# Fecha uma lista no PADRÃO (ver PADRAO.md). Uso: finalizar_lista.sh <pasta> <arquivo_original_ou_ultima_entrega.md> "<Matéria>"
# A <pasta> tem base.md (preparar_lista.py) e respostas.py; opcional erros.py (ERROS por alternativa: E = {idx: {'A': '...'}}).
# Passos: aplicar_padrao -> reduzir_redundancia -> classificar_auto -> aplicar_erros -> motivar_erros -> limpar_chaves -> verificadores -> contagem de distintas -> auditoria de pop-up.
cd /home/user/tcdf-plataforma; SK=.claude/skills/formatar-resolucoes; D=$1; O=$2; M=$3
pkill -f "http[.]server 839[789]" 2>/dev/null
python3 $SK/aplicar_padrao.py $D/base.md $D/respostas.py $D/f1.md | tail -3
python3 $SK/reduzir_redundancia.py $D/f1.md $D/f2.md
python3 $SK/classificar_auto.py $D/f2.md $D/f3.md
if [ -f $D/erros.py ]; then python3 $SK/aplicar_erros.py $D/f3.md $D/erros.py $D/f4.md; else cp $D/f3.md $D/f4.md; fi
python3 $SK/motivar_erros.py $D/f4.md $D/f5.md
python3 $SK/limpar_chaves.py $D/f5.md $D/final.md
echo "--- verificações"
python3 $SK/verificar_erros.py $D/final.md | head -12
python3 $SK/verificar_resolucoes.py $O $D/final.md | tail -3
node $SK/verificar_importador.js $O $D/final.md 2>&1 | tr -d '\n ' | grep -o '"enunciadosIguais":[a-z]*\|"gabaritosDivergentes":\[[^]]*\]\|"resolucoesMalFormatadas":\[[^]]*\]' | tr '\n' ' '; echo
node $SK/contar_distintas.js $D/final.md 2>&1 | tail -1 | tee $D/.distintas | cut -c1-200
python3 -c "import json;d=json.load(open('$D/.distintas'));print('OK: todas distintas' if d['total']==d['distintas'] else 'ATENÇÃO: a plataforma enxerga só %d distintas de %d (troque os duplicados: grupos %s)'%(d['distintas'],d['total'],d['grupos']))"
MATERIA="$M" timeout 280 node $SK/auditar_lista.js $O $D/final.md 2>&1 | python3 -c "
import sys,json; s=sys.stdin.read(); d=json.loads(s[s.index('{'):]); print({k:(v if not isinstance(v,list) else len(v)) for k,v in d.items() if v not in ([],0,True) and k not in ('atualizacaoAConferir',)})"
echo "--- sem classificação: $(python3 $SK/montar_resolucoes.py faltantes $D/final.md | head -1)"
echo "--- resíduos proibidos (Fonte:/Atualização verificada/ID/Explicação/Resumo Flash): $(grep -c 'Atualização verificada\|^\*\*ID\|Explicação\|^### Resumo Flash' $D/final.md)"
echo "PRONTO: $D/final.md  (confira o aviso SEM CLASSIFICAÇÃO/problemas acima; entregar com SendUserFile)"
