/* Behaviour for all pages. Each block only runs if its markup exists. */
(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var cfg = (window.MB && window.MB.config) || {};

  /* ---- Mobile menu ----------------------------------------------------- */
  var menuBtn = $(".nav-toggle");
  var nav = $("#primary-nav");
  if (menuBtn && nav) {
    var setMenu = function (open) {
      nav.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    nav.addEventListener("click", function (e) { if (e.target.tagName === "A") setMenu(false); });
  }

  /* ---- Footer year ----------------------------------------------------- */
  $$("[data-year]").forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ---- Identity-control tabs (home + avatars) --------------------------- */
  var SETS = {
    hair: { kind: "hair", items: [["Base", "#17100f"], ["Blonde", "#d8b26a"], ["Ginger", "#b3501f"], ["Bald", "transparent"], ["Curly", "#2b1a14"], ["Ponytail", "#1a1210"]] },
    eyes: { kind: "dot", items: [["Base", "#3b2a20"], ["Green", "#4f7a4a"], ["Blue", "#4a79b5"], ["Hazel", "#8a6a3a"], ["Grey", "#8c939b"], ["Amber", "#b9812b"]] },
    expression: { kind: "none", items: [["Base"], ["Smile"], ["Neutral"], ["Serious"], ["Laugh"], ["Surprised"]] },
    outfit: { kind: "dot", items: [["Base", "#2f4fb8"], ["Blazer", "#2b2a33"], ["Knit", "#c9b79c"], ["Athletic", "#1d6b5b"], ["Evening", "#7a1630"], ["Streetwear", "#8a8f98"]] },
    pose: { kind: "none", items: [["Base"], ["Seated"], ["Walking"], ["Profile"], ["Arms crossed"], ["Looking back"]] },
    props: { kind: "none", items: [["None"], ["Phone"], ["Coffee"], ["Handbag"], ["Headphones"], ["Camera"]] },
    style: { kind: "none", items: [["Base"], ["Editorial"], ["Documentary"], ["Cinematic"], ["Studio"], ["Film grain"]] }
  };

  function renderVariants(host, set) {
    host.textContent = "";
    set.items.forEach(function (v, i) {
      var tile = document.createElement("div");
      tile.className = "variant" + (i === 0 ? " is-base" : "");
      var sil = document.createElement("span");
      sil.className = "sil";
      if (set.kind === "hair") {
        sil.style.setProperty("--tone", v[1]);
        sil.appendChild(document.createElement("i"));
      }
      tile.appendChild(sil);
      if (set.kind === "dot" && v[1]) {
        var dot = document.createElement("span");
        dot.className = "variant__dot";
        dot.style.background = v[1];
        tile.appendChild(dot);
      }
      var label = document.createElement("span");
      label.className = "variant__label";
      label.textContent = v[0];
      tile.appendChild(label);
      host.appendChild(tile);
    });
  }

  $$("[data-tabs]").forEach(function (root) {
    var tabs = $$('[role="tab"]', root);
    var host = $(".variants", root);
    var panel = $('[role="tabpanel"]', root);
    if (!tabs.length || !host) return;

    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
      });
      if (panel) panel.setAttribute("aria-labelledby", tab.id);
      renderVariants(host, SETS[tab.getAttribute("data-set")]);
      if (focus) tab.focus();
    }

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
    select(tabs[0], false);
  });

  /* ---- Tools demo (home): segmented control + tool chips ---------------- */
  /* Copy and settings are illustrative. Replace names/values with the real product's. */
  var TOOLS = {
    edit: {
      label: "Apex Edit",
      tools: [
        { id: "hair", name: "Hairstyle", set: "hair", text: "Change the cut, length and style. Face and body likeness stay locked.", rows: [["hairstyle", "ponytail"], ["hair_color", "keep"], ["identity", "locked"]] },
        { id: "pose", name: "Poses", set: "pose", text: "Re-pose the same person: seated, walking, in profile or looking back.", rows: [["pose", "walking"], ["framing", "full body"], ["identity", "locked"]] },
        { id: "expression", name: "Expressions", set: "expression", text: "Direct the performance without changing who is in the shot.", rows: [["expression", "smile"], ["intensity", "natural"], ["identity", "locked"]] },
        { id: "outfit", name: "Outfits", set: "outfit", text: "Dress the same talent for any brief, from workwear to evening.", rows: [["outfit", "blazer"], ["fit", "tailored"], ["identity", "locked"]] },
        { id: "lighting", name: "Dim Lighting", set: "style", text: "Relight the scene for mood. The person is unchanged.", rows: [["lighting", "dim"], ["style", "cinematic"], ["identity", "locked"]] }
      ]
    },
    video: {
      label: "Apex Video",
      tools: [
        { id: "motion", name: "Motion", video: true, text: "Bring a locked identity to life with Apex Video Motion.", rows: [["tool", "apex_video_motion"], ["duration", "5s"], ["identity", "locked"]] },
        { id: "multishot", name: "Multi-shot", video: true, text: "Cut several shots together with the same character in every one.", rows: [["tool", "multi_shot"], ["shots", "4"], ["identity", "locked"]] }
      ]
    }
  };

  $$("[data-tools]").forEach(function (root) {
    var segs = $$("[data-group]", root);
    var chipHost = $("[data-tools-chips]", root);
    var title = $("[data-tools-title]", root);
    var text = $("[data-tools-text]", root);
    var code = $("[data-tools-code]", root);
    var head = $("[data-tools-head]", root);
    var variants = $(".variants", root);
    var videoFrame = $("[data-tools-video]", root);
    var copyBtn = $("[data-tools-copy]", root);
    var group = "edit", toolId = null;

    function drawTool() {
      var g = TOOLS[group];
      var tool = g.tools.filter(function (x) { return x.id === toolId; })[0] || g.tools[0];
      toolId = tool.id;
      $$("button", chipHost).forEach(function (b) {
        var on = b.getAttribute("data-tool") === tool.id;
        b.setAttribute("aria-selected", String(on));
        b.tabIndex = on ? 0 : -1;
      });
      title.textContent = tool.name;
      text.textContent = tool.text;
      head.textContent = g.label + " / " + tool.name;
      code.textContent = "";
      tool.rows.forEach(function (r, i) {
        var row = document.createElement("div"); row.className = "code__row";
        var ln = document.createElement("span"); ln.className = "code__ln"; ln.textContent = String(i + 1);
        var k = document.createElement("span"); k.className = "code__k"; k.textContent = r[0];
        var v = document.createElement("span"); v.className = "code__v"; v.textContent = r[1];
        row.appendChild(ln); row.appendChild(k); row.appendChild(v);
        code.appendChild(row);
      });
      variants.hidden = !!tool.video;
      videoFrame.hidden = !tool.video;
      if (!tool.video) renderVariants(variants, SETS[tool.set]);
    }

    function drawChips() {
      chipHost.textContent = "";
      TOOLS[group].tools.forEach(function (tool) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "chip chip--model"; b.setAttribute("role", "tab");
        b.setAttribute("data-tool", tool.id); b.textContent = tool.name;
        b.addEventListener("click", function () { toolId = tool.id; drawTool(); });
        chipHost.appendChild(b);
      });
    }

    function pickGroup(btn) {
      group = btn.getAttribute("data-group"); toolId = null;
      segs.forEach(function (s) { var on = s === btn; s.setAttribute("aria-selected", String(on)); s.tabIndex = on ? 0 : -1; });
      drawChips(); drawTool();
    }

    segs.forEach(function (btn, i) {
      btn.addEventListener("click", function () { pickGroup(btn); });
      btn.addEventListener("keydown", function (e) {
        var j = null;
        if (e.key === "ArrowRight") j = (i + 1) % segs.length;
        if (e.key === "ArrowLeft") j = (i - 1 + segs.length) % segs.length;
        if (j !== null) { e.preventDefault(); pickGroup(segs[j]); segs[j].focus(); }
      });
    });

    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var out = $$(".code__row", code).map(function (r) {
          return $(".code__k", r).textContent + ": " + $(".code__v", r).textContent;
        }).join("\n");
        var label = $("span", copyBtn), old = label.textContent;
        var done = function (msg) { label.textContent = msg; setTimeout(function () { label.textContent = old; }, 1600); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(out).then(function () { done("Copied"); }, function () { done("Copy blocked"); });
        } else { done("Copy blocked"); }
      });
    }

    pickGroup(segs[0]);
  });

  /* ---- FAQ page: live search, category counts, active category ---------------- */
  var faqSearch = $("[data-faq-search]");
  if (faqSearch) {
    var items = $$(".faq__item");
    var groups = $$("[data-group]");
    var empty = $("[data-faq-empty]");
    var countEl = $("[data-faq-count]");
    var total = items.length;
    var catLinks = {};
    $$("[data-cat]").forEach(function (a) { catLinks[a.getAttribute("data-cat")] = a; });
    var cta = $("[data-faq-cta]");
    var suggList = $("[data-faq-sugg-list]");
    /* when nothing matches: offer a few questions, preferring ones that share a word with the search */
    var suggest = function (q) {
      var words = q.split(/\s+/).filter(function (w) { return w.length > 2; });
      var scored = items.map(function (it) {
        var t = it.textContent.toLowerCase();
        var s = 0;
        words.forEach(function (w) { if (t.indexOf(w.slice(0, Math.max(3, w.length - 2))) !== -1) s++; });
        return { it: it, s: s, r: Math.random() };
      });
      scored.sort(function (a, b) { return (b.s - a.s) || (a.r - b.r); });
      var pick = scored.slice(0, 4);
      suggList.innerHTML = "";
      pick.forEach(function (p) {
        var li = document.createElement("li");
        var d = p.it.cloneNode(true);
        d.open = false;
        d.removeAttribute("hidden");
        li.appendChild(d);
        suggList.appendChild(li);
        if (window.mbDisclosure) window.mbDisclosure(d, $("summary", d), $(".faq__a", d));
      });
    };
    var wasEmpty = false;
    var run = function () {
      var q = faqSearch.value.trim().toLowerCase();
      var shown = 0;
      items.forEach(function (it) {
        var hit = !q || it.textContent.toLowerCase().indexOf(q) !== -1;
        it.hidden = !hit;
        if (hit) shown++;
      });
      groups.forEach(function (g) {
        var n = $$(".faq__item", g).filter(function (it) { return !it.hidden; }).length;
        g.hidden = n === 0;
        var badge = $("[data-group-n]", g);
        if (badge) badge.textContent = n;
        var link = catLinks[g.id];
        if (link) {
          $("em", link).textContent = n;
          link.classList.toggle("is-empty", n === 0);
        }
      });
      if (empty) empty.hidden = shown !== 0;
      if (cta) cta.hidden = shown === 0;
      if (shown === 0 && suggList && !wasEmpty) suggest(q);
      wasEmpty = shown === 0;
      if (countEl) countEl.textContent = q ? (shown === 0 ? "No matches" : shown + " of " + total + " questions") : total + " questions";
    };
    faqSearch.addEventListener("input", run);
    document.addEventListener("keydown", function (e) {
      var t = e.target;
      var typing = t && (/^(input|textarea|select)$/i.test(t.tagName) || t.isContentEditable);
      if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); faqSearch.focus(); }
      else if (e.key === "Escape" && t === faqSearch && faqSearch.value) { faqSearch.value = ""; run(); }
    });

    /* highlight the category currently in view */
    var setActive = function () {
      var line = window.innerHeight * 0.3;
      var current = null;
      groups.forEach(function (g) { if (!g.hidden && g.getBoundingClientRect().top <= line) current = g.id; });
      if (!current) { var first = groups.filter(function (g) { return !g.hidden; })[0]; current = first && first.id; }
      Object.keys(catLinks).forEach(function (id) { catLinks[id].classList.toggle("is-active", id === current); });
      var act = current && catLinks[current];
      var nav = act && act.parentNode;
      if (act && nav && nav.scrollWidth > nav.clientWidth) {
        var want = act.offsetLeft - (nav.clientWidth - act.offsetWidth) / 2;
        nav.scrollLeft += (want - nav.scrollLeft) * 0.4;
      }
    };
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; setActive(); }); }
    }, { passive: true });
    window.addEventListener("resize", setActive);
    setActive();
  }

  /* ---- Showcase filter -------------------------------------------------- */
  var filterGroup = $("[data-filter-group]");
  if (filterGroup) {
    var chips = $$("[data-filter]", filterGroup);
    var cards = $$("[data-cat]");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var f = chip.getAttribute("data-filter");
        chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
        cards.forEach(function (card) { card.hidden = !(f === "all" || card.getAttribute("data-cat") === f); });
      });
    });
  }

  /* ---- Contact form ----------------------------------------------------- */
  var form = $("[data-contact-form]");
  if (form) {
    var status = $("[data-form-status]", form);
    var say = function (msg, state) { status.textContent = msg; status.setAttribute("data-state", state || ""); };
    var KEY = "mb.pendingEnquiry";
    var draft = {
      get: function () { try { return JSON.parse(sessionStorage.getItem(KEY)); } catch (e) { return null; } },
      set: function (d) { try { sessionStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} },
      clear: function () { try { sessionStorage.removeItem(KEY); } catch (e) {} }
    };
    var send = function (data) {
      if (!cfg.formEndpoint) { say("The form isn't connected yet. Set formEndpoint in assets/js/layout.js.", "error"); return; }
      say(form.getAttribute("data-sending") || "Sending your enquiry…");
      fetch(cfg.formEndpoint, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); draft.clear(); form.reset(); say(form.getAttribute("data-success") || "Thanks, your enquiry is in. We'll be in touch shortly.", "ok"); })
        .catch(function () { say("Something went wrong sending that. Please try again.", "error"); });
    };
    /* Enquiries need an account: signed-out visitors go to sign in, then the saved enquiry is sent automatically. */
    var here = (location.pathname.split("/").pop() || "contact.html").replace(/[^\w.\-]/g, "");
    var toLogin = function () { window.location.href = "login.html?next=" + encodeURIComponent(here) + "&pending=enquiry"; };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      draft.set(data);
      if (cfg.sessionEndpoint) {
        fetch(cfg.sessionEndpoint, { credentials: "include" }).then(function (r) { if (r.ok) send(data); else toLogin(); }).catch(toLogin);
      } else toLogin();
    });
    if (/[?&]resume=1\b/.test(location.search)) {
      var saved = draft.get();
      if (window.history && history.replaceState) history.replaceState(null, "", location.pathname);
      if (saved) {
        Object.keys(saved).forEach(function (k) { if (form.elements[k]) form.elements[k].value = saved[k]; });
        send(saved);
      }
    }
  }
})();

/* ---- Auth redirects: where to go after signing in or up ---- */
(function () {
  var q = new URLSearchParams(location.search);
  var next = q.get("next") || "";
  if (!/^[\w\-\/]+(\.html)?$/.test(next) || next.indexOf("//") === 0) next = "";
  var pending = null;
  try { pending = sessionStorage.getItem("mb.pendingEnquiry"); } catch (e) {}
  window.mbAuthNext = {
    /* the page to return to, flagged so it can resume what the visitor was doing */
    url: function () { return next ? next + "?resume=1" : ""; }
  };
  var notice = document.querySelector("[data-auth-notice]");
  if (notice && next && q.get("pending") === "enquiry" && pending) {
    var signup = document.body.getAttribute("data-page") === "signup";
    notice.textContent = (signup ? "Create an account to send your enquiry." : "Sign in to send your enquiry.") + " We'll create the ticket as soon as you're in.";
    notice.hidden = false;
  }
  /* keep the redirect when switching between sign in and sign up */
  [].forEach.call(document.querySelectorAll('.auth__switch a[href="login.html"], .auth__switch a[href="signup.html"]'), function (a) {
    if (location.search) a.setAttribute("href", a.getAttribute("href") + location.search);
  });
})();

