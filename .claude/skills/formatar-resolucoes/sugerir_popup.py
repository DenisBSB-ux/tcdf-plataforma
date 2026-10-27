#!/usr/bin/env python3
"""Para cada questão SEM pop-up de teoria, sugere dispositivos nas normas carregadas (js/*-texto.js) pela sobreposição de palavras.
Uso: python3 sugerir_popup.py <final.md> <n,n,...> [Sigla1,Sigla2,...]   (n = posição 1-based; siglas = LEI_FONTES; padrão: as normas citadas no próprio arquivo)
Saída: tabela para o coordenador ESCOLHER; só vale dispositivo cujo texto confirme o assunto (nunca citar de memória)."""
import json, re, subprocess, sys, os, collections
aqui = os.path.dirname(os.path.abspath(__file__))
md = open(sys.argv[1], encoding='utf-8').read(); alvo = [int(x) for x in sys.argv[2].split(',') if x]
q = re.split(r'(?m)^## QUESTÃO \d+\s*\n', md)[1:]
if len(sys.argv) > 3: siglas = sys.argv[3].split(',')
else:
    cont = collections.Counter(m.group(1).strip() for m in re.finditer(r'(?m)^⚖️[^\n]*·\s*([^\n]+)$', md))
    mapa = {'Lei 14.133/2021': 'Lei 14.133', 'IN 5/2017': 'IN 5', 'Lei 8.429/1992': 'Lei 8.429', 'Lei 9.784/1999': 'Lei 9.784', 'Lei 2.834/2001': 'Lei 2.834', 'Decreto 44.330/2023': 'Decreto 44.330', 'RI TCDF': 'RI TCDF', 'CF': 'CF'}
    siglas = [mapa[k] for k in cont if k in mapa] or ['CF']
stop = set('de da do das dos a o as os e em um uma que para por com na no nas nos se ao à é são ser como mais mas não ou nem sua seu suas seus pela pelo quando sobre entre também item julgue'.split())
def palavras(t): return {w for w in re.findall(r'[a-zà-úç]{4,}', t.lower()) if w not in stop}
for sg in siglas:
    js = subprocess.run(['node', '-e', "const {carrega}=require('%s/lei.js');console.log(JSON.stringify(carrega(%s)))" % (aqui, json.dumps(sg))], capture_output=True, text=True)
    if js.returncode: continue
    lei = json.loads(js.stdout); idx = {n: palavras(' '.join(t)) for n, t in lei.items()}
    for n in alvo:
        b = q[n - 1]; enun = b.split('### Enunciado')[1].split('**Gabarito')[0]
        pw = palavras(enun + ' ' + ' '.join(re.findall(r'(?m)^(?:📌|🔑) ([^\n]*)', b)))
        ranking = sorted(((len(pw & ws) / (len(ws) ** 0.5 + 1), a) for a, ws in idx.items() if len(pw & ws) >= 3), reverse=True)[:3]
        print(f'#{n} [{sg}]:', ' | '.join(f'Art. {a} ({s:.2f}: {lei[a][0][:60]}…)' for s, a in ranking) or '(sem candidato)')
