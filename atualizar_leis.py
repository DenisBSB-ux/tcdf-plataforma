import os
import json
import time
import sys
import warnings
import firebase_admin
from firebase_admin import credentials, firestore

# Silencia avisos de migração de biblioteca para manter o terminal limpo
warnings.filterwarnings("ignore", category=FutureWarning)
import google.generativeai as genai

# Configurações do Monitor Automático
INTERVALO_MONITORAMENTO_MINUTOS = 5  # Tempo entre cada varredura no banco
DATA_VERSAO_HOJE = "2026-10-22"

# ==============================================================================
# 1. INICIALIZAÇÃO DO BANCO DE DADOS (FIREBASE)
# ==============================================================================
DIRETORIO_ATUAL = os.path.dirname(os.path.abspath(__file__))
caminho_firebase = os.path.join(DIRETORIO_ATUAL, "chave-firebase.json")

if not firebase_admin._apps:
    cred = credentials.Certificate(caminho_firebase)
    firebase_admin.initialize_app(cred)

db = firestore.client()

# ==============================================================================
# 2. CARREGAMENTO DA CHAVE DO GEMINI (CONFIG.JSON)
# ==============================================================================
caminho_config = os.path.join(DIRETORIO_ATUAL, "config.json")
api_key = None

if os.path.exists(caminho_config):
    try:
        with open(caminho_config, "r", encoding="utf-8") as f:
            dados_config = json.load(f)
            api_key = (
                dados_config.get("GEMINI_API_KEY") 
                or dados_config.get("gemini_api_key") 
                or dados_config.get("apiKey")
            )
    except Exception as e:
        print(f"⚠️ Erro ao ler config.json: {e}")

if not api_key:
    api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ ERRO: A chave 'GEMINI_API_KEY' não foi encontrada dentro de config.json!")
    sys.exit(1)

api_key = api_key.strip()
genai.configure(api_key=api_key)
print(f"🔑 Chave do Gemini carregada com sucesso (início: {api_key[:6]}...)")

