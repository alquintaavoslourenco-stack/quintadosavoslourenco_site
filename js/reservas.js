/* /js/reservas.js — Simulador (sem formulário) + envio AJAX (Formspree)
   Regras: 137€/noite (1–2 pessoas); +35€/pessoa/noite acima de 2;
           mínimo 2 noites; máximo 30 noites; capacidade até 7 pessoas.
   Compatível com CSP (sem inline JS). Tudo corre após DOMContentLoaded.
*/

(function () {
  'use strict';

  // ===== Config =====
  const FORM_ENDPOINT = 'https://formspree.io/f/xanllrjv';
  const PRICES = Object.freeze({
    baseNightly: 137,
    extraPerPersonPerNight: 35,
    minNights: 2,
    maxNights: 30,
    maxPeople: 7,
  });

  // ===== Utils =====
  const $ = (s, c = document) => c.querySelector(s);
  const fmtEUR = (n) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  const toISO = (d) => d.toISOString().slice(0, 10);
  const parseISO = (s) => (s ? new Date(s + 'T00:00:00') : null);
  const diffNights = (ci, co) => {
    if (!ci || !co) return 0;
    const start = new Date(ci);
    const end = new Date(co);
    if (isNaN(start) || isNaN(end)) return 0;
    const ms = end.setHours(12, 0, 0, 0) - start.setHours(12, 0, 0, 0);
    return Math.max(0, Math.round(ms / 86400000));
  };

  const computeQuote = (ci, co, adultos, criancas) => {
    const nights = diffNights(ci, co);
    const a = parseInt(adultos, 10) || 0;
    const c = parseInt(criancas, 10) || 0;
    const partyTotal = a + c;
    const extraPeople = Math.max(0, partyTotal - 2);
    const nightlyExtras = extraPeople * PRICES.extraPerPersonPerNight;
    const nightlyTotal = PRICES.baseNightly + nightlyExtras; // <- preço / noite TOTAL (inclui extras)
    const total = nights * nightlyTotal;

    let valid = true; let message = '';
    if (nights === 0) { valid = false; message = 'Selecione datas válidas.'; }
    if (nights > 0 && nights < PRICES.minNights) { valid = false; message = 'Estadia mínima: 2 noites.'; }
    if (nights > PRICES.maxNights) { valid = false; message = 'Estadia máxima: 30 noites.'; }
    if (partyTotal > PRICES.maxPeople) { valid = false; message = 'Capacidade máxima: 7 pessoas.'; }

    return { nights, partyTotal, extraPeople, nightlyBase: PRICES.baseNightly, nightlyExtras, nightlyTotal, total, valid, message };
  };

  // ===== App =====
  document.addEventListener('DOMContentLoaded', () => {
    const els = {
      checkin:  $('#checkin'),
      checkout: $('#checkout'),
      adultos:  $('#adultos'),
      criancas: $('#criancas'),

      // novos campos de contacto
      nome:     $('#nome'),
      email:    $('#email'),
      telefone: $('#telefone'),
      aloj:     $('#alojamento'),

      // KPI — usar k-nightly (TOTAL / noite)
      kNoites:  $('#k-noites'),
      kNightly: $('#k-nightly'),
      kGrupo:   $('#k-grupo'),

      // breakdown
      bkNoites: $('#bk-noites'),
      bkBase:   $('#bk-base'),
      bkExtra:  $('#bk-extra'),
      bkTotal:  $('#bk-total'),
      msg:      $('#sim-msg'),

      // consentimentos + submit
      consentTerms:   $('#consent-terms'),
      consentPrivacy: $('#consent-privacy'),
      reservarBtn:    $('#sim-reservar'),
    };

    if (!els.checkin || !els.checkout || !els.reservarBtn) { console.warn('Simulador incompleto no DOM.'); return; }

    (function initDates(){
      const today = new Date(); today.setHours(0,0,0,0);
      const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
      if(!els.checkin.value) els.checkin.value = toISO(today);
      if(!els.checkout.value) els.checkout.value = toISO(tomorrow);
      els.checkin.min = toISO(today);
      els.checkout.min = toISO(tomorrow);
    })();

    const render = () => {
      const q = computeQuote(els.checkin.value, els.checkout.value, els.adultos?.value, els.criancas?.value);

      if (els.kNoites)  els.kNoites.textContent  = q.nights;
      if (els.kNightly) els.kNightly.textContent = fmtEUR(q.nightlyTotal);
      if (els.kGrupo)   els.kGrupo.textContent   = q.partyTotal;

      if (els.bkNoites) els.bkNoites.textContent = q.nights;
      if (els.bkBase)   els.bkBase.textContent   = `${fmtEUR(q.nightlyBase)} / noite`;
      if (els.bkExtra)  els.bkExtra.textContent  = q.extraPeople > 0 ? `+ ${fmtEUR(q.nightlyExtras)} / noite` : '0 €';
      if (els.bkTotal)  els.bkTotal.textContent  = q.valid ? fmtEUR(q.total) : '—';

      if (els.msg) { els.msg.textContent = q.valid ? '' : q.message; els.msg.hidden = !!q.valid; }

      const consentsOk = (!!els.consentTerms?.checked) && (!!els.consentPrivacy?.checked);
      els.reservarBtn.disabled = !(q.valid && consentsOk);
      return q;
    };

    [els.checkin, els.checkout, els.adultos, els.criancas, els.consentTerms, els.consentPrivacy]
      .filter(Boolean).forEach(el => { el.addEventListener('input', render); el.addEventListener('change', render); });

    render();

    const setLoading = (loading) => {
      els.reservarBtn.classList.toggle('is-loading', loading);
      els.reservarBtn.disabled = loading ? true : els.reservarBtn.disabled;
      if (loading) { els.reservarBtn.dataset.prev = els.reservarBtn.textContent; els.reservarBtn.textContent = 'A enviar…'; }
    };
    const showSuccess = (ms = 4000) => {
      els.reservarBtn.classList.remove('is-loading');
      els.reservarBtn.classList.add('is-success');
      els.reservarBtn.disabled = false;
      els.reservarBtn.textContent = '✅ Pedido enviado com sucesso';
      clearTimeout(showSuccess._t);
      showSuccess._t = setTimeout(() => { els.reservarBtn.classList.remove('is-success'); els.reservarBtn.textContent = 'Reservar agora'; render(); }, ms);
    };
    const showError = (msg) => {
      if (els.msg) { els.msg.textContent = msg || 'Erro ao enviar. Tente novamente.'; els.msg.hidden = false; }
      els.reservarBtn.classList.remove('is-loading');
      els.reservarBtn.classList.add('is-error');
      els.reservarBtn.textContent = 'Reservar agora';
      setTimeout(() => els.reservarBtn.classList.remove('is-error'), 1200);
    };

    els.reservarBtn.addEventListener('click', async () => {
      const q = render();
      if (!els.consentTerms?.checked || !els.consentPrivacy?.checked) return showError('Tem de aceitar os Termos e a Política de Privacidade.');
      if (!q.valid) return showError(q.message || 'Verifique os dados da simulação.');

      // Validações leves
      if (els.nome && /[0-9]/.test(els.nome.value)) return showError('O nome não deve conter números.');
      if (els.telefone && /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(els.telefone.value)) return showError('O telefone deve conter apenas números e símbolos + ( ) - .');
      if (els.email && els.email.value && !els.email.value.includes('@')) return showError('Insira um email válido.');

      try {
        setLoading(true);
        const data = new FormData();
        data.append('checkin',  els.checkin.value);
        data.append('checkout', els.checkout.value);
        data.append('adultos',  els.adultos?.value || '0');
        data.append('criancas', els.criancas?.value || '0');
        data.append('noites',   String(q.nights));
        data.append('preco_noite', fmtEUR(q.nightlyTotal));
        data.append('total',    fmtEUR(q.total));
        data.append('detalhe',  `Base: ${fmtEUR(q.nightlyBase)}/noite; Pessoas: ${q.partyTotal}; Extra: ${q.extraPeople} (+${fmtEUR(q.nightlyExtras)}/noite)`);
        if (els.nome?.value)     data.append('nome', els.nome.value);
        if (els.email?.value)    data.append('email', els.email.value);
        if (els.telefone?.value) data.append('telefone', els.telefone.value);
        if (els.aloj?.value)     data.append('alojamento', els.aloj.value);
        data.append('_subject', 'Novo pedido de reserva — Simulador');
        data.append('_page',    '/reservas');

        const resp = await fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
        if (resp.ok) {
          const today = new Date(); today.setHours(0,0,0,0);
          const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
          if (els.checkin)  els.checkin.value  = toISO(today);
          if (els.checkout) els.checkout.value = toISO(tomorrow);
          if (els.adultos)  els.adultos.value  = '2';
          if (els.criancas) els.criancas.value = '0';
          if (els.nome)     els.nome.value = '';
          if (els.email)    els.email.value = '';
          if (els.telefone) els.telefone.value = '';
          if (els.consentTerms)   els.consentTerms.checked = false;
          if (els.consentPrivacy) els.consentPrivacy.checked = false;
          render();
          showSuccess(4000);
        } else {
          let msg = 'Erro ao enviar. Tente novamente.';
          try { const j = await resp.json(); if (j && Array.isArray(j.errors) && j.errors.length) { msg = j.errors.map(e => e.message || 'Erro de validação.').join(' '); } } catch(_) {}
          throw new Error(msg);
        }
      } catch (ex) {
        showError(ex.message);
      } finally {
        setLoading(false);
      }
    });

    // Testes rápidos
    try {
      console.assert(diffNights('2025-01-01','2025-01-03') === 2, 'diffNights 2 noites');
      const q1 = computeQuote('2025-01-01','2025-01-03',2,0);
      console.assert(q1.total === 2*PRICES.baseNightly, 'Total base 2 noites/2 pessoas');
      const q2 = computeQuote('2025-01-01','2025-01-03',4,0);
      console.assert(q2.nightlyExtras === 2*PRICES.extraPerPersonPerNight && q2.nightlyTotal === PRICES.baseNightly + 2*PRICES.extraPerPersonPerNight, 'Extras por noite');
      const q3 = computeQuote('2025-01-01','2025-01-05',6,2); console.assert(q3.valid === false && q3.partyTotal===8, 'Capacidade máxima 7');
      const q4 = computeQuote('2025-01-01','2025-01-02',2,0); console.assert(q4.valid === false && q4.nights===1, 'Mínimo 2 noites');
      const q5 = computeQuote('2025-01-01','2025-02-05',2,0); console.assert(q5.valid === false, 'Máximo 30 noites');
    } catch(e) { console.warn('Tests falharam:', e.message); }
  });
})();