/* ---- Login page ---- */
(function () {
  var form = document.querySelector("[data-login-form]");
  if (!form) return;
  var cfg = (window.MB && window.MB.config) || {};
  var status = form.querySelector("[data-login-status]");
  var say = function (msg, state) { status.textContent = msg; status.setAttribute("data-state", state || ""); };
  var pw = form.querySelector("#login-password");
  var eye = form.querySelector("[data-pw-toggle]");
  eye.addEventListener("click", function () {
    var show = pw.type === "password";
    pw.type = show ? "text" : "password";
    eye.setAttribute("aria-pressed", String(show));
    eye.setAttribute("aria-label", show ? "Hide password" : "Show password");
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    /* Preview: Sign in goes straight through, no details needed. Replace with a real check (cfg.authEndpoint) when the backend is ready. */
    window.location.href = window.mbAuthNext.url() || "studio.html";
  });
  [].forEach.call(document.querySelectorAll("[data-auth-provider]"), function (b) {
    /* Preview: provider buttons go straight through. Replace with the real OAuth redirect. */
    b.addEventListener("click", function () { window.location.href = (window.mbAuthNext && window.mbAuthNext.url()) || "studio.html"; });
  });
})();

/* ---- App shell: mobile sidebar ---- */
(function () {
  var side = document.getElementById("app-side"), btn = document.querySelector("[data-app-menu]"), scrim = document.querySelector("[data-app-scrim]");
  if (!side || !btn) return;
  var set = function (open) { side.classList.toggle("is-open", open); scrim.hidden = !open; btn.setAttribute("aria-expanded", String(open)); };
  btn.addEventListener("click", function () { set(!side.classList.contains("is-open")); });
  scrim.addEventListener("click", function () { set(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") set(false); });
})();

/* ---- Support: ticket list, new-ticket dialog, ticket detail ---- */
(function () {
  var content = document.querySelector("[data-support-content]");
  if (!content) return;
  var cfg = (window.MB && window.MB.config) || {};
  var gate = document.querySelector("[data-support-gate]");
  var isDetail = !!content.querySelector("[data-d-thread]");
  var qs = new URLSearchParams(location.search);

  /* Sample tickets, shown until ticketsEndpoint is set in layout.js. */
  var DAY = 864e5, now = Date.now();
  var ago = function (d, h) { return new Date(now - d * DAY - (h || 0) * 36e5).toISOString(); };
  var SAMPLE = [
    { id: "m9nQRL3w2T4dhBXARabfabb6", subject: "Credits missing after upgrading my plan", category: "Billing and subscription", priority: "Normal", status: "open", unread: true, created: ago(1, 3), updated: ago(0, 5),
      messages: [
        { from: "you", date: ago(1, 3), text: "I upgraded to the Pro plan this morning, but my credit balance hasn't changed. Could you check it for me?" },
        { from: "support", date: ago(0, 5), text: "Thanks for getting in touch. We can see the upgrade went through and are checking why the credits haven't landed. We'll update you here shortly." }
      ] },
    { id: "k3Wd8ZpV1sYhQ6nLxTe0uJcR", subject: "Generation stuck on 90% for a video", category: "Studio and generation", priority: "High", status: "pending", created: ago(3), updated: ago(2, 2),
      messages: [
        { from: "you", date: ago(3), text: "My last two video generations have sat at 90% for over an hour. Is there an outage?" },
        { from: "support", date: ago(2, 2), text: "Sorry about that. We've found the stuck jobs and re-queued them, and your credits have been refunded. Please let us know if it happens again." }
      ] },
    { id: "b7HfG2mNaP9rXkD4wQz5tVyE", subject: "How do I lock my avatar's identity?", category: "Avatars and identity lock", priority: "Normal", status: "closed", created: ago(9), updated: ago(8),
      messages: [
        { from: "you", date: ago(9), text: "I've created an avatar but can't see where identity lock is turned on." },
        { from: "support", date: ago(8), text: "Identity lock is on from the moment an avatar is verified. Open the avatar page and look for the lock badge under its name. Let us know if it's missing." }
      ] },
    { id: "x5CtL8eRj0UqZ3vYnM6aBsKd", subject: "Can't sign in with Google", category: "Account and login", priority: "Urgent", status: "closed", created: ago(16), updated: ago(15),
      messages: [
        { from: "you", date: ago(16), text: "Google sign-in sends me back to the login page every time." },
        { from: "support", date: ago(15), text: "This was caused by a cookie issue on our side, which is now fixed. Please try again and tell us if it still fails." }
      ] },
    { id: "p2Va9GyHc4TnWb7XfEr1LmQs", subject: "Invoice for my last payment", category: "Billing and subscription", priority: "Normal", status: "closed", created: ago(31), updated: ago(30),
      messages: [
        { from: "you", date: ago(31), text: "Please could you send me a VAT invoice for my last payment?" },
        { from: "support", date: ago(30), text: "Done. The invoice has been emailed to your account address." }
      ] }
  ];

  var el = function (tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  var norm = function (s) { s = String(s || "open").toLowerCase(); return /progress|pending|wait/.test(s) ? "pending" : /clos|resolv/.test(s) ? "closed" : "open"; };
  var STATUS = { open: "Open", pending: "In progress", closed: "Closed" };
  var prioOf = function (p) { p = String(p || "Normal"); return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase(); };
  var fmtDate = function (v, time) {
    var d = new Date(v); if (isNaN(d)) return "";
    var o = { day: "numeric", month: "short" };
    if (d.getFullYear() !== new Date().getFullYear()) o.year = "numeric";
    if (time) { o.hour = "2-digit"; o.minute = "2-digit"; }
    return d.toLocaleString("en-GB", o);
  };
  var rel = function (v) {
    var d = new Date(v), m = Math.round((Date.now() - d) / 6e4);
    if (isNaN(d)) return "";
    if (m < 1) return "Just now";
    if (m < 60) return m + " min ago";
    if (m < 1440) { var h = Math.round(m / 60); return h + (h === 1 ? " hour ago" : " hours ago"); }
    var dd = Math.round(m / 1440);
    return dd === 1 ? "Yesterday" : dd < 7 ? dd + " days ago" : fmtDate(v);
  };
  var size = function (b) { return b < 1048576 ? Math.max(1, Math.round(b / 1024)) + " KB" : (b / 1048576).toFixed(1).replace(/\.0$/, "") + " MB"; };
  var MAX_FILES = 5, MAX_MB = 10;
  /* Attachment picker shared by the new-ticket and reply forms: limits, sizes, drag and drop. */
  var attach = function (input, listEl, zone, say) {
    var files = [];
    var paint = function () {
      listEl.innerHTML = ""; listEl.hidden = !files.length;
      files.forEach(function (f, i) {
        var li = el("li"), b = el("button", null, "Remove"); b.type = "button";
        b.addEventListener("click", function () { files.splice(i, 1); paint(); });
        var n = el("span", null, f.name); n.appendChild(el("small", null, "\u2002·\u2002" + size(f.size)));
        li.appendChild(n); li.appendChild(b); listEl.appendChild(li);
      });
    };
    var add = function (list) {
      var skipped = "";
      [].forEach.call(list, function (f) {
        if (files.length >= MAX_FILES) skipped = "You can attach up to " + MAX_FILES + " files.";
        else if (f.size > MAX_MB * 1048576) skipped = f.name + " is over " + MAX_MB + " MB.";
        else files.push(f);
      });
      paint(); say(skipped, skipped ? "error" : "");
    };
    input.addEventListener("change", function () { add(input.files); input.value = ""; });
    ["dragenter", "dragover"].forEach(function (ev) { zone.addEventListener(ev, function (e) { if (e.dataTransfer && [].indexOf.call(e.dataTransfer.types || [], "Files") > -1) { e.preventDefault(); zone.classList.add("is-drag"); } }); });
    ["dragleave", "drop"].forEach(function (ev) { zone.addEventListener(ev, function () { zone.classList.remove("is-drag"); }); });
    zone.addEventListener("drop", function (e) { if (e.dataTransfer && e.dataTransfer.files.length) { e.preventDefault(); add(e.dataTransfer.files); } });
    return { get: function () { return files; }, clear: function () { files = []; paint(); } };
  };
  var pill = function (st) { var s = el("span", "tstat tstat--" + st); s.appendChild(el("i")); s.appendChild(document.createTextNode(STATUS[st])); return s; };

  var toastEl = document.querySelector("[data-toast]"), toastT;
  var toast = function (m) {
    if (!toastEl) return;
    toastEl.textContent = m; toastEl.hidden = false;
    requestAnimationFrame(function () { toastEl.classList.add("is-on"); });
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("is-on"); setTimeout(function () { toastEl.hidden = true; }, 250); }, 3600);
  };

  /* Session: signed-out visitors get a sign-in prompt. ?state=signed-out previews it. */
  var locked = false;
  var lock = function () {
    locked = true; content.hidden = true;
    var miss = document.querySelector("[data-d-missing]"); if (miss) miss.hidden = true;
    if (gate) gate.hidden = false;
    document.body.removeAttribute("data-shell");
  };
  var fillUser = function (u) {
    if (!u) return;
    var set = function (sel, v) { if (v == null || v === "") return; [].forEach.call(document.querySelectorAll(sel), function (n) { n.textContent = v; }); };
    set("[data-user-name]", u.name); set("[data-user-email]", u.email); set("[data-user-plan]", u.plan);
    set("[data-user-credits]", Number(u.credits).toLocaleString("en-US"));
    if (u.name) set("[data-user-initial]", String(u.name).trim().charAt(0).toUpperCase());
    /* Plan card: "No plan" until the account has a paid plan. */
    var paid = u.plan && !/^(free|none|no plan)$/i.test(String(u.plan));
    if (paid) {
      set("[data-plan-title]", u.plan); set("[data-plan-sub]", u.credits != null ? u.credits + " credits left" : "Your plan is active");
      var cta = document.querySelector("[data-plan-cta]"); if (cta) cta.textContent = "Manage plan";
    }
  };
  if (/[?&]state=signed-out\b/.test(location.search)) lock();
  else if (cfg.sessionEndpoint) {
    fetch(cfg.sessionEndpoint, { credentials: "include" })
      .then(function (r) {
        if (r.status === 401 || r.status === 403) { lock(); return null; }
        return r.ok ? r.json().catch(function () { return null; }) : null;
      })
      .then(fillUser).catch(function () {});
  }

  var getJSON = function (url) {
    return fetch(url, { credentials: "include" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  };

  /* ========================= LIST PAGE ========================= */
  if (!isDetail) {
    var listEl = content.querySelector("[data-tix-list]"), emptyEl = content.querySelector("[data-tix-empty]");
    var countEl = content.querySelector("[data-tix-count]"), searchEl = content.querySelector("[data-tix-search]");
    var segBtns = [].slice.call(content.querySelectorAll("[data-status]"));
    var emptyTitle = content.querySelector("[data-tix-empty-title]"), emptyText = content.querySelector("[data-tix-empty-text]");
    var emptyBtn = emptyEl.querySelector("[data-new-ticket]");
    var tickets = [], filter = "all", loaded = false, failed = false, PAGE = 8, shown = PAGE;
    var more = el("button", "gk-btn sup__more", "Show more"); more.type = "button"; more.hidden = true;
    listEl.insertAdjacentElement("afterend", more);
    more.addEventListener("click", function () { shown += PAGE; render(); });
    var skeleton = function () {
      listEl.innerHTML = ""; listEl.hidden = false; emptyEl.hidden = true; listEl.setAttribute("aria-busy", "true");
      for (var i = 0; i < 4; i++) { var r = el("div", "tix tix--sk"); r.innerHTML = "<span class=\"tix__main\"><i></i><i></i></span>"; listEl.appendChild(r); }
    };

    var render = function () {
      var q = searchEl.value.trim().toLowerCase();
      var rows = tickets.filter(function (t) {
        var st = norm(t.status);
        if (filter === "open" && st === "closed") return false;
        if (filter === "closed" && st !== "closed") return false;
        return !q || (t.subject + " " + t.category + " " + t.id).toLowerCase().indexOf(q) > -1;
      }).sort(function (a, b) { return new Date(b.updated || b.created) - new Date(a.updated || a.created); });
      listEl.innerHTML = ""; listEl.removeAttribute("aria-busy");
      var total = rows.length; rows = rows.slice(0, shown);
      more.hidden = total <= rows.length; more.textContent = "Show more (" + (total - rows.length) + ")";
      rows.forEach(function (t) {
        var st = norm(t.status), p = prioOf(t.priority), n = (t.messages || []).length;
        var a = el("a", "tix"); a.href = "support-ticket.html?id=" + encodeURIComponent(t.id);
        var main = el("span", "tix__main");
        var sj = el("span", "tix__subject"); if (t.unread) { sj.appendChild(el("i", "tix__dot")); sj.appendChild(document.createTextNode(t.subject)); a.classList.add("is-unread"); a.setAttribute("aria-label", t.subject + " (new reply)"); } else sj.textContent = t.subject;
        main.appendChild(sj);
        main.appendChild(el("span", "tix__meta", [t.category, n + (n === 1 ? " message" : " messages"), rel(t.updated || t.created)].filter(Boolean).join("\u2002·\u2002")));
        var side = el("span", "tix__side");
        if (p !== "Normal") side.appendChild(el("span", "tprio tprio--" + p.toLowerCase(), p));
        side.appendChild(pill(st));
        a.appendChild(main); a.appendChild(side);
        a.insertAdjacentHTML("beforeend", '<svg class="tix__go" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>');
        listEl.appendChild(a);
      });
      listEl.hidden = !rows.length;
      emptyEl.hidden = !!rows.length || !loaded;
      if (!rows.length) {
        var filtered = tickets.length > 0;
        emptyTitle.textContent = failed ? "We couldn't load your tickets" : filtered ? "No tickets match" : "No tickets yet";
        emptyText.textContent = failed ? "Check your connection and try again." : filtered ? "Try a different search or filter." : "Questions about your account, billing or generations? Open a ticket and we'll help.";
        emptyBtn.hidden = filtered || failed; retryBtn.hidden = !failed;
      } else retryBtn.hidden = true;
      var open = tickets.filter(function (t) { return norm(t.status) !== "closed"; }).length;
      countEl.textContent = !loaded ? " " : failed ? "" : !tickets.length ? "No tickets" : open + " open\u2002·\u2002" + tickets.length + " total";
    };
    var retryBtn = el("button", "gk-btn", "Try again"); retryBtn.type = "button"; retryBtn.hidden = true; emptyEl.appendChild(retryBtn);
    searchEl.addEventListener("input", function () { shown = PAGE; render(); });
    segBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        filter = b.getAttribute("data-status");
        segBtns.forEach(function (x) { x.classList.toggle("is-on", x === b); x.setAttribute("aria-pressed", String(x === b)); });
        shown = PAGE; render();
      });
      b.setAttribute("aria-pressed", String(b.classList.contains("is-on")));
    });

    var load = function () {
      failed = false; loaded = false; skeleton();
      (cfg.ticketsEndpoint ? getJSON(cfg.ticketsEndpoint).then(function (d) { return Array.isArray(d) ? d : (d && d.tickets) || []; }) : new Promise(function (r) { setTimeout(function () { r(SAMPLE.slice()); }, 250); }))
        .catch(function () { failed = true; return []; })
        .then(function (d) { tickets = d; loaded = true; render(); });
    };
    retryBtn.addEventListener("click", load);
    load();
    /* "/" jumps to search, like most dashboards. */
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !/^(input|textarea|select)$/i.test((e.target.tagName || "")) && !dlg.open) { e.preventDefault(); searchEl.focus(); }
    });

    /* ---- New ticket dialog ---- */
    var dlg = document.querySelector("[data-ticket-dialog]"), form = dlg.querySelector("[data-ticket-form]");
    var status = form.querySelector("[data-ticket-status]"), submit = form.querySelector('button[type="submit"]');
    var cat = form.category, budgetField = form.querySelector("[data-budget-field]"), budget = form.budget;
    var msg = form.message, count = form.querySelector("[data-ticket-count]");
    var say = function (m, st) { status.textContent = m; status.setAttribute("data-state", st || ""); };
    var att = attach(form.querySelector("[data-ticket-file]"), form.querySelector("[data-ticket-files]"), dlg, say);
    var ready = function () {
      var needs = cat.value === "Developer API";
      submit.disabled = !(form.subject.value.trim() && msg.value.trim() && (!needs || budget.value));
    };
    var syncBudget = function () { var on = cat.value === "Developer API"; budgetField.hidden = !on; budget.required = on; ready(); };
    var level = function () { dlg.setAttribute("data-level", String(form.priority.selectedIndex)); };
    var opener = null;
    var openDlg = function (from) {
      if (locked) return;
      opener = from && from.focus ? from : document.activeElement;
      if (typeof dlg.showModal === "function") { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute("open", "");
      document.body.classList.add("is-dlg");
      setTimeout(function () { form.subject.focus(); }, 30);
    };
    var closeDlg = function () {
      if (typeof dlg.close === "function") dlg.close(); else dlg.removeAttribute("open");
      document.body.classList.remove("is-dlg");
    };
    dlg.addEventListener("close", function () { document.body.classList.remove("is-dlg"); if (opener && document.contains(opener)) opener.focus(); });
    document.addEventListener("click", function (e) {
      var nb = e.target.closest("[data-new-ticket]");
      if (nb) openDlg(nb);
      else if (e.target.closest("[data-dialog-close]")) closeDlg();
    });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) closeDlg(); });

    form.priority.addEventListener("change", level);
    cat.addEventListener("change", syncBudget);
    [form.subject, msg, budget].forEach(function (n) { n.addEventListener("input", ready); n.addEventListener("change", ready); });
    msg.addEventListener("input", function () { count.textContent = String(msg.value.length); });
    /* Keep what they've typed if they close the dialog or reload, until the ticket is sent. */
    var DRAFT = "mb.ticketDraft";
    var saveDraft = function () { try { sessionStorage.setItem(DRAFT, JSON.stringify({ s: form.subject.value, c: cat.value, p: form.priority.value, m: msg.value, b: budget.value })); } catch (_) {} };
    var restoreDraft = function () {
      try {
        var d = JSON.parse(sessionStorage.getItem(DRAFT) || "null"); if (!d) return;
        form.subject.value = d.s || ""; cat.value = d.c || cat.value; form.priority.value = d.p || form.priority.value; msg.value = d.m || ""; budget.value = d.b || "";
        count.textContent = String(msg.value.length);
      } catch (_) {}
    };
    var clearDraft = function () { try { sessionStorage.removeItem(DRAFT); } catch (_) {} };
    restoreDraft();
    [form.subject, msg, cat, form.priority, budget].forEach(function (n) { n.addEventListener("input", saveDraft); n.addEventListener("change", saveDraft); });
    form.addEventListener("keydown", function (e) { if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !submit.disabled) { e.preventDefault(); form.requestSubmit(); } });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (submit.disabled) return;
      if (!cfg.ticketEndpoint) { say("Support tickets aren't connected yet. Set ticketEndpoint in assets/js/layout.js.", "error"); return; }
      var fd = new FormData();
      ["subject", "category", "priority", "message"].forEach(function (k) { fd.append(k, form[k].value); });
      if (cat.value === "Developer API") fd.append("budget", budget.value);
      att.get().forEach(function (f) { fd.append("files", f); });
      say("Creating your ticket…"); submit.disabled = true;
      fetch(cfg.ticketEndpoint, { method: "POST", credentials: "include", body: fd })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json().catch(function () { return {}; }); })
        .then(function (res) {
          var t = { id: res.id || String(Date.now()), subject: form.subject.value.trim(), category: cat.value, priority: form.priority.value, status: "open", created: new Date().toISOString(), updated: new Date().toISOString(), messages: [{ from: "you", date: new Date().toISOString(), text: msg.value.trim() }] };
          tickets.unshift(t); form.reset(); att.clear(); clearDraft(); level(); syncBudget(); count.textContent = "0"; say("");
          closeDlg(); render(); toast("Ticket created. We'll reply here.");
        })
        .catch(function () { say("We couldn't create that ticket. Please try again.", "error"); submit.disabled = false; });
    });
    syncBudget(); level();

    /* ?new=1, ?subject= and ?category= open the dialog pre-filled (used by links from elsewhere). */
    if (qs.get("subject")) { form.subject.value = qs.get("subject"); saveDraft(); }
    if (qs.get("category")) {
      [].forEach.call(cat.options, function (o) { if (o.value.toLowerCase() === qs.get("category").toLowerCase()) cat.value = o.value; });
      syncBudget();
    }
    ready();
    if (qs.get("new") || qs.get("subject") || qs.get("category")) setTimeout(function () { openDlg(); }, 60);
    return;
  }

  /* ========================= DETAIL PAGE ========================= */
  var id = qs.get("id"), missing = document.querySelector("[data-d-missing]");
  var titleEl = content.querySelector("[data-d-title]"), subEl = content.querySelector("[data-d-sub]");
  var metaEl = content.querySelector("[data-d-meta]"), thread = content.querySelector("[data-d-thread]");
  var rform = content.querySelector("[data-reply-form]"), note = rform.querySelector("[data-reply-note]");
  var rmsg = rform.message, rcount = rform.querySelector("[data-reply-count]"), rsubmit = rform.querySelector('button[type="submit"]');
  var rstatus = rform.querySelector("[data-reply-status]");
  var ticket = null;
  var rsay = function (m, st) { rstatus.textContent = m; rstatus.setAttribute("data-state", st || ""); };
  var ratt = attach(rform.querySelector("[data-reply-file]"), rform.querySelector("[data-reply-files]"), rform, rsay);

  var lastFrom = null;
  var addMsg = function (m) {
    var you = m.from === "you" || m.from === "user" || m.from === "customer";
    var who = you ? "you" : "support", cont = lastFrom === who; lastFrom = who;
    var c = el("article", "msg msg--" + who + (cont ? " is-cont" : ""));
    if (!you) { var av = el("span", "msg__av"); var im = el("img"); im.src = "assets/img/logo-mark.png"; im.alt = ""; im.width = 18; im.height = 18; av.appendChild(im); c.appendChild(av); }
    var body = el("div", "msg__body");
    if (!you && !cont) body.appendChild(el("span", "msg__name", "MegaBerry Support"));
    var bub = el("div", "msg__bubble"); bub.appendChild(el("p", null, m.text));
    if (m.files && m.files.length) { var fl = el("ul", "msg__files"); m.files.forEach(function (n) { fl.appendChild(el("li", null, n)); }); bub.appendChild(fl); }
    body.appendChild(bub);
    var tm = el("time", null, rel(m.date)); tm.title = fmtDate(m.date, true); tm.dateTime = m.date; body.appendChild(tm);
    c.appendChild(body); thread.appendChild(c); return c;
  };
  var paint = function () {
    var st = norm(ticket.status), p = prioOf(ticket.priority);
    titleEl.textContent = ticket.subject;
    /* Show the whole ticket id; pressing it copies it. */
    var tid = String(ticket.id), nmsg = (ticket.messages || []).length;
    subEl.textContent = "";
    var cp = el("button", "d-copy"); cp.type = "button"; cp.title = "Copy ticket ID"; cp.setAttribute("aria-label", "Ticket " + tid + ". Press to copy the ID.");
    cp.appendChild(document.createTextNode("Ticket #" + tid + " "));
    var ci = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    ["viewBox:0 0 24 24", "width:14", "height:14", "fill:none", "stroke:currentColor", "stroke-width:1.8", "stroke-linecap:round", "stroke-linejoin:round", "aria-hidden:true"].forEach(function (kv) { var i = kv.indexOf(":"); ci.setAttribute(kv.slice(0, i), kv.slice(i + 1)); });
    ci.innerHTML = '<rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6.5A1.5 1.5 0 0 1 6.5 5H15"/>';
    cp.appendChild(ci);
    cp.addEventListener("click", function () {
      var done = function () { toast("Ticket ID copied"); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(tid).then(done, function () { toast(tid); });
      else toast(tid);
    });
    subEl.appendChild(cp);
    if (nmsg) { subEl.appendChild(el("span", "d-sep", "\u2002\u00b7\u2002")); subEl.appendChild(el("span", "d-ref", nmsg + (nmsg === 1 ? " message" : " messages"))); }
    document.title = ticket.subject + " | MegaBerry";
    metaEl.innerHTML = "";
    var row = function (k, v) { var d = el("div"); d.appendChild(el("dt", null, k)); var dd = el("dd"); if (typeof v === "string") dd.textContent = v; else dd.appendChild(v); d.appendChild(dd); metaEl.appendChild(d); };
    row("Status", pill(st));
    row("Priority", p === "Normal" ? "Normal" : (function () { return el("span", "tprio tprio--" + p.toLowerCase(), p); })());
    row("Category", ticket.category || "General question");
    row("Created", fmtDate(ticket.created, true));
    row("Updated", fmtDate(ticket.updated || ticket.created, true));
    thread.innerHTML = ""; lastFrom = null; (ticket.messages || []).forEach(addMsg);
    note.hidden = st !== "closed";
  };
  var rready = function () { rsubmit.disabled = !rmsg.value.trim(); };
  var grow = function () { rmsg.style.height = "auto"; rmsg.style.height = Math.min(rmsg.scrollHeight, 176) + "px"; };
  rmsg.addEventListener("input", function () { rcount.textContent = String(rmsg.value.length); rcount.parentNode.hidden = rmsg.value.length < 4000; rready(); grow(); });
  /* Chat-style: Enter sends and Shift+Enter adds a line (Enter adds a line on touch screens, where there is a Send button). */
  rmsg.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" || e.isComposing) return;
    var fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
    if ((fine && !e.shiftKey) || e.metaKey || e.ctrlKey) { e.preventDefault(); if (!rsubmit.disabled) rform.requestSubmit(); }
  });
  rform.addEventListener("submit", function (e) {
    e.preventDefault();
    if (rsubmit.disabled || !ticket) return;
    if (!cfg.replyEndpoint) { rsay("Replies aren't connected yet. Set replyEndpoint in assets/js/layout.js.", "error"); return; }
    var fd = new FormData(); fd.append("id", ticket.id); fd.append("message", rmsg.value.trim());
    ratt.get().forEach(function (f) { fd.append("files", f); });
    rsay("Sending…"); rsubmit.disabled = true;
    fetch(cfg.replyEndpoint, { method: "POST", credentials: "include", body: fd })
      .then(function (r) { if (!r.ok) throw new Error(r.status); })
      .then(function () {
        ticket.messages = ticket.messages || [];
        ticket.messages.push({ from: "you", date: new Date().toISOString(), text: rmsg.value.trim(), files: ratt.get().map(function (f) { return f.name; }) });
        ticket.status = "open"; ticket.updated = new Date().toISOString();
        rmsg.value = ""; rcount.textContent = "0"; rcount.parentNode.hidden = true; grow(); ratt.clear(); rsay(""); paint(); toast("Reply sent");
        var last = thread.lastElementChild; if (last && last.scrollIntoView) last.scrollIntoView({ block: "nearest", behavior: "smooth" });
      })
      .catch(function () { rsay("We couldn't send that. Please try again.", "error"); rsubmit.disabled = false; });
  });

  var notFound = function () { if (locked) return; content.hidden = true; missing.hidden = false; };
  var get = !id ? Promise.reject() : cfg.ticketsEndpoint
    ? getJSON(cfg.ticketsEndpoint.replace(/\/$/, "") + "/" + encodeURIComponent(id))
    : Promise.resolve(SAMPLE.filter(function (t) { return String(t.id) === String(id); })[0]);
  get.then(function (t) { if (!t) return notFound(); ticket = t; paint(); }).catch(notFound);
})();

