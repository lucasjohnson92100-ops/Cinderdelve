/* Traduction à l'exécution (FR -> EN). Le jeu est écrit en français ; en anglais, tout texte affiché (DOM et canvas) passe par un dictionnaire.
   Dictionnaire : tools/i18n/en.json (généré/injecté par tools/i18n_build.py). Choix de la langue : bouton FR/EN de l'écran-titre ou Réglages ; sinon langue du navigateur. */
(function () {
  var LANG = "fr", q = (location.search.match(/[?&]lang=(fr|en)/) || [])[1]; /* ?lang=fr ou ?lang=en force la langue (outils de test) */
  try { LANG = q || localStorage.getItem("cd-lang") || ((navigator.language || "fr").slice(0, 2).toLowerCase() === "fr" ? "fr" : "en"); } catch (e) {}
  window.__lang = LANG;
  window.I18N = { lang: LANG, set: function (l) { try { localStorage.setItem("cd-lang", l); } catch (e) {} location.reload(); } };
  document.documentElement.lang = LANG;
  /* bouton FR | EN sur l'écran-titre */
  document.addEventListener("DOMContentLoaded", function () {
    var t = document.getElementById("tap-start"); if (!t) return;
    var b = document.createElement("div"); b.id = "ts-lang"; b.setAttribute("role", "group"); b.setAttribute("aria-label", "Language");
    b.innerHTML = '<button type="button" data-l="fr"' + (LANG === "fr" ? ' class="on"' : "") + ">FR</button><button type=\"button\" data-l=\"en\"" + (LANG === "en" ? ' class="on"' : "") + ">EN</button>";
    b.style.cssText = "position:absolute;z-index:5;top:max(12px,env(safe-area-inset-top,0px));right:12px;display:flex;gap:4px;font:700 13px Georgia,serif";
    var st = document.createElement("style"); st.textContent = "#ts-lang button{background:rgba(10,3,6,.65);color:#ffd98a;border:2px solid rgba(255,200,100,.5);border-radius:8px;padding:6px 10px;font:inherit;cursor:pointer;opacity:.7}#ts-lang button.on{opacity:1;background:#ffd23c;color:#2a0a08;border-color:#14070a}";
    document.head.appendChild(st); t.appendChild(b);
    ["click", "touchend", "pointerdown"].forEach(function (ev) { b.addEventListener(ev, function (e) { e.stopPropagation(); if (ev === "click" && e.target.dataset && e.target.dataset.l && e.target.dataset.l !== LANG) window.I18N.set(e.target.dataset.l); }); });
  });
  if (LANG === "fr") { window.__t = function (s) { return s; }; return; }
  var D = __DICT__;
  var exact = Object.create(null), keys = [], k;
  for (k in D) { if (D[k] !== k) { exact[k] = D[k]; keys.push(k); } }
  var trimmed = Object.create(null);
  keys.forEach(function (kk) { var t = kk.trim(); if (t && t !== kk && !(t in exact)) trimmed[t] = D[kk].trim(); });
  keys.sort(function (a, b) { return b.length - a.length; });
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  var parts = keys.filter(function (kk) { return kk.length >= 3 && /[A-Za-zÀ-ÿ]{2,}/.test(kk); }).map(function (kk) {
    var a = /^[\p{L}\p{N}]/u.test(kk) ? "(?<![\\p{L}\\p{N}])" : "", b = /[\p{L}\p{N}]$/u.test(kk) ? "(?![\\p{L}\\p{N}])" : "";
    return a + esc(kk) + b;
  });
  var RX = null; try { RX = new RegExp(parts.join("|"), "gu"); } catch (e) { RX = null; }
  var cache = new Map(), HAS = /[A-Za-zÀ-ÿ]{2,}/;
  function tr(s) {
    if (typeof s !== "string" || s.length < 2 || !HAS.test(s)) return s;
    var c = cache.get(s); if (c !== undefined) return c;
    var r = exact[s];
    if (r === undefined) { var t = s.trim(); if (t !== s && trimmed[t] !== undefined) r = s.slice(0, s.length - s.trimStart().length) + trimmed[t] + s.slice(s.trimEnd().length); }
    if (r === undefined) r = RX ? s.replace(RX, function (m) { return exact[m] !== undefined ? exact[m] : m; }) : s;
    if (r.indexOf("PV") >= 0) r = r.replace(/\bPV\b/g, "HP");
    if (cache.size > 6000) cache.clear(); cache.set(s, r); return r;
  }
  window.__t = tr;
  /* canvas */
  var P = CanvasRenderingContext2D.prototype, ft = P.fillText, st = P.strokeText, mt = P.measureText;
  P.fillText = function (t) { arguments[0] = tr(String(t)); return ft.apply(this, arguments); };
  P.strokeText = function (t) { arguments[0] = tr(String(t)); return st.apply(this, arguments); };
  P.measureText = function (t) { return mt.call(this, tr(String(t))); };
  /* boîtes de dialogue */
  ["alert", "confirm", "prompt"].forEach(function (n) { var o = window[n]; if (o) window[n] = function (m) { arguments[0] = tr(String(m)); return o.apply(window, arguments); }; });
  /* DOM */
  var ATTR = ["title", "aria-label", "placeholder", "alt", "data-n"];
  function fixText(n) { var pt = n.parentNode; if (pt && (pt.nodeName === "SCRIPT" || pt.nodeName === "STYLE")) return; var v = n.nodeValue; if (!v || n.__tr === v) return; var r = tr(v); if (r !== v) { n.__tr = r; n.nodeValue = r; } else n.__tr = v; }
  function fixAttrs(el) { for (var i = 0; i < ATTR.length; i++) { var v = el.getAttribute && el.getAttribute(ATTR[i]); if (v) { var r = tr(v); if (r !== v) el.setAttribute(ATTR[i], r); } } }
  function walk(n) {
    if (n.nodeType === 3) { fixText(n); return; }
    if (n.nodeType !== 1) return;
    var tag = n.tagName; if (tag === "SCRIPT" || tag === "STYLE") return;
    fixAttrs(n); for (var c = n.firstChild; c; c = c.nextSibling) walk(c);
  }
  var busy = false;
  var mo = new MutationObserver(function (list) {
    if (busy) return; busy = true;
    try {
      for (var i = 0; i < list.length; i++) {
        var m = list[i];
        if (m.type === "characterData") fixText(m.target);
        else if (m.type === "attributes") fixAttrs(m.target);
        else for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
      }
    } finally { busy = false; }
  });
  mo.observe(document, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTR });
  document.addEventListener("DOMContentLoaded", function () { walk(document.documentElement); try { document.title = tr(document.title); var md = document.querySelector('meta[name="description"]'); if (md) md.content = "Cinderdelve: a real-time action roguelike. Dodge, parry, cast spells and craft your build."; } catch (e) {} });
})();
