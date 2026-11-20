/* =====================================================================
   UNIPBRAS · Pacote 4 (leque.js)
   Efeitos da abertura do CMDDI usados dentro do site.
   ===================================================================== */
(function(){
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';
  var CORES = ['#E8A317', '#4C7A2E', '#9A3A0F', '#0A3D6E'];
  function safe(n, f){ try{ f(); }catch(e){ if (window.console) console.warn('[leque] ' + n, e); } }
  function $$(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function quandoVisivel(el, fn, limiar){
    if (!('IntersectionObserver' in window)){ fn(); return; }
    var io = new IntersectionObserver(function(en){
      if (!en[0].isIntersecting) return; io.disconnect(); fn();
    }, { threshold: limiar || 0.25 });
    io.observe(el);
  }

  /* 1. Transição do menu em losango */
  safe('losango', function(){
    if (reduce) return;
    var ov = document.createElement('div');
    ov.className = 'lq-losango'; ov.setAttribute('aria-hidden', 'true'); ov.style.display = 'none';
    var tri = '';
    for (var i = 0; i < 12; i++){
      tri += '<i style="--c:' + CORES[i % 4] + ';transform:rotate(' + (i * 30) + 'deg) translate(-7px,-44px)"></i>';
    }
    ov.innerHTML =
      '<svg class="lq-tela" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><mask id="lqMask">' +
      '<rect width="100" height="100" fill="#fff"/><polygon class="lq-furo" points="50,-60 160,50 50,160 -60,50" fill="#000"/>' +
      '</mask></defs><rect class="lq-fundo" width="100" height="100" mask="url(#lqMask)"/></svg>' +
      '<div class="lq-centro">' + tri + '</div>';
    document.body.appendChild(ov);
    var furo = ov.querySelector('.lq-furo'), ocupado = false;

    document.addEventListener('click', function(e){
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || ocupado) return;
      var id = a.getAttribute('href');
      if (!id || id.length < 2 || !document.querySelector(id)) return;
      ocupado = true;
      // no destino, o losango já faz a revelação: dispensa as fileiras daquela seção
      var alvo = document.querySelector(id);
      var fil = alvo && alvo.querySelector(':scope > .mx-fileiras');
      if (fil) fil.parentNode.removeChild(fil);
      ov.style.display = 'block';
      // fecha: o losango encolhe até a tela ficar escura
      var fecha = furo.animate([{ transform: 'scale(1)' }, { transform: 'scale(0)' }],
        { duration: 420, easing: 'cubic-bezier(.7,0,.3,1)', fill: 'forwards' });
      fecha.onfinish = function(){
        ov.classList.add('lq-meio');
        setTimeout(function(){
          ov.classList.remove('lq-meio');
          // abre: o losango cresce e revela a seção de destino
          var abre = furo.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }],
            { duration: 1050, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' });
          abre.onfinish = function(){ ov.style.display = 'none'; ocupado = false; };
        }, 650);
      };
    });
  });

  /* 2. Leque: diretoria, organizações irmãs e filtros da legislação */
  safe('leque', function(){
    if (reduce) return;
    ['.roster-grid', '.parceiros-grid', '.leg-filtros'].forEach(function(sel){
      $$(sel).forEach(function(g){
        var kids = Array.prototype.slice.call(g.children);
        if (kids.length < 2) return;
        var gr = g.getBoundingClientRect();
        if (gr.top < window.innerHeight && gr.bottom > 0) return; // já na tela
        var cx = gr.left + gr.width / 2, by = gr.bottom, n = kids.length, mid = (n - 1) / 2;
        var abertura = Math.min(126, 21 * (n - 1));
        kids.forEach(function(k, i){
          var r = k.getBoundingClientRect();
          k.style.setProperty('--lq-dx', (cx - (r.left + r.width / 2)) + 'px');
          k.style.setProperty('--lq-dy', (by - r.bottom) + 'px');
          k.style.setProperty('--lq-a', (n > 1 ? (-abertura / 2 + abertura * i / (n - 1)) : 0) + 'deg');
          k.style.setProperty('--lq-d', (0.1 + Math.abs(i - mid) * 0.12).toFixed(2) + 's');
        });
        g.classList.add('lq-leque-pronto');
        quandoVisivel(g, function(){
          requestAnimationFrame(function(){ g.classList.add('lq-leque-abre'); });
          var total = 1400 + (0.1 + mid * 0.12) * 1000 + 100;
          setTimeout(function(){
            g.classList.remove('lq-leque-pronto', 'lq-leque-abre');
            kids.forEach(function(k){ ['--lq-dx', '--lq-dy', '--lq-a', '--lq-d'].forEach(function(v){ k.style.removeProperty(v); }); });
          }, total);
        }, 0.2);
      });
    });
  });

  /* 3. Traço que se desenha e depois se preenche */
  safe('traco', function(){
    if (reduce || !Element.prototype.animate) return;
    var grupos = [
      { host: '#objetivos', alvos: '.obj-icon svg path, .obj-icon svg circle, .obj-icon svg rect' },
      { host: '#marca', alvos: '.emblem-beads path' },
      { host: '#legislacao', alvos: '.leg-filtro-dot svg path' }
    ];
    grupos.forEach(function(gp){
      var host = document.querySelector(gp.host);
      if (!host) return;
      var formas = $$(gp.alvos, host).filter(function(f){ return typeof f.getTotalLength === 'function'; });
      if (!formas.length) return;
      var prep = formas.map(function(f){
        var cs = getComputedStyle(f), len = 0;
        try{ len = f.getTotalLength(); }catch(e){}
        if (!len) return null;
        var corTraco = cs.stroke !== 'none' ? cs.stroke : cs.fill;
        return { f: f, len: len, stroke: f.getAttribute('stroke'), sw: f.getAttribute('stroke-width'),
                 corTraco: corTraco, fillOp: cs.fillOpacity };
      }).filter(Boolean);
      prep.forEach(function(p){
        p.f.style.stroke = p.corTraco; if (!p.sw) p.f.style.strokeWidth = '1.6';
        p.f.style.strokeDasharray = p.len; p.f.style.strokeDashoffset = p.len;
        p.f.style.fillOpacity = '0';
      });
      quandoVisivel(host, function(){
        prep.forEach(function(p, i){
          var d = (i % 24) * 45;
          p.f.animate([{ strokeDashoffset: p.len }, { strokeDashoffset: 0 }],
            { duration: 1000, delay: d, easing: 'ease', fill: 'forwards' });
          var enche = p.f.animate([{ fillOpacity: 0 }, { fillOpacity: p.fillOp }],
            { duration: 500, delay: d + 1000, easing: 'ease', fill: 'forwards' });
          enche.onfinish = function(){
            p.f.getAnimations().forEach(function(an){ an.cancel(); });
            ['stroke', 'strokeWidth', 'strokeDasharray', 'strokeDashoffset', 'fillOpacity'].forEach(function(k){ p.f.style[k] = ''; });
          };
        });
      }, 0.15);
    });
  });

  /* 4 e 5. Halo, poeira dourada e arcos duplos nos títulos de seção */
  safe('titulos', function(){
    $$('.section-title').forEach(function(t){
      var arco = document.createElementNS(NS, 'svg');
      arco.setAttribute('class', 'lq-arco'); arco.setAttribute('viewBox', '0 0 168 24'); arco.setAttribute('aria-hidden', 'true');
      arco.innerHTML = '<path class="a1" d="M4 14 Q84 -4 164 14"/><path class="a2" d="M24 22 Q84 8 144 22"/>';
      t.classList.add('lq-tem-arco');
      t.parentNode.insertBefore(arco, t.nextSibling);
      if (reduce){ arco.classList.add('on'); return; }

      // halo e poeira ficam numa camada irmã do título (o título tem máscara, que cortaria a poeira)
      var fx = document.createElement('span'); fx.className = 'lq-fx'; fx.setAttribute('aria-hidden', 'true');
      fx.style.cssText = 'position:absolute;pointer-events:none;z-index:0';
      var halo = document.createElement('span'); halo.className = 'lq-halo';
      var poeira = document.createElement('span'); poeira.className = 'lq-poeira';
      fx.appendChild(halo); fx.appendChild(poeira);
      var pai = t.parentNode;
      if (getComputedStyle(pai).position === 'static') pai.style.position = 'relative';
      pai.insertBefore(fx, t);

      quandoVisivel(t, function(){
        fx.style.left = t.offsetLeft + 'px'; fx.style.top = t.offsetTop + 'px';
        fx.style.width = t.offsetWidth + 'px'; fx.style.height = t.offsetHeight + 'px';
        arco.classList.add('on');
        halo.classList.add('on');
        var w = t.offsetWidth;
        for (var i = 0; i < 22; i++){
          var s = document.createElement('i');
          s.style.left = (Math.random() * Math.min(w, 560)) + 'px';
          s.style.top = (40 + Math.random() * 50) + '%';
          s.style.setProperty('--x', ((Math.random() - .5) * 140) + 'px');
          s.style.setProperty('--y', (-50 - Math.random() * 130) + 'px');
          s.style.animationDelay = (0.2 + Math.random() * 1.2) + 's';
          poeira.appendChild(s);
        }
        setTimeout(function(){ poeira.innerHTML = ''; }, 4200);
      }, 0.4);
    });
  });
})();