/* ---- Settings page ---- */
(function () {
  var root = document.querySelector("[data-set-content]");
  if (!root) return;
  var cfg = (window.MB && window.MB.config) || {};
  var gate = document.querySelector("[data-support-gate]");
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var el = function (tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  var fmt = function (v, time) {
    var d = new Date(v); if (isNaN(d)) return "";
    var o = { day: "numeric", month: "short", year: "numeric" }; if (time) { o.hour = "2-digit"; o.minute = "2-digit"; }
    return d.toLocaleString("en-GB", o);
  };
  var rel = function (v) {
    var m = Math.round((Date.now() - new Date(v)) / 6e4);
    if (m < 2) return "Just now"; if (m < 60) return m + "m ago"; if (m < 1440) return Math.round(m / 60) + "h ago";
    var d = Math.round(m / 1440); return d < 7 ? d + "d ago" : fmt(v);
  };
  var ic = function (d, w) { w = w || 16; return '<svg viewBox="0 0 24 24" width="' + w + '" height="' + w + '" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>"; };

  var toastEl = $("[data-toast]"), toastT;
  var toast = function (m) {
    if (!toastEl) return;
    toastEl.textContent = m; toastEl.hidden = false;
    requestAnimationFrame(function () { toastEl.classList.add("is-on"); });
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("is-on"); setTimeout(function () { toastEl.hidden = true; }, 250); }, 3800);
  };

  /* ---- Sample account, shown until accountEndpoint is set in layout.js ---- */
  var DAY = 864e5, now = Date.now(), iso = function (d, h) { return new Date(now - d * DAY - (h || 0) * 36e5).toISOString(); };
  var A = {
    name: "Stephen", email: "demo@megaberry.com", verified: true, plan: (function(){try{return (localStorage.getItem("mb.devmode")||"linked")==="linked"?"Pro":"Free"}catch(e){return "Pro"}}()), credits: (function(){try{return (localStorage.getItem("mb.devmode")||"linked")==="linked"?2450:0}catch(e){return 2450}}()), cards: 1,
    connections: [{ id: "discord", account: "stephen@example.com", date: iso(150) }],
    seatsShared: [{ name: "Alex", email: "alex@example.com", status: "active", date: iso(18) }, { name: "Jordan", email: "jordan@example.com", status: "pending", date: iso(3) }, { name: "Sam", email: "sam@example.com", status: "revoked", date: iso(205) }], seatsReceived: [{ name: "MegaBerry Demo", email: "demo@megaberry.com", status: "active", date: iso(60) }],
    notify: { email: true, inapp: true, job: true, billing: true, avatar: true, tips: true, system: true, security: true, quiet: false, qs: "22:00", qe: "08:00", tz: "UTC" },
    invoices: [{ date: iso(25), desc: "Subscription renewal", amount: "$50.00", status: "Paid" }, { date: iso(55), desc: "Subscription", amount: "$200.00", status: "Paid" }],
    twoFactor: false,
    sessions: [
      { device: "Chrome 156", os: "Mac OS", loc: "London, ENG, GB", active: iso(0, 0.7), current: true },
      { device: "Chrome 156", os: "Linux", loc: "London, ENG, GB", active: iso(5) },
      { device: "Safari 19", os: "iOS", loc: "London, ENG, GB", active: iso(19) },
      { device: "Chrome 155", os: "Mac OS", loc: "Manchester, ENG, GB", active: iso(21) }
    ],
    activity: [["Signed in", 0], ["Signed in", 5], ["Email address verified", 30], ["Signed in", 19], ["Password changed", 61], ["Signed in", 21], ["Account created", 160]].map(function (a) { return { text: a[0], date: iso(a[1]) }; }),
    blocked: [], api: { access: false }
  };
  var PROVIDERS = [{ id: "discord", name: "Discord", c: "#5865f2" }, { id: "google", name: "Google", c: "#d6453a" }, { id: "fanplace", name: "Fanplace", c: "#4f8cf0" }];

  /* ---- Session and saving ---- */
  var locked = false;
  var lock = function () { locked = true; root.hidden = true; if (gate) gate.hidden = false; document.body.removeAttribute("data-shell"); };
  var fillSide = function () {
    var set = function (sel, v) { if (v == null || v === "") return; $$(sel).forEach(function (n) { n.textContent = v; }); };
    set("[data-user-name]", A.name); set("[data-user-email]", A.email); set("[data-user-plan]", A.plan); set("[data-user-credits]", Number(A.credits).toLocaleString("en-US"));
    if (A.name) set("[data-user-initial]", String(A.name).trim().charAt(0).toUpperCase());
    var paid = A.plan && !/^(free|none|no plan)$/i.test(String(A.plan));
    if (paid) { set("[data-plan-title]", A.plan); set("[data-plan-sub]", A.credits + " credits left"); var c = $("[data-plan-cta]"); if (c) c.textContent = "Manage plan"; }
  };
  var told = false;
  var persist = function (section, data) {
    if (!cfg.settingsEndpoint) {
      if (!told) { told = true; toast("Changes aren't saved yet: set settingsEndpoint in assets/js/layout.js."); }
      return Promise.resolve(false);
    }
    return fetch(cfg.settingsEndpoint, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section: section, data: data }) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); toast("Saved"); return true; })
      .catch(function () { toast("We couldn't save that. Please try again."); return false; });
  };
  var needsServer = function (what) { if (!cfg.settingsEndpoint) { toast(what + " isn't connected yet."); return true; } return false; };

  /* ---- Binding + rendering ---- */
  var bind = function () {
    $$("[data-bind]").forEach(function (n) {
      var k = n.getAttribute("data-bind"), v = k === "initial" ? String(A.name || "?").trim().charAt(0).toUpperCase() : (k === "credits" ? Number(A[k]).toLocaleString("en-US") : A[k]);
      if (v != null) n.textContent = v;
    });
    var ver = $("[data-verified]"); if (ver) ver.hidden = !A.verified;
    var bv = $("[data-avatar]"); if (bv && A.avatar) { bv.parentNode.style.backgroundImage = "url(" + A.avatar + ")"; bv.parentNode.classList.add("has-img"); }
    fillSide();
  };
  var PROV_IC = {
    discord: '<svg viewBox="0 0 28 28" width="20" height="20" fill="#fff"><path d="M22.2 7.4a17.5 17.5 0 0 0-4.3-1.3 12 12 0 0 0-.6 1.1 16.3 16.3 0 0 0-4.8 0 11 11 0 0 0-.6-1.1 17.4 17.4 0 0 0-4.3 1.3C4 12.3 3.3 17 3.6 21.7a17.6 17.6 0 0 0 5.3 2.7 13 13 0 0 0 1.1-1.8 11.4 11.4 0 0 1-1.7-.8l.3-.3a12.5 12.5 0 0 0 10.7 0l.3.3a11 11 0 0 1-1.7.8 13 13 0 0 0 1.1 1.8 17.5 17.5 0 0 0 5.3-2.7c.4-5-1-9.5-3.8-13.3zM10.7 19c-1.1 0-2-1-2-2.2s.9-2.2 2-2.2 2 1 2 2.2-.9 2.2-2 2.2zm7 0c-1.1 0-2-1-2-2.2s.9-2.2 2-2.2 2 1 2 2.2-.9 2.2-2 2.2z"/></svg>',
    google: '<svg viewBox="0 0 28 28" width="20" height="20"><path d="M25.2 14.3c0-.7-.1-1.4-.2-2H14.4v3.8h6.1a5.2 5.2 0 0 1-2.3 3.5l3.5 2.7c2-1.9 3.2-4.6 3.2-7.7z" fill="#4285F4"/><path d="M14.4 25.5c3 0 5.6-1 7.5-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6l-3.7 2.8c1.8 3.7 5.6 6.2 10 6.2z" fill="#34A853"/><path d="M8 16.6a7 7 0 0 1 0-5.2L4.3 8.6A12.5 12.5 0 0 0 3 14c0 1.8.5 3.5 1.3 5l3.7-2.9z" fill="#FBBC05"/><path d="M14.4 7.7c1.6 0 3 .5 4.2 1.6l3.1-3.1A11.5 11.5 0 0 0 14.4 3C10 3 6.2 5.5 4.3 9.2l3.7 2.8c.9-2.6 3.4-4.6 6.3-4.6z" fill="#EA4335"/></svg>',
    fanplace: '<svg viewBox="0 0 28 28" width="20" height="20" fill="#fff"><text x="14" y="19.5" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="16" font-weight="700">fp</text></svg>'
  };
  var providerTile = function (p) {
    var t = el("span", "set-logo"); t.style.background = p.c;
    if (PROV_IC[p.id]) t.innerHTML = PROV_IC[p.id]; else t.textContent = p.name.charAt(0);
    return t;
  };
  var renderConnections = function () {
    var list = $("[data-conn-list]"), avail = $("[data-conn-avail]"); list.innerHTML = ""; avail.innerHTML = "";
    var have = {}; A.connections.forEach(function (c) { have[c.id] = c; });
    PROVIDERS.forEach(function (p) {
      var c = have[p.id], row = el("div", "set-item"), txt = el("div", "set-item__txt");
      row.appendChild(providerTile(p));
      var b = el("strong", null, p.name); txt.appendChild(b);
      txt.appendChild(el("small", null, c ? c.account + " · connected " + fmt(c.date) : "Not connected"));
      row.appendChild(txt);
      var btn = el("button", "gk-btn", c ? "Disconnect" : "Connect"); btn.type = "button";
      btn.addEventListener("click", function () {
        if (needsServer(c ? "Disconnecting accounts" : "Connecting " + p.name)) return;
      });
      row.appendChild(btn); (c ? list : avail).appendChild(row);
    });
    if (!list.children.length) list.appendChild(el("p", "set-hint", "No accounts connected yet."));
    if (!avail.children.length) avail.appendChild(el("p", "set-hint", "Every available provider is connected."));
  };
  var STAT = { active: ["schip schip--ok", "Active"], pending: ["schip schip--warn", "Pending"], revoked: ["schip schip--mute", "Revoked"] };
  var SEAT_COLORS = ["#5865f2", "#d6453a", "#2aabee", "#e67e22", "#9b7bea", "#2ecc71"];
  var seatAvatar = function (name, i) {
    var av = el("span", "set-seat-av"); av.textContent = name.charAt(0).toUpperCase();
    av.style.background = SEAT_COLORS[i % SEAT_COLORS.length]; return av;
  };
  var seatBtn = function (label, cls, fn) { var b = el("button", "gk-btn" + (cls ? " " + cls : ""), label); b.type = "button"; b.addEventListener("click", fn); return b; };
  var renderSeats = function () {
    var sh = $("[data-seats-shared]"), rc = $("[data-seats-received]"); sh.innerHTML = ""; rc.innerHTML = "";
    var WHEN = { active: "Shared ", pending: "Invited ", revoked: "Revoked " };
    A.seatsShared.forEach(function (s, i) {
      var row = el("div", "set-item" + (s.status === "revoked" ? " set-item--off" : "")), st = STAT[s.status] || STAT.active;
      row.appendChild(seatAvatar(s.name, i));
      var txt = el("div", "set-item__txt");
      var nameRow = el("span", "set-seat-name"); nameRow.appendChild(el("strong", null, s.name)); nameRow.appendChild(el("span", st[0], st[1]));
      txt.appendChild(nameRow); txt.appendChild(el("small", null, s.email));
      row.appendChild(txt);
      var acts = el("div", "set-seat-acts");
      acts.appendChild(el("time", null, (WHEN[s.status] || "") + fmt(s.date)));
      if (s.status === "active") acts.appendChild(seatBtn("Revoke", "seat-x", function () { s.status = "revoked"; s.date = new Date().toISOString(); renderSeats(); persist("seats", { revoke: s.email }); toast(s.name + "'s seat was revoked."); }));
      else if (s.status === "pending") {
        acts.appendChild(seatBtn("Resend", "", function () { persist("seats", { resend: s.email }); toast("Invite resent to " + s.email + "."); }));
        acts.appendChild(seatBtn("Cancel", "seat-x", function () { A.seatsShared.splice(i, 1); renderSeats(); persist("seats", { cancel: s.email }); toast("Invite cancelled."); }));
      } else acts.appendChild(seatBtn("Re-invite", "", function () { s.status = "pending"; s.date = new Date().toISOString(); renderSeats(); persist("seats", { invite: s.email }); toast("Invite sent to " + s.email + "."); }));
      row.appendChild(acts);
      sh.appendChild(row);
    });
    A.seatsReceived.forEach(function (s, i) {
      var row = el("div", "set-item");
      row.appendChild(seatAvatar(s.name, i + 3));
      var txt = el("div", "set-item__txt");
      txt.appendChild(el("strong", null, s.name)); txt.appendChild(el("small", null, s.email));
      row.appendChild(txt);
      var acts = el("div", "set-seat-acts");
      if (s.date) acts.appendChild(el("time", null, "Since " + fmt(s.date)));
      acts.appendChild(seatBtn("Leave", "seat-x", function () { A.seatsReceived.splice(i, 1); renderSeats(); persist("seats", { leave: s.email }); toast("Left seat from " + s.name + "."); }));
      row.appendChild(acts);
      rc.appendChild(row);
    });
    var cnt = function (k) { return A.seatsShared.filter(function (s) { return s.status === k; }).length; }, parts = [];
    if (cnt("active")) parts.push(cnt("active") + " active"); if (cnt("pending")) parts.push(cnt("pending") + " pending");
    var c1 = $("[data-seats-count]"), c2 = $("[data-seats-rc-count]");
    if (c1) { c1.textContent = parts.join(" · "); c1.hidden = !parts.length; }
    if (c2) { c2.textContent = A.seatsReceived.length; c2.hidden = !A.seatsReceived.length; }
    [[sh, A.seatsShared, "No seats shared yet", "Invite someone to give them access to your avatars."], [rc, A.seatsReceived, "Nothing shared with you", "When someone shares an avatar seat with you, it shows up here."]].forEach(function (x) {
      if (!x[1].length) { var e = el("div", "seats__empty"); e.appendChild(el("strong", null, x[2])); e.appendChild(el("small", null, x[3])); x[0].appendChild(e); }
    });
  };
  var renderInvoices = function () {
    var tb = $("[data-invoices]"); tb.innerHTML = "";
    $("[data-invoices-empty]").hidden = !!A.invoices.length;
    A.invoices.forEach(function (v) {
      var tr = el("tr");
      [fmt(v.date), v.desc, v.amount].forEach(function (t) { tr.appendChild(el("td", null, t)); });
      var s = el("td"); s.appendChild(el("span", "schip " + (/paid/i.test(v.status) ? "schip--ok" : "schip--warn"), v.status)); tr.appendChild(s);
      var a = el("td"), b = el("button", "gk-btn gk-btn--ghost", "View receipt"); b.type = "button";
      b.addEventListener("click", function () { openReceipt(v); });
      a.appendChild(b); tr.appendChild(a); tb.appendChild(tr);
    });
    $("[data-card-note]").textContent = A.cards ? A.cards + (A.cards === 1 ? " card saved" : " cards saved") : "No cards saved";
  };
  var openReceipt = function (inv) {
    var dlg = $('[data-dlg="receipt"]'), body = $("[data-receipt-body]");
    var num = "R-" + String(Math.floor(Math.random() * 900000 + 100000));
    body.innerHTML =
      '<div class="set-receipt__head"><div class="set-receipt__brand"><img src="assets/img/logo-mark.png" alt="" width="28" height="28"><h2>MegaBerry</h2></div><div><strong>Receipt</strong><small>Receipt number ' + num + '</small><small>Paid ' + fmt(inv.date) + '</small></div></div>' +
      '<div class="set-receipt__parties"><dl><dt>Billed to</dt><dd>' + A.name + '<small>' + A.email + '</small></dd></dl><dl><dt>Sold by</dt><dd>MegaBerry</dd></dl></div>' +
      '<table class="set-receipt__items"><thead><tr><th>Description</th><th>Amount</th></tr></thead><tbody>' +
      '<tr><td>' + inv.desc + '</td><td>' + inv.amount + ' USD</td></tr>' +
      '<tr><td>Total paid</td><td>' + inv.amount + ' USD</td></tr>' +
      '</tbody></table>' +
      '<dl class="set-receipt__meta"><dt>Payment method</dt><dd>Visa ending in 1958</dd></dl>' +
      '<div class="set-receipt__foot"><p>Subscription charges renew automatically until you cancel. You can manage or cancel your subscription anytime in <a href="settings.html#billing">Settings → Billing</a>.</p><p>Questions about this charge? <a href="contact.html">Contact support</a>.</p></div>';
    if (!dlg.open) dlg.showModal();
  };
  var renderSessions = function () {
    var tb = $("[data-sessions]"); tb.innerHTML = "";
    A.sessions.forEach(function (s, i) {
      var tr = el("tr"), d = el("td"), st = el("strong", null, s.device);
      d.appendChild(st); d.appendChild(el("small", null, s.os)); tr.appendChild(d);
      tr.appendChild(el("td", null, s.loc)); tr.appendChild(el("td", null, s.current ? "Now" : rel(s.active)));
      var a = el("td");
      if (s.current) a.appendChild(el("span", "schip schip--ok", "Current"));
      else {
        var b = el("button", "icon-btn", ""); b.type = "button"; b.setAttribute("aria-label", "Sign out " + s.device);
        b.innerHTML = ic('<path d="M10 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20H10M15 8l4 4-4 4M19 12H9"/>', 18);
        b.addEventListener("click", function () { A.sessions.splice(i, 1); renderSessions(); persist("sessions", { signOut: i }); });
        a.appendChild(b);
      }
      tr.appendChild(a); tb.appendChild(tr);
    });
    var log = $("[data-activity]"); log.innerHTML = "";
    A.activity.forEach(function (e) { var li = el("li"); li.appendChild(el("span", null, e.text)); li.appendChild(el("time", null, fmt(e.date, true))); log.appendChild(li); });
    $("[data-activity-sum]").textContent = "View activity log (" + A.activity.length + ")";
    var c = $("[data-2fa-chip]"), b = $("[data-2fa]");
    c.textContent = A.twoFactor ? "Enabled" : "Disabled"; c.className = "schip" + (A.twoFactor ? " schip--ok" : ""); b.textContent = A.twoFactor ? "Disable" : "Enable";
  };
  var renderBlocked = function () {
    var l = $("[data-blocked]"); l.innerHTML = "";
    $("[data-blocked-empty]").hidden = !!A.blocked.length;
    A.blocked.forEach(function (u, i) {
      var row = el("div", "set-item"), txt = el("div", "set-item__txt");
      txt.appendChild(el("strong", null, u.name)); if (u.email) txt.appendChild(el("small", null, u.email)); row.appendChild(txt);
      var b = el("button", "gk-btn", "Unblock"); b.type = "button";
      b.addEventListener("click", function () { A.blocked.splice(i, 1); renderBlocked(); persist("blocked", { unblock: u.name }); });
      row.appendChild(b); l.appendChild(row);
    });
  };
  var renderApi = function () {
    var on = A.api && A.api.access, c = $("[data-api-chip]"), b = $("[data-api-request]");
    c.textContent = on ? "Active" : "No access"; c.className = "schip" + (on ? " schip--ok" : "");
    $("[data-api-note]").textContent = on ? "Your account has Developer API access." : "Your account doesn't have Developer API access yet.";
    if (on) { b.querySelector("span").textContent = "Open API docs"; b.setAttribute("data-api-docs", ""); }
  };
  var NKEYS = ["job", "billing", "avatar", "tips", "system"];
  var renderNotify = function () {
    var n = A.notify;
    $$("[data-notify]").forEach(function (i) { var k = i.getAttribute("data-notify"); if (!i.disabled) i.checked = !!n[k]; });
    var q = $("[data-quiet-fields]"); q.hidden = !n.quiet;
    var tz = $("[data-q='tz']");
    if (!tz.options.length) {
      var zones = ["UTC", "Europe/London", "Europe/Paris", "America/New_York", "America/Chicago", "America/Los_Angeles", "Asia/Tokyo", "Australia/Sydney"], mine = "";
      try { mine = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (_) {}
      if (mine && zones.indexOf(mine) < 0) zones.splice(1, 0, mine);
      zones.forEach(function (z) { var o = el("option", null, z.replace(/_/g, " ")); o.value = z; tz.appendChild(o); });
    }
    $$("[data-q]").forEach(function (i) { i.value = n[i.getAttribute("data-q")]; });
    $("[data-quiet-note]").textContent = "Quiet hours run from " + n.qs + " to " + n.qe + " (" + n.tz.replace(/_/g, " ") + "). Security alerts are still sent.";
    var on = NKEYS.filter(function (k) { return n[k]; }).length, nc = $("[data-notify-count]"), na = $("[data-notify-all]");
    if (nc) nc.textContent = on + " of " + NKEYS.length + " turned on. Security alerts are always sent.";
    if (na) na.textContent = on ? "Turn all off" : "Turn all on";
    var push = typeof Notification !== "undefined" && Notification.permission === "granted";
    $("[data-push-note]").textContent = push ? "Enabled in this browser." : "Not enabled in this browser.";
    $("[data-push]").textContent = push ? "Enabled" : "Enable push"; $("[data-push]").disabled = push;
  };
  var renderAll = function () { bind(); renderConnections(); renderSeats(); renderInvoices(); renderSessions(); renderBlocked(); renderApi(); renderNotify(); };

  /* ---- Tabs ---- */
  var TABS = $$("[data-tab]").map(function (a) { return a.getAttribute("data-tab"); });
  var show = function () {
    var k = (location.hash || "").replace("#", ""); if (TABS.indexOf(k) < 0) k = "profile";
    $$("[data-panel]").forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== k; });
    $$("[data-tab]").forEach(function (a) { var on = a.getAttribute("data-tab") === k; a.setAttribute("aria-selected", String(on)); if (on) { a.setAttribute("aria-current", "page"); if (a.scrollIntoView) a.scrollIntoView({ block: "nearest", inline: "center" }); } else a.removeAttribute("aria-current"); });
    var name = $("[data-tab='" + k + "'] span").textContent; document.title = name + " · Settings | MegaBerry";
  };
  window.addEventListener("hashchange", show);

  // Dev mode → switch plan (runs once on load, then on every toggle)
  var syncDev = function () {
    var m = document.body.getAttribute("data-dev-mode") || "linked";
    var linked = m === "linked";
    A.plan = linked ? "Pro" : "Free";
    A.credits = linked ? 2450 : 0;
    var set = function (sel, v) { $$(sel).forEach(function (n) { n.textContent = v; }); };
    set("[data-user-plan]", A.plan);
    set("[data-bind=\"plan\"]", A.plan);
    set("[data-bind=\"credits\"]", Number(A.credits).toLocaleString("en-US"));
    var fill = $("[data-credits-fill]");
    if (fill) fill.style.width = linked ? "24%" : "0%";
    // Update billing card description and button
    var desc = $(".set-card--plan .set-plan-desc");
    var btn = $(".set-card--plan .gk-btn");
    if (linked) {
      if (desc) desc.textContent = "Unlimited Apex images + Video Motion. Higher queue priority. 10x bulk batches.";
      if (btn) { btn.textContent = "Change plan"; btn.insertAdjacentHTML("afterbegin", '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="margin-right:0.3rem"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>'); }
    } else {
      if (desc) desc.textContent = "Pay-as-you-go. All tools available. Standard queue priority.";
      if (btn) { btn.textContent = "Upgrade plan"; btn.insertAdjacentHTML("afterbegin", '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="margin-right:0.3rem"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>'); }
    }
  };
  syncDev();
  new MutationObserver(syncDev).observe(document.body, { attributes: true, attributeFilter: ["data-dev-mode"] });

  /* ---- Dialogs ---- */
  var opener = null;
  var openDlg = function (id) {
    var d = $("[data-dlg='" + id + "']"); if (!d || locked) return;
    opener = document.activeElement; if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
    document.body.classList.add("is-dlg"); var f = d.querySelector("input"); if (f) setTimeout(function () { f.focus(); }, 30);
  };
  var closeDlg = function (d) {
    if (typeof d.close === "function") d.close(); else d.removeAttribute("open");
    document.body.classList.remove("is-dlg"); var f = d.querySelector("form"); if (f) { f.reset(); var s = f.querySelector("[data-status]"); if (s) s.textContent = ""; var b = f.querySelector("[type=submit]"); if (b) b.disabled = true; }
    if (opener && document.contains(opener)) opener.focus();
  };
  $$("dialog[data-dlg]").forEach(function (d) {
    d.addEventListener("click", function (e) { if (e.target === d) closeDlg(d); });
    d.addEventListener("cancel", function () { document.body.classList.remove("is-dlg"); });
  });
  document.addEventListener("click", function (e) {
    var o = e.target.closest("[data-open]"); if (o) { openDlg(o.getAttribute("data-open")); return; }
    var c = e.target.closest("[data-dialog-close]"); if (c) closeDlg(c.closest("dialog"));
  });
  var say = function (form, m, bad) { var s = form.querySelector("[data-status]"); s.textContent = m; s.setAttribute("data-state", bad ? "error" : ""); };
  var watch = function (form, ok) { var b = form.querySelector("[type=submit]"); var f = function () { b.disabled = !ok(); }; form.addEventListener("input", f); f(); };

  var inv = $("[data-invite-form]");
  watch(inv, function () { return /^\S+@\S+\.\S+$/.test(inv.email.value.trim()); });
  inv.addEventListener("submit", function (e) {
    e.preventDefault(); var em = inv.email.value.trim();
    if (A.seatsShared.some(function (s) { return s.email.toLowerCase() === em.toLowerCase() && s.status !== "revoked"; })) { say(inv, "That person already has a seat.", true); return; }
    A.seatsShared.unshift({ name: em.split("@")[0], email: em, status: "pending", date: new Date().toISOString() });
    renderSeats(); closeDlg(inv.closest("dialog")); toast("Invite sent to " + em); persist("seats", { invite: em });
  });
  var pw = $("[data-password-form]");
  watch(pw, function () { return pw.current.value && pw.next.value.length >= 8 && pw.again.value; });
  pw.addEventListener("submit", function (e) {
    e.preventDefault();
    if (pw.next.value !== pw.again.value) { say(pw, "The new passwords don't match.", true); return; }
    if (!cfg.settingsEndpoint) { say(pw, "Changing passwords isn't connected yet.", true); return; }
    persist("password", { current: pw.current.value, next: pw.next.value }).then(function (ok) { if (ok) closeDlg(pw.closest("dialog")); else say(pw, "We couldn't update your password. Check your current password.", true); });
  });
  var del = $("[data-delete-form]");
  watch(del, function () { return del.confirm.value.trim() === "DELETE" && /^\d{6}$/.test(del.code.value.trim()); });
  del.code.addEventListener("input", function () { var v = del.code.value.replace(/\D/g, "").slice(0, 6); if (v !== del.code.value) del.code.value = v; });
  del.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!cfg.settingsEndpoint) { say(del, "Account deletion isn't connected yet, so nothing was deleted.", true); return; }
    persist("delete", { code: del.code.value.trim() }).then(function (ok) { if (ok) location.href = "index.html"; else say(del, "That code didn't work. Check your authenticator app and try again.", true); });
  });

  /* ---- Profile ---- */
  var edit = function (which, on) {
    $("[data-" + which + "-view]").hidden = on; $("[data-" + which + "-form]").hidden = !on;
    if (on) { var f = $("[data-" + which + "-form]"); f[which].value = A[which]; f[which].focus(); }
  };
  $$("[data-edit]").forEach(function (b) { b.addEventListener("click", function () { edit(b.getAttribute("data-edit"), true); }); });
  $$("[data-edit-cancel]").forEach(function (b) { b.addEventListener("click", function () { var f = b.closest("form"); edit(f.hasAttribute("data-name-form") ? "name" : "email", false); }); });
  ["name", "email"].forEach(function (k) {
    $("[data-" + k + "-form]").addEventListener("submit", function (e) {
      e.preventDefault(); var v = e.target[k].value.trim(); if (!v) return;
      A[k] = v; if (k === "email") A.verified = false;
      edit(k, false); bind(); persist("profile", (function (o) { o[k] = v; return o; })({}));
      if (k === "email") toast("We'll email you a link to verify the new address.");
    });
  });
  var fileIn = $("[data-avatar-file]");
  fileIn.addEventListener("change", function () {
    var f = fileIn.files[0]; if (!f) return;
    if (f.size > 5 * 1048576) { toast("Please choose a photo under 5 MB."); fileIn.value = ""; return; }
    A.avatar = URL.createObjectURL(f); bind(); persist("avatar", {});
  });
  var rmBtn = $("[data-avatar-remove]");
  if (rmBtn) rmBtn.addEventListener("click", function () {
    A.avatar = null; var a = $(".set-avatar"); if (a) { a.style.backgroundImage = ""; a.classList.remove("has-img"); } persist("avatar", { remove: true });
  });

  /* ---- Notifications ---- */
  $$("[data-notify]").forEach(function (i) {
    i.addEventListener("change", function () {
      var k = i.getAttribute("data-notify"); A.notify[k] = i.checked; renderNotify();
      persist("notifications", (function (o) { o[k] = i.checked; return o; })({}));
    });
  });
  $$("[data-q]").forEach(function (i) { i.addEventListener("change", function () { A.notify[i.getAttribute("data-q")] = i.value; renderNotify(); persist("notifications", { quietHours: { start: A.notify.qs, end: A.notify.qe, tz: A.notify.tz } }); }); });
  $("[data-push]").addEventListener("click", function () {
    if (typeof Notification === "undefined") { toast("This browser doesn't support push notifications."); return; }
    Notification.requestPermission().then(function (p) { renderNotify(); if (p === "denied") toast("Push is blocked in your browser settings."); else if (p === "granted") persist("notifications", { push: true }); });
  });
  var nAll = $("[data-notify-all]"); if (nAll) nAll.addEventListener("click", function () {
    var to = !NKEYS.some(function (k) { return A.notify[k]; }), o = {};
    NKEYS.forEach(function (k) { A.notify[k] = to; o[k] = to; }); renderNotify(); persist("notifications", o);
  });
  $("[data-telegram]").addEventListener("click", function () { needsServer("Telegram"); });

  /* ---- Billing, security, API ---- */
  var portalBtn = $("[data-portal]"); if (portalBtn) portalBtn.addEventListener("click", function () { needsServer("The payment portal"); });
  $("[data-2fa]").addEventListener("click", function () { if (needsServer("Two-factor setup")) return; });
  $("[data-signout-all]").addEventListener("click", function () {
    A.sessions = A.sessions.filter(function (s) { return s.current; }); renderSessions(); toast("Signed out of all other devices."); persist("sessions", { signOutAll: true });
  });
  $("[data-api-request]").addEventListener("click", function (e) {
    if (e.currentTarget.hasAttribute("data-api-docs")) { location.href = "developers.html"; return; }
    if (needsServer("API access requests")) return;
  });

  /* ---- Boot ---- */
  show();
  if (/[?&]state=signed-out\b/.test(location.search)) { lock(); return; }
  renderAll();
  if (cfg.sessionEndpoint) {
    fetch(cfg.sessionEndpoint, { credentials: "include" }).then(function (r) { if (r.status === 401 || r.status === 403) { lock(); return null; } return r.ok ? r.json().catch(function () { return null; }) : null; })
      .then(function (u) { if (u) { ["name", "email", "plan", "credits"].forEach(function (k) { if (u[k] != null) A[k] = u[k]; }); renderAll(); } }).catch(function () {});
  }
  if (cfg.accountEndpoint) {
    fetch(cfg.accountEndpoint, { credentials: "include" }).then(function (r) { if (r.status === 401 || r.status === 403) { lock(); return null; } if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { if (d) { Object.keys(d).forEach(function (k) { A[k] = d[k]; }); renderAll(); } })
      .catch(function () { toast("We couldn't load your account details."); });
  }
})();

