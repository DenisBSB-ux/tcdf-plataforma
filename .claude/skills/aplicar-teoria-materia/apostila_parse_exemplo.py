import re, json
raw=open('ap.txt',encoding='utf-8').read()
paginas=raw.split('\f')
# texto corrido com marca de página
linhas=[]
for i,p in enumerate(paginas,1):
    for l in p.split('\n'):
        linhas.append((i,l.rstrip()))
secoes=[]; cur=None
head=re.compile(r'^\s{1,4}(Código Tributário Nacional|Constituição Federal)\s+—\s+(Arts?\.[^\n]*)$')
for pg,l in linhas:
    m=head.match(l)
    if m:
        cur={'norma':'CTN' if m.group(1).startswith('Código') else 'CF','titulo':m.group(2).strip(),'pagina':pg,'linhas':[]}; secoes.append(cur); continue
    if re.match(r'^\s*BLOCO \d',l): cur=None; continue
    if cur is not None: cur['linhas'].append(l)
print(len(secoes))
def artigos(t):
    t=re.sub(r'\(.*?\)','',t)  # tira rótulo
    nums=[]
    m=re.match(r'Arts?\.\s*(.*)',t)
    s=re.sub(r'§\s*\d+(?:º|°)?','',m.group(1))
    # intervalos "77 a 80"
    for a,b in re.findall(r'(\d+)(?:º|°)?\s+a\s+(\d+)',s):
        nums+=list(range(int(a),int(b)+1))
    for n in re.findall(r'\b(\d+)(?:-A)?',s):
        pass
    base=re.findall(r'(?<![\d§])(\d+)(?:º|°)?(-A)?',s)
    for n,suf in base:
        v=int(n)
        if v not in nums: nums.append(v)
    return sorted(set(nums))
out=[]
for s in secoes:
    txt='\n'.join(s['linhas'])
    cob=''; peg=''
    m=re.search(r'🎯 Como já foi cobrado:(.*?)(?=⚠️ Pegadinha provável:|\Z)',txt,re.S)
    if m: cob=m.group(1)
    m2=re.search(r'⚠️ Pegadinha provável:(.*?)(?=\n\s*\n\s*\n|\Z)',txt,re.S)
    if m2: peg=re.sub(r'\s+',' ',m2.group(1)).strip()
    lei=txt.split('🎯')[0]
    s['lei']=lei.strip()
    s['cob_raw']=cob; s['pegadinha']=peg
    s['artigos']=artigos(s['titulo'])
    # itens cobrados
    itens=[]
    blocos=re.split(r'\n\s*(?=\((?:CESPE|CEBRASPE|FGV|IADES|FCC|VUNESP|IBFC|CESGRANRIO|QUADRIX|AOCP|FUNDATEC|INSTITUTO|IDECAN|FUNCAB|[A-Z][A-Za-z\-ÇÃ]+)\s*/)',cob)
    for b in blocos:
        mm=re.match(r'\s*\(([^)]*?)\)\s*(.*?)\s*Gabarito:\s*(.*)',b,re.S)
        if not mm: continue
        fonte=mm.group(1).strip(); enun=re.sub(r'\s+',' ',mm.group(2)).strip(); gab=mm.group(3)
        gab=re.sub(r'\s*\+\d+ quest.*','',gab,flags=re.S)
        gab=re.sub(r'\s+',' ',gab).strip()
        itens.append({'fonte':fonte,'enun':enun,'gab':gab})
    s['itens']=itens
    del s['linhas']
json.dump(secoes,open('secoes.json','w'),ensure_ascii=False,indent=1)
n=sum(len(s['itens']) for s in secoes); print('itens',n)
for s in secoes[:6]: print(s['norma'],s['titulo'],s['pagina'],s['artigos'],len(s['itens']),bool(s['pegadinha']))
