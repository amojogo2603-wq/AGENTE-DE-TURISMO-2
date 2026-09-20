/*
  Akaiá Turismo — prévia conceitual.
  JavaScript puro, sem dependências. Regras seguidas:
  - nenhuma API de HTML dinâmico ou de execução de texto; sem handlers inline;
  - texto dinâmico somente via textContent;
  - nada é lido de hash, query string, armazenamento do navegador ou JSON externo;
  - nenhum dado pessoal é guardado no navegador;
  - links externos só são aplicados depois de validados (hostname, protocolo e caminho fixos).
*/
(function () {
  'use strict';

  // Marca que o JS está ativo (o CSS só esconde o menu mobile quando isto existe).
  document.documentElement.classList.add('js');

  var MSG_SEM_WHATSAPP =
    'O contato por WhatsApp ainda será configurado pela equipe da Akaiá. ' +
    'Nesta prévia, o botão não abre nenhuma conversa.';

  /* ---------- Validação de links da configuração ---------- */

  function validarUrl(valor, hostsPermitidos, padraoCaminho) {
    if (typeof valor !== 'string') { return ''; }
    var texto = valor.trim();
    if (texto === '') { return ''; }
    var u;
    try { u = new URL(texto); } catch (erro) { return ''; }
    if (u.protocol !== 'https:') { return ''; }
    if (u.username !== '' || u.password !== '' || u.port !== '') { return ''; }
    if (hostsPermitidos.indexOf(u.hostname) === -1) { return ''; }
    if (!padraoCaminho.test(u.pathname)) { return ''; }
    return u.href;
  }

  var config = (typeof SITE_CONFIG === 'object' && SITE_CONFIG !== null) ? SITE_CONFIG : {};

  // Aceita exclusivamente https://wa.me/<dígitos> ou https://wa.me/message/<código>
  var linkWhatsApp = validarUrl(
    config.whatsappLink,
    ['wa.me'],
    /^\/(\d{8,15}|message\/[A-Za-z0-9]{6,})\/?$/
  );

  var linkInstagram = validarUrl(
    config.instagramUrl,
    ['www.instagram.com', 'instagram.com'],
    /^\/[A-Za-z0-9._]{1,30}\/?$/
  );

  /* ---------- Aviso local (sem janela nova, sem link quebrado) ---------- */

  var aviso = null;
  var avisoTexto = null;
  var avisoStatus = null;

  function mostrarAviso(texto) {
    if (!aviso || !avisoTexto) { return; }
    avisoTexto.textContent = texto;
    aviso.hidden = false;
    if (avisoStatus) {
      // Limpa e reescreve para que leitores de tela anunciem a mensagem de novo.
      avisoStatus.textContent = '';
      window.setTimeout(function () { avisoStatus.textContent = texto; }, 60);
    }
  }

  function esconderAviso() {
    if (aviso) { aviso.hidden = true; }
  }

  /* ---------- Início ---------- */

  function iniciar() {
    aviso = document.getElementById('aviso-contato');
    avisoTexto = document.getElementById('aviso-contato-texto');
    avisoStatus = document.getElementById('aviso-status');

    /* WhatsApp */
    var botoesWhats = document.querySelectorAll('[data-whatsapp]');
    Array.prototype.forEach.call(botoesWhats, function (el) {
      if (linkWhatsApp) {
        el.setAttribute('href', linkWhatsApp);
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
        var dica = document.createElement('span');
        dica.className = 'so-leitor';
        dica.textContent = ' (abre o WhatsApp em nova aba)';
        el.appendChild(dica);
      } else {
        el.addEventListener('click', function (evento) {
          evento.preventDefault();
          mostrarAviso(MSG_SEM_WHATSAPP);
        });
      }
    });

    /* Instagram: só aparece quando houver URL confirmada e válida */
    var linksInsta = document.querySelectorAll('[data-instagram]');
    Array.prototype.forEach.call(linksInsta, function (el) {
      if (linkInstagram) {
        el.setAttribute('href', linkInstagram);
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
        el.hidden = false;
      }
    });

    var fechar = document.querySelector('[data-fechar-aviso]');
    if (fechar) { fechar.addEventListener('click', esconderAviso); }

    /* Menu mobile */
    var topo = document.querySelector('.topo');
    var botaoMenu = document.querySelector('.menu-toggle');
    var menu = document.getElementById('menu-principal');

    function menuAberto() {
      return !!botaoMenu && botaoMenu.getAttribute('aria-expanded') === 'true';
    }

    function definirMenu(abrir) {
      if (!botaoMenu || !menu) { return; }
      botaoMenu.setAttribute('aria-expanded', abrir ? 'true' : 'false');
      menu.classList.toggle('nav--aberto', abrir);
    }

    if (botaoMenu && menu) {
      botaoMenu.addEventListener('click', function () {
        definirMenu(!menuAberto());
      });

      // Clicar em qualquer link do menu fecha o painel.
      menu.addEventListener('click', function (evento) {
        var alvo = evento.target;
        if (alvo && alvo.closest && alvo.closest('a')) { definirMenu(false); }
      });

      // Clique fora do cabeçalho fecha o painel.
      document.addEventListener('click', function (evento) {
        if (menuAberto() && topo && !topo.contains(evento.target)) { definirMenu(false); }
      });

      // Ao ampliar a janela para desktop, o painel volta ao estado normal.
      if (window.matchMedia) {
        var largura = window.matchMedia('(min-width: 60rem)');
        var aoMudar = function () { if (largura.matches) { definirMenu(false); } };
        if (largura.addEventListener) { largura.addEventListener('change', aoMudar); }
      }
    }

    // Escape: fecha o menu (devolvendo o foco ao botão) e o aviso.
    document.addEventListener('keydown', function (evento) {
      if (evento.key !== 'Escape') { return; }
      if (menuAberto()) {
        definirMenu(false);
        if (botaoMenu) { botaoMenu.focus(); }
      }
      esconderAviso();
    });

    /* Aparição suave ao rolar (respeita prefers-reduced-motion) */
    var itens = document.querySelectorAll('.revela');
    var reduzir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!('IntersectionObserver' in window) || reduzir) {
      Array.prototype.forEach.call(itens, function (el) { el.classList.add('revela--vista'); });
    } else {
      var observador = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
          if (entrada.isIntersecting) {
            entrada.target.classList.add('revela--vista');
            observador.unobserve(entrada.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      Array.prototype.forEach.call(itens, function (el) { observador.observe(el); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
