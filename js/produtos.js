/* ==========================================================================
   produtos.js – filtro de categorias, busca e carrinho (página Produtos)
   Patinhas & Cia Pet Shop – João Victor Toledo Duarte

   Cada card de produto no HTML tem os atributos:
   data-categoria, data-id, data-nome e data-preco.
   O carrinho fica salvo no navegador (localStorage), então não se perde
   ao trocar de página.

   Depende de: dados.js (formatarMoeda), main.js (lerLocal, salvarLocal,
   anunciar, mostrarAviso) e Bootstrap 5.
   ========================================================================== */
'use strict';

document.addEventListener('DOMContentLoaded', function () {
  const cards = Array.from(document.querySelectorAll('[data-categoria]'));
  const botoesFiltro = document.querySelectorAll('[data-filtro]');
  const campoBusca = document.getElementById('busca-produto');
  const contagem = document.getElementById('contagem-produtos');
  const semResultado = document.getElementById('sem-resultado');

  let categoriaAtual = 'todos';

  /* ------------------------------------------------------------------------
     Filtro + busca
     ------------------------------------------------------------------------ */

  /* Remove acentos e deixa em minúsculas, para "racao" encontrar "Ração". */
  function normalizar(texto) {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  function aplicarFiltros() {
    /* Cada palavra digitada precisa aparecer no card, em qualquer ordem:
       "racao gato" encontra "Ração seca para gatos castrados". */
    const palavras = normalizar(campoBusca.value.trim()).split(/\s+/).filter(Boolean);
    let visiveis = 0;

    cards.forEach(function (card) {
      const categoriaOk = categoriaAtual === 'todos' || card.dataset.categoria === categoriaAtual;
      const textoCard = normalizar(card.textContent);
      const textoOk = palavras.every(function (palavra) { return textoCard.includes(palavra); });
      const mostrar = categoriaOk && textoOk;
      /* A coluna inteira do grid é escondida, não só o card. */
      card.closest('.col').hidden = !mostrar;
      if (mostrar) {
        visiveis++;
      }
    });

    /* Esconde o título de uma categoria quando ela fica sem produtos. */
    document.querySelectorAll('.secao-categoria').forEach(function (secao) {
      const temVisivel = secao.querySelector('.col:not([hidden])') !== null;
      secao.hidden = !temVisivel;
    });

    const frase = visiveis === 1 ? '1 produto encontrado' : visiveis + ' produtos encontrados';
    contagem.textContent = frase;   /* região aria-live: leitor de tela anuncia */
    semResultado.hidden = visiveis !== 0;
  }

  botoesFiltro.forEach(function (botao) {
    botao.addEventListener('click', function () {
      categoriaAtual = botao.dataset.filtro;
      /* aria-pressed informa ao leitor de tela qual filtro está ativo. */
      botoesFiltro.forEach(function (outro) {
        const ativo = outro === botao;
        outro.classList.toggle('active', ativo);
        outro.setAttribute('aria-pressed', String(ativo));
      });
      aplicarFiltros();
    });
  });

  campoBusca.addEventListener('input', aplicarFiltros);

  /* ------------------------------------------------------------------------
     Carrinho de compras
     ------------------------------------------------------------------------ */
  const CHAVE_CARRINHO = 'carrinhoPatinhas';
  let carrinho = lerLocal(CHAVE_CARRINHO, []);

  const listaCarrinho = document.getElementById('lista-carrinho');
  const totalCarrinho = document.getElementById('total-carrinho');
  const contadorCarrinho = document.getElementById('contador-carrinho');
  const carrinhoVazio = document.getElementById('carrinho-vazio');
  const botaoFinalizar = document.getElementById('btn-finalizar-pedido');

  function salvarCarrinho() {
    salvarLocal(CHAVE_CARRINHO, carrinho);
  }

  /* Redesenha a lista do carrinho e atualiza total e contador. */
  function desenharCarrinho() {
    listaCarrinho.innerHTML = '';
    let total = 0;
    let quantidadeTotal = 0;

    carrinho.forEach(function (item) {
      total += item.preco * item.quantidade;
      quantidadeTotal += item.quantidade;

      const linha = document.createElement('li');
      linha.className = 'list-group-item d-flex justify-content-between align-items-center gap-2';
      linha.innerHTML =
        '<div><span class="fw-semibold d-block nome-item"></span>' +
        '<span class="small text-body-secondary preco-item"></span></div>' +
        '<div class="btn-group btn-group-sm" role="group">' +
        '  <button type="button" class="btn btn-outline-secondary" data-acao="menos">−</button>' +
        '  <span class="btn btn-outline-secondary disabled quantidade-item" aria-hidden="true"></span>' +
        '  <button type="button" class="btn btn-outline-secondary" data-acao="mais">+</button>' +
        '  <button type="button" class="btn btn-outline-danger" data-acao="remover">Remover</button>' +
        '</div>';
      linha.querySelector('.nome-item').textContent = item.nome;
      linha.querySelector('.preco-item').textContent =
        item.quantidade + ' × ' + formatarMoeda(item.preco);
      linha.querySelector('.quantidade-item').textContent = item.quantidade;
      /* Rótulos completos para quem usa leitor de tela. */
      linha.querySelector('[data-acao="menos"]').setAttribute('aria-label', 'Diminuir quantidade de ' + item.nome);
      linha.querySelector('[data-acao="mais"]').setAttribute('aria-label', 'Aumentar quantidade de ' + item.nome);
      linha.querySelector('[data-acao="remover"]').setAttribute('aria-label', 'Remover ' + item.nome + ' do carrinho');
      linha.dataset.id = item.id;
      listaCarrinho.appendChild(linha);
    });

    totalCarrinho.textContent = formatarMoeda(total);
    contadorCarrinho.textContent = quantidadeTotal;
    carrinhoVazio.hidden = carrinho.length > 0;
    botaoFinalizar.disabled = carrinho.length === 0;
  }

  /* Botões "Adicionar ao carrinho" dos cards. */
  document.querySelectorAll('.btn-adicionar').forEach(function (botao) {
    botao.addEventListener('click', function () {
      const card = botao.closest('[data-id]');
      const id = card.dataset.id;
      const existente = carrinho.find(function (item) { return item.id === id; });
      if (existente) {
        existente.quantidade++;
      } else {
        carrinho.push({
          id: id,
          nome: card.dataset.nome,
          preco: Number(card.dataset.preco),
          quantidade: 1
        });
      }
      salvarCarrinho();
      desenharCarrinho();
      mostrarAviso(card.dataset.nome + ' adicionado ao carrinho.', 'sucesso');
    });
  });

  /* Botões dentro do carrinho (+, − e remover): um único "ouvinte" na lista
     trata todos eles (delegação de eventos). */
  listaCarrinho.addEventListener('click', function (evento) {
    const botao = evento.target.closest('[data-acao]');
    if (!botao) {
      return;
    }
    const id = botao.closest('li').dataset.id;
    const item = carrinho.find(function (produto) { return produto.id === id; });
    const acao = botao.dataset.acao;

    if (acao === 'mais') {
      item.quantidade++;
    } else if (acao === 'menos') {
      item.quantidade--;
    }
    if (acao === 'remover' || item.quantidade <= 0) {
      carrinho = carrinho.filter(function (produto) { return produto.id !== id; });
      anunciar(item.nome + ' removido do carrinho.');
    } else {
      anunciar(item.nome + ': quantidade ' + item.quantidade + '.');
    }
    salvarCarrinho();
    desenharCarrinho();
    /* Mantém o foco num lugar útil depois de redesenhar a lista. */
    const mesmaLinha = listaCarrinho.querySelector('[data-id="' + id + '"] [data-acao="' + acao + '"]');
    (mesmaLinha || document.getElementById('titulo-carrinho')).focus();
  });

  /* Finalizar pedido (simulação: não há pagamento nesta versão). */
  botaoFinalizar.addEventListener('click', function () {
    const total = totalCarrinho.textContent;
    carrinho = [];
    salvarCarrinho();
    desenharCarrinho();
    const painel = bootstrap.Offcanvas.getInstance(document.getElementById('painel-carrinho'));
    if (painel) {
      painel.hide();
    }
    mostrarAviso('Pedido de ' + total + ' registrado! Entraremos em contato pelo WhatsApp para combinar pagamento e retirada.', 'sucesso');
  });

  desenharCarrinho();
  aplicarFiltros();
});
