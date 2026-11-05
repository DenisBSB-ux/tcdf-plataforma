import sys,json,subprocess
def q(query,base='acordaos',size=4,fields=None):
    body={"query":{"bool":{"must":[{"term":{"base":base}},{"query_string":{"query":query}}]}},"size":size,"_source":fields or ["titulo","ementa_texto","documental_tese_texto","documental_tese_tema_texto","julgamento_data","relator_processo_nome"]}
    o=subprocess.run(['curl','-s','-m','40','-A','Mozilla/5.0','-H','Content-Type: application/json','-X','POST','https://jurisprudencia.stf.jus.br/api/search/search','-d',json.dumps(body)],capture_output=True,text=True).stdout
    r=json.loads(o)['result']['hits']['hits']
    return [x['_source'] for x in r]
if __name__=='__main__':
    for s in q(sys.argv[1],sys.argv[2] if len(sys.argv)>2 else 'acordaos',int(sys.argv[3]) if len(sys.argv)>3 else 3):
        print('---',s.get('titulo'),s.get('julgamento_data'),s.get('documental_tese_tema_texto') or '')
        if s.get('documental_tese_texto'):print('TESE:',' '.join(str(s['documental_tese_texto']).split())[:500])
        print('EMENTA:',' '.join(str(s.get('ementa_texto') or '').split())[:700])
