(function () {
  'use strict';

  var WHATSAPP_NUMBER = '524791527895';
  var currency = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0
  });

  function get(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    var element = get(id);
    if (element) element.textContent = value;
  }

  function numberValue(element, fallback, min, max) {
    var value = Number.parseFloat(element && element.value);
    if (!Number.isFinite(value)) value = fallback;
    if (Number.isFinite(min)) value = Math.max(min, value);
    if (Number.isFinite(max)) value = Math.min(max, value);
    return value;
  }

  function showError(id, message) {
    var element = get(id);
    if (!element) return;
    element.textContent = message;
    element.setAttribute('role', 'alert');
  }

  function formatNumber(value) {
    return new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(value);
  }

  function initLossCalculator() {
    var visits = get('visitas');
    var ticket = get('ticket');
    var conversion = get('conv');
    if (!visits || !ticket || !conversion) return;

    function update() {
      try {
        var monthlyVisits = numberValue(visits, 2000, 0, 1000000);
        var averageTicket = numberValue(ticket, 650, 0, 10000000);
        var currentConversion = numberValue(conversion, 1, 0, 100);
        var improvedConversion = Math.min(100, Math.max(currentConversion * 1.8, 3));
        var currentSales = monthlyVisits * (currentConversion / 100);
        var improvedSales = monthlyVisits * (improvedConversion / 100);
        var currentRevenue = currentSales * averageTicket;
        var improvedRevenue = improvedSales * averageTicket;
        var lostRevenue = Math.max(0, improvedRevenue - currentRevenue);

        setText('visLabel', formatNumber(monthlyVisits));
        setText('tickLabel', currency.format(averageTicket));
        setText('convLabel', currentConversion.toFixed(1) + '%');
        setText('perdida', currency.format(lostRevenue));
        setText('ventasHoy', currency.format(currentRevenue));
        setText('ventasZenith', currency.format(improvedRevenue));
      } catch (error) {
        showError('perdida', 'No pudimos calcularlo. Revisa los valores e inténtalo de nuevo.');
        console.error('Error en la calculadora de pérdidas:', error);
      }
    }

    [visits, ticket, conversion].forEach(function (input) {
      input.addEventListener('input', update);
      input.addEventListener('change', update);
    });
    update();
  }

  function initQuoteCalculator() {
    var output = get('precioOut');
    var summary = get('resumenOut');
    var quoteButton = get('cotizarBtn');
    var servicePrices = {
      landing: ['Landing Page', 4900],
      qr: ['Menú QR', 2900],
      corporativa: ['Página Corporativa', 8900],
      auto: ['Automatización', 3500],
      ai: ['Agente IA', 6900]
    };
    var sizeMultipliers = { basico: 1, estandar: 1.5, premium: 2.2 };
    if (!output || !summary || !quoteButton) return;

    function update() {
      try {
        var selectedService = document.querySelector('input[name="servicio"]:checked');
        var selectedSize = document.querySelector('input[name="tamano"]:checked');
        var service = selectedService && servicePrices[selectedService.value] ? selectedService.value : 'landing';
        var size = selectedSize && sizeMultipliers[selectedSize.value] ? selectedSize.value : 'basico';
        var serviceData = servicePrices[service];
        var total = Math.round(serviceData[1] * sizeMultipliers[size]);
        var extras = Array.prototype.slice.call(document.querySelectorAll('input[name="extra"]:checked'));
        var extraTotal = extras.reduce(function (sum, input) {
          var price = Number.parseFloat(input.getAttribute('data-price'));
          return sum + (Number.isFinite(price) && price >= 0 ? price : 0);
        }, 0);
        total += extraTotal;

        output.textContent = currency.format(total);
        summary.replaceChildren();
        [serviceData[0], 'Tamaño ' + size, extras.length + ' extra' + (extras.length === 1 ? '' : 's')].forEach(function (line) {
          var item = document.createElement('p');
          item.className = 'flex justify-between gap-3';
          item.textContent = line;
          summary.appendChild(item);
        });

        var message = 'Hola Zenith Code, quiero cotizar: ' + serviceData[0] + ', tamaño ' + size + ', total estimado ' + currency.format(total) + '.';
        quoteButton.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
      } catch (error) {
        output.textContent = 'No disponible';
        summary.replaceChildren();
        showError('resumenOut', 'No pudimos calcular el presupuesto. Revisa tu selección.');
        console.error('Error en la calculadora de precios:', error);
      }
    }

    document.querySelectorAll('#servicioGroup input, #tamanoGroup input, #extrasGroup input').forEach(function (input) {
      input.addEventListener('change', update);
    });
    update();
  }

  function initMenu() {
    var menu = get('mobileMenu');
    var open = get('menuBtn');
    var close = get('menuClose');
    if (!menu || !open || !close) return;
    function setOpen(isOpen) {
      menu.classList.toggle('hidden', !isOpen);
      menu.classList.toggle('flex', isOpen);
      open.setAttribute('aria-expanded', String(isOpen));
    }
    open.addEventListener('click', function () { try { setOpen(true); } catch (error) { console.error('Error al abrir el menú:', error); } });
    close.addEventListener('click', function () { try { setOpen(false); } catch (error) { console.error('Error al cerrar el menú:', error); } });
    menu.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', function () { setOpen(false); }); });
  }

  function initCases() {
    var toggle = get('toggleCases');
    if (!toggle) return;
    toggle.addEventListener('click', function () {
      try {
        var hidden = document.querySelectorAll('#extraCase1, #extraCase2, #extraCase3');
        var shouldShow = hidden.length > 0 && hidden[0].classList.contains('hidden');
        hidden.forEach(function (item) { item.classList.toggle('hidden', !shouldShow); });
        setText('toggleCasesText', shouldShow ? 'Ocultar demos' : '+3 demos');
        var icon = get('toggleCasesIcon');
        if (icon) icon.classList.toggle('rotate-180', shouldShow);
      } catch (error) {
        console.error('Error al mostrar los casos:', error);
      }
    });
  }

  function initContactForm() {
    var form = get('contactForm');
    if (!form) return;
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      try {
        var name = (get('contactName').value || '').trim().slice(0, 100);
        var email = (get('contactEmail').value || '').trim().slice(0, 160);
        var type = (get('contactType').value || '').trim().slice(0, 80);
        var message = (get('contactMsg').value || '').trim().slice(0, 1000);
        if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Completa nombre, email válido y mensaje.');
        var text = 'Hola Zenith Code. Nombre: ' + name + '. Email: ' + email + '. Servicio: ' + type + '. Mensaje: ' + message;
        window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
        var success = get('contactSuccess');
        if (success) { success.textContent = 'Mensaje preparado en WhatsApp.'; success.classList.remove('hidden'); }
        form.reset();
      } catch (error) {
        var successMessage = get('contactSuccess');
        if (successMessage) { successMessage.textContent = error.message || 'No pudimos enviar el formulario.'; successMessage.classList.remove('hidden'); }
      }
    });
  }

  function initTerminal() {
    var terminal = get('terminal');
    var input = get('termInput');
    var close = get('termClose');
    if (!terminal || !input || !close) return;
    var logo = get('logoBtn');
    function openTerminal() {
      terminal.classList.remove('hidden');
      terminal.classList.add('flex');
      input.focus();
    }
    if (logo) logo.addEventListener('click', function () { try { openTerminal(); } catch (error) { console.error('Error al abrir la terminal:', error); } });
    close.addEventListener('click', function () { terminal.classList.add('hidden'); });
    input.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter') return;
      try {
        var command = input.value.trim().slice(0, 80).toLowerCase();
        var output = terminal.querySelector('.term-out');
        var response = command === 'help' ? 'Comandos: help, clear, contacto' : command === 'clear' ? '' : command === 'contacto' ? 'Escríbenos por WhatsApp.' : 'Comando no reconocido.';
        if (output) output.textContent = response;
        input.value = '';
      } catch (error) {
        console.error('Error en la terminal:', error);
      }
    });
    document.addEventListener('keydown', function (event) { if (event.key === '~') openTerminal(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') terminal.classList.add('hidden'); });
  }

  function initDiagnostic() {
    var quiz = get('diagQuiz');
    var result = get('diagResult');
    var yes = get('diagBtnSi');
    var no = get('diagBtnNo');
    var reset = get('diagBtnReset');
    if (!quiz || !result || !yes || !no || !reset) return;
    var questions = [
      '¿Tu sitio carga en menos de 3 segundos?',
      '¿Tu sitio se ve bien en celular?',
      '¿Es fácil encontrar tu WhatsApp o teléfono?',
      '¿Tu sitio recibe actualizaciones de contenido?',
      '¿Mides cuántas personas te contactan?',
      '¿Tu página explica por qué elegirte a ti?'
    ];
    var questionIndex = 0;
    var score = 0;

    function renderQuestion() {
      setText('diagQNum', String(questionIndex + 1));
      setText('diagPct', Math.round((questionIndex / questions.length) * 100) + '%');
      setText('diagQuestion', questions[questionIndex]);
      setText('diagSubtext', 'Responde según tu sitio actual.');
      var progress = get('diagProgress');
      if (progress) progress.style.width = Math.round((questionIndex / questions.length) * 100) + '%';
    }

    function complete() {
      var percentage = Math.round((score / questions.length) * 100);
      quiz.classList.add('hidden');
      result.classList.remove('hidden');
      setText('diagPct', '100%');
      setText('diagScoreNum', String(percentage));
      setText('diagResultTitle', percentage >= 67 ? 'Buen punto de partida' : 'Hay oportunidades claras');
      setText('diagResultSub', percentage + '% de salud comercial');
      setText('diagResultDesc', percentage >= 67 ? 'Tu sitio cubre varias bases. Unas mejoras puntuales pueden convertir más visitas en contactos.' : 'Tu sitio está dejando oportunidades sobre la mesa. Estas mejoras pueden recuperar contactos cada mes.');
      var ring = get('diagRingEl');
      if (ring) ring.style.strokeDashoffset = String(138.2 - (138.2 * percentage / 100));
      var issues = get('diagIssuesList');
      if (issues) {
        issues.replaceChildren();
        ['Rendimiento y experiencia móvil', 'Claridad del mensaje principal', 'Medición de contactos y conversiones'].forEach(function (issue) {
          var item = document.createElement('li');
          item.textContent = '• ' + issue;
          issues.appendChild(item);
        });
      }
    }

    function answer(value) {
      try {
        score += value ? 1 : 0;
        questionIndex += 1;
        if (questionIndex >= questions.length) complete(); else renderQuestion();
      } catch (error) {
        console.error('Error en el diagnóstico:', error);
      }
    }
    yes.addEventListener('click', function () { answer(true); });
    no.addEventListener('click', function () { answer(false); });
    reset.addEventListener('click', function () {
      try {
        questionIndex = 0;
        score = 0;
        result.classList.add('hidden');
        quiz.classList.remove('hidden');
        renderQuestion();
      } catch (error) {
        console.error('Error al reiniciar el diagnóstico:', error);
      }
    });
    renderQuestion();
  }

  function initScrollProgress() {
    var bar = get('scrollbar');
    if (!bar) return;
    window.addEventListener('scroll', function () {
      try {
        var height = document.documentElement.scrollHeight - window.innerHeight;
        var progress = height > 0 ? window.scrollY / height : 0;
        bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, progress)) + ')';
      } catch (error) {
        console.error('Error en el progreso de scroll:', error);
      }
    }, { passive: true });
  }

  try {
    initLossCalculator();
    initQuoteCalculator();
    initMenu();
    initCases();
    initContactForm();
    initTerminal();
    initDiagnostic();
    initScrollProgress();
  } catch (error) {
    console.error('Error al inicializar Zenith Code:', error);
  }
}());
