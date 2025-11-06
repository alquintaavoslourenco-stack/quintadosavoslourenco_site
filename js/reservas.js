/* /js/reservas.js — Simulador de preços + validação + envio Formspree (versão final) */
(function () {
  'use strict';

  const FORM_ENDPOINT = 'https://formspree.io/f/xanllrjv';
  const PRICES = Object.freeze({
    baseNightly: 137,
    extraPerAdultPerNight: 35,
    minNights: 2,
    maxNights: 30,
    maxPeople: 7,
  });

  const $ = (s, c=document) => c.querySelector(s);
  const fmtEUR = (n) => new Intl.NumberFormat('pt-PT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
  const toISO = (d) => d.toISOString().slice(0,10);

  const diffNights = (ci, co) => {
    if (!ci || !co) return 0;
    const a = new Date(ci), b = new Date(co);
    if (isNaN(a) || isNaN(b)) return 0;
    // fixa ao meio-dia para evitar DST
    return Math.max(0, Math.round((b.setHours(12,0,0,0)-a.setHours(12,0,0,0))/86400000));
  };

  // Validadores
  const isNameValid  = (v) => /^[A-Za-zÀ-ÖØ-öø-ÿ ]+$/.test((v||'').trim());
  const isPhoneValid = (v) => /^(\+)?\d+$/.test((v||'').trim()); // dígitos e + opcional
  const isEmailValid = (v) => typeof v === 'string' && v.includes('@');

  // Cria <small> hint por baixo do input se não existir
  function ensureHintBelowInput(input, id) {
    if (!input) return null;
    const wrap = input.closest('div') || input.parentElement;
    let hint = wrap.querySelector(`#${id}`);
    if (!hint) {
      hint = document.createElement('small');
      hint.id = id;
      hint.className = 'field-hint';
      hint.hidden = true;
      wrap.appendChild(hint);
    }
    return hint;
  }

  // Estilos de erro inline (sem depender do CSS global)
  function applyFieldErrorStyles(input, label) {
    if (!input) return;
    input.classList.add('field-error');
    input.style.borderColor = 'var(--brand, #8B0000)';
    input.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--brand 20%), transparent)';
    input.setAttribute('aria-invalid','true');
    if (label) { label.classList.add('label-error'); label.style.color = 'var(--brand, #8B0000)'; }
  }
  function clearFieldErrorStyles(input, label, hint) {
    if (!input) return;
    input.classList.remove('field-error');
    input.style.borderColor = '';
    input.style.boxShadow = '';
    input.removeAttribute('aria-invalid');
    if (label) { label.classList.remove('label-error'); label.style.color = ''; }
    if (hint) { hint.textContent=''; hint.hidden = true; }
  }

  // Cálculo do orçamento
  const computeQuote = (ci, co, adults, kids04) => {
    const nights = diffNights(ci, co);
    const a = Math.max(1, parseInt(adults,10) || 1);
    const k = Math.max(0, parseInt(kids04,10) || 0);
    const partyTotal = a + k;

    const adultsAboveTwo = Math.max(0, a - 2);
    const nightlyExtras = adultsAboveTwo * PRICES.extraPerAdultPerNight;
    const nightlyTotal  = PRICES.baseNightly + nightlyExtras;
    const total         = nights * nightlyTotal;

    let valid = true, message = '';
    if (nights === 0) valid=false, message='Selecione datas válidas.';
    else if (nights < PRICES.minNights) valid=false, message='Estadia mínima: 2 noites.';
    else if (nights > PRICES.maxNights) valid=false, message='Estadia máxima: 30 noites.';
    if (partyTotal > PRICES.maxPeople) valid=false, message='Capacidade máxima: 7 pessoas.';

    return { nights, a, k, partyTotal, adultsAboveTwo, nightlyTotal, nightlyExtras, total, valid, message };
  };

  document.addEventListener('DOMContentLoaded', () => {
    const els = {
      checkin:  $('#checkin'),     checkout: $('#checkout'),
      adultos:  $('#adultos'),     criancas: $('#criancas'),
      nome:     $('#nome'),        email:    $('#email'),
      telefone: $('#telefone'),    aloj:     $('#alojamento'),
      kNoites:  $('#k-noites'),    kNightly: $('#k-nightly'),
      kGrupo:   $('#k-grupo'),     bkNoites: $('#bk-noites'),
      bkBase:   $('#bk-base'),     bkExtra:  $('#bk-extra'),
      bkTotal:  $('#bk-total'),    msg:      $('#sim-msg'),
      consentTerms: $('#consent-terms'),
      consentPrivacy: $('#consent-privacy'),
      reservarBtn: $('#sim-reservar'),
    };
    if (!els.checkin || !els.checkout || !els.reservarBtn) return;

    // Labels (para colorir no erro)
    const labels = {
      checkin:  els.checkin.closest('div')?.querySelector('label'),
      checkout: els.checkout.closest('div')?.querySelector('label'),
      adultos:  els.adultos.closest('div')?.querySelector('label'),
      criancas: els.criancas.closest('div')?.querySelector('label'),
      nome:     els.nome.closest('div')?.querySelector('label'),
      email:    els.email.closest('div')?.querySelector('label'),
      telefone: els.telefone.closest('div')?.querySelector('label'),
    };

    // Hints (criamos se não existirem no HTML)
    const hints = {
      checkin:  ensureHintBelowInput(els.checkin,  'err-checkin'),
      checkout: ensureHintBelowInput(els.checkout, 'err-checkout'),
      nome:     ensureHintBelowInput(els.nome,     'err-nome'),
      email:    ensureHintBelowInput(els.email,    'err-email'),
      telefone: ensureHintBelowInput(els.telefone, 'err-telefone'),
    };

    // Erro consents (cria se não existir)
    let errConsents = $('#err-consents');
    if (!errConsents) {
      const actions = els.reservarBtn.closest('.sim-actions');
      errConsents = document.createElement('small');
      errConsents.id = 'err-consents';
      errConsents.className = 'field-hint';
      errConsents.hidden = true;
      actions.insertBefore(errConsents, els.reservarBtn);
    }
    const consentLabels = {
      terms: els.consentTerms?.closest('label'),
      privacy: els.consentPrivacy?.closest('label'),
    };

    // Datas padrão + limites
    (function initDates(){
      const today = new Date(); today.setHours(0,0,0,0);
      const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
      if (!els.checkin.value)  els.checkin.value  = toISO(today);
      if (!els.checkout.value) els.checkout.value = toISO(tomorrow);
      els.checkin.min  = toISO(today);
      els.checkout.min = toISO(tomorrow);
    })();

    // Capacidade total 7
    function applyCapacityRules() {
      let a = parseInt(els.adultos.value||'2',10); if (Number.isNaN(a)) a = 2;
      a = Math.max(1, Math.min(7, a));
      els.adultos.value = String(a);
      const maxKids = Math.max(0, PRICES.maxPeople - a);
      els.criancas.max = String(maxKids);
      let k = parseInt(els.criancas.value||'0',10); if (Number.isNaN(k)) k = 0;
      if (k > maxKids) { els.criancas.value = String(maxKids); k = maxKids; }
      els.criancas.disabled = (a >= 7);
      els.criancas.title = (a >= 7) ? 'Capacidade máxima atingida (7 pessoas)' : '';
    }

    // Render orçamentação + KPIs
    const render = () => {
      applyCapacityRules();
      const q = computeQuote(els.checkin.value, els.checkout.value, els.adultos.value, els.criancas.value);

      if (els.kNoites)  els.kNoites.textContent  = q.nights;
      if (els.kNightly) els.kNightly.textContent = fmtEUR(q.nightlyTotal);
      if (els.kGrupo)   els.kGrupo.textContent   = q.partyTotal;
      if (els.bkNoites) els.bkNoites.textContent = q.nights;
      if (els.bkBase)   els.bkBase.textContent   = `${fmtEUR(PRICES.baseNightly)} / noite`;
      if (els.bkExtra)  els.bkExtra.textContent  = q.adultsAboveTwo>0 ? `+ ${fmtEUR(q.nightlyExtras)} / noite` : '0 €';
      if (els.bkTotal)  els.bkTotal.textContent  = q.valid ? fmtEUR(q.total) : '—';

      if (els.msg && q.valid) { els.msg.hidden = true; els.msg.textContent = ''; }
      return q;
    };

    // Mostrar erro num campo
    function markError(input, label, hint, text) {
      applyFieldErrorStyles(input, label);
      if (hint) { hint.textContent = text || 'Campo inválido.'; hint.hidden = false; }
      if (els.msg && text) { els.msg.textContent = text; els.msg.hidden = false; }
    }

    // Limpar erros ao corrigir
    [els.nome, els.email, els.telefone, els.checkin, els.checkout].forEach(inp=>{
      if(!inp) return;
      inp.addEventListener('input', ()=>{
        const key = inp.id;
        clearFieldErrorStyles(inp, labels[key], hints[key]);
      });
      inp.addEventListener('change', ()=>{
        const key = inp.id;
        clearFieldErrorStyles(inp, labels[key], hints[key]);
      });
    });

    // Filtros de input
    if (els.nome) els.nome.addEventListener('input', ()=> {
      els.nome.value = els.nome.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ ]+/g,'');
    });
    if (els.telefone) els.telefone.addEventListener('input', ()=> {
      let v = els.telefone.value.replace(/\s+/g,'');
      v = v.replace(/(?!^)\+/g,''); if (v.indexOf('+') > 0) v = v.replace(/\+/g,'');
      v = v.replace(/[^+\d]/g,'');
      els.telefone.value = v;
    });

    // Evitar teclado em adultos/crianças
    [els.adultos, els.criancas].forEach(inp => { if (inp) inp.addEventListener('focus', e => e.target.blur()); });

    // Spinners ↑/↓
    document.querySelectorAll('.spinner button').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.target);
        if (!input) return;
        const step = btn.classList.contains('spin-up') ? 1 : -1;
        const min = parseInt(input.min || '0', 10);
        const max = parseInt(input.max || '99', 10);
        let val = parseInt(input.value || min, 10);
        if (Number.isNaN(val)) val = min;
        val += step;
        if (val < min) val = min;
        if (val > max) val = max;
        input.value = String(val);
        render();
      });
    });

    // Re-render em eventos gerais
    [els.checkin, els.checkout, els.adultos, els.criancas, els.nome, els.email, els.telefone, els.consentTerms, els.consentPrivacy]
      .filter(Boolean).forEach(el => { el.addEventListener('input', render); el.addEventListener('change', render); });

    render();

    // --- ESTADOS DO BOTÃO (envio/sucesso/erro) ---

    // Mostra "A enviar…" e bloqueia só durante o POST
    const setLoading = (loading) => {
      els.reservarBtn.classList.toggle('is-loading', loading);
      els.reservarBtn.disabled = !!loading;
      if (loading) {
        els.reservarBtn.dataset.prev = els.reservarBtn.textContent || 'Reservar agora';
        els.reservarBtn.textContent = 'A enviar…';
      }
      // quando loading=false NÃO altera o texto (deixa showSuccess controlar)
    };

    // Remove o estado de loading sem mexer no texto
    const stopLoading = () => {
      els.reservarBtn.classList.remove('is-loading');
      els.reservarBtn.disabled = false;
    };

    // Sucesso: fica verde (classe CSS) e mantém mensagem por 4s
    const showSuccess = (ms = 4000) => {
      stopLoading();
      els.reservarBtn.classList.add('is-success');
      els.reservarBtn.textContent = '✅ Pedido enviado com sucesso';
      clearTimeout(showSuccess._t);
      showSuccess._t = setTimeout(() => {
        els.reservarBtn.classList.remove('is-success');
        els.reservarBtn.textContent = els.reservarBtn.dataset.prev || 'Reservar agora';
      }, ms);
    };

    // Abanar no erro
    const shake = () => {
      els.reservarBtn.style.transition = 'transform .1s';
      els.reservarBtn.style.transform = 'translateX(-4px)';
      setTimeout(()=>{ els.reservarBtn.style.transform='translateX(4px)'; }, 100);
      setTimeout(()=>{ els.reservarBtn.style.transform='translateX(0)'; }, 200);
    };

    const showError = (msg) => {
      if (els.msg) { els.msg.textContent = msg || 'Verifique os campos obrigatórios.'; els.msg.hidden = false; }
      shake();
    };

    // Validação e envio
    els.reservarBtn.addEventListener('click', async () => {
      if (els.msg) { els.msg.hidden = true; els.msg.textContent = ''; }

      const q = render();

      // Datas
      if (!els.checkin.value) { markError(els.checkin, labels.checkin, hints.checkin, 'Indique a data de check-in.'); showError(); return; }
      if (!els.checkout.value){ markError(els.checkout, labels.checkout, hints.checkout, 'Indique a data de check-out.'); showError(); return; }
      if (q.nights === 0)     { markError(els.checkout, labels.checkout, hints.checkout, 'Selecione datas válidas.'); showError(); return; }
      if (q.nights < PRICES.minNights) { markError(els.checkout, labels.checkout, hints.checkout, 'Estadia mínima: 2 noites.'); showError(); return; }
      if (q.nights > PRICES.maxNights) { markError(els.checkout, labels.checkout, hints.checkout, 'Estadia máxima: 30 noites.'); showError(); return; }

      // Pessoas
      if (q.partyTotal > PRICES.maxPeople) { showError('Capacidade máxima: 7 pessoas.'); return; }

      // Contactos
      if (!isNameValid(els.nome.value))      { markError(els.nome, labels.nome, hints.nome, 'Use apenas letras e espaços.'); showError(); return; }
      if (!isEmailValid(els.email.value))    { markError(els.email, labels.email, hints.email, 'Email inválido (tem de conter @).'); showError(); return; }
      if (!isPhoneValid(els.telefone.value)) { markError(els.telefone, labels.telefone, hints.telefone, 'Só dígitos e, opcionalmente, + no início.'); showError(); return; }

      // Consentimentos
      const consentsOk = (!!els.consentTerms?.checked) && (!!els.consentPrivacy?.checked);
      if (!consentsOk) {
        if (consentLabels.terms)   { consentLabels.terms.classList.add('label-error'); }
        if (consentLabels.privacy) { consentLabels.privacy.classList.add('label-error'); }
        errConsents.textContent = 'Tem de aceitar os Termos e a Política de Privacidade.';
        errConsents.hidden = false;
        showError();
        return;
      } else {
        if (consentLabels.terms)   consentLabels.terms.classList.remove('label-error');
        if (consentLabels.privacy) consentLabels.privacy.classList.remove('label-error');
        errConsents.textContent=''; errConsents.hidden = true;
      }

      // Envio
      try {
        setLoading(true);

        const data = new FormData();
        data.append('checkin',  els.checkin.value);
        data.append('checkout', els.checkout.value);
        data.append('adultos',  els.adultos.value);
        data.append('criancas_0_4', els.criancas.value);
        data.append('noites',   String(q.nights));
        data.append('preco_noite', fmtEUR(q.nightlyTotal));
        data.append('total',    fmtEUR(q.total));
        data.append('detalhe',  `Base: ${fmtEUR(PRICES.baseNightly)}/noite; Adultos: ${q.a}; Crianças 0–4: ${q.k}; Adultos extra: ${q.adultsAboveTwo} (+${fmtEUR(q.nightlyExtras)}/noite)`);
        data.append('nome', els.nome.value.trim());
        data.append('email', els.email.value.trim());
        data.append('telefone', els.telefone.value.trim());
        if (els.aloj?.value) data.append('alojamento', els.aloj.value);
        data.append('_subject', 'Novo pedido de reserva — Simulador');
        data.append('_page', '/reservas');

        const resp = await fetch(FORM_ENDPOINT, { method:'POST', body:data, headers:{'Accept':'application/json'} });
        if (resp.ok) {
          // reset suave
          const today = new Date(); today.setHours(0,0,0,0);
          const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
          els.checkin.value  = toISO(today);
          els.checkout.value = toISO(tomorrow);
          els.adultos.value  = '2';
          els.criancas.value = '0';
          els.nome.value=''; els.email.value=''; els.telefone.value='';
          if (els.consentTerms) els.consentTerms.checked=false;
          if (els.consentPrivacy) els.consentPrivacy.checked=false;
          render();
          showSuccess(4000);
        } else {
          let msg = 'Erro ao enviar. Tente novamente.';
          try { const j = await resp.json(); if (j?.errors?.length) msg = j.errors.map(e => e.message || 'Erro de validação.').join(' '); } catch(_){}
          throw new Error(msg);
        }
      } catch (ex) {
        showError(ex.message || 'Erro ao enviar. Tente novamente.');
      } finally {
        // NÃO repõe o texto aqui — deixa o showSuccess() manter a mensagem verde
        stopLoading();
      }
    });

    // Limpa aviso dos consentimentos quando marcam
    [els.consentTerms, els.consentPrivacy].forEach(cb=>{
      if (!cb) return;
      cb.addEventListener('change', ()=>{
        if (consentLabels.terms)   consentLabels.terms.classList.remove('label-error');
        if (consentLabels.privacy) consentLabels.privacy.classList.remove('label-error');
        errConsents.textContent=''; errConsents.hidden = true;
      });
    });

    // Testes básicos (console)
    try {
      console.assert(diffNights('2025-01-01','2025-01-03')===2,'diffNights 2');
      console.assert(isNameValid('José da Silva') && !isNameValid('Maria123'),'Nome');
      console.assert(isPhoneValid('+351912345678') && !isPhoneValid('351-912-abc'),'Telefone');
      console.assert(isEmailValid('a@b.com') && !isEmailValid('ab.com'),'Email');
    } catch(e){ console.warn('Tests:', e.message); }
  });
})();
