/* ==========================================================================
   main.js – funções usadas em todas as páginas (Fase 2)
   Patinhas & Cia Pet Shop – João Victor Toledo Duarte

   Conteúdo:
   1. Utilitários (armazenamento local, avisos e anúncios para leitor de tela)
   2. Acessibilidade: tamanho do texto, alto contraste e leitura em voz alta
   3. Funções temporais: status da loja, relógio, saudação, contagem
      regressiva da promoção e dicas rotativas
   4. Carrossel da página inicial (com botão de pausa)
   5. Inicialização

   Depende de: dados.js (HORARIO_FUNCIONAMENTO) e Bootstrap 5 (bundle).
   ========================================================================== */
'use strict';

/* --------------------------------------------------------------------------
   1. Utilitários
   -------------------------------------------------------------------------- */

/* Lê um valor salvo no navegador. O try/catch evita erro quando o navegador
   bloqueia o localStorage (ex.: modo privado em alguns navegadores). */
function lerLocal(chave, padrao) {
  try {
    const valor = localStorage.getItem(chave);
    return valor === null ? padrao : JSON.parse(valor);
  } catch (erro) {
    return padrao;
  }
}

/* Salva um valor no navegador (convertido para texto JSON). */
function salvarLocal(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch (erro) {
    /* Sem armazenamento disponível: o site continua funcionando sem salvar. */
  }
}

/* Envia uma mensagem para a região "aria-live" escondida, que é lida pelos
   leitores de tela sem mover o foco do usuário. */
function anunciar(mensagem) {
  const regiao = document.getElementById('anuncio-leitor');
  if (!regiao) {
    return;
  }
  regiao.textContent = '';
  /* Pequeno atraso para o leitor de tela perceber a mudança de texto. */
  setTimeout(function () {
    regiao.textContent = mensagem;
  }, 100);
}

/* Mostra um aviso flutuante (toast do Bootstrap) no canto da tela.
   O toast tem role="status", então também é lido por leitores de tela. */
function mostrarAviso(mensagem, tipo) {
  const area = document.getElementById('area-avisos');
  if (!area || typeof bootstrap === 'undefined') {
    anunciar(mensagem);
    return;
  }
  const cores = { sucesso: 'text-bg-success', erro: 'text-bg-danger', info: 'text-bg-dark' };
  const aviso = document.createElement('div');
  aviso.className = 'toast align-items-center border-0 ' + (cores[tipo] || cores.info);
  aviso.setAttribute('role', 'status');
  aviso.setAttribute('aria-live', 'polite');
  aviso.setAttribute('aria-atomic', 'true');
  aviso.innerHTML =
    '<div class="d-flex">' +
    '  <div class="toast-body"></div>' +
    '  <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Fechar aviso"></button>' +
    '</div>';
  /* textContent (e não innerHTML) impede que texto digitado vire código. */
  aviso.querySelector('.toast-body').textContent = mensagem;
  area.appendChild(aviso);
  const toast = new bootstrap.Toast(aviso, { delay: 5000 });
  /* Remove o elemento da página depois que o aviso some. */
  aviso.addEventListener('hidden.bs.toast', function () {
    aviso.remove();
  });
  toast.show();
}

/* --------------------------------------------------------------------------
   2. Acessibilidade
   -------------------------------------------------------------------------- */

/* Tamanhos de fonte disponíveis (em % do tamanho padrão do navegador).
   Como o Bootstrap usa a unidade "rem", todo o site acompanha a mudança. */
const TAMANHOS_FONTE = [100, 112.5, 125, 137.5, 150];
let indiceFonte = 0;

function aplicarTamanhoFonte(indice) {
  indiceFonte = Math.max(0, Math.min(TAMANHOS_FONTE.length - 1, indice));
  document.documentElement.style.fontSize = TAMANHOS_FONTE[indiceFonte] + '%';
  salvarLocal('acessibilidadeFonte', indiceFonte);
}

/* Liga ou desliga o modo de alto contraste (classe no <body>). */
function aplicarContraste(ativo) {
  document.body.classList.toggle('alto-contraste', ativo);
  const botao = document.getElementById('btn-contraste');
  if (botao) {
    botao.setAttribute('aria-pressed', String(ativo));
  }
  salvarLocal('acessibilidadeContraste', ativo);
}

