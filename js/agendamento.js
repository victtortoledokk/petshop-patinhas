/* ==========================================================================
   agendamento.js – cadastro do cliente e do pet + agendamento do serviço
   Patinhas & Cia Pet Shop – João Victor Toledo Duarte

   Conteúdo:
   1. Máscaras de digitação (CPF, telefone e CEP)
   2. Validações personalizadas (CPF, data e horário)
   3. Busca de endereço pelo CEP (serviço público ViaCEP)
   4. Campos que aparecem/somem conforme as escolhas
   5. Calendário: datas permitidas e horários disponíveis
   6. Resumo e valor total em tempo real
   7. Envio: validação, resumo de erros, confirmação e "Meus agendamentos"
   8. Inicialização (inclui preenchimento vindo do simulador de preços)

   Os agendamentos ficam salvos apenas no navegador do usuário
   (localStorage). O CPF NÃO é salvo, por privacidade.

   Depende de: dados.js, main.js e Bootstrap 5.
   ========================================================================== */
'use strict';

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form-agendamento');
  if (!form) {
    return;
  }
  const campo = function (nome) { return form.elements[nome]; };
  const CHAVE_AGENDAMENTOS = 'agendamentosPatinhas';
  const DIAS_ANTECEDENCIA_MAXIMA = 60;

  /* ------------------------------------------------------------------------
     1. Máscaras de digitação
     ------------------------------------------------------------------------ */

  /* Mantém só os números de um texto. */
  function somenteNumeros(texto) {
    return texto.replace(/\D/g, '');
  }

  function mascaraCpf(valor) {
    const n = somenteNumeros(valor).slice(0, 11);
    return n
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  function mascaraTelefone(valor) {
    const n = somenteNumeros(valor).slice(0, 11);
    if (n.length <= 10) {
      /* Fixo: (11) 3000-0000 */
      return n.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
    }
    /* Celular: (11) 90000-0000 */
    return n.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
  }

  function mascaraCep(valor) {
    return somenteNumeros(valor).slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
  }

  [['cpf', mascaraCpf], ['telefone', mascaraTelefone], ['cep', mascaraCep]].forEach(function (par) {
    campo(par[0]).addEventListener('input', function (evento) {
      evento.target.value = par[1](evento.target.value);
    });
  });

  /* ------------------------------------------------------------------------
     2. Validações personalizadas
     ------------------------------------------------------------------------ */

  /* Confere os dois dígitos verificadores do CPF (algoritmo oficial). */
  function cpfValido(cpf) {
    const n = somenteNumeros(cpf);
    if (n.length !== 11 || /^(\d)\1{10}$/.test(n)) {
      return false;  /* tamanho errado ou todos os dígitos iguais */
    }
    for (let posicao = 9; posicao <= 10; posicao++) {
      let soma = 0;
      for (let i = 0; i < posicao; i++) {
        soma += Number(n[i]) * (posicao + 1 - i);
      }
      const digito = (soma * 10) % 11 % 10;
      if (digito !== Number(n[posicao])) {
        return false;
      }
    }
    return true;
  }

  /* setCustomValidity faz o campo ficar inválido com uma mensagem própria,
     que aparece no resumo de erros e para o leitor de tela. */
  function validarCpf() {
    const valor = campo('cpf').value;
    campo('cpf').setCustomValidity(valor === '' || cpfValido(valor) ? '' : 'CPF inválido. Confira os números digitados.');
  }

  function validarTelefone() {
    const total = somenteNumeros(campo('telefone').value).length;
    campo('telefone').setCustomValidity(total === 0 || total >= 10 ? '' : 'Informe o telefone com DDD.');
  }

  function validarCep() {
    const total = somenteNumeros(campo('cep').value).length;
    campo('cep').setCustomValidity(total === 0 || total === 8 ? '' : 'O CEP deve ter 8 números.');
  }

  campo('cpf').addEventListener('input', validarCpf);
  campo('telefone').addEventListener('input', validarTelefone);
  campo('cep').addEventListener('input', validarCep);

  /* ------------------------------------------------------------------------
     3. Busca de endereço pelo CEP (ViaCEP)
     ------------------------------------------------------------------------ */
  const statusCep = document.getElementById('status-cep');

  async function buscarCep() {
    const cep = somenteNumeros(campo('cep').value);
    if (cep.length !== 8) {
      return;
    }
    statusCep.textContent = 'Buscando endereço…';
    try {
      const resposta = await fetch('https://viacep.com.br/ws/' + cep + '/json/');
      const dados = await resposta.json();
      if (dados.erro) {
        statusCep.textContent = 'CEP não encontrado. Preencha o endereço manualmente.';
        return;
      }
      campo('logradouro').value = dados.logradouro || '';
      campo('bairro').value = dados.bairro || '';
      campo('cidade').value = dados.localidade || '';
      campo('uf').value = dados.uf || '';
      statusCep.textContent = 'Endereço preenchido automaticamente. Informe o número.';
      campo('numero').focus();
      atualizarResumo();
    } catch (erro) {
      /* Sem internet ou serviço fora do ar: o usuário digita normalmente. */
      statusCep.textContent = 'Não foi possível buscar o CEP agora. Preencha o endereço manualmente.';
    }
  }
  campo('cep').addEventListener('change', buscarCep);

  /* ------------------------------------------------------------------------
     4. Campos condicionais
     ------------------------------------------------------------------------ */

  /* Mostra/esconde um bloco e liga/desliga o "required" dos campos dele.
     Campos escondidos não podem ser obrigatórios, senão o envio trava. */
  function alternarBloco(bloco, mostrar, camposObrigatorios) {
    bloco.hidden = !mostrar;
    camposObrigatorios.forEach(function (elemento) {
      elemento.required = mostrar;
      elemento.disabled = !mostrar;
    });
  }

  const grupoTipoTosa = document.getElementById('grupo-tipo-tosa');
  const blocoBusca = document.getElementById('bloco-endereco-busca');
  const blocoOutroEndereco = document.getElementById('bloco-outro-endereco');

  function atualizarCondicionais() {
    const servico = form.querySelector('input[name="servico"]:checked');
    alternarBloco(grupoTipoTosa, servico !== null && servico.value === 'tosa',
      Array.from(form.querySelectorAll('input[name="tipoTosa"]')));

    const modalidade = form.querySelector('input[name="modalidade"]:checked');
    const telebusca = modalidade !== null && modalidade.value === 'telebusca';
    blocoBusca.hidden = !telebusca;
    alternarBloco(blocoOutroEndereco, telebusca && !campo('mesmoEndereco').checked,
      [campo('enderecoBusca')]);
  }

  /* Lista de raças sugeridas muda conforme a espécie escolhida. */
  const RACAS = {
    cao: ['Sem raça definida (SRD)', 'Shih-tzu', 'Poodle', 'Yorkshire', 'Lhasa Apso', 'Spitz Alemão',
      'Pinscher', 'Bulldog Francês', 'Labrador', 'Golden Retriever', 'Border Collie'],
    gato: ['Sem raça definida (SRD)', 'Persa', 'Siamês', 'Maine Coon', 'Angorá', 'Ragdoll', 'Bengal']
  };

  function atualizarRacas() {
    const especie = form.querySelector('input[name="especie"]:checked');
    const lista = document.getElementById('lista-racas');
    lista.innerHTML = '';
    (especie ? RACAS[especie.value] : RACAS.cao.concat(RACAS.gato.slice(1))).forEach(function (raca) {
      const opcao = document.createElement('option');
      opcao.value = raca;
      lista.appendChild(opcao);
    });
  }

  /* Sugere o porte a partir do peso digitado. */
  function sugerirPorte() {
    const peso = Number(campo('peso').value);
    const aviso = document.getElementById('aviso-porte');
    if (!peso) {
      aviso.textContent = '';
      return;
    }
    let porte = 'grande';
    if (peso <= 10) {
      porte = 'pequeno';
    } else if (peso <= 25) {
      porte = 'medio';
    }
    campo('porte').value = porte;
    aviso.textContent = 'Porte ajustado para "' + NOMES.porte[porte] + '" de acordo com o peso.';
    atualizarResumo();
  }
  campo('peso').addEventListener('change', sugerirPorte);

  /* Contador de caracteres das observações. */
  const contadorObs = document.getElementById('contador-obs');
  campo('observacoes').addEventListener('input', function () {
    const restante = campo('observacoes').maxLength - campo('observacoes').value.length;
    contadorObs.textContent = restante + ' caracteres restantes';
  });

  /* ------------------------------------------------------------------------
     5. Calendário e horários
     ------------------------------------------------------------------------ */

  /* Converte Date para o formato do input date: "2026-11-25". */
  function paraIso(data) {
    return data.getFullYear() + '-' + String(data.getMonth() + 1).padStart(2, '0') + '-' +
      String(data.getDate()).padStart(2, '0');
  }

  /* "2026-11-25" -> objeto Date no fuso local (meia-noite). */
  function deIso(texto) {
    const partes = texto.split('-').map(Number);
    return new Date(partes[0], partes[1] - 1, partes[2]);
  }

  /* Data por extenso para o resumo: "sexta-feira, 27/11/2026". */
  function dataPorExtenso(texto) {
    return deIso(texto).toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  /* Limita o calendário: a partir de amanhã até 60 dias à frente. */
  function configurarCalendario() {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const limite = new Date();
    limite.setDate(limite.getDate() + DIAS_ANTECEDENCIA_MAXIMA);
    campo('data').min = paraIso(amanha);
    campo('data').max = paraIso(limite);
  }

  function agendamentosSalvos() {
    return lerLocal(CHAVE_AGENDAMENTOS, []);
  }

  /* Preenche a lista de horários conforme o dia escolhido.
     Último horário: 1 hora antes de fechar. Horários já agendados neste
     navegador aparecem como "indisponível". */
  function atualizarHorarios() {
    const select = campo('horario');
    const ajuda = document.getElementById('ajuda-horario');
    const valorAnterior = select.value;
    select.innerHTML = '<option value="">Escolha primeiro a data</option>';
    select.disabled = true;

    const textoData = campo('data').value;
    campo('data').setCustomValidity('');
    if (!textoData) {
      return;
    }
    const data = deIso(textoData);
    const horario = HORARIO_FUNCIONAMENTO[data.getDay()];

    if (data < deIso(campo('data').min) || data > deIso(campo('data').max)) {
      campo('data').setCustomValidity('Escolha uma data entre amanhã e os próximos ' + DIAS_ANTECEDENCIA_MAXIMA + ' dias.');
      ajuda.textContent = campo('data').validationMessage;
      return;
    }
    if (!horario) {
      campo('data').setCustomValidity('Não abrimos aos domingos. Escolha outro dia.');
      ajuda.textContent = campo('data').validationMessage;
      return;
    }

    const ocupados = agendamentosSalvos()
      .filter(function (ag) { return ag.data === textoData; })
      .map(function (ag) { return ag.horario; });

    select.innerHTML = '<option value="">Selecione um horário</option>';
    let livres = 0;
    for (let hora = horario.abre; hora < horario.fecha; hora++) {
      const texto = String(hora).padStart(2, '0') + ':00';
      const opcao = document.createElement('option');
      opcao.value = texto;
      if (ocupados.includes(texto)) {
        opcao.disabled = true;
        opcao.textContent = texto + ' (indisponível)';
      } else {
        opcao.textContent = texto;
        livres++;
      }
      select.appendChild(opcao);
    }
    select.disabled = false;
    /* Mantém o horário escolhido antes, se ele ainda existir e estiver livre. */
    if (valorAnterior && !ocupados.includes(valorAnterior) &&
        select.querySelector('option[value="' + valorAnterior + '"]')) {
      select.value = valorAnterior;
    }
    ajuda.textContent = livres + ' horários livres em ' + dataPorExtenso(textoData) +
      ' (atendimento das ' + horario.abre + 'h às ' + horario.fecha + 'h).';
  }
  campo('data').addEventListener('change', atualizarHorarios);

  /* ------------------------------------------------------------------------
     6. Resumo em tempo real
     ------------------------------------------------------------------------ */

  /* Lê as escolhas atuais e devolve a chave do serviço em PRECOS. */
  function servicoEscolhido() {
    const servico = form.querySelector('input[name="servico"]:checked');
    if (!servico) {
      return null;
    }
    if (servico.value === 'banho') {
      return 'banho';
    }
    const tipo = form.querySelector('input[name="tipoTosa"]:checked');
    if (!tipo) {
      return null;
    }
    return tipo.value === 'completa' ? 'tosaCompleta' : 'tosaHigienica';
  }

  function valorDoRadio(nome) {
    const marcado = form.querySelector('input[name="' + nome + '"]:checked');
    return marcado ? marcado.value : '';
  }

  function definirTexto(id, texto) {
    document.getElementById(id).textContent = texto || '—';
  }

  function atualizarResumo() {
    const servico = servicoEscolhido();
    const porte = campo('porte').value;
    const modalidade = valorDoRadio('modalidade');
    const hidratacao = campo('hidratacao').checked;

    definirTexto('resumo-pet', campo('petNome').value.trim());
    definirTexto('resumo-servico', servico ? NOMES.servico[servico] + (hidratacao ? ' + hidratação' : '') : '');
    definirTexto('resumo-porte', porte ? NOMES.porte[porte] : '');
    definirTexto('resumo-modalidade', modalidade ? NOMES.modalidade[modalidade] : '');
    definirTexto('resumo-data', campo('data').value && campo('horario').value
      ? dataPorExtenso(campo('data').value) + ', às ' + campo('horario').value : '');

    const valor = calcularPreco(servico, porte, modalidade === 'telebusca', hidratacao);
    document.getElementById('resumo-total').textContent = valor === null ? 'R$ —' : formatarMoeda(valor);
    return valor;
  }

  form.addEventListener('change', function () {
    atualizarCondicionais();
    atualizarResumo();
  });
  form.addEventListener('input', atualizarResumo);
  form.querySelectorAll('input[name="especie"]').forEach(function (radio) {
    radio.addEventListener('change', atualizarRacas);
  });

  /* ------------------------------------------------------------------------
     7. Envio do formulário
     ------------------------------------------------------------------------ */
  const resumoErros = document.getElementById('resumo-erros');

  /* Descobre o nome legível de um campo para a lista de erros. */
  function rotuloDoCampo(elemento) {
    if (elemento.dataset.rotulo) {
      return elemento.dataset.rotulo;
    }
    const rotulo = form.querySelector('label[for="' + elemento.id + '"]');
    return rotulo ? rotulo.textContent.replace('*', '').trim() : elemento.name;
  }

  /* Mensagem em português para cada campo: usa o texto do próprio site
     (div .invalid-feedback) em vez da mensagem padrão do navegador, que
     pode estar em outro idioma. Erros personalizados (CPF, data) mantêm
     a mensagem definida com setCustomValidity. */
  function mensagemDeErro(elemento) {
    if (elemento.validity.customError) {
      return elemento.validationMessage;
    }
    if (elemento.type === 'radio') {
      return 'escolha uma opção.';
    }
    const bloco = elemento.closest('.form-check') || elemento.parentElement;
    const feedback = bloco.querySelector('.invalid-feedback');
    return feedback ? feedback.textContent : elemento.validationMessage;
  }

  /* Monta uma lista com links para cada campo com erro (padrão acessível:
     o usuário de leitor de tela ouve todos os erros e pula direto ao campo). */
  function mostrarResumoErros(moverFoco) {
    const invalidos = Array.from(form.querySelectorAll(':invalid'))
      .filter(function (elemento) { return elemento.tagName !== 'FIELDSET'; });
    const vistos = new Set();
    const lista = resumoErros.querySelector('ul');
    lista.innerHTML = '';

    invalidos.forEach(function (elemento) {
      /* Um grupo de rádios aparece uma vez só na lista. */
      const chave = elemento.type === 'radio' ? elemento.name : elemento.id;
      if (vistos.has(chave)) {
        return;
      }
      vistos.add(chave);
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = '#' + elemento.id;
      link.textContent = rotuloDoCampo(elemento) + ': ' + mensagemDeErro(elemento);
      link.addEventListener('click', function (evento) {
        evento.preventDefault();
        elemento.focus();
      });
      item.appendChild(link);
      lista.appendChild(item);
    });

    resumoErros.querySelector('.qtd-erros').textContent = vistos.size === 1
      ? 'Há 1 campo para corrigir:' : 'Há ' + vistos.size + ' campos para corrigir:';
    /* Sem erros restantes: o resumo some. */
    resumoErros.hidden = vistos.size === 0;
    if (moverFoco !== false && vistos.size > 0) {
      resumoErros.focus();
    }
  }

  /* Depois da primeira tentativa de envio, o resumo de erros é refeito a
     cada alteração, para não mostrar campos que já foram corrigidos. O
     foco não é movido, para não atrapalhar quem está digitando. */
  function atualizarResumoErros() {
    if (!resumoErros.hidden) {
      validarCpf();
      validarTelefone();
      validarCep();
      mostrarResumoErros(false);
    }
  }
  form.addEventListener('input', atualizarResumoErros);
  form.addEventListener('change', atualizarResumoErros);

  /* Número de protocolo: PT + data + 4 dígitos aleatórios. */
  function gerarProtocolo() {
    const hoje = paraIso(new Date()).replace(/-/g, '');
    return 'PT-' + hoje + '-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  }

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();   /* não recarrega a página */
    validarCpf();
    validarTelefone();
    validarCep();
    atualizarHorarios();

    form.classList.add('was-validated');   /* ativa os estilos do Bootstrap */
    if (!form.checkValidity()) {
      mostrarResumoErros(true);
      return;
    }
    resumoErros.hidden = true;

    const servico = servicoEscolhido();
    const modalidade = valorDoRadio('modalidade');
    const valor = atualizarResumo();
    const agendamento = {
      protocolo: gerarProtocolo(),
      criadoEm: new Date().toISOString(),
      cliente: campo('nome').value.trim(),
      telefone: campo('telefone').value,
      pet: campo('petNome').value.trim(),
      especie: valorDoRadio('especie'),
      porte: campo('porte').value,
      servico: servico,
      hidratacao: campo('hidratacao').checked,
      modalidade: modalidade,
      enderecoBusca: modalidade === 'telebusca'
        ? (campo('mesmoEndereco').checked
          ? campo('logradouro').value + ', ' + campo('numero').value + ' – ' + campo('bairro').value
          : campo('enderecoBusca').value.trim())
        : '',
      data: campo('data').value,
      horario: campo('horario').value,
      valor: valor
    };

    const lista = agendamentosSalvos();
    lista.push(agendamento);
    salvarLocal(CHAVE_AGENDAMENTOS, lista);

    /* Preenche e abre a janela de confirmação. */
    document.getElementById('confirmacao-protocolo').textContent = agendamento.protocolo;
    const detalhes = document.getElementById('confirmacao-detalhes');
    detalhes.innerHTML = '';
    [
      ['Pet', agendamento.pet],
      ['Serviço', NOMES.servico[servico] + (agendamento.hidratacao ? ' + hidratação' : '')],
      ['Quando', dataPorExtenso(agendamento.data) + ', às ' + agendamento.horario],
      ['Modalidade', NOMES.modalidade[modalidade]],
      ['Endereço de busca', agendamento.enderecoBusca],
      ['Valor', formatarMoeda(valor)]
    ].forEach(function (par) {
      if (!par[1]) {
        return;
      }
      const termo = document.createElement('dt');
      termo.className = 'col-sm-4';
      termo.textContent = par[0];
      const definicao = document.createElement('dd');
      definicao.className = 'col-sm-8';
      definicao.textContent = par[1];
      detalhes.append(termo, definicao);
    });

    bootstrap.Modal.getOrCreateInstance(document.getElementById('modal-confirmacao')).show();

    /* Limpa o formulário para um novo agendamento. */
    form.reset();
    form.classList.remove('was-validated');
    atualizarCondicionais();
    atualizarHorarios();
    atualizarResumo();
    document.getElementById('status-cep').textContent = '';
    document.getElementById('aviso-porte').textContent = '';
    desenharAgendamentos();
  });

  /* Ao limpar pelo botão "Limpar", também zera resumo e mensagens. */
  form.addEventListener('reset', function () {
    setTimeout(function () {
      form.classList.remove('was-validated');
      resumoErros.hidden = true;
      atualizarCondicionais();
      atualizarHorarios();
      atualizarResumo();
    }, 0);
  });

  /* Lista "Meus agendamentos" (salvos neste navegador). */
  function desenharAgendamentos() {
    const corpo = document.getElementById('lista-agendamentos');
    const vazio = document.getElementById('sem-agendamentos');
    const tabela = document.getElementById('tabela-agendamentos');
    const lista = agendamentosSalvos()
      .sort(function (a, b) { return (a.data + a.horario).localeCompare(b.data + b.horario); });

    corpo.innerHTML = '';
    vazio.hidden = lista.length > 0;
    tabela.hidden = lista.length === 0;

    lista.forEach(function (ag) {
      const linha = document.createElement('tr');
      [
        dataPorExtenso(ag.data) + ' – ' + ag.horario,
        ag.pet,
        NOMES.servico[ag.servico] + (ag.hidratacao ? ' + hidratação' : ''),
        ag.modalidade === 'telebusca' ? 'Tele-busca' : 'No local',
        formatarMoeda(ag.valor),
        ag.protocolo
      ].forEach(function (texto) {
        const celula = document.createElement('td');
        celula.textContent = texto;
        linha.appendChild(celula);
      });
      const celulaAcao = document.createElement('td');
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'btn btn-sm btn-outline-danger';
      botao.textContent = 'Cancelar';
      botao.setAttribute('aria-label', 'Cancelar agendamento ' + ag.protocolo + ' de ' + ag.pet);
      botao.addEventListener('click', function () {
        salvarLocal(CHAVE_AGENDAMENTOS, agendamentosSalvos()
          .filter(function (outro) { return outro.protocolo !== ag.protocolo; }));
        desenharAgendamentos();
        atualizarHorarios();
        mostrarAviso('Agendamento ' + ag.protocolo + ' cancelado.', 'info');
        document.getElementById('titulo-meus-agendamentos').focus();
      });
      celulaAcao.appendChild(botao);
      linha.appendChild(celulaAcao);
      corpo.appendChild(linha);
    });
  }

  /* ------------------------------------------------------------------------
     8. Inicialização
     ------------------------------------------------------------------------ */

  /* Se o cliente veio do simulador de preços, as escolhas já vêm marcadas. */
  function preencherPelaUrl() {
    const parametros = new URLSearchParams(window.location.search);
    const servico = parametros.get('servico');
    const marcar = function (nome, valor) {
      const radio = form.querySelector('input[name="' + nome + '"][value="' + valor + '"]');
      if (radio) {
        radio.checked = true;
      }
    };
    if (servico === 'banho') {
      marcar('servico', 'banho');
    } else if (servico === 'tosaHigienica' || servico === 'tosaCompleta') {
      marcar('servico', 'tosa');
      marcar('tipoTosa', servico === 'tosaCompleta' ? 'completa' : 'higienica');
    }
    if (parametros.get('modalidade')) {
      marcar('modalidade', parametros.get('modalidade'));
    }
    if (['pequeno', 'medio', 'grande'].includes(parametros.get('porte'))) {
      campo('porte').value = parametros.get('porte');
    }
    if (parametros.get('hidratacao') === '1') {
      campo('hidratacao').checked = true;
    }
  }

  configurarCalendario();
  preencherPelaUrl();
  atualizarRacas();
  atualizarCondicionais();
  atualizarHorarios();
  atualizarResumo();
  desenharAgendamentos();
});
