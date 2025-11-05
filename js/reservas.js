/* /js/reservas.js — Simulador + validações + envio AJAX (Formspree)
   Regras: 137€/noite (1–2 pessoas); +35€/pessoa/noite acima de 2;
           mínimo 2 noites; máximo 30 noites; capacidade até 7 pessoas.
   Seguro contra DOM incompleto (tudo corre após DOMContentLoaded) e com listeners defensivos.
*/

(function(){
  'use strict';

  // ===== Configuração =====
  const PRICES = Object.freeze({
    baseNightly: 137,
    extraPerPersonPerNight: 35,
    minNights: 2,
    maxNights: 30,
    maxPeople: 7,
  });

  const fmtEUR = (n) => new Intl.NumberFormat('pt-PT', { style:'currency', currency:'EUR', maximumFractionDigits:0 }).format(n);
  const $ = (s, c=document) => c.querySelector(s);

  // ===== Utilitários de data =====
  const toISO = (d) => d.toISOString().slice(0,10);
  const parseISO = (s) => (s ? new Date(s+"T00:00:00") : null);
  const diffNights = (ci, co) => {
    if(!ci || !co) return 0;
    const start = new Date(ci); const end = new Date(co);
    if(isNaN(start) || isNaN(end)) return 0;
    // normalizar para meio‑dia para evitar DST
    const ms = end.setHours(12,0,0,0) - start.setHours(12,0,0,0);
    return Math.max(0, Math.round(ms/86400000));
  };

  // ===== Cálculo central =====
  const computeQuote = (ci, co, adultos, criancas) => {
    const nights = diffNights(ci, co);
    const a = parseInt(adultos,10)||0;
    const c = parseInt(criancas,10)||0;
    const partyTotal = a + c;
    const extraPeople = Math.max(0, partyTotal - 2);
    const nightlyExtras = extraPeople * PRICES.extraPerPersonPerNight;
    const nightlyTotal  = PRICES.baseNightly + nightlyExtras;
    const total = nights * nightlyTotal;

    let valid = true; let message = '';
    if(nights === 0){ valid=false; message='Selecione datas válidas.'; }
    if(nights>0 && nights<PRICES.minNights){ valid=false; message='Estadia mínima: 2 noites.'; }
    if(nights>PRICES.maxNights){ valid=false; message='Estadia máxima: 30 noites.'; }
    if(partyTotal>PRICES.maxPeople){ valid=false; message='Capacidade máxima: 7 pessoas.'; }

    return { nights, partyTotal, extraPeople, nightlyBase:PRICES.baseNightly, nightlyExtras, nightlyTotal, total, valid, message };
  };

  // ===== Arranque após DOM =====
  document.addEventListener('DOMContentLoaded', () => {
    // Elementos do simulador
    const sim = {
      checkin:  $('#checkin'),
      checkout: $('#checkout'),
      adultos:  $('#adultos'),
      criancas: $('#criancas'),
      kNoites:  $('#k-noites'),
      kBase:    $('#k-base'),
      kGrupo:   $('#k-grupo'),
      bkNoites: $('#bk-noites'),
      bkBase:   $('#bk-base'),
      bkExtra:  $('#bk-extra'),
      bkTotal:  $('#bk-total'),
      msg:      $('#sim-msg'),
      copy:     $('#sim-copy'),
    };

    // Elementos do formulário
    const form = $('#bookingForm');
    const elsF = form ? {
      ok: $('#status-ok'),
      err: $('#status-err'),
      nome: $('#nome'),
      email: $('#email'),
      telefone: $('#telefone'),
      aloj: $('#alojamento'),
      fCheckin: $('#checkin-form'),
      fCheckout: $('#checkout-form'),
      fAdultos: $('#adultos-form'),
      fCriancas: $('#criancas-form'),
      hiddenTotal: $('#sim-total-hidden'),
      hiddenBreak: $('#sim-breakdown-hidden'),
      submitBtn: form.querySelector('button[type="submit"]'),
    } : {};

    const BTN_TEXT_DEFAULT = elsF.submitBtn ? elsF.submitBtn.textContent.trim() : 'Pedir disponibilidade';

    // ===== Inicialização de datas (simulador) =====
    (function initDates(){
      if(!sim.checkin || !sim.checkout) return;
      const today = new Date(); today.setHours(0,0,0,0);
      const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
      if(!sim.checkin.value) sim.checkin.value = toISO(today);
      if(!sim.checkout.value) sim.checkout.value = toISO(tomorrow);
      // limites: nunca passado
      const minISO = toISO(today);
      sim.checkin.min = minISO;
      sim.checkout.min = toISO(tomorrow); // pelo menos 1 noite na UI; regra aplica min 2 na lógica
    })();

    // ===== Render da simulação =====
    const render = () => {
      if(!sim.checkin || !sim.checkout) return;
      const q = computeQuote(sim.checkin.value, sim.checkout.value, sim.adultos?.value, sim.criancas?.value);
      if(sim.kNoites) sim.kNoites.textContent = q.nights;
      if(sim.kBase)   sim.kBase.textContent   = fmtEUR(q.nightlyBase);
      if(sim.kGrupo)  sim.kGrupo.textContent  = q.partyTotal;
      if(sim.bkNoites) sim.bkNoites.textContent = q.nights;
      if(sim.bkBase)   sim.bkBase.textContent   = `${fmtEUR(q.nightlyBase)} / noite`;
      if(sim.bkExtra)  sim.bkExtra.textContent  = q.extraPeople>0 ? `+ ${fmtEUR(q.nightlyExtras)} / noite` : '0 €';
      if(sim.bkTotal)  sim.bkTotal.textContent  = q.valid ? fmtEUR(q.total) : '—';
      if(sim.msg){ sim.msg.textContent = q.valid ? '' : q.message; sim.msg.hidden = !!q.valid; }

      // sincronizar para o formulário (se existir)
      if(elsF.fCheckin && sim.checkin) elsF.fCheckin.value = sim.checkin.value;
      if(elsF.fCheckout && sim.checkout) elsF.fCheckout.value = sim.checkout.value;
      if(elsF.fAdultos && sim.adultos) elsF.fAdultos.value = sim.adultos.value;
      if(elsF.fCriancas && sim.criancas) elsF.fCriancas.value = sim.criancas.value;
      if(elsF.hiddenTotal) elsF.hiddenTotal.value = q.valid ? fmtEUR(q.total) : '—';
      if(elsF.hiddenBreak) {
        elsF.hiddenBreak.value = `Noites: ${q.nights}; Base: ${fmtEUR(q.nightlyBase)}/noite; Pessoas: ${q.partyTotal}; Pessoas extra: ${q.extraPeople} (+${fmtEUR(q.nightlyExtras)}/noite)`;
      }
    };

    // Listeners do simulador (defensivos)
    [sim.checkin, sim.checkout, sim.adultos, sim.criancas].forEach((el) => {
      if(!el) return; el.addEventListener('input', render); el.addEventListener('change', render);
    });

    // Botão copiar
    if(sim.copy){
      sim.copy.addEventListener('click', () => {
        const q = computeQuote(sim.checkin?.value, sim.checkout?.value, sim.adultos?.value, sim.criancas?.value);
        const text = `Pedido de orçamento — Quinta dos Avós Lourenço\n`+
                     `Datas: ${sim.checkin?.value} a ${sim.checkout?.value} (noites: ${q.nights})\n`+
                     `Pessoas: ${sim.adultos?.value} adultos, ${sim.criancas?.value} crianças (total: ${q.partyTotal})\n`+
                     `Total estimado: ${q.valid ? fmtEUR(q.total) : '—'}\n`+
                     `Regras: base 137€/noite (1–2 pessoas); +35€/pessoa/noite; mínimo 2 noites; máximo 30; capacidade até 7.`;
        navigator.clipboard.writeText(text).then(()=>{
          sim.copy.textContent = 'Copiado!';
          setTimeout(()=> sim.copy.textContent='Copiar orçamento', 1400);
        });
      });
    }

    // Primeira renderização
    render();

    // ===== Validações + Envio AJAX (Formspree) com feedback NO BOTÃO =====
    if(!form){ return; }
    const { ok, err, nome, email, telefone, fCheckin, fCheckout, fAdultos, fCriancas, submitBtn } = elsF;

    function setLoading(loading){
      if(!submitBtn) return;
      submitBtn.classList.toggle('is-loading', loading);
      submitBtn.disabled = loading;
      if(loading){ submitBtn.dataset.prev = submitBtn.textContent; submitBtn.textContent = 'A enviar…'; }
      const controls = form.querySelectorAll('input, select, textarea, button');
      controls.forEach(el=>{ if(el!==submitBtn) el.disabled = loading; });
      form.setAttribute('aria-busy', loading ? 'true' : 'false');
    }

    function showButtonSuccess(tempMs=4000){
      if(!submitBtn) return;
      submitBtn.classList.remove('is-loading');
      submitBtn.classList.add('is-success');
      submitBtn.disabled = false;
      submitBtn.textContent = '✅ Pedido enviado com sucesso';
      window.clearTimeout(showButtonSuccess._t);
      showButtonSuccess._t = setTimeout(()=>{
        submitBtn.classList.remove('is-success');
        submitBtn.textContent = BTN_TEXT_DEFAULT;
      }, tempMs);
    }

    function showError(message){
      if(err){ err.textContent = message; err.style.display='block'; err.scrollIntoView({behavior:'smooth', block:'center'}); }
      if(submitBtn){
        submitBtn.classList.remove('is-loading');
        submitBtn.classList.add('is-error');
        submitBtn.textContent = BTN_TEXT_DEFAULT;
        setTimeout(()=> submitBtn.classList.remove('is-error'), 1200);
      }
    }

    function clearMessages(){ if(ok){ok.style.display='none';ok.textContent='';} if(err){err.style.display='none';err.textContent='';} }

    // Filtros em tempo real (nome sem números; telefone só dígitos/símbolos usuais)
    if(nome){ nome.addEventListener('input', ()=>{ nome.value = nome.value.replace(/[0-9]/g,''); }); }
    if(telefone){ telefone.addEventListener('input', ()=>{
      let v = telefone.value; v = v.replace(/[^0-9+()\- \t]/g,''); v = v.replace(/(?!^)\+/g,''); if(v.indexOf('+')>0) v = v.replace(/\+/g,''); telefone.value = v;
    }); }

    function clampNumber(input){ if(!input) return; input.addEventListener('change',()=>{
      const min = parseInt(input.min||'0',10); const max = parseInt(input.max||'999',10);
      let val = parseInt(input.value||String(min),10); if(Number.isNaN(val)) val=min; if(val<min) val=min; if(val>max) val=max; input.value=String(val);
    }); }
    clampNumber(fAdultos); clampNumber(fCriancas);

    // Submissão AJAX
    form.addEventListener('submit', async (e)=>{
      e.preventDefault(); clearMessages();

      // Honeypot
      if(form.website && form.website.value.trim()!=='') return;

      // Preenche hidden com a simulação atual
      render();

      // Obrigatórios
      const required = form.querySelectorAll('[required]');
      const faltam = []; required.forEach(el=>{ const vazio = !el.value || (el.type==='checkbox' && !el.checked); if(vazio) faltam.push(el); });
      if(faltam.length){ faltam[0].focus(); return showError('Por favor, preencha todos os campos obrigatórios antes de enviar.'); }

      // Regras extra
      if(nome && /[0-9]/.test(nome.value)) return showError('O nome não deve conter números.');
      if(telefone && /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(telefone.value)) return showError('O telefone deve conter apenas números e símbolos + ( ) - .');
      if(email && !email.value.includes('@')) return showError('Por favor insira um email válido.');

      // Datas (mínimo 2 noites)
      if(fCheckin && fCheckout){
        const ci = parseISO(fCheckin.value); const co = parseISO(fCheckout.value);
        if(!(co>ci)) return showError('A data de check-out deve ser posterior à de check-in.');
        const nights = diffNights(fCheckin.value, fCheckout.value);
        if(nights < PRICES.minNights) return showError('Estadia mínima: 2 noites.');
        if(nights > PRICES.maxNights) return showError('Estadia máxima: 30 noites.');
      }

      try{
        setLoading(true);
        const data = new FormData(form);
        // nº noites útil no email
        if(fCheckin && fCheckout){
          const nights = diffNights(fCheckin.value, fCheckout.value);
          if(!Number.isNaN(nights) && nights>0) data.append('noites', String(nights));
        }
        const resp = await fetch(form.action, { method:'POST', body:data, headers:{ 'Accept':'application/json' } });
        if(resp.ok){
          form.reset();
          // repor datas padrão (hoje -> amanhã)
          const today = new Date(); today.setHours(0,0,0,0);
          const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
          if(sim.checkin)  sim.checkin.value  = toISO(today);
          if(sim.checkout) sim.checkout.value = toISO(tomorrow);
          render();
          showButtonSuccess(4000);
        } else {
          let msg = 'Erro ao enviar. Tente novamente.';
          try{ const j = await resp.json(); if(j && Array.isArray(j.errors) && j.errors.length){ msg = j.errors.map(e=>e.message||'Erro de validação.').join(' ');} }catch(_){ }
          throw new Error(msg);
        }
      } catch(ex){
        showError(ex.message || 'Erro ao enviar. Tente novamente.');
      } finally {
        setLoading(false);
        if(elsF.submitBtn && !elsF.submitBtn.classList.contains('is-success')){ elsF.submitBtn.textContent = BTN_TEXT_DEFAULT; }
      }
    });

    // ===== Testes rápidos (apenas consola; não quebra produção) =====
    try{
      console.assert(diffNights('2025-01-01','2025-01-03')===2, 'diffNights 2 noites');
      const q1 = computeQuote('2025-01-01','2025-01-03',2,0);
      console.assert(q1.total === 2*PRICES.baseNightly, 'Total base 2 noites/2 pessoas');
      const q2 = computeQuote('2025-01-01','2025-01-03',4,0);
      console.assert(q2.nightlyExtras === 2*PRICES.extraPerPersonPerNight && q2.total === 2*(PRICES.baseNightly + 2*PRICES.extraPerPersonPerNight), 'Extras aplicados');
      const q3 = computeQuote('2025-01-01','2025-01-05',6,2);
      console.assert(q3.valid === false && q3.partyTotal===8, 'Capacidade máxima 7');
      const q4 = computeQuote('2025-01-01','2025-01-02',2,0);
      console.assert(q4.valid === false && q4.nights===1, 'Mínimo 2 noites');
      const q5 = computeQuote('2025-01-01','2025-02-05',2,0);
      console.assert(q5.valid === false, 'Máximo 30 noites');
    }catch(e){ console.warn('Tests falharam:', e.message); }
  });
})();