function iniciarAcessibilidade() {
  /* Restaura as preferências escolhidas em visitas anteriores. */
  aplicarTamanhoFonte(lerLocal('acessibilidadeFonte', 0));
  aplicarContraste(lerLocal('acessibilidadeContraste', false));

  const ligar = function (id, acao) {
    const botao = document.getElementById(id);
    if (botao) {
      botao.addEventListener('click', acao);
    }
  };

  ligar('btn-aumentar-fonte', function () {
    aplicarTamanhoFonte(indiceFonte + 1);
    anunciar('Texto aumentado para ' + TAMANHOS_FONTE[indiceFonte] + ' por cento.');
  });
  ligar('btn-diminuir-fonte', function () {
    aplicarTamanhoFonte(indiceFonte - 1);
    anunciar('Texto diminuído para ' + TAMANHOS_FONTE[indiceFonte] + ' por cento.');
  });
  ligar('btn-fonte-padrao', function () {
    aplicarTamanhoFonte(0);
    anunciar('Tamanho de texto padrão.');
  });
  ligar('btn-contraste', function () {
    const ativo = !document.body.classList.contains('alto-contraste');
    aplicarContraste(ativo);
    anunciar(ativo ? 'Alto contraste ativado.' : 'Alto contraste desativado.');
  });

  iniciarLeituraEmVoz();
}

/* Leitura em voz alta do conteúdo principal (Web Speech API).
   Ajuda pessoas com baixa visão que não usam leitor de tela. */
function iniciarLeituraEmVoz() {
  const botao = document.getElementById('btn-ouvir');
  if (!botao) {
    return;
  }
  /* Se o navegador não tem síntese de voz, o botão é escondido. */
  if (!('speechSynthesis' in window)) {
    botao.hidden = true;
    return;
  }

  const rotulo = botao.querySelector('.rotulo-ouvir');

  function pararLeitura() {
    window.speechSynthesis.cancel();
    botao.setAttribute('aria-pressed', 'false');
    rotulo.textContent = 'Ouvir página';
  }

  botao.addEventListener('click', function () {
    if (botao.getAttribute('aria-pressed') === 'true') {
      pararLeitura();
      return;
    }
    const principal = document.querySelector('main');
    /* Divide o texto em frases: textos longos de uma vez só podem ser
       interrompidos por alguns navegadores. */
    const frases = principal.innerText
      .replace(/\s+/g, ' ')
      .split(/(?<=[.!?:])\s+/)
      .filter(function (frase) { return frase.trim().length > 0; });

    window.speechSynthesis.cancel();
    frases.forEach(function (frase, posicao) {
      const fala = new SpeechSynthesisUtterance(frase);
      fala.lang = 'pt-BR';
      fala.rate = 1;
      if (posicao === frases.length - 1) {
        fala.onend = pararLeitura;
      }
      window.speechSynthesis.speak(fala);
    });
    botao.setAttribute('aria-pressed', 'true');
    rotulo.textContent = 'Parar leitura';
  });

  /* Interrompe a leitura se o usuário sair da página. */
  window.addEventListener('pagehide', pararLeitura);
}

/* --------------------------------------------------------------------------
   3. Funções temporais
   -------------------------------------------------------------------------- */

const DIAS_SEMANA = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
  'quinta-feira', 'sexta-feira', 'sábado'];

/* Completa com zero à esquerda: 7 -> "07". */
function doisDigitos(numero) {
  return String(numero).padStart(2, '0');
}

/* Calcula se a loja está aberta agora e monta a frase exibida na barra do
   topo. Atualizada a cada minuto com setInterval. */
