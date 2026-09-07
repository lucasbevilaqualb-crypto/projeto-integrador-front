const CHAVE_DADOS = 'crechepet_dados';
const CHAVE_SESSAO = 'crechepet_sessao';

function dadosPadrao() {
  return {
    tutores: [],
    profissionais: [],
    pets: [],
    creches: [
      { id: 1, nome: 'Creche Patas Felizes', endereco: 'Rua das Flores, 120 - São Paulo, SP', avaliacao: 4.8, vagasDisponiveis: 5, capacidadeTotal: 15, vagasOcupadas: 12 },
      { id: 2, nome: 'Espaço Pet Amigo', endereco: 'Av. Central, 45 - São Paulo, SP', avaliacao: 4.6, vagasDisponiveis: 2, capacidadeTotal: 10, vagasOcupadas: 8 },
      { id: 3, nome: 'Cão Feliz Hotelzinho', endereco: 'Rua do Bosque, 30 - São Paulo, SP', avaliacao: 4.9, vagasDisponiveis: 0, capacidadeTotal: 8, vagasOcupadas: 8 }
    ],
    agendamentos: [],
    proximoIdTutor: 1,
    proximoIdProfissional: 1,
    proximoIdPet: 1,
    proximoIdAgendamento: 1
  };
}

function sessaoPadrao() {
  return {
    usuarioLogado: null,
    ultimoEmail: '',
    agendamentoEditandoId: null,
    agendamentoSelecionadoId: null,
    crechePreSelecionada: null,
    petSelecionadoId: null,
    agendamentoAtividadesId: null
  };
}

function obterDados() {
  let bruto = localStorage.getItem(CHAVE_DADOS);
  if (!bruto) {
    let padrao = dadosPadrao();
    salvarDados(padrao);
    return padrao;
  }
  return JSON.parse(bruto);
}

function salvarDados(dados) {
  localStorage.setItem(CHAVE_DADOS, JSON.stringify(dados));
}

function obterSessao() {
  let bruto = localStorage.getItem(CHAVE_SESSAO);
  if (!bruto) {
    let padrao = sessaoPadrao();
    salvarSessao(padrao);
    return padrao;
  }
  return Object.assign(sessaoPadrao(), JSON.parse(bruto));
}

function salvarSessao(sessao) {
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
}

function reiniciarDados() {
  localStorage.removeItem(CHAVE_DADOS);
  localStorage.removeItem(CHAVE_SESSAO);
}

function obterTutorPorId(dados, id) {
  return dados.tutores.find(function (tutor) { return tutor.id === id; });
}

function obterPetPorId(dados, id) {
  return dados.pets.find(function (pet) { return pet.id === id; });
}

function obterCrechePorId(dados, id) {
  return dados.creches.find(function (creche) { return creche.id === id; });
}

function obterAgendamentoPorId(dados, id) {
  return dados.agendamentos.find(function (agendamento) { return agendamento.id === id; });
}

function obterPetsDoTutor(dados, tutorId) {
  return dados.pets.filter(function (pet) { return pet.tutorId === tutorId; });
}

function obterAgendamentosDoTutor(dados, tutorId) {
  let idsPets = obterPetsDoTutor(dados, tutorId).map(function (pet) { return pet.id; });
  return dados.agendamentos.filter(function (agendamento) { return idsPets.indexOf(agendamento.petId) !== -1; });
}
