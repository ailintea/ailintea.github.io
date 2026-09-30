/* ===== AILIN TEA PRACTICE — behavior ===== */
(function(){
  'use strict';

  /* mobile menu */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav){
    burger.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded','false');
      });
    });
  }

  /* reveal on scroll */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, {threshold:0.12, rootMargin:'0px 0px -8% 0px'});
    reveals.forEach(function(el){ io.observe(el); });
  } else {
    reveals.forEach(function(el){ el.classList.add('in'); });
  }

  /* active nav link on scroll */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id], section#top'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  var byId = {};
  navLinks.forEach(function(a){ byId[a.getAttribute('href').slice(1)] = a; });
  function onScroll(){
    var pos = window.scrollY + 120;
    var current = null;
    sections.forEach(function(s){ if (s.offsetTop <= pos) current = s.id; });
    navLinks.forEach(function(a){ a.classList.remove('active'); });
    if (current && byId[current]) byId[current].classList.add('active');
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* lightbox (документы, награды, QR-коды и содержательные фотографии) */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCaption');
  var lbClose = document.getElementById('lbClose');
  var lastTrigger = null;
  function openLb(src, cap, alt){
    lbImg.src = src; lbImg.alt = alt || cap || '';
    lbCap.textContent = cap || '';
    lb.classList.add('open'); lb.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function closeLb(){
    if (!lb.classList.contains('open')) return;
    lb.classList.remove('open'); lb.setAttribute('aria-hidden','true');
    document.body.style.overflow = ''; lbImg.src = '';
    if (lastTrigger) { lastTrigger.focus({preventScroll:true}); lastTrigger = null; }
  }
  /* фотографии в разделах (сетки, портреты, фото экспертизы, карточки чая) открываются тем же окном.
     Фон главного экрана и логотип сюда не входят. Подписи у фото нет: на сайте фото без подписей */
  document.querySelectorAll('.ph, .expertise-photo img, .tea-img img').forEach(function(img){
    if (img.classList.contains('zoomable')) return;
    img.classList.add('zoomable', 'zoomable-photo');
    img.setAttribute('tabindex', '0'); img.setAttribute('role', 'button');
  });
  document.querySelectorAll('.zoomable').forEach(function(img){
    function zoom(e){
      /* не переходить по родительской ссылке (QR внутри ссылки Telegram) */
      e.preventDefault(); e.stopPropagation();
      lastTrigger = img;
      openLb(img.getAttribute('data-full') || img.currentSrc || img.src, img.getAttribute('data-caption') || '', img.alt);
    }
    img.addEventListener('click', zoom);
    img.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' ') zoom(e);
    });
  });
  if (lb){
    lb.addEventListener('click', function(e){ if (e.target === lb || e.target === lbImg) closeLb(); });
    lbClose.addEventListener('click', closeLb);
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeLb(); });
  }

  /* WeChat: скопировать ID */
  document.querySelectorAll('.wechat-copy').forEach(function(btn){
    var original = btn.textContent;
    btn.addEventListener('click', function(){
      var id = btn.getAttribute('data-copy') || '';
      function done(){
        btn.textContent = 'ID скопирован ✓';
        btn.classList.add('copied');
        setTimeout(function(){ btn.textContent = original; btn.classList.remove('copied'); }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(id).then(done).catch(fallback);
      } else { fallback(); }
      function fallback(){
        try {
          var ta = document.createElement('textarea');
          ta.value = id; ta.style.position='fixed'; ta.style.opacity='0';
          document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); document.body.removeChild(ta); done();
        } catch(x){ /* тихо игнорируем */ }
      }
    });
  });

  /* липкая мобильная панель: прячем, когда виден блок контактов */
  var mcta = document.querySelector('.mobile-cta');
  var contacts = document.getElementById('contacts');
  if (mcta && contacts && 'IntersectionObserver' in window){
    new IntersectionObserver(function(entries){
      mcta.style.display = entries[0].isIntersecting ? 'none' : '';
    }, {threshold:0.05}).observe(contacts);
  }

  /* contact form -> Telegram */
  window.openTelegram = function(e){
    e.preventDefault();
    var f = e.target;
    var parts = [];
    if (f.name.value) parts.push('Имя: ' + f.name.value);
    if (f.place.value) parts.push('Город/страна: ' + f.place.value);
    if (f.contact.value) parts.push('Контакт: ' + f.contact.value);
    if (f.who.value) parts.push('Кто: ' + f.who.value);
    if (f.message.value) parts.push('Запрос: ' + f.message.value);
    var text = parts.join('\n');
    if (text && navigator.clipboard){
      navigator.clipboard.writeText(text).then(function(){
        try { alert('Сообщение скопировано. Вставьте его в чат Telegram.'); } catch(x){}
      }).catch(function(){});
    }
    window.open('https://t.me/a_linshar', '_blank', 'noopener');
    return false;
  };
})();