/* ---- Signup page ---- */
(function () {
  var form = document.querySelector("[data-signup-form]");
  if (!form) return;
  var cfg = (window.MB && window.MB.config) || {};
  var status = form.querySelector("[data-signup-status]");
  var say = function (msg, state) { status.textContent = msg; status.setAttribute("data-state", state || ""); };
  var pw = form.querySelector("#signup-password");
  var eye = form.querySelector("[data-pw-toggle]");
  var meter = form.querySelector(".auth__meter");
  var hint = form.querySelector("[data-pw-hint]");
  eye.addEventListener("click", function () {
    var show = pw.type === "password";
    pw.type = show ? "text" : "password";
    eye.setAttribute("aria-pressed", String(show));
    eye.setAttribute("aria-label", show ? "Hide password" : "Show password");
  });
  pw.addEventListener("input", function () {
    var v = pw.value, level = 0;
    if (v.length >= 8) {
      level = 1;
      if (/[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v)) level = 2;
      if (level === 2 && (v.length >= 12 || /[^A-Za-z0-9]/.test(v))) level = 3;
    }
    meter.setAttribute("data-level", String(level));
    hint.textContent = !v ? "Use 8 or more characters." : level === 0 ? "Keep going: 8 or more characters." : level === 1 ? "Okay. Add upper and lower case and a number to strengthen it." : level === 2 ? "Good." : "Strong.";
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    /* Preview: Create account goes straight through, no details needed. Replace with a real POST to cfg.signupEndpoint { email, password } when the backend is ready. */
    window.location.href = (window.mbAuthNext && window.mbAuthNext.url()) || "studio.html";
  });
  [].forEach.call(document.querySelectorAll("[data-auth-provider]"), function (b) {
    /* Preview: provider buttons go straight through. Replace with the real OAuth redirect. */
    b.addEventListener("click", function () { window.location.href = (window.mbAuthNext && window.mbAuthNext.url()) || "studio.html"; });
  });
})();

