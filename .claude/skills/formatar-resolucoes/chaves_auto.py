import re,unicodedata
def norm(s): 
    s=unicodedata.normalize('NFD',s.lower()); out=[];mp=[]
    for i,c in enumerate(s):
        if unicodedata.category(c)=='Mn': continue
        out.append(c); mp.append(i)
    return ''.join(out)
def acha(e,termo):
    # devolve o trecho literal de e que corresponde a termo (sem acento/caixa), ou None
    ne=unicodedata.normalize('NFD',e); 
    # mapa de posições do texto NFC original
    base=[];pos=[]
    for i,c in enumerate(e):
        d=unicodedata.normalize('NFD',c)
        for ch in d:
            if unicodedata.category(ch)=='Mn': continue
            base.append(ch.lower()); pos.append(i)
    b=''.join(base); t=''.join(ch for ch in unicodedata.normalize('NFD',termo.lower()) if unicodedata.category(ch)!='Mn')
    j=b.find(t)
    if j<0 or len(t)<4: return None
    return e[pos[j]:pos[j+len(t)-1]+1]
def chaves(q):
    e=re.sub(r'\s+',' ',re.search(r'### Enunciado\n(.*?)\n\n\*\*Gabarito',q,re.S).group(1))
    r=q.split('### Resolução')[1]
    p=re.search(r'^📌 (.*)',r,re.M).group(1)
    k=re.search(r'^🔑 (.*)',r,re.M); k=k.group(1) if k else ''
    cand=[m for m in re.findall(r'==(.+?)==',p)]+[m for m in re.findall(r'\*\*(.+?)\*\*',p)]+[x.strip() for x in k.split('·')]
    out=[]
    for c in cand:
        t=acha(e,re.sub(r'[*=]','',c))
        if t and t not in out and not any(t in o or o in t for o in out): out.append(t)
    return e,out
