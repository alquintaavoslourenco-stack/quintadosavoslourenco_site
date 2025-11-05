/* /js/reservas.js — Simulador + spinners + envio Formspree
   Regras: 137€/noite (1–2 pessoas) +35€/pessoa/noite >2; 2–30 noites; máx. 7 pessoas.
*/
(function () {
  'use strict';

  const FORM_ENDPOINT = 'https://formspree.io/f/xanllrjv';
  const PRICES = Object.freeze({
    baseNightly: 137,
    extraPerPersonPerNight: 35,
    minNights: 2,
    maxNights: 30,
    maxPeople: 7,
  });

  const $ = (s, c=document) => c.querySelector(s);
  const fmtEUR = (n) => new Intl.NumberFormat('pt-PT', {style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
  const toISO = (d) => d.toISOString().slice(0,10);
  const parseISO = (s) => (s ? new Date(s+'T00:00:00') : null);
  const diffNights = (ci, co) => {
    if (!ci || !co) return 0;
    const a = new Date(ci), b = new Date(co);
    if (isNaN(a) || isNaN(b)) return 0;
    return Math.max(0, Math.round((b.setHours(12,0,0,0)-a.setHours(12,0,0,0))/86400000));
  };

  const computeQuote = (ci, co, adults, children) => {
    const nights = diffNights(ci, co);
    const a = parseInt(adults,10)||0;
    const c = parseInt(children,10)||0;
    const partyTotal = a + c;
    const extraPeople = Math.max(0, partyTotal - 2);
    const nightlyExtras = extraPeople * PRICES.extraPerPersonPerNight;
    const nightlyTotal  = PRICES.baseNightly + nightlyExtras;
    const total = nights * nightlyTotal;

    let valid = true, message = '';
    if (nights === 0) { valid=false; message='Selecione datas válidas.'; }
    if (nights>0 && nights<PRICES.minNights) { valid=false; message='Estadia mínima: 2 noites.'; }
    if (nights>PRICES.maxNights) { valid=false; message='Estadia máxima: 30 noites.'; }
    if (partyTotal>PRICES.maxPeople) { valid=false; message='Capacidade máxima: 7 pessoas.'; }

    return { nights, partyTotal, extraPeople, nightlyBase:PRICES.baseNightly, nightlyExtras, nightlyTotal, total, valid, message };
  };

  document.addEventListener('DOMContentLoaded', () => {
    const els = {
      checkin:  $('#checkin'),
      checkout: $('#checkout'),
      adultos:  $('#adultos'),
      criancas: $('#criancas'),
      nome:     $('#nome'),
      email:    $('#email'),
      telefone: $('#telefone'),
      aloj:     $('#alojamento'),
      kNoites:  $('#k-noites'),
      kNightly: $('#k-nightly'),
      kGrupo:   $('#k-grupo'),
      bkNoites: $('#bk-noites'),
      bkBase:   $('#bk-base'),
      bkExtra:  $('#bk-extra'),
      bkTotal:  $('#bk-total'),
      msg:      $('#sim-msg'),
      consentTerms:   $('#consent-terms'),
      consentPrivacy: $('#consent-privacy'),
      reservarBtn:    $('#sim-reservar'),
    };
    if (!els.checkin || !els.checkout || !els.reservarBtn) return;

    // Datas padrão (hoje -> amanhã) + limites
    (function initDates(){
      const today = new Date(); today.setHours(0,0,0,0);
      const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
      if(!els.checkin.value) els.checkin.value = toISO(today);
      if(!els.checkout.value) els.checkout.value = toISO(tomorrow);
      els.checkin.min = toISO(today);
      els.checkout.min = toISO(tomorrow);
    })();

    // Dinâmica de capacidade: adultos + crianças <= 7
    function applyCapacityRules() {
      const a = Math.max(1, Math.min(7, parseInt(els.adultos.value||'2',10)));
      const maxKids = Math.max(0, PRICES.maxPeople - a);
      els.adultos.value = String(a);
      els.criancas.max = String(maxKids);
      if (parseInt(els.criancas.value||'0',10) > maxKids) els.criancas.value = String(maxKids);
      // Se adultos == 7, bloquear crianças
      els.criancas.disabled = (a >= 7);
      // Acessibilidade: mostrar que está bloqueado
      els.criancas.title = (a >= 7) ? 'Capacidade máxima atingida (7 pessoas)' : '';
    }

    const render = () => {
      applyCapacityRules();
      const q = computeQuote(els.checkin.value, els.checkout.value, els.adultos.value, els.criancas.value);

      if (els.kNoites)  els.kNoites.textContent  = q.nights;
      if (els.kNightly) els.kNightly.textContent = fmtEUR(q.nightlyTotal);
      if (els.kGrupo)   els.kGrupo.textContent   = q.partyTotal;

      if (els.bkNoites) els.bkNoites.textContent = q.nights;
      if (els.bkBase)   els.bkBase.textContent   = `${fmtEUR(q.nightlyBase)} / noite`;
      if (els.bkExtra)  els.bkExtra.textContent  = q.extraPeople>0 ? `+ ${fmtEUR(q.nightlyExtras)} / noite` : '0 €';
      if (els.bkTotal)  els.bkTotal.textContent  = q.valid ? fmtEUR(q.total) : '—';

      if (els.msg) { els.msg.textContent = q.valid ? '' : q.message; els.msg.hidden = !!q.valid; }

      const consentsOk = (!!els.consentTerms?.checked) && (!!els.consentPrivacy?.checked);
      els.reservarBtn.disabled = !(q.valid && consentsOk);
      return q;
    };

    // Spinners ↑↓ para adultos/crianças
    document.querySelectorAll('.spinner button').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.target);
        if (!input) return;
        const step = btn.classList.contains('spin-up') ? 1 : -1;
        const min = parseInt(input.min || '0', 10);
        const max = parseInt(input.max || '99', 10);
        let val = parseInt(input.value || min, 10) + step;
        if (val < min) val = min;
        if (val > max) val = max;
        input.value = String(val);
        render();
      });
    });

    // Listeners principais
    [els.checkin, els.checkout, els.adultos, els.criancas, els.consentTerms, els.consentPrivacy]
      .filter(Boolean)
      .forEach(el => { el.addEventListener('input', render); el.addEventListener('change', render); });

    render();

    // UI helpers (botão)
    const setLoading = (loading) => {
      els.reservarBtn.classList.toggle('is-loading', loading);
      els.reservarBtn.disabled = loading ? true : els.reservarBtn.disabled;
      if (loading) { els.reservarBtn.dataset.prev = els.reservarBtn.textContent; els.reservarBtn.textContent = 'A enviar…'; }
    };
    const showSuccess = (ms=4000) => {
      els.reservarBtn.classList.remove('is-loading');
      els.reservarBtn.classList.add('is-success');
      els.reservarBtn.disabled = false;
      els.reservarBtn.textContent = '✅ Pedido enviado com sucesso';
      clearTimeout(showSuccess._t);
      showSuccess._t = setTimeout(()=>{ els.reservarBtn.classList.remove('is-success'); els.reservarBtn.textContent='Reservar agora'; render(); }, ms);
    };
    const showError = (msg) => {
      if (els.msg) { els.msg.textContent = msg || 'Erro ao enviar. Tente novamente.'; els.msg.hidden = false; }
      els.reservarBtn.classList.remove('is-loading');
      els.reservarBtn.classList.add('is-error');
      els.reservarBtn.textContent = 'Reservar agora';
      setTimeout(()=> els.reservarBtn.classList.remove('is-error'), 1200);
    };

    // Envio para Formspree
    els.reservarBtn.addEventListener('click', async () => {
      const q = render();
      if (!els.consentTerms?.checked || !els.consentPrivacy?.checked) return showError('Tem de aceitar os Termos e a Política de Privacidade.');
      if (!q.valid) return showError(q.message || 'Verifique os dados da simulação.');

      // validações leves dos contactos
      if (els.nome && /[0-9]/.test(els.nome.value)) return showError('O nome não deve conter números.');
      if (els.telefone && /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(els.telefone.value)) return showError('O telefone deve conter apenas números e símbolos + ( ) - .');
      if (els.email && els.email.value && !els.email.value.includes('@')) return showError('Insira um email válido.');

      try {
        setLoading(true);
        const data = new FormData();
        data.append('checkin',  els.checkin.value);
        data.append('checkout', els.checkout.value);
        data.append('adultos',  els.adultos.value);
        data.append('criancas', els.criancas.value);
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

        const resp = await fetch(FORM_ENDPOINT, { method:'POST', body:data, headers:{'Accept':'application/json'} });
        if (resp.ok) {
          const today = new Date(); today.setHours(0,0,0,0);
          const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
          els.checkin.value  = toISO(today);
          els.checkout.value = toISO(tomorrow);
          els.adultos.value  = '2';
          els.criancas.value = '0';
          if (els.nome) els.nome.value=''; if (els.email) els.email.value=''; if (els.telefone) els.telefone.value='';
          if (els.consentTerms) els.consentTerms.checked=false; if (els.consentPrivacy) els.consentPrivacy.checked=false;
          render();
          showSuccess(4000);
        } else {
          let msg = 'Erro ao enviar. Tente novamente.';
          try { const j = await resp.json(); if (j && Array.isArray(j.errors) && j.errors.length) msg = j.errors.map(e=>e.message||'Erro de validação.').join(' '); } catch(_){}
          throw new Error(msg);
        }
      } catch (ex) {
        showError(ex.message);
      } finally {
        setLoading(false);
      }
    });

    // Testes rápidos (console)
    try {
      console.assert(diffNights('2025-01-01','2025-01-03')===2,'diffNights 2 noites');
      const q1 = computeQuote('2025-01-01','2025-01-03',2,0);
      console.assert(q1.total===2*PRICES.baseNightly,'Total base 2 noites/2 pessoas');
      const q2 = computeQuote('2025-01-01','2025-01-03',4,0);
      console.assert(q2.nightlyTotal===PRICES.baseNightly+2*PRICES.extraPerPersonPerNight,'Noite com extras');
      const q3 = computeQuote('2025-01-01','2025-01-05',6,2);
      console.assert(q3.valid===false && q3.partyTotal===8,'Capacidade 7');
    } catch(e){ console.warn('Tests falharam:', e.message); }
  });
})();