/* ---- Forgot password page ---- */
(function () {
  var form = document.querySelector("[data-reset-form]");
  if (!form) return;
  var cfg = (window.MB && window.MB.config) || {};
  var status = form.querySelector("[data-reset-status]");
  var formView = document.querySelector("[data-reset-form-view]");
  var done = document.querySelector("[data-reset-done]");
  var say = function (msg, state) { status.textContent = msg; status.setAttribute("data-state", state || ""); };
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (!cfg.resetEndpoint) { say("Password reset isn't connected yet. Set resetEndpoint in assets/js/layout.js.", "error"); return; }
    var email = form.email.value.trim();
    say("Sending…");
    fetch(cfg.resetEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email }) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); })
      .then(function () {
        done.querySelector("[data-reset-email]").textContent = email;
        formView.hidden = true; done.hidden = false; say("");
      })
      .catch(function () { say("Something went wrong sending that. Please try again.", "error"); });
  });
  done.querySelector("[data-reset-again]").addEventListener("click", function () {
    done.hidden = true; formView.hidden = false; form.email.focus();
  });
})();

/* ---- Legal pages: scroll-spy, mobile contents menu, back to top ---- */
(function () {
  var toc = document.querySelector(".legal-toc");
  if (!toc) return;
  var list = toc.querySelector(".legal-toc__list");
  var btn = toc.querySelector(".legal-toc__btn");
  var cur = toc.querySelector("[data-cur]");
  var side = document.querySelector(".legal__side");

  var ind = document.createElement("span"); ind.className = "legal-toc__ind"; ind.setAttribute("aria-hidden", "true");
  list.insertBefore(ind, list.firstChild);
  function moveInd(a) {
    if (!a) return;
    ind.style.height = a.offsetHeight + "px";
    ind.style.transform = "translateY(" + a.offsetTop + "px)";
    ind.classList.add("is-on");
  }
  var links = [].slice.call(toc.querySelectorAll("a"));
  var tops = links.filter(function (a) { return !a.closest(".legal-toc__sub"); });
  var heads = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
  var lastTop = null, lastSub = null;

  function setCurrent(topId, subId) {
    if (topId === lastTop && subId === lastSub) return;
    lastTop = topId; lastSub = subId;
    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1), on = id === topId || id === subId;
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      if (id === topId) {
        a.parentNode.classList.add("is-open");
        if (cur) cur.textContent = a.textContent.replace(/\s+/g, " ").trim();
      } else if (!a.closest(".legal-toc__sub")) a.parentNode.classList.remove("is-open");
    });
    var act = toc.querySelector('a[aria-current="true"]');
    moveInd(act);
    /* keep the highlighted entry in view inside the sticky sidebar */
    if (act && side && side.scrollHeight > side.clientHeight && window.matchMedia("(min-width: 961px)").matches) {
      var r = act.getBoundingClientRect(), s = side.getBoundingClientRect();
      if (r.top < s.top + 40 || r.bottom > s.bottom - 40) side.scrollTop += r.top - s.top - s.height / 2;
    }
  }

  var topBtn = document.createElement("button");
  topBtn.type = "button"; topBtn.className = "legal-top"; topBtn.setAttribute("aria-label", "Back to top");
  topBtn.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M8 13V3m-4 4l4-4 4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  topBtn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  document.body.appendChild(topBtn);

  function spy() {
    if (gliding) return;
    var cs = getComputedStyle(document.documentElement), first = heads[0],
        y = (parseFloat(cs.scrollPaddingTop) || 80) + (first ? parseFloat(getComputedStyle(first).scrollMarginTop) || 0 : 0) + 24,
        topId = null, subId = null;
    heads.forEach(function (h, i) {
      if (!h || h.getBoundingClientRect().top > y) return;
      var isSub = links[i].closest(".legal-toc__sub");
      if (isSub) subId = h.id; else { topId = h.id; subId = null; }
    });
    setCurrent(topId || (tops[0] && tops[0].getAttribute("href").slice(1)), subId);
    topBtn.classList.toggle("is-on", window.scrollY > 700);
  }
  /* In-page links glide to the target with one short, eased scroll (same length however far away it is). */
  var gliding = false, rafId = 0;
  function glideTo(target) {
    var cs = getComputedStyle(document.documentElement);
    var pad = (parseFloat(cs.scrollPaddingTop) || 80) + (parseFloat(getComputedStyle(target).scrollMarginTop) || 0);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var to = Math.max(0, Math.min(max, target.getBoundingClientRect().top + window.scrollY - pad));
    var from = window.scrollY, dist = to - from;
    cancelAnimationFrame(rafId);
    var root = document.documentElement;
    root.style.scrollBehavior = "auto"; /* the page's smooth-scroll would fight the per-frame scrolling */
    var done = function () {
      gliding = false; root.style.scrollBehavior = ""; spy();
      target.classList.remove("is-flash"); void target.offsetWidth; target.classList.add("is-flash");
      setTimeout(function () { target.classList.remove("is-flash"); }, 1600);
    };
    if (Math.abs(dist) < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { window.scrollTo(0, to); return done(); }
    var dur = 520, t0 = null;
    gliding = true;
    var ease = function (x) { return 1 - Math.pow(1 - x, 4); };
    (function step(now) {
      if (t0 === null) t0 = now;
      var k = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, from + dist * ease(k));
      if (k < 1) rafId = requestAnimationFrame(step); else done();
    })(performance.now());
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('.legal a[href^="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var target = document.getElementById(a.getAttribute("href").slice(1));
    if (!target) return;
    e.preventDefault();
    if (history.replaceState) history.replaceState(null, "", "#" + target.id);
    /* highlight the destination straight away so the sidebar doesn't flicker through every section on the way */
    var id = target.id, isTop = !!toc.querySelector('a[href="#' + id + '"]');
    if (isTop) setCurrent(id, null);
    glideTo(target);
  });
  /* a manual scroll cancels the glide */
  ["wheel", "touchstart", "keydown"].forEach(function (ev) {
    window.addEventListener(ev, function () { if (gliding) { cancelAnimationFrame(rafId); gliding = false; document.documentElement.style.scrollBehavior = ""; } }, { passive: true });
  });

  var tick = false;
  window.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(function () { tick = false; spy(); }); } }, { passive: true });
  window.addEventListener("resize", function () { lastTop = null; spy(); });
  spy();

  if (btn) {
    btn.addEventListener("click", function () {
      var open = list.classList.toggle("is-open"); btn.setAttribute("aria-expanded", String(open));
    });
    list.addEventListener("click", function (e) {
      if (e.target.closest("a")) { list.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { list.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); }
    });
  }
})();

