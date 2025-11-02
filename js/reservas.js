// Validações e envio do formulário de reservas (compatível com a tua CSP)
(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const form = $("#bookingForm");
  if (!form) return;

  const ok = $("#status-ok");
  const err = $("#status-err");
  const checkin = $("#checkin");
  const checkout = $("#checkout");

  // Datas: mínimo hoje; checkout >= checkin + 1
  (function initDates() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const toISO = d => d.toISOString().slice(0, 10);
    const min = toISO(today);
    if (checkin) checkin.min = min;
    if (checkout) checkout.min = min;

    checkin.addEventListener("change", () => {
      if (!checkin.value) return;
      const ci = new Date(checkin.value + "T00:00:00");
      const coMin = new Date(ci); coMin.setDate(ci.getDate() + 1);
      const iso = toISO(coMin);
      checkout.min = iso;
      if (checkout.value && checkout.value < iso) checkout.value = iso;
    });
  })();

  // Submissão
  form.addEventListener("submit", async (e) => {
    if (ok) { ok.style.display = "none"; ok.textContent = ""; }
    if (err) { err.style.display = "none"; err.textContent = ""; }

    // Honeypot
    if (form.website && form.website.value.trim() !== "") {
      e.preventDefault();
      return;
    }

    // HTML5 validity
    if (!form.checkValidity()) {
      return; // deixa o browser indicar os campos
    }

    // Check lógico: checkout > checkin
    const ci = new Date(form.checkin.value + "T00:00:00");
    const co = new Date(form.checkout.value + "T00:00:00");
    if (!(co > ci)) {
      e.preventDefault();
      if (err) {
        err.textContent = "A data de check-out deve ser posterior à de check-in.";
        err.style.display = "block";
      }
      return;
    }

    // Envio AJAX para Formspree
    e.preventDefault();
    const data = new FormData(form);
    const nights = Math.round((co - ci) / (1000 * 60 * 60 * 24));
    data.append("noites", String(nights));

    try {
      const resp = await fetch(form.action, {
        method: form.method || "POST",
        body: data,
        headers: { "Accept": "application/json" }
      });

      if (resp.ok) {
        form.reset();
        if (ok) {
          ok.textContent = "Pedido enviado com sucesso. Obrigado!";
          ok.style.display = "block";
        }
      } else {
        const j = await resp.json().catch(() => null);
        throw new Error((j && (j.error || j.message)) || "Não foi possível enviar.");
      }
    } catch (ex) {
      if (err) {
        err.textContent = ex.message;
        err.style.display = "block";
      }
    }
  });
})();

