// QUINTA DOS AVÓS LOURENÇO — cookies.js
(function () {
  const KEY = 'qdal-consent-v1'; // chave única do projeto

  const setWaOffset = (px) => {
    document.documentElement.style.setProperty('--wa-offset', px + 'px');
  };

  const hide = (banner) => {
    banner.setAttribute('hidden', '');
    banner.setAttribute('aria-hidden', 'true');
    setWaOffset(0); // volta o WhatsApp ao fundo
  };

  const show = (banner) => {
    banner.removeAttribute('hidden');
    banner.setAttribute('aria-hidden', 'false');
    // mede a altura do banner e ajusta o WhatsApp
    requestAnimationFrame(() => {
      const h = banner.getBoundingClientRect().height || 0;
      setWaOffset(h + 12); // 12px de folga
    });
  };

  const start = () => {
    const banner = document.getElementById('cookie-consent');
    const btn = document.getElementById('cookie-accept');
    if (!banner || !btn) return;

    // Já aceitou?
    try {
      if (localStorage.getItem(KEY) === 'true') {
        hide(banner);
        return;
      }
    } catch (e) { /* continua mesmo sem localStorage */ }

    // Mostrar banner
    show(banner);

    // Aceitar (uma vez)
    btn.addEventListener('click', () => {
      try { localStorage.setItem(KEY, 'true'); } catch {}
      hide(banner);
    }, { once: true });

    // Acessibilidade: ESC fecha/aceita
    banner.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        try { localStorage.setItem(KEY, 'true'); } catch {}
        hide(banner);
      }
    });

    // Atualiza offset em resize
    window.addEventListener('resize', () => {
      if (!banner.hasAttribute('hidden')) {
        const h = banner.getBoundingClientRect().height || 0;
        setWaOffset(h + 12);
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  // Helpers de teste no console
  window.qdalConsent = {
    reset() { try { localStorage.removeItem(KEY); } catch {} const b = document.getElementById('cookie-consent'); if (b) show(b); },
    accepted() { try { return localStorage.getItem(KEY) === 'true'; } catch { return false; } }
  };
})();
<script>
  const $ = (s, c=document) => c.querySelector(s);

  // Datas: mínimo hoje; checkout >= checkin + 1
  (function(){
    const today = new Date(); today.setHours(0,0,0,0);
    const toISO = d => d.toISOString().slice(0,10);
    const checkin = $("#checkin");
    const checkout = $("#checkout");
    const min = toISO(today);
    if (checkin) checkin.min = min;
    if (checkout) checkout.min = min;
    checkin.addEventListener('change', () => {
      if (!checkin.value) return;
      const ci = new Date(checkin.value + 'T00:00:00');
      const coMin = new Date(ci); coMin.setDate(ci.getDate()+1);
      const iso = toISO(coMin);
      checkout.min = iso;
      if (checkout.value && checkout.value < iso) checkout.value = iso;
    });
  })();

  (function(){
    const form = $("#bookingForm");
    const ok = $("#status-ok");
    const err = $("#status-err");

    form.addEventListener('submit', async (e) => {
      ok.style.display='none'; err.style.display='none';

      if (form.website && form.website.value.trim() !== '') { e.preventDefault(); return; }
      if (!form.checkValidity()) { return; }

      const ci = new Date(form.checkin.value + 'T00:00:00');
      const co = new Date(form.checkout.value + 'T00:00:00');
      if (!(co > ci)) {
        e.preventDefault();
        err.textContent = 'A data de check-out deve ser posterior à de check-in.';
        err.style.display='block'; return;
      }

      e.preventDefault();
      const data = new FormData(form);
      const nights = Math.round((co-ci)/(1000*60*60*24));
      data.append('noites', String(nights));

      try {
        const resp = await fetch(form.action, {
          method: form.method || 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });
        if (resp.ok) {
          form.reset();
          ok.textContent = 'Pedido enviado com sucesso. Obrigado!';
          ok.style.display='block';
        } else {
          const j = await resp.json().catch(()=>null);
          throw new Error((j && (j.error||j.message)) || 'Não foi possível enviar.');
        }
      } catch(ex) {
        err.textContent = ex.message;
        err.style.display='block';
      }
    });
  })();
</script>
