// AdSense slots. Renders NOTHING unless ADSENSE_CLIENT_ID is set in config.js.
// No ad script is loaded, no request is made and no empty box appears until
// the site has been added in AdSense and approved.
(function () {
  var cfg = window.SITE_CONFIG || {};
  if (!cfg.ADSENSE_CLIENT_ID) return;
  var slots = document.querySelectorAll("[data-ad-slot]");
  if (!slots.length) return;
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + cfg.ADSENSE_CLIENT_ID;
  s.crossOrigin = "anonymous";
  document.head.appendChild(s);
  slots.forEach(function (el) {
    var ins = document.createElement("ins");
    ins.className = "adsbygoogle";
    ins.style.display = "block";
    ins.setAttribute("data-ad-client", cfg.ADSENSE_CLIENT_ID);
    if (cfg.ADSENSE_SLOT_ID) ins.setAttribute("data-ad-slot", cfg.ADSENSE_SLOT_ID);
    ins.setAttribute("data-ad-format", "auto");
    ins.setAttribute("data-full-width-responsive", "true");
    el.appendChild(ins);
  });
  (window.adsbygoogle = window.adsbygoogle || []).push({});
})();
