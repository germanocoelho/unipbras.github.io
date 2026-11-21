/* =====================================================================
   UNIPBRAS · Pacote 5 (toque.js)
   Efeitos no celular: toque no lugar do mouse e alternativa às
   animações ligadas à rolagem onde o navegador não as suporta.
   ===================================================================== */
(function(){
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $$(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* 1. Toque nos botões e filtros acende o mesmo efeito do mouse */
  document.addEventListener('pointerdown', function(e){
    if (e.pointerType === 'mouse') return;
    var b = e.target.closest && e.target.closest('.btn.gb');
    if (b){
      b.classList.add('gb-ativo');
      clearTimeout(b._tq); b._tq = setTimeout(function(){ b.classList.remove('gb-ativo'); }, 1500);
    }
    var f = e.target.closest && e.target.closest('.leg-filtro');
    if (f){
      f.classList.add('lq-toque');
      clearTimeout(f._tq); f._tq = setTimeout(function(){ f.classList.remove('lq-toque'); }, 900);
    }
  }, { passive: true });

  /* 2. Alternativa às animações ligadas à rolagem (ex.: Safari do iPhone) */
  if (reduce) return;
  if (window.CSS && CSS.supports && CSS.supports('animation-timeline: view()')) return;
  document.documentElement.classList.add('tq-fb');

  var root = document.documentElement, ticking = false;
  function clamp(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }
  function atualiza(){
    ticking = false;
    var vh = window.innerHeight, y = window.scrollY;
    root.style.setProperty('--tq-hero', clamp(y / (vh * .9)).toFixed(3));
    $$('.section-dark').forEach(function(s){
      var r = s.getBoundingClientRect();
      s.style.setProperty('--tq-c', clamp((vh - r.top) / (vh * .85)).toFixed(3));
    });
    $$('.mx-wm').forEach(function(w){
      var r = w.parentNode.getBoundingClientRect();
      w.style.setProperty('--tq-w', clamp((vh - r.top) / (vh + r.height)).toFixed(3));
    });
    var m = document.querySelector('.mx-manifesto');
    if (m){
      var r = m.getBoundingClientRect();
      m.style.setProperty('--tq-m', clamp(-r.top / Math.max(1, r.height - vh) / .75).toFixed(3));
    }
  }
  function pede(){ if (!ticking){ ticking = true; requestAnimationFrame(atualiza); } }
  addEventListener('scroll', pede, { passive: true });
  addEventListener('resize', pede, { passive: true });
  if (document.readyState === 'complete') atualiza(); else addEventListener('load', atualiza);
  setTimeout(atualiza, 300);
})();
