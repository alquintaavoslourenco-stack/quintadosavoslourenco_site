// ======= Menu mobile =======
const burger = document.querySelector('.burger');
const menu = document.querySelector('#menu');
if (burger && menu){
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

// ======= Cookie banner minimal =======
(function(){
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  const KEY = 'qdavl.cookies';
  try {
    const pref = localStorage.getItem(KEY);
    if (!pref) banner.hidden = false;

    banner.querySelector('[data-accept]')?.addEventListener('click', ()=>{
      localStorage.setItem(KEY,'accepted'); banner.hidden = true;
    });
    banner.querySelector('[data-decline]')?.addEventListener('click', ()=>{
      localStorage.setItem(KEY,'declined'); banner.hidden = true;
    });

    document.getElementById('open-cookies')?.addEventListener('click', (e)=>{
      e.preventDefault(); banner.hidden = false;
    });
  } catch(e){ /* se localStorage bloquear, ignora */ }
})();

// ======= Preservar UTM nos links para WhatsApp =======
(function attachUTMtoWhatsApp(){
  const params = new URLSearchParams(location.search);
  const utm = [];
  ['utm_source','utm_medium','utm_campaign'].forEach(k => params.get(k) && utm.push(`${k}=${params.get(k)}`));
  if (!utm.length) return;
  const suffix = `%0A(${utm.join('%2C%20')})`;
  document.querySelectorAll('a[href*="wa.me/351"]').forEach(a=>{
    if (!a.href.includes('text=')) return;
    a.href += suffix;
  });
})();

  });
}
