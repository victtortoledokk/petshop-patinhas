/* ==========================================================================
   dados.js – dados compartilhados pelo site (Fase 2)
   Patinhas & Cia Pet Shop – João Victor Toledo Duarte

   Centralizar os preços e horários aqui evita valores diferentes entre a
   página de serviços (simulador) e a página de agendamento.
   ========================================================================== */
'use strict';

/* Preços dos serviços, em reais, por porte do animal.
   A tosa sempre inclui o banho. */
const PRECOS = {
  banho:          { pequeno: 50,  medio: 70,  grande: 90 },
  tosaHigienica:  { pequeno: 70,  medio: 90,  grande: 115 },
  tosaCompleta:   { pequeno: 90,  medio: 120, grande: 150 }
};

/* Valor acrescentado quando o cliente escolhe a tele-busca (ida e volta). */
const TAXA_TELEBUSCA = 20;

/* Valor do adicional de hidratação dos pelos. */
const TAXA_HIDRATACAO = 20;

/* Horário de funcionamento por dia da semana (0 = domingo ... 6 = sábado).
   null significa loja fechada. Os números são horas cheias. */
const HORARIO_FUNCIONAMENTO = {
  0: null,
  1: { abre: 8, fecha: 19 },
  2: { abre: 8, fecha: 19 },
  3: { abre: 8, fecha: 19 },
  4: { abre: 8, fecha: 19 },
  5: { abre: 8, fecha: 19 },
  6: { abre: 8, fecha: 14 }
};

/* Nomes legíveis usados nos resumos e mensagens. */
const NOMES = {
  servico: {
    banho: 'Banho',
    tosaHigienica: 'Banho e tosa higiênica',
    tosaCompleta: 'Banho e tosa completa'
  },
  porte: {
    pequeno: 'Pequeno (até 10 kg)',
    medio: 'Médio (de 10 a 25 kg)',
    grande: 'Grande (acima de 25 kg)'
  },
  modalidade: {
    telebusca: 'Tele-busca (buscamos e levamos o pet)',
    local: 'Entrega do pet no local'
  }
};

/**
 * Calcula o valor de um serviço.
 * @param {string} servico   chave de PRECOS (banho, tosaHigienica, tosaCompleta)
 * @param {string} porte     pequeno | medio | grande
 * @param {boolean} telebusca true se o cliente quer tele-busca
 * @param {boolean} hidratacao true se o cliente quer o adicional de hidratação
 * @returns {number|null} valor em reais, ou null se faltar informação
 */
function calcularPreco(servico, porte, telebusca, hidratacao) {
  if (!PRECOS[servico] || !PRECOS[servico][porte]) {
    return null;
  }
  let total = PRECOS[servico][porte];
  if (telebusca) {
    total += TAXA_TELEBUSCA;
  }
  if (hidratacao) {
    total += TAXA_HIDRATACAO;
  }
  return total;
}

/**
 * Formata um número como moeda brasileira. Ex.: 129.9 -> "R$ 129,90"
 * @param {number} valor
 * @returns {string}
 */
function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
