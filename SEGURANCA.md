# Segurança do Firebase

A chave `apiKey` em `index.html` é pública por natureza: todo app Firebase na
web a expõe. Quem protege os dados são as **regras do Firestore**
(`firestore.rules`). Sem elas, qualquer pessoa pode apagar matérias públicas ou
ler e alterar o progresso de outra pessoa, bastando saber o código de
sincronização dela.

## Passo a passo (uma vez só)

1. **Ativar o login com Google**
   Firebase Console → *Authentication* → *Vamos começar* (*Get started*, só na
   primeira vez) → *Sign-in method* → *Google* → ativar → escolher o e-mail de
   suporte → *Salvar*. Sem isso o login mostra
   `auth/configuration-not-found`.

2. **Autorizar o domínio do site**
   *Authentication* → *Settings* → *Authorized domains* → adicionar o domínio
   onde a plataforma está publicada (ex.: `denisbsb-ux.github.io`).

3. **Descobrir seu UID**
   Abrir a plataforma → barra lateral, bloco *Sincronização* →
   *Entrar com Google*. O UID aparece ao passar o mouse sobre o seu nome.

4. **Publicar as regras**
   Abrir `firestore.rules`, trocar `COLE_SEU_UID_AQUI` pelo UID do passo 3,
   colar em *Firestore Database* → *Regras* → *Publicar*.

5. **Entrar com Google em cada dispositivo**
   Depois do passo 4, gravar progresso e publicar matérias exige estar logado.
   O primeiro login regrava o progresso com o campo `dono`, e a partir daí
   só essa conta consegue ler ou alterar aquele código de sincronização.

## O que cada regra faz

| Coleção | Leitura | Escrita |
|---|---|---|
| `publico/*` (matérias) | qualquer pessoa | só o administrador (UID nas regras) |
| `progresso/*` | dono do documento, ou documento antigo ainda sem dono | só o dono; documento sem dono é assumido pela primeira conta que gravar |

Para ter mais de um administrador, coloque os UIDs na lista:
`request.auth.uid in ['UID_1', 'UID_2']`.


## PDFs de teoria (Firebase Storage)

A aba **06 Teoria (PDF)** guarda os PDFs de cada matéria na nuvem, em
`teoria/{uid}/{matéria}/...`. Para ela funcionar:

1. **Ativar o Storage:** Firebase Console → *Storage* → *Começar*. O Storage
   exige o plano **Blaze** (pago por uso, com cota gratuita mensal). Defina um
   **alerta de orçamento** em *Uso e faturamento* para não ter surpresa.
2. **Publicar as regras:** abrir `storage.rules`, colar em *Storage* → *Regras*
   → *Publicar*. Cada conta lê e grava só a própria pasta, apenas PDF e até
   50 MB por arquivo.
3. **Entrar com Google** na plataforma. Sem login a aba avisa o que falta.

Os arquivos não passam pelo Firestore (ele limita cada documento a ~1 MB).
