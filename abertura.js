/* UNIPBRAS | Abertura "Da semente à colheita"
   Uma semente dourada cai na terra, lança raízes e brota; a borda de triângulos
   da logomarca se forma em roda, as ondas de terra, sol e rio atravessam o centro
   e o selo se revela. A tela se abre em fileiras, como uma roça. Aparece em toda entrada. */
(function(){
  var reduz = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var css = [
  '#un-ab{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;cursor:pointer;overflow:hidden}',
  '#un-ab .fileiras{position:absolute;inset:0;display:flex}',
  '#un-ab .fileiras i{flex:1;margin-right:-1px;background:linear-gradient(180deg,#0F3312 0%,#123c16 62%,#2a1608 100%);transition:transform 1s cubic-bezier(.75,0,.2,1)}',
  '#un-ab.sai .fileiras i:nth-child(odd){transform:translateY(102%)}',
  '#un-ab.sai .fileiras i:nth-child(even){transform:translateY(-102%)}',
  '#un-ab .palco{position:relative;display:grid;justify-items:center;gap:16px;transition:opacity .45s,transform .9s cubic-bezier(.7,0,.2,1)}',
  '#un-ab.sai .palco{opacity:0;transform:scale(1.25)}',
  '#un-ab svg.cena{width:min(420px,84vw);overflow:visible}',
  '@keyframes unTraco{to{stroke-dashoffset:0}}@keyframes unOp{to{opacity:1}}@keyframes unSome{to{opacity:0}}',
  '#un-ab .chao{fill:none;stroke:#9A3A0F;stroke-width:2;stroke-dasharray:420;stroke-dashoffset:420;animation:unTraco .8s ease .1s forwards,unSome .5s ease 2.4s forwards}',
  '#un-ab .semente{fill:#E8A317;transform:translateY(-260px);animation:unCai .7s cubic-bezier(.6,0,.9,.6) .3s forwards,unSome .4s ease 2.4s forwards}',
  '@keyframes unCai{to{transform:none}}',
  '#un-ab .raiz{fill:none;stroke:#C98B4A;stroke-width:1.6;stroke-linecap:round;stroke-dasharray:120;stroke-dashoffset:120;animation:unTraco .8s ease 1s forwards,unSome .5s ease 2.4s forwards}',
  '#un-ab .caule{fill:none;stroke:#4C7A2E;stroke-width:4;stroke-linecap:round;stroke-dasharray:120;stroke-dashoffset:120;animation:unTraco .7s ease 1.15s forwards,unSome .5s ease 2.4s forwards}',
  '#un-ab .folha{fill:#4C7A2E;transform-box:fill-box;transform:scale(0);animation:unFolha .5s cubic-bezier(.3,1.5,.5,1) forwards,unSome .5s ease 2.4s forwards}',
  '#un-ab .folha.e{transform-origin:100% 100%;animation-delay:1.6s,2.4s}#un-ab .folha.d{transform-origin:0 100%;animation-delay:1.75s,2.4s}',
  '@keyframes unFolha{to{transform:scale(1)}}',
  '#un-ab .borda{fill:none;stroke:#E8A317;stroke-width:3;stroke-dasharray:1000;stroke-dashoffset:1000;animation:unTraco 1.1s cubic-bezier(.6,0,.2,1) 1.9s forwards}',
  '#un-ab .tri{opacity:0;transform-box:fill-box;transform-origin:center;transform:scale(0);animation:unTri .35s cubic-bezier(.3,1.6,.5,1) forwards}',
  '@keyframes unTri{to{opacity:1;transform:scale(1)}}',
  '#un-ab .onda{fill:none;stroke-width:13;stroke-linecap:round;stroke-dasharray:420;stroke-dashoffset:420;animation:unTraco .9s cubic-bezier(.5,0,.2,1) forwards}',
  '#un-ab .selo{opacity:0;transform-box:fill-box;transform-origin:center;transform:scale(.9);animation:unSelo 1s ease 3.2s forwards}',
  '@keyframes unSelo{to{opacity:1;transform:none}}',
  '#un-ab .luz{opacity:0;animation:unOp 1.2s ease 2.8s forwards}',
  '#un-ab .nome{text-align:center;opacity:0;transform:translateY(14px);animation:unNome .9s ease 3.4s forwards}',
  '@keyframes unNome{to{opacity:1;transform:none}}',
  '#un-ab .nome b{display:block;font-family:Fraunces,Georgia,serif;font-weight:900;font-size:clamp(2.2rem,6.4vw,3.6rem);letter-spacing:.04em;line-height:1}',
  '#un-ab .nome b .u{color:#D9632A}#un-ab .nome b .b{color:#3B86D6}',
  '#un-ab .nome em{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:6px;font:600 clamp(.72rem,1.8vw,.9rem)/1 "Work Sans",system-ui,sans-serif;font-style:normal;letter-spacing:.4em;padding-left:.4em;color:#E8A317}',
  '#un-ab .nome em:before,#un-ab .nome em:after{content:"";width:46px;height:1px;background:#E8A317}',
  '#un-ab .nome > span{display:block;margin-top:12px;font:500 clamp(.6rem,1.5vw,.74rem)/1.5 "Work Sans",system-ui,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:rgba(251,246,236,.7)}',
  '#un-ab .vagalume i{position:absolute;width:3px;height:3px;border-radius:50%;background:#F5C542;box-shadow:0 0 8px #F5C542;opacity:0;animation:unVaga 3s ease-in-out infinite}',
  '@keyframes unVaga{50%{opacity:.8;transform:translate(var(--x),var(--y))}}',
  '#un-ab.sai .vagalume{opacity:0;transition:opacity .3s}',
  '#un-ab .pular{position:absolute;bottom:22px;right:24px;font:600 .62rem/1 "Work Sans",system-ui,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:rgba(251,246,236,.45);transition:opacity .3s}',
  '#un-ab.sai .pular{opacity:0}',
  '@media (prefers-reduced-motion:reduce){#un-ab *{animation-duration:.01s!important;animation-delay:0s!important}}'
  ].join('\n');
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // borda de triângulos alternados, como na logomarca
  var tri = '', N = 30, R1 = 150, cores = ['#4C7A2E','#E8A317','#9A3A0F'];
  for(var i = 0; i < N; i++){
    var a = i / N * 360, d = (2.1 + i * 0.025).toFixed(3) + 's', inv = i % 2;
    tri += '<g transform="rotate(' + a + ')"><path class="tri" style="animation-delay:' + d + '" fill="' + cores[i % 3] + '" d="' +
      (inv ? 'M-8 -' + (R1 - 2) + ' L8 -' + (R1 - 2) + ' L0 -' + (R1 - 16) + 'Z' : 'M-8 -' + (R1 - 16) + ' L8 -' + (R1 - 16) + ' L0 -' + (R1 - 2) + 'Z') + '"/></g>';
  }
  var ondas = [['#4C7A2E','M-112 -30 C-60 -80 0 -10 50 -50 S110 -70 120 -40',2.35],
               ['#E8A317','M-118 0 C-60 -40 -10 30 50 -10 S110 -30 122 -6',2.45],
               ['#D9632A','M-118 26 C-60 -10 -10 56 50 18 S110 0 122 22',2.55],
               ['#3B86D6','M-112 54 C-60 22 -10 84 50 46 S110 30 118 52',2.65]]
    .map(function(o){ return '<path class="onda" style="stroke:' + o[0] + ';animation-delay:' + o[2] + 's" d="' + o[1] + '"/>'; }).join('');
  var html = '<div id="un-ab" aria-hidden="true"><div class="fileiras">' + new Array(15).join('<i></i>') + '</div><div class="vagalume"></div>' +
    '<div class="palco"><svg class="cena" viewBox="-200 -200 400 400"><defs><clipPath id="unDisco"><circle r="126"/></clipPath>' +
    '<radialGradient id="unLuz"><stop offset="0" stop-color="#F5C542" stop-opacity=".35"/><stop offset="1" stop-color="#F5C542" stop-opacity="0"/></radialGradient></defs>' +
    '<circle class="luz" r="195" fill="url(#unLuz)"/>' +
    '<path class="chao" d="M-150 60 Q0 50 150 60"/>' +
    '<path class="raiz" d="M0 58 C-4 76 -16 84 -22 100 M0 58 C3 78 12 88 20 104 M0 58 L0 102"/>' +
    '<ellipse class="semente" cx="0" cy="54" rx="7" ry="10"/>' +
    '<path class="caule" d="M0 52 C2 20 -4 -6 0 -40"/>' +
    '<path class="folha e" d="M-1 -10 C-26 -14 -44 -32 -46 -54 C-22 -50 -6 -34 -1 -10Z"/>' +
    '<path class="folha d" d="M1 -24 C24 -26 44 -44 48 -68 C22 -64 6 -48 1 -24Z"/>' +
    '<circle class="borda" r="156"/><circle class="borda" r="128" style="animation-delay:2.05s;stroke-width:2"/>' + tri +
    '<g clip-path="url(#unDisco)">' + ondas + '</g>' +
    '<image class="selo" href="imgs/unipbras-emblema.webp" x="-157" y="-157" width="314" height="314"/></svg>' +
    '<div class="nome"><b><span class="u">UNIP</span><span class="b">BRAS</span></b><em>INDÍGENA</em>' +
    '<span>União Nacional dos Produtores e Agricultores Indígenas do Brasil</span></div></div>' +
    '<span class="pular">toque para entrar</span></div>';

  function abrir(){
    var velho = document.getElementById('un-ab'); if(velho) velho.remove();
    var t = document.createElement('div'); t.innerHTML = html; var ab = t.firstElementChild;
    document.body.insertBefore(ab, document.body.firstChild);
    var vg = ab.querySelector('.vagalume');
    for(var i = 0; i < 22; i++){ var s = document.createElement('i'); s.style.left = Math.random() * 100 + '%'; s.style.top = Math.random() * 100 + '%'; s.style.setProperty('--x', (Math.random() * 60 - 30) + 'px'); s.style.setProperty('--y', (Math.random() * -60) + 'px'); s.style.animationDelay = (Math.random() * 3) + 's'; vg.appendChild(s); }
    ab.querySelectorAll('.fileiras i').forEach(function(f, n){ f.style.transitionDelay = (Math.abs(n - 6.5) * 0.04) + 's'; });
    document.documentElement.style.overflow = 'hidden';
    var feito = false;
    function fim(){
      if(feito) return; feito = true; ab.classList.add('sai');
      document.documentElement.style.overflow = '';
      window.dispatchEvent(new Event('abertura-fim'));
      setTimeout(function(){ ab.remove(); }, 1500);
    }
    setTimeout(fim, reduz ? 600 : 5200);
    ab.addEventListener('click', fim);
  }
  abrir();
  addEventListener('pageshow', function(e){ if(e.persisted) abrir(); });
})();
