#!/usr/bin/env python3
"""Gera js/<norma>-texto.js para o pop-up de lei da plataforma.
Uso: python3 gerar_texto_lei.py entrada.txt LC116_TEXTO lc116-texto.js "Texto da LC 116/2003" [--corte REGEX] [--depois REGEX] [--max N]
(roda da raiz do repositório). Mantém a ÚLTIMA ocorrência de cada artigo e, dentro do artigo, o último de cada § / inciso / alínea repetido:
o Planalto imprime o texto antigo riscado antes do vigente, e o pdftotext não distingue o risco."""
import re,json,sys
INI=re.compile(r'^(Art\.?\s*\d+(?:-[A-Z])?\s*[º°o.]?\s|§\s*\d+|Parágrafo único|[IVXLC]+\s*[-–—]\s|[a-z]\)\s|\d+\.\s)')
CAB=re.compile(r'^(LIVRO|T[ÍI]TULO|CAP[ÍI]TULO|SE[ÇC][ÃA]O|SUBSE[ÇC][ÃA]O|PARTE|DISPOSI[ÇC][ÕO]ES|ANEXO)\b')
def limpa(t):
    t=re.sub(r'\[([^\]]*)\]\([^)]*\)',r'\1',t); t=re.sub(r'<https?://[^>\s]*>','',t)
    return t.replace('','').replace('\f','\n')
def parse(t,maxart=None):
    linhas=[re.sub(r'\s+',' ',l).strip() for l in t.split('\n')]; linhas=[l for l in linhas if l]
    ocs=[]; cur=None
    for l in linhas:
        m=re.match(r'^Art\.?\s*(\d+)(?:-([A-Z]))?\s*[º°o]?\.?(?=\s|$)',l)
        if m:
            cur=[m.group(1)+('-'+m.group(2) if m.group(2) else ''),[l]]; ocs.append(cur); continue
        if cur is None: continue
        if not INI.match(l) and (CAB.match(l) or (l.isupper() and len(l)>8)): cur=None; continue
        if INI.match(l): cur[1].append(l)
        else: cur[1][-1]+=' '+l
    art={}
    for k,ps in ocs: art[k]=ps            # última ocorrência = versão vigente (as anteriores aparecem riscadas)
    return {k:dedupe(ps) for k,ps in art.items()}
def rotulo(p):
    m=re.match(r'^§\s*(\d+)',p)
    if m: return ('par',m.group(1))
    if p.startswith('Parágrafo único'): return ('par','U')
    m=re.match(r'^([IVXLC]+)\s*[-–—]\s',p)
    if m: return ('inc',m.group(1))
    m=re.match(r'^([a-z])\)\s',p)
    if m: return ('ali',m.group(1))
    return ('txt',None)
def dedupe(ps):
    # árvore: caput -> [par|inc] ; par -> inc ; inc -> ali. Rótulo repetido no mesmo pai: fica o último (o anterior era texto riscado).
    head=ps[0]; raiz={'filhos':[]}; pilha=[('raiz',raiz)]
    nivel={'par':1,'inc':2,'ali':3}
    ultimo=None
    nos=[]
    for p in ps[1:]:
        tp,lb=rotulo(p)
        if tp=='txt':
            if nos: nos[-1]['extra'].append(p)
            else: head+=' '+p
            continue
        n={'tp':tp,'lb':lb,'txt':p,'filhos':[],'extra':[]}
        # acha pai
        while pilha[-1][0]!='raiz' and not pai_ok(pilha[-1][1]['tp'],tp): pilha.pop()
        pai=pilha[-1][1]
        pai['filhos']=[f for f in pai['filhos'] if not (f['tp']==tp and f['lb']==lb)]
        pai['filhos'].append(n); pilha.append((tp,n)); nos.append(n)
    out=[head]
    def desce(n):
        out.append(n['txt']); out.extend(n['extra']); [desce(f) for f in n['filhos']]
    for f in raiz['filhos']: desce(f)
    return out
def pai_ok(pai_tp,tp):
    return (pai_tp=='par' and tp in('inc',)) or (pai_tp=='inc' and tp=='ali')
def grava(arq,var,cab,art):
    for k,ps in art.items():
        ps[0]=re.sub(r'^Art\.?\s*(\d+(?:-[A-Z])?)\s*[º°o.]?\s*',lambda m:'Art. '+m.group(1)+('º' if m.group(1).isdigit() and int(m.group(1))<10 else '.')+' ',ps[0])
    ks=sorted(art,key=lambda x:(int(x.split('-')[0]),x.split('-')[1] if '-' in x else ''))
    open('/home/user/tcdf-plataforma/js/'+arq,'w',encoding='utf-8').write(f"/* {cab} — carregado só quando alguém abre um artigo. */\nconst {var} = "+json.dumps({k:art[k] for k in ks},ensure_ascii=False,separators=(',',':'))+";\n")
    print(arq,len(art),ks[:2],ks[-2:])
    return art

if __name__=='__main__':
    import argparse
    ap=argparse.ArgumentParser(description='Gera js/<norma>-texto.js (artigo -> parágrafos) a partir do texto de uma lei.')
    ap.add_argument('entrada',help='.txt (pdftotext -layout) ou texto do Drive')
    ap.add_argument('var',help='nome da constante JS, ex.: LC116_TEXTO')
    ap.add_argument('saida',help='arquivo em js/, ex.: lc116-texto.js')
    ap.add_argument('cabecalho',help='comentário de abertura do arquivo')
    ap.add_argument('--corte',help='regex: o texto termina na 1ª ocorrência (ex.: ATO DAS DISPOSIÇÕES CONSTITUCIONAIS TRANSITÓRIAS)')
    ap.add_argument('--depois',help='regex: só o que vem DEPOIS da 1ª ocorrência (ex.: o ADCT)')
    ap.add_argument('--max',type=int,help='descarta artigos acima deste número')
    ap.add_argument('--repo',default='.',help='raiz do repositório (onde está js/)')
    a=ap.parse_args()
    t=limpa(open(a.entrada,encoding='utf-8').read())
    if a.corte:
        m=re.search(a.corte,t); t=t[:m.start()] if m else t
    if a.depois:
        m=re.search(a.depois,t); t=t[m.start():] if m else t
    art=parse(t)
    if a.max: art={k:v for k,v in art.items() if int(k.split('-')[0])<=a.max}
    import os
    grava_em=os.path.join(a.repo,'js',a.saida)
    ks=sorted(art,key=lambda x:(int(x.split('-')[0]),x.split('-')[1] if '-' in x else ''))
    for k,ps in art.items():
        ps[0]=re.sub(r'^Art\.?\s*(\d+(?:-[A-Z])?)\s*[º°o.]?\s*',lambda m:'Art. '+m.group(1)+('º' if m.group(1).isdigit() and int(m.group(1))<10 else '.')+' ',ps[0])
    open(grava_em,'w',encoding='utf-8').write(f"/* {a.cabecalho} — carregado só quando alguém abre um artigo. */\nconst {a.var} = "+json.dumps({k:art[k] for k in ks},ensure_ascii=False,separators=(',',':'))+";\n")
    miss=[i for i in range(1,max(int(k.split('-')[0]) for k in art)+1) if str(i) not in art]
    print(f'{grava_em}: {len(art)} artigos ({ks[0]} a {ks[-1]}); numeração sem texto (revogados ou fora do PDF): {miss[:40]}')
