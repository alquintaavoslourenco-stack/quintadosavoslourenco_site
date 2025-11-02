// /js/reservas.js
// Validações e envio do formulário de Reservas (GitHub Pages + Formspree)

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

  // ========== 1) Datas: mínimo hoje; checkout >= checkin + 1 ==========
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
  // Nome: não permitir dígitos (mantém letras, acentos, espaços e sinais comuns)
  if (nome) {
    nome.addEventListener("input", () => {
      // remove números
      nome.value = nome.value.replace(/[0-9]/g, "");
    });
  }

  // Telefone: só números, espaços e símbolos usuais (+ () -)
  if (telefone) {
    telefone.addEventListener("input", () => {
      let v = telefone.value;
      // mantém apenas os caracteres permitidos
      v = v.replace(/[^0-9+()\- \t]/g, "");
      // permitir apenas um '+' e apenas na primeira posição
      v = v.replace(/(?!^)\+/g, "");      // remove '+' que não sejam o primeiro
      if (v.indexOf("+") > 0) {
        v = v.replace(/\+/g, "");         // se houver '+' mas não em 0, remove todos
      }
      telefone.value = v;
    });
  }

  // Limitar números (clamp) para adultos/crianças
  function clampNumber(input) {
    if (!input) return;
    input.addEventListener("input", () => {
      const min = parseInt(input.min || "0", 10);
      const max = parseInt(input.max || "999", 10);
      let val = parseInt(input.value || String(min), 10);
      if (Number.isNaN(val)) val = min;
      if (val < min) val = min;
      if (val > max) val = max;
      input.value = String(val);
    });
  }
  clampNumber(adultos);  // max 7
  clampNumber(criancas); // max 6

  // ========== 3) Submissão ==========
  form.addEventListener("submit", async (e) => {
    // limpar mensagens
    if (ok)  { ok.style.display = "none"; ok.textContent  = ""; }
    if (err) { err.style.display = "none"; err.textContent = ""; }

    // Honeypot anti-spam
    if (form.website && form.website.value.trim() !== "") {
      e.preventDefault();
      return;
    }

    // Validação HTML5
    if (!form.checkValidity()) {
      // deixa o browser indicar os campos obrigatórios/padrões
      return;
    }

    // Regras adicionais
    // 3.1 Nome sem números (defesa extra, além do pattern)
    if (nome && /[0-9]/.test(nome.value)) {
      e.preventDefault();
      showError("O nome não deve conter números.");
      return;
    }

    // 3.2 Telefone: bloquear letras (defesa extra)
    if (telefone && /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(telefone.value)) {
      e.preventDefault();
      showError("O telefone deve conter apenas números e símbolos + ( ) - .");
      return;
    }

    // 3.3 Limites adultos/crianças
    if (adultos && (+adultos.value > 7)) {
      e.preventDefault();
      showError("Máximo 7 adultos.");
      return;
    }
    if (criancas && (+criancas.value > 6)) {
      e.preventDefault();
      showError("Máximo 6 crianças.");
      return;
    }

    // 3.4 Datas coerentes
    if (checkin && checkout) {
      const ci = new Date(checkin.value + "T00:00:00");
      const co = new Date(checkout.value + "T00:00:00");
      if (!(co > ci)) {
        e.preventDefault();
        showError("A data de check-out deve ser posterior à de check-in.");
        return;
      }
    }

    // 3.5 Envio AJAX (Formspree)
    e.preventDefault();
    try {
      const data = new FormData(form);

      // acrescenta nº de noites (conveniente para ti)
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
        }
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
  }
})();
