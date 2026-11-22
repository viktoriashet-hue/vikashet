/* Счётчики и cookie-согласие для сайта vikashet.
   Google Analytics 4 работает в Consent Mode v2: до согласия — без cookie,
   после «Принять» — полностью. Яндекс Метрика загружается только после согласия. */
(function () {
  var GA_ID = 'G-ZQ5NM312RY';
  var YM_ID = 114270520; // номер счётчика Яндекс Метрики
  var KEY = 'vs_cookie_consent'; // 'granted' | 'denied'
  var BASE = '/';

  function getChoice() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setChoice(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  // --- Google tag + Consent Mode v2 ---
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  var choice = getChoice();
  gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    analytics_storage: choice === 'granted' ? 'granted' : 'denied',
    wait_for_update: 500
  });
  var g = document.createElement('script');
  g.async = true;
  g.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(g);
  gtag('js', new Date());
  gtag('config', GA_ID);

  // --- Яндекс Метрика (только после согласия) ---
  var ymLoaded = false;
  function loadYM() {
    if (ymLoaded || !YM_ID) return;
    ymLoaded = true;
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      k = e.createElement(t); a = e.getElementsByTagName(t)[0];
      k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
    window.ym(YM_ID, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true });
  }

  function grant() {
    setChoice('granted');
    gtag('consent', 'update', { analytics_storage: 'granted' });
    loadYM();
  }
  function deny() { setChoice('denied'); }

  // --- Цели: клики по Telegram/WhatsApp/почте ---
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var h = a.getAttribute('href') || '';
    var goal = /t\.me\//.test(h) ? 'click_telegram' : /wa\.me|whatsapp/.test(h) ? 'click_whatsapp' : /^mailto:/.test(h) ? 'click_email' : null;
    if (!goal) return;
    gtag('event', goal, { link_url: h });
    if (window.ym && YM_ID) window.ym(YM_ID, 'reachGoal', goal);
  });

  if (choice === 'granted') { loadYM(); return; }
  if (choice === 'denied') return;

  // --- Баннер ---
  function showBanner() {
    var b = document.createElement('div');
    b.id = 'cookie-banner';
    b.setAttribute('role', 'dialog');
    b.innerHTML =
      '<p>Я использую cookie и сервисы аналитики (Яндекс Метрика, Google Analytics), чтобы понимать, какие материалы полезны. ' +
      '<a href="' + BASE + 'privacy.html">Подробнее</a></p>' +
      '<div><button type="button" data-c="no">Только необходимые</button>' +
      '<button type="button" data-c="yes">Принять</button></div>';
    var s = document.createElement('style');
    s.textContent =
      '#cookie-banner{position:fixed;left:16px;right:16px;bottom:16px;max-width:620px;margin:0 auto;z-index:9999;' +
      'background:#1A1A1A;color:#fff;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:16px 18px;' +
      'font:500 14px/1.5 Manrope,system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.4);display:flex;gap:14px;align-items:center;flex-wrap:wrap}' +
      '#cookie-banner p{flex:1 1 300px;margin:0;color:#ccc}#cookie-banner a{color:#A855F7}' +
      '#cookie-banner div{display:flex;gap:8px}#cookie-banner button{cursor:pointer;border-radius:10px;padding:9px 14px;' +
      'font:700 13px Manrope,system-ui,sans-serif;border:1px solid rgba(255,255,255,.2);background:transparent;color:#fff}' +
      '#cookie-banner button[data-c=yes]{background:#E8372C;border-color:#E8372C}';
    document.head.appendChild(s);
    document.body.appendChild(b);
    b.addEventListener('click', function (e) {
      var c = e.target.getAttribute && e.target.getAttribute('data-c');
      if (!c) return;
      c === 'yes' ? grant() : deny();
      b.remove();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showBanner);
  else showBanner();
})();
