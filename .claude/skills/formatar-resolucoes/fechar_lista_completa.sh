#!/bin/bash
# Fecha uma lista INTEIRA (padrão final) depois que os subagentes escreveram pasta/lotes/bNN.py e pasta/resp/rNN.py (+ eNN.py nas de múltipla escolha).
# Uso: bash fechar_lista_completa.sh <pasta> "<Matéria>"      (pasta tem original.md; resultado: pasta/entrega.md)
# Passos: build (resoluções) → preparar → montar_respostas → finalizar_lista.sh → inserir Explicação → verificações → PORTÃO DO POP-UP.
cd /home/user/tcdf-plataforma; SK=.claude/skills/formatar-resolucoes; D=$1; M=$2
python3 $SK/montar_resolucoes.py build $D/original.md $D/lotes $D/built.md | tail -2
python3 $SK/preparar_lista.py $D/built.md $D/q | tail -1 | cut -c1-120
python3 $SK/montar_respostas.py $D
bash $SK/finalizar_lista.sh $D/q $D/original.md "$M" 2>&1 | tail -18
python3 $SK/inserir_explicacao.py $D/q/final.md $D/X.py $D/entrega.md
echo "--- verificações finais"
python3 $SK/verificar_modelo.py $D/entrega.md | tail -1
node $SK/verificar_importador.js $D/original.md $D/entrega.md 2>&1 | tr -d '\n ' | grep -o '"enunciadosIguais":[a-z]*\|"gabaritosDivergentes":\[[^]]*\]\|"resolucoesMalFormatadas":\[[^]]*\]' | tr '\n' ' '; echo
node $SK/contar_distintas.js $D/entrega.md | tail -1
echo "--- PORTÃO DO POP-UP (toda questão precisa de ⚖️ ou ficha 📖)"
MATERIA="$M" timeout 280 node $SK/auditar_lista.js $D/original.md $D/entrega.md 2>&1 | python3 -c "
import sys,json; s=sys.stdin.read(); d=json.loads(s[s.index('{'):]); sp=d.get('semPopup') or []; pt=d.get('popupSemTexto') or []
print('semPopup:',sp,'| popupSemTexto:',pt)
open('$D/.sem_popup','w').write(','.join(str(x) for x in sp))
print('PORTÃO: ' + ('OK' if not sp and not pt else 'FALHOU — rode: python3 $SK/sugerir_popup.py $D/entrega.md '+','.join(str(x) for x in sp)+'  e corrija a linha ⚖️ (norma carregada) ou crie a ficha 📖; depois repita'))"
echo "--- PORTÃO DO DESTAQUE (o pop-up abre no trecho específico do assunto)"
MATERIA="$M" timeout 280 node $SK/auditar_destaque.js $D/entrega.md 2>&1 | python3 -c "
import sys,json; s=sys.stdin.read()
try:
    d=json.loads(s[s.index('{'):])
    print('pop-ups de lei:',d['comBotaoLei'],'| dispositivo exato:',d['exato'],'| sugerido pelo assunto (⚖️ só com o artigo):',d['sugerido'],'| SEM destaque:',d['semAlvo'],'| fichas:',d['fichas'],'sem linha destacada:',d['fichaSemLinha'])
    if d['listaSugerido']: print('  refinar a ⚖️ para §/inciso/alínea exato nas questões:',d['listaSugerido'][:40])
    if d['listaFichaSemLinha']: print('  ficha sem linha destacada (ampliar 🔑 ou a ficha):',d['listaFichaSemLinha'][:40])
    print('DESTAQUE: ' + ('OK' if not d['semAlvo'] else 'FALHOU — questões sem destaque: '+str(d['listaSemAlvo'][:40])+' (ajuste a linha ⚖️ para o dispositivo exato e repita)'))
except Exception as e: print('auditoria de destaque indisponível:', s[:150].replace(chr(10),' '))"
echo "--- gabarito a conferir / sem ⚖️"
python3 - <<PY
import re
t=open('$D/entrega.md',encoding='utf-8').read(); q=re.split(r'(?m)^## QUESTÃO \d+\s*\n',t)[1:]
print('conferir gabarito:',[i+1 for i,b in enumerate(q) if 'Conferir o gabarito' in b]); print('sem ⚖️:',[i+1 for i,b in enumerate(q) if '\n⚖️' not in b.split('### Resolução')[1]])
PY
echo "ENTREGA: $D/entrega.md"
