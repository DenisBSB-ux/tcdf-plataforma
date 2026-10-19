#!/usr/bin/env python3
"""Monta o arquivo .md de uma matéria com as resoluções no formato padrão.

Uso:
  python3 montar_resolucoes.py dump  <arquivo.md> <ini> <fim>          # lê as questões ini..fim (índices) para você escrever
  python3 montar_resolucoes.py build <arquivo.md> <pasta_lotes> <saida.md> [--manter-resumo-flash] [--sem-artigo]
        gera também <saida>.relatorio.md (gabaritos a conferir, valores atualizáveis, linhas sem base legal)
  python3 montar_resolucoes.py faltantes <arquivo.md>                  # itens certo/errado sem classificação (Sinal/Armadilha)
  python3 montar_resolucoes.py classificar <arquivo.md> <proposta.py> <saida.md>   # aplica a classificação APROVADA pelo usuário
  python3 montar_resolucoes.py repetidas <arquivo.md> [limiar=0.85]    # questões quase repetidas (enunciado)

Negrito só nos termos mais relevantes (📌 até 2; ⚠️/🪤 até 1; 🔑 sem negrito); o termo mais importante do 📌 vira ==fundo amarelo==.
Cada lote em <pasta_lotes>/bNN.py define  R = { indice: (ess, [palavras-chave], base, atencao, armadilha, macete) }
  ess        📌 essência em uma linha (palavras-chave em **negrito**)
  base       ⚖️ ex.: '**Art. 75** ▸ **IV** ▸ **"c"** · Lei 14.133/2021' ('' omite a linha)
  atencao    ⚠️ exceção/atualização, ou "Conferir o gabarito..." quando o gabarito do arquivo diverge da lei ('' omite)
  armadilha  🪤 como a banca poderia alterar o item ('' omite; use só em item certo e múltipla escolha)
  macete     💡 frase curta em itálico
O campo **Artigo:** (se ainda não existir) é preenchido a partir da linha ⚖️, no formato do importador (ex.: "Lei 14.133: 75").
O perfil (sinal/armadilha) NÃO entra na resolução: a plataforma já o mostra no painel "Armadilha da banca".
Só a seção ### Resolução é trocada e o ### Resumo Flash é removido (padrão da Lei 14.133; use --manter-resumo-flash para preservá-lo); o resto do arquivo é preservado byte a byte.
"""
import re, sys, glob

NOMES = {'GEN':'Generalização','SUF':'Suficiência falsa','DIS':'Dispensa / exceção inventada','JUS':'Justificativa falsa',
         'INV':'Inversão','TRO':'Troca de conceitos','RES':'Restrição indevida','EXT':'Extrapolação','PRAZ':'Troca de número ou prazo'}
SIN = {'LIT':'**Literalidade (LIT)** — texto copiado da lei',
       'REL':'**Relativização (REL)** — "pode", "em regra" e "geralmente" tornam o item defensável',
       'COE':'**Coerência interna (COE)** — premissa, conectivo e conclusão se sustentam',
       'ABS-L':'**Absoluto legal (ABS-L)** — a própria lei é absoluta'}

def campo(b, n):
    m = re.search(r'\*\*' + n + r':\*\*\s*(.*)', b); return m.group(1).strip() if m else ''
def secao(b, ini, fim):
    m = re.search(r'### ' + ini + r'\n(.*?)(?=\n### ' + fim + r'|\n\n---|\Z)', b, re.S); return m.group(1).strip() if m else ''
def ler(path):
    txt = open(path, encoding='utf-8').read()
    partes = re.split(r'(?m)^(## QUESTÃO \d+\s*$)', txt)
    Q = []
    for k in range(1, len(partes), 2):
        b = partes[k + 1]
        Q.append(dict(id=campo(b,'ID'), assunto=campo(b,'Assunto'), gab=campo(b,'Gabarito'), sinal=campo(b,'Sinal'),
                      arm=campo(b,'Armadilha'), trecho=campo(b,'Trecho'), expl=campo(b,'Explicação'),
                      enun=secao(b,'Enunciado','Resolução').split('**Gabarito:**')[0].strip(), res=secao(b,'Resolução','Resumo Flash')))
    return txt, partes, Q

def artigo_do_base(base):
    """'**Art. 75** ▸ **IV** · Lei 14.133/2021' -> 'Lei 14.133: 75' (vazio se não houver artigo ou norma reconhecível)."""
    b = re.sub(r'\*\*|\*', '', base or '')
    if not re.search(r'\bArt', b): return ''
    arts = sorted({int(n) for n in re.findall(r'\bArts?\.?\s*(\d+)', b)} | {int(n) for n in re.findall(r'\be\s+Art\.?\s*(\d+)', b)})
    sigla = re.search(r'\b(LODF|CF|CTN|ADCT|RI TCDF|IN 5)\b', b)   # normas sem número: "LODF: 2", "CF: 37", "CTN: 3"
    if arts and sigla: return f"{sigla.group(1)}: " + ', '.join(str(n) for n in arts)
    m = re.search(r'(Lei(?:\s+Complementar)?|Decreto(?:-Lei)?|IN|LC)\s*(?:n[ºo°.]*\s*)?([\d.]+)(?:/\d{2,4})?', b)
    if not arts or not m: return ''
    nome = {'IN': 'IN', 'LC': 'Lei Complementar'}.get(m.group(1), m.group(1))
    return f"{nome} {m.group(2).rstrip('.')}: " + ', '.join(str(n) for n in arts)

