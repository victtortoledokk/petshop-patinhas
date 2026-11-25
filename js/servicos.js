/* ==========================================================================
   servicos.js – simulador de preço (página Serviços)
   Patinhas & Cia Pet Shop – João Victor Toledo Duarte

   O cliente escolhe serviço, porte, modalidade e adicional, e o valor é
   recalculado na hora. O botão "Agendar" leva para a página de agendamento
   já com as escolhas preenchidas (parâmetros na URL).

   Depende de: dados.js (calcularPreco, formatarMoeda, NOMES).
   ========================================================================== */
'use strict';

document.addEventListener('DOMContentLoaded', function () {
  const formulario = document.getElementById('form-simulador');
  if (!formulario) {
    return;
  }
  const resultado = document.getElementById('resultado-simulador');
  const detalhe = document.getElementById('detalhe-simulador');
  const linkAgendar = document.getElementById('link-agendar-simulacao');

  function simular() {
    const servico = formulario.elements['sim-servico'].value;
    const porte = formulario.elements['sim-porte'].value;
    const telebusca = formulario.elements['sim-modalidade'].value === 'telebusca';
    const hidratacao = formulario.elements['sim-hidratacao'].checked;

    const valor = calcularPreco(servico, porte, telebusca, hidratacao);
    if (valor === null) {
      resultado.textContent = '—';
      detalhe.textContent = 'Escolha o serviço e o porte do pet.';
      return;
    }
    resultado.textContent = formatarMoeda(valor);
    detalhe.textContent = NOMES.servico[servico] + ', porte ' + NOMES.porte[porte].toLowerCase() +
      (telebusca ? ', com tele-busca' : ', sem tele-busca') +
      (hidratacao ? ', com hidratação' : '') + '.';

    /* Monta o endereço da página de agendamento com as escolhas atuais. */
    const parametros = new URLSearchParams({
      servico: servico,
      porte: porte,
      modalidade: telebusca ? 'telebusca' : 'local'
    });
    if (hidratacao) {
      parametros.set('hidratacao', '1');
    }
    linkAgendar.href = 'agendamento.html?' + parametros.toString();
  }

  /* "change" e "input" cobrem selects, rádios e checkbox. */
  formulario.addEventListener('change', simular);
  formulario.addEventListener('input', simular);
  /* O formulário não é enviado: o resultado já aparece na tela. */
  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();
    simular();
  });

  simular();
});
