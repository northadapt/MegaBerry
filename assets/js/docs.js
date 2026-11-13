/* Behaviour for documentation pages (developers.html). Each block only runs if its markup exists. */
(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- Left nav: collapsible on small screens, scroll-spy on all ---------- */
  var nav = $("[data-docs-nav]");
  if (nav) {
    var mq = window.matchMedia("(max-width: 960px)");
    var sync = function () { nav.open = !mq.matches; };
    sync();
    if (mq.addEventListener) mq.addEventListener("change", sync);
    $$("a", nav).forEach(function (a) {
      a.addEventListener("click", function () { if (mq.matches) nav.open = false; });
    });

    var links = {};
    $$('a[href^="#"]', nav).forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var sections = $$(".doc > section[id]").filter(function (s) { return links[s.id]; });
    var setCurrent = function (id) {
      Object.keys(links).forEach(function (k) {
        if (k === id) links[k].setAttribute("aria-current", "true");
        else links[k].removeAttribute("aria-current");
      });
    };
    if (sections.length && "IntersectionObserver" in window) {
      var visible = {};
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
        for (var i = 0; i < sections.length; i++) {
          if (visible[sections[i].id]) { setCurrent(sections[i].id); return; }
        }
      }, { rootMargin: "-90px 0px -60% 0px" });
      sections.forEach(function (s) { io.observe(s); });
    }
    setCurrent(sections.length ? sections[0].id : null);
  }

  /* ---- Code tabs ---------------------------------------------------------- */
  $$("[data-codetabs]").forEach(function (root) {
    var tabs = $$('[role="tab"]', root);
    var panels = $$('[role="tabpanel"]', root);
    var select = function (tab, focus) {
      tabs.forEach(function (t, i) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab, false); });
      tab.addEventListener("keydown", function (e) {
        var j = null;
        if (e.key === "ArrowRight") j = (i + 1) % tabs.length;
        if (e.key === "ArrowLeft") j = (i - 1 + tabs.length) % tabs.length;
        if (e.key === "Home") j = 0;
        if (e.key === "End") j = tabs.length - 1;
        if (j !== null) { e.preventDefault(); select(tabs[j], true); }
      });
    });
  });

  /* ---- Copy buttons ------------------------------------------------------- */
  $$("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var host = btn.closest(".codetabs, .codeblock");
      if (!host) return;
      var pre = $$("pre", host).filter(function (p) { return !p.closest("[hidden]"); })[0];
      if (!pre) return;
      var label = $("span", btn), old = label.textContent;
      var done = function (msg) { label.textContent = msg; setTimeout(function () { label.textContent = old; }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(pre.textContent).then(function () { done("Copied"); }, function () { done("Copy blocked"); });
      } else { done("Copy blocked"); }
    });
  });

  /* ---- Operations browser: scope chips + text filter --------------------- */
  $$("[data-ops]").forEach(function (root) {
    var chips = $$("[data-ops-filter]", root);
    var search = $("[data-ops-search]", root);
    var empty = $("[data-ops-empty]", root);
    var scopes = $$("[data-scope]", root);
    var scope = "all";

    var run = function () {
      var q = search.value.trim().toLowerCase();
      var shown = 0;
      scopes.forEach(function (card) {
        var inScope = scope === "all" || card.getAttribute("data-scope") === scope;
        var name = card.getAttribute("data-scope").toLowerCase();
        var nameHit = !!q && name.indexOf(q) !== -1;
        var rows = $$("[data-op]", card), rowHits = 0;
        rows.forEach(function (r) {
          var hit = !q || nameHit || r.textContent.toLowerCase().indexOf(q) !== -1;
          r.hidden = !hit;
          if (hit) rowHits++;
        });
        card.hidden = !inScope || rowHits === 0;
        if (!card.hidden) shown += rowHits;
      });
      empty.hidden = shown !== 0;
    };

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        scope = chip.getAttribute("data-ops-filter");
        chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
        run();
      });
    });
    search.addEventListener("input", run);
  });
})();
