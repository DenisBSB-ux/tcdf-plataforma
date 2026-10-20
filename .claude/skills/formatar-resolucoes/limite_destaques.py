import re
t=open('final2.md',encoding='utf-8').read(); out=[]
for l in t.split('\n'):
    if l.startswith('📌'):
        # sobram no máximo: 1 termo em ==fundo== + 1 em **negrito** (o 1º de cada); o resto vira texto simples
        n=[0]
        def f(m):
            n[0]+=1
            return m.group(0) if n[0]<=2 else m.group(2)
        l=re.sub(r'(\*\*|==)(.+?)\1',f,l)
    out.append(l)
open('final2.md','w',encoding='utf-8').write('\n'.join(out))