/* ---- Disclosure widgets (FAQ cards, fair-use note): smooth open and close ---------- */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  function setup(d, sum, body) {
    if (!sum || !body || !body.animate) return;
    var anim = null;
    var want = d.open; /* the state the user last asked for */
    sum.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a")) return;
      if (reduce && reduce.matches) return;
      e.preventDefault();
      want = !want;
      var from = anim ? body.getBoundingClientRect().height : (d.open ? body.offsetHeight : 0);
      if (anim) { anim.onfinish = anim.oncancel = null; anim.cancel(); anim = null; }
      var cs = getComputedStyle(body);
      var pb = cs.paddingBottom, mt = cs.marginTop;
      if (want) {
        d.open = true;
        d.classList.remove("is-closing");
        var to = body.offsetHeight;
        anim = body.animate(
          [{ height: from + "px", paddingBottom: from ? pb : "0px", marginTop: from ? mt : "0px", opacity: from ? 0.6 : 0, transform: from ? "none" : "translateY(-6px)" },
           { height: to + "px", paddingBottom: pb, marginTop: mt, opacity: 1, transform: "none" }],
          { duration: 380, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }
        );
        anim.onfinish = function () { anim = null; };
      } else {
        d.classList.add("is-closing");
        anim = body.animate(
          [{ height: from + "px", paddingBottom: pb, marginTop: mt, opacity: 1 },
           { height: "0px", paddingBottom: "0px", marginTop: "0px", opacity: 0 }],
          { duration: 260, easing: "cubic-bezier(0.4, 0, 0.2, 1)" }
        );
        anim.onfinish = function () { d.open = false; d.classList.remove("is-closing"); anim = null; };
      }
    });
  }
  window.mbDisclosure = setup;
  [].forEach.call(document.querySelectorAll(".faq__item"), function (d) {
    setup(d, d.querySelector("summary"), d.querySelector(".faq__a"));
  });
  [].forEach.call(document.querySelectorAll(".fair"), function (d) {
    setup(d, d.querySelector("summary"), d.querySelector(".fair__body"));
  });
})();

/* ---- Add credits ---- */
(function () {
  var cfg = (window.MB && window.MB.config) || {};
  var RATE = 100;
  var MIN = 5, MAX = 2000;
  var PACKS = [10, 25, 50, 100, 150, 200];
  var BONUS = { 25: 3.75, 50: 7.5, 100: 11.25, 150: 15, 200: 20 };
  var dlg = null, st = { method: "card", usd: 10, custom: "", step: 1 };

  var fmtFull = function (n) { return Math.round(n).toLocaleString("en-GB"); };
  var money = function (n) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var pctFor = function (usd) {
    if (st.method !== "usdc") return 0;
    var p = 0; Object.keys(BONUS).forEach(function (k) { if (usd >= +k) p = BONUS[k]; }); return p;
  };
  var calc = function (usd) {
    var base = Math.round(usd * RATE), pct = pctFor(usd), bonus = Math.floor(base * pct / 100);
    return { base: base, pct: pct, bonus: bonus, total: base + bonus };
  };
  var current = function () {
    if (st.custom !== "") { var v = parseFloat(st.custom.replace(/,/g, "")); return isFinite(v) ? Math.round(v * 100) / 100 : NaN; }
    return st.usd;
  };

  var build = function () {
    dlg = document.createElement("dialog");
    dlg.className = "cr";
    dlg.setAttribute("aria-labelledby", "cr-title");
    dlg.innerHTML =
      '<div class="cr__head">' +
        '<img class="cr__logo" src="assets/img/logo-mark.png" alt="" aria-hidden="true">' +
        '<h2 id="cr-title">Add credits</h2>' +
        '<button class="icon-btn cr__x" type="button" data-cr-close aria-label="Close"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>' +
      '</div>' +
      '<div class="cr__inner" data-cr-step="1">' + '<h3 style="margin:0 0 0.65rem;font-size:0.88rem;font-weight:700">How many credits do you want?</h3>' +
        '<div class="cr__method" role="radiogroup" aria-label="Payment method">' +
          '<button type="button" role="radio" data-method="card" aria-checked="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg><span>Pay with card</span></button>' +
          '<button type="button" role="radio" data-method="usdc" aria-checked="false"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg><span>Pay with USDC</span><em>up to 20% bonus</em></button>' +
        '</div>' +
        '<div class="cr__grid" role="radiogroup" aria-label="Credit packs"></div>' +
        '<label class="cr__custom"><span>$</span><input type="text" inputmode="decimal" autocomplete="off" placeholder="Custom amount" data-cr-custom></label>' +
      '</div>' +
      '<div class="cr__inner cr__review" data-cr-step="2" hidden>' +
        '<dl class="cr__sum" data-cr-sum></dl>' +
      '</div>' +
      '<div class="cr__inner" data-cr-step="2-card" hidden>' +
        '<h3 style="margin:0 0 0.65rem;font-size:0.88rem;font-weight:700">Pay with card</h3>' +
        '<div style="display:flex;align-items:center;gap:0.55rem;padding:0.6rem 0.7rem;border:2px solid var(--accent);border-radius:10px;background:rgba(155,123,234,0.04);margin-bottom:0.4rem">' +
          '<input type="radio" name="cr-card" checked style="accent-color:var(--accent)">' +
          '<span class="schip" style="font-size:0.6rem;font-weight:700;letter-spacing:0.04em">VISA</span>' +
          '<div style="flex:1"><strong style="font-size:0.82rem">visa •••• 1958</strong><p style="margin:0;font-size:0.65rem;color:var(--text-faint)">Expires 10/30</p></div>' +
          '<span class="schip" style="font-size:0.55rem">Default</span>' +
        '</div>' +
        '<button class="gk-btn" style="width:100%;justify-content:center;margin-bottom:0.75rem" type="button">Add new card</button>' +
        '<button class="gk-btn gk-btn--solid" style="width:100%;justify-content:center;gap:0.3rem;min-height:2.75rem;font-size:0.88rem" type="button" data-cr-pay-card>' +
          '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
          'Pay <span data-cr-card-total></span></button>' +
        '<p style="text-align:center;font-size:0.68rem;line-height:1.5;color:var(--text-faint);margin:0.6rem 0 0">' +
          '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.7" style="display:inline-block;vertical-align:-1px;margin-right:0.2rem"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> ' +
          'Your payment info is encrypted and secure<br>Appears on your statement as MEGABERRY</p>' +
      '</div>' +
      '<div class="cr__inner cr__crypto" data-cr-step="3" hidden>' +
        '<div class="cr__crypto-badge"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> on Solana</div>' +
        '<div class="cr__crypto-amount" data-cr-crypto-amt>25.00 USDC</div>' +
        '<div class="cr__crypto-timer"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg> Expires in <b data-cr-timer>29:53</b></div>' +
        '<hr style="border:none;border-top:1px solid var(--line);margin:0.75rem 0">' +
        '<p style="text-align:center;font-size:0.72rem;color:var(--text-faint);margin:0 0 0.5rem">Pay from another device</p>' +
        '<details class="cr__qr-toggle"><summary><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> Show QR code</summary><div class="cr__qr-box" style="text-align:center;padding:1rem"><div style="width:120px;height:120px;margin:0 auto;border:2px dashed var(--line);border-radius:8px;display:grid;place-items:center;color:var(--text-faint);font-size:0.6rem">QR placeholder</div></div></details>' +
        '<div style="display:flex;gap:0.4rem;margin-top:0.5rem">' +
          '<button class="gk-btn" type="button" style="flex:1;justify-content:center;gap:0.3rem" onclick="toast(\'Payment link copied!\')"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy payment link</button>' +
          '<button class="gk-btn" type="button" style="flex:1;justify-content:center;gap:0.3rem" onclick="toast(\'Share dialog would open\')"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg> Share</button>' +
        '</div>' +
        '<hr style="border:none;border-top:1px solid var(--line);margin:0.75rem 0">' +
        '<p style="font-size:0.72rem;color:var(--text-faint);margin:0 0 0.35rem">Paying from</p>' +
        '<div class="cr__wallet-row"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--accent)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="13" rx="2"/><path d="M22 10h-6a2 2 0 0 0 0 4h6"/></svg> <span>5WWF…25vJ</span> <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></div>' +
      '</div>' +
      '<div class="cr__foot">' +
        '<button class="gk-btn gk-btn--solid gk-btn--lg cr__go" type="button" data-cr-go>Continue</button>' +
        '<button class="gk-btn gk-btn--lg cr__back" type="button" data-cr-back hidden>Back</button>' +
        '<p class="cr__status form__status" role="status" data-cr-status></p>' + '<p style="margin:0.5rem 0 0;text-align:center;font-size:0.6rem;color:var(--text-faint)">By continuing, you agree to our <a href="terms.html" style="color:var(--accent);text-decoration:none">Terms of Service</a> and <a href="privacy.html" style="color:var(--accent);text-decoration:none">Privacy Policy</a>.</p>' +
      '</div>';
    document.body.appendChild(dlg);

    dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.closest("[data-cr-close]")) dlg.close(); });
    [].forEach.call(dlg.querySelectorAll("[data-method]"), function (b) {
      b.addEventListener("click", function () { st.method = b.getAttribute("data-method"); paint(); });
    });
    var input = dlg.querySelector("[data-cr-custom]");
    input.addEventListener("input", function () { input.value = input.value.replace(/[^\d.,]/g, ""); st.custom = input.value.trim(); paint(true); });
    input.addEventListener("focus", function () { [].forEach.call(dlg.querySelectorAll(".cr__tile"), function (t) { t.setAttribute("aria-checked", "false"); }); st.custom = input.value.trim() || " "; paint(true); });
    dlg.querySelector("[data-cr-back]").addEventListener("click", function () {
      var cardStep = dlg.querySelector('[data-cr-step="2-card"]');
      if (cardStep && !cardStep.hidden) { go(2); return; }
      if (st.step === 3) { clearInterval(st._timer); go(2); } else go(1);
    });
    dlg.querySelector("[data-cr-go]").addEventListener("click", function () { if (st.step === 1) next(); else pay(); });
    dlg.addEventListener("keydown", function (e) { if (e.key === "Enter" && e.target === input) { e.preventDefault(); next(); } });
    // Card pay button
    var cardPayBtn = dlg.querySelector("[data-cr-pay-card]");
    if (cardPayBtn) cardPayBtn.addEventListener("click", function () {
      cardPayBtn.disabled = true; cardPayBtn.textContent = "Processing...";
      setTimeout(function () { dlg.close(); cardPayBtn.disabled = false; if (window.toast) toast("Payment successful! Credits added."); }, 1500);
    });
  };

  var say = function (msg, state) { var s = dlg.querySelector("[data-cr-status]"); s.textContent = msg || ""; s.setAttribute("data-state", state || ""); };

  var paint = function (typing) {
    var usd = current(), valid = isFinite(usd) && usd >= MIN && usd <= MAX;
    [].forEach.call(dlg.querySelectorAll("[data-method]"), function (b) { b.setAttribute("aria-checked", String(b.getAttribute("data-method") === st.method)); });

    var grid = dlg.querySelector(".cr__grid");
    if (!typing || !grid.children.length) {
      grid.innerHTML = PACKS.map(function (pk) {
        var c = calc(pk), on = st.custom === "" && st.usd === pk;
        var pct = c.bonus ? '<span class="cr__pct">+' + c.pct + '%</span>' : '';
        return '<button type="button" role="radio" class="cr__tile" data-usd="' + pk + '" aria-checked="' + on + '">' +
          '<span class="cr__amt">' + fmtFull(c.total) + '</span>' + pct +
          '<span class="cr__usd">' + money(pk) + '</span></button>';
      }).join("");
      [].forEach.call(grid.children, function (b) {
        b.addEventListener("click", function () { st.usd = +b.getAttribute("data-usd"); st.custom = ""; dlg.querySelector("[data-cr-custom]").value = ""; say(""); paint(); });
      });
    } else {
      [].forEach.call(grid.children, function (b) { b.setAttribute("aria-checked", "false"); });
    }
    dlg.querySelector(".cr__custom").classList.toggle("is-on", st.custom !== "");

    var go = dlg.querySelector("[data-cr-go]");
    if (st.step === 1) {
      if (valid) { var tc = calc(usd); go.textContent = "Continue · " + fmtFull(tc.total) + " credits"; }
      else go.textContent = "Continue";
      go.disabled = !valid;
    }
  };

  var sum = function () {
    var usd = current(), c = calc(usd);
    var row = function (k, v, cls) { return '<div' + (cls ? ' class="' + cls + '"' : "") + '><dt>' + k + '</dt><dd>' + v + '</dd></div>'; };
    dlg.querySelector("[data-cr-sum]").innerHTML =
      row("Credits", fmtFull(c.base)) +
      (c.bonus ? row("Bonus +" + c.pct + "%", "+" + fmtFull(c.bonus), "is-bonus") : "") +
      row("Total", fmtFull(c.total) + " credits") +
      row("Method", st.method === "usdc" ? "USDC" : "Card") +
      row("Amount", money(usd), "is-total");
  };

  var goStep = function (id) {
    [].forEach.call(dlg.querySelectorAll("[data-cr-step]"), function (s) { s.hidden = s.getAttribute("data-cr-step") !== id; });
    dlg.querySelector("[data-cr-back]").hidden = false;
    var btn = dlg.querySelector("[data-cr-go]"); btn.hidden = true;
  };
  var go = function (n) {
    st.step = n; say("");
    [].forEach.call(dlg.querySelectorAll("[data-cr-step]"), function (s) { s.hidden = s.getAttribute("data-cr-step") !== String(n); });
    dlg.querySelector("[data-cr-back]").hidden = n === 1;
    var btn = dlg.querySelector("[data-cr-go]");
    btn.disabled = false;
    if (n === 1) { paint(); btn.hidden = false; }
    else if (n === 2) { sum(); btn.textContent = "Pay " + money(current()); btn.hidden = false; }
    else if (n === 3) {
      btn.textContent = "I've sent the payment";
      btn.hidden = false;
      btn.disabled = false;
      btn.onclick = function () { go(4); };
    }
    else if (n === 4) {
      // Awaiting payment state
      [].forEach.call(dlg.querySelectorAll("[data-cr-step]"), function (s) { s.hidden = true; });
      var step3 = dlg.querySelector('[data-cr-step="3"]');
      step3.hidden = false;
      step3.innerHTML = '<div style="text-align:center;padding:2rem 0">' +
        '<div class="cr__spinner"></div>' +
        '<h3 style="font-size:1.1rem;font-weight:700;margin:0.75rem 0 0.25rem">Awaiting payment</h3>' +
        '<p style="font-size:0.75rem;color:var(--text-faint);margin:0 0 1.5rem">Waiting for network confirmations.</p>' +
        '<hr style="border:none;border-top:1px solid var(--line);margin:0 0 0.75rem">' +
        '<div style="display:flex;justify-content:space-between;font-size:0.78rem;color:var(--text-muted)"><span>Amount</span><b style="color:var(--text-strong)">' + money(current()).replace("$","") + ' USDC</b></div>' +
        '</div>';
      btn.textContent = "Back";
      btn.onclick = function () { btn.onclick = null; go(2); };
      dlg.querySelector("[data-cr-back]").hidden = true;
    }
  };
  var next = function () { var u = current(); if (isFinite(u) && u >= MIN && u <= MAX) go(2); };

  var pay = function () {
    var usd = current(), c = calc(usd);
    if (st.method === "usdc") {
      // Show crypto payment step
      var amt = dlg.querySelector("[data-cr-crypto-amt]");
      if (amt) amt.textContent = money(usd).replace("$","") + " USDC";
      go(3);
      // Start countdown timer
      var timerEl = dlg.querySelector("[data-cr-timer]");
      var secs = 30 * 60;
      clearInterval(st._timer);
      st._timer = setInterval(function () {
        secs--;
        if (secs <= 0) { clearInterval(st._timer); timerEl.textContent = "Expired"; return; }
        var m = Math.floor(secs / 60), s = secs % 60;
        timerEl.textContent = m + ":" + (s < 10 ? "0" : "") + s;
      }, 1000);
      return;
    }
    // Card payment - show card selection step
    var cardTotal = dlg.querySelector("[data-cr-card-total]");
    if (cardTotal) cardTotal.textContent = money(usd);
    goStep("2-card");
  };

  var open = function () {
    if (!dlg) build();
    st = { method: "card", usd: 10, custom: "", step: 1 };
    dlg.querySelector("[data-cr-custom]").value = "";
    go(1);
    if (!dlg.open) dlg.showModal();
  };
  window.MB = window.MB || {};
  window.MB.openCredits = open;
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-credits-open]");
    if (t) { e.preventDefault(); open(); }
  });
})();

