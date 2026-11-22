/* =====================================================================
   UNIPBRAS · Medalhão 3D da abertura (hero3d.js)
   3D nativo do navegador (CSS 3D, sem bibliotecas): o emblema é uma
   moeda com espessura que balança no espaço; uma coroa de triângulos do
   grafismo gira inclinada ao redor, passando na frente e atrás dele;
   um anel de contas gira em outro plano. A cena inclina com o mouse,
   com o dedo e com a inclinação do celular.
   ===================================================================== */
(function(){
  'use strict';
  var med = document.querySelector('.hero-medalha');
  if (!med || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  var test = document.createElement('div').style;
  if (!('transformStyle' in test) && !('webkitTransformStyle' in test)) return;

  var CORES = ['#1B4D1F', '#E8A317', '#9A3A0F', '#0A3D6E'];
  var emb = med.querySelector('.hero-emblema');
  var src = emb ? emb.getAttribute('src') : 'imgs/unipbras-emblema.webp?v=2';

  var cena = document.createElement('div'); cena.className = 'm3-cena';

  // coroa de triângulos em pé sobre um anel inclinado
  function orbita(cls, n, raio, fazer){
    var o = document.createElement('div'); o.className = 'm3-orbita ' + cls;
    for (var i = 0; i < n; i++){
      var el = fazer(i); el.dataset.ang = 360 * i / n;
      o.appendChild(el);
    }
    return o;
  }
  var coroa = orbita('m3-coroa', 24, 50, function(i){
    var t = document.createElement('span'); t.className = 'm3-tri' + (i % 2 ? ' inv' : '');
    t.style.background = CORES[i % 4]; t.dataset.extra = 'rotateX(-90deg)'; return t;
  });
  var contas = orbita('m3-contas', 36, 50, function(i){
    var c = document.createElement('span'); c.className = 'm3-conta'; c.style.background = i % 3 ? '#B5790C' : '#F5C542'; return c;
  });

  // moeda: frente, verso e borda com espessura
  var moeda = document.createElement('div'); moeda.className = 'm3-moeda';
  for (var k = 0; k < 14; k++){
    var d = document.createElement('span'); d.className = 'm3-borda';
    d.style.transform = 'translateZ(' + (-7 + k) + 'px)'; moeda.appendChild(d);
  }
  var frente = new Image(); frente.src = src; frente.alt = ''; frente.className = 'm3-face m3-frente';
  var verso = new Image(); verso.src = src; verso.alt = ''; verso.className = 'm3-face m3-verso';
  moeda.appendChild(verso); moeda.appendChild(frente);

  var brilho = document.createElement('span'); brilho.className = 'm3-brilho'; moeda.appendChild(brilho);

  cena.appendChild(contas); cena.appendChild(moeda); cena.appendChild(coroa);
  // posiciona as peças em pixels (o raio depende do tamanho do medalhão)
  function dispoe(){
    [coroa, contas].forEach(function(o){
      var raio = o.offsetWidth / 2;
      Array.prototype.forEach.call(o.children, function(el){
        el.style.transform = 'rotateZ(' + el.dataset.ang + 'deg) translateY(' + (-raio).toFixed(1) + 'px) ' + (el.dataset.extra || '');
      });
    });
  }
  med.appendChild(cena);
  med.classList.add('m3d');
  dispoe(); addEventListener('resize', dispoe);
  if (window.ResizeObserver) new ResizeObserver(dispoe).observe(med);

  // inclinação da cena: mouse, dedo e giroscópio
  var alvoX = 0, alvoY = 0, x = 0, y = 0, raf = 0;
  function anima(){
    x += (alvoX - x) * 0.08; y += (alvoY - y) * 0.08;
    cena.style.setProperty('--tx', x.toFixed(2) + 'deg'); cena.style.setProperty('--ty', y.toFixed(2) + 'deg');
    brilho.style.setProperty('--bx', (50 + y * 2.2).toFixed(1) + '%'); brilho.style.setProperty('--by', (35 - x * 2).toFixed(1) + '%');
    raf = (Math.abs(alvoX - x) + Math.abs(alvoY - y) > 0.05) ? requestAnimationFrame(anima) : 0;
  }
  function mira(cx, cy){
    var r = med.getBoundingClientRect();
    var nx = (cx - (r.left + r.width / 2)) / (window.innerWidth / 2), ny = (cy - (r.top + r.height / 2)) / (window.innerHeight / 2);
    alvoY = Math.max(-1, Math.min(1, nx)) * 18; alvoX = Math.max(-1, Math.min(1, ny)) * -14;
    if (!raf) raf = requestAnimationFrame(anima);
  }
  var hero = med.closest('.hero') || document;
  hero.addEventListener('pointermove', function(e){ mira(e.clientX, e.clientY); }, {passive: true});
  hero.addEventListener('pointerleave', function(){ alvoX = alvoY = 0; if (!raf) raf = requestAnimationFrame(anima); });
  window.addEventListener('deviceorientation', function(e){
    if (e.gamma == null) return;
    alvoY = Math.max(-18, Math.min(18, e.gamma * 0.6)); alvoX = Math.max(-14, Math.min(14, (e.beta - 45) * -0.4));
    if (!raf) raf = requestAnimationFrame(anima);
  }, {passive: true});

  // pausa quando a abertura sai da tela
  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(es){ med.classList.toggle('m3-pausa', !es[0].isIntersecting); }).observe(med);
  }
})();
