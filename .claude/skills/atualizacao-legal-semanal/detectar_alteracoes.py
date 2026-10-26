#!/usr/bin/env python3
"""Detecta, na base OFICIAL do Senado (API de dados abertos, aceita leitura automática), normas posteriores que alteram, acrescentam ou revogam
dispositivos das normas carregadas na plataforma (fontes_senado.json) e registra em ALTERACOES_LEGAIS (js/atualizacoes-legais.js).
Uso (raiz do repositório):  python3 .claude/skills/atualizacao-legal-semanal/detectar_alteracoes.py [--baseline] [--so-relatorio]
  --baseline    primeira execução: memoriza tudo que já existe (vides_vistas.json) sem criar alertas.
Funcionamento: para cada norma, lê `vides` (normas posteriores com os dispositivos alterados); o que não estava em vides_vistas.json vira item
`confirmada` com `dispositivos` (norma+artigo): a plataforma marca as questões que citam esses artigos (🔔) e avisa no pop-up da lei.
Também atualiza a data/resumo do selo das matérias cobertas (conferência feita hoje na base oficial). Nunca altera gabarito, lista ou texto de lei."""
import json, os, re, sys, datetime, urllib.request, urllib.parse
SK = os.path.dirname(os.path.abspath(__file__)); RAIZ = os.getcwd()
H = {'Accept': 'application/json', 'User-Agent': 'TCDF-Plataforma-sync/1.0 (estudo pessoal; leitura de dados abertos)'}
API = 'https://legis.senado.leg.br/dadosabertos/legislacao/'
def get(u):
    return json.load(urllib.request.urlopen(urllib.request.Request(u, headers=H), timeout=60))
def lst(x):
    if x in (None, '', {}): return []
    return x if isinstance(x, list) else [x]
def achar_id(f):
    q = {'tipo': f['tipo']}
    if f.get('numero'): q['numero'] = f['numero']
    if f.get('ano'): q['ano'] = f['ano']
    d = get(API + 'lista?' + urllib.parse.urlencode(q))['ListaDocumento']['documentos']
    docs = lst(d.get('documento') if isinstance(d, dict) else d)
    if not docs: return None
    if f['tipo'] == 'CON': docs = [x for x in docs if 'REP' in x.get('normaNome', '').upper() and '1988' in str(x.get('anoassinatura', '1988'))] or docs
    return docs[0]['id']
def vides_de(i):
    doc = get(API + str(i))['DetalheDocumento']['documentos']['documento']
    doc = doc[0] if isinstance(doc, list) else doc
    v = doc.get('vides') or {}
    out = {}
    for x in lst(v.get('vide') if isinstance(v, dict) else v):
        com = (x.get('comentario') or '')
        itens = lst((x.get('itens') or {}).get('item') if isinstance(x.get('itens'), dict) else None)
        tipos = ' '.join([com] + [it.get('comentario', '') for it in itens])
        if not re.search(r'Altera|Acr[ée]scimo|Revoga|Nova Reda', tipos, re.I): continue          # ignora regulamentação, legislação correlata etc.
        cod = str(x.get('codnormaposterior'))
        e = out.setdefault(cod, {'cod': cod, 'nome': x.get('nomeNormaPosterior', ''), 'data': x.get('datAssinatura', ''), 'itens': [], 'tipos': set()})
        for it in itens:
            e['itens'].append(it.get('dispositivo', '').strip()); e['tipos'].add(it.get('comentario', ''))
        e['tipos'].add(com)
    return out
def verbo(tipos):
    t = ' '.join(tipos)
    if re.search(r'Revoga', t, re.I): return 'revoga'
    if re.search(r'Acr[ée]scimo', t, re.I): return 'acrescenta'
    return 'altera'
