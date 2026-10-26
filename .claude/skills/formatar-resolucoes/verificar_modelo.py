# Uso: python3 verificar_modelo.py <final.md>
# MODELO das justificativas: sem citação de artigo em 📌/⚠️/💡/🪤/ERROS (o dispositivo fica no ⚖️ e no pop-up); 📌 com termo em ==destaque==;
# item Errado: ~~riscado~~ nas palavras erradas (aviso, não erro, quando o 📌 não contrapõe). Marcadores ==, **, ~~ balanceados.
import re, sys
bl = re.split(r'(?m)^## QUESTÃO \d+\s*$', open(sys.argv[1], encoding='utf-8').read())[1:]
cit = re.compile(r'\b[Aa]rts?\.|§|\b[Ii]nciso|\b[Aa]l[ií]nea|\bparágrafo único', re.I)
erros = []; sem_risco = []
for pos, b in enumerate(bl, 1):
    if '### Resolução' not in b: continue
    res = b[b.index('### Resolução'):]
    for l in res.splitlines():
        if l[:1] in ('⚖',) or l.startswith('🔑') or l.startswith('###'): continue
        if (l[:1] in ('📌', '💡', '🪤') or l.startswith('⚠️') or l.startswith('- Letra')) and cit.search(l):
            if l.startswith('⚠️') and re.search(r'Gabarito ajustado|Conferir o gabarito|Conferir o dispositivo', l): continue
            erros.append((pos, 'citação de artigo', l[:90]))
        for m in ('==', '**', '~~'):
            if l.count(m) % 2: erros.append((pos, 'marcador %s desbalanceado' % m, l[:90]))
    p = re.search(r'(?m)^📌 (.*)$', res)
    if p and '==' not in p.group(1): erros.append((pos, '📌 sem ==destaque==', p.group(1)[:90]))
    if re.search(r'\*\*Gabarito:\*\* Errado', b) and p and '~~' not in p.group(1): sem_risco.append(pos)
print('MODELO: %d problema(s); itens Errados com 📌 sem riscado: %d' % (len(erros), len(sem_risco)))
for e in erros[:40]: print(' -', e)
sys.exit(1 if erros else 0)
