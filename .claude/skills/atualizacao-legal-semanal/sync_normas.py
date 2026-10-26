#!/usr/bin/env python3
"""Sincroniza o texto dos pop-ups de lei (js/<norma>-texto.js) com o texto CONSOLIDADO oficial do Normas.leg.br (Senado / LexML Brasil).

Uso (na raiz do repositório):
    python3 .claude/skills/atualizacao-legal-semanal/sync_normas.py [--norma "Lei 14.133"] [--so-relatorio]

    --norma        processa só uma norma (chave de LEI_FONTES em js/teoria.js, igual a fontes_senado.json)
    --so-relatorio não grava nada; só imprime o relatório (JSON)

Por que o Normas.leg.br: o Planalto bloqueia clientes automáticos; a API pública do Normas.leg.br (`/api/public/normas`) aceita
leitura automática e traz a norma estruturada (artigo > parágrafo > inciso > alínea), com as versões de cada dispositivo.

Como funciona, para cada norma de fontes_senado.json:
  1. descobre a URN pela base de dados abertos do Senado e baixa a norma (`tipo_documento=maior-detalhe`);
  2. monta, para cada artigo, as linhas do texto VIGENTE (a versão mais recente que não está marcada "NotInForce");
  3. compara com o js atual, artigo a artigo e linha a linha, tolerando o ruído dos textos antigos (notas entre parênteses,
     "Vigência", título de seção colado no fim, hífen de quebra de linha).

Salvaguardas (o texto dos pop-ups é material de estudo: texto errado é pior que texto desatualizado):
  - só age em normas que a API traz estruturadas; as antigas vêm sem estrutura e ficam por pesquisa/arquivo;
  - PORTÃO DE FIDELIDADE: se menos de 80% dos artigos em comum baterem com o js atual, o leitor é considerado suspeito e nada é gravado;
  - só troca linha a linha, e só quando a estrutura do artigo (nº de linhas e rótulos) bate;
  - troca automática SÓ de revogação ("(Revogado)"/"(Suprimido)"): o texto antigo mostrava como vigente um dispositivo morto;
  - redação diferente (não é revogação) NÃO é reescrita: vira item "a conferir" em ALTERACOES_LEGAIS (🔔 nas questões e aviso no pop-up);
  - estrutura divergente só aparece no relatório (o detector por alterações oficiais, detectar_alteracoes.py, já marca o artigo);
  - nunca apaga artigo nem linha.

Registro: revogações aplicadas viram item `txt-<norma>-<data>` (confirmada); redações diferentes viram `dif-<norma>-<data>` (a-conferir),
ambos com `dispositivos` (norma + artigo) para a plataforma marcar as questões que citam esses artigos.
Gabarito, listas e questões nunca são tocados.
"""
import datetime
import difflib
import html
import json
import os
import re
import sys
import unicodedata
import urllib.parse
import urllib.request

SKILL = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.getcwd()
CABECALHOS = {'Accept': 'application/json',
              'User-Agent': 'TCDF-Plataforma-sync/1.0 (estudo pessoal; leitura de dados abertos)'}
API_NORMAS = 'https://normas.leg.br/api/public/normas?urn=%s&&tipo_documento=maior-detalhe'
API_SENADO = 'https://legis.senado.leg.br/dadosabertos/legislacao/lista?'
TIPO_URN = {'LEI': 'lei', 'LCP': 'lei.complementar', 'DEC': 'decreto', 'DEL': 'decreto.lei'}
PORTAO_FIDELIDADE = 0.80        # fração mínima de artigos em comum que devem bater com o js atual
MAX_LINHAS_POR_ARTIGO = 3       # troca automática: no máximo N linhas revogadas por artigo
REVOGACAO = re.compile(r'\((?:Revogad[oa]s?|Suprimid[oa]s?)\)\.?\s*$')


# ---------------------------------------------------------------- rede
def baixar(url, tempo=180):
    return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=CABECALHOS), timeout=tempo))


def como_lista(x):
    if x in (None, '', {}):
        return []
    return x if isinstance(x, list) else [x]