def insere_campo(b, nome, valor):
    """Insere **nome:** valor depois da linha Cobrança (ou Assunto), se o campo ainda não existir."""
    if re.search(r'(?m)^\*\*' + nome + r':\*\*', b): return b, False
    for ref in ('Cobrança', 'Assunto'):
        b2, c = re.subn(r'(?m)^(\*\*' + ref + r':\*\*.*\n)', lambda m: m.group(1) + f'**{nome}:** {valor}\n', b, count=1)
        if c: return b2, True
    return b, False

def sem_classificacao(q):
    return q['gab'] in ('Certo', 'Errado') and not q['arm'] and not q['sinal']

def norm_txt(t):
    import unicodedata
    t = unicodedata.normalize('NFD', t.lower()); t = ''.join(c for c in t if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+', ' ', t).strip()

def destaca(texto, kws, max_bold, marca=0):
    """Menos negrito, mais foco: só os termos mais relevantes ficam em **negrito** e o mais importante
    (marca=1) ganha ==fundo amarelo==. A relevância vem da ordem da lista de palavras-chave (🔑)."""
    spans = list(re.finditer(r'\*\*([^*\n]+)\*\*', texto))
    nk = [norm_txt(k) for k in kws]
    def rank(m):
        t = norm_txt(m.group(1))
        for j, k in enumerate(nk):
            if k and (k == t or k in t or t in k): return j
        rad = {w[:5] for w in t.split() if len(w) >= 5}   # mesmo radical (ex.: truncar × truncamento)
        for j, k in enumerate(nk):
            if rad & {w[:5] for w in k.split() if len(w) >= 5}: return j + 0.5
        return 999
    ordem = sorted(range(len(spans)), key=lambda x: (rank(spans[x]), x))
    marcados = set(ordem[:marca]); negritos = set(ordem[marca:marca + max_bold])
    out, pos = [], 0
    for n, m in enumerate(spans):
        out.append(texto[pos:m.start()])
        out.append(f'=={m.group(1)}==' if n in marcados else (f'**{m.group(1)}**' if n in negritos else m.group(1)))
        pos = m.end()
    out.append(texto[pos:]); return ''.join(out)

def monta(q, d, i=0, sinal_extra=None):
    """Sem linha 🏷️: o perfil (sinal ou armadilha) já aparece no painel "Armadilha da banca" da plataforma."""
    ess, kw, base, ate, arm, mac = d
    L = []
    if base: L.append('⚖️ ' + base)
    L.append('📌 ' + destaca(ess, kw, 2, 1))
    L.append('🔑 ' + ' · '.join(kw))  # sem negrito: a linha inteira já é de palavras-chave
    ate = destaca(ate, kw, 1) if ate else ate
    if 'gabarito resolvido por IA' in q['res']:
        ate = (ate + ' ' if ate else '') + '**Gabarito resolvido por IA**, sem gabarito oficial (confiança média): **conferir** na norma.'
    if ate: L.append('⚠️ ' + ate)
    if arm: L.append('🪤 ' + destaca(arm, kw, 1))
    if mac: L.append('💡 ' + mac)
    return '\n'.join(L)

if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'dump':
        _, partes, Q = ler(sys.argv[2]); a, b = int(sys.argv[3]), int(sys.argv[4])
        for i in range(a, min(b, len(Q))):
            q = Q[i]; print(f"\n#{i} {q['id']} | {q['assunto'][:60]} | GAB={q['gab']} {('SINAL='+q['sinal']) if q['sinal'] else ''} {('ARM='+q['arm']) if q['arm'] else ''}")
            if q['trecho']: print('TRECHO:', q['trecho'])
            if q['expl']: print('EXPL:', q['expl'])
            print('ENUN:', q['enun'][:650]); print('RES_ANTIGA:', q['res'][:420])
    elif cmd == 'build':
        txt, partes, Q = ler(sys.argv[2]); R = {}; SINAL = {}
        for f in sorted(glob.glob(sys.argv[3] + '/b*.py')):
            ns = {}; exec(open(f, encoding='utf-8').read(), ns); R.update(ns.get('R', {})); SINAL.update(ns.get('SINAL', {}))
        out = [partes[0]]; n = 0; nart = 0; sem_base = []; conferir = []; atualizaveis = []
        for i, k in enumerate(range(1, len(partes), 2)):
            cab, b = partes[k], partes[k + 1]
            if i in R:
                novo = monta(Q[i], R[i], i, SINAL)
                b, c = re.subn(r'(### Resolução\n).*?(?=\n\n### Resumo Flash|\n\n---|\Z)', lambda m: m.group(1) + novo, b, count=1, flags=re.S); assert c == 1; n += 1
                art = artigo_do_base(R[i][2])
                if art and '--sem-artigo' not in sys.argv:
                    b, ok = insere_campo(b, 'Artigo', art); nart += ok
                if not R[i][2]: sem_base.append(i)
                ate = R[i][3]
                if 'Conferir o gabarito' in ate: conferir.append((i, ate))
                if 'art. 182' in ate or 'art. 182' in R[i][0]: atualizaveis.append((i, R[i][0]))
            out += [cab, b]
        res = ''.join(out)
        if '--manter-resumo-flash' not in sys.argv:  # padrão: sem Resumo Flash (como na Lei 14.133)
            res, c = re.subn(r'\n\n### Resumo Flash\n.*?(?=\n---\n|\Z)', '\n', res, flags=re.S); print('Resumo Flash removidos:', c)
        open(sys.argv[4], 'w', encoding='utf-8').write(res); print('reescritas:', n, 'de', len(Q), '| campo Artigo preenchido em:', nart)
        # relatório para o usuário ver ANTES de qualquer alteração de gabarito
        def num(i): return re.search(r'## QUESTÃO (\d+)', partes[1 + 2 * i]).group(1)
        rel = ['# Relatório da formatação', '', f'Questões reescritas: {n} de {len(Q)} · campo Artigo preenchido em {nart}', '',
               '## Gabaritos a conferir (nada foi alterado; decida você)', '']
        rel += [f"- **#{num(i)}** `{Q[i]['id']}` · gabarito atual **{Q[i]['gab']}** · {ate.replace('**', '')}" for i, ate in conferir] or ['- Nenhum.']
        rel += ['', '## Gabarito resolvido por IA (confiança média)', '']
        ia = [i for i in R if 'gabarito resolvido por IA' in Q[i]['res']]
        rel += [f"- **#{num(i)}** `{Q[i]['id']}` · gabarito **{Q[i]['gab']}**" for i in ia] or ['- Nenhum.']
        rel += ['', '## Valores atualizáveis por decreto (art. 182): conferir o valor vigente', '']
        rel += [f"- **#{num(i)}** `{Q[i]['id']}` · {e.replace('**', '')[:140]}" for i, e in atualizaveis] or ['- Nenhum.']
        rel += ['', '## Sem linha ⚖️ (dispositivo não confirmado ou matéria sem base legal)', '', f'- {len(sem_base)} questão(ões)'
                + (': ' + ', '.join('#' + num(i) for i in sem_base[:40]) if sem_base and len(sem_base) <= 40 else '')]
        open(sys.argv[4].rsplit('.md', 1)[0] + '.relatorio.md', 'w', encoding='utf-8').write('\n'.join(rel) + '\n')
    elif cmd == 'faltantes':
        txt, partes, Q = ler(sys.argv[2])
        falt = [i for i, q in enumerate(Q) if sem_classificacao(q)]
        print(f'{len(falt)} item(ns) certo/errado sem classificação (de {sum(1 for q in Q if q["gab"] in ("Certo", "Errado"))})')
        for i in falt: print(f"#{i} {Q[i]['id']} [{Q[i]['gab']}] {Q[i]['enun'][:200]!r}")
    elif cmd == 'classificar':
        txt, partes, Q = ler(sys.argv[2]); ns = {}; exec(open(sys.argv[3], encoding='utf-8').read(), ns); P = ns['P']
        out = [partes[0]]; n = 0
        for i, k in enumerate(range(1, len(partes), 2)):
            cab, b = partes[k], partes[k + 1]
            if i in P:
                for c in ('Sinal', 'Armadilha', 'Trecho', 'Explicação', 'Origem da classificação'):
                    b = re.sub(r'(?m)^\*\*' + c + r':\*\*.*\n', '', b)
                novos = ''.join(f'**{c}:** {v}\n' for c, v in P[i].items()) + '**Origem da classificação:** ia\n'
                b, ok = re.subn(r'(?m)^(\*\*Cobrança:\*\*.*\n)', lambda m: m.group(1) + novos, b, count=1); assert ok == 1; n += 1
            out += [cab, b]
        open(sys.argv[4], 'w', encoding='utf-8').write(''.join(out)); print('classificadas:', n)
    elif cmd == 'repetidas':
        import difflib
        txt, partes, Q = ler(sys.argv[2]); lim = float(sys.argv[3]) if len(sys.argv) > 3 else 0.85
        N = [norm_txt(q['enun']) for q in Q]; achou = []
        for i in range(len(Q)):
            for j in range(i + 1, len(Q)):
                if abs(len(N[i]) - len(N[j])) > 0.4 * max(len(N[i]), len(N[j]), 1): continue
                r = difflib.SequenceMatcher(None, N[i], N[j]).ratio()
                if r >= lim: achou.append((r, i, j))
        print(f'{len(achou)} par(es) com enunciado ≥ {lim:.0%} parecido')
        for r, i, j in sorted(achou, reverse=True): print(f"{r:.0%} #{i} {Q[i]['id']} × #{j} {Q[j]['id']} · {Q[i]['enun'][:110]!r}")
