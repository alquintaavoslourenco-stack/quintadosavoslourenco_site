// ... cabeçalho e config iguais ...

document.addEventListener('DOMContentLoaded', () => {
  const els = {
    // simulador
    checkin:  document.querySelector('#checkin'),
    checkout: document.querySelector('#checkout'),
    adultos:  document.querySelector('#adultos'),
    criancas: document.querySelector('#criancas'),

    // novos campos de contacto
    nome:     document.querySelector('#nome'),
    email:    document.querySelector('#email'),
    telefone: document.querySelector('#telefone'),
    aloj:     document.querySelector('#alojamento'),

    // KPI (alterado: k-nightly agora mostra o preço / noite total)
    kNoites:  document.querySelector('#k-noites'),
    kNightly: document.querySelector('#k-nightly'),
    kGrupo:   document.querySelector('#k-grupo'),

    // breakdown
    bkNoites: document.querySelector('#bk-noites'),
    bkBase:   document.querySelector('#bk-base'),
    bkExtra:  document.querySelector('#bk-extra'),
    bkTotal:  document.querySelector('#bk-total'),
    msg:      document.querySelector('#sim-msg'),

    // consentimentos + submit
    consentTerms:   document.querySelector('#consent-terms'),
    consentPrivacy: document.querySelector('#consent-privacy'),
    reservarBtn:    document.querySelector('#sim-reservar'),
  };

  if (!els.checkin || !els.checkout || !els.reservarBtn) return;

  // init datas (igual)
  // ...

  const render = () => {
    const q = computeQuote(els.checkin.value, els.checkout.value, els.adultos?.value, els.criancas?.value);

    if (els.kNoites)  els.kNoites.textContent  = q.nights;
    if (els.kNightly) els.kNightly.textContent = fmtEUR(q.nightlyTotal); // <-- agora mostra TOTAL / noite
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

  // listeners (inclui novos campos para re-render se quiseres, opcional)
  [els.checkin, els.checkout, els.adultos, els.criancas, els.consentTerms, els.consentPrivacy]
    .filter(Boolean).forEach(el => { el.addEventListener('input', render); el.addEventListener('change', render); });

  render();

  // helpers setLoading/showSuccess/showError (iguais)
  // ...

  els.reservarBtn.addEventListener('click', async () => {
    const q = render();

    if (!els.consentTerms?.checked || !els.consentPrivacy?.checked) {
      return showError('Tem de aceitar os Termos e a Política de Privacidade.');
    }
    if (!q.valid) return showError(q.message || 'Verifique os dados da simulação.');

    // Validações leves dos novos campos (opcionais, comenta se não quiseres forçar)
    if (els.nome && /[0-9]/.test(els.nome.value)) return showError('O nome não deve conter números.');
    if (els.telefone && /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(els.telefone.value)) return showError('O telefone deve conter apenas números e símbolos + ( ) - .');
    if (els.email && els.email.value && !els.email.value.includes('@')) return showError('Insira um email válido.');

    try {
      setLoading(true);
      const data = new FormData();
      // dados da simulação
      data.append('checkin',  els.checkin.value);
      data.append('checkout', els.checkout.value);
      data.append('adultos',  els.adultos?.value || '0');
      data.append('criancas', els.criancas?.value || '0');
      data.append('noites',   String(q.nights));
      data.append('preco_noite', fmtEUR(q.nightlyTotal)); // <-- total / noite
      data.append('total',    fmtEUR(q.total));
      data.append('detalhe',  `Base: ${fmtEUR(q.nightlyBase)}/noite; Pessoas: ${q.partyTotal}; Extra: ${q.extraPeople} (+${fmtEUR(q.nightlyExtras)}/noite)`);

      // novos campos de contacto
      if (els.nome?.value)     data.append('nome', els.nome.value);
      if (els.email?.value)    data.append('email', els.email.value);
      if (els.telefone?.value) data.append('telefone', els.telefone.value);
      if (els.aloj?.value)     data.append('alojamento', els.aloj.value);

      data.append('_subject', 'Novo pedido de reserva — Simulador');
      data.append('_page',    '/reservas');

      const resp = await fetch('https://formspree.io/f/xanllrjv', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (resp.ok) {
        // reset leve
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
        try {
          const j = await resp.json();
          if (j && Array.isArray(j.errors) && j.errors.length) {
            msg = j.errors.map(e => e.message || 'Erro de validação.').join(' ');
          }
        } catch (_) {}
        throw new Error(msg);
      }
    } catch (ex) {
      showError(ex.message);
    } finally {
      setLoading(false);
    }
  });

  // testes rápidos (mantidos)
  // ...
});
