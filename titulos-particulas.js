/* =====================================================================
   UNIPBRAS · Títulos que nascem de partículas
   Três títulos-chave se formam a partir de losangos e triângulos.
   Uma única camada WebGL serve a todos (um título por vez). O texto real
   continua na página: as partículas desenham por cima e se apagam, e o
   título verdadeiro aparece no lugar (leitores de tela, Google e o
   tradutor PT/EN/ES/FR seguem funcionando).
   ===================================================================== */
(function(){
  'use strict';
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var ALVOS = ['#objetivos .section-title', '#associadas .section-title', '#associe .section-title'];
  var titulos = ALVOS.map(function(s){ return document.querySelector(s); }).filter(Boolean);
  if (!titulos.length) return;

  var MOBILE = Math.min(screen.width, innerWidth) < 760;
  var cv = document.createElement('canvas');
  cv.className = 'pt-camada'; cv.setAttribute('aria-hidden', 'true');
  var gl = cv.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true });
  if (!gl) return;

  var VS = [
    'attribute vec2 aStart; attribute vec2 aTarget; attribute vec3 aColor; attribute float aSeed;',
    'uniform vec2 uRes; uniform vec2 uOrig; uniform vec2 uMouse; uniform float uTime, uProg, uDpr, uOut, uSz;',
    'varying vec3 vColor; varying float vAlpha; varying float vShape;',
    'void main(){',
    '  float s = aSeed;',
    '  float d = clamp(uProg * 1.7 - s * .55, 0., 1.);',
    '  float e = 1. - pow(1. - d, 3.);',
    '  vec2 tgt = uOrig + aTarget;',
    '  vec2 p = mix(uOrig + aStart, tgt, e);',
    '  float sw = 1. - e;',
    '  p += vec2(sin(uTime * 1.4 + s * 40.), cos(uTime * 1.2 + s * 33.)) * 46. * sw * sw;',
    '  vec2 dm = p - uMouse; float dist = length(dm) + .001;',
    '  p += dm / dist * max(0., 90. - dist) * .7;',
    '  vec2 clip = (p / uRes) * 2. - 1.;',
    '  gl_Position = vec4(clip.x, -clip.y, 0., 1.);',
    '  gl_PointSize = (uSz + uSz * .7 * fract(s * 5.3)) * uDpr * (1. + sw * 2.6);',
    '  vColor = aColor; vShape = fract(s * 3.7);',
    '  vAlpha = smoothstep(0., .12, uProg) * uOut;',
    '}'].join('\n');
  var FS = [
    'precision mediump float; varying vec3 vColor; varying float vAlpha; varying float vShape;',
    'void main(){',
    '  vec2 c = gl_PointCoord - .5; float a;',
    '  if (vShape < .55){ a = smoothstep(.5, .38, abs(c.x) + abs(c.y)); }',
    '  else { float up = vShape < .8 ? 1. : -1.; float y = c.y * up;',
    '    a = smoothstep(.04, -.04, max(-y - .38, abs(c.x) * 1.15 + y * .58 - .2)); }',
    '  gl_FragColor = vec4(vColor * a * vAlpha, a * vAlpha);',
    '}'].join('\n');
  function sh(t, src){ var s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); return s; }
  var pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  var U = {};
  ['uRes','uOrig','uMouse','uTime','uProg','uDpr','uOut','uSz'].forEach(function(n){ U[n] = gl.getUniformLocation(pr, n); });
  var B = {};
  ['aStart','aTarget','aColor','aSeed'].forEach(function(n){ B[n] = { b: gl.createBuffer(), l: gl.getAttribLocation(pr, n) }; });
  function envia(n, arr, size){
    gl.bindBuffer(gl.ARRAY_BUFFER, B[n].b); gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(B[n].l); gl.vertexAttribPointer(B[n].l, size, gl.FLOAT, false, 0, 0);
  }

  document.body.appendChild(cv);
  var dpr = Math.min(window.devicePixelRatio || 1, 2), W = 0, H = 0;
  function tamanho(){
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    gl.viewport(0, 0, cv.width, cv.height);
  }
  tamanho(); addEventListener('resize', tamanho);
  var mouse = [-9999, -9999];
  addEventListener('pointermove', function(e){ mouse = [e.clientX, e.clientY]; }, { passive: true });
  addEventListener('pointerdown', function(e){ mouse = [e.clientX, e.clientY]; }, { passive: true });

  // os títulos ficam guardados até as partículas os formarem
  titulos.forEach(function(t){ t.classList.add('pt-espera'); });
  function libera(t){ t.classList.remove('pt-espera'); t.classList.add('pt-pronto'); }

  /* Desenha o título exatamente como está na página (palavra por palavra,
     na mesma posição em que o navegador quebrou as linhas) e colhe os pixels. */
  function amostra(t){
    var tr = t.getBoundingClientRect();
    var esc = MOBILE ? 1.4 : 1.6, pad = 20;
    var w = Math.ceil(tr.width + pad * 2), h = Math.ceil(tr.height + pad * 2);
    var c = document.createElement('canvas'); c.width = Math.ceil(w * esc); c.height = Math.ceil(h * esc);
    var x = c.getContext('2d', { willReadFrequently: true }); x.scale(esc, esc); x.textBaseline = 'alphabetic'; x.fillStyle = '#000';
    var tw = document.createTreeWalker(t, NodeFilter.SHOW_TEXT), no, rg = document.createRange();
    while ((no = tw.nextNode())){
      var cs = getComputedStyle(no.parentElement);
      x.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      var m = x.measureText('Hg'), asc = m.actualBoundingBoxAscent || parseFloat(cs.fontSize) * .75,
          desc = m.actualBoundingBoxDescent || parseFloat(cs.fontSize) * .22;
      var re = /\S+/g, mt;
      while ((mt = re.exec(no.nodeValue))){
        rg.setStart(no, mt.index); rg.setEnd(no, mt.index + mt[0].length);
        var rs = rg.getClientRects(); if (!rs.length) continue;
        var r = rs[0];
        var base = r.top + (r.height + asc - desc) / 2;
        x.fillText(mt[0], r.left - tr.left + pad, base - tr.top + pad);
      }
    }
    var px = x.getImageData(0, 0, c.width, c.height).data, pts = [];
    for (var yy = 0; yy < c.height; yy++) for (var xx = 0; xx < c.width; xx++){
      if (px[(yy * c.width + xx) * 4 + 3] > 120) pts.push([xx / esc - pad, yy / esc - pad]);
    }
    return { pts: pts, w: tr.width, h: tr.height };
  }

  var fila = [], rodando = false;
  function proximo(){
    if (rodando || !fila.length) return;
    var t = fila.shift(); rodando = true;
    var dados;
    try{ dados = amostra(t); }catch(e){ libera(t); rodando = false; proximo(); return; }
    var pts = dados.pts;
    for (var k = pts.length - 1; k > 0; k--){ var j = Math.random() * (k + 1) | 0, q = pts[k]; pts[k] = pts[j]; pts[j] = q; }
    var N = Math.min(pts.length, MOBILE ? 2600 : 5200);
    if (N < 50){ libera(t); rodando = false; proximo(); return; }
    var st = new Float32Array(N * 2), tg = new Float32Array(N * 2), co = new Float32Array(N * 3), sd = new Float32Array(N);
    var escuro = !!t.closest('.section-dark');
    // cores do grafismo: do terracota ao ouro e ao verde, ao longo da linha (no fundo azul, ouro e creme)
    var A = escuro ? [.98,.95,.88] : [.60,.23,.06], M = [.91,.64,.09], Z = escuro ? [.96,.77,.26] : [.11,.30,.12];
    for (var n = 0; n < N; n++){
      var p = pts[n], f = Math.max(0, Math.min(1, p[0] / Math.max(1, dados.w)));
      tg[n * 2] = p[0]; tg[n * 2 + 1] = p[1];
      var ang = Math.random() * 6.283, rad = Math.max(dados.w, 240) * (.4 + Math.random() * .9);
      st[n * 2] = dados.w / 2 + Math.cos(ang) * rad; st[n * 2 + 1] = dados.h / 2 + Math.sin(ang) * rad * .7;
      var a = f < .5 ? A : M, b = f < .5 ? M : Z, u = f < .5 ? f * 2 : (f - .5) * 2;
      var jit = (Math.random() - .5) * .12;
      co[n * 3] = a[0] + (b[0] - a[0]) * u + jit; co[n * 3 + 1] = a[1] + (b[1] - a[1]) * u + jit; co[n * 3 + 2] = a[2] + (b[2] - a[2]) * u + jit;
      sd[n] = Math.random();
    }
    envia('aStart', st, 2); envia('aTarget', tg, 2); envia('aColor', co, 3); envia('aSeed', sd, 1);
    cv.style.display = 'block';
    var t0 = performance.now(), DUR = 2600, liberado = false;
    function quadro(now){
      var el = now - t0, prog = Math.min(1, el / DUR);
      var r = t.getBoundingClientRect();
      if (prog >= .97 && !liberado){ liberado = true; libera(t); }
      var sai = 1 - Math.min(1, Math.max(0, (el - DUR - 150) / 900));
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(U.uRes, W, H); gl.uniform2f(U.uOrig, r.left, r.top); gl.uniform2f(U.uMouse, mouse[0], mouse[1]);
      gl.uniform1f(U.uTime, el / 1000); gl.uniform1f(U.uProg, prog); gl.uniform1f(U.uDpr, dpr);
      gl.uniform1f(U.uOut, sai); gl.uniform1f(U.uSz, MOBILE ? 1.5 : 1.4);
      gl.drawArrays(gl.POINTS, 0, N);
      if (sai > 0) requestAnimationFrame(quadro);
      else { gl.clear(gl.COLOR_BUFFER_BIT); cv.style.display = 'none'; rodando = false; proximo(); }
    }
    requestAnimationFrame(quadro);
  }

  function observa(){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(en){
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        fila.push(en.target); proximo();
      });
    }, { threshold: .9, rootMargin: '-15% 0px -15% 0px' });
    titulos.forEach(function(t){ io.observe(t); });
  }
  var pronto = function(){ observa(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(pronto, pronto); else pronto();
  // se o título estiver visível e preso por mais de 7 s, libera
  setInterval(function(){
    titulos.forEach(function(t){
      if (!t.classList.contains('pt-espera')) return;
      var r = t.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0){
        t._ptVis = (t._ptVis || 0) + 1;
        if (t._ptVis > 7) libera(t);
      }
    });
  }, 1000);
})();
