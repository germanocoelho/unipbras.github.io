/* =====================================================================
   UNIPBRAS · Conteúdo editável e Área administrativa (adm.js)
   Público: diretoria, filiadas, agenda (calendário), vídeos e documentos,
   lidos de dados-site.json, nos 4 idiomas do site.
   Administração (senha + chave do GitHub): edição de tudo isso, dos dados
   sensíveis criptografados (restrito/dados.enc.json), relatório mensal,
   backup completo e aviso de conexão.
   ===================================================================== */
(function(){
  'use strict';
  var REPO = 'germanocoelho/unipbras.github.io', ARQ = 'dados-site.json', ARQ_R = 'restrito/dados.enc.json';
  var CHAVE_TOKEN = 'unipbras_gh_token', CHAVE_SESSAO = 'unipbras_adm';
  var $ = function(i){ return document.getElementById(i); };
  var D = null, R = null, PW = null, TOKEN = null, PODE = false;

  /* ---------------- idioma ---------------- */
  function L(){ var l = (document.documentElement.lang || 'pt').slice(0, 2); return ['en','es','fr'].indexOf(l) > -1 ? l : 'pt'; }
  var TX = {
    pt: {inf:'A informar', razao:'Razão social', cnpj:'CNPJ', fund:'Fundação', sit:'Situação', sede:'Sede', povos:'Povos', pres:'Presidência', cont:'Contato',
      logoEnviar:'logomarca a enviar', semEventos:'Nenhum evento neste mês.', proximos:'Próximos eventos', realizados:'Eventos realizados', semProx:'Nenhum evento agendado no momento.',
      saiba:'Saiba mais', abrir:'Abrir documento', acessar:'Acessar', todos:'Todos', buscar:'Buscar documento', semDocs:'Nenhum documento encontrado.', assistir:'Assistir',
      meses:['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'], dias:['D','S','T','Q','Q','S','S'],
      tipos:{assembleia:'Assembleia', reuniao:'Reunião', encontro:'Encontro', feira:'Feira', capacitacao:'Capacitação', outro:'Evento'},
      cats:{estatuto:'Estatuto', atas:'Atas', oficios:'Ofícios', certidoes:'Certidões', marca:'Marca', institucional:'Institucional', artigos:'Artigos e estudos', outros:'Outros'}},
    en: {inf:'To be informed', razao:'Legal name', cnpj:'CNPJ', fund:'Founded', sit:'Status', sede:'Headquarters', povos:'Peoples', pres:'President', cont:'Contact',
      logoEnviar:'logo to be sent', semEventos:'No events this month.', proximos:'Upcoming events', realizados:'Past events', semProx:'No events scheduled at the moment.',
      saiba:'Learn more', abrir:'Open document', acessar:'Open', todos:'All', buscar:'Search documents', semDocs:'No documents found.', assistir:'Watch',
      meses:['January','February','March','April','May','June','July','August','September','October','November','December'], dias:['S','M','T','W','T','F','S'],
      tipos:{assembleia:'Assembly', reuniao:'Meeting', encontro:'Gathering', feira:'Fair', capacitacao:'Training', outro:'Event'},
      cats:{estatuto:'Bylaws', atas:'Minutes', oficios:'Official letters', certidoes:'Certificates', marca:'Brand', institucional:'Institutional', artigos:'Articles and studies', outros:'Other'}},
    es: {inf:'A informar', razao:'Razón social', cnpj:'CNPJ', fund:'Fundación', sit:'Situación', sede:'Sede', povos:'Pueblos', pres:'Presidencia', cont:'Contacto',
      logoEnviar:'logotipo pendiente', semEventos:'No hay eventos este mes.', proximos:'Próximos eventos', realizados:'Eventos realizados', semProx:'No hay eventos programados por el momento.',
      saiba:'Más información', abrir:'Abrir documento', acessar:'Acceder', todos:'Todos', buscar:'Buscar documento', semDocs:'No se encontraron documentos.', assistir:'Ver',
      meses:['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'], dias:['D','L','M','M','J','V','S'],
      tipos:{assembleia:'Asamblea', reuniao:'Reunión', encontro:'Encuentro', feira:'Feria', capacitacao:'Capacitación', outro:'Evento'},
      cats:{estatuto:'Estatuto', atas:'Actas', oficios:'Oficios', certidoes:'Certificados', marca:'Marca', institucional:'Institucional', artigos:'Artículos y estudios', outros:'Otros'}},
    fr: {inf:'À préciser', razao:'Raison sociale', cnpj:'CNPJ', fund:'Fondation', sit:'Situation', sede:'Siège', povos:'Peuples', pres:'Présidence', cont:'Contact',
      logoEnviar:'logo à envoyer', semEventos:'Aucun événement ce mois-ci.', proximos:'Prochains événements', realizados:'Événements passés', semProx:'Aucun événement prévu pour le moment.',
      saiba:'En savoir plus', abrir:'Ouvrir le document', acessar:'Accéder', todos:'Tous', buscar:'Rechercher un document', semDocs:'Aucun document trouvé.', assistir:'Regarder',
      meses:['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'], dias:['D','L','M','M','J','V','S'],
      tipos:{assembleia:'Assemblée', reuniao:'Réunion', encontro:'Rencontre', feira:'Foire', capacitacao:'Formation', outro:'Événement'},
      cats:{estatuto:'Statuts', atas:'Procès-verbaux', oficios:'Courriers officiels', certidoes:'Certificats', marca:'Marque', institucional:'Institutionnel', artigos:'Articles et études', outros:'Autres'}}
  };
  function t(k){ return (TX[L()] || TX.pt)[k]; }
  function tr(obj){ if (!obj) return ''; if (typeof obj === 'string') return obj; return obj[L()] || obj.pt || ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function urlOk(u){ u = String(u || '').trim(); return /^(https?:\/\/|#|[a-z0-9_\-\/.]+\.(html|pdf|webp|png|jpg)$|[a-z0-9_\-\/.]+\.html#)/i.test(u) ? u : ''; }
  function dataBR(iso){ if (!iso) return ''; var p = iso.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  function hoje(){ var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function uid(p){ return p + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* ---------------- diretoria ---------------- */
  function renderDiretoria(){
    var g = document.querySelector('.roster-grid'); if (!g || !D) return;
    g.innerHTML = D.diretoria.map(function(m){
      return '<div class="roster-card"><span class="roster-role">' + esc(m.cargo) + '</span><strong>' + esc(m.nome) + '</strong></div>';
    }).join('');
  }

  /* ---------------- filiadas ---------------- */
  function logoHtml(f){
    if (f.logo) {
      var cls = f.logoEstilo === 'escuro' ? ' is-dark' : f.logoEstilo === 'pequeno' ? ' is-pequeno' : '';
      return '<div class="assoc-logo' + cls + '"><img src="' + esc(f.logo) + '" alt="' + esc('Logomarca: ' + f.nome) + '" loading="lazy"></div>';
    }
    return '<div class="assoc-logo is-selo" aria-hidden="true"><span class="assoc-selo"></span><span class="assoc-selo-nome">' + esc(f.sigla || f.nome.split(' ')[0]) + '</span><span class="assoc-selo-aviso">' + esc(t('logoEnviar')) + '</span></div>';
  }
  function linha(rot, val){ return '<dt>' + esc(rot) + '</dt>' + (val ? '<dd>' + esc(val) + '</dd>' : '<dd class="pendente">' + esc(t('inf')) + '</dd>'); }
  function renderFiliadas(){
    var g = document.querySelector('.assoc-grid'); if (!g || !D) return;
    var vazio = g.querySelector('.assoc-card-vazio');
    g.querySelectorAll('article.assoc-card').forEach(function(a){ a.remove(); });
    var html = D.filiadas.map(function(f){
      var dl = (f.razao ? linha(t('razao'), f.razao) : '') + linha(t('cnpj'), f.cnpj) + (f.fundacao ? linha(t('fund'), f.fundacao) : '') +
        (f.situacao ? linha(t('sit'), f.situacao) : '') + linha(t('sede'), f.sede) + linha(t('povos'), f.povos) + linha(t('pres'), f.presidencia) + linha(t('cont'), f.contato);
      return '<article class="assoc-card is-visible" data-i18n-ignorar>' + logoHtml(f) + '<div class="assoc-body"><span class="assoc-uf">' + esc(f.local || t('inf')) + '</span>' +
        '<h3>' + esc(f.nome) + (f.sigla ? '<span class="assoc-sigla">' + esc(f.sigla) + '</span>' : '') + '</h3>' +
        '<p class="assoc-desc">' + esc(tr(f.desc)) + '</p><dl class="assoc-dados">' + dl + '</dl></div></article>';
    }).join('');
    if (vazio) vazio.insertAdjacentHTML('beforebegin', html); else g.insertAdjacentHTML('beforeend', html);
  }

  /* ---------------- agenda ---------------- */
  var mesVis = null;
  function evNoDia(iso){ return (D.eventos || []).filter(function(e){ var f = e.fim || e.ini; return iso >= e.ini && iso <= f; }); }
  function eventoCard(e){
    var p = e.ini.split('-'), m = t('meses')[parseInt(p[1], 10) - 1];
    var per = e.fim && e.fim !== e.ini ? dataBR(e.ini) + ' – ' + dataBR(e.fim) : dataBR(e.ini);
    var link = urlOk(e.link);
    return '<article class="ag-ev"><div class="ag-data"><b>' + parseInt(p[2], 10) + '</b><span>' + esc(m.slice(0, 3)) + '</span><small>' + p[0] + '</small></div>' +
      '<div class="ag-ev-corpo"><span class="ag-tipo ag-t-' + esc(e.tipo) + '">' + esc(t('tipos')[e.tipo] || t('tipos').outro) + '</span>' +
      '<h3>' + esc(tr(e.titulo)) + '</h3><p class="ag-meta">' + esc(per) + (e.hora ? ' · ' + esc(e.hora) : '') + (e.local ? ' · ' + esc(e.local) : '') + '</p>' +
      (tr(e.desc) ? '<p>' + esc(tr(e.desc)) + '</p>' : '') + (link ? '<a class="ag-link" href="' + esc(link) + '"' + (/^https?:/.test(link) ? ' target="_blank" rel="noopener"' : '') + '>' + esc(t('saiba')) + ' →</a>' : '') + '</div></article>';
  }
  function renderAgenda(){
    var cal = $('agCal'), lst = $('agLista'); if (!cal || !D) return;
    if (!mesVis){ var h = new Date(); mesVis = new Date(h.getFullYear(), h.getMonth(), 1); }
    var y = mesVis.getFullYear(), m = mesVis.getMonth(), prim = new Date(y, m, 1).getDay(), nd = new Date(y, m + 1, 0).getDate(), hj = hoje();
    var h = '<div class="ag-cal-topo"><button type="button" class="ag-nav" data-ag="-1" aria-label="‹">‹</button><b>' + esc(t('meses')[m]) + ' ' + y + '</b><button type="button" class="ag-nav" data-ag="1" aria-label="›">›</button></div><div class="ag-grade">';
    t('dias').forEach(function(d){ h += '<span class="ag-dsem">' + d + '</span>'; });
    for (var i = 0; i < prim; i++) h += '<span></span>';
    var doMes = [];
    for (var d = 1; d <= nd; d++){
      var iso = y + '-' + ('0' + (m + 1)).slice(-2) + '-' + ('0' + d).slice(-2), evs = evNoDia(iso);
      evs.forEach(function(e){ if (doMes.indexOf(e) < 0) doMes.push(e); });
      h += '<button type="button" class="ag-dia' + (evs.length ? ' tem' : '') + (iso === hj ? ' hoje' : '') + '" data-dia="' + iso + '"' + (evs.length ? ' title="' + esc(evs.map(function(e){ return tr(e.titulo); }).join(' · ')) + '"' : ' tabindex="-1"') + '>' + d + '</button>';
    }
    h += '</div><div class="ag-mes-ev">' + (doMes.length ? doMes.map(function(e){ return '<p><span class="ag-pt"></span>' + esc(dataBR(e.ini).slice(0, 5)) + ' · ' + esc(tr(e.titulo)) + '</p>'; }).join('') : '<p class="ag-vazio">' + esc(t('semEventos')) + '</p>') + '</div>';
    cal.innerHTML = h;
    var ev = (D.eventos || []).slice().sort(function(a, b){ return a.ini < b.ini ? -1 : 1; });
    var prox = ev.filter(function(e){ return (e.fim || e.ini) >= hj; }), pass = ev.filter(function(e){ return (e.fim || e.ini) < hj; }).reverse();
    lst.innerHTML = '<h3 class="ag-sub">' + esc(t('proximos')) + '</h3>' + (prox.length ? prox.map(eventoCard).join('') : '<p class="ag-vazio">' + esc(t('semProx')) + '</p>') +
      (pass.length ? '<details class="ag-pass"' + (prox.length ? '' : ' open') + '><summary>' + esc(t('realizados')) + ' (' + pass.length + ')</summary>' + pass.map(eventoCard).join('') + '</details>' : '');
  }
  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('[data-ag]');
    if (b){ mesVis = new Date(mesVis.getFullYear(), mesVis.getMonth() + parseInt(b.getAttribute('data-ag'), 10), 1); renderAgenda(); return; }
    var dia = e.target.closest && e.target.closest('.ag-dia.tem');
    if (dia){ var alvo = evNoDia(dia.getAttribute('data-dia'))[0]; if (!alvo) return;
      var cards = document.querySelectorAll('#agLista .ag-ev h3');
      for (var i = 0; i < cards.length; i++){ if (cards[i].textContent === tr(alvo.titulo)){ var c = cards[i].closest('.ag-ev'); var det = c.closest('details'); if (det) det.open = true; c.scrollIntoView({behavior:'smooth', block:'center'}); c.classList.add('ag-pisca'); setTimeout(function(){ c.classList.remove('ag-pisca'); }, 1600); break; } } }
  });

  /* ---------------- vídeos ---------------- */
  function ytId(u){ var m = String(u || '').match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{11})/); return m ? m[1] : (/^[A-Za-z0-9_-]{11}$/.test(u) ? u : ''); }
  function renderVideos(){
    var sec = $('videos'), g = $('ytGrade'); if (!sec || !D) return;
    var v = D.videos || [];
    sec.hidden = !v.length && !document.body.classList.contains('adm-ok');
    g.innerHTML = v.length ? v.map(function(x){
      return '<button type="button" class="yt-card" data-yt="' + esc(x.yt) + '"><span class="yt-capa"><img src="https://i.ytimg.com/vi/' + esc(x.yt) + '/hqdefault.jpg" alt="" loading="lazy"><span class="yt-play" aria-hidden="true">▶</span></span><span class="yt-tit">' + esc(tr(x.titulo)) + '</span></button>';
    }).join('') : '<p class="ag-vazio">Nenhum vídeo publicado.</p>';
  }
  document.addEventListener('click', function(e){
    var c = e.target.closest && e.target.closest('.yt-card'); if (!c) return;
    var id = c.getAttribute('data-yt'); if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
    c.querySelector('.yt-capa').innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0" title="YouTube" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    c.classList.add('tocando');
  });

  /* ---------------- documentos ---------------- */
  var docCat = 'todos', docBusca = '';
  function renderDocs(){
    var f = $('docFiltros'), l = $('docLista'); if (!f || !D) return;
    var docs = (D.documentos || []).slice().sort(function(a, b){ return (b.data || '') < (a.data || '') ? -1 : 1; });
    var cats = []; docs.forEach(function(d){ if (cats.indexOf(d.cat) < 0) cats.push(d.cat); });
    f.innerHTML = ['todos'].concat(cats).map(function(c){ return '<button type="button" class="doc-chip' + (c === docCat ? ' on' : '') + '" data-doccat="' + esc(c) + '">' + esc(c === 'todos' ? t('todos') : (t('cats')[c] || c)) + '</button>'; }).join('') +
      '<input type="search" class="doc-busca" id="docBusca" placeholder="' + esc(t('buscar')) + '" value="' + esc(docBusca) + '">';
    var q = docBusca.toLowerCase();
    var vis = docs.filter(function(d){ return (docCat === 'todos' || d.cat === docCat) && (!q || (tr(d.titulo) + ' ' + tr(d.desc)).toLowerCase().indexOf(q) > -1); });
    l.innerHTML = vis.length ? vis.map(function(d){
      var href = urlOk(d.arquivo || d.link), pdf = /\.pdf$/i.test(d.arquivo || '');
      return '<article class="doc-item"><span class="doc-ic' + (pdf ? ' pdf' : '') + '" aria-hidden="true">' + (pdf ? 'PDF' : '↗') + '</span><div class="doc-corpo"><span class="doc-cat">' + esc(t('cats')[d.cat] || d.cat) + (d.data ? ' · ' + esc(dataBR(d.data)) : '') + '</span><h3>' + esc(tr(d.titulo)) + '</h3>' +
        (tr(d.desc) ? '<p>' + esc(tr(d.desc)) + '</p>' : '') + '</div>' + (href ? '<a class="doc-btn" href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(pdf ? t('abrir') : t('acessar')) + '</a>' : '') + '</article>';
    }).join('') : '<p class="ag-vazio">' + esc(t('semDocs')) + '</p>';
  }
  document.addEventListener('click', function(e){ var c = e.target.closest && e.target.closest('[data-doccat]'); if (!c) return; docCat = c.getAttribute('data-doccat'); renderDocs(); });
  document.addEventListener('input', function(e){ if (e.target && e.target.id === 'docBusca'){ docBusca = e.target.value; var pos = e.target.selectionStart; renderDocs(); var b = $('docBusca'); b.focus(); b.setSelectionRange(pos, pos); } });

  function renderTudo(){ if (!D) return; renderDiretoria(); renderFiliadas(); renderAgenda(); renderVideos(); renderDocs(); }
  window.ADM_idioma = function(){ renderTudo(); if (PW) renderPainel(); };

  /* ---------------- carregar ---------------- */
  fetch(ARQ + '?t=' + Date.now(), {cache: 'no-store'}).then(function(r){ return r.json(); })
    .then(function(j){ D = j; ['diretoria','filiadas','eventos','documentos','videos'].forEach(function(k){ if (!Array.isArray(D[k])) D[k] = []; }); renderTudo(); })
    .catch(function(e){ console.warn('[adm] dados-site.json', e); });

  /* =====================================================================
     ADMINISTRAÇÃO
     ===================================================================== */
  function b64u8(s){ return Uint8Array.from(atob(s), function(c){ return c.charCodeAt(0); }); }
  function u8b64(u){ var s = ''; for (var i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); }
  function b64txt(s){ return btoa(unescape(encodeURIComponent(s))); }
  async function chaveDe(pw, sal, it, uso){
    var base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2', salt:sal, iterations:it, hash:'SHA-256'}, base, {name:'AES-GCM', length:256}, false, [uso]);
  }
  async function decifra(pw){
    var f = await (await fetch(ARQ_R + '?t=' + Date.now(), {cache:'no-store'})).json();
    var k = await chaveDe(pw, b64u8(f.sal), f.it, 'decrypt');
    return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM', iv:b64u8(f.iv)}, k, b64u8(f.dados))));
  }
  async function cifra(pw, obj){
    var sal = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12)), it = 600000;
    var k = await chaveDe(pw, sal, it, 'encrypt');
    var c = new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM', iv:iv}, k, new TextEncoder().encode(JSON.stringify(obj, null, 1))));
    return JSON.stringify({v:1, alg:'AES-256-GCM', kdf:'PBKDF2-SHA256', it:it, sal:u8b64(sal), iv:u8b64(iv), dados:u8b64(c)});
  }

  /* --- GitHub --- */
  function gh(caminho){ return 'https://api.github.com/repos/' + REPO + '/contents/' + caminho; }
  function hdr(){ return {'Authorization':'token ' + TOKEN, 'Accept':'application/vnd.github+json'}; }
  async function podeEscrever(tok){
    try{ var r = await fetch('https://api.github.com/repos/' + REPO, {cache:'no-store', headers:{'Authorization':'token ' + tok, 'Accept':'application/vnd.github+json'}});
      var j = await r.json(); return !!(r.ok && j.permissions && j.permissions.push); }catch(e){ return null; }
  }
  async function gravar(caminho, b64, msg){
    if (!PODE) throw new Error('Sem permissão de escrita no GitHub.');
    for (var n = 0; n < 3; n++){
      var cur = await fetch(gh(caminho) + '?t=' + Date.now(), {cache:'no-store', headers:hdr()});
      var sha = cur.ok ? (await cur.json()).sha : undefined;
      var h = hdr(); h['Content-Type'] = 'application/json';
      var r = await fetch(gh(caminho), {method:'PUT', headers:h, body:JSON.stringify({message:msg, content:b64, sha:sha})});
      if (r.ok) return true;
      if (r.status !== 409 && r.status !== 422) throw new Error((await r.json()).message || ('HTTP ' + r.status));
    }
    throw new Error('Conflito ao gravar. Tente de novo.');
  }
  async function salvarSite(msg){ await gravar(ARQ, b64txt(JSON.stringify(D, null, 2)), msg); renderTudo(); aviso('ok', '✓ ' + msg + '. O site publica a mudança em 1 a 2 minutos.'); }
  async function salvarRestrito(msg){ await gravar(ARQ_R, b64txt(await cifra(PW, R)), msg); aviso('ok', '✓ ' + msg + ' (dados criptografados).'); }

  /* --- tradução automática PT → EN/ES/FR --- */
  async function mm(txt, l){
    var partes = String(txt).match(/[^.!?]{1,450}[.!?]*\s*/g) || [txt], out = '';
    for (var i = 0; i < partes.length; i++){
      var r = await fetch('https://api.mymemory.translated.net/get?q=' + encodeURIComponent(partes[i]) + '&langpair=pt-BR|' + l);
      var j = await r.json(); var x = j && j.responseData && j.responseData.translatedText;
      if (!x || /MYMEMORY WARNING|QUERY LENGTH/i.test(x)) throw new Error('tradução indisponível'); out += x + ' ';
    }
    return out.trim();
  }
  async function traduz(pt){
    var o = {pt: pt, en: pt, es: pt, fr: pt}; if (!pt) return o;
    try{ for (var l of ['en','es','fr']) o[l] = await mm(pt, l); }catch(e){ console.warn('[adm] tradução', e); o._semTrad = true; }
    return o;
  }

  /* --- imagens e arquivos --- */
  function lerArquivo(f){ return new Promise(function(ok, err){ var r = new FileReader(); r.onload = function(){ ok(r.result); }; r.onerror = err; r.readAsDataURL(f); }); }
  async function reduzImg(f, max){
    var url = await lerArquivo(f), img = new Image();
    await new Promise(function(ok, err){ img.onload = ok; img.onerror = err; img.src = url; });
    var e = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
    c.width = Math.round(img.width * e); c.height = Math.round(img.height * e); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/webp', 0.9).split(',')[1];
  }
  function slug(s){ return String(s || 'arquivo').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'arquivo'; }

  /* --- aviso / banner de conexão --- */
  function aviso(tipo, msg){ var a = $('admAviso'); if (!a) return; a.className = 'adm-aviso ' + tipo; a.textContent = msg; a.hidden = !msg; if (tipo === 'ok') setTimeout(function(){ if (a.textContent === msg) a.hidden = true; }, 7000); }
  function conexao(){
    var c = $('admConexao'); if (!c) return;
    if (PODE === true){ c.className = 'adm-conexao ok'; c.innerHTML = '● Conectado ao GitHub: as alterações são publicadas no site.'; }
    else if (TOKEN && PODE === null){ c.className = 'adm-conexao erro'; c.innerHTML = '● Sem conexão com o GitHub agora. Verifique a internet e entre de novo.'; }
    else { c.className = 'adm-conexao aviso'; c.innerHTML = '● Somente leitura: a chave de publicação não respondeu. Tente sair e entrar de novo.'; }
  }

  /* --- formulários genéricos --- */
  function campo(id, rot, val, tipo, extra){
    tipo = tipo || 'text'; extra = extra || '';
    if (tipo === 'area') return '<label class="adm-campo"><span>' + rot + '</span><textarea id="' + id + '" rows="3"' + extra + '>' + esc(val) + '</textarea></label>';
    if (tipo.indexOf('sel:') === 0){ var ops = JSON.parse(tipo.slice(4)); return '<label class="adm-campo"><span>' + rot + '</span><select id="' + id + '">' + Object.keys(ops).map(function(k){ return '<option value="' + k + '"' + (k === val ? ' selected' : '') + '>' + esc(ops[k]) + '</option>'; }).join('') + '</select></label>'; }
    return '<label class="adm-campo"><span>' + rot + '</span><input id="' + id + '" type="' + tipo + '" value="' + esc(val) + '"' + extra + '></label>';
  }
  function v(id){ var e = $(id); return e ? e.value.trim() : ''; }
  function lista(itens, rot, chave){
    return '<ul class="adm-itens">' + itens.map(function(x, i){
      return '<li><span>' + esc(rot(x)) + '</span><span class="adm-acoes"><button type="button" data-a="' + chave + ':sobe:' + i + '" title="Subir">↑</button>' + (chave === 'yt' ? '' : '<button type="button" data-a="' + chave + ':edita:' + i + '">Editar</button>') + '<button type="button" class="perigo" data-a="' + chave + ':apaga:' + i + '">Excluir</button></span></li>';
    }).join('') + '</ul>';
  }
  var editando = {};

  /* --- painel --- */
  function cartao(id, tit, nota, corpo, largo){ return '<div class="adm-cartao' + (largo ? ' adm-largo' : '') + '" id="' + id + '"><h3>' + tit + '</h3>' + (nota ? '<p class="adm-nota">' + nota + '</p>' : '') + corpo + '</div>'; }
  var CAT = {estatuto:'Estatuto', atas:'Atas', oficios:'Ofícios', certidoes:'Certidões', marca:'Marca', institucional:'Institucional', artigos:'Artigos e estudos', outros:'Outros'};
  var TIPO = {assembleia:'Assembleia', reuniao:'Reunião', encontro:'Encontro', feira:'Feira', capacitacao:'Capacitação', outro:'Outro'};
  var ESTILO = {'':'Fundo claro', escuro:'Fundo escuro', pequeno:'Logo pequeno'};

  function formFiliada(){
    var i = editando.fil, f = i != null ? D.filiadas[i] : {};
    return '<div class="adm-form">' + campo('fSigla','Sigla',f.sigla) + campo('fNome','Nome da associação *',f.nome) + campo('fRazao','Razão social (se diferente)',f.razao) +
      campo('fLocal','Cidade · UF',f.local) + campo('fCnpj','CNPJ',f.cnpj) + campo('fFund','Fundação (dd/mm/aaaa)',f.fundacao) + campo('fSit','Situação cadastral',f.situacao) +
      campo('fSede','Endereço da sede',f.sede) + campo('fPovos','Povos atendidos',f.povos) + campo('fPres','Presidência',f.presidencia) +
      campo('fCont','Contato institucional (confirmado)',f.contato) + campo('fDesc','Descrição (em português; a tradução é automática)',f.desc ? f.desc.pt : '','area') +
      campo('fLogo','Logomarca (imagem)','','file',' accept="image/*"') + campo('fEstilo','Estilo do logo',f.logoEstilo || '','sel:' + JSON.stringify(ESTILO)) +
      '<div class="adm-linha"><button type="button" class="adm-btn" data-a="fil:salva">' + (i != null ? 'Salvar alterações' : 'Adicionar filiada') + '</button>' + (i != null ? '<button type="button" class="adm-btn adm-btn-claro" data-a="fil:cancela">Cancelar</button>' : '') + '</div></div>';
  }
  function formDiretoria(){
    var rest = (R && R.diretoria) || [];
    return '<div class="adm-tabela"><table><thead><tr><th>Cargo</th><th>Nome (público)</th><th>Povo (restrito)</th><th>UF (restrito)</th><th></th></tr></thead><tbody>' +
      D.diretoria.map(function(m, i){ var r = rest.filter(function(x){ return x.cargo === m.cargo; })[0] || {};
        return '<tr><td><input data-dir="cargo" data-i="' + i + '" value="' + esc(m.cargo) + '"></td><td><input data-dir="nome" data-i="' + i + '" value="' + esc(m.nome) + '"></td><td><input data-dir="povo" data-i="' + i + '" value="' + esc(r.povo || '') + '"></td><td><input data-dir="uf" data-i="' + i + '" value="' + esc(r.uf || '') + '" size="3"></td><td><button type="button" class="adm-mini perigo" data-a="dir:apaga:' + i + '">✕</button></td></tr>'; }).join('') +
      '</tbody></table></div><div class="adm-linha"><button type="button" class="adm-btn adm-btn-claro" data-a="dir:novo">+ Cargo</button><button type="button" class="adm-btn" data-a="dir:salva">Salvar diretoria</button></div>';
  }
  function formEvento(){
    var i = editando.ev, e = i != null ? D.eventos[i] : {tipo:'reuniao'};
    return '<div class="adm-form">' + campo('eTit','Título *',e.titulo ? e.titulo.pt : '') + campo('eTipo','Tipo',e.tipo,'sel:' + JSON.stringify(TIPO)) +
      campo('eIni','Data de início *',e.ini,'date') + campo('eFim','Data de término',e.fim,'date') + campo('eHora','Horário',e.hora,'text',' placeholder="9h às 17h"') +
      campo('eLocal','Local',e.local) + campo('eDesc','Descrição (português)',e.desc ? e.desc.pt : '','area') + campo('eLink','Link (opcional)',e.link) +
      '<div class="adm-linha"><button type="button" class="adm-btn" data-a="ev:salva">' + (i != null ? 'Salvar evento' : 'Publicar evento') + '</button>' + (i != null ? '<button type="button" class="adm-btn adm-btn-claro" data-a="ev:cancela">Cancelar</button>' : '') + '</div></div>';
  }
  function formDoc(){
    var i = editando.doc, d = i != null ? D.documentos[i] : {cat:'atas', data:hoje()};
    return '<div class="adm-form">' + campo('dTit','Título *',d.titulo ? d.titulo.pt : '') + campo('dCat','Categoria',d.cat,'sel:' + JSON.stringify(CAT)) + campo('dData','Data',d.data,'date') +
      campo('dDesc','Descrição (português)',d.desc ? d.desc.pt : '','area') + campo('dArq','Arquivo PDF (até 20 MB)','','file',' accept="application/pdf"') +
      campo('dLink','Ou link (Google Drive, site etc.)',d.link) + (d.arquivo ? '<p class="adm-nota">Arquivo atual: ' + esc(d.arquivo) + '</p>' : '') +
      '<div class="adm-linha"><button type="button" class="adm-btn" data-a="doc:salva">' + (i != null ? 'Salvar documento' : 'Publicar documento') + '</button>' + (i != null ? '<button type="button" class="adm-btn adm-btn-claro" data-a="doc:cancela">Cancelar</button>' : '') + '</div></div>';
  }
  function formVideo(){
    return '<div class="adm-form">' + campo('yUrl','Endereço do vídeo no YouTube *','','url',' placeholder="https://www.youtube.com/watch?v=..."') + campo('yTit','Título (português) *','') +
      '<div class="adm-linha"><button type="button" class="adm-btn" data-a="yt:salva">Publicar vídeo</button></div></div>';
  }
  function formRestrito(){
    var c = (R.contatos || []);
    return '<div class="adm-tabela"><table><thead><tr><th>Entidade</th><th>Pessoa</th><th>Contato</th><th>Origem</th><th>Observação</th><th></th></tr></thead><tbody>' +
      c.map(function(x, i){ return '<tr>' + ['entidade','pessoa','contato','origem','obs'].map(function(k){ return '<td><input data-ct="' + k + '" data-i="' + i + '" value="' + esc(x[k]) + '"></td>'; }).join('') + '<td><button type="button" class="adm-mini perigo" data-a="ct:apaga:' + i + '">✕</button></td></tr>'; }).join('') +
      '</tbody></table></div><div class="adm-linha"><button type="button" class="adm-btn adm-btn-claro" data-a="ct:novo">+ Contato</button><button type="button" class="adm-btn" data-a="ct:salva">Salvar contatos</button></div>';
  }
  function formPend(){
    return '<ul class="adm-pend">' + (R.pendencias || []).map(function(p, i){ return '<li><span>' + esc(p) + '</span><button type="button" class="adm-mini" data-a="pd:feita:' + i + '" title="Marcar como resolvida">✓</button></li>'; }).join('') + '</ul>' +
      '<div class="adm-linha"><input id="pdNova" class="adm-in" placeholder="Nova pendência"><button type="button" class="adm-btn" data-a="pd:nova">Adicionar</button></div>';
  }
  function formRelatorio(){
    var d = new Date(); var ym = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2);
    return '<div class="adm-linha"><input type="month" id="relMes" class="adm-in" value="' + ym + '"><button type="button" class="adm-btn" data-a="rel:gera">Gerar relatório</button></div><div id="relSaida"></div>';
  }

  function renderPainel(){
    var p = $('admPainel'); if (!p || !D || !R) return;
    p.innerHTML =
      cartao('admCFil', 'Filiadas', 'Inclua, edite ou reordene as associações filiadas. Só publique contatos confirmados pela própria entidade.', lista(D.filiadas, function(f){ return (f.sigla ? f.sigla + ' · ' : '') + f.nome; }, 'fil') + '<h4>' + (editando.fil != null ? 'Editar filiada' : 'Nova filiada') + '</h4>' + formFiliada(), true) +
      cartao('admCDir', 'Diretoria Executiva', 'Nome e cargo aparecem no site. Povo e UF são dados sensíveis e ficam só aqui, criptografados.', formDiretoria(), true) +
      cartao('admCEv', 'Agenda e calendário', 'Os eventos aparecem no calendário público e na lista de próximos eventos.', lista(D.eventos.slice().sort(function(a,b){return a.ini<b.ini?1:-1;}), function(e){ return dataBR(e.ini) + ' · ' + tr(e.titulo); }, 'ev') + '<h4>' + (editando.ev != null ? 'Editar evento' : 'Novo evento') + '</h4>' + formEvento()) +
      cartao('admCDoc', 'Documentos e publicações', 'Estatuto, atas, ofícios, certidões, artigos e estudos. PDF enviado aqui fica guardado no site.', lista(D.documentos, function(d){ return (CAT[d.cat] || d.cat) + ' · ' + tr(d.titulo); }, 'doc') + '<h4>' + (editando.doc != null ? 'Editar documento' : 'Novo documento') + '</h4>' + formDoc()) +
      cartao('admCYt', 'Vídeos do YouTube', 'Os vídeos aparecem na seção “Vídeos”, logo abaixo da galeria.', lista(D.videos, function(x){ return tr(x.titulo); }, 'yt') + formVideo()) +
      cartao('admCRel', 'Relatório mensal de atividades', 'Reúne eventos, notícias, fotos, vídeos e documentos do mês. Pode ser impresso, salvo em PDF ou enviado por e-mail.', formRelatorio(), true) +
      cartao('admCCt', 'Contatos pessoais e não confirmados', 'Dados restritos: ficam criptografados e nunca aparecem no site.', formRestrito(), true) +
      cartao('admCPd', 'Pendências', '', formPend()) +
      cartao('admCFe', 'Ferramentas', '', '<div class="adm-ferr"><button type="button" class="adm-btn" data-adm-ir="noticias">Administrar notícias</button><button type="button" class="adm-btn" data-adm-ir="galeria">Administrar galeria</button><a class="adm-btn" href="privacidade.html#termo">Termo de autorização (LGPD)</a><button type="button" class="adm-btn adm-btn-claro" data-a="bk:baixa">Backup completo do site</button></div><p class="adm-nota">Dados restritos atualizados em ' + esc(R.atualizado || '') + '.</p>');
    p.querySelectorAll('[data-a]').forEach(function(b){ if (!PODE && !/^(rel|bk)/.test(b.getAttribute('data-a'))) b.disabled = true; });
    conexao();
  }

  /* --- ações --- */
  async function acao(a, el){
    var p = a.split(':'), k = p[0], op = p[1], i = p[2] != null ? parseInt(p[2], 10) : null;
    var mapa = {fil:'filiadas', ev:'eventos', doc:'documentos', yt:'videos'}, arr = mapa[k] ? D[mapa[k]] : null;
    if (k === 'ev' && i != null) i = D.eventos.indexOf(D.eventos.slice().sort(function(a,b){return a.ini<b.ini?1:-1;})[i]);
    try{
      if (arr && op === 'apaga'){ if (!confirm('Excluir este item do site?')) return; arr.splice(i, 1); await salvarSite('Item excluído'); }
      else if (arr && op === 'sobe'){ if (i > 0){ var x = arr.splice(i, 1)[0]; arr.splice(i - 1, 0, x); await salvarSite('Ordem atualizada'); } }
      else if (arr && op === 'edita'){ editando[k] = i; renderPainel(); $('admC' + {fil:'Fil',ev:'Ev',doc:'Doc'}[k]).querySelector('h4').scrollIntoView({behavior:'smooth', block:'start'}); return; }
      else if (op === 'cancela'){ editando[k] = null; }
      else if (k === 'fil' && op === 'salva') await salvaFiliada(el);
      else if (k === 'ev' && op === 'salva') await salvaEvento(el);
      else if (k === 'doc' && op === 'salva') await salvaDoc(el);
      else if (k === 'yt' && op === 'salva') await salvaVideo(el);
      else if (k === 'dir') await acaoDiretoria(op, i);
      else if (k === 'ct') await acaoContatos(op, i);
      else if (k === 'pd') await acaoPend(op, i);
      else if (k === 'rel') { gerarRelatorio(); return; }
      else if (k === 'bk') { await backup(); return; }
    }catch(err){ aviso('erro', '✕ Não foi possível salvar: ' + err.message); console.error(err); return; }
    renderPainel();
  }
  function ocupado(el, txt){ if (el){ el.disabled = true; el.dataset.txt = el.textContent; el.textContent = txt; } }
  async function salvaFiliada(el){
    if (!v('fNome')) throw new Error('informe o nome da associação');
    ocupado(el, 'Traduzindo e salvando...');
    var i = editando.fil, f = i != null ? D.filiadas[i] : {id: slug(v('fSigla') || v('fNome'))};
    Object.assign(f, {sigla:v('fSigla'), nome:v('fNome'), razao:v('fRazao'), local:v('fLocal'), cnpj:v('fCnpj'), fundacao:v('fFund'), situacao:v('fSit'), sede:v('fSede'), povos:v('fPovos'), presidencia:v('fPres'), contato:v('fCont'), logoEstilo:v('fEstilo')});
    if (!f.desc || f.desc.pt !== v('fDesc')) f.desc = await traduz(v('fDesc'));
    var arq = $('fLogo').files[0];
    if (arq){ var cam = 'imgs/associadas/' + slug(f.id) + '-' + Date.now().toString(36) + '.webp'; await gravar(cam, await reduzImg(arq, 700), 'Logomarca: ' + f.nome); f.logo = cam; }
    if (i == null) D.filiadas.push(f);
    editando.fil = null; await salvarSite(i != null ? 'Filiada atualizada' : 'Filiada adicionada');
  }
  async function salvaEvento(el){
    if (!v('eTit') || !v('eIni')) throw new Error('informe título e data de início');
    ocupado(el, 'Traduzindo e salvando...');
    var i = editando.ev, e = i != null ? D.eventos[i] : {id: uid('ev')};
    Object.assign(e, {tipo:v('eTipo'), ini:v('eIni'), fim:v('eFim'), hora:v('eHora'), local:v('eLocal'), link:v('eLink')});
    if (!e.titulo || e.titulo.pt !== v('eTit')) e.titulo = await traduz(v('eTit'));
    if (!e.desc || e.desc.pt !== v('eDesc')) e.desc = await traduz(v('eDesc'));
    if (i == null) D.eventos.push(e);
    editando.ev = null; mesVis = new Date(parseInt(e.ini.slice(0, 4), 10), parseInt(e.ini.slice(5, 7), 10) - 1, 1);
    await salvarSite(i != null ? 'Evento atualizado' : 'Evento publicado na agenda');
  }
  async function salvaDoc(el){
    if (!v('dTit')) throw new Error('informe o título');
    var i = editando.doc, d = i != null ? D.documentos[i] : {id: uid('doc')}, arq = $('dArq').files[0];
    if (!arq && !v('dLink') && !d.arquivo) throw new Error('envie um PDF ou informe um link');
    if (arq && arq.size > 20 * 1024 * 1024) throw new Error('o PDF tem mais de 20 MB; use um link do Google Drive');
    ocupado(el, arq ? 'Enviando o PDF...' : 'Traduzindo e salvando...');
    Object.assign(d, {cat:v('dCat'), data:v('dData'), link:v('dLink')});
    if (!d.titulo || d.titulo.pt !== v('dTit')) d.titulo = await traduz(v('dTit'));
    if (!d.desc || d.desc.pt !== v('dDesc')) d.desc = await traduz(v('dDesc'));
    if (arq){ var cam = 'docs/' + (d.data || hoje()) + '-' + slug(v('dTit')) + '.pdf'; await gravar(cam, (await lerArquivo(arq)).split(',')[1], 'Documento: ' + v('dTit')); d.arquivo = cam; }
    if (i == null) D.documentos.push(d);
    editando.doc = null; await salvarSite(i != null ? 'Documento atualizado' : 'Documento publicado');
  }
  async function salvaVideo(el){
    var id = ytId(v('yUrl')); if (!id) throw new Error('endereço do YouTube inválido'); if (!v('yTit')) throw new Error('informe o título');
    ocupado(el, 'Traduzindo e salvando...');
    D.videos.unshift({id: uid('yt'), yt: id, data: hoje(), titulo: await traduz(v('yTit'))});
    await salvarSite('Vídeo publicado');
  }
  function lerTabela(attr){ var o = {}; document.querySelectorAll('[data-' + attr + ']').forEach(function(inp){ var i = inp.getAttribute('data-i'); (o[i] = o[i] || {})[inp.getAttribute('data-' + attr)] = inp.value.trim(); }); return o; }
  async function acaoDiretoria(op, i){
    var t = lerTabela('dir');
    var nova = D.diretoria.map(function(m, j){ return {id: m.id, cargo: t[j].cargo, nome: t[j].nome, povo: t[j].povo, uf: t[j].uf}; });
    if (op === 'novo'){ nova.push({id: uid('d'), cargo: '', nome: '', povo: '', uf: ''}); }
    if (op === 'apaga'){ if (!confirm('Excluir este cargo?')) return; nova.splice(i, 1); }
    D.diretoria = nova.map(function(m){ return {id: m.id, cargo: m.cargo, nome: m.nome}; });
    R.diretoria = nova.map(function(m){ return {cargo: m.cargo, nome: m.nome, povo: m.povo, uf: m.uf}; });
    if (op === 'salva'){ R.atualizado = new Date().toLocaleDateString('pt-BR'); await salvarSite('Diretoria atualizada'); await salvarRestrito('Povo dos dirigentes atualizado'); }
  }
  async function acaoContatos(op, i){
    var t = lerTabela('ct'); R.contatos = (R.contatos || []).map(function(c, j){ return t[j] || c; });
    if (op === 'novo') R.contatos.push({entidade:'', pessoa:'', contato:'', origem:'', obs:''});
    if (op === 'apaga'){ if (!confirm('Excluir este contato?')) return; R.contatos.splice(i, 1); }
    if (op === 'salva'){ R.atualizado = new Date().toLocaleDateString('pt-BR'); await salvarRestrito('Contatos restritos atualizados'); }
  }
  async function acaoPend(op, i){
    R.pendencias = R.pendencias || [];
    if (op === 'nova'){ if (!v('pdNova')) return; R.pendencias.push(v('pdNova')); }
    if (op === 'feita') R.pendencias.splice(i, 1);
    R.atualizado = new Date().toLocaleDateString('pt-BR'); await salvarRestrito('Pendências atualizadas');
  }

  /* --- relatório mensal --- */
  async function jsonDe(arq){ try{ return await (await fetch(arq + '?t=' + Date.now(), {cache:'no-store'})).json(); }catch(e){ return null; } }
  async function gerarRelatorio(){
    var ym = v('relMes'); if (!ym) return;
    var out = $('relSaida'); out.innerHTML = '<p class="adm-nota">Reunindo as atividades do mês...</p>';
    var y = parseInt(ym.slice(0, 4), 10), m = parseInt(ym.slice(5, 7), 10) - 1, ini = new Date(y, m, 1).getTime(), fim = new Date(y, m + 1, 1).getTime();
    var nomeMes = TX.pt.meses[m] + ' de ' + y;
    var noMes = function(iso){ return iso && iso.slice(0, 7) === ym; };
    var gal = await jsonDe('galeria.json'), nt = await jsonDe('noticias.json');
    var ev = D.eventos.filter(function(e){ return noMes(e.ini) || noMes(e.fim); });
    var docs = D.documentos.filter(function(d){ return noMes(d.data); });
    var vids = D.videos.filter(function(x){ return noMes(x.data); });
    var gi = gal ? Object.values(gal.itens || {}).filter(function(x){ return x.ts >= ini && x.ts < fim; }) : [];
    var albuns = {}; gi.forEach(function(x){ var o = x.ocasiao || 'Sem álbum'; albuns[o] = albuns[o] || {f:0, v:0}; albuns[o][x.tipo === 'video' ? 'v' : 'f']++; });
    var nis = nt ? Object.values(nt.itens || {}).filter(function(x){ return noMes(x.data) || (x.ts >= ini && x.ts < fim); }) : [];
    function bloco(tit, itens){ return '<h3>' + tit + '</h3>' + (itens.length ? '<ul>' + itens.map(function(s){ return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' : '<p class="vazio">Nenhum registro no período.</p>'); }
    var corpo = '<header><img src="imgs/unipbras-logo.webp?v=2" alt="UNIPBRAS"><div><h1>Relatório mensal de atividades</h1><p>' + esc(nomeMes) + '</p></div></header>' +
      '<p class="resumo">No mês de ' + esc(nomeMes) + ', a UNIPBRAS registrou ' + ev.length + ' evento(s) na agenda, ' + nis.length + ' notícia(s), ' + gi.length + ' foto(s) e vídeo(s) na galeria, ' + vids.length + ' vídeo(s) do YouTube e ' + docs.length + ' documento(s) publicados.</p>' +
      bloco('Eventos e agenda', ev.map(function(e){ return (e.fim && e.fim !== e.ini ? dataBR(e.ini) + ' a ' + dataBR(e.fim) : dataBR(e.ini)) + ' · ' + e.titulo.pt + (e.local ? ' (' + e.local + ')' : ''); })) +
      bloco('Notícias publicadas', nis.map(function(x){ var tt = x.titulo; return (x.data ? dataBR(x.data) + ' · ' : '') + (typeof tt === 'object' ? (tt.pt || '') : (tt || x.veiculo || 'Notícia')); })) +
      bloco('Fotos e vídeos adicionados à galeria', Object.keys(albuns).map(function(o){ return o + ': ' + albuns[o].f + ' foto(s)' + (albuns[o].v ? ' e ' + albuns[o].v + ' vídeo(s)' : ''); })) +
      bloco('Vídeos do YouTube', vids.map(function(x){ return x.titulo.pt; })) +
      bloco('Documentos publicados', docs.map(function(d){ return (CAT[d.cat] || d.cat) + ' · ' + d.titulo.pt; })) +
      '<footer>UNIPBRAS · União Nacional dos Produtores e Agricultores Indígenas do Brasil · gerado em ' + new Date().toLocaleDateString('pt-BR') + '</footer>';
    out.innerHTML = '<div class="rel-doc" id="relDoc">' + corpo + '</div><div class="adm-linha"><button type="button" class="adm-btn" id="relImp">Imprimir / salvar PDF</button><button type="button" class="adm-btn adm-btn-claro" id="relCopia">Copiar texto</button><button type="button" class="adm-btn adm-btn-claro" id="relEmail">Enviar por e-mail</button></div>';
    var texto = $('relDoc').innerText;
    $('relImp').onclick = function(){ var w = window.open('', '_blank'); w.document.write('<!doctype html><meta charset="utf-8"><title>Relatório ' + esc(nomeMes) + '</title><base href="' + location.href.replace(/[^/]*$/, '') + '"><style>' + CSS_REL + '</style><div class="rel-doc">' + corpo + '</div><script>onload=function(){print()}<\/script>'); w.document.close(); };
    $('relCopia').onclick = function(){ navigator.clipboard.writeText(texto).then(function(){ aviso('ok', '✓ Texto do relatório copiado.'); }); };
    $('relEmail').onclick = function(){ location.href = 'mailto:?subject=' + encodeURIComponent('UNIPBRAS · Relatório de ' + nomeMes) + '&body=' + encodeURIComponent(texto.slice(0, 1800)); };
  }
  var CSS_REL = 'body{font-family:Georgia,serif;color:#241C13;margin:30px}.rel-doc header{display:flex;gap:18px;align-items:center;border-bottom:3px solid #B5790C;padding-bottom:12px;margin-bottom:16px}.rel-doc header img{height:70px}.rel-doc h1{margin:0;font-size:22px;color:#0F3312}.rel-doc header p{margin:4px 0 0;text-transform:capitalize}.rel-doc h3{color:#0F3312;border-bottom:1px solid #ddd;padding-bottom:4px;margin-top:22px}.rel-doc .resumo{background:#F3E7CC;padding:12px 14px;border-radius:8px}.rel-doc .vazio{color:#777;font-style:italic}.rel-doc footer{margin-top:30px;font-size:12px;color:#666;border-top:1px solid #ddd;padding-top:8px}';

  /* --- backup completo --- */
  async function backup(){
    var pacote = {gerado: new Date().toISOString(), site: 'www.unipbras.com.br', dadosSite: D, galeria: await jsonDe('galeria.json'), noticias: await jsonDe('noticias.json'), restritoCifrado: await jsonDe(ARQ_R)};
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(pacote, null, 2)], {type:'application/json'}));
    a.download = 'backup-unipbras-' + hoje() + '.json'; document.body.appendChild(a); a.click(); a.remove();
    aviso('ok', '✓ Backup baixado. Os dados restritos vão criptografados: só abrem com a senha.');
  }

  /* --- login / sessão --- */
  var modal = $('admModal'), area = $('adm'), senha = $('admSenha'), erro = $('admErro'), btnE = $('admEntrar'), tokIn = $('admToken');
  function abreModal(){ modal.hidden = false; erro.hidden = true; senha.value = '';
    var tem = false; try{ tem = !!localStorage.getItem(CHAVE_TOKEN); }catch(e){}
    setTimeout(function(){ senha.focus(); }, 50); }
  function fechaModal(){ modal.hidden = true; }
  async function ativa(pw, rola){
    R = await decifra(pw); PW = pw;
    TOKEN = R.chaveGithub || null;
    PODE = TOKEN ? await podeEscrever(TOKEN) : false;
    document.body.classList.add('adm-ok'); area.hidden = false;
    if (PODE && window.VG_login) try{ window.VG_login(TOKEN); }catch(e){}
    var espera = function(){ if (D){ renderTudo(); renderPainel(); } else setTimeout(espera, 200); }; espera();
    if (rola !== false) setTimeout(function(){ area.scrollIntoView({behavior:'smooth', block:'start'}); }, 200);
  }
  async function entra(){
    if (!senha.value) return; btnE.disabled = true; btnE.textContent = 'Verificando...'; erro.hidden = true;
    try{
      await decifra(senha.value);
      try{ sessionStorage.setItem(CHAVE_SESSAO, senha.value); }catch(e){}
      var pw = senha.value; fechaModal(); await ativa(pw);
    }catch(e){ erro.textContent = 'Senha incorreta. Tente novamente.'; erro.hidden = false; senha.value = ''; senha.focus(); }
    btnE.disabled = false; btnE.innerHTML = '&#128275; Entrar';
  }
  function sai(){
    R = PW = null; PODE = false; document.body.classList.remove('adm-ok'); area.hidden = true; $('admPainel').innerHTML = '';
    try{ sessionStorage.removeItem(CHAVE_SESSAO); }catch(e){}
    if (window.VG_sair) try{ window.VG_sair(); }catch(e){}
    renderVideos(); window.scrollTo({top:0, behavior:'smooth'});
  }
  $('navAdmBtn').addEventListener('click', function(e){ e.preventDefault(); if (PW) area.scrollIntoView({behavior:'smooth'}); else abreModal(); });
  $('admFechar').addEventListener('click', fechaModal);
  modal.addEventListener('click', function(e){ if (e.target === modal) fechaModal(); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && !modal.hidden) fechaModal(); });
  btnE.addEventListener('click', entra);
  senha.addEventListener('keydown', function(e){ if (e.key === 'Enter') entra(); });
  $('admSair').addEventListener('click', sai);
  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('#admPainel [data-a]'); if (b){ acao(b.getAttribute('data-a'), b); return; }
    var ir = e.target.closest && e.target.closest('[data-adm-ir]');
    if (ir){ var alvo = ir.getAttribute('data-adm-ir'), sec = $(alvo); if (sec) sec.scrollIntoView({behavior:'smooth'});
      if (!PODE) aviso('aviso', 'Sem conexão para publicar no momento.'); }
  });
  try{ var s = sessionStorage.getItem(CHAVE_SESSAO); if (s) ativa(s, false).catch(function(){ try{ sessionStorage.removeItem(CHAVE_SESSAO); }catch(e){} }); }catch(e){}
})();