/* ---- Model selector dropdown ---- */
(function () {
  var wrap = document.querySelector("[data-gen-model]");
  if (!wrap) return;
  var btn = wrap.querySelector(".gen__model-btn");
  var list = wrap.querySelector(".gen__model-list");
  var label = wrap.querySelector("[data-gen-model-val]");
  btn.addEventListener("click", function () {
    var open = list.hidden;
    list.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", function (e) { if (!wrap.contains(e.target)) { list.hidden = true; btn.setAttribute("aria-expanded", "false"); } });
  [].forEach.call(list.querySelectorAll(".gen__model-opt"), function (opt) {
    opt.addEventListener("click", function () {
      [].forEach.call(list.querySelectorAll(".gen__model-opt"), function (o) { o.classList.remove("is-on"); o.removeAttribute("aria-selected"); });
      opt.classList.add("is-on"); opt.setAttribute("aria-selected", "true");
      label.textContent = opt.getAttribute("data-val");
      list.hidden = true; btn.setAttribute("aria-expanded", "false");
    });
  });
})();

/* ---- Global / Own toggle ---- */
(function () {
  var grp = document.querySelector(".gen__toggle");
  if (!grp) return;
  [].forEach.call(grp.querySelectorAll("button"), function (btn) {
    btn.addEventListener("click", function () {
      [].forEach.call(grp.querySelectorAll("button"), function (b) { b.setAttribute("aria-checked", "false"); });
      btn.setAttribute("aria-checked", "true");
    });
  });
})();

/* ---- Prompt picker dialog ---- */
(function () {
  var btn = document.querySelector(".gen__prompt-pick");
  var dlg = document.querySelector("[data-prompt-pick-dlg]");
  if (!btn || !dlg) return;
  btn.addEventListener("click", function () { if (!dlg.open) dlg.showModal(); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.closest("[data-ppick-close]")) dlg.close(); });
  [].forEach.call(dlg.querySelectorAll(".ppick__tab"), function (tab) {
    tab.addEventListener("click", function () {
      [].forEach.call(dlg.querySelectorAll(".ppick__tab"), function (t) { t.classList.remove("is-on"); t.setAttribute("aria-selected", "false"); });
      tab.classList.add("is-on"); tab.setAttribute("aria-selected", "true");
      var which = tab.getAttribute("data-ppick-tab");
      [].forEach.call(dlg.querySelectorAll("[data-ppick-panel]"), function (p) { p.hidden = p.getAttribute("data-ppick-panel") !== which; });
    });
  });
})();

/* ---- Top bar dropdown menus ---- */
(function () {
  [].forEach.call(document.querySelectorAll("[data-gen-dd]"), function (dd) {
    var btn = dd.querySelector("[data-gen-dd-btn]");
    var menu = dd.querySelector(".gen__dd-menu");
    if (!btn || !menu) return;
    btn.addEventListener("click", function () {
      // close all others first
      [].forEach.call(document.querySelectorAll("[data-gen-dd] .gen__dd-menu"), function (m) { if (m !== menu) m.hidden = true; });
      menu.hidden = !menu.hidden;
    });
    // option clicks within groups (radio-like)
    [].forEach.call(menu.querySelectorAll(".gen__dd-group"), function (grp) {
      [].forEach.call(grp.querySelectorAll(".gen__dd-opt"), function (opt) {
        opt.addEventListener("click", function () {
          [].forEach.call(grp.querySelectorAll(".gen__dd-opt"), function (o) { o.classList.remove("is-on"); });
          opt.classList.add("is-on");
        });
      });
    });
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest("[data-gen-dd]")) {
      [].forEach.call(document.querySelectorAll("[data-gen-dd] .gen__dd-menu"), function (m) { m.hidden = true; });
    }
  });
})();

/* ---- Segmented controls (resolution etc.) ---- */
(function () {
  [].forEach.call(document.querySelectorAll(".gen__seg"), function (grp) {
    [].forEach.call(grp.querySelectorAll("button"), function (btn) {
      btn.addEventListener("click", function () {
        [].forEach.call(grp.querySelectorAll("button"), function (b) { b.setAttribute("aria-checked", "false"); });
        btn.setAttribute("aria-checked", "true");
      });
    });
  });
})();

/* ---- Info tooltips ---- */
(function () {
  [].forEach.call(document.querySelectorAll("[data-gen-tip]"), function (btn) {
    var tip = btn.nextElementSibling;
    if (!tip) return;
    btn.addEventListener("click", function () { tip.hidden = !tip.hidden; });
    document.addEventListener("click", function (e) { if (!btn.contains(e.target) && !tip.contains(e.target)) tip.hidden = true; });
  });
})();

/* ---- Pin tools to sidebar ---- */
(function () {
  var KEY = "mb.pins";
  var getPins = function () { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (_) { return []; } };
  var savePins = function (arr) { try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch (_) {} };

  var nav = document.querySelector(".app__nav");
  if (!nav) return;
  var pinnedWrap = nav.querySelector("[data-pinned]");
  var pinnedList = nav.querySelector("[data-pinned-list]");
  if (!pinnedWrap || !pinnedList) return;

  var allSubs = [].slice.call(nav.querySelectorAll("[data-pin-id]"));

  var render = function () {
    var pins = getPins();
    // Mark pinned state
    allSubs.forEach(function (a) {
      a.classList.toggle("is-pinned", pins.indexOf(a.getAttribute("data-pin-id")) > -1);
    });
    // Build pinned section
    if (pins.length === 0) { pinnedWrap.hidden = true; pinnedList.innerHTML = ""; return; }
    pinnedWrap.hidden = false;
    pinnedList.innerHTML = pins.map(function (id) {
      var src = nav.querySelector('[data-pin-id="' + id + '"]');
      if (!src) return "";
      return '<a class="app__sub app__sub--pinned" href="' + src.getAttribute("href") + '" data-pinned-id="' + id + '">' +
        src.querySelector("svg").outerHTML + "<span>" + src.querySelector("span").textContent + "</span>" +
        '<svg class="app__unpin" viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m4 4 8 8M12 4l-8 8"/></svg></a>';
    }).join("");
    // Unpin from pinned section
    [].forEach.call(pinnedList.querySelectorAll(".app__unpin"), function (x) {
      x.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); toggle(x.closest("[data-pinned-id]").getAttribute("data-pinned-id")); });
    });
  };

  var toggle = function (id) {
    var pins = getPins();
    var i = pins.indexOf(id);
    if (i > -1) pins.splice(i, 1); else pins.push(id);
    savePins(pins);
    render();
  };

  // Pin icon click
  allSubs.forEach(function (a) {
    var pin = a.querySelector(".app__pin");
    if (pin) pin.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); toggle(a.getAttribute("data-pin-id")); });
  });

  render();
})();

/* ---- Connect Avatar dialog (claim an avatar / train your own) -------------
   Opens from anything marked data-avatar-open. Demo data only: wire the list,
   activate, remove and Fanplace connect to the real API. */