function atualizarStatusLoja() {
  const elemento = document.getElementById('status-loja');
  if (!elemento) {
    return;
  }
  const agora = new Date();
  const horarioHoje = HORARIO_FUNCIONAMENTO[agora.getDay()];
  const horaDecimal = agora.getHours() + agora.getMinutes() / 60;

  if (horarioHoje && horaDecimal >= horarioHoje.abre && horaDecimal < horarioHoje.fecha) {
    elemento.textContent = 'Aberto agora · fecha às ' + horarioHoje.fecha + 'h';
    elemento.className = 'badge text-bg-success';
    return;
  }

  /* Procura o próximo dia/horário de abertura (até 7 dias à frente). */
  for (let i = 0; i <= 7; i++) {
    const dia = new Date(agora);
    dia.setDate(agora.getDate() + i);
    const horario = HORARIO_FUNCIONAMENTO[dia.getDay()];
    if (!horario) {
      continue;
    }
    if (i === 0 && horaDecimal >= horario.abre) {
      continue;  /* hoje já passou do horário */
    }
    let quando = 'hoje';
    if (i === 1) {
      quando = 'amanhã';
    } else if (i > 1) {
      quando = DIAS_SEMANA[dia.getDay()];
    }
    elemento.textContent = 'Fechado agora · abre ' + quando + ' às ' + horario.abre + 'h';
    elemento.className = 'badge text-bg-secondary';
    return;
  }
}

/* Relógio e saudação de acordo com a hora do dia (página inicial). */
function atualizarRelogio() {
  const relogio = document.getElementById('relogio');
  const saudacao = document.getElementById('saudacao');
  const agora = new Date();

  if (relogio) {
    relogio.textContent = doisDigitos(agora.getHours()) + ':' +
      doisDigitos(agora.getMinutes()) + ':' + doisDigitos(agora.getSeconds());
  }
  if (saudacao) {
    const hora = agora.getHours();
    let texto = 'Boa noite';
    if (hora >= 5 && hora < 12) {
      texto = 'Bom dia';
    } else if (hora >= 12 && hora < 18) {
      texto = 'Boa tarde';
    }
    saudacao.textContent = texto + '! Hoje é ' + DIAS_SEMANA[agora.getDay()] + ', ' +
      agora.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }) + '.';
  }
}

/* Contagem regressiva até o fim da promoção da semana (domingo, 0h). */
function atualizarContagem() {
  const contador = document.getElementById('contador-promocao');
  if (!contador) {
    return;
  }
  const agora = new Date();
  const fim = new Date(agora);
  /* Dias que faltam até o próximo domingo (se hoje é domingo, conta 7). */
  const diasAteDomingo = (7 - agora.getDay()) % 7 || 7;
  fim.setDate(agora.getDate() + diasAteDomingo);
  fim.setHours(0, 0, 0, 0);

  let restante = Math.max(0, Math.floor((fim - agora) / 1000));  /* em segundos */
  const dias = Math.floor(restante / 86400);
  restante %= 86400;
  const horas = Math.floor(restante / 3600);
  restante %= 3600;
  const minutos = Math.floor(restante / 60);
  const segundos = restante % 60;

  contador.textContent = dias + (dias === 1 ? ' dia, ' : ' dias, ') +
    doisDigitos(horas) + 'h ' + doisDigitos(minutos) + 'min ' + doisDigitos(segundos) + 's';
}

/* Dicas de cuidados com o pet que mudam sozinhas a cada 8 segundos. */
const DICAS = [
  'Escove os dentes do seu cão pelo menos três vezes por semana.',
  'Deixe sempre água fresca e limpa à disposição do seu pet.',
  'Gatos gostam de arranhadores: eles ajudam a manter as unhas saudáveis.',
  'Mantenha a carteira de vacinação do seu pet sempre em dia.',
  'Em dias quentes, evite passear com o cão no asfalto entre 10h e 16h.',
  'Troque a ração aos poucos, misturando a nova com a antiga por uma semana.'
];
let indiceDica = 0;
let intervaloDicas = null;

function trocarDica() {
  const texto = document.getElementById('dica-texto');
  if (!texto) {
    return;
  }
  indiceDica = (indiceDica + 1) % DICAS.length;
  texto.style.opacity = 0;
  /* setTimeout: espera o texto sumir (0,4 s) antes de trocar. */
  setTimeout(function () {
    texto.textContent = DICAS[indiceDica];
    texto.style.opacity = 1;
  }, 400);
}