def main():
    base = '--baseline' in sys.argv; so_rel = '--so-relatorio' in sys.argv
    fontes = {k: v for k, v in json.load(open(os.path.join(SK, 'fontes_senado.json'), encoding='utf-8')).items() if not k.startswith('_')}
    ep = os.path.join(SK, 'vides_vistas.json'); vistas = json.load(open(ep, encoding='utf-8')) if os.path.exists(ep) else {}
    hoje = datetime.date.today(); hoje_iso = hoje.isoformat(); hoje_br = hoje.strftime('%d/%m/%Y')
    rel = []; itens_novos = []; ok_norma = {}
    for norma, f in fontes.items():
        try:
            i = achar_id(f)
            if not i: rel.append({'norma': norma, 'status': 'não encontrada na base do Senado'}); continue
            v = vides_de(i); ok_norma[norma] = True
        except Exception as e:
            rel.append({'norma': norma, 'status': 'erro', 'erro': str(e)[:160]}); continue
        antigos = set(vistas.get(norma, []))
        novos = [x for c, x in v.items() if c not in antigos]
        vistas[norma] = sorted(set(v) | antigos)
        r = {'norma': norma, 'id': i, 'alteracoes_conhecidas': len(v), 'novas': [x['nome'] for x in novos if not base]}
        rel.append(r)
        if base: continue
        for x in novos:
            nums = sorted({int(m.group(1)) for it in x['itens'] for m in [re.match(r'\s*Art\.?\s*(\d+)', it)] if m})
            disp = ','.join("{norma:'%s', n:%d}" % (norma, n) for n in nums[:60])
            lista = '; '.join(sorted(set(re.sub(r'\s+', ' ', it).strip() for it in x['itens']))[:10]) or 'dispositivos não detalhados na base'
            ident = 'sen-' + re.sub(r'\W+', '-', norma.lower()) + '-' + x['cod']
            titulo = '%s %s %s' % (x['nome'], verbo(x['tipos']), norma)
            resumo = 'Base oficial do Senado (alteração permanente declarada em %s): %s. Dispositivos: %s. O texto do pop-up pode estar desatualizado nesses artigos; questões que os citam ficam marcadas: conferir o gabarito.' % (x['data'], titulo, lista)
            esc = lambda s: s.replace('\\', '\\\\').replace("'", "\\'")
            itens_novos.append((norma, "  { id:'%s', mat:'%s', titulo:'%s', resumo:'%s', fonte:'Senado Federal · base oficial de legislação (dados abertos)', registrada:'%s', status:'confirmada', dispositivos:[%s], gabarito:'' },\n" % (ident, esc(f['mat']), esc(titulo), esc(resumo), hoje_iso, disp)))
    json.dump(vistas, open(ep, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    if not so_rel:
        p = os.path.join(RAIZ, 'js/atualizacoes-legais.js'); s = open(p, encoding='utf-8').read()
        if itens_novos:
            k = s.index('const ALTERACOES_LEGAIS = ['); e = s.index('\n];', k)
            add = ''.join(t for _, t in itens_novos if ("id:'" + re.search(r"id:'([^']+)'", t).group(1) + "'") not in s)
            s = s[:e + 1] + add + s[e + 1:]
        # selo: matérias cobertas hoje pela base oficial
        nomes = sorted({m for n, f in fontes.items() if ok_norma.get(n) for m in f['materias']})
        marca = ' Base oficial do Senado conferida em %s (alterações por norma posterior).' % hoje_br
        out = []
        for linha in s.split('\n'):
            mm = re.match(r"\s*\{ re: '([^']*)', data: '(\d{4}-\d{2}-\d{2})', resumo: '(.*)' \},?\s*$", linha)
            if mm:
                rx = mm.group(1).replace('\\\\', '\\')
                if any(re.search(rx, n, re.I) for n in nomes):
                    res = re.sub(r" Base oficial do Senado conferida em \d{2}/\d{2}/\d{4} \(alterações por norma posterior\)\.", '', mm.group(3)) + marca
                    linha = linha.replace("data: '%s'" % mm.group(2), "data: '%s'" % hoje_iso, 1)
                    linha = linha.replace("resumo: '%s'" % mm.group(3), "resumo: '%s'" % res, 1)
            out.append(linha)
        s = '\n'.join(out)
        open(p, 'w', encoding='utf-8').write(s)
    print(json.dumps({'baseline': base, 'normas': rel, 'novos_registros': [n for n, _ in itens_novos]}, ensure_ascii=False, indent=1))
main()
