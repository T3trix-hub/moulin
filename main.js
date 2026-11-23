(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var qa = function (s) { return Array.prototype.slice.call(d.querySelectorAll(s)); };
  var tb = d.getElementById('theme');
  function setTheme(t, save) {
    root.dataset.theme = t;
    if (tb) { tb.setAttribute('aria-pressed', String(t === 'dark')); tb.setAttribute('aria-label', t === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'); }
    if (save) { try { localStorage.setItem('theme', t); } catch (e) {} }
  }
  setTheme(root.dataset.theme || 'light', false);
  if (tb) tb.addEventListener('click', function () { setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true); });
  var bg = d.getElementById('burger'), nav = d.getElementById('nav');
  if (bg && nav) bg.addEventListener('click', function () {
    var o = nav.classList.toggle('open');
    bg.setAttribute('aria-expanded', String(o)); bg.setAttribute('aria-label', o ? 'Закрыть меню' : 'Открыть меню');
  });
  // Фильтр меню
  var chips = qa('.chip'), groups = qa('.mg');
  chips.forEach(function (c) { c.addEventListener('click', function () {
    chips.forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); });
    groups.forEach(function (g) { g.hidden = !(c.dataset.f === 'all' || g.dataset.cat === c.dataset.f); });
  }); });
  // Фишка: набор для заказа
  var rows = qa('.set li'), sum = d.getElementById('sum'), st = d.getElementById('st');
  function msg() {
    var a = [];
    rows.forEach(function (li) { var c = +li.dataset.c; if (c) a.push(li.dataset.n + ' ×' + c); });
    return a.length ? 'Здравствуйте! Хочу заказать: ' + a.join(', ') + '. Подскажите, пожалуйста, что есть в наличии и сколько это стоит.' : '';
  }
  function show() { sum.textContent = msg() || 'Пока ничего не выбрано.'; if (st) st.textContent = ''; }
  rows.forEach(function (li) {
    Array.prototype.forEach.call(li.querySelectorAll('[data-d]'), function (b) {
      b.addEventListener('click', function () {
        var c = Math.max(0, Math.min(20, (+li.dataset.c) + (+b.dataset.d)));
        li.dataset.c = c; li.querySelector('output').textContent = c; show();
      });
    });
  });
  function copy() {
    var t = msg();
    if (!t) { if (st) st.textContent = 'Сначала выберите десерты.'; return false; }
    try { navigator.clipboard.writeText(t); } catch (e) {
      var x = d.createElement('textarea'); x.value = t; d.body.appendChild(x); x.select();
      try { d.execCommand('copy'); } catch (e2) {} d.body.removeChild(x);
    }
    if (st) st.textContent = 'Сообщение скопировано. Вставьте его в чат с нами.';
    return true;
  }
  var cb = d.getElementById('copy'), tg = d.getElementById('tg');
  if (cb) cb.addEventListener('click', copy);
  if (tg) tg.addEventListener('click', function () { copy(); });
  // Фишка: табличка «Открыто / Закрыто» по минскому времени (07:30–21:30, ежедневно)
  var dr = d.getElementById('door');
  if (dr) {
    var ds = d.getElementById('dst'), dt = d.getElementById('dtx'), dh = d.getElementById('dh');
    var minutes = function () {
      try {
        var h = 0, m = 0;
        new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Minsk', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
          .formatToParts(new Date()).forEach(function (x) { if (x.type === 'hour') h = +x.value; if (x.type === 'minute') m = +x.value; });
        return h * 60 + m;
      } catch (e) { var n = new Date(); return n.getHours() * 60 + n.getMinutes(); }
    };
    var tick2 = function () {
      var m = minutes(), open = m >= 450 && m < 1290;
      ds.textContent = open ? 'Открыто' : 'Закрыто';
      dt.textContent = open ? 'до 21:30' : (m < 450 ? 'откроемся в 07:30' : 'откроемся завтра в 07:30');
      dh.textContent = open ? '♥' : '♡';
      dr.classList.toggle('shut', !open);
    };
    tick2(); setInterval(tick2, 60000);
    dr.addEventListener('click', function () { dr.classList.remove('swing'); void dr.offsetWidth; dr.classList.add('swing'); });
  }

  // Появление и полоска прокрутки
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches, els = qa('.reveal');
  if (calm || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); }
  else {
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
    var p = d.getElementById('prog'), tick = false;
    var upd = function () { var h = root.scrollHeight - root.clientHeight; if (p) p.style.transform = 'scaleX(' + (h > 0 ? root.scrollTop / h : 0) + ')'; tick = false; };
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true }); upd();
  }
})();
