/* Teoria em figura — Direito Tributário, questões 55 e 59 (texto de lei carregado). */
TEORIA_CARTOES.push(
  { m:/tribut/i, n:55, titulo:'CSLL: contribuição social na CF', base:'CF, arts. 149, caput, 150, I, e 195, I, "c"', fonte:[['CF',149],['CF',150],['CF',195]],
    regra:'Compete exclusivamente à União instituir {0|contribuições sociais}; a seguridade é financiada por contribuições do empregador incidentes sobre {1|o lucro}, e é vedado {2|exigir ou aumentar tributo sem lei que o estabeleça}.',
    pontos:[ { ico:'🏛️', t:'Competência da União', d:'compete exclusivamente à União instituir contribuições sociais' }, { ico:'💼', t:'Incidência sobre o lucro', d:'art. 195, I, "c": do empregador, incidente sobre o lucro' }, { ico:'📜', t:'Reserva de lei', d:'sem lei que o estabeleça, não se exige tributo' } ],
    armadilha:'A CF não cita a sigla CSLL; a previsão é a contribuição do empregador sobre o lucro.' },
  { m:/tribut/i, n:59, titulo:'ISS: contribuinte e responsável', base:'LC 116/2003, arts. 5º e 6º', fonte:[['LC 116',5],['LC 116',6]],
    regra:'Contribuinte é {0|o prestador do serviço}; os Municípios e o DF, {1|mediante lei}, poderão atribuir de modo expresso a {2|responsabilidade pelo crédito tributário a terceira pessoa}.',
    pontos:[ { ico:'🧑‍🔧', t:'Contribuinte', d:'art. 5º: é o prestador do serviço' }, { ico:'📜', t:'Só mediante lei', d:'Municípios e DF atribuem a responsabilidade por lei' }, { ico:'👥', t:'Terceira pessoa', d:'vinculada ao fato gerador da respectiva obrigação' } ],
    armadilha:'Responsável por atribuição legal não é o contribuinte; o art. 5º define o contribuinte.' },
);