# ==============================================================================
# 3. MAPEAMENTO COMPLETO DAS 21 MATÉRIAS E ESCOPO LEGAL
# ==============================================================================
CATALOGO_MATERIAS = {
    "adm_geral_pub": {
        "nome": "Adm Geral & Pub",
        "palavras_chave": ["adm-geral", "adm_geral", "adm-geral-pub", "publica", "gestao"],
        "escopo": "Administração Geral e Pública, Modelos de Gestão, Governança, Gestão de Processos e Projetos."
    },
    "adm_leis_especificas": {
        "nome": "Adm (Lei nº 8.429; nº 9.784; nº 2.834)",
        "palavras_chave": ["8429", "9784", "2834", "improbidade", "processo-administrativo"],
        "escopo": "Lei Federal 8.429/92 (com alterações da Lei 14.230/21), Lei 9.784/99 e Lei Distrital 2.834/01."
    },
    "adm_lgpd_lai": {
        "nome": "Adm (LGPD + LAI)",
        "palavras_chave": ["lgpd", "lai", "13709", "12527", "acesso-informacao", "dados-pessoais"],
        "escopo": "Lei Geral de Proteção de Dados (Lei 13.709/18) e Lei de Acesso à Informação (Lei 12.527/11)."
    },
    "administrativo_geral": {
        "nome": "Administrativo (geral)",
        "palavras_chave": ["administrativo", "direito-administrativo", "atos", "poderes", "servicos-publicos"],
        "escopo": "Direito Administrativo Geral, Princípios, Atos Administrativos, Poderes, Responsabilidade Civil do Estado."
    },
    "afo": {
        "nome": "AFO",
        "palavras_chave": ["afo", "orcamento", "financeira", "4320", "lrf", "101"],
        "escopo": "Administração Financeira e Orçamentária, LRF (LC 101/00), Lei 4.320/64, CF/88 (arts. 165 a 169) e Emendas Constitucionais."
    },
    "analise_dados_ia": {
        "nome": "Analise Dados IA",
        "palavras_chave": ["dados", "ia", "analise-dados", "machine-learning", "inteligencia-artificial"],
        "escopo": "Análise de Dados, Banco de Dados, SQL, BI, Mineração de Dados, Inteligência Artificial e Ciência de Dados."
    },
    "conhec_df": {
        "nome": "Conhec. DF",
        "palavras_chave": ["conhec-df", "distrito-federal", "ride", "geografia-df", "historia-df"],
        "escopo": "Conhecimentos sobre o Distrito Federal, Ride-DF (LC 94/98), Geografia, Sociedade e História de Brasília."
    },
    "constitucional": {
        "nome": "Constitucional",
        "palavras_chave": ["constitucional", "cf88", "constituicao", "direitos-fundamentais"],
        "escopo": "Direito Constitucional, CF/1988 e Jurisprudência atualizada do STF."
    },
    "contratos": {
        "nome": "Contratos",
        "palavras_chave": ["contratos", "contrato-adm", "fiscalizacao", "gestao-contratos"],
        "escopo": "Contratos Administrativos, Execução, Fiscalização, Sanções e Alterações Contratuais (Lei 14.133/21)."
    },
    "tributario": {
        "nome": "D.Tributário",
        "palavras_chave": ["tributario", "ctn", "impostos", "tributo"],
        "escopo": "Direito Tributário, Código Tributário Nacional (Lei 5.172/66) e Sistema Tributário Nacional na CF/88."
    },
    "decreto_44330": {
        "nome": "Decreto 44.330",
        "palavras_chave": ["44330", "44.330", "decreto-distrital-licitacoes"],
        "escopo": "Decreto Distrital nº 44.330/2023 (Regulamento da Nova Lei de Licitações e Contratos no Distrito Federal)."
    },
    "direito_civil": {
        "nome": "Direito Civil",
        "palavras_chave": ["direito-civil", "civil", "lindb", "codigo-civil", "10406"],
        "escopo": "Código Civil (Lei 10.406/02), LINDB, Pessoas, Bens, Fatos Jurídicos, Obrigações e Responsabilidade Civil."
    },
    "in_5": {
        "nome": "IN nº 5",
        "palavras_chave": ["in-5", "in5", "in_5", "terceirizacao", "servicos-continuados"],
        "escopo": "Instrução Normativa SEGES/MP nº 5/2017 (Regulamento de Contratação de Serviços Terceirizados Contínuos)."
    },
    "lei_14133": {
        "nome": "Lei 14.133 220",
        "palavras_chave": ["14133", "14.133", "nova-lei-licitacoes", "licitacao"],
        "escopo": "Nova Lei de Licitações e Contratos Administrativos (Lei 14.133/2021) e suas atualizações."
    },
    "lo_tcdf": {
        "nome": "Lei Orgânica do TCDF",
        "palavras_chave": ["lotcdf", "lo-tcdf", "lei-organica-tcdf", "lc-1-94", "lc1"],
        "escopo": "Lei Orgânica do Tribunal de Contas do DF (Lei Complementar Distrital nº 1/1994)."
    },
    "lodf": {
        "nome": "LODF",
        "palavras_chave": ["lodf", "lei-organica-df", "distrital"],
        "escopo": "Lei Orgânica do Distrito Federal (LODF) e Emendas à LODF."
    },
    "pdpm_mulheres": {
        "nome": "PDPM Mulheres",
        "palavras_chave": ["pdpm", "mulheres", "politicas-mulheres", "42590"],
        "escopo": "II Plano Distrital de Políticas para Mulheres (PDPM) e Legislação Distrital de Proteção e Promoção dos Direitos das Mulheres."
    },
    "previdenciario": {
        "nome": "Previdenciário",
        "palavras_chave": ["previdenciario", "rpps", "rgps", "inss", "lc-769", "769"],
        "escopo": "Direito Previdenciário, Regime Próprio do DF (LC Distrital 769/08), RGPS e EC 103/2019."
    },
    "primeiros_socorros": {
        "nome": "Primeiros Socorros",
        "palavras_chave": ["primeiros-socorros", "socorros", "sbv", "atendimento-pre-hospitalar"],
        "escopo": "Diretrizes Atuais de Primeiros Socorros, Suporte Básico de Vida (AHA) e Atendimento de Urgência."
    },
    "reg_interno": {
        "nome": "Reg. Interno",
        "palavras_chave": ["reg-interno", "regimento-interno", "ri-tcdf", "resolucao-296"],
        "escopo": "Regimento Interno do Tribunal de Contas do Distrito Federal (Resolução nº 296/2016 e alterações)."
    },
    "rju_lc840": {
        "nome": "RJU LC840",
        "palavras_chave": ["lc840", "lc-840", "840", "rju", "servidores-df"],
        "escopo": "Regime Jurídico dos Servidores Públicos Civis do Distrito Federal (Lei Complementar Distrital nº 840/2011)."
    }
}

def identificar_materia(item: dict, id_q: str) -> dict:
    """Identifica com precisão a matéria com base no ID, título ou conteúdo da questão."""
    texto_busca = f"{id_q} {item.get('materia', '')} {item.get('disciplina', '')} {item.get('titulo', '')} {str(item)}".lower()

    for chave, config in CATALOGO_MATERIAS.items():
        for termo in config["palavras_chave"]:
            if termo in texto_busca:
                return config

    return {
        "nome": "Geral / Legislação Aplicada",
        "escopo": "Legislação Federal e Distrital vigente aplicável ao concurso do TCDF."
    }

