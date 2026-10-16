#!/usr/bin/env python3
"""Monta o arquivo .md de uma matéria com as resoluções no formato padrão.

Uso:
  python3 montar_resolucoes.py dump  <arquivo.md> <ini> <fim>          # lê as questões ini..fim (índices) para você escrever
  python3 montar_resolucoes.py build <arquivo.md> <pasta_lotes> <saida.md> [--manter-resumo-flash]

Cada lote em <pasta_lotes>/bNN.py define  R = { indice: (ess, [palavras-chave], base, atencao, armadilha, macete) }
  ess        📌 essência em uma linha (palavras-chave em **negrito**)
  base       ⚖️ ex.: '**Art. 75** ▸ **IV** ▸ **"c"** · Lei 14.133/2021' ('' omite a linha)
  atencao    ⚠️ exceção/atualização, ou "Conferir o gabarito..." quando o gabarito do arquivo diverge da lei ('' omite)
  armadilha  🪤 como a banca poderia alterar o item ('' omite; use só em item certo e múltipla escolha)
  macete     💡 frase curta em itálico
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

def monta(q, d, i=0, sinal_extra=None):
    """Sem linha 🏷️: o perfil (sinal ou armadilha) já aparece no painel "Armadilha da banca" da plataforma."""
    ess, kw, base, ate, arm, mac = d
    L = []
    if base: L.append('⚖️ ' + base)
    L.append('📌 ' + ess)
    L.append('🔑 ' + ' · '.join(f'**{k}**' for k in kw))
    if 'gabarito resolvido por IA' in q['res']:
        ate = (ate + ' ' if ate else '') + '**Gabarito resolvido por IA**, sem gabarito oficial (confiança média): **conferir** na norma.'
    if ate: L.append('⚠️ ' + ate)
    if arm: L.append('🪤 ' + arm)
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
        out = [partes[0]]; n = 0
        for i, k in enumerate(range(1, len(partes), 2)):
            cab, b = partes[k], partes[k + 1]
            if i in R:
                novo = monta(Q[i], R[i], i, SINAL)
                b, c = re.subn(r'(### Resolução\n).*?(?=\n\n### Resumo Flash|\n\n---|\Z)', lambda m: m.group(1) + novo, b, count=1, flags=re.S); assert c == 1; n += 1
            out += [cab, b]
        res = ''.join(out)
        if '--manter-resumo-flash' not in sys.argv:  # padrão: sem Resumo Flash (como na Lei 14.133)
            res, c = re.subn(r'\n\n### Resumo Flash\n.*?(?=\n---\n|\Z)', '\n', res, flags=re.S); print('Resumo Flash removidos:', c)
        open(sys.argv[4], 'w', encoding='utf-8').write(res); print('reescritas:', n, 'de', len(Q))
