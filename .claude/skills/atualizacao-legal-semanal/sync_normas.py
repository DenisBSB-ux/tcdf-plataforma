#!/usr/bin/env python3
"""Sincroniza js/<norma>-texto.js com o texto CONSOLIDADO oficial do Normas.leg.br (Senado/LexML Brasil, API pública que aceita leitura automática).
Uso (raiz do repositório): python3 .claude/skills/atualizacao-legal-semanal/sync_normas.py [--norma "Lei 14.133"] [--so-relatorio]
Para cada norma de fontes_senado.json: descobre a URN pela base do Senado, baixa a norma estruturada (`/api/public/normas?urn=…&&tipo_documento=maior-detalhe`),
monta o texto vigente de cada artigo (última versão em vigor de cada dispositivo) e compara com o js atual.
Salvaguardas: (1) só mexe em normas que a API traz estruturadas (hasPart); (2) PORTÃO DE FIDELIDADE: se menos de 80% dos artigos inalterados
reproduzirem o js atual depois de normalizar, o parser é considerado suspeito e nada é gravado; (3) mais de 20% de artigos 'alterados' = suspeito;
(4) nunca apaga artigo nem linha; só troca, linha a linha, as que mudaram de forma substantiva quando a estrutura do artigo (nº de linhas e rótulos) bate; estrutura diferente só é relatada. Registra em ALTERACOES_LEGAIS (status confirmada, dispositivos = artigos reescritos).
Saída: relatório JSON."""
import json, os, re, sys, datetime, unicodedata, urllib.request, urllib.parse
SK = os.path.dirname(os.path.abspath(__file__)); RAIZ = os.getcwd()
H = {'Accept': 'application/json', 'User-Agent': 'TCDF-Plataforma-sync/1.0 (estudo pessoal; leitura de dados abertos)'}
def get(u, t=180): return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=t))
def lst(x): return [] if x in (None, '', {}) else (x if isinstance(x, list) else [x])
TIPO_URN = {'LEI': 'lei', 'LCP': 'lei.complementar', 'DEC': 'decreto', 'DEL': 'decreto.lei'}
def urn_da_norma(f):
    if f['tipo'] == 'CON': return 'urn:lex:br:federal:constituicao:1988-10-05;1988'
    q = {'tipo': f['tipo'], 'numero': f['numero'], 'ano': f['ano']}
    d = get('https://legis.senado.leg.br/dadosabertos/legislacao/lista?' + urllib.parse.urlencode(q))['ListaDocumento']['documentos']
    docs = lst(d.get('documento') if isinstance(d, dict) else d)
    dt = datetime.datetime.strptime(docs[0]['dataassinatura'], '%d/%m/%Y').strftime('%Y-%m-%d')
    return 'urn:lex:br:federal:%s:%s;%s' % (TIPO_URN[f['tipo']], dt, f['numero'])
ROM = [(1000,'M'),(900,'CM'),(500,'D'),(400,'CD'),(100,'C'),(90,'XC'),(50,'L'),(40,'XL'),(10,'X'),(9,'IX'),(5,'V'),(4,'IV'),(1,'I')]
def romano(n):
    s = ''
    for v, r in ROM:
        while n >= v: s += r; n -= v
    return s
def limpa(t):
    import html as H
    return re.sub(r'\s+', ' ', H.unescape(re.sub(r'<[^>]+>', '', t))).strip()
def versao_vigente(node):
    vs = lst(node.get('workExample'))
    ok = [v for v in vs if 'text' in v and 'NotInForce' not in str(v.get('legislationLegalForce', ''))]
    if not ok: return None
    return max(ok, key=lambda v: v.get('legislationDate', ''))
def idl(i):
    """identificador sem prefixo da URN e sem o sufixo ',emc-…' que a API põe em dispositivos acrescidos"""
    return i.split('!')[-1].split(',')[0]
def sufixo(c):   # 'art75a' -> '75-A'; 'art7-1' -> '7-A'
    m = re.match(r'art(\d+)(?:-(\d+)|([a-z]*))$', c)
    if not m: return None
    suf = chr(64 + int(m.group(2))) if m.group(2) else (m.group(3).upper() if m.group(3) else '')
    return m.group(1) + ('-' + suf if suf else '')
def rotulo_nome(v):
    nm = (v or {}).get('name') if isinstance(v, dict) else None
    if not nm: return None
    nm = re.sub(r'\s+', ' ', str(nm).replace('–', '-').replace('—', '-')).strip()
    if re.match(r'^Art\.', nm): return None
    return nm + ' '
