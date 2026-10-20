#!/bin/bash
# Pipeline de montagem de uma lista (rodar na pasta de trabalho, com original.md, res/bNN.py e limite_destaques.py ao lado).
# build -> destaques do 📌 (1 ==fundo== + 1 **negrito**) -> final2.md. Item Errado força 🪤 vazia (padrão: sem 🪤 em Errado). Depois: reduzir, limpar, classificar (após "sim"), verificações.
cd "${1:-.}"
SK=/home/user/tcdf-plataforma/.claude/skills/formatar-resolucoes
rm -rf res2; mkdir -p res2
python3 - <<'P'
import glob,os,importlib.util
spec=importlib.util.spec_from_file_location('m','/home/user/tcdf-plataforma/.claude/skills/formatar-resolucoes/montar_resolucoes.py')
m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
_,p,Q=m.ler('original.md')
for f in sorted(glob.glob('res/b*.py')):
    ns={}; exec(open(f,encoding='utf-8').read(),ns); out={}
    for i,t in ns['R'].items():
        t=list(t)
        if Q[i]['gab']=='Errado': t[4]=''
        out[i]=tuple(t)
    open('res2/'+os.path.basename(f),'w',encoding='utf-8').write('R='+repr(out)+'\n')
P
python3 $SK/montar_resolucoes.py build original.md res2 final2.md >/dev/null
python3 - <<'P2'
import re
t=open('final2.md',encoding='utf-8').read(); out=[]
for l in t.split('\n'):
    if l.startswith('📌'):
        c=[0]
        def f(m):
            c[0]+=1
            return m.group(0) if c[0]==1 else '**'+m.group(1)+'**'
        l=re.sub(r'==(.+?)==',f,l)
    out.append(l)
open('final2.md','w',encoding='utf-8').write('\n'.join(out))
P2
python3 "$SK/limite_destaques.py"
