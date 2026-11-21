/* =====================================================================
   UNIPBRAS · Partículas que viram a logomarca
   Inspirado no "Cocar de luz" do site do CMDDI. Milhares de pequenos
   losangos e triângulos (o grafismo da marca) partem dispersos como
   sementes, se reúnem e formam a logomarca. Fogem do dedo ou do cursor
   e se espalham quando a seção sai da tela. Funciona também no celular.
   WebGL puro, sem dependências.
   ===================================================================== */
(function(){
  'use strict';
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var MOBILE = Math.min(screen.width, innerWidth) < 760;

  var VS = [
    'attribute vec2 aStart; attribute vec2 aTarget; attribute vec3 aColor; attribute vec2 aSeed;',
    'uniform vec2 uRes; uniform vec4 uRect; uniform vec2 uMouse; uniform float uTime, uProg, uScatter, uDpr, uFade, uRep, uOut, uSz;',
    'varying vec3 vColor; varying float vAlpha; varying float vShape; varying float vRot;',
    'void main(){',
    '  float s = aSeed.x; float amb = aSeed.y;',
    '  vec2 tgt = amb > .5 ? aTarget * uRes : uRect.xy + aTarget * uRect.zw;',
    '  float d = clamp(uProg * 1.7 - s * .55, 0., 1.);',
    '  float e = 1. - pow(1. - d, 3.);',
    '  vec2 p = mix(aStart, tgt, e);',
    '  float sw = 1. - e;',
    '  p += vec2(sin(uTime * 1.3 + s * 40.), cos(uTime * 1.1 + s * 33.)) * 60. * sw * sw;',
    '  p += vec2(sin(uTime * .7 + s * 21.), cos(uTime * .8 + s * 17.)) * (amb > .5 ? 22. : 1.4);',
    '  vec2 dm = p - uMouse; float dist = length(dm) + .001;',
    '  p += dm / dist * max(0., uRep - dist) * (amb > .5 ? .6 : .85);',
    '  float sc = uScatter * uScatter;',
    '  p += vec2((s - .5) * 900. + sin(s * 90. + uTime) * 40., -(260. + 520. * fract(s * 7.31))) * sc;',
    '  vec2 clip = (p / uRes) * 2. - 1.;',
    '  gl_Position = vec4(clip.x, -clip.y, 0., 1.);',
    '  float sz = amb > .5 ? 3. + 4. * fract(s * 13.7) : uSz + uSz * .8 * fract(s * 5.3);',
    '  gl_PointSize = sz * uDpr * (1. + sw * 2.4);',
    '  vColor = aColor; vShape = fract(s * 3.7); vRot = sw;',
    '  float tw = .55 + .45 * sin(uTime * 2.2 + s * 60.);',
    '  vAlpha = amb > .5 ? (.22 + .4 * tw) * smoothstep(0., .4, uProg) : mix(.95, uFade * (.6 + .4 * tw), smoothstep(.86, 1., uProg));',
    '  vAlpha *= (1. - sc * .7) * uOut;',
    '}'].join('\n');
  // cada partícula é um losango ou um triângulo (o grafismo da logomarca)
  var FS = [
    'precision mediump float; varying vec3 vColor; varying float vAlpha; varying float vShape; varying float vRot;',
    'void main(){',
    '  vec2 c = gl_PointCoord - .5;',
    '  float a;',
    '  if (vShape < .55){ a = smoothstep(.5, .38, abs(c.x) + abs(c.y)); }',
    '  else { float up = vShape < .8 ? 1. : -1.; float y = c.y * up;',
    '    a = smoothstep(.04, -.04, max(-y - .38, abs(c.x) * 1.15 + y * .58 - .2)); }',
    '  gl_FragColor = vec4(vColor * a * vAlpha, a * vAlpha);',
    '}'].join('\n');

  var PAL = [[.91,.64,.09],[.96,.77,.26],[.30,.48,.18],[.60,.23,.06],[.04,.24,.43]];

  function montar(host, img, cfg){
    var cv = document.createElement('canvas');
    cv.className = 'px-canvas'; cv.setAttribute('aria-hidden', 'true');
    var gl = cv.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true });
    if (!gl) return;
    function sh(t, src){ var s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); return s; }
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.insertBefore(cv, host.firstChild);
    host.classList.add('px-on');

    var U = {};
    ['uRes','uRect','uMouse','uTime','uProg','uScatter','uDpr','uFade','uRep','uOut','uSz'].forEach(function(n){ U[n] = gl.getUniformLocation(pr, n); });
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), rect = [0, 0, 1, 1];
    function alvo(){
      // posição real da logo (acompanha a animação de entrada do bloco)
      var hr = host.getBoundingClientRect(), er = img.getBoundingClientRect();
      rect = [er.left - hr.left, er.top - hr.top, er.width, er.height];
      return hr;
    }
    function medir(){
      var hr = alvo(); W = hr.width; H = hr.height;
      cv.width = Math.max(1, W * dpr); cv.height = Math.max(1, H * dpr);
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      gl.viewport(0, 0, cv.width, cv.height);
    }

    var fonte = new Image();
    fonte.onload = function(){
      var asp = fonte.naturalWidth / fonte.naturalHeight;
      var BASE = MOBILE ? 340 : 460;
      var SW = asp >= 1 ? BASE : Math.round(BASE * asp), SH = asp >= 1 ? Math.round(BASE / asp) : BASE;
      var c = document.createElement('canvas'); c.width = SW; c.height = SH;
      var x = c.getContext('2d'); x.drawImage(fonte, 0, 0, SW, SH);
      var px;
      try{ px = x.getImageData(0, 0, SW, SH).data; }catch(e){ cv.remove(); host.classList.remove('px-on'); return; }
      var cand = [];
      for (var yy = 0; yy < SH; yy++) for (var xx = 0; xx < SW; xx++){
        var i = (yy * SW + xx) * 4;
        if (px[i + 3] > 150 && !(px[i] > 240 && px[i + 1] > 240 && px[i + 2] > 240)) cand.push([xx, yy, px[i], px[i + 1], px[i + 2]]);
      }
      for (var k = cand.length - 1; k > 0; k--){ var j = Math.random() * (k + 1) | 0, t = cand[k]; cand[k] = cand[j]; cand[j] = t; }
      var NC = Math.min(cand.length, MOBILE ? cfg.nMob : cfg.n), NA = MOBILE ? 260 : 900, N = NC + NA;
      var st = new Float32Array(N * 2), tg = new Float32Array(N * 2), co = new Float32Array(N * 3), sd = new Float32Array(N * 2);
      medir();
      var cx = rect[0] + rect[2] / 2, cy = rect[1] + rect[3] / 2;
      for (var n = 0; n < N; n++){
        var ang = Math.random() * 6.283, rad = Math.max(W, H) * (.3 + Math.random() * .6);
        st[n * 2] = cx + Math.cos(ang) * rad; st[n * 2 + 1] = cy + Math.sin(ang) * rad;
        sd[n * 2] = Math.random();
        if (n < NC){
          var p = cand[n];
          tg[n * 2] = (p[0] + Math.random()) / SW; tg[n * 2 + 1] = (p[1] + Math.random()) / SH;
          co[n * 3] = p[2] / 255; co[n * 3 + 1] = p[3] / 255; co[n * 3 + 2] = p[4] / 255; sd[n * 2 + 1] = 0;
        } else {
          tg[n * 2] = Math.random(); tg[n * 2 + 1] = Math.random();
          var q = PAL[Math.random() * PAL.length | 0]; co[n * 3] = q[0]; co[n * 3 + 1] = q[1]; co[n * 3 + 2] = q[2]; sd[n * 2 + 1] = 1;
        }
      }
      function buf(name, arr, size){
        var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
        var l = gl.getAttribLocation(pr, name); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, size, gl.FLOAT, false, 0, 0);
      }
      buf('aStart', st, 2); buf('aTarget', tg, 2); buf('aColor', co, 3); buf('aSeed', sd, 2);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      var mouse = [-9999, -9999], t0 = 0, vis = false, iniciado = false, revelado = false, scat = 0, DUR = cfg.dur || 3600;
      function aponta(e){
        var hr = host.getBoundingClientRect();
        var pt = e.touches ? e.touches[0] : e;
        mouse = [pt.clientX - hr.left, pt.clientY - hr.top];
      }
      host.addEventListener('pointermove', aponta, { passive: true });
      host.addEventListener('pointerdown', aponta, { passive: true });
      host.addEventListener('touchmove', aponta, { passive: true });
      host.addEventListener('pointerleave', function(){ mouse = [-9999, -9999]; });
      host.addEventListener('touchend', function(){ setTimeout(function(){ mouse = [-9999, -9999]; }, 500); });
      addEventListener('resize', medir);
      addEventListener('scroll', function(){
        // só se espalha quando a própria logo sai pelo topo da tela
        var er = img.getBoundingClientRect();
        scat = Math.min(1, Math.max(0, (140 - er.top) / (window.innerHeight * .7)));
      }, { passive: true });

      function frame(now){
        if (!vis) return;
        if (!iniciado){ iniciado = true; t0 = now; medir(); }
        var el = now - t0, prog = Math.min(1, el / DUR);
        alvo();
        if (prog >= .97 && !revelado){ revelado = true; host.classList.add('px-revela'); }
        // depois de formada, a logo fica limpa: as partículas se apagam
        var sai = 1 - Math.min(1, Math.max(0, (el - DUR - 250) / 1100));
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(U.uRes, W, H); gl.uniform4f(U.uRect, rect[0], rect[1], rect[2], rect[3]);
        gl.uniform2f(U.uMouse, mouse[0], mouse[1]); gl.uniform1f(U.uTime, el / 1000);
        gl.uniform1f(U.uProg, prog); gl.uniform1f(U.uScatter, scat); gl.uniform1f(U.uDpr, dpr);
        gl.uniform1f(U.uFade, cfg.fade); gl.uniform1f(U.uRep, MOBILE ? 90 : 140); gl.uniform1f(U.uOut, sai); gl.uniform1f(U.uSz, cfg.sz || 1.6);
        gl.drawArrays(gl.POINTS, 0, N);
        if (sai <= 0){ gl.clear(gl.COLOR_BUFFER_BIT); cv.style.display = 'none'; return; }
        requestAnimationFrame(frame);
      }
      var espera = !!document.getElementById('un-ab');
      if (espera) addEventListener('abertura-fim', function(){ espera = false; }, { once: true });
      new IntersectionObserver(function(es){
        var on = es[0].isIntersecting;
        if (on && espera){ // espera a abertura terminar
          addEventListener('abertura-fim', function(){ setTimeout(function(){ vis = true; requestAnimationFrame(frame); }, 300); }, { once: true });
          return;
        }
        var era = vis; vis = on;
        if (vis && !era) requestAnimationFrame(frame);
      }, { threshold: cfg.limiar || 0.3 }).observe(host);
    };
    fonte.src = img.currentSrc || img.src;
  }

  function iniciar(){
    // 1. Nossa marca: a logomarca oficial nasce das partículas
    var logo = document.querySelector('#marca .marca-logo-img');
    if (logo) montar(document.querySelector('#marca'), logo, { n: 11000, nMob: 4200, fade: .5, dur: 3800, limiar: .3 });
    // 2. Rodapé: o selo se forma como assinatura final
    var pe = document.querySelector('.footer-brand img');
    if (pe) montar(document.querySelector('.footer'), pe, { n: 3600, nMob: 1800, fade: .5, dur: 3000, limiar: .4 });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
