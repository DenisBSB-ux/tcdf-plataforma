#!/usr/bin/env python3
# Remove das resoluções as frases "Fonte: …", o selo "Atualização verificada em …" e avisos de "texto não carregado" (uso: limpar_fontes.py entrada.md saida.md; depois conferir pelo log impresso).
import re,sys
def limpa(t):
    out=[];log=[]
    for l in t.split('\n'):
        if l.startswith('⚠️') and not l.startswith('⚠️ ERROS'):
            o=l
            l=re.sub(r' ?Atualização verificada em \d\d/\d\d/\d{4}:.*$','',l)           # selo vai até o fim da linha
            l=re.sub(r'Fonte:.*?\.(?=\s|$) ?','',l)                                 # frase "Fonte: …"
            l=re.sub(r' ?\((?:texto|acórdão|texto da súmula|acórdão e súmula)[^)]*não carregad[^)]*\)','',l)
            l=re.sub(r'[;,] textos? não (?:está )?carregados?[^.]*','',l)
            l=re.sub(r'; o texto não está carregado na plataforma','',l)
            l=re.sub(r' ?\(texto da súmula não carregado na plataforma\)','',l)
            l=l.strip()
            if l in ('⚠️','') : log.append((o,'REMOVIDA')); continue
            if l!=o: log.append((o,l))
        out.append(l)
    return '\n'.join(out),log
if __name__=='__main__':
    t=open(sys.argv[1],encoding='utf-8').read(); r,log=limpa(t); open(sys.argv[2],'w',encoding='utf-8').write(r)
    import collections
    print(len(log)); 
    for o,n in log:
        if 'Atualização' in o or o.startswith('⚠️ Fonte: Anexo') or o.startswith('⚠️ Fonte: apostila') or o.startswith('⚠️ Fonte: Decreto') or o.startswith('⚠️ Fonte: AHA'): continue
        print('-',o[:230]); print('  ->',n[:230])
