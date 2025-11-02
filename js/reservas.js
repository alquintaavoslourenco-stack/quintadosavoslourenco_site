// /js/reservas.js
// Validações completas + envio AJAX (sem redirecionamento Formspree)

(function () {
  const $ = (s, c = document) => c.querySelector(s);

  const form     = $("#bookingForm");
  if (!form) return;

  const ok       = $("#status-ok");
  const err      = $("#status-err");
  const nome     = $("#nome");
  const email    = $("#email");
  const telefone = $("#telefone");
  const aloj     = $("#alojamento");
  const checkin  = $("#checkin");
  const checkout = $("#checkout");
  const adultos  = $("#adultos");
  const criancas = $("#criancas");

  // ========== 1) Datas ==========
  (function initDates() {
    if (!checkin || !checkout) return;
    const today = new Date(); today.setHours(0,0,0,0);
    const toISO = d => d.toISOString().slice(0, 10);
    const min = toISO(today);
    checkin.min = min;
    checkout.min = min;

    checkin.addEventListener("change", () => {
      if (!checkin.value) return;
      const ci = new Date(checkin.value + "T00:00:00");
      const coMin = new Date(ci); coMin.setDate(ci.getDate() + 1);
      const iso = toISO(coMin);
      checkout.min = iso;
      if (checkout.value && checkout.value < iso) checkout.value = iso;
    });
  })();

  // ========== 2) Filtros em tempo real ==========
  if (nome) {
    nome.addEventListener("input", () => {
      nome.value = nome.value.replace(/[0-9]/g, "");
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

  // ========== 3) Submissão ==========
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // nunca redireciona

    // limpar mensagens
    if (ok)  { ok.style.display = "none"; ok.textContent  = ""; }
    if (err) { err.style.display = "none"; err.textContent = ""; }

    // Honeypot anti-spam
    if (form.website && form.website.value.trim() !== "") return;

    // 3.1 Verificar se todos os obrigatórios estão preenchidos
    const required = form.querySelectorAll("[required]");
    let faltam = [];
    required.forEach((el) => {
      if (!el.value || (el.type === "checkbox" && !el.checked)) {
        faltam.push(el);
      }
    });

    if (faltam.length > 0) {
      faltam[0].focus();
      return showError("Por favor, preencha todos os campos obrigatórios antes de enviar.");
    }

    // 3.2 Validações adicionais
    if (nome && /[0-9]/.test(nome.value)) {
      return showError("O nome não deve conter números.");
    }
    if (telefone && /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(telefone.value)) {
      return showError("O telefone deve conter apenas números e símbolos + ( ) - .");
    }
    if (adultos && (+adultos.value > 7)) {
      return showError("Máximo 7 adultos.");
    }
    if (criancas && (+criancas.value > 6)) {
      return showError("Máximo 6 crianças.");
    }
    if (checkin && checkout) {
      const ci = new Date(checkin.value + "T00:00:00");
      const co = new Date(checkout.value + "T00:00:00");
      if (!(co > ci)) return showError("A data de check-out deve ser posterior à de check-in.");
    }

    // 3.3 Envio AJAX (Formspree)
    try {
      const data = new FormData(form);

      if (checkin && checkout) {
        const ci = new Date(checkin.value + "T00:00:00");
        const co = new Date(checkout.value + "T00:00:00");
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
        if (ok) {
          ok.textContent = "Pedido enviado com sucesso. Obrigado!";
          ok.style.display = "block";
          ok.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        // OPCIONAL: redirecionar para uma página personalizada
        // window.location.href = "/obrigado/";
      } else {
        const j = await resp.json().catch(() => null);
        throw new Error((j && (j.error || j.message)) || "Não foi possível enviar. Tente novamente.");
      }
    } catch (ex) {
      showError(ex.message || "Não foi possível enviar. Tente novamente.");
    }
  });

  // ========== Função para mostrar erros ==========
  function showError(message) {
    if (!err) return;
    err.textContent = message;
    err.style.display = "block";
    err.scrollIntoView({ behavior: "smooth", block: "center" });
  }
})();
