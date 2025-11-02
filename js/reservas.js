// /js/reservas.js
// Validações + envio AJAX (sem redirecionar) + regras atualizadas

(function () {
  const $ = (s, c = document) => c.querySelector(s);

  const form     = $("#bookingForm");
  if (!form) return;

  const ok       = $("#status-ok");
  const err      = $("#status-err");
  const nome     = $("#nome");
  const email    = $("#email");
  const telefone = $("#telefone");
  const checkin  = $("#checkin");
  const checkout = $("#checkout");
  const adultos  = $("#adultos");
  const criancas = $("#criancas");

  const MIN_NIGHTS = 2;

  const toISO = d => d.toISOString().slice(0, 10);
  const parseISO = s => (s ? new Date(s + "T00:00:00") : null);

  // ===== 1) Inicializar datas =====
  (function initDates() {
    if (!checkin || !checkout) return;

    const today = new Date(); today.setHours(0,0,0,0);
    const todayISO = toISO(today);

    // placeholders com a data de hoje
    checkin.placeholder  = todayISO;
    checkout.placeholder = todayISO;

    // limites mínimos (nunca passado)
    checkin.min  = todayISO;
    checkout.min = todayISO;

    // valores por defeito: 1 noite (hoje → amanhã)
    if (!checkin.value)  checkin.value  = todayISO;
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    if (!checkout.value || checkout.value < toISO(tomorrow)) {
      checkout.value = toISO(tomorrow);
    }

    // impedir data passada
    checkin.addEventListener("input", () => {
      if (!checkin.value) return;
      const ci = parseISO(checkin.value);
      if (ci < today) checkin.value = todayISO;
      updateCheckoutMinAllowOneNight();
      showNightsHintIfNeeded();
    });

    // quando muda check-in, permitir 1 noite (min = ci + 1)
    checkin.addEventListener("change", () => {
      updateCheckoutMinAllowOneNight();
      showNightsHintIfNeeded();
    });

    // feedback quando o utilizador ajusta o checkout
    checkout.addEventListener("input", showNightsHintIfNeeded);
    checkout.addEventListener("change", showNightsHintIfNeeded);

    function updateCheckoutMinAllowOneNight() {
      if (!checkin.value) return;
      const ci = parseISO(checkin.value);
      const coMin = new Date(ci); coMin.setDate(ci.getDate() + 1); // permite 1 noite
      const coISO = toISO(coMin);
      checkout.min = coISO;
      if (!checkout.value || checkout.value < coISO) checkout.value = coISO;
    }
  })();

  // ===== 2) Filtros em tempo real =====
  if (nome) {
    nome.addEventListener("input", () => {
      nome.value = nome.value.replace(/[0-9]/g, ""); // sem números
    });
  }

  if (telefone) {
    telefone.addEventListener("input", () => {
      let v = telefone.value;
      v = v.replace(/[^0-9+()\- \t]/g, "");
      v = v.replace(/(?!^)\+/g, "");
      if (v.indexOf("+") > 0) v = v.replace(/\+/g, "");
      telefone.value = v;
    });
  }

  function clampNumber(input) {
    if (!input) return;
    input.addEventListener("change", () => {
      const min = parseInt(input.min || "0", 10);
      const max = parseInt(input.max || "999", 10);
      let val = parseInt(input.value || String(min), 10);
      if (Number.isNaN(val)) val = min;
      if (val < min) val = min;
      if (val > max) val = max;
      input.value = String(val);
    });
  }
  clampNumber(adultos);
  clampNumber(criancas);

  // ===== 3) Mensagem informativa (mínimo 2 noites) =====
  let nightsHint = document.getElementById("nights-hint");
  if (!nightsHint && checkout) {
    nightsHint = document.createElement("small");
    nightsHint.id = "nights-hint";
    nightsHint.style.display = "none";
    nightsHint.style.color = "#991b1b"; // vermelho
    nightsHint.style.fontWeight = "600";
    nightsHint.style.marginTop = "6px";
    const p = checkout.closest("p") || checkout.parentElement;
    p && p.appendChild(nightsHint);
  }

  function showNightsHintIfNeeded() {
    if (!checkin || !checkout || !nightsHint || !checkin.value || !checkout.value) return;
    const ci = parseISO(checkin.value);
    const co = parseISO(checkout.value);
    const nights = Math.round((co - ci) / (1000 * 60 * 60 * 24));
    if (nights === 1) {
      nightsHint.textContent = "ℹ️ Estadia mínima: 2 noites.";
      nightsHint.style.display = "block";
    } else {
      nightsHint.style.display = "none";
      nightsHint.textContent = "";
    }
  }

  // ===== 4) Submissão (sem redirecionamento) =====
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (ok)  { ok.style.display = "none"; ok.textContent  = ""; }
    if (err) { err.style.display = "none"; err.textContent = ""; }

    // Honeypot
    if (form.website && form.website.value.trim() !== "") return;

    // obrigatórios
    const required = form.querySelectorAll("[required]");
    const faltam = [];
    required.forEach(el => {
      const vazio = !el.value || (el.type === "checkbox" && !el.checked);
      if (vazio) faltam.push(el);
    });
    if (faltam.length) {
      faltam[0].focus();
      return showError("Por favor, preencha todos os campos obrigatórios antes de enviar.");
    }

    // regras extra
    if (nome && /[0-9]/.test(nome.value)) {
      return showError("O nome não deve conter números.");
    }
    if (telefone && /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(telefone.value)) {
      return showError("O telefone deve conter apenas números e símbolos + ( ) - .");
    }
    if (email && !email.value.includes("@")) {
      return showError("Por favor insira um email válido.");
    }
    if (adultos && (+adultos.value > 7)) {
      return showError("Máximo 7 adultos.");
    }
    if (criancas && (+criancas.value > 6)) {
      return showError("Máximo 6 crianças.");
    }

    // datas e noites (corrige automaticamente se só 1)
    if (checkin && checkout) {
      const ci = parseISO(checkin.value);
      const co = parseISO(checkout.value);
      if (!(co > ci)) {
        return showError("A data de check-out deve ser posterior à de check-in.");
      }
      const nights = Math.round((co - ci) / (1000 * 60 * 60 * 24));
      if (nights < MIN_NIGHTS) {
        const coMin = new Date(ci); coMin.setDate(ci.getDate() + MIN_NIGHTS);
        checkout.value = toISO(coMin);
        showNightsHintIfNeeded();
        return showError("ℹ️ Estadia mínima: 2 noites.");
      }
    }

    // envio AJAX (Formspree)
    try {
      const data = new FormData(form);

      if (checkin && checkout) {
        const ci = parseISO(checkin.value);
        const co = parseISO(checkout.value);
        const nights = Math.round((co - ci) / (1000 * 60 * 60 * 24));
        if (!Number.isNaN(nights) && nights > 0) data.append("noites", String(nights));
      }

      const resp = await fetch(form.action, {
        method: form.method || "POST",
        body: data,
        headers: { "Accept": "application/json" }
      });

      if (resp.ok) {
        form.reset();

        // repor defaults: hoje → amanhã
        const today = new Date(); today.setHours(0,0,0,0);
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        if (checkin)  checkin.value  = toISO(today);
        if (checkout) checkout.value = toISO(tomorrow);
        nightsHint && (nightsHint.style.display = "none");

        if (ok) {
          ok.textContent = "Pedido enviado com sucesso. Obrigado!";
          ok.style.display = "block";
          ok.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        // opcional:
        // window.location.href = "/obrigado/";
      } else {
        const j = await resp.json().catch(() => null);
        throw new Error((j && (j.error || j.message)) || "Não foi possível enviar. Tente novamente.");
      }
    } catch (ex) {
      showError(ex.message || "Não foi possível enviar. Tente novamente.");
    }
  });

  function showError(message) {
    if (!err) return;
    err.textContent = message;
    err.style.display = "block";
    err.scrollIntoView({ behavior: "smooth", block: "center" });
  }
})();