(function () {
  if (document.body.getAttribute("data-shell") !== "app") return;
  var PER = 5, dlg, st;
  var NAMES = ["Austin", "Harry", "Steven", "Stephen", "Nikki", "Jordan", "Maya", "Leo", "Chloe", "Marcus", "Priya", "Tom", "Elena", "Kai", "Sofia"];
  var DATES = ["10/27/2026", "10/20/2026", "10/20/2026", "10/10/2026", "10/04/2026", "09/28/2026", "09/21/2026", "09/15/2026", "09/02/2026", "08/24/2026", "08/11/2026", "07/30/2026", "07/19/2026", "07/06/2026", "06/22/2026"];
  var seed = function (withActive) { return NAMES.map(function (n, i) { return { name: n, date: DATES[i], active: withActive && i === 0 }; }); };
  var linked = function () { return (document.body.getAttribute("data-dev-mode") || "linked") === "linked"; };
  var ic = function (d, s) { return '<svg viewBox="0 0 24 24" width="' + (s || 18) + '" height="' + (s || 18) + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>"; };
  var CHECK = '<path d="m5 12.5 4.5 4.5L19 7.5"/>', X = '<path d="m6 6 12 12M18 6 6 18"/>';

  var build = function () {
    dlg = document.createElement("dialog");
    dlg.className = "sdlg av";
    dlg.setAttribute("aria-labelledby", "av-title");
    dlg.innerHTML =
      '<div class="sdlg__head"><h2 id="av-title">Connect Avatar</h2><button class="icon-btn" type="button" data-av-close aria-label="Close">' + ic(X, 20) + "</button></div>" +
      '<div class="av__body">' +
        '<div class="av__tabs" role="tablist" aria-label="How to connect an avatar">' +
          '<button type="button" role="tab" data-av-tab="claim">' + ic('<path d="M9 17H7a5 5 0 0 1 0-10h2M15 7h2a5 5 0 0 1 0 10h-2M8 12h8"/>') + "Claim Avatar</button>" +
          '<button type="button" role="tab" data-av-tab="train">' + ic('<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/>') + "Train Your Own Avatar</button>" +
        "</div>" +
        '<div data-av-panel="claim"></div>' +
        '<div data-av-panel="train" hidden>' +
          '<div class="av__train">' +
            '<span class="av__pill av__pill--active">Max plan</span>' +
            "<h3>Train an avatar from your own photos</h3>" +
            "<p>Your likeness is locked once and reused across every image and video you generate.</p>" +
            '<ol class="av__steps">' +
              "<li><b>1</b><div><strong>Upload 20-80 photos of yourself</strong><span>Clear, well-lit shots from a variety of angles work best.</span></div></li>" +
              "<li><b>2</b><div><strong>Verify your identity</strong><span>A quick camera check in your browser, so every avatar is tied to a verified person.</span></div></li>" +
              "<li><b>3</b><div><strong>Train and activate</strong><span>The avatar stays in your account and is never shared with the community.</span></div></li>" +
            "</ol>" +
            '<button class="gk-btn gk-btn--solid" type="button" data-train-open>Start training</button>' +
          "</div>" +
        "</div>" +
        '<p class="av__status" role="status" data-av-status></p>' +
      "</div>";
    document.body.appendChild(dlg);
    dlg.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target : null; if (!t) return;
      if (t === dlg || t.closest("[data-av-close]")) { dlg.close(); return; }
      var tab = t.closest("[data-av-tab]"); if (tab) { st.tab = tab.getAttribute("data-av-tab"); render(); return; }
      var pg = t.closest("[data-av-page]"); if (pg && !pg.disabled) { st.page = +pg.getAttribute("data-av-page"); render(); return; }
      var act = t.closest("[data-av-activate]");
      if (act) {
        var i = +act.getAttribute("data-av-activate");
        st.list.forEach(function (a, n) { a.active = n === i; });
        say(st.list[i].name + " is now your active avatar.");
        var dv = document.querySelector('.dev-view [data-dv="linked"]');
        if (dv && !linked()) dv.click();
        render(); return;
      }
      var rm = t.closest("[data-av-remove]");
      if (rm) {
        var gone = st.list.splice(+rm.getAttribute("data-av-remove"), 1)[0];
        st.page = Math.min(st.page, Math.max(1, Math.ceil(st.list.length / PER)));
        say(gone.name + " removed from your account.");
        render(); return;
      }
      if (t.closest("[data-av-connect]")) { st.connected = true; st.list = seed(false); st.page = 1; say("Fanplace connected. Pick an avatar to activate."); render(); }
    });
    dlg.addEventListener("close", function () { document.body.classList.remove("is-dlg"); });
  };

  var say = function (m) { var s = dlg.querySelector("[data-av-status]"); if (s) s.textContent = m; };

  var render = function () {
    [].forEach.call(dlg.querySelectorAll("[data-av-tab]"), function (b) { b.setAttribute("aria-selected", String(b.getAttribute("data-av-tab") === st.tab)); });
    [].forEach.call(dlg.querySelectorAll("[data-av-panel]"), function (p) { p.hidden = p.getAttribute("data-av-panel") !== st.tab; });
    var pages = Math.max(1, Math.ceil(st.list.length / PER)), from = (st.page - 1) * PER, h = "";
    h += '<div class="av__list-head"><h3>Your Claimed Avatars</h3><span>(' + st.list.length + ")</span></div>";
    if (!st.list.length) {
      h += '<div class="av__empty"><strong>No avatars claimed yet</strong><p>' + (st.connected ? "Avatars you own on Fanplace will show up here." : "Connect your Fanplace account to claim the avatars you own.") + "</p></div>";
    } else {
      h += '<ul class="av__list">';
      st.list.slice(from, from + PER).forEach(function (a, k) {
        var i = from + k;
        h += '<li class="av__row' + (a.active ? " is-active" : "") + '"><span class="av__tick">' + ic(CHECK, 18) + '</span><div class="av__who"><strong>' + a.name + "</strong><small>Claimed on " + a.date + "</small></div>" +
          (a.active ? '<span class="av__pill av__pill--active">Active</span>' : '<span class="av__pill">Claimed</span><button class="av__act" type="button" data-av-activate="' + i + '">Activate</button>') +
          '<button class="av__x" type="button" data-av-remove="' + i + '" aria-label="Remove ' + a.name + '">' + ic(X, 14) + "</button></li>";
      });
      h += "</ul>";
      if (pages > 1) {
        h += '<nav class="av__pager" aria-label="Avatar pages"><button type="button" data-av-page="' + (st.page - 1) + '"' + (st.page === 1 ? " disabled" : "") + ">" + ic('<path d="m15 6-6 6 6 6"/>', 16) + "Previous</button>";
        for (var p = 1; p <= pages; p++) h += '<button type="button" class="av__num" data-av-page="' + p + '"' + (p === st.page ? ' aria-current="page"' : "") + ">" + p + "</button>";
        h += '<button type="button" data-av-page="' + (st.page + 1) + '"' + (st.page === pages ? " disabled" : "") + ">Next" + ic('<path d="m9 6 6 6-6 6"/>', 16) + "</button></nav>";
      }
    }
    h += '<div class="av__fan"><span class="av__fan-ic"><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="#5b9cf5" d="M5 3h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8l-5 4v-4H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M8 8.5h8M8 12h5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>' + (st.connected ? '<i>' + ic(CHECK, 10) + "</i>" : "") + '</span><div class="av__who"><strong>Fanplace Account</strong><small>' + (st.connected ? "Connected" : "Not connected") + "</small></div>" +
      (st.connected ? "" : '<button class="gk-btn gk-btn--solid gk-btn--sm" type="button" data-av-connect>Connect</button>') + "</div>";
    dlg.querySelector('[data-av-panel="claim"]').innerHTML = h;
  };

  var open = function () {
    if (!dlg) build();
    var on = linked();
    st = { tab: "claim", page: 1, connected: on, list: on ? seed(true) : [] };
    say(""); render();
    if (!dlg.open) dlg.showModal();
    document.body.classList.add("is-dlg");
  };
  window.MB = window.MB || {};
  window.MB.openAvatar = open;
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-avatar-open]");
    if (t) { e.preventDefault(); open(); }
  });
})();

/* ---- Train Your Own Avatar: 1 Upload Photos, 2 Verification ---------------
   Opens from data-train-open. Demo only: photos never leave the browser and
   the camera is not accessed. Wire upload, verification and training to the API. */
(function () {
  if (document.body.getAttribute("data-shell") !== "app") return;
  var MIN = 20, MAX = 80, dlg, st;
  var ic = function (d, s) { return '<svg viewBox="0 0 24 24" width="' + (s || 18) + '" height="' + (s || 18) + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>"; };
  var CHECK = '<path d="m5 12.5 4.5 4.5L19 7.5"/>', X = '<path d="m6 6 12 12M18 6 6 18"/>';
  var li = function (items, good) { return items.map(function (t) { return "<li>" + ic(good ? CHECK : X, 16) + "<span>" + t + "</span></li>"; }).join(""); };

  var build = function () {
    dlg = document.createElement("dialog");
    dlg.className = "sdlg tr";
    dlg.setAttribute("aria-labelledby", "tr-title");
    dlg.innerHTML =
      '<div class="tr__head"><div><h2 id="tr-title" data-tr-title></h2><p data-tr-sub></p></div><button class="tr__close" type="button" data-tr-close>Close' + ic(X, 18) + "</button></div>" +
      '<ol class="tr__stepper" aria-label="Progress"><li data-tr-dot="1">1</li><li class="tr__line" aria-hidden="true"></li><li data-tr-dot="2">2</li></ol>' +
      '<div class="tr__body">' +
        '<section data-tr-step="1">' +
          '<div class="tr__count"><span class="tr__pill" data-tr-count></span><span class="tr__need" data-tr-need></span><button class="tr__link" type="button" data-tr-clear hidden>Clear all</button></div>' +
          '<div class="tr__bar"><span data-tr-fill></span></div>' +
          '<label class="tr__drop" data-tr-drop><input type="file" accept="image/jpeg,image/png" multiple hidden data-tr-file>' + ic('<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5"/><path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"/>', 44) + '<strong><em>Click to upload</em> or drag and drop</strong><small>JPG, PNG up to 10MB each</small></label>' +
          '<button class="tr__link tr__demo" type="button" data-tr-sample>Demo: add 24 sample photos</button>' +
          '<p class="tr__note">Your avatar will reflect what photos you provide here. Higher quality input means higher quality results.</p>' +
          '<div class="tr__dos">' +
            '<div class="tr__do"><h3>' + ic('<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/>', 18) + "Do</h3><ul>" + li(["Clear, well-lit photos of your face", "A variety of angles and expressions", "Different outfits and backgrounds"], true) + "</ul></div>" +
            '<div class="tr__dont"><h3>' + ic('<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>', 18) + "Don't</h3><ul>" + li(["Heavy filters or extreme edits", "Sunglasses, masks or anything covering your face", "Group photos or other people in frame"], false) + "</ul></div>" +
          "</div>" +
        "</section>" +
        '<section data-tr-step="2" hidden>' +
          '<div class="tr__cam" data-tr-cam>' + ic('<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="10.5" r="3"/><path d="M7 17.5c1-2 2.800-3 5-3s4 1 5 3"/>', 56) + '<strong data-tr-cam-title>Camera check</strong><small data-tr-cam-sub>We match your face to the photos you uploaded. It takes a few seconds.</small></div>' +
          '<ul class="tr__facts">' + li(["Done in your browser with your device camera. Chrome works best.", "If the camera is blocked, allow camera access for this site and try again.", "Your avatar stays in your account and is never shared with the community."], true) + "</ul>" +
          '<label class="tr__agree"><input type="checkbox" data-tr-agree><span>I confirm these photos are of me and I have the right to train an avatar from them.</span></label>' +
        "</section>" +
        '<section data-tr-step="3" hidden><div class="tr__done">' + ic(CHECK, 30) + "<strong>Training started</strong><p>Your avatar is being trained from <b data-tr-n></b> photos. We'll let you know when it's ready to activate.</p></div></section>" +
      "</div>" +
      '<div class="tr__foot"><button class="gk-btn" type="button" data-tr-back hidden>Back</button><button class="gk-btn gk-btn--solid" type="button" data-tr-next></button></div>';
    document.body.appendChild(dlg);
    var $ = function (s) { return dlg.querySelector(s); };
    $("[data-tr-file]").addEventListener("change", function () { add(this.files.length); this.value = ""; });
    var drop = $("[data-tr-drop]");
    ["dragenter", "dragover"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("is-over"); }); });
    ["dragleave", "drop"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("is-over"); }); });
    drop.addEventListener("drop", function (e) { var n = 0; [].forEach.call((e.dataTransfer && e.dataTransfer.files) || [], function (f) { if (/^image\/(jpeg|png)$/.test(f.type)) n++; }); add(n); });
    $("[data-tr-agree]").addEventListener("change", render);
    dlg.addEventListener("click", function (e) {
      var t = e.target;
      if (t.closest("[data-tr-close]")) { dlg.close(); return; }
      if (t.closest("[data-tr-sample]")) { add(24); return; }
      if (t.closest("[data-tr-clear]")) { st.n = 0; render(); return; }
      if (t.closest("[data-tr-back]")) { st.step = 1; st.verified = false; st.checking = false; render(); return; }
      if (t.closest("[data-tr-next]")) next();
    });
    dlg.addEventListener("close", function () { document.body.classList.remove("is-dlg"); });
  };

  var add = function (n) { st.n = Math.min(MAX, st.n + n); render(); };

  var next = function () {
    if (st.step === 1) { if (st.n >= MIN) { st.step = 2; render(); } return; }
    if (st.step === 2) {
      if (!st.verified) {
        if (st.checking) return;
        st.checking = true; render();
        setTimeout(function () { if (!dlg.open || st.step !== 2) return; st.checking = false; st.verified = true; render(); }, 1400);
        return;
      }
      st.step = 3; render(); return;
    }
    dlg.close();
  };

  var render = function () {
    var $ = function (s) { return dlg.querySelector(s); }, s = st.step;
    $("[data-tr-title]").textContent = s === 1 ? "Upload Photos" : s === 2 ? "Verification" : "All set";
    $("[data-tr-sub]").textContent = s === 1 ? "Add " + MIN + "-" + MAX + " photos of yourself" : s === 2 ? "Confirm it's really you before training starts" : "Your avatar is on its way";
    [].forEach.call(dlg.querySelectorAll("[data-tr-step]"), function (el) { el.hidden = +el.getAttribute("data-tr-step") !== s; });
    [].forEach.call(dlg.querySelectorAll("[data-tr-dot]"), function (el) { var n = +el.getAttribute("data-tr-dot"); el.className = n === s ? "is-on" : n < s ? "is-done" : ""; if (n === s) el.setAttribute("aria-current", "step"); else el.removeAttribute("aria-current"); });
    $(".tr__stepper").hidden = s === 3;
    $("[data-tr-count]").textContent = st.n + " / " + MAX + " photos";
    var need = $("[data-tr-need]"), ok = st.n >= MIN;
    need.textContent = ok ? (st.n >= MAX ? "Maximum reached" : "Ready to continue") : "Minimum " + MIN + " required";
    need.className = "tr__need" + (ok ? " is-ok" : "");
    $("[data-tr-fill]").style.width = Math.round(st.n / MAX * 100) + "%";
    $("[data-tr-clear]").hidden = !st.n;
    $("[data-tr-n]").textContent = st.n;
    var cam = $("[data-tr-cam]");
    cam.className = "tr__cam" + (st.verified ? " is-ok" : st.checking ? " is-busy" : "");
    $("[data-tr-cam-title]").textContent = st.verified ? "Identity verified" : st.checking ? "Checking…" : "Camera check";
    $("[data-tr-cam-sub]").textContent = st.verified ? "You're good to go. Start training when you're ready." : st.checking ? "Hold still and look at the camera." : "We match your face to the photos you uploaded. It takes a few seconds.";
    $("[data-tr-back]").hidden = s !== 2;
    var nx = $("[data-tr-next]");
    nx.innerHTML = s === 1 ? "Next" + ic('<path d="m9 6 6 6-6 6"/>', 16) : s === 2 ? (st.verified ? "Start training" : st.checking ? "Checking…" : "Start verification") : "Done";
    nx.disabled = (s === 1 && !ok) || (s === 2 && (st.checking || !$("[data-tr-agree]").checked));
  };

  var open = function () {
    if (!dlg) build();
    st = { step: 1, n: 0, verified: false, checking: false };
    dlg.querySelector("[data-tr-agree]").checked = false;
    render();
    [].forEach.call(document.querySelectorAll("dialog[open]"), function (d) { if (d !== dlg) d.close(); });
    dlg.showModal();
    document.body.classList.add("is-dlg");
  };
  window.MB = window.MB || {};
  window.MB.openTrain = open;
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("[data-train-open]");
    if (t) { e.preventDefault(); open(); }
  });
})();

/* ---- Intended Output bar: click anywhere to switch to the next option ---- */
(function () {
  var cycle = function (row) {
    var sel = row.querySelector("select"); if (!sel) return;
    sel.selectedIndex = (sel.selectedIndex + 1) % sel.options.length;
    sel.classList.toggle("is-accent", sel.selectedIndex > 0);
    sel.dispatchEvent(new Event("change", { bubbles: true }));
  };
  document.addEventListener("mousedown", function (e) { if (e.target.closest && e.target.closest(".ai__row--select")) e.preventDefault(); });
  document.addEventListener("click", function (e) { var row = e.target.closest && e.target.closest(".ai__row--select"); if (row) { e.preventDefault(); cycle(row); } });
  document.addEventListener("keydown", function (e) { var row = e.target.closest && e.target.closest(".ai__row--select"); if (row && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); cycle(row); } });
  [].forEach.call(document.querySelectorAll(".ai__row--select"), function (r) { r.setAttribute("tabindex", "0"); r.setAttribute("role", "button"); var s = r.querySelector("select"); if (s) s.setAttribute("tabindex", "-1"); });
})();
