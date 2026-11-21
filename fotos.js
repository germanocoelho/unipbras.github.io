/* =====================================================================
   UNIPBRAS · Fotografias (fotos.js)
   Revelação em losango do mosaico, toque no celular e tela cheia.
   ===================================================================== */
(function(){
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mos = document.querySelector('.ft-mosaico');
  if (!mos) return;
  var itens = Array.prototype.slice.call(mos.querySelectorAll('.ft-item'));

  // revelação em losango, um depois do outro (observa a grade, não as fotos recortadas)
  itens.forEach(function(it, i){ it.style.setProperty('--ft-d', (i * 0.11).toFixed(2) + 's'); });
  if (reduce || !('IntersectionObserver' in window)) mos.classList.add('on');
  else {
    var io = new IntersectionObserver(function(es){
      if (!es[0].isIntersecting) return; io.disconnect(); mos.classList.add('on');
      setTimeout(function(){ itens.forEach(function(it){ it.style.removeProperty('--ft-d'); }); }, 2600);
    }, { threshold: 0.12 });
    io.observe(mos);
    setTimeout(function(){ mos.classList.add('on'); }, 15000); // rede de segurança
  }

  // tela cheia
  var lb = document.createElement('div');
  lb.className = 'ft-lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Foto em tela cheia');
  lb.innerHTML = '<button type="button" class="ft-fecha" aria-label="Fechar">&times;</button>' +
    '<button type="button" class="ft-ant" aria-label="Foto anterior">&#8249;</button>' +
    '<button type="button" class="ft-prox" aria-label="Próxima foto">&#8250;</button>' +
    '<figure><img alt=""><figcaption><b></b><small></small></figcaption></figure>';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector('img'), lbB = lb.querySelector('figcaption b'), lbS = lb.querySelector('figcaption small');
  var atual = 0, voltar = null;
  function mostra(i){
    atual = (i + itens.length) % itens.length;
    var it = itens[atual], img = it.querySelector('img');
    lbImg.style.animation = 'none'; void lbImg.offsetWidth; lbImg.style.animation = '';
    lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt;
    lbB.textContent = it.querySelector('figcaption b').textContent;
    lbS.innerHTML = it.querySelector('figcaption small').innerHTML;
  }
  function abre(i){ voltar = document.activeElement; mostra(i); lb.classList.add('on'); document.documentElement.style.overflow = 'hidden'; lb.querySelector('.ft-fecha').focus(); }
  function fecha(){ lb.classList.remove('on'); document.documentElement.style.overflow = ''; if (voltar) voltar.focus(); }
  itens.forEach(function(it, i){
    it.tabIndex = 0; it.setAttribute('role', 'button');
    it.setAttribute('aria-label', 'Ampliar: ' + it.querySelector('figcaption b').textContent);
    it.addEventListener('click', function(e){ if (e.target.closest('a')) return; abre(i); });
    it.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); abre(i); } });
    it.addEventListener('pointerdown', function(e){
      if (e.pointerType === 'mouse') return;
      it.classList.add('ft-toque'); clearTimeout(it._t); it._t = setTimeout(function(){ it.classList.remove('ft-toque'); }, 1600);
    }, { passive: true });
  });
  lb.querySelector('.ft-fecha').addEventListener('click', fecha);
  lb.querySelector('.ft-ant').addEventListener('click', function(){ mostra(atual - 1); });
  lb.querySelector('.ft-prox').addEventListener('click', function(){ mostra(atual + 1); });
  lb.addEventListener('click', function(e){ if (e.target === lb) fecha(); });
  document.addEventListener('keydown', function(e){
    if (!lb.classList.contains('on')) return;
    if (e.key === 'Escape') fecha();
    if (e.key === 'ArrowLeft') mostra(atual - 1);
    if (e.key === 'ArrowRight') mostra(atual + 1);
  });
  // deslizar o dedo para trocar de foto
  var x0 = null;
  lb.addEventListener('touchstart', function(e){ x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function(e){
    if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) mostra(atual + (dx < 0 ? 1 : -1));
  });
})();
