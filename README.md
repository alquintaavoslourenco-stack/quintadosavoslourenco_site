# Quinta dos Avós Lourenço – Site estático

Este pacote contém uma versão simples (HTML/CSS) do site, pronta para GitHub Pages, Cloudflare Pages ou Netlify.

## Estrutura
- `index.html`, `sobre.html`, `contactos.html`
- `css/style.css`
- `js/app.js` (opcional)

## Publicar no GitHub Pages
1. Crie um repositório público e carregue todos os ficheiros desta pasta para a raiz.
2. Em **Settings → Pages** selecione **Branch: main** e **Folder: /root**, e clique **Save**.
3. Aceda ao link que o GitHub disponibilizar.

## Domínio personalizado (.pt)
- Em **Settings → Pages → Custom domain**, defina `www.seudominio.pt`.
- No painel do seu registrador, crie um CNAME: `www` → `SEUUTILIZADOR.github.io`.
- Aguarde o HTTPS automático.

> Nota: Imagens não foram incluídas. Pode colocar as suas em `images/` e referir-se a elas com `images/ficheiro.jpg`.
