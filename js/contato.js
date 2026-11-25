/* ==========================================================================
   contato.js – validação do formulário "Fale conosco" (página Sobre)
   Patinhas & Cia Pet Shop – João Victor Toledo Duarte

   Nesta versão a mensagem não é enviada a um servidor: o site confere os
   campos, mostra uma confirmação e limpa o formulário.

   Depende de: main.js (mostrarAviso) e Bootstrap 5.
   ========================================================================== */
'use strict';

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form-contato');
  if (!form) {
    return;
  }
  const mensagem = form.elements.mensagem;
  const contador = document.getElementById('contador-mensagem');

  /* Contador de caracteres da mensagem. */
  mensagem.addEventListener('input', function () {
    contador.textContent = (mensagem.maxLength - mensagem.value.length) + ' caracteres restantes';
  });

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();
    form.classList.add('was-validated');

    if (!form.checkValidity()) {
      /* Leva o foco ao primeiro campo com problema. */
      form.querySelector(':invalid').focus();
      mostrarAviso('Confira os campos destacados em vermelho.', 'erro');
      return;
    }

    const nome = form.elements.nome.value.trim().split(' ')[0];
    mostrarAviso('Obrigado, ' + nome + '! Recebemos sua mensagem e responderemos em até 1 dia útil.', 'sucesso');
    form.reset();
    form.classList.remove('was-validated');
    contador.textContent = mensagem.maxLength + ' caracteres restantes';
  });
});