def rotulo(ident, tipo_art):
    """rótulo textual a partir do identificador do dispositivo (ex.: art75_cpt_inc16 -> 'XVI - ')"""
    p = ident.split('_')[-1].split(',')[0]
    m = re.match(r'par(\d+)-(\d+)$', p)
    if m: return '§ %sº-%s ' % (m.group(1), chr(64 + int(m.group(2))))
    m = re.match(r'inc(\d+)-(\d+)$', p)
    if m: return romano(int(m.group(1))) + '-' + chr(64 + int(m.group(2))) + ' - '
    m = re.match(r'inc(\d+)([a-z]*)$', p)
    if m: return romano(int(m.group(1))) + ('-' + m.group(2).upper() if m.group(2) else '') + ' - '
    m = re.match(r'ali(\d+)$', p)
    if m:
        n = int(m.group(1)); return (chr(96 + n) if n <= 26 else chr(96 + (n - 1) // 26) + chr(97 + (n - 1) % 26)) + ') '
    m = re.match(r'ali([a-z]+)$', p)
    if m: return m.group(1) + ') '
    m = re.match(r'par(\d+)([a-z]*)$', p)
    if m:
        n = int(m.group(1))
        if m.group(2) == 'u': return 'Parágrafo único. '
        return '§ %d%s%s ' % (n, 'º' if n <= 9 else '.', ('-' + m.group(2).upper()) if m.group(2) else '')
    if p in ('par1u', 'paru', 'parunico', 'par_u') or 'unico' in p: return 'Parágrafo único. '
    if re.match(r'it\d+', p): return re.match(r'it(\d+)', p).group(1) + '. '
    return ''
def linhas_do_artigo(art):
    """lista de linhas [caput, § …, incisos…] com o texto vigente; revogados saem como '(Revogado)'."""
    out = []
    def desce(n):
        ident = idl(n.get('legislationIdentifier', ''))
        v = versao_vigente(n)
        if v is not None and ident != idl(art.get('legislationIdentifier', '')):
            out.append(((rotulo_nome(v) or rotulo(ident, None)) + limpa(v['text'])).strip())
        for h in lst(n.get('hasPart')): desce(h)
    cap = None
    for h in lst(art.get('hasPart')):
        i = idl(h.get('legislationIdentifier', ''))
        if i.endswith('_cpt'): cap = h
    # caput primeiro (com o rótulo Art.), depois os demais na ordem
    num = sufixo(idl(art.get('legislationIdentifier', '')))
    if num is None: return None, None
    n0 = int(re.match(r'\d+', num).group())
    head = ('Art. %d%s ' % (n0, 'º' if n0 <= 9 else '.')).replace('Art. %d' % n0, 'Art. ' + num, 1)
    vc = versao_vigente(cap) if cap else None
    out.append(head + (limpa(vc['text']) if vc else ''))
    if cap:
        for h in lst(cap.get('hasPart')): desce(h)
    for h in lst(art.get('hasPart')):
        if h is cap: continue
        desce(h)
    out = [l for l in out if not re.match(r'^(?:[IVXLC]+\s*-\s*|§\s*\d+\S*\s*|[a-z]\)\s*|Art\.\s*\S+\s*|Parágrafo único\.\s*)?\((?:Suprimido)\)\.?$', l)]
    return num, out
def norm(ps):
    t = ' '.join(ps); t = re.sub(r'\([^)]*\)', ' ', t)
    t = unicodedata.normalize('NFD', t); t = ''.join(c for c in t if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+', '', t.lower())
def iguais(a, b):
    """compara artigo a artigo, dispositivo a dispositivo; tolera ruído dos textos antigos (notas '(Vide …)', 'Vigência', título de seção colado no fim, hífen de quebra de linha)"""
    import difflib
    if len(a) != len(b): return False
    for x, y in zip(a, b):
        nx, ny = norm([x]), norm([y])
        if nx == ny: continue
        if nx and ny and (nx in ny or ny in nx) and abs(len(nx) - len(ny)) <= 240: continue          # ruído colado (nota, título de seção): o texto novo está contido no antigo
        if nx and ny and difflib.SequenceMatcher(None, nx, ny, autojunk=False).ratio() >= 0.97: continue
        return False
    return True
def linha_igual(x, y):
    import difflib
    nx, ny = norm([x]), norm([y])
    if nx == ny: return True
    if nx and ny and (nx in ny or ny in nx) and abs(len(nx) - len(ny)) <= 240: return True
    if re.search(r'\((?:Revogad[oa]s?|Suprimid[oa]s?)\)\.?\s*$', x) and not re.search(r'\((?:Revogad[oa]s?|Suprimid[oa]s?)', y): return False   # revogação nova: sempre troca
    # só troca quando a redação mudou de verdade (similaridade < 0,80); ajustes de forma/abreviação do consolidado não valem a troca
    return bool(nx and ny and difflib.SequenceMatcher(None, nx, ny, autojunk=False).ratio() >= 0.80)
def rotulo_da_linha(l):
    m = re.match(r'^(Art\.\s*\S+|§\s*\S+|Parágrafo único\.|[IVXLC]+(?:-[A-Z])?\s*-|[a-z]{1,2}\))', l)
    return re.sub(r'\s+', '', m.group(1)).lower() if m else ''
REVOG = re.compile(r'\((?:Revogad[oa]s?|Suprimid[oa]s?)\)\.?\s*$')
def remendo(novo_ls, atual_ls, maximo=3):
    """patch por linha: só quando as linhas batem em número e rótulo e poucas diferem de forma substantiva; senão devolve None (estrutura divergente: não reescreve)"""
    if len(novo_ls) != len(atual_ls): return None
    out = list(atual_ls); dif = 0
    for i, (x, y) in enumerate(zip(novo_ls, atual_ls)):
        if linha_igual(x, y): continue
        if rotulo_da_linha(x) != rotulo_da_linha(y): return None
        if not REVOG.search(x): return 'SUBSTANTIVA'      # redação diferente (não é revogação): não reescreve, só sinaliza
        out[i] = x; dif += 1
        if dif > maximo: return None
    return out if dif else []
def artigos_da_api(d):
    res = {}
    def acha(n):
        ident = idl(n.get('legislationIdentifier', '')) if isinstance(n, dict) else ''
        if re.match(r'art\d+(?:-\d+|[a-z]*)$', ident):
            num, ls = linhas_do_artigo(n)
            if num and ls: res[num] = ls
            return
        if isinstance(n, dict):
            for h in lst(n.get('hasPart')): acha(h)
    for h in lst(d.get('hasPart')): acha(h)
    return res
def carrega_js(arq, glob):
    t = open(arq, encoding='utf-8').read(); i = t.index('{', t.index(glob)); j = t.rindex('}')
    return t, json.loads(t[i:j + 1])
def artigos_recentes(f, desde=2025):
    """artigos citados em alterações oficiais (base do Senado) assinadas a partir de `desde`: só nesses vale reescrever artigo inteiro com estrutura divergente"""
    import importlib.util
    spec = importlib.util.spec_from_file_location('detectar_alteracoes', os.path.join(SK, 'detectar_alteracoes.py')); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    i = m.achar_id(f); out = set()
    for x in m.vides_de(i).values():
        ano = int(str(x['data'])[-4:] or 0)
        if ano < desde: continue
        for it in x['itens']:
            mm = re.match(r'\s*Art\.?\s*(\d+)', it)
            if mm: out.add(int(mm.group(1)))
    return out
def main():
    a = sys.argv; so_rel = '--so-relatorio' in a; sel = a[a.index('--norma') + 1] if '--norma' in a else None
    fontes = {k: v for k, v in json.load(open(os.path.join(SK, 'fontes_senado.json'), encoding='utf-8')).items() if not k.startswith('_')}
    teoria = open(os.path.join(RAIZ, 'js/teoria.js'), encoding='utf-8').read()
    rel = []; novos = []; subst_all = []
    for norma, f in fontes.items():
        if sel and norma != sel: continue
        m = re.search(r"'?" + re.escape(norma) + r"'?\s*:\s*\{\s*arquivo:'([^']+)',\s*global:'([^']+)'", teoria)
        if not m: rel.append({'norma': norma, 'status': 'sem entrada em LEI_FONTES'}); continue
        arq, glob = os.path.join(RAIZ, m.group(1)), m.group(2)
        try:
            urn = urn_da_norma(f)
            d = get('https://normas.leg.br/api/public/normas?urn=%s&&tipo_documento=maior-detalhe' % urn)
            if not d.get('hasPart'): rel.append({'norma': norma, 'status': 'API sem texto estruturado desta norma (fica por pesquisa/arquivo)'}); continue
            novo = artigos_da_api(d)
            txt_js, atual = carrega_js(arq, glob)
        except Exception as e:
            rel.append({'norma': norma, 'status': 'erro', 'erro': str(e)[:160]}); continue
        comuns = [k for k in novo if k in atual]
        if len(novo) < 0.85 * len(atual) or not comuns: rel.append({'norma': norma, 'status': 'extração suspeita (artigos %d de %d): nada alterado' % (len(novo), len(atual))}); continue
        igs = [k for k in comuns if iguais(novo[k], atual[k])]
        remendos = {}; divergentes = []; substantivas = []
        for k in comuns:
            if k in igs: continue
            r_ = remendo(novo[k], atual[k])
            if r_ == 'SUBSTANTIVA': substantivas.append(k)
            elif r_: remendos[k] = r_
            elif r_ is None:
                divergentes.append(k)      # estrutura diferente: NÃO reescreve (o detector por alterações oficiais já marca o artigo; ver relatório)
        fid = len(igs) / len(comuns)
        alt = sorted(remendos, key=lambda x: (int(re.match(r'\d+', x).group()), x))
        if fid < 0.80: rel.append({'norma': norma, 'status': 'fidelidade baixa (%.0f%% dos artigos iguais): parser suspeito, nada alterado' % (100 * fid), 'amostra': alt[:8]}); continue
        r = {'norma': norma, 'status': 'sem mudança' if not (alt or substantivas) else 'mudou', 'fidelidade': round(fid, 3), 'artigos_alterados': alt, 'redacao_diferente_so_sinalizada': sorted(substantivas, key=lambda x: (int(re.match(r'\d+', x).group()), x)), 'estrutura_divergente_nao_reescritos': sorted(divergentes, key=lambda x: (int(re.match(r'\d+', x).group()), x))}
        rel.append(r)
        if substantivas and not so_rel: subst_all.append((norma, f['mat'], sorted(substantivas, key=lambda x: (int(re.match(r'\d+', x).group()), x))))
        if alt and not so_rel:
            hoje = datetime.date.today().strftime('%d/%m/%Y')
            for k in alt:
                ls = list(remendos[k]); ls[0] = re.sub(r' \(Texto atualizado em [^)]*\)', '', ls[0]) + ' (Texto atualizado em %s, base Normas.leg.br)' % hoje
                atual[k] = ls
            i = txt_js.index('{', txt_js.index(glob)); j = txt_js.rindex('}')
            ordem = dict(sorted(atual.items(), key=lambda kv: (int(re.match(r'\d+', kv[0]).group()), kv[0])))
            open(arq, 'w', encoding='utf-8').write(txt_js[:i] + json.dumps(ordem, ensure_ascii=False) + txt_js[j + 1:])
            novos.append((norma, f['mat'], alt))
    if (novos or subst_all) and not so_rel:
        p = os.path.join(RAIZ, 'js/atualizacoes-legais.js'); s = open(p, encoding='utf-8').read(); hoje_iso = datetime.date.today().isoformat(); itens = ''
        esc = lambda x: x.replace('\\', '\\\\').replace("'", "\\'")
        for norma, mat, alt in novos:
            ident = 'txt-' + re.sub(r'\W+', '-', norma.lower()) + '-' + hoje_iso
            if ("id:'" + ident + "'") in s: continue
            lista = ', '.join('art. ' + k for k in alt[:12]) + (' e outros' if len(alt) > 12 else '')
            disp = ','.join("{norma:'%s', n:%d}" % (norma, int(re.match(r'\d+', k).group())) for k in sorted({k for k in alt}, key=lambda x: (int(re.match(r'\d+', x).group()), x))[:60])
            itens += "  { id:'%s', mat:'%s', titulo:'Texto atualizado no pop-up: %s (%s)', resumo:'%s', fonte:'Normas.leg.br (Senado) · texto consolidado, comparação automática', registrada:'%s', status:'confirmada', dispositivos:[%s], gabarito:'' },\n" % (ident, esc(mat), esc(norma), esc(lista), esc('O texto do pop-up foi reescrito com a redação vigente em: %s. Questões que citam esses artigos ficam marcadas: conferir se o gabarito dependia da redação antiga.' % lista), hoje_iso, disp)
        for norma, mat, sub in subst_all:
            ident = 'dif-' + re.sub(r'\W+', '-', norma.lower()) + '-' + hoje_iso
            if ("id:'" + ident + "'") in s: continue
            lista = ', '.join('art. ' + k for k in sub[:12]) + (' e outros' if len(sub) > 12 else '')
            disp = ','.join("{norma:'%s', n:%d}" % (norma, int(re.match(r'\d+', k).group())) for k in sub[:60])
            itens += "  { id:'%s', mat:'%s', titulo:'Redação diferente do texto consolidado oficial: %s (%s)', resumo:'%s', fonte:'Normas.leg.br (Senado) · texto consolidado, comparação automática', registrada:'%s', status:'a-conferir', dispositivos:[%s], gabarito:'' },\n" % (ident, esc(mat), esc(norma), esc(lista), esc('O texto do pop-up difere do texto consolidado oficial nestes artigos (pode ser forma/abreviação ou atualização pendente): %s. Conferir.' % lista), hoje_iso, disp)
        if itens:
            k = s.index('const ALTERACOES_LEGAIS = ['); e = s.index('\n];', k); s = s[:e + 1] + itens + s[e + 1:]; open(p, 'w', encoding='utf-8').write(s)
    print(json.dumps(rel, ensure_ascii=False, indent=1))
main()