# ==============================================================================
# 4. MODELOS E MECANISMO DE FALLBACK
# ==============================================================================
FILA_MODELOS = [
    "gemini-3.5-flash-lite",  # Modelo primário oficial
    "gemini-3.8-flash",       # Modelo reserva oficial
]

def gerar_com_fallback(prompt: str) -> str:
    """Gera resposta com troca automática em caso de falha."""
    ultimo_erro = None
    for modelo in FILA_MODELOS:
        try:
            m = genai.GenerativeModel(modelo)
            resposta = m.generate_content(prompt)
            return resposta.text
        except Exception as erro:
            print(f"   ⚠️ Modelo '{modelo}' falhou: {erro}. Alternando para o próximo...")
            ultimo_erro = erro
            continue
            
    raise Exception(f"Todos os modelos da lista falharam. Último erro: {ultimo_erro}")

# ==============================================================================
# 5. ROTINA DE EXECUÇÃO E VARREDURA
# ==============================================================================
def executar_varredura():
    """Varre o banco e atualiza apenas os itens novos que ainda não foram revisados hoje."""
    docs = db.collection("progresso").stream()

    novos_itens = []
    for doc in docs:
        dado = doc.to_dict()
        dado["id"] = doc.id
        # Só coloca na fila se NÃO tiver sido revisado hoje
        if dado.get("revisada_em") != DATA_VERSAO_HOJE:
            novos_itens.append(dado)

    total_novos = len(novos_itens)

    if total_novos == 0:
        print(f"[{time.strftime('%H:%M:%S')}] 💤 Nenhuma lista nova encontrada no site. Tudo em dia!")
        return

    print(f"\n[{time.strftime('%H:%M:%S')}] 🚨 {total_novos} novo(s) item(ns) detectado(s)! Iniciando atualização...")

    for index, item in enumerate(novos_itens, start=1):
        id_q = item.get("id")
        materia_info = identificar_materia(item, id_q)
        print(f"[{index}/{total_novos}] 🚀 Processando: {id_q} | Matéria: {materia_info['nome']}")

        try:
            nome_final_resolucao = "resolucao"

            prompt = f"""
            Você é um auditor e professor especialista no concurso do TCDF.
            MATÉRIA ANALISADA: {materia_info['nome']}
            LEGISLAÇÃO / ESCOPO OBRIGATÓRIO: {materia_info['escopo']}

            TAREFA:
            1. Analise os dados da questão abaixo.
            2. Verifique se a fundamentação e o gabarito/resolução estão 100% atualizados conforme a legislação vigente indicada.
            3. Se houver desatualização, retifique a resolução explicando com clareza o dispositivo legal atualizado.
            4. Retorne OBRIGATORIAMENTE um JSON puro com o formato:
            {{"resolucao": "texto completo e atualizado da resolução fundamentada na lei vigente"}}

            DADOS DA QUESTÃO:
            {item}
            """

            resposta_bruta = gerar_com_fallback(prompt)

            texto_limpo = resposta_bruta.strip()
            if texto_limpo.startswith("```"):
                linhas = texto_limpo.split("\n")
                texto_limpo = "\n".join(linhas[1:-1]).strip()

            dados_atualizados = json.loads(texto_limpo)

            # Montagem do payload de atualização
            payload_atualizacao = {}
            payload_atualizacao[nome_final_resolucao] = dados_atualizados["resolucao"]
            payload_atualizacao["materia_monitorada"] = materia_info["nome"]
            payload_atualizacao["revisada_em"] = DATA_VERSAO_HOJE

            db.collection("progresso").document(id_q).update(payload_atualizacao)
            print(f" -> Sucesso! Novo registro gravado no banco sob a matéria: {materia_info['nome']}.")

            # Pausa de 6 segundos de cota
            if index < total_novos:
                time.sleep(6)

        except Exception as e:
            print(f" -> Erro ao atualizar ID {id_q}: {e}.")

    print(f"[{time.strftime('%H:%M:%S')}] ✅ Varredura finalizada. Todos os novos itens foram atualizados!\n")

# ==============================================================================
# 6. MODO SENTINELA CONTÍNUO (RODA SOZINHO EM LOOP)
# ==============================================================================
if __name__ == "__main__":
    print("==================================================================")
    print("🤖 SENTINELA DO TCDF ATIVADO: MONITORAMENTO AUTOMÁTICO EM SEGUNDO PLANO")
    print(f"⏰ Verificação a cada {INTERVALO_MONITORAMENTO_MINUTOS} minutos.")
    print("==================================================================\n")

    try:
        while True:
            executar_varredura()
            print(f"⏳ Aguardando {INTERVALO_MONITORAMENTO_MINUTOS} minutos para a próxima verificação silenciosa...\n")
            time.sleep(INTERVALO_MONITORAMENTO_MINUTOS * 60)
    except KeyboardInterrupt:
        print("\n🛑 Sentinela interrompido manualmente pelo usuário.")