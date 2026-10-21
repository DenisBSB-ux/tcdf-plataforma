import re,sys,collections
def junta(ls):
    return ls[0] if len(ls)==1 else ', '.join(ls[:-1])+' e '+ls[-1]
def processa(q,manual=None):
    m=re.search(r'(?m)^(⚠️ ERROS\n)((?:- Letra .*\n?)+)',q)
    if not m: return q
    linhas=[re.match(r'- Letra ([A-E]): (.*)',l).groups() for l in m.group(2).strip().split('\n')]
    if manual is not None:
        novo=manual
    else:
        # (a) tira o riscado que se repete em 3 ou mais linhas
        c=collections.Counter()
        for L,t in linhas:
            for s in set(re.findall(r'~~(.+?)~~',t)): c[s]+=1
        rep={s for s,k in c.items() if k>=3}
        nl=[]
        for L,t in linhas:
            for s in rep: t=re.sub(r',? ?~~'+re.escape(s)+r'~~','',t)
            nl.append((L,t.replace(' .','.').strip()))
        # (a2) linhas que só diferem pelo trecho riscado (mesmo texto fora do ~~…~~): viram uma linha sem o riscado
        nucleo = lambda t: re.sub(r'\s+', ' ', re.sub(r',? ?~~.+?~~', '', t)).strip()
        cont = collections.Counter(nucleo(t) for _, t in nl)
        nl = [(L, nucleo(t) if cont[nucleo(t)] > 1 else t) for L, t in nl]
        # (b) junta linhas com o mesmo texto
        grupos=collections.OrderedDict()
        for L,t in nl: grupos.setdefault(t,[]).append(L)
        novo=[]
        for t,Ls in grupos.items():
            novo.append(('Letra %s'%Ls[0] if len(Ls)==1 else 'Letras '+junta(Ls), t))
        novo=['- %s: %s'%(a,b) for a,b in novo]
    return q[:m.start(2)]+'\n'.join(novo)+'\n'+q[m.end(2):]
def roda(src,dst,manuais={}):
    t=open(src,encoding='utf-8').read(); parts=re.split(r'\n(?=## QUESTÃO )',t); head,Q=parts[0],parts[1:]
    for i,q in enumerate(Q):
        Q[i]=processa(q,manuais.get(i+1))
    open(dst,'w',encoding='utf-8').write(head+'\n'+'\n'.join(Q))
