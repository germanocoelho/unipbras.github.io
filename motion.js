/* =====================================================================
   UNIPBRAS · Camada de movimento (motion.js)
   Complementa as animações já existentes no index.html sem substituí-las.
   ===================================================================== */
(function(){
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = !(window.matchMedia && window.matchMedia('(hover: none)').matches);
  function $$(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function safe(name, fn){ try{ fn(); }catch(e){ if (window.console) console.warn('[motion] ' + name, e); } }

  /* 1. Barra de progresso de leitura */
  safe('progress', function(){
    var bar = document.createElement('div');
    bar.className = 'mx-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    if (window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()') && !reduce) return;
    var ticking = false;
    function update(){
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty('--mx-progress', h > 0 ? Math.min(1, window.scrollY / h).toFixed(4) : 0);
      ticking = false;
    }
    window.addEventListener('scroll', function(){ if (!ticking){ ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  });

  /* 2. Cascata: irmãos com .reveal entram um após o outro */
  safe('stagger', function(){
    if (reduce) return;
    var parents = new Set();
    $$('.reveal').forEach(function(el){ if (el.parentElement) parents.add(el.parentElement); });
    parents.forEach(function(parent){
      var kids = Array.prototype.filter.call(parent.children, function(c){ return c.classList.contains('reveal'); });
      if (kids.length < 2) return;
      kids.forEach(function(kid, i){
        if (kid.classList.contains('is-visible')) return;
        var delay = Math.min(i * 90, 630);
        kid.style.transitionDelay = delay + 'ms';
        // depois de revelado, devolve a transição normal (não atrasa hover/tilt)
        var mo = new MutationObserver(function(){
          if (!kid.classList.contains('is-visible')) return;
          mo.disconnect();
          setTimeout(function(){ kid.style.transitionDelay = ''; }, delay + 950);
        });
        mo.observe(kid, { attributes: true, attributeFilter: ['class'] });
      });
    });
  });

  /* 3. Holofote que segue o cursor */
  safe('spotlight', function(){
    if (reduce || !canHover) return;
    var cards = $$('.assoc-card:not(.assoc-card-vazio), .parceiro-card, .roster-card, .leg-card, .contact-card, .obj-card, .member-card');
    cards.forEach(function(card){
      if (card.querySelector(':scope > .mx-spot-glow')) return;
      if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
      card.classList.add('mx-spot');
      var glow = document.createElement('span');
      glow.className = 'mx-spot-glow';
      glow.setAttribute('aria-hidden', 'true');
      card.appendChild(glow);
      card.addEventListener('pointermove', function(e){
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx-x', (e.clientX - r.left) + 'px');
        card.style.setProperty('--mx-y', (e.clientY - r.top) + 'px');
      }, { passive: true });
    });
  });

  /* 4. Aura de luz nas seções escuras */
  safe('aura', function(){
    if (reduce || !canHover) return;
    $$('.section-dark').forEach(function(sec){
      if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative';
      sec.classList.add('mx-aura-host');
      var aura = document.createElement('div');
      aura.className = 'mx-aura';
      aura.setAttribute('aria-hidden', 'true');
      sec.insertBefore(aura, sec.firstChild);
      var raf = 0, x = 0, y = 0;
      sec.addEventListener('pointermove', function(e){
        var r = sec.getBoundingClientRect();
        x = e.clientX - r.left; y = e.clientY - r.top;
        if (!raf) raf = requestAnimationFrame(function(){
          sec.style.setProperty('--mx-x', x + 'px');
          sec.style.setProperty('--mx-y', y + 'px');
          raf = 0;
        });
      }, { passive: true });
    });
  });

  /* 5. Contadores animados nos números da faixa diagonal */
  safe('counters', function(){
    var nums = $$('.diag-num');
    if (!nums.length || reduce || !('IntersectionObserver' in window)) return;
    function run(el){
      var target = parseInt(el.getAttribute('data-mx-target'), 10);
      var t0 = performance.now(), dur = 1400 + target * 40;
      el.classList.add('mx-counting');
      (function tick(now){
        var p = Math.min(1, (now - t0) / dur);
        var eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p); // easeOutExpo
        el.textContent = String(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick); else el.classList.remove('mx-counting');
      })(t0);
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        run(en.target);
      });
    }, { threshold: 0.6 });
    nums.forEach(function(el){
      var n = parseInt(el.textContent, 10);
      if (isNaN(n) || String(n) !== el.textContent.trim()) return;
      el.setAttribute('data-mx-target', n);
      el.textContent = '0';
      io.observe(el);
    });
  });

  /* 6. Troca de idioma com View Transitions (cross-fade com desfoque) */
  safe('lang-transition', function(){
    if (reduce || !document.startViewTransition) return;
    var replaying = false;
    document.addEventListener('click', function(e){
      if (replaying) return;
      var btn = e.target.closest && e.target.closest('.i18n-seletor button');
      if (!btn || btn.getAttribute('aria-pressed') === 'true') return;
      e.preventDefault();
      e.stopImmediatePropagation();
      document.startViewTransition(function(){
        replaying = true;
        try{ btn.click(); } finally { replaying = false; }
      });
    }, true);
  });
})();