function iniciarDicas() {
  const texto = document.getElementById('dica-texto');
  const botaoProxima = document.getElementById('btn-proxima-dica');
  const botaoPausa = document.getElementById('btn-pausar-dicas');
  if (!texto) {
    return;
  }
  texto.textContent = DICAS[0];
  intervaloDicas = setInterval(trocarDica, 8000);

  if (botaoProxima) {
    botaoProxima.addEventListener('click', trocarDica);
  }
  /* Permite pausar a troca automática (texto em movimento pode atrapalhar). */
  if (botaoPausa) {
    botaoPausa.addEventListener('click', function () {
      if (intervaloDicas) {
        clearInterval(intervaloDicas);
        intervaloDicas = null;
        botaoPausa.textContent = 'Retomar dicas';
        botaoPausa.setAttribute('aria-pressed', 'true');
      } else {
        intervaloDicas = setInterval(trocarDica, 8000);
        botaoPausa.textContent = 'Pausar dicas';
        botaoPausa.setAttribute('aria-pressed', 'false');
      }
    });
  }
}

/* --------------------------------------------------------------------------
   4. Carrossel (Bootstrap) com botão de pausa
   -------------------------------------------------------------------------- */
function iniciarCarrossel() {
  const elemento = document.getElementById('carrossel-destaques');
  if (!elemento || typeof bootstrap === 'undefined') {
    return;
  }
  const botao = document.getElementById('btn-pausar-carrossel');
  const areaSlides = elemento.querySelector('.carousel-inner');

  /* Quem pediu menos movimento no sistema não recebe troca automática. */
  const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let tocando = !reduzirMovimento;
  let carrossel = null;

  /* Cria o carrossel do Bootstrap. Quando o usuário pausa, o carrossel é
     recriado com ride: false; assim nem os botões de avançar/voltar nem o
     mouse fazem a troca automática recomeçar sozinha. */
  function criarCarrossel() {
    if (carrossel) {
      carrossel.dispose();
    }
    carrossel = new bootstrap.Carousel(elemento, {
      interval: 6000,                       /* troca a cada 6 segundos */
      ride: tocando ? 'carousel' : false,
      pause: false,                         /* a pausa no mouse é tratada abaixo */
      touch: true
    });
    if (!tocando) {
      carrossel.pause();
    }
  }

  function atualizarBotao() {
    botao.querySelector('.rotulo').textContent = tocando ? 'Pausar' : 'Reproduzir';
    botao.querySelector('.icone').textContent = tocando ? '❚❚' : '▶';
    botao.setAttribute('aria-label', tocando
      ? 'Pausar a troca automática de slides'
      : 'Reproduzir a troca automática de slides');
    /* Com o carrossel parado, o leitor de tela anuncia cada slide novo. */
    areaSlides.setAttribute('aria-live', tocando ? 'off' : 'polite');
  }

  botao.addEventListener('click', function () {
    tocando = !tocando;
    criarCarrossel();
    atualizarBotao();
    anunciar(tocando ? 'Troca automática de slides ligada.' : 'Troca automática de slides pausada.');
  });

  /* Pausa temporária enquanto o mouse está sobre o carrossel ou enquanto o
     foco do teclado está dentro dele, para a pessoa conseguir ler. */
  function pausaTemporaria() {
    if (tocando) {
      carrossel.pause();
    }
  }
  function retomar() {
    if (tocando) {
      carrossel.cycle();
    }
  }
  elemento.addEventListener('mouseenter', pausaTemporaria);
  elemento.addEventListener('mouseleave', retomar);
  elemento.addEventListener('focusin', pausaTemporaria);
  elemento.addEventListener('focusout', function (evento) {
    if (!elemento.contains(evento.relatedTarget)) {
      retomar();
    }
  });

  criarCarrossel();
  atualizarBotao();
}

/* --------------------------------------------------------------------------
   5. Inicialização: roda quando o HTML terminou de carregar
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  iniciarAcessibilidade();

  /* Ano atual no rodapé, sem precisar editar o HTML todo ano. */
  document.querySelectorAll('.ano-atual').forEach(function (elemento) {
    elemento.textContent = new Date().getFullYear();
  });

  /* Funções temporais */
  atualizarStatusLoja();
  setInterval(atualizarStatusLoja, 60000);   /* a cada minuto */

  if (document.getElementById('relogio')) {
    atualizarRelogio();
    setInterval(atualizarRelogio, 1000);     /* a cada segundo */
  }
  if (document.getElementById('contador-promocao')) {
    atualizarContagem();
    setInterval(atualizarContagem, 1000);
  }
  iniciarDicas();
  iniciarCarrossel();
});