def urn_da_norma(f):
    """URN LexML da norma (ex.: urn:lex:br:federal:lei:2021-04-01;14133), via base de dados abertos do Senado."""
    if f['tipo'] == 'CON':
        return 'urn:lex:br:federal:constituicao:1988-10-05;1988'
    consulta = {'tipo': f['tipo'], 'numero': f['numero'], 'ano': f['ano']}
    docs = baixar(API_SENADO + urllib.parse.urlencode(consulta))['ListaDocumento']['documentos']
    docs = como_lista(docs.get('documento') if isinstance(docs, dict) else docs)
    data = datetime.datetime.strptime(docs[0]['dataassinatura'], '%d/%m/%Y').strftime('%Y-%m-%d')
    return 'urn:lex:br:federal:%s:%s;%s' % (TIPO_URN[f['tipo']], data, f['numero'])


# ---------------------------------------------------------------- texto
ROMANOS = [(1000, 'M'), (900, 'CM'), (500, 'D'), (400, 'CD'), (100, 'C'), (90, 'XC'),
           (50, 'L'), (40, 'XL'), (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')]


def romano(n):
    s = ''
    for valor, letras in ROMANOS:
        while n >= valor:
            s += letras
            n -= valor
    return s


def limpar_html(t):
    """tira as marcas <span …> dos links do LexML e normaliza espaços"""
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', t))).strip()


def id_curto(identificador):
    """identificador sem a URN e sem o sufixo ',emc-…' que a API põe em dispositivos acrescidos por emenda/lei"""
    return identificador.split('!')[-1].split(',')[0]


def versao_vigente(no):
    """versão em vigor do dispositivo: a mais recente com texto que não esteja marcada 'NotInForce'"""
    vigentes = [v for v in como_lista(no.get('workExample'))
                if 'text' in v and 'NotInForce' not in str(v.get('legislationLegalForce', ''))]
    return max(vigentes, key=lambda v: v.get('legislationDate', '')) if vigentes else None


def numero_do_artigo(ident):
    """'art75' -> '75'; 'art75a' -> '75-A'; 'art7-1' -> '7-A'"""
    m = re.match(r'art(\d+)(?:-(\d+)|([a-z]*))$', ident)
    if not m:
        return None
    sufixo = chr(64 + int(m.group(2))) if m.group(2) else (m.group(3).upper() if m.group(3) else '')
    return m.group(1) + ('-' + sufixo if sufixo else '')


def rotulo_pelo_nome(versao):
    """rótulo que a própria API traz no campo `name` (ex.: 'XIII –', '§ 2º', 'Parágrafo único.')"""
    nome = (versao or {}).get('name') if isinstance(versao, dict) else None
    if not nome:
        return None
    nome = re.sub(r'\s+', ' ', str(nome).replace('–', '-').replace('—', '-')).strip()
    return None if nome.startswith('Art.') else nome + ' '


def rotulo_pelo_id(ident):
    """rótulo montado a partir do identificador (ex.: art75_cpt_inc16 -> 'XVI - ')"""
    p = ident.split('_')[-1]
    m = re.match(r'par(\d+)-(\d+)$', p)
    if m:
        return '§ %sº-%s ' % (m.group(1), chr(64 + int(m.group(2))))
    m = re.match(r'inc(\d+)-(\d+)$', p)
    if m:
        return romano(int(m.group(1))) + '-' + chr(64 + int(m.group(2))) + ' - '
    m = re.match(r'inc(\d+)([a-z]*)$', p)
    if m:
        return romano(int(m.group(1))) + ('-' + m.group(2).upper() if m.group(2) else '') + ' - '
    m = re.match(r'ali(\d+)$', p)
    if m:
        n = int(m.group(1))
        return (chr(96 + n) if n <= 26 else chr(96 + (n - 1) // 26) + chr(97 + (n - 1) % 26)) + ') '
    m = re.match(r'ali([a-z]+)$', p)
    if m:
        return m.group(1) + ') '
    m = re.match(r'par(\d+)([a-z]*)$', p)
    if m:
        if m.group(2) == 'u':
            return 'Parágrafo único. '
        n = int(m.group(1))
        return '§ %d%s%s ' % (n, 'º' if n <= 9 else '.', '-' + m.group(2).upper() if m.group(2) else '')
    m = re.match(r'it(\d+)', p)
    return m.group(1) + '. ' if m else ''


def linhas_do_artigo(artigo):
    """(número, [linhas]) do artigo: caput com 'Art. N', depois parágrafos, incisos e alíneas na ordem; sem placeholders '(Suprimido)'."""
    numero = numero_do_artigo(id_curto(artigo.get('legislationIdentifier', '')))
    if numero is None:
        return None, None
    base = int(re.match(r'\d+', numero).group())
    cabeca = ('Art. %d%s ' % (base, 'º' if base <= 9 else '.')).replace('Art. %d' % base, 'Art. ' + numero, 1)
    partes = como_lista(artigo.get('hasPart'))
    caput = next((h for h in partes if id_curto(h.get('legislationIdentifier', '')).endswith('_cpt')), None)
    versao_caput = versao_vigente(caput) if caput else None
    linhas = [cabeca + (limpar_html(versao_caput['text']) if versao_caput else '')]

    def descer(no):
        ident = id_curto(no.get('legislationIdentifier', ''))
        versao = versao_vigente(no)
        if versao is not None and ident != id_curto(artigo.get('legislationIdentifier', '')):
            linhas.append(((rotulo_pelo_nome(versao) or rotulo_pelo_id(ident)) + limpar_html(versao['text'])).strip())
        for filho in como_lista(no.get('hasPart')):
            descer(filho)

    if caput:
        for filho in como_lista(caput.get('hasPart')):
            descer(filho)
    for parte in partes:
        if parte is not caput:
            descer(parte)
    placeholder = re.compile(r'^(?:[IVXLC]+\s*-\s*|§\s*\d+\S*\s*|[a-z]\)\s*|Art\.\s*\S+\s*|Parágrafo único\.\s*)?\(Suprimido\)\.?$')
    return numero, [l for l in linhas if not placeholder.match(l)]


def artigos_da_api(norma_json):
    """{'75': [linhas], '75-A': [...], …} com o texto vigente de todos os artigos da norma"""
    artigos = {}

    def procurar(no):
        if not isinstance(no, dict):
            return
        if re.match(r'art\d+(?:-\d+|[a-z]*)$', id_curto(no.get('legislationIdentifier', ''))):
            numero, linhas = linhas_do_artigo(no)
            if numero and linhas:
                artigos[numero] = linhas
            return
        for filho in como_lista(no.get('hasPart')):
            procurar(filho)

    for parte in como_lista(norma_json.get('hasPart')):
        procurar(parte)
    return artigos


def carregar_js(arquivo, nome_global):
    texto = open(arquivo, encoding='utf-8').read()
    ini = texto.index('{', texto.index(nome_global))
    return texto, json.loads(texto[ini:texto.rindex('}') + 1])


# ---------------------------------------------------------------- comparação
def normalizar(linhas):
    """só o conteúdo: sem notas entre parênteses, acentos, pontuação e espaços"""
    t = re.sub(r'\([^)]*\)', ' ', ' '.join(linhas))
    t = ''.join(c for c in unicodedata.normalize('NFD', t) if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+', '', t.lower())


def linha_igual(nova, antiga):
    nx, ny = normalizar([nova]), normalizar([antiga])
    if nx == ny:
        return True
    if nx and ny and (nx in ny or ny in nx) and abs(len(nx) - len(ny)) <= 240:
        return True                     # ruído colado no fim da linha antiga (nota, título de seção)
    if REVOGACAO.search(nova) and not re.search(r'\((?:Revogad|Suprimid)', antiga):
        return False                    # revogação nova: sempre vale a troca
    # redação só conta como diferente se a similaridade cair abaixo de 0,80 (ajustes de forma/abreviação do consolidado não valem a troca)
    return bool(nx and ny and difflib.SequenceMatcher(None, nx, ny, autojunk=False).ratio() >= 0.80)


def artigo_igual(novo, antigo):
    """artigo inteiro igual, com tolerância ao ruído dos textos antigos (compara linha a linha)"""
    if len(novo) != len(antigo):
        return False
    for nova, antiga in zip(novo, antigo):
        nx, ny = normalizar([nova]), normalizar([antiga])
        if nx == ny:
            continue
        if nx and ny and (nx in ny or ny in nx) and abs(len(nx) - len(ny)) <= 240:
            continue
        if nx and ny and difflib.SequenceMatcher(None, nx, ny, autojunk=False).ratio() >= 0.97:
            continue
        return False
    return True


def rotulo_da_linha(linha):
    m = re.match(r'^(Art\.\s*\S+|§\s*\S+|Parágrafo único\.|[IVXLC]+(?:-[A-Z])?\s*-|[a-z]{1,2}\))', linha)
    return re.sub(r'\s+', '', m.group(1)).lower() if m else ''


def remendar(novo, antigo):
    """Compara um artigo cuja forma mudou.
    Devolve: lista de linhas com as revogações aplicadas; [] se nada a trocar; 'SUBSTANTIVA' se a redação difere (só sinaliza);
    None se a estrutura (nº de linhas ou rótulos) diverge (só relata)."""
    if len(novo) != len(antigo):
        return None
    saida, trocadas = list(antigo), 0
    for i, (nova, antiga) in enumerate(zip(novo, antigo)):
        if linha_igual(nova, antiga):
            continue
        if rotulo_da_linha(nova) != rotulo_da_linha(antiga):
            return None
        if not REVOGACAO.search(nova):
            return 'SUBSTANTIVA'
        saida[i] = nova
        trocadas += 1
        if trocadas > MAX_LINHAS_POR_ARTIGO:
            return None
    return saida if trocadas else []


def chave_ordem(numero):
    return int(re.match(r'\d+', numero).group()), numero


# ---------------------------------------------------------------- registro em ALTERACOES_LEGAIS
def escapar(s):
    return s.replace('\\', '\\\\').replace("'", "\\'")


def item_alteracao(ident, mat, titulo, resumo, status, norma, artigos, hoje_iso):
    dispositivos = ','.join("{norma:'%s', n:%d}" % (norma, int(re.match(r'\d+', a).group()))
                            for a in sorted(set(artigos), key=chave_ordem)[:60])
    return ("  { id:'%s', mat:'%s', titulo:'%s', resumo:'%s', fonte:'Normas.leg.br (Senado) · texto consolidado, comparação automática', "
            "registrada:'%s', status:'%s', dispositivos:[%s], gabarito:'' },\n"
            % (ident, escapar(mat), escapar(titulo), escapar(resumo), hoje_iso, status, dispositivos))


def registrar(aplicadas, sinalizadas, hoje_iso):
    """acrescenta os itens em ALTERACOES_LEGAIS (js/atualizacoes-legais.js), sem duplicar o mesmo id no mesmo dia"""
    caminho = os.path.join(RAIZ, 'js/atualizacoes-legais.js')
    js = open(caminho, encoding='utf-8').read()
    itens = ''
    for norma, mat, artigos in aplicadas:
        ident = 'txt-' + re.sub(r'\W+', '-', norma.lower()) + '-' + hoje_iso
        if "id:'%s'" % ident in js:
            continue
        lista = ', '.join('art. ' + a for a in artigos[:12]) + (' e outros' if len(artigos) > 12 else '')
        resumo = ('O texto do pop-up foi atualizado com a redação vigente em: %s (dispositivos revogados). '
                  'Questões que citam esses artigos ficam marcadas: conferir se o gabarito dependia da redação antiga.' % lista)
        itens += item_alteracao(ident, mat, 'Texto atualizado no pop-up: %s (%s)' % (norma, lista), resumo, 'confirmada', norma, artigos, hoje_iso)
    for norma, mat, artigos in sinalizadas:
        ident = 'dif-' + re.sub(r'\W+', '-', norma.lower()) + '-' + hoje_iso
        if "id:'%s'" % ident in js:
            continue
        lista = ', '.join('art. ' + a for a in artigos[:12]) + (' e outros' if len(artigos) > 12 else '')
        resumo = ('O texto do pop-up difere do texto consolidado oficial nestes artigos '
                  '(pode ser forma/abreviação ou atualização pendente): %s. Conferir.' % lista)
        itens += item_alteracao(ident, mat, 'Redação diferente do texto consolidado oficial: %s (%s)' % (norma, lista), resumo, 'a-conferir', norma, artigos, hoje_iso)
    if itens:
        inicio = js.index('const ALTERACOES_LEGAIS = [')
        fim = js.index('\n];', inicio)
        js = js[:fim + 1] + itens + js[fim + 1:]
        open(caminho, 'w', encoding='utf-8').write(js)


# ---------------------------------------------------------------- execução
def processar_norma(norma, fonte, lei_fontes):
    """devolve (relatório, artigos_com_revogação_aplicada, artigos_com_redação_diferente)"""
    m = re.search(r"'?" + re.escape(norma) + r"'?\s*:\s*\{\s*arquivo:'([^']+)',\s*global:'([^']+)'", lei_fontes)
    if not m:
        return {'norma': norma, 'status': 'sem entrada em LEI_FONTES'}, [], []
    arquivo, nome_global = os.path.join(RAIZ, m.group(1)), m.group(2)
    try:
        norma_json = baixar(API_NORMAS % urn_da_norma(fonte))
        if not norma_json.get('hasPart'):
            return {'norma': norma, 'status': 'API sem texto estruturado desta norma (fica por pesquisa/arquivo)'}, [], []
        novo = artigos_da_api(norma_json)
        texto_js, atual = carregar_js(arquivo, nome_global)
    except Exception as erro:
        return {'norma': norma, 'status': 'erro', 'erro': str(erro)[:160]}, [], []

    comuns = [k for k in novo if k in atual]
    if len(novo) < 0.85 * len(atual) or not comuns:
        return {'norma': norma, 'status': 'extração suspeita (artigos %d de %d): nada alterado' % (len(novo), len(atual))}, [], []
    iguais = [k for k in comuns if artigo_igual(novo[k], atual[k])]
    fidelidade = len(iguais) / len(comuns)
    if fidelidade < PORTAO_FIDELIDADE:
        return {'norma': norma, 'status': 'fidelidade baixa (%.0f%% dos artigos iguais): leitor suspeito, nada alterado' % (100 * fidelidade)}, [], []

    remendos, substantivos, divergentes = {}, [], []
    for k in comuns:
        if k in iguais:
            continue
        resultado = remendar(novo[k], atual[k])
        if resultado == 'SUBSTANTIVA':
            substantivos.append(k)
        elif resultado is None:
            divergentes.append(k)
        elif resultado:
            remendos[k] = resultado
    relatorio = {
        'norma': norma,
        'status': 'mudou' if (remendos or substantivos) else 'sem mudança',
        'fidelidade': round(fidelidade, 3),
        'artigos_alterados': sorted(remendos, key=chave_ordem),
        'redacao_diferente_so_sinalizada': sorted(substantivos, key=chave_ordem),
        'estrutura_divergente_nao_reescritos': sorted(divergentes, key=chave_ordem),
    }
    return relatorio, remendos, sorted(substantivos, key=chave_ordem), (arquivo, nome_global, texto_js, atual)


def main():
    argumentos = sys.argv
    so_relatorio = '--so-relatorio' in argumentos
    so_norma = argumentos[argumentos.index('--norma') + 1] if '--norma' in argumentos else None
    fontes = {k: v for k, v in json.load(open(os.path.join(SKILL, 'fontes_senado.json'), encoding='utf-8')).items()
              if not k.startswith('_')}
    lei_fontes = open(os.path.join(RAIZ, 'js/teoria.js'), encoding='utf-8').read()
    hoje = datetime.date.today()
    relatorios, aplicadas, sinalizadas = [], [], []

    for norma, fonte in fontes.items():
        if so_norma and norma != so_norma:
            continue
        resultado = processar_norma(norma, fonte, lei_fontes)
        relatorios.append(resultado[0])
        if len(resultado) < 4 or so_relatorio:
            continue
        _, remendos, substantivos, (arquivo, nome_global, texto_js, atual) = resultado
        if remendos:
            for k, linhas in remendos.items():
                linhas[0] = re.sub(r' \(Texto atualizado em [^)]*\)', '', linhas[0]) + ' (Texto atualizado em %s, base Normas.leg.br)' % hoje.strftime('%d/%m/%Y')
                atual[k] = linhas
            ini = texto_js.index('{', texto_js.index(nome_global))
            fim = texto_js.rindex('}')
            ordenado = dict(sorted(atual.items(), key=lambda kv: chave_ordem(kv[0])))
            open(arquivo, 'w', encoding='utf-8').write(texto_js[:ini] + json.dumps(ordenado, ensure_ascii=False) + texto_js[fim + 1:])
            aplicadas.append((norma, fonte['mat'], sorted(remendos, key=chave_ordem)))
        if substantivos:
            sinalizadas.append((norma, fonte['mat'], substantivos))

    if (aplicadas or sinalizadas) and not so_relatorio:
        registrar(aplicadas, sinalizadas, hoje.isoformat())
    print(json.dumps(relatorios, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
