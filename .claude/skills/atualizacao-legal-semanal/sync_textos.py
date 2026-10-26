#!/usr/bin/env python3
"""Sincroniza js/<norma>-texto.js com o texto oficial (Planalto) e registra a mudança em ALTERACOES_LEGAIS.
Uso (da raiz do repositório):  python3 .claude/skills/atualizacao-legal-semanal/sync_textos.py [--norma "Lei 14.133"] [--arquivo html_local --norma X] [--so-relatorio]
Para cada norma de fontes_oficiais.json: baixa a página, extrai os artigos (mesmo parser de gerar_texto_lei.py: vale o texto vigente),
compara com o js atual e, se algum artigo mudou: reescreve o js (só se a extração for confiável), e acrescenta item 'confirmada' em ALTERACOES_LEGAIS
(js/atualizacoes-legais.js) com os artigos alterados (dispositivos), para a plataforma marcar as questões que os citam.
Salvaguardas: falha de rede/parse nunca apaga texto; troca só se a nova extração tiver >=90% dos artigos atuais e nenhum artigo antigo some sem substituto
(artigo revogado aparece no texto oficial como "(Revogado)" e é aceito). Gabarito/lista nunca são tocados.
Saída: relatório JSON em stdout (norma, status, artigos_alterados, artigos_novos, erro)."""
import re, sys, json, os, hashlib, datetime, urllib.request, html as H
from html.parser import HTMLParser
RAIZ = os.getcwd(); SK = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(SK, '..', 'aplicar-teoria-materia'))
import gerar_texto_lei as G

class T(HTMLParser):
    def __init__(s): super().__init__(); s.o = []; s.skip = 0
    def handle_starttag(s, t, a):
        if t in ('script', 'style'): s.skip += 1
        if t in ('p', 'br', 'div', 'tr', 'li', 'h1', 'h2', 'h3', 'h4'): s.o.append('\n')
    def handle_endtag(s, t):
        if t in ('script', 'style'): s.skip = max(0, s.skip - 1)
        if t in ('p', 'div', 'tr', 'li'): s.o.append('\n')
    def handle_data(s, d):
        if not s.skip: s.o.append(d)
def html_para_texto(b):
    # <strike>/<s>/<del> = texto revogado/antigo (Planalto risca): descarta antes de converter
    b = re.sub(r'(?is)<(strike|s|del)\b[^>]*>.*?</\1>', '', b)
    p = T(); p.feed(b); return H.unescape(''.join(p.o)).replace('\xa0', ' ')
def baixa(url):
    rq = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (TCDF-Plataforma sync)'})
    raw = urllib.request.urlopen(rq, timeout=60).read()
    for enc in ('utf-8', 'windows-1252', 'latin-1'):
        try: return raw.decode(enc)
        except Exception: pass
def carrega_js(arq, glob):
    t = open(arq, encoding='utf-8').read(); i = t.index('{', t.index(glob)); j = t.rindex('}')
    return t, json.loads(t[i:j + 1])
def norm(ps): return re.sub(r'\s+', ' ', ' '.join(ps)).strip()
def main():
    a = sys.argv; so_rel = '--so-relatorio' in a
    sel = a[a.index('--norma') + 1] if '--norma' in a else None
    arq_local = a[a.index('--arquivo') + 1] if '--arquivo' in a else None
    fontes = {k: v for k, v in json.load(open(os.path.join(SK, 'fontes_oficiais.json'), encoding='utf-8')).items() if not k.startswith('_')}
    teoria = open(os.path.join(RAIZ, 'js/teoria.js'), encoding='utf-8').read()
    rel = []; novos = []
    for norma, f in fontes.items():
        if sel and norma != sel: continue
        m = re.search(r"'?" + re.escape(norma) + r"'?\s*:\s*\{\s*arquivo:'([^']+)',\s*global:'([^']+)'", teoria)
        if not m: rel.append({'norma': norma, 'status': 'sem entrada em LEI_FONTES'}); continue
        arq, glob = os.path.join(RAIZ, m.group(1)), m.group(2)
        try:
            bruto = open(arq_local, encoding='utf-8').read() if arq_local else baixa(f['url'])
            novo = G.parse(G.limpa(html_para_texto(bruto)))
            txt_js, atual = carrega_js(arq, glob)
        except Exception as e:
            rel.append({'norma': norma, 'status': 'erro', 'erro': str(e)[:200]}); continue
        if len(novo) < 0.9 * len(atual):
            rel.append({'norma': norma, 'status': 'extração suspeita (artigos %d de %d): nada alterado' % (len(novo), len(atual))}); continue
        alt = sorted([k for k in novo if k in atual and norm(novo[k]) != norm(atual[k])], key=lambda x: (len(x), x))
        add = sorted([k for k in novo if k not in atual], key=lambda x: (len(x), x))
        r = {'norma': norma, 'status': 'sem mudança' if not (alt or add) else 'mudou', 'artigos_alterados': alt, 'artigos_novos': add}
        rel.append(r)
        if (alt or add) and not so_rel:
            atual.update({k: novo[k] for k in alt + add})
            i = txt_js.index('{', txt_js.index(glob)); j = txt_js.rindex('}')
            ordem = dict(sorted(atual.items(), key=lambda kv: (int(re.match(r'\d+', kv[0]).group()), kv[0])))
            open(arq, 'w', encoding='utf-8').write(txt_js[:i] + json.dumps(ordem, ensure_ascii=False) + txt_js[j + 1:])
            nums = [int(re.match(r'\d+', k).group()) for k in alt + add]
            novos.append((norma, f['mat'], alt, add, nums))
    if novos and not so_rel:
        p = os.path.join(RAIZ, 'js/atualizacoes-legais.js'); s = open(p, encoding='utf-8').read()
        hoje = datetime.date.today().isoformat(); itens = ''
        for norma, mat, alt, add, nums in novos:
            lista = ', '.join('art. ' + k for k in (alt + add)[:12]) + (' e outros' if len(alt + add) > 12 else '')
            ident = 'auto-' + re.sub(r'\W+', '-', norma.lower()) + '-' + hoje
            if ("id:'" + ident + "'") in s: continue
            disp = ','.join("{norma:'%s', n:%d}" % (norma, n) for n in sorted(set(nums))[:40])
            itens += "  { id:'%s', mat:'%s', titulo:'Texto oficial atualizado: %s (%s)', resumo:'A rotina comparou o texto do Planalto com o carregado na plataforma e encontrou diferença em: %s. O pop-up já mostra o texto novo. Questões que citam esses artigos ficam marcadas: revisar o gabarito se ele dependia do texto antigo.', fonte:'Planalto (texto oficial, comparação automática de %s)', registrada:'%s', status:'confirmada', dispositivos:[%s], gabarito:'' },\n" % (ident, mat.replace('\\', '\\\\').replace("'", "\\'"), norma, lista.replace('art. ', 'art. ', 1), lista, hoje, hoje, disp)
        if itens:
            k = s.index('const ALTERACOES_LEGAIS = ['); e = s.index('\n];', k)
            s = s[:e + 1] + itens + s[e + 1:]; open(p, 'w', encoding='utf-8').write(s)
    print(json.dumps(rel, ensure_ascii=False, indent=1))
main()
