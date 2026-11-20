/* =====================================================================
   UNIPBRAS · Pacote 3 (grafismo.js)
   ===================================================================== */
(function(){
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';
  function safe(name, fn){ try{ fn(); }catch(e){ if (window.console) console.warn('[grafismo] ' + name, e); } }
  function $$(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------- Ícones (traço geométrico, na linguagem da marca) ---------- */
  function roda(){
    // pátio central e oito casas em triângulo ao redor: planta circular de aldeia
    var d = '';
    for (var i = 0; i < 8; i++){
      var a = i * Math.PI / 4, cx = 12 + Math.cos(a) * 8, cy = 12 + Math.sin(a) * 8;
      var p = function(da, r){ return (cx + Math.cos(a + da) * r).toFixed(2) + ' ' + (cy + Math.sin(a + da) * r).toFixed(2); };
      d += 'M' + p(0, 2.4) + ' L' + p(2.3, 2.4) + ' L' + p(-2.3, 2.4) + ' Z ';
    }
    return '<circle cx="12" cy="12" r="3"/><path d="' + d + '"/>';
  }
  var ICONES = {
    flecha: '<path d="M2 12h17"/><path d="M15 7.5 20.5 12 15 16.5"/><path d="M5 12 2.5 9M5 12l-2.5 3M8 12 5.5 9M8 12l-2.5 3"/>',
    broto: '<path d="M12 21v-8"/><path class="f f1" d="M12 13C12 9 9 7 5 7c0 4 3 6 7 6z"/><path class="f f2" d="M12 11c0-3.5 2.5-5.5 6.5-5.5 0 3.5-2.5 5.5-6.5 5.5z"/><path d="M7 21h10"/>',
    roda: roda()
  };
  function iconePara(btn){
    var href = (btn.getAttribute('href') || '');
    if (href === '#objetivos') return 'broto';
    if (href === '#associe') return 'roda';
    return 'flecha';
  }

  /* ---------- 1. Botões-conta ---------- */
  safe('botoes', function(){
    $$('.btn').forEach(function(btn){
      if (btn.classList.contains('gb')) return;
      btn.classList.add('gb');
      var nome = iconePara(btn);

      var fundo = document.createElement('span'); fundo.className = 'gb-fundo'; fundo.setAttribute('aria-hidden', 'true');
      var trama = document.createElement('span'); trama.className = 'gb-trama'; fundo.appendChild(trama);

      var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'gb-contorno'); svg.setAttribute('aria-hidden', 'true');
      var poly = document.createElementNS(NS, 'polygon'); svg.appendChild(poly);

      var ic = document.createElement('span'); ic.className = 'gb-icone gb-ic-' + nome; ic.setAttribute('aria-hidden', 'true');
      ic.innerHTML = '<svg viewBox="0 0 24 24">' + ICONES[nome] + '</svg>';

      // o texto continua sendo o mesmo nó (o tradutor do site segue funcionando)
      var texto = document.createElement('span'); texto.className = 'gb-texto';
      while (btn.firstChild) texto.appendChild(btn.firstChild);

      var franja = document.createElement('span'); franja.className = 'gb-franja'; franja.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < 9; i++){
        var t = document.createElement('i');
        t.style.transitionDelay = (Math.abs(i - 4) * 40) + 'ms';
        franja.appendChild(t);
      }
      btn.appendChild(fundo); btn.appendChild(svg); btn.appendChild(ic); btn.appendChild(texto); btn.appendChild(franja);

      function desenha(){
        var w = btn.offsetWidth, h = btn.offsetHeight, p = 20, k = 1.6;
        if (!w || !h) return;
        svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
        poly.setAttribute('points', [
          [p, k], [w - p, k], [w - k, h / 2], [w - p, h - k], [p, h - k], [k, h / 2]
        ].map(function(q){ return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' '));
      }
      desenha();
      if (window.ResizeObserver) new ResizeObserver(desenha).observe(btn);
      else window.addEventListener('resize', desenha);
    });
  });

  /* ---------- 2. Manifesto: frase do Estatuto acende com a rolagem ---------- */
  safe('manifesto', function(){
    var band = document.querySelector('.band-quote');
    var q = band && band.querySelector('.quote-text');
    if (!q) return;
    band.classList.add('mx-manifesto');
    var fill = document.createElement('span'); fill.className = 'mx-fill';
    while (q.firstChild) fill.appendChild(q.firstChild);
    q.appendChild(fill);
    // anel de triângulos da marca, reaproveitado do hero
    var ring = document.querySelector('.hero-ring-svg');
    if (ring){
      var anel = document.createElement('div'); anel.className = 'mx-manifesto-anel'; anel.setAttribute('aria-hidden', 'true');
      anel.appendChild(ring.cloneNode(true));
      band.querySelector('.band-inner').appendChild(anel);
    }
  });

  /* ---------- 3. Shader de grafismo (WebGL) na seção "Associe-se" ---------- */
  safe('shader', function(){
    var host = document.querySelector('#associe');
    if (!host) return;
    var cv = document.createElement('canvas'); cv.className = 'gb-shader'; cv.setAttribute('aria-hidden', 'true');
    var gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return;
    host.classList.add('gb-shader-host');
    host.insertBefore(cv, host.firstChild);

    var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    var FS = [
      'precision mediump float;',
      'uniform vec2 r;uniform float t;uniform vec2 m;',
      'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
      'void main(){',
      ' vec2 uv=gl_FragCoord.xy/r; float a=r.x/r.y;',
      ' vec3 base=vec3(.024,.165,.302);',
      // rio: faixas que ondulam devagar
      ' float w=sin(uv.x*3.2+t*.25+sin(uv.y*4.+t*.18)*1.6);',
      ' float rio=smoothstep(.75,1.,w)*.55+smoothstep(.85,1.,sin(uv.x*5.-t*.2+uv.y*3.))*.35;',
      ' vec3 col=base+vec3(.04,.12,.10)*rio;',
      // grade de triângulos alternados (grafismo da marca)
      ' vec2 g=vec2(uv.x*a,uv.y)*13.; float row=floor(g.y); g.x+=mod(row,2.)*.5;',
      ' vec2 id=vec2(floor(g.x),row); vec2 f=fract(g)-.5; float up=mod(id.x+row,2.)<1.?1.:-1.; f.y*=up;',
      ' float d=max(-f.y-.28,abs(f.x)*1.7+f.y-.22);',
      ' float edge=smoothstep(.035,.0,abs(d));',
      ' float fillT=smoothstep(.02,-.02,d);',
      ' vec2 mm=vec2((uv.x-m.x)*a,uv.y-m.y); float prox=exp(-length(mm)*3.2);',
      ' float onda=.5+.5*sin(h(id)*6.28+t*1.1-length(vec2((uv.x-.5)*a,uv.y-.5))*7.);',
      ' float brilho=step(.86,h(id+floor(t*.35)))*fillT*.35;',
      ' vec3 ouro=vec3(.91,.64,.09);',
      ' col+=ouro*edge*(.012+.028*onda+.32*prox);',
      ' col+=ouro*(brilho*.3+fillT*prox*.07);',
      ' col+=vec3(.30,.48,.18)*fillT*.03*onda;',
      ' float vin=smoothstep(1.25,.35,length((uv-.5)*vec2(1.,1.3)));',
      ' gl_FragColor=vec4(col*mix(.75,1.,vin),1.);',
      '}'
    ].join('\n');
    function sh(type, src){ var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr); gl.useProgram(pr);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uR = gl.getUniformLocation(pr, 'r'), uT = gl.getUniformLocation(pr, 't'), uM = gl.getUniformLocation(pr, 'm');

    var dpr = Math.min(window.devicePixelRatio || 1, 1.5), visivel = false, raf = 0, t0 = performance.now();
    var mx = .5, my = .5, tx = .5, ty = .5;
    function tamanho(){
      var w = host.clientWidth, h = host.clientHeight;
      cv.width = Math.max(1, Math.round(w * dpr)); cv.height = Math.max(1, Math.round(h * dpr));
      gl.viewport(0, 0, cv.width, cv.height);
      if (!raf) quadro(performance.now());
    }
    function quadro(now){
      mx += (tx - mx) * .06; my += (ty - my) * .06;
      gl.uniform2f(uR, cv.width, cv.height);
      gl.uniform1f(uT, reduce ? 4.0 : (now - t0) / 1000);
      gl.uniform2f(uM, mx, my);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = (visivel && !reduce) ? requestAnimationFrame(quadro) : 0;
    }
    host.addEventListener('pointermove', function(e){
      var r = host.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width; ty = 1 - (e.clientY - r.top) / r.height;
    }, { passive: true });
    host.addEventListener('pointerleave', function(){ tx = .5; ty = .5; });
    if (window.ResizeObserver) new ResizeObserver(tamanho).observe(host); else window.addEventListener('resize', tamanho);
    new IntersectionObserver(function(en){
      visivel = en[0].isIntersecting;
      if (visivel && !raf) raf = requestAnimationFrame(quadro);
    }).observe(host);
    tamanho();
  });
})();
