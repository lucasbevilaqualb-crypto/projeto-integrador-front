function imagemIcone(nome, texto) {
  return '<img src="../src/icone-' + nome + '.png" alt="' + (texto || '') + '">';
}

function gerarIniciais(nome) {
  let partes = nome.trim().split(' ').filter(Boolean);
  if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function converterParaDataIso(dataBr) {
  let partes = dataBr.split('/');
  return partes[2] + '-' + partes[1] + '-' + partes[0];
}

function converterParaDataBr(dataIso) {
  let partes = dataIso.split('-');
  return partes[2] + '/' + partes[1] + '/' + partes[0];
}

function escolherPerfil(tipo) {
  location.href = tipo === 'tutor' ? 'cadastro-tutor.html' : 'cadastro-profissional.html';
}

function sairDaConta() {
  let sessao = obterSessao();
  sessao.usuarioLogado = null;
  salvarSessao(sessao);
  location.href = 'login.html';
}

function voltarAoLoginProfissional() {
  let sessao = obterSessao();
  sessao.usuarioLogado = null;
  salvarSessao(sessao);
  location.href = 'login.html';
}

function irInicio() {
  let sessao = obterSessao();
  if (!sessao.usuarioLogado) { location.href = 'login.html'; return; }
  location.href = sessao.usuarioLogado.tipo === 'profissional' ? 'agenda-creche.html' : 'dashboard-tutor.html';
}

function preencherUltimoEmail(idCampo) {
  let sessao = obterSessao();
  if (sessao.ultimoEmail) {
    document.getElementById(idCampo).value = sessao.ultimoEmail;
    sessao.ultimoEmail = '';
    salvarSessao(sessao);
  }
}

function realizarCadastroTutor(evento) {
  evento.preventDefault();
  let dados = obterDados();
  let email = document.getElementById('email-cadastro-tutor').value;
  if (encontrarContaPorEmail(dados, email)) {
    document.getElementById('mensagem-cadastro-tutor').textContent = 'Já existe uma conta com este email.';
    return;
  }
  let tutor = {
    id: dados.proximoIdTutor++,
    nome: document.getElementById('nome-cadastro-tutor').value,
    cpf: document.getElementById('cpf-cadastro-tutor').value,
    telefone: document.getElementById('telefone-cadastro-tutor').value,
    endereco: document.getElementById('endereco-cadastro-tutor').value,
    email: email,
    senha: document.getElementById('senha-cadastro-tutor').value
  };
  dados.tutores.push(tutor);
  salvarDados(dados);
  let sessao = obterSessao();
  sessao.ultimoEmail = tutor.email;
  salvarSessao(sessao);
  document.getElementById('mensagem-cadastro-tutor').textContent = 'Conta criada com sucesso! Redirecionando para o login...';
  setTimeout(() => { location.href = 'login.html'; }, 1000);
}

function realizarCadastroProfissional(evento) {
  evento.preventDefault();
  let dados = obterDados();
  let email = document.getElementById('email-cadastro-profissional').value;
  if (encontrarContaPorEmail(dados, email)) {
    document.getElementById('mensagem-cadastro-profissional').textContent = 'Já existe uma conta com este email.';
    return;
  }
  let profissional = {
    id: dados.proximoIdProfissional++,
    nome: document.getElementById('nome-cadastro-profissional').value,
    cpf: document.getElementById('cpf-cadastro-profissional').value,
    telefone: document.getElementById('telefone-cadastro-profissional').value,
    email: email,
    senha: document.getElementById('senha-cadastro-profissional').value,
    crecheId: dados.creches.length > 0 ? dados.creches[0].id : null,
    statusVinculo: 'pendente'
  };
  dados.profissionais.push(profissional);
  salvarDados(dados);
  let sessao = obterSessao();
  sessao.ultimoEmail = profissional.email;
  salvarSessao(sessao);
  document.getElementById('mensagem-cadastro-profissional').textContent = 'Conta criada com sucesso! Redirecionando para o login...';
  setTimeout(function () { location.href = 'login.html'; }, 1000);
}

function normalizarEmail(email) {
  return email.trim().toLowerCase();
}

function encontrarContaPorEmail(dados, email) {
  let emailNormalizado = normalizarEmail(email);
  let tutor = dados.tutores.find(function (item) { return item.email && normalizarEmail(item.email) === emailNormalizado; });
  if (tutor) return { tipo: 'tutor', conta: tutor };
  let profissional = dados.profissionais.find(function (item) { return item.email && normalizarEmail(item.email) === emailNormalizado; });
  if (profissional) return { tipo: 'profissional', conta: profissional };
  return null;
}

function realizarLogin(evento) {
  evento.preventDefault();
  let dados = obterDados();
  let sessao = obterSessao();
  let email = document.getElementById('email-login').value;
  let encontrada = encontrarContaPorEmail(dados, email);
  let mensagem = document.getElementById('mensagem-login');

  if (!encontrada) {
    mensagem.textContent = 'Não encontramos uma conta com este email. Verifique ou crie uma conta.';
    return;
  }

  mensagem.textContent = '';
  sessao.usuarioLogado = { id: encontrada.conta.id, tipo: encontrada.tipo };
  salvarSessao(sessao);

  if (encontrada.tipo === 'profissional') {
    location.href = encontrada.conta.statusVinculo === 'vinculado' ? 'agenda-creche.html' : 'profissional-pendente.html';
  } else {
    location.href = 'dashboard-tutor.html';
  }
}

function verificarLiberacao() {
  let dados = obterDados();
  let sessao = obterSessao();
  let profissional = dados.profissionais.find(function (item) { return item.id === sessao.usuarioLogado.id; });
  profissional.statusVinculo = 'vinculado';
  salvarDados(dados);
  location.href = 'agenda-creche.html';
}

function exigirTutor() {
  let sessao = obterSessao();
  if (!sessao.usuarioLogado || sessao.usuarioLogado.tipo !== 'tutor') { location.href = 'login.html'; return null; }
  let dados = obterDados();
  let tutor = obterTutorPorId(dados, sessao.usuarioLogado.id);
  return { dados: dados, sessao: sessao, tutor: tutor };
}

function exigirProfissional() {
  let sessao = obterSessao();
  if (!sessao.usuarioLogado || sessao.usuarioLogado.tipo !== 'profissional') { location.href = 'login.html'; return null; }
  let dados = obterDados();
  let profissional = dados.profissionais.find(function (item) { return item.id === sessao.usuarioLogado.id; });
  return { dados: dados, sessao: sessao, profissional: profissional };
}

function exigirProfissionalVinculado() {
  let contexto = exigirProfissional();
  if (!contexto) return null;
  if (contexto.profissional.statusVinculo !== 'vinculado') { location.href = 'profissional-pendente.html'; return null; }
  return contexto;
}

function inicializarBarraSuperior() {
  let sessao = obterSessao();
  if (!sessao.usuarioLogado) return;
  let dados = obterDados();
  let pessoa = sessao.usuarioLogado.tipo === 'profissional'
    ? dados.profissionais.find(function (item) { return item.id === sessao.usuarioLogado.id; })
    : obterTutorPorId(dados, sessao.usuarioLogado.id);
  if (!pessoa) return;
  document.getElementById('nome-usuario').textContent = pessoa.nome;
  document.getElementById('avatar-usuario').textContent = gerarIniciais(pessoa.nome);
  document.getElementById('botao-logo').addEventListener('click', irInicio);
  document.getElementById('botao-sair').addEventListener('click', sairDaConta);
  document.getElementById('botao-sino').addEventListener('click', function (evento) {
    evento.stopPropagation();
    document.getElementById('painel-notificacoes').classList.toggle('oculto');
  });
  document.addEventListener('click', function () {
    document.getElementById('painel-notificacoes').classList.add('oculto');
  });
}

function seloStatusAgendamento(status) {
  if (status === 'Agendado') return '<span class="selo selo-azul">Agendado</span>';
  return '<span class="selo selo-azul">Aguardando</span>';
}

function seloStatusVacina(status) {
  if (status === 'Em dia') return '<span class="selo selo-verde">Em dia</span>';
  return '<span class="selo selo-laranja">' + status + '</span>';
}

function renderizarGradePets(dados, tutorId, idContainer, comCartaoAdicionar) {
  let container = document.getElementById(idContainer);
  let petsDoTutor = obterPetsDoTutor(dados, tutorId);
  let html = '';
  petsDoTutor.forEach(function (pet) {
    let seloCastrado = pet.castrado
      ? '<span class="selo selo-verde">Castrado</span>'
      : '<span class="selo selo-vermelho">Não castrada</span>';
    html += '' +
      '<div class="cartao-pet">' +
        '<div class="cabecalho-cartao-pet">' +
          '<div class="avatar-pet">' + imagemIcone('pata', pet.nome) + '</div>' +
          '<div class="info-pet"><h4>' + pet.nome + '</h4><p>' + pet.raca + '</p></div>' +
        '</div>' +
        '<p class="idade-pet">Idade: <strong>' + pet.idade + '</strong></p>' +
        seloCastrado +
      '</div>';
  });
  if (comCartaoAdicionar) {
    html += '' +
      '<a class="cartao-adicionar" href="cadastrar-pet.html">' +
        '<div class="circulo-mais">' + imagemIcone('mais', 'Adicionar') + '</div>' +
        'Cadastrar Pet' +
      '</a>';
  }
  container.innerHTML = html;
}

function selecionarAgendamentoParaAcompanhar(id) {
  let sessao = obterSessao();
  sessao.agendamentoSelecionadoId = id;
  salvarSessao(sessao);
}

function renderizarListaAgendamentos(dados, tutorId, idContainer) {
  let container = document.getElementById(idContainer);
  let lista = obterAgendamentosDoTutor(dados, tutorId);
  let html = '';
  lista.forEach(function (agendamento) {
    let pet = obterPetPorId(dados, agendamento.petId);
    let creche = obterCrechePorId(dados, agendamento.crecheId);
    html += '' +
      '<div class="cartao-agendamento">' +
        '<div class="info-agendamento">' +
          '<div class="avatar-pet">' + imagemIcone('pata', pet.nome) + '</div>' +
          '<div>' +
            '<h4>' + pet.nome + ' — ' + creche.nome + '</h4>' +
            '<div class="meta-agendamento">' +
              '<span>' + imagemIcone('calendario', 'Data') + agendamento.data + '</span>' +
              '<span>' + imagemIcone('relogio', 'Horário') + agendamento.horario + '</span>' +
            '</div>' +
            seloStatusAgendamento(agendamento.status) +
            '<br><a class="link-acompanhar" href="acompanhamento.html" onclick="selecionarAgendamentoParaAcompanhar(' + agendamento.id + ')">Ver acompanhamento em tempo real</a>' +
          '</div>' +
        '</div>' +
        '<div class="acoes-agendamento">' +
          '<button type="button" class="botao-outline-pequeno" onclick="editarAgendamento(' + agendamento.id + ')">Alterar</button>' +
          '<button type="button" class="botao-perigo" onclick="cancelarAgendamento(' + agendamento.id + ')">Cancelar</button>' +
        '</div>' +
      '</div>';
  });
  if (lista.length === 0) {
    html = '<p style="color:var(--cor-texto-secundario);font-size:14px;">Nenhum agendamento no momento.</p>';
  }
  container.innerHTML = html;
}

function editarAgendamento(id) {
  let sessao = obterSessao();
  sessao.agendamentoEditandoId = id;
  salvarSessao(sessao);
  location.href = 'agendamento.html';
}

function cancelarAgendamento(id) {
  if (!confirm('Deseja realmente cancelar este agendamento?')) return;
  let dados = obterDados();
  let indice = dados.agendamentos.findIndex(function (agendamento) { return agendamento.id === id; });
  if (indice === -1) return;
  let creche = obterCrechePorId(dados, dados.agendamentos[indice].crecheId);
  if (creche) creche.vagasDisponiveis += 1;
  dados.agendamentos.splice(indice, 1);
  salvarDados(dados);
  location.reload();
}

function iniciarPaginaDashboardTutor() {
  let contexto = exigirTutor();
  if (!contexto) return;
  inicializarBarraSuperior();
  document.getElementById('saudacao-dashboard').textContent = 'Olá, ' + contexto.tutor.nome.split(' ')[0] + '!';
  renderizarGradePets(contexto.dados, contexto.tutor.id, 'grade-pets-dashboard', true);
  renderizarListaAgendamentos(contexto.dados, contexto.tutor.id, 'lista-agendamentos-dashboard');
}

let vacinasFormulario = [{ data: '', produto: '', dose: '' }];
let castradoSelecionado = true;

function iniciarPaginaCadastrarPet() {
  let contexto = exigirTutor();
  if (!contexto) return;
  inicializarBarraSuperior();
  renderizarLinhasVacinas();
}

function alternarCastrado(valor) {
  castradoSelecionado = valor;
  document.getElementById('opcao-castrado-sim').classList.toggle('selecionado', valor === true);
  document.getElementById('opcao-castrado-nao').classList.toggle('selecionado', valor === false);
}

function renderizarLinhasVacinas() {
  let container = document.getElementById('lista-vacinas-formulario');
  let html = '<div class="bloco-vacinas">';
  vacinasFormulario.forEach(function (vacina, indice) {
    html += '' +
      '<div class="linha-vacina">' +
        '<div><label>Data</label><input class="input-padrao" type="text" placeholder="01/2026" value="' + vacina.data + '" oninput="atualizarCampoVacina(' + indice + ',\'data\',this.value)"></div>' +
        '<div><label>Produto</label><input class="input-padrao" type="text" placeholder="Ex.: V10" value="' + vacina.produto + '" oninput="atualizarCampoVacina(' + indice + ',\'produto\',this.value)"></div>' +
        '<div><label>Dose</label><input class="input-padrao" type="text" placeholder="1ª" value="' + vacina.dose + '" oninput="atualizarCampoVacina(' + indice + ',\'dose\',this.value)"></div>' +
        '<button type="button" class="botao-remover-linha" onclick="removerLinhaVacina(' + indice + ')">' + imagemIcone('x', 'Remover') + '</button>' +
      '</div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

function atualizarCampoVacina(indice, campo, valor) {
  vacinasFormulario[indice][campo] = valor;
}

function adicionarLinhaVacina() {
  vacinasFormulario.push({ data: '', produto: '', dose: '' });
  renderizarLinhasVacinas();
}

function removerLinhaVacina(indice) {
  vacinasFormulario.splice(indice, 1);
  renderizarLinhasVacinas();
}

function salvarPet(evento) {
  evento.preventDefault();
  let dados = obterDados();
  let sessao = obterSessao();
  let vacinas = vacinasFormulario
    .filter(function (vacina) { return vacina.data || vacina.produto || vacina.dose; })
    .map(function (vacina) { return { data: vacina.data, produto: vacina.produto, dose: vacina.dose, status: 'Em dia' }; });
  dados.pets.push({
    id: dados.proximoIdPet++,
    tutorId: sessao.usuarioLogado.id,
    nome: document.getElementById('pet-nome').value,
    raca: document.getElementById('pet-raca').value,
    idade: document.getElementById('pet-idade').value,
    castrado: castradoSelecionado,
    vacinas: vacinas
  });
  salvarDados(dados);
  location.href = 'dashboard-tutor.html';
}

function iniciarPaginaCreches() {
  let contexto = exigirTutor();
  if (!contexto) return;
  inicializarBarraSuperior();
  renderizarCreches(contexto.dados);
}

function renderizarCreches(dados) {
  let container = document.getElementById('lista-creches');
  let html = '';
  dados.creches.forEach(function (creche) {
    let temVaga = creche.vagasDisponiveis > 0;
    let selo = temVaga
      ? '<span class="selo selo-verde">' + creche.vagasDisponiveis + ' vagas disponíveis</span>'
      : '<span class="selo selo-vermelho">Sem vagas</span>';
    html += '' +
      '<div class="cartao-creche">' +
        '<div class="icone-creche">' + imagemIcone('casa', creche.nome) + '</div>' +
        '<div class="info-creche">' +
          '<h4>' + creche.nome + '</h4>' +
          '<div class="linha-detalhe">' + imagemIcone('local', 'Endereço') + creche.endereco + '</div>' +
          '<div class="linha-detalhe avaliacao">' + imagemIcone('estrela', 'Avaliação') + creche.avaliacao + '</div>' +
        '</div>' +
        '<div class="acao-creche">' +
          selo +
          '<button type="button" class="botao-solido-pequeno" ' + (temVaga ? 'onclick="agendarNaCreche(' + creche.id + ')"' : 'disabled') + '>Agendar</button>' +
        '</div>' +
      '</div>';
  });
  container.innerHTML = html;
}

function agendarNaCreche(crecheId) {
  let sessao = obterSessao();
  sessao.agendamentoEditandoId = null;
  sessao.crechePreSelecionada = crecheId;
  salvarSessao(sessao);
  location.href = 'agendamento.html';
}

function iniciarPaginaAgendamento() {
  let contexto = exigirTutor();
  if (!contexto) return;
  inicializarBarraSuperior();

  let selectPet = document.getElementById('select-pet-agendamento');
  selectPet.innerHTML = obterPetsDoTutor(contexto.dados, contexto.tutor.id).map(function (pet) {
    return '<option value="' + pet.id + '">' + pet.nome + ' — ' + pet.raca + '</option>';
  }).join('');

  let selectCreche = document.getElementById('select-creche-agendamento');
  selectCreche.innerHTML = contexto.dados.creches.map(function (creche) {
    return '<option value="' + creche.id + '">' + creche.nome + '</option>';
  }).join('');

  let sessao = contexto.sessao;
  if (sessao.agendamentoEditandoId) {
    let agendamento = obterAgendamentoPorId(contexto.dados, sessao.agendamentoEditandoId);
    selectPet.value = agendamento.petId;
    selectCreche.value = agendamento.crecheId;
    document.getElementById('select-horario-agendamento').value = agendamento.horario;
    document.getElementById('data-agendamento').value = converterParaDataIso(agendamento.data);
    document.getElementById('botao-confirmar-agendamento').textContent = 'Salvar alteração';
  } else if (sessao.crechePreSelecionada) {
    selectCreche.value = sessao.crechePreSelecionada;
    sessao.crechePreSelecionada = null;
    salvarSessao(sessao);
  }

  renderizarListaAgendamentos(contexto.dados, contexto.tutor.id, 'lista-agendamentos-form');
}

function confirmarAgendamento(evento) {
  evento.preventDefault();
  let dados = obterDados();
  let sessao = obterSessao();
  let petId = parseInt(document.getElementById('select-pet-agendamento').value, 10);
  let crecheId = parseInt(document.getElementById('select-creche-agendamento').value, 10);
  let dataIso = document.getElementById('data-agendamento').value;
  let data = dataIso ? converterParaDataBr(dataIso) : '20/08/2026';
  let horario = document.getElementById('select-horario-agendamento').value;

  if (sessao.agendamentoEditandoId) {
    let agendamento = obterAgendamentoPorId(dados, sessao.agendamentoEditandoId);
    agendamento.petId = petId;
    agendamento.crecheId = crecheId;
    agendamento.data = data;
    agendamento.horario = horario;
  } else {
    let creche = obterCrechePorId(dados, crecheId);
    if (creche.vagasDisponiveis > 0) creche.vagasDisponiveis -= 1;
    dados.agendamentos.push({
      id: dados.proximoIdAgendamento++,
      petId: petId,
      crecheId: crecheId,
      data: data,
      horario: horario,
      status: 'Aguardando',
      checkin: false,
      atividadesProgramadas: [],
      linhaDoTempo: []
    });
  }

  salvarDados(dados);
  sessao.agendamentoEditandoId = null;
  salvarSessao(sessao);
  location.reload();
}

function iniciarPaginaAcompanhamento() {
  let contexto = exigirTutor();
  if (!contexto) return;
  inicializarBarraSuperior();
  let agendamentosDoTutor = obterAgendamentosDoTutor(contexto.dados, contexto.tutor.id);
  let agendamento = contexto.sessao.agendamentoSelecionadoId
    ? obterAgendamentoPorId(contexto.dados, contexto.sessao.agendamentoSelecionadoId)
    : agendamentosDoTutor[0];
  if (!agendamento) { location.href = 'dashboard-tutor.html'; return; }
  let pet = obterPetPorId(contexto.dados, agendamento.petId);
  let creche = obterCrechePorId(contexto.dados, agendamento.crecheId);
  document.getElementById('meta-acompanhamento').textContent = pet.nome + ' • ' + creche.nome + ' • ' + agendamento.data;
  renderizarLinhaTempo(agendamento);
}

function renderizarLinhaTempo(agendamento) {
  let container = document.getElementById('linha-tempo-lista');
  if (agendamento.linhaDoTempo.length === 0) {
    container.innerHTML = '<p style="color:var(--cor-texto-secundario);font-size:14px;">Ainda não há atividades registradas para este agendamento.</p>';
    return;
  }
  let html = '';
  agendamento.linhaDoTempo.forEach(function (etapa) {
    let emAndamento = etapa.status === 'andamento';
    html += '' +
      '<div class="item-linha-tempo">' +
        '<span class="hora-linha-tempo">' + etapa.horario + '</span>' +
        '<div class="icone-etapa tipo-' + etapa.tipo + '">' + imagemIcone(etapa.tipo === 'chegada' ? 'check' : etapa.tipo, etapa.titulo) + '</div>' +
        '<div class="cartao-etapa ' + (emAndamento ? 'etapa-andamento' : '') + '">' +
          '<div><h4>' + etapa.titulo + '</h4><p>' + etapa.detalhe + '</p></div>' +
          (emAndamento ? '<span class="selo selo-laranja">Em andamento</span>' : '') +
        '</div>' +
      '</div>';
  });
  container.innerHTML = html;
}

function iniciarPaginaAgendaCreche() {
  let contexto = exigirProfissionalVinculado();
  if (!contexto) return;
  inicializarBarraSuperior();
  let creche = obterCrechePorId(contexto.dados, contexto.profissional.crecheId);
  document.getElementById('meta-agenda-creche').textContent = creche.nome + ' • Terça, 20/08/2026';
  document.getElementById('stat-capacidade').textContent = creche.capacidadeTotal;
  document.getElementById('stat-ocupadas').textContent = creche.vagasOcupadas;
  document.getElementById('stat-livres').textContent = creche.capacidadeTotal - creche.vagasOcupadas;

  let listaDaCreche = contexto.dados.agendamentos.filter(function (agendamento) { return agendamento.crecheId === creche.id; });
  let container = document.getElementById('lista-agendamentos-creche');
  let html = '';
  listaDaCreche.forEach(function (agendamento) {
    let pet = obterPetPorId(contexto.dados, agendamento.petId);
    let tutor = obterTutorPorId(contexto.dados, pet.tutorId);
    let selo = agendamento.checkin
      ? '<span class="selo selo-verde">Check-in feito</span>'
      : '<span class="selo selo-azul">Aguardando</span>';
    html += '' +
      '<div class="cartao-agendamento-creche">' +
        '<div class="info-pet-creche">' +
          '<div class="avatar-pet">' + imagemIcone('pata', pet.nome) + '</div>' +
          '<div>' +
            '<h4>' + pet.nome + ' • ' + pet.raca + '</h4>' +
            '<p>Tutor: <strong>' + tutor.nome + '</strong></p>' +
            '<div class="meta-agendamento"><span>' + imagemIcone('relogio', 'Horário') + agendamento.horario + '</span></div>' +
            selo +
          '</div>' +
        '</div>' +
        '<div class="acoes-agendamento">' +
          '<button type="button" class="botao-outline-pequeno" onclick="abrirDetalhesPet(' + pet.id + ')">Ver pet</button>' +
          '<button type="button" class="botao-solido-pequeno" onclick="abrirAtividades(' + agendamento.id + ')">Atividades</button>' +
        '</div>' +
      '</div>';
  });
  container.innerHTML = html;
}

function abrirDetalhesPet(petId) {
  let sessao = obterSessao();
  sessao.petSelecionadoId = petId;
  salvarSessao(sessao);
  location.href = 'detalhes-pet.html';
}

function abrirAtividades(agendamentoId) {
  let sessao = obterSessao();
  sessao.agendamentoAtividadesId = agendamentoId;
  salvarSessao(sessao);
  location.href = 'atividades.html';
}

function iniciarPaginaDetalhesPet() {
  let contexto = exigirProfissional();
  if (!contexto) return;
  inicializarBarraSuperior();
  let pet = obterPetPorId(contexto.dados, contexto.sessao.petSelecionadoId);
  if (!pet) { location.href = 'agenda-creche.html'; return; }
  let tutor = obterTutorPorId(contexto.dados, pet.tutorId);
  let seloCastrado = pet.castrado
    ? '<span class="selo selo-verde">Castrado</span>'
    : '<span class="selo selo-vermelho">Não castrado</span>';

  let linhasTabela = pet.vacinas.map(function (vacina) {
    return '<tr><td>' + vacina.data + '</td><td>' + vacina.produto + '</td><td>' + vacina.dose + '</td><td>' + seloStatusVacina(vacina.status) + '</td></tr>';
  }).join('');

  let itensMobile = pet.vacinas.map(function (vacina) {
    return '<div class="item-vacina-mobile"><div><h5>' + vacina.produto + '</h5><p>' + vacina.data + ' • ' + vacina.dose + '</p></div>' + seloStatusVacina(vacina.status) + '</div>';
  }).join('');

  document.getElementById('cartao-detalhes-pet').innerHTML = '' +
    '<div class="cabecalho-detalhes-pet">' +
      '<div class="avatar-pet-grande">' + imagemIcone('pata', pet.nome) + '</div>' +
      '<div><h3>' + pet.nome + '</h3><p>' + pet.raca + ' • ' + pet.idade + '</p></div>' +
      seloCastrado +
    '</div>' +
    '<div class="grade-info-tutor">' +
      '<div><div class="rotulo">TUTOR</div><div class="valor">' + tutor.nome + ' • ' + (tutor.telefone || '-') + '</div></div>' +
      '<div><div class="rotulo">CASTRADO</div><div class="valor">' + (pet.castrado ? 'Sim' : 'Não') + '</div></div>' +
    '</div>' +
    '<h4 style="margin:0 0 12px;font-size:15px;">Carteira de vacinas</h4>' +
    '<table class="tabela-vacinas"><thead><tr><th>Data</th><th>Produto</th><th>Dose</th><th>Status</th></tr></thead><tbody>' + linhasTabela + '</tbody></table>' +
    '<div class="lista-vacinas-mobile">' + itensMobile + '</div>' +
    '<a class="botao-secundario" href="agenda-creche.html" style="display:block;text-align:center;text-decoration:none;">Voltar para a agenda</a>';
}

let atividadesFormulario = [];
let agendamentoAtividadesAtualId = null;

function iniciarPaginaAtividades() {
  let contexto = exigirProfissional();
  if (!contexto) return;
  inicializarBarraSuperior();
  agendamentoAtividadesAtualId = contexto.sessao.agendamentoAtividadesId;
  let agendamento = obterAgendamentoPorId(contexto.dados, agendamentoAtividadesAtualId);
  if (!agendamento) { location.href = 'agenda-creche.html'; return; }
  let pet = obterPetPorId(contexto.dados, agendamento.petId);
  let tutor = obterTutorPorId(contexto.dados, pet.tutorId);
  document.getElementById('titulo-atividades-pet').textContent = 'Atividades do dia — ' + pet.nome;
  document.getElementById('subtitulo-atividades-pet').textContent = 'Tutor: ' + tutor.nome + ' • ' + agendamento.data;
  atividadesFormulario = agendamento.atividadesProgramadas.map(function (atividade) {
    return { descricao: atividade.descricao, horario: atividade.horario };
  });
  renderizarListaAtividadesFormulario();
}

function renderizarListaAtividadesFormulario() {
  let container = document.getElementById('lista-atividades-formulario');
  let html = '';
  atividadesFormulario.forEach(function (atividade, indice) {
    html += '' +
      '<div class="cartao-atividade-item">' +
        '<div class="info-atividade-item">' +
          '<div class="circulo-check-atividade">' + imagemIcone('check', 'Concluído') + '</div>' +
          '<span class="descricao-atividade-item">' + atividade.descricao + '</span>' +
        '</div>' +
        '<div class="horario-atividade-item">' +
          atividade.horario +
          '<button type="button" class="botao-remover-linha" style="margin-left:8px;" onclick="removerAtividade(' + indice + ')">' + imagemIcone('x', 'Remover') + '</button>' +
        '</div>' +
      '</div>';
  });
  if (atividadesFormulario.length === 0) {
    html = '<p style="color:var(--cor-texto-secundario);font-size:14px;">Nenhuma atividade programada.</p>';
  }
  container.innerHTML = html;
}

function adicionarAtividade() {
  let descricao = document.getElementById('descricao-nova-atividade').value;
  let horario = document.getElementById('horario-nova-atividade').value;
  if (!descricao || !horario) return;
  atividadesFormulario.push({ descricao: descricao, horario: horario });
  document.getElementById('descricao-nova-atividade').value = '';
  renderizarListaAtividadesFormulario();
}

function removerAtividade(indice) {
  atividadesFormulario.splice(indice, 1);
  renderizarListaAtividadesFormulario();
}

function salvarAtividades() {
  let dados = obterDados();
  let agendamento = obterAgendamentoPorId(dados, agendamentoAtividadesAtualId);
  agendamento.atividadesProgramadas = atividadesFormulario.slice();
  salvarDados(dados);
  location.href = 'agenda-creche.html';
}
