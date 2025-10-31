/* ==========================================================
   QUINTA DOS AVÓS LOURENÇO — APP.JS (versão final)
   ========================================================== */
(() => {
  'use strict';
  const qs = (sel, root=document)=>root.querySelector(sel);
  const qsa=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
  const on=(el,ev,fn,opts)=>el&&el.addEventListener(ev,fn,opts);

  /* ===== Testemunhos ===== */
  const TESTEMUNHOS_AIRBNB=[
    {texto:`Estadia perfeita...`,autor:`— Laura, Airbnb (julho 2025)`},
    {texto:`Local perfeito...`,autor:`— Tisha, Airbnb (maio 2025)`},
    {texto:`Casa incrivelmente equipada...`,autor:`— Joana, Airbnb (abril 2025)`},
  ];

  function renderTestemunhos(){
    const s=qs('.testemunhos-slider'); if(!s)return;
    if(!s.querySelector('.slide')){
      TESTEMUNHOS_AIRBNB.forEach((t,i)=>{
        const d=document.createElement('div');
        d.className='slide'+(i===0?' active':'');
        d.innerHTML=`<p style="color:#FFD700;font-size:20px;">★★★★★</p><p><em>${t.texto}</em></p><p class="note">${t.autor}</p>`;
        s.appendChild(d);
      });
      const dots=document.createElement('div');dots.className='dots';
      TESTEMUNHOS_AIRBNB.forEach(()=>dots.appendChild(document.createElement('span')));
      s.appendChild(dots);
    }
  }

  function initSlider(){
    const s=qs('.testemunhos-slider');if(!s)return;
    const slides=qsa('.slide',s);const dots=qsa('.dots span',s);
    let i=0;function show(n){slides.forEach(x=>x.classList.remove('active'));dots.forEach(x=>x.classList.remove('active'));i=(n+slides.length)%slides.length;slides[i].classList.add('active');dots[i]?.classList.add('active');}
    dots.forEach((d,idx)=>on(d,'click',()=>show(idx)));
    setInterval(()=>show(i+1),6000);
  }

  /* ===== Galeria ===== */
  function initLightbox(){
    const imgs=qsa('.gallery img');if(!imgs.length)return;
    const box=document.createElement('div');box.className='lightbox';const im=document.createElement('img');box.appendChild(im);document.body.appendChild(box);
    imgs.forEach(img=>on(img,'click',()=>{im.src=img.src;box.style.display='flex';}));
    on(box,'click',e=>{if(e.target!==im)box.style.display='none';});
    on(document,'keydown',e=>{if(e.key==='Escape')box.style.display='none';});
  }

  /* ===== Header ===== */
  function initTopbar(){
    const t=qs('.topbar'),h=qs('.hero'),m=qs('.menu'),bt=qs('.menu-toggle');
    if(!t)return;
    let last=window.scrollY,SHOW_AT_TOP=10,DELTA=6,hideTimer=null;

    const setOverlay=o=>{o?(t.classList.add('is-overlay'),t.classList.remove('is-solid')):(t.classList.remove('is-overlay'),t
