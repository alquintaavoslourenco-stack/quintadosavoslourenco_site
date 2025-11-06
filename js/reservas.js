/* /js/reservas.js — Simulador + validação forte + mensagens por campo + spinners + consent-error + Formspree */
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
    return Math.max(0, Math.round((b.setHours(12,0,0,0)-a.setHours(12,0,0,0))/86400000));
  };

  // Validadores
  const isNameValid  = (v) => /^[A-Za-zÀ-ÖØ-öø-ÿ ]+$/.test((v||'').trim());
  const isPhoneValid = (v) => /^(\+)?\d+$/.test((v||'').trim()); // dígitos e + opcional no início
  const isEmailValid = (v) => typeof v === 'string' && v.includes('@');

  // Cálculo
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
      checkin:  $('#checkin'),    checkout: $('#checkout'),
      adultos:  $('#adultos'),    criancas: $('#criancas'),
      nome:     $('#nome'),       email:    $('#email'),
      telefone: $('#telefone'),   aloj:     $('#alojamento'),

      // mensagens por campo:
      errCheckin:  $('#err-checkin'),
      errCheckout: $('#err-checkout'),
      errNome:     $('#err-nome'),
      errEmail:    $('#err-email'),
      errTelefone: $('#err-telefone'),

      // kpis e totais
      kNoites:  $('#k-noites'),   kNightly: $('#k-nightly'),
      kGrupo:   $('#k-grupo'),
      bkNoites: $('#bk-noites'),  bkBase:   $('#bk-base'),
      bkExtra:  $('#bk-extra'),   bkTotal:  $('#bk-total'),
      msg:      $('#sim-msg'),

      // consentimentos
      consentTerms: $('#consent-terms'),
      consentPrivacy: $('#consent-privacy'),
      reservarBtn: $('#sim-reservar'),

      // NOVOS: elementos de erro dos consentimentos
      errConsents: $('#err-consents'),
      consentTermsLabel: $('#consent-terms')?.closest('label'),
      consentPrivacyLabel: $('#consent-privacy')?.closest('label'),
    };
    if (!els.checkin || !els.checkout || !els.reservarBtn) return;

    // map para labels e hints
    const byInput = new Map([
      [els.checkin,  {label: els.checkin.closest('div')?.querySelector('label'),  hint: els.errCheckin}],
      [els.checkout, {label: els.checkout.closest('div')?.querySelector('label'), hint: els.errCheckout}],
      [els.nome,     {label: els.nome.closest('div')?.querySelector('label'),     hint: els.errNome}],
      [els.email,    {label: els.email.closest('div')?.querySelector('label'),    hint: els.errEmail}],
      [els.telefone, {label: els.telefone.closest('div')?.querySelector('label'), hint: els.errTelefone}],
    ]);

    // limpar erros
    const clearConsentErrors = () => {
      els.consentTermsLabel?.classList.remove('label-error');
      els.consentPrivacyLabel?.classList.remove('label-error');
      if (els.errConsents){ els.errConsents.textContent=''; els.errConsents.hidden = true; }
    };
    const clearFieldErrors = () => {
      document.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
      document.querySelectorAll('label.label-error').forEach(l => l.classList.remove('label-error'));
      for (const {hint} of byInput.values()) if (hint) { hint.textContent=''; hint.hidden = true; }
      [els.nome,els.email,els.telefone,els.checkin,els.checkout].forEach(el=>{ if(el) el.removeAttribute('aria-invalid'); });
      clearConsentErrors();
    };

    // marcar erro
    const markError = (input, text) => {
      const cfg = byInput.get(input); if (!cfg) return;
      input.classList.add('field-error'); input.setAttribute('aria-invalid','true');
      cfg.label?.classList.add('label-error');
      if (cfg.hint){ cfg.hint.textContent = text || 'Campo inválido.'; cfg.hint.hidden = false; }
      if (els.msg && text){ els.msg.textContent = text; els.msg.hidden = false; }
    };
    const markConsentsError = (text) => {
      els.consentTermsLabel?.classList.add('label-error');
      els.consentPrivacyLabel?.classList.add('label-error');
      if (els.errConsents){ els.errConsents.textContent = text || 'Tem de aceitar os Termos e a Política de Privacidade.'; els.errConsents.hidden = false; }
    };

    // datas padrão
    (function initDates(){
      const today = new Date(); today.setHours(0,0,0,0);
      const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
      els.checkin.value  ||= toISO(today);
      els.checkout.value ||= toISO(tomorrow);
      els.checkin.min = toISO(today);
      els.checkout.min = toISO(tomorrow);
    })();

    // capacidade total 7
    function applyCapacityRules() {
      const a = Math.max(1, Math.min(7, parseInt(els.adultos.value||'2',10)));
      const maxKids = Math.max(0, PRICES.maxPeople - a);
      els.adultos.value = String(a);
      els.criancas.max = String(maxKids);
      if ((parseInt(els.criancas.value||'0',10)) > maxKids) els.criancas.value = String(maxKids);
      els.criancas.disabled = (a >= 7);
      els.criancas.title = (a >= 7) ? 'Capacidade máxima atingida (7 pessoas)' : '';
    }

    // filtros em tempo real + limpar mensagens por campo
    if (els.nome) els.nome.addEventListener('input', () => {
      els.nome.value = els.nome.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ ]+/g,'');
      if (isNameValid(els.nome.value)) { els.errNome.hidden=true; els.errNome.textContent=''; els.nome.classList.remove('field-error'); byInput.get(els.nome)?.label?.classList.remove('label-error'); }
    });
    if (els.telefone) els.telefone.addEventListener('input', () => {
      let v = els.telefone.value.replace(/\s+/g,''); v = v.replace(/(?!^)\+/g,''); if (v.indexOf('+') > 0) v = v.replace(/\+/g,''); v = v.replace(/[^+\d]/g,'');
      els.telefone.value = v;
      if (isPhoneValid(els.telefone.value)) { els.errTelefone.hidden=true; els.errTelefone.textContent=''; els.telefone.classList.remove('field-error'); byInput.get(els.telefone)?.label?.classList.remove('label-error'); }
    });
    if (els.email) els.email.addEventListener('input', () => {
      if (isEmailValid(els.email.value)) { els.errEmail.hidden=true; els.errEmail.textContent=''; els.email.classList.remove('field-error'); byInput.get(els.email)?.label?.classList.remove('label-error'); }
    });
    [els.checkin, els.checkout].forEach(inp=>{
      if(!inp) return;
      inp.addEventListener('input', ()=>{ const cfg=byInput.get(inp); if(cfg?.hint){ cfg.hint.hidden=true; cfg.hint.textContent=''; } inp.classList.remove('field-error'); cfg?.label?.classList.remove('label-error'); });
    });

    const contactsValid = () => isNameValid(els.nome?.value) && isPhoneValid(els.telefone?.value) && isEmailValid(els.email?.value);

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

      const consentsOk = (!!els.consentTerms?.checked) && (!!els.consentPrivacy?.checked);
      const allOk = q.valid && consentsOk && contactsValid() && els.checkin.value && els.checkout.value;
      els.reservarBtn.disabled = !allOk;

      if (els.msg && allOk) { els.msg.hidden = true; els.msg.textContent = ''; }
      return q;
    };

    // evitar teclado em adultos/crianças
    [els.adultos, els.criancas].forEach(inp => { if (inp) inp.addEventListener('focus', e => e.target.blur()); });

    // spinners
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

    // listeners gerais
    [els.checkin, els.checkout, els.adultos, els.criancas, els.nome, els.email, els.telefone, els.consentTerms, els.consentPrivacy]
      .filter(Boolean).forEach(el => { el.addEventListener('input', render); el.addEventListener('change', render); });

    // limpar erro consents quando marcam
    [els.consentTerms, els.consentPrivacy].forEach(cb => {
      if (!cb) return;
      cb.addEventListener('change', () => { clearConsentErrors(); render(); });
    });

    render();

    // UI helpers
    const setLoading = (loading) => {
      els.reservarBtn.classList.toggle('is-loading', loading);
      els.reservarBtn.disabled = loading ? true : els.reservarBtn.disabled;
      if (loading) { els.reservarBtn.dataset.prev = els.reservarBtn.textContent; els.reservarBtn.textContent = 'A enviar…'; }
    };
    const showSuccess = (ms=4000) => {
      els.reservarBtn.classList.remove('is-loading'); els.reservarBtn.classList.add('is-success');
      els.reservarBtn.disabled = false; els.reservarBtn.textContent = '✅ Pedido enviado com sucesso';
      clearTimeout(showSuccess._t); showSuccess._t = setTimeout(()=>{ els.reservarBtn.classList.remove('is-success'); els.reservarBtn.textContent='Reservar agora'; render(); }, ms);
    };
    const showError = (msg) => {
      if (els.msg) { els.msg.textContent = msg || 'Erro ao enviar. Verifique os campos.'; els.msg.hidden = false; }
      els.reservarBtn.classList.remove('is-loading'); els.reservarBtn.classList.add('is-error');
      els.reservarBtn.textContent = 'Reservar agora'; setTimeout(()=> els.reservarBtn.classList.remove('is-error'), 1200);
    };

    // envio
    els.reservarBtn.addEventListener('click', async () => {
      clearFieldErrors();
      const q = render();

      // validação por campo + foco no primeiro erro
      if (!els.checkin.value)   { markError(els.checkin,'Indique a data de check-in.');   els.checkin.focus();   return; }
      if (!els.checkout.value)  { markError(els.checkout,'Indique a data de check-out.'); els.checkout.focus();  return; }
      if (q.nights < PRICES.minNights) { markError(els.checkout,'Estadia mínima: 2 noites.'); els.checkout.focus(); return; }
      if (!isNameValid(els.nome.value))     { markError(els.nome,'Use apenas letras e espaços.'); els.nome.focus(); return; }
      if (!isPhoneValid(els.telefone.value)){ markError(els.telefone,'Só dígitos e, opcionalmente, + no início.'); els.telefone.focus(); return; }
      if (!isEmailValid(els.email.value))   { markError(els.email,'Email inválido (tem de conter @).'); els.email.focus(); return; }
      if (!els.consentTerms?.checked || !els.consentPrivacy?.checked) {
        markConsentsError('Tem de aceitar os Termos e a Política de Privacidade.');
        if (!els.consentTerms.checked) els.consentTerms.focus(); else els.consentPrivacy.focus();
        return;
      }
      if (!q.valid) { showError(q.message || 'Verifique os dados da simulação.'); return; }

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
          els.adultos.value  = '2'; els.criancas.value = '0';
          els.nome.value=''; els.email.value=''; els.telefone.value='';
          if (els.consentTerms) els.consentTerms.checked=false; if (els.consentPrivacy) els.consentPrivacy.checked=false;
          render(); showSuccess(4000);
        } else {
          let msg = 'Erro ao enviar. Tente novamente.';
          try { const j = await resp.json(); if (j?.errors?.length) msg = j.errors.map(e => e.message || 'Erro de validação.').join(' '); } catch(_){}
          throw new Error(msg);
        }
      } catch (ex) {
        showError(ex.message);
      } finally {
        setLoading(false);
      }
    });

    // testes rápidos (console)
    try {
      console.assert(diffNights('2025-01-01','2025-01-03')===2,'diffNights 2');
      console.assert(isNameValid('José da Silva') && !isNameValid('Maria123'),'Nome');
      console.assert(isPhoneValid('+351912345678') && !isPhoneValid('351-912'),'Telefone');
      console.assert(isEmailValid('a@b.com') && !isEmailValid('ab.com'),'Email');
    } catch(e){ console.warn('Tests falharam:', e.message); }
  });
})();
