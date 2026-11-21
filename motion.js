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
    if (reduce) return;
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
      card.addEventListener('pointerdown', function(e){
        if (e.pointerType === 'mouse') return;
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx-x', (e.clientX - r.left) + 'px');
        card.style.setProperty('--mx-y', (e.clientY - r.top) + 'px');
        card.classList.add('mx-toque');
        clearTimeout(card._mxT); card._mxT = setTimeout(function(){ card.classList.remove('mx-toque'); }, 1400);
      }, { passive: true });
    });
  });

  /* 4. Aura de luz nas seções escuras */
  safe('aura', function(){
    if (reduce) return;
    $$('.section-dark').forEach(function(sec){
      if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative';
      sec.classList.add('mx-aura-host');
      var aura = document.createElement('div');
      aura.className = 'mx-aura';
      aura.setAttribute('aria-hidden', 'true');
      sec.insertBefore(aura, sec.firstChild);
      var raf = 0, x = 0, y = 0;
      sec.addEventListener('pointerdown', function(e){
        if (e.pointerType === 'mouse') return;
        var r = sec.getBoundingClientRect();
        sec.style.setProperty('--mx-x', (e.clientX - r.left) + 'px');
        sec.style.setProperty('--mx-y', (e.clientY - r.top) + 'px');
        sec.classList.add('mx-toque');
        clearTimeout(sec._mxT); sec._mxT = setTimeout(function(){ sec.classList.remove('mx-toque'); }, 1600);
      }, { passive: true });
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

  /* ===================== PACOTE 2 · efeitos arrojados ===================== */
  var SECOES = ['#marca', '#sobre', '#objetivos', '#estrutura', '#fundacao', '#associadas',
                '#noticias', '#galeria', '#associe', '#legislacao', '#contato'];

  /* 8. Fileiras: a seção se abre como a tela de abertura */
  safe('fileiras', function(){
    if (reduce || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var f = en.target.querySelector(':scope > .mx-fileiras');
        if (!f) return;
        requestAnimationFrame(function(){ f.classList.add('abre'); });
        setTimeout(function(){ if (f.parentNode) f.parentNode.removeChild(f); }, 1500);
      });
    }, { threshold: 0.12 });
    SECOES.forEach(function(sel){
      var sec = document.querySelector(sel);
      if (!sec) return;
      var r = sec.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) return; // já visível ao carregar
      sec.classList.add('mx-has-fileiras');
      var f = document.createElement('div');
      f.className = 'mx-fileiras';
      f.setAttribute('aria-hidden', 'true');
      var n = window.innerWidth < 700 ? 5 : 9;
      for (var i = 0; i < n; i++){
        var s = document.createElement('i');
        s.style.transitionDelay = (Math.abs(i - (n - 1) / 2) * 45) + 'ms'; // abre do centro para as bordas
        f.appendChild(s);
      }
      sec.appendChild(f);
      io.observe(sec);
      setTimeout(function(){ f.classList.add('abre'); }, 12000); // rede de segurança
    });
  });

  /* 9. Numeração gigante vazada por seção */
  safe('numeracao', function(){
    var n = 0;
    SECOES.forEach(function(sel){
      var sec = document.querySelector(sel);
      if (!sec || !sec.querySelector(':scope > .section-inner')) return;
      n++;
      sec.classList.add('mx-wm-host');
      var wm = document.createElement('span');
      wm.className = 'mx-wm';
      wm.setAttribute('aria-hidden', 'true');
      wm.textContent = (n < 10 ? '0' : '') + n;
      sec.insertBefore(wm, sec.firstChild);
    });
  });

  /* 10. Faixa cinética com os povos do mapa da fundação */
  safe('povos', function(){
    var nomes = [];
    $$('.map-marker[data-people]').forEach(function(m){
      try{
        JSON.parse(m.getAttribute('data-people')).forEach(function(p){
          if (p.ethnicity && nomes.indexOf(p.ethnicity) < 0) nomes.push(p.ethnicity);
        });
      }catch(e){}
    });
    var antes = document.querySelector('#fundacao');
    if (nomes.length < 3 || !antes) return;
    var faixa = document.createElement('div');
    faixa.className = 'mx-povos';
    faixa.setAttribute('aria-hidden', 'true');
    var linhas = [];
    ['a', 'b'].forEach(function(tipo, k){
      var linha = document.createElement('div');
      linha.className = 'mx-povos-linha ' + tipo;
      var lista = k ? nomes.slice().reverse() : nomes;
      for (var rep = 0; rep < 3; rep++){
        lista.forEach(function(nm){ var s = document.createElement('span'); s.textContent = nm; linha.appendChild(s); });
      }
      faixa.appendChild(linha);
      linhas.push({ el: linha, dir: k ? 1 : -1, x: k ? -1 : 0 });
    });
    antes.parentNode.insertBefore(faixa, antes);
    if (reduce) return;

    var visivel = false, lastY = window.scrollY, vel = 0, raf = 0;
    function passo(){
      var y = window.scrollY, dy = y - lastY; lastY = y;
      vel += (dy - vel) * 0.12; // velocidade suavizada da rolagem
      linhas.forEach(function(l){
        var w = l.el.scrollWidth / 3;
        if (l.x === -1) l.x = -w;
        l.x += l.dir * (0.6 + Math.min(Math.abs(vel), 60) * 0.45);
        if (l.x <= -w) l.x += w;
        if (l.x >= 0) l.x -= w;
        var skew = Math.max(-14, Math.min(14, vel * 0.35)) * l.dir;
        l.el.style.transform = 'translate3d(' + l.x.toFixed(1) + 'px,0,0) skewX(' + skew.toFixed(2) + 'deg)';
      });
      raf = visivel ? requestAnimationFrame(passo) : 0;
    }
    new IntersectionObserver(function(en){
      visivel = en[0].isIntersecting;
      if (visivel && !raf){ lastY = window.scrollY; raf = requestAnimationFrame(passo); }
    }).observe(faixa);
  });

  /* 11. Cursor-semente */
  safe('cursor', function(){
    if (reduce || !canHover) return;
    var anel = document.createElement('div'); anel.className = 'mx-cursor';
    var ponto = document.createElement('div'); ponto.className = 'mx-cursor-ponto';
    anel.setAttribute('aria-hidden', 'true'); ponto.setAttribute('aria-hidden', 'true');
    document.body.appendChild(anel); document.body.appendChild(ponto);
    var mx = -100, my = -100, ax = -100, ay = -100, rodando = false;
    var ALVOS = 'a, button, .mx-spot, .map-marker, .marca-moldura, [role="button"]';
    function loop(){
      ax += (mx - ax) * 0.18; ay += (my - ay) * 0.18;
      anel.style.transform = 'translate3d(' + ax + 'px,' + ay + 'px,0)';
      if (Math.abs(mx - ax) + Math.abs(my - ay) > 0.3) requestAnimationFrame(loop); else rodando = false;
    }
    document.addEventListener('pointermove', function(e){
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY;
      ponto.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0) rotate(45deg)';
      anel.classList.add('on'); ponto.classList.add('on');
      var t = e.target.closest && e.target.closest(ALVOS);
      anel.classList.toggle('grande', !!t);
      if (!rodando){ rodando = true; requestAnimationFrame(loop); }
    }, { passive: true });
    document.addEventListener('pointerdown', function(){ anel.classList.add('aperta'); });
    document.addEventListener('pointerup', function(){ anel.classList.remove('aperta'); });
    document.documentElement.addEventListener('mouseleave', function(){ anel.classList.remove('on'); ponto.classList.remove('on'); });
  });

  /* 16. Explosão de sementes no clique em botões, links e cards */
  safe('sementes', function(){
    if (reduce || !Element.prototype.animate) return;
    var CORES = ['#E8A317', '#F5C542', '#4C7A2E', '#9A3A0F', '#0A3D6E'];
    document.addEventListener('pointerdown', function(e){
      var alvo = e.target.closest && e.target.closest('a, button, .mx-spot, .marca-moldura, .map-marker');
      if (!alvo || alvo.closest('input, textarea, select, .i18n-seletor')) return;
      for (var i = 0; i < 14; i++){
        var s = document.createElement('span');
        s.className = 'mx-semente';
        s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px';
        s.style.background = CORES[i % CORES.length];
        var ang = (Math.PI * 2 * i) / 14 + Math.random() * 0.4;
        var dist = 40 + Math.random() * 70;
        var tam = 0.6 + Math.random() * 0.9;
        document.body.appendChild(s);
        s.animate([
          { transform: 'translate(0,0) rotate(45deg) scale(' + tam + ')', opacity: 1 },
          { transform: 'translate(' + (Math.cos(ang) * dist) + 'px,' + (Math.sin(ang) * dist + 30) + 'px) rotate(' + (225 + Math.random() * 180) + 'deg) scale(0)', opacity: 0 }
        ], { duration: 700 + Math.random() * 400, easing: 'cubic-bezier(.16,1,.3,1)' }).onfinish = (function(el){
          return function(){ if (el.parentNode) el.parentNode.removeChild(el); };
        })(s);
      }
    });
  });
})();
