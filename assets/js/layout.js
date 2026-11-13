/* Shared site chrome: header + footer are rendered here once, so every page
   stays in sync. Pages only need:
     <header class="site-header" id="site-header"></header>
     <footer class="site-footer" id="site-footer"></footer>
   and <body data-page="pricing"> to highlight the right nav link.
   For pages in sub-folders set <body data-root="../"> so links resolve. */
(function () {
  "use strict";

  var CONFIG = {
    brand: "MegaBerry",
    // TODO: point these at the live Studio / sign-in URLs before launch.
    appUrl: "signup.html",
    signInUrl: "login.html",
    // TODO: set to a form endpoint (e.g. your backend or a form service) to enable the contact form.
    formEndpoint: "",
    // TODO: set to your sign-in endpoint (POST {email, password}) to enable the login form.
    authEndpoint: "",
    // TODO: set to your password-reset endpoint (POST {email}) to enable the forgot-password form.
    resetEndpoint: "",
    // TODO: set to your sign-up endpoint (POST {email, password}) to enable the create-account form.
    signupEndpoint: "",
    // TODO: set to your support-ticket endpoint (POST multipart form) to enable the support form.
    ticketEndpoint: "",
    // TODO: optional. A GET endpoint that returns 200 when the visitor is signed in and 401 when not. Support needs an account, so signed-out visitors see a sign-in prompt instead of the form.
    sessionEndpoint: "",
    // TODO: support tickets. GET ticketsEndpoint -> [{id, subject, category, priority, status, created, updated, messages:[{from, date, text}]}],
    // GET ticketsEndpoint/<id> -> one ticket, POST replyEndpoint {id, message} to reply. Until set, the pages show sample tickets.
    ticketsEndpoint: "",
    replyEndpoint: "",
    // TODO: signed-in account menu. POST logoutEndpoint to end the session (then goes to login.html); the Account and Billing links are guesses, point them at the real pages.
    logoutEndpoint: "",
    accountUrl: "settings.html#profile",
    billingUrl: "settings.html#billing",
    // TODO: settings page. GET accountEndpoint -> {name, email, verified, plan, credits, cards, connections, seatsShared, seatsReceived, notify, invoices, twoFactor, sessions, activity, blocked, api}.
    // POST settingsEndpoint {section, data} saves a change. Until set, the page shows sample data and says changes aren't saved.
    // TODO: Add credits. POST checkoutEndpoint {amountUsd, credits, bonus, method: "card"|"usdc"} -> {url} to send the buyer to the payment page. Until set, the dialog says checkout is not connected.
    checkoutEndpoint: "",
    accountEndpoint: "",
    settingsEndpoint: ""
  };
  window.MB = window.MB || {};
  window.MB.config = CONFIG;

  var NAV = [
    { key: "showroom", href: "index.html#showroom", label: "Showroom" },
    { key: "pricing",  href: "pricing.html",  label: "Pricing" },
    { key: "trust",    href: "trust.html",    label: "Trust & safety" },
    { key: "faq",      href: "faq.html",      label: "FAQ" }
  ];

  var FOOTER = [
    { title: "Product", links: [
      ["Pricing", "pricing.html"], ["Affiliate Program", "affiliate-program.html"]
    ]},
    { title: "Resources", links: [
      ["FAQ", "faq.html"], ["Developers", "developers.html"], ["Trust & safety", "trust.html"], ["Contact sales", "contact.html"]
    ]},
    { title: "Legal", links: [
      ["Privacy", "privacy.html"], ["Terms", "terms.html"]
    ]}
  ];

  var root = document.body.getAttribute("data-root") || "";
  var page = document.body.getAttribute("data-page") || "";

  // Real MegaBerry mark. Replace assets/img/logo-mark.png (ideally with an SVG or a 256px+ PNG).
  var MARK = '<img class="brand__mark" src="' + root + 'assets/img/logo-mark.png" width="28" height="28" alt="">';

  var MENU =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">' +
    '<path d="M4 7h16M4 12h16M4 17h16"/></svg>';

  // arrow-right icon
  var ARROW =
    '<svg class="gk-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M4 12h16M14 6l6 6-6 6"/></svg>';

  function href(h) { return /^(https?:|\/|#|mailto:)/.test(h) ? h : root + h; }

  // soft purple glow behind the page (glass-kit "ambient")
  if (!document.querySelector(".gk-ambient")) {
    var amb = document.createElement("div");
    amb.className = "gk-ambient"; amb.setAttribute("aria-hidden", "true");
    amb.innerHTML = '<span class="gk-orb a"></span><span class="gk-orb b"></span><span class="gk-orb c"></span>';
    document.body.insertBefore(amb, document.body.firstChild);
  }

  var header = document.getElementById("site-header");
  if (header) {
    var links = NAV.map(function (n) {
      return '<a href="' + href(n.href) + '"' + (n.key === page ? ' aria-current="page"' : "") + ">" + n.label + "</a>";
    }).join("");
    header.innerHTML =
      '<div class="container header__inner">' +
        '<a class="brand" href="' + href("index.html") + '" aria-label="' + CONFIG.brand + ' home">' + MARK + "<span>" + CONFIG.brand + "</span></a>" +
        '<nav class="nav" id="primary-nav" aria-label="Primary"><span class="nav__pill" aria-hidden="true"></span>' + links + "</nav>" +
        '<div class="header__actions">' +
          '<a class="gk-btn header__signin" href="' + href(CONFIG.signInUrl) + '">Sign in</a>' +
          '<a class="gk-btn gk-btn--solid" href="' + href(CONFIG.appUrl) + '">Start free ' + ARROW + '</a>' +
          '<button class="icon-btn nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav" aria-label="Open menu">' + MENU + "</button>" +
        "</div>" +
      "</div>";
  }

  // glass pill nav: the highlight glides to the hovered / focused link and rests on the current page
  var nav = document.getElementById("primary-nav");
  var pill = nav && nav.querySelector(".nav__pill");
  if (pill) {
    var navLinks = [].slice.call(nav.querySelectorAll("a"));
    var current = nav.querySelector('a[aria-current="page"]');
    var moveTo = function (a) {
      if (getComputedStyle(pill).display === "none") return;
      pill.style.width = a.offsetWidth + "px";
      pill.style.transform = "translateX(" + a.offsetLeft + "px)";
      pill.classList.add("is-on");
    };
    var rest = function () { if (current) moveTo(current); else pill.classList.remove("is-on"); };
    navLinks.forEach(function (a) {
      a.addEventListener("pointerenter", function () { moveTo(a); });
      a.addEventListener("focus", function () { moveTo(a); });
    });
    nav.addEventListener("pointerleave", rest);
    nav.addEventListener("focusout", function (e) { if (!nav.contains(e.relatedTarget)) rest(); });
    window.addEventListener("resize", rest);
    window.addEventListener("load", rest);
    if (current) { pill.style.transition = "none"; rest(); void pill.offsetWidth; pill.style.transition = ""; }
  }

  var footer = document.getElementById("site-footer");
  if (footer) {
    var cols = FOOTER.map(function (c) {
      return '<div class="footer__col"><h2>' + c.title + "</h2>" +
        c.links.map(function (l) { return '<a href="' + href(l[1]) + '">' + l[0] + "</a>"; }).join("<br>") + "</div>";
    }).join("");
    footer.innerHTML =
      '<div class="container">' +
        '<div class="footer__grid">' +
          '<div class="footer__brand"><a class="brand" href="' + href("index.html") + '">' + MARK + "<span>" + CONFIG.brand + "</span></a>" +
          '<p class="footer__blurb">The production platform for consistent AI talent.</p></div>' + cols +
        "</div>" +
        '<div class="footer__legal"><span>&copy; <span data-year>2026</span> ' + CONFIG.brand + ". All rights reserved.</span></div>" +
      "</div>";
  }

  // App shell (signed-in pages such as /support): sidebar + mobile bar, filled in here so every app page shares one copy.
  var appSide = document.getElementById("app-side");
  if (appSide) {
    var ai = function (d, w) {
      w = w || 20;
      return '<svg viewBox="0 0 24 24" width="' + w + '" height="' + w + '" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>";
    };
    var chev = ai('<path d="m9 6 6 6-6 6"/>', 16);
    var APP_NAV = [
      ["Overview", '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>', "studio.html", "page"]
    ].map(function (n) {
      return '<a class="app__link is-active" href="' + href(n[2]) + '">' + ai(n[1]) + "<span>" + n[0] + "</span></a>";
    }).join("");
    var GROUPS = [
      { heading: "Studio", sections: [
        { label: "Create", icon: '<path d="M12 3.5l1.9 5 5 1.9-5 1.9-1.9 5-1.9-5-5-1.9 5-1.9z"/><path d="M19 3v4M17 5h4"/>', items: [
          ["Apex Image", '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M16.9 16.9l2.1 2.1M2 12h3M19 12h3M4.9 19.1l2.1-2.1M16.9 7.1l2.1-2.1"/>', "apex-image.html"],
          ["Apex Video", '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/>', "apex-video.html"],
          ["Apex img2img", '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m3 16 5-5 4 4 3-3 5 5"/>', "apex-img2img.html"],
          ["Apex Edit", '<path d="M12 3.5l1.9 5 5 1.9-5 1.9-1.9 5-1.9-5-5-1.9 5-1.9z"/><path d="M19 3v4M17 5h4"/>', "apex-edit.html"],
          ["Apex Transfer", '<path d="M4 12h16M16 8l4 4-4 4M20 12H4M8 16l-4-4 4-4"/>', "apex-transfer.html"],
          ["Apex Upscale", '<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M5 5h4v4H5z"/><path d="M12 9v6M9 12h6"/>', "apex-upscale.html"],
          ["Video Motion", '<circle cx="12" cy="12" r="9"/><path d="m10 9 5 3-5 3z"/>', "apex-video-motion.html"],
          ["Outfit Generator", '<path d="M12 3 8 7h3v6H9l3 4 3-4h-2V7h3z"/>', "outfit-generator.html"]
        ]},
        { label: "Tools", icon: '<path d="m4 20 10.5-10.5M13 4.5l1 2 2 1-2 1-1 2-1-2-2-1 2-1zM18 12l.7 1.3L20 14l-1.3.7L18 16l-.7-1.3L16 14l1.3-.7z"/>', items: [
          ["Apex Analyze", '<circle cx="11" cy="11" r="6"/><path d="m20 20-3.5-3.5"/><path d="M9 11h4M11 9v4"/>', "apex-analyze.html"],
          ["Magic Eraser", '<path d="m3 17 4.3-4.3M8 20l-5-5M13 4l7 7-8.7 8.7a2.5 2.5 0 0 1-3.5 0L4.3 16.2a2.5 2.5 0 0 1 0-3.5z"/>', "magic-eraser.html"],
          ["Frame Extractor", '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3"/>', "frame-extractor.html"],
          ["Clear Meta", '<path d="M12 3v3M3 12h3M18 12h3M12 18v3"/><circle cx="12" cy="12" r="4"/>', "clear-meta.html"],
          ["Downloader", '<path d="M12 5v10M8 11l4 4 4-4"/><path d="M4 17v2h16v-2"/>', "downloader.html"],
          ["GIF Maker", '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/>', "gif-maker.html"]
        ]},
        { label: "Partner Models", icon: '<circle cx="12" cy="7.5" r="3"/><circle cx="7" cy="16" r="3"/><circle cx="17" cy="16" r="3"/>', items: [
          ["Nano Banana", '<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>', "nano-banana.html"],
          ["MiniMax", '<path d="M4 15V9l4 3-4 3zM20 15V9l-4 3 4 3zM9 4h6M9 20h6M12 4v16"/>', "minimax.html"],
          ["Seedance", '<rect x="5" y="3" width="4" height="18" rx="1"/><rect x="11" y="7" width="4" height="14" rx="1"/><rect x="17" y="5" width="2" height="16" rx="1"/>', "seedance.html"],
          ["Wan", '<polygon points="12,3 20,9 20,15 12,21 4,15 4,9"/>', "wan.html"]
        ]}
      ]},
      { heading: "Resources", sections: [
        { label: "Discover Virals", icon: '<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zM8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/>', link: "https://discovervirals.com/", ext: true },
        { label: "Feature Requests", icon: '<circle cx="12" cy="12" r="9"/><path d="M9 12h6M12 9v6"/>', link: "feature-requests.html" },
        { label: "Affiliate Program", icon: '<circle cx="12" cy="8" r="5"/><path d="M8.2 13 5 21l7-3 7 3-3.2-8"/>', link: "affiliate-program.html" },
        { label: "Fanplace Profile Likes", icon: '<path d="M12 20s-7-4.4-7-9.5A4 4 0 0 1 12 8a4 4 0 0 1 7 2.5C19 15.6 12 20 12 20z"/>', link: "fanplace-likes.html" },
        { label: "Support", icon: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5M12 16.6v.1"/>', link: "support.html" },
        { label: "FAQ", icon: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>', link: "faq.html" }
      ]}
    ];
    var sectionHtml = GROUPS.map(function (grp) {
      var out = '<div class="app__group"><span class="app__heading">' + grp.heading + '</span>';
      out += grp.sections.map(function (sec) {
        if (sec.link || !sec.items) {
          var extIc = sec.ext ? '<svg class="app__ext" viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 3.5H3.5v9h9v-3"/><path d="M8 8 13.5 2.5M10 2.5h3.5V6"/></svg>' : '';
          var extAttr = sec.ext ? ' target="_blank" rel="noopener"' : '';
          var lnk = sec.ext ? sec.link : href(sec.link || "#");
          return '<a class="app__sub app__sub--top" href="' + lnk + '"' + extAttr + '>' + ai(sec.icon, 16) + "<span>" + sec.label + "</span>" + extIc + "</a>";
        }
        var hd = '<button class="app__sec" type="button" aria-expanded="false">' + ai(sec.icon) + "<span>" + sec.label + "</span>" +
          '<svg class="app__chev" viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 6 4 4 4-4"/></svg></button>';
        var kids = sec.items.map(function (it) {
          var h = it[2] ? href(it[2]) : "#";
          var pinIc = '<svg class="app__pin" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>';
          return '<a class="app__sub" href="' + h + '" data-pin-id="' + it[0].toLowerCase().replace(/\s+/g, "-") + '">' + ai(it[1], 14) + "<span>" + it[0] + "</span>" + pinIc + "</a>";
        }).join("");
        return hd + '<div class="app__subs" hidden>' + kids + "</div>";
      }).join("");
      return out + "</div>";
    }).join("");
    APP_NAV += '<div class="app__group app__pinned" data-pinned hidden><span class="app__heading">Pinned</span><div data-pinned-list></div></div>';
    APP_NAV += sectionHtml;
    var mark = function (s) { return '<img src="' + root + 'assets/img/logo-mark.png" alt="" width="' + s + '" height="' + s + '">'; };
    appSide.innerHTML =
      '<div class="app__top"><a class="app__brand" href="' + href(CONFIG.appUrl) + '" aria-label="' + CONFIG.brand + ' Studio">' + mark(28) + "<span>" + CONFIG.brand + "</span></a>" +
        '<button class="app__fold" type="button" data-side-fold aria-expanded="true" aria-label="Collapse sidebar" title="Collapse sidebar">' + ai('<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M9.5 4.5v15"/>', 18) + "</button></div>" +
      '<button class="app__search" type="button" data-cmdk-open aria-label="Search pages and actions" title="Search">' + ai('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>', 18) + "<span>Search</span><kbd data-cmdk-key>Ctrl K</kbd></button>" +
      '<div class="app__promo"><div class="app__promo-row"><span class="app__promo-ic">' + ai('<circle cx="12" cy="8.5" r="3.6"/><path d="M4.8 20c.9-3.6 3.6-5.4 7.2-5.4s6.3 1.8 7.2 5.4"/>', 18) + '</span><div><strong>Set Up Avatar</strong><small>Unlock personalized AI content</small></div></div><a class="gk-btn gk-btn--solid app__promo-cta" data-avatar-open href="#">Get Started</a></div>' +
      '<nav class="app__nav" aria-label="Studio navigation">' + APP_NAV + "</nav>" +
      '<div class="app__bottom">' +
        '<a class="app__credits" data-credits-open href="' + href("pricing.html") + '"><span class="app__coin" aria-hidden="true">C</span><span>Add Credits</span><em data-user-credits>0</em></a>' +
        '<a class="app__promo app__promo--plan" data-plan-card href="' + href("settings-pricing.html") + '">' +
          '<strong data-plan-title>Get a plan</strong>' +
          '<small data-plan-sub>Unlimited Apex images + Video Motion &amp; more</small>' +
          '<span class="app__promo-btn" data-plan-cta>Upgrade Now</span></a>' +
        '<div class="app__acct">' +
          '<div class="app__menu" id="app-menu" role="menu" aria-label="Account" hidden>' +
            '<div class="app__menu-head"><span class="app__avatar" data-user-initial aria-hidden="true">S</span><div><strong data-user-name>Stephen</strong><small data-user-email>demo@megaberry.com</small></div></div>' +
            '<div class="app__mode"><span>Appearance</span><div class="app__theme" role="group" aria-label="Colour mode"><button type="button" data-mode-set="light" aria-label="Light mode" aria-pressed="false">' + ai('<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/>', 17) + '</button><button type="button" data-mode-set="dark" aria-label="Dark mode" aria-pressed="true">' + ai('<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>', 17) + '</button></div></div>' +
            '<div class="app__menu-list"><a role="menuitem" href="' + href(CONFIG.accountUrl) + '">' + ai('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>', 18) + "<span>Settings</span></a>" +
            
            '<a role="menuitem" href="' + href("affiliate-program.html") + '">' + ai('<circle cx="12" cy="8" r="5"/><path d="M8.2 13 5 21l7-3 7 3-3.2-8"/>', 18) + "<span>Affiliate Program</span></a>" +
            '<a role="menuitem" href="' + href("faq.html") + '">' + ai('<circle cx="12" cy="12" r="9"/><path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5M12 16.6v.1"/>', 18) + "<span>Help</span></a>" +
            '</div>' +
            '<button role="menuitem" type="button" class="app__logout" data-logout>' + ai('<path d="M10 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20H10M15 8l4 4-4 4M19 12H9"/>', 18) + "<span>Log out</span></button>" +
          "</div>" +
          '<button class="app__user" type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="app-menu"><span class="app__avatar" data-user-initial aria-hidden="true">S</span><span class="app__name" data-user-name>Stephen</span><span class="app__plan" data-user-plan>Free</span>' + ai('<path d="m8 9.5 4-4 4 4M8 14.5l4 4 4-4"/>', 16) + "</button>" +
        "</div>" +
      "</div>";
    var acct = appSide.querySelector(".app__acct"), menu = acct.querySelector(".app__menu"), trig = acct.querySelector(".app__user");
    var setMenu = function (open) {
      clearTimeout(menu._t); menu.classList.remove("is-closing");
      trig.setAttribute("aria-expanded", String(open));
      if (open) { menu.hidden = false; return; }
      if (menu.hidden) return;
      /* play the close animation, then hide */
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { menu.hidden = true; return; }
      menu.classList.add("is-closing");
      menu._t = setTimeout(function () { menu.hidden = true; menu.classList.remove("is-closing"); }, 150);
    };
    trig.addEventListener("click", function () {
      /* On the slim rail, the account button opens the sidebar first, then the menu. */
      if (menu.hidden && document.body.getAttribute("data-side") === "collapsed" && window.matchMedia("(min-width: 901px)").matches) {
        setSide(false, true);
        /* let the sidebar finish opening, then bring the menu up out of the account button */
        var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        clearTimeout(trig._t);
        trig._t = setTimeout(function () { setMenu(true); }, calm ? 0 : 230);
        return;
      }
      setMenu(menu.hidden || menu.classList.contains("is-closing"));
    });
    document.addEventListener("click", function (e) { if (!menu.hidden && !acct.contains(e.target)) setMenu(false); });
    document.addEventListener("keydown", function (e) {
      if (menu.hidden) return;
      if (e.key === "Escape") { setMenu(false); trig.focus(); }
      else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        var items = [].slice.call(menu.querySelectorAll("[role=menuitem]")), i = items.indexOf(document.activeElement);
        e.preventDefault(); items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length].focus();
      }
    });
    appSide.querySelector("[data-logout]").addEventListener("click", function () {
      var go = function () { location.href = href("login.html"); };
      if (!CONFIG.logoutEndpoint) return go();
      fetch(CONFIG.logoutEndpoint, { method: "POST", credentials: "include" }).then(go, go);
    });
    /* Light mode is for signed-in app pages only; the choice is remembered in this browser. */
    var modeBtns = [].slice.call(appSide.querySelectorAll("[data-mode-set]"));
    var syncMode = function () {
      var m = document.body.getAttribute("data-mode") === "light" ? "light" : "dark";
      modeBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-mode-set") === m)); });
    };
    modeBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var m = b.getAttribute("data-mode-set");
        document.body.setAttribute("data-mode", m);
        try { localStorage.setItem("mb.theme", m); } catch (_) {}
        syncMode();
      });
    });
    try { if (localStorage.getItem("mb.theme") === "light") document.body.setAttribute("data-mode", "light"); } catch (_) {}
    syncMode();
    var appBar = document.getElementById("app-bar");
    if (appBar) {
      appBar.innerHTML =
        '<button class="icon-btn" type="button" aria-label="Open menu" aria-controls="app-side" aria-expanded="false" data-app-menu>' + MENU + "</button>" +
        '<a class="app__brand" href="' + href(CONFIG.appUrl) + '">' + mark(26) + "<span>" + CONFIG.brand + "</span></a>" +
        '<button class="icon-btn app__barsearch" type="button" data-cmdk-open aria-label="Search pages and actions">' + ai('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>', 20) + "</button>";
    }

    /* Section toggles in the sidebar nav */
    [].forEach.call(appSide.querySelectorAll(".app__sec"), function (btn) {
      btn.addEventListener("click", function () {
        var subs = btn.nextElementSibling;
        if (!subs || btn.querySelector(".app__soon")) return;
        var open = subs.hidden;
        subs.hidden = !open;
        btn.setAttribute("aria-expanded", String(open));
        saveSecs();
      });
    });

    /* Keep sections open between pages, and highlight the page you're on. */
    var NAV_KEY = "mb.nav.open";
    var secLabel = function (btn) { var sp = btn.querySelector("span"); return sp ? sp.textContent : ""; };
    var saveSecs = function () {
      var open = [].filter.call(appSide.querySelectorAll(".app__sec"), function (b) { return b.getAttribute("aria-expanded") === "true"; }).map(secLabel);
      try { localStorage.setItem(NAV_KEY, JSON.stringify(open)); } catch (_) {}
    };
    var fileOf = function (u) { return (String(u || "").split("#")[0].split("?")[0].split("/").pop() || "index.html").toLowerCase(); };
    var hereFile = fileOf(location.pathname);
    var markCurrent = function () {
      [].forEach.call(appSide.querySelectorAll("a.app__sub, [data-pinned-list] a"), function (a) {
        var h = a.getAttribute("href") || "";
        var on = h && h.charAt(0) !== "#" && !/^https?:/i.test(h) && fileOf(h) === hereFile;
        a.classList.toggle("is-current", !!on);
        if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
      });
    };
    (function () {
      var saved = []; try { saved = JSON.parse(localStorage.getItem(NAV_KEY)) || []; } catch (_) {}
      markCurrent();
      [].forEach.call(appSide.querySelectorAll(".app__sec"), function (btn) {
        var subs = btn.nextElementSibling; if (!subs) return;
        var open = saved.indexOf(secLabel(btn)) > -1 || !!subs.querySelector(".is-current");
        subs.hidden = !open; btn.setAttribute("aria-expanded", String(open));
        btn.classList.toggle("has-current", !!subs.querySelector(".is-current"));
      });
      var ov = appSide.querySelector("a.app__link"); if (ov && hereFile !== "studio.html") ov.classList.remove("is-active");
      setTimeout(markCurrent, 400);
    })();

    /* Collapse the sidebar to a slim rail (desktop). The choice is remembered in this browser. */
    var fold = appSide.querySelector("[data-side-fold]");
    var setSide = function (collapsed, save) {
      if (save && !collapsed && document.body.getAttribute("data-side") === "collapsed") {
        /* opening from the rail: fade the labels in as the sidebar widens */
        document.body.classList.add("is-opening");
        clearTimeout(setSide._t);
        setSide._t = setTimeout(function () { document.body.classList.remove("is-opening"); }, 600);
      }
      document.body.setAttribute("data-side", collapsed ? "collapsed" : "expanded");
      var label = collapsed ? "Expand sidebar" : "Collapse sidebar";
      fold.setAttribute("aria-expanded", String(!collapsed)); fold.setAttribute("aria-label", label); fold.title = label;
      if (save) { try { localStorage.setItem("mb.side", collapsed ? "collapsed" : "expanded"); } catch (_) {} }
    };
    var wasCollapsed = false;
    try { wasCollapsed = localStorage.getItem("mb.side") === "collapsed"; } catch (_) {}
    setSide(wasCollapsed, false);
    fold.addEventListener("click", function () { setSide(document.body.getAttribute("data-side") !== "collapsed", true); });

    /* Search: a command palette for pages and actions, opened with the Search button or Ctrl/Cmd + K. */
    var isMac = /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent || "");
    [].forEach.call(document.querySelectorAll("[data-cmdk-key]"), function (k) { k.textContent = isMac ? "\u2318K" : "Ctrl K"; });
    var I = {
      ticket: '<path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 16.5H10l-4.5 3.5v-3.5H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5z"/><path d="M8 9.5h8M8 12.5h5"/>',
      card: '<rect x="3.5" y="6" width="17" height="12" rx="2.5"/><path d="M3.5 10.5h17"/>',
      lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="2.2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
      user: '<circle cx="12" cy="8.5" r="3.6"/><path d="M4.8 20c.9-3.6 3.6-5.4 7.2-5.4s6.3 1.8 7.2 5.4"/>',
      help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5M12 16.6v.1"/>',
      gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18"/>',
      link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1"/>',
      bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15zM10 20.5h4"/>',
      shield: '<path d="M12 3.5 19 6v5.5c0 4.2-2.8 7.4-7 9-4.2-1.6-7-4.8-7-9V6z"/>',
      code: '<path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M13.5 6l-3 12"/>',
      block: '<circle cx="12" cy="12" r="8.5"/><path d="m6 6 12 12"/>',
      seat: '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c.7-3 2.7-4.5 5.5-4.5s4.8 1.5 5.5 4.5M16 6a3 3 0 0 1 0 5.6M17.5 14.8c1.8.5 2.8 2 3.2 4.2"/>',
      spark: '<path d="M12 3.5l1.9 5 5 1.9-5 1.9-1.9 5-1.9-5-5-1.9 5-1.9z"/>',
      wand: '<path d="m4 20 10.5-10.5M13 4.5l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/>',
      nodes: '<circle cx="12" cy="7.5" r="3"/><circle cx="7" cy="16" r="3"/><circle cx="17" cy="16" r="3"/>',
      book: '<path d="m12 3 9 4.5-9 4.5-9-4.5z"/><path d="m3 12 9 4.5 9-4.5M3 16.5l9 4.5 9-4.5"/>',
      sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/>',
      out: '<path d="M10 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20H10M15 8l4 4-4 4M19 12H9"/>',
      mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4 7.5 8 6 8-6"/>'
    };
    var cmdItems = function () {
      var light = document.body.getAttribute("data-mode") === "light";
      var S = function (t, tab, ic, kw) { return [t, "Settings", href("settings.html#" + tab), ic, kw || ""]; };
      return [
        ["Open a support ticket", "Action", href("support.html?new=1"), I.ticket, "new help contact problem"],
        ["Manage your plan", "Action", href(CONFIG.billingUrl), I.card, "billing subscription upgrade"],
        ["Change your password", "Action", href("settings.html#security"), I.lock, "security reset"],
        ["Add credits", "Action", function () { if (window.MB && window.MB.openCredits) window.MB.openCredits(); else window.location.href = href("pricing.html"); }, I.card, "buy top up"],
        [light ? "Switch to dark mode" : "Switch to light mode", "Action", function () { var b = appSide.querySelector('[data-mode-set="' + (light ? "dark" : "light") + '"]'); if (b) b.click(); }, I.sun, "theme appearance colour"],
        ["Log out", "Action", function () { appSide.querySelector("[data-logout]").click(); }, I.out, "sign out"],
        ["Create", "Studio", href("studio.html"), I.spark, "studio generate"],
        ["Tools", "Studio", href("studio.html"), I.wand, "studio"],
        ["Partner Models", "Studio", href("studio.html"), I.nodes, "studio models"],
        ["Set up your avatar", "Studio", function () { if (window.MB && window.MB.openAvatar) window.MB.openAvatar(); else window.location.href = href("studio.html"); }, I.user, "avatars talent claim connect"],
        ["Support tickets", "Help", href("support.html"), I.ticket, "help"],
        ["Help centre", "Help", href("faq.html"), I.help, "faq questions"],
        ["Contact us", "Help", href("contact.html"), I.mail, "enquiry sales"],
        ["Pricing", "Link", href("pricing.html"), I.card, "plans"],
        S("Profile", "profile", I.user, "account name email avatar photo"),
        S("Connections", "connections", I.link, "discord google linked accounts"),
        S("Seats", "seats", I.seat, "team invite members"),
        S("Notifications", "notifications", I.bell, "email push alerts quiet hours"),
        S("Billing", "billing", I.card, "invoices payment plan"),
        S("Security", "security", I.lock, "password two-factor sessions activity"),
        S("Blocked users", "blocked", I.block, "block"),
        S("Developer API", "developer", I.code, "api keys access"),
        S("Danger zone", "danger", I.shield, "delete account")
      ];
    };
    var dlg = document.createElement("dialog");
    dlg.className = "cmdk";
    dlg.setAttribute("aria-label", "Search pages and actions");
    dlg.innerHTML =
      '<div class="cmdk__bar">' + ai('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>', 20) +
        '<input type="text" class="cmdk__input" role="combobox" aria-expanded="true" aria-controls="cmdk-list" aria-autocomplete="list" autocomplete="off" spellcheck="false" placeholder="Search pages and actions" aria-label="Search pages and actions">' +
        '<kbd>Esc</kbd></div>' +
      '<div class="cmdk__list" id="cmdk-list" role="listbox"></div>' +
      '<div class="cmdk__foot"><span><kbd>\u2191</kbd><kbd>\u2193</kbd> to move</span><span><kbd>Enter</kbd> to open</span></div>';
    document.body.appendChild(dlg);
    var input = dlg.querySelector("input"), list = dlg.querySelector(".cmdk__list"), shown = [], cur = 0;
    var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    var paint = function () {
      var q = input.value.trim().toLowerCase(), terms = q ? q.split(/\s+/) : [];
      shown = cmdItems().filter(function (it) {
        var hay = (it[0] + " " + it[1] + " " + it[4]).toLowerCase();
        return terms.every(function (t) { return hay.indexOf(t) > -1; });
      });
      if (q) shown.sort(function (a, b) { return (b[0].toLowerCase().indexOf(q) === 0) - (a[0].toLowerCase().indexOf(q) === 0); });
      cur = 0;
      list.innerHTML = shown.length ? shown.map(function (it, i) {
        return '<a class="cmdk__item" id="cmdk-' + i + '" role="option" href="' + (typeof it[2] === "string" ? esc(it[2]) : "#") + '" aria-selected="' + (i === 0) + '" data-i="' + i + '">' +
          '<span class="cmdk__ic">' + ai(it[3], 18) + '</span><span class="cmdk__t">' + esc(it[0]) + '</span><span class="cmdk__k">' + it[1] + "</span></a>";
      }).join("") : '<p class="cmdk__none">Nothing found for \u201c' + esc(input.value.trim()) + "\u201d</p>";
      input.setAttribute("aria-activedescendant", shown.length ? "cmdk-0" : "");
      list.scrollTop = 0;
    };
    var pick = function (i) {
      cur = Math.max(0, Math.min(shown.length - 1, i));
      [].forEach.call(list.children, function (n, j) { n.setAttribute("aria-selected", String(j === cur)); });
      var n = list.children[cur];
      if (n && n.id) { input.setAttribute("aria-activedescendant", n.id); n.scrollIntoView({ block: "nearest" }); }
    };
    var go = function (it) {
      if (!it) return;
      dlg.close();
      if (typeof it[2] === "function") it[2]();
      else location.href = it[2];
    };
    var openPalette = function () {
      var sc = document.querySelector("[data-app-scrim]");
      if (appSide.classList.contains("is-open") && sc) sc.click();
      if (dlg.open) return;
      input.value = ""; paint();
      dlg.showModal(); input.focus();
    };
    [].forEach.call(document.querySelectorAll("[data-cmdk-open]"), function (b) { b.addEventListener("click", openPalette); });
    document.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        if (dlg.open) dlg.close(); else openPalette();
      }
    });
    input.addEventListener("input", paint);
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); pick(cur + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); pick(cur - 1); }
      else if (e.key === "Home") { e.preventDefault(); pick(0); }
      else if (e.key === "End") { e.preventDefault(); pick(shown.length - 1); }
      else if (e.key === "Enter") { e.preventDefault(); go(shown[cur]); }
    });
    list.addEventListener("pointermove", function (e) { var a = e.target.closest(".cmdk__item"); if (a && +a.getAttribute("data-i") !== cur) pick(+a.getAttribute("data-i")); });
    list.addEventListener("click", function (e) {
      var a = e.target.closest(".cmdk__item");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault(); go(shown[+a.getAttribute("data-i")]);
    });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  }

  /* Dev view toggle — appears on every app-shell page */
  if (document.body.getAttribute("data-shell") === "app" && document.documentElement.hasAttribute("data-review")) {
    var dv = document.createElement("div");
    dv.className = "dev-view";
    var savedDev = "linked"; try { savedDev = localStorage.getItem("mb.devmode") || "linked"; } catch(e) {}
    dv.innerHTML = '<span>DEV</span><button type="button" data-dv="linked">Linked</button><button type="button" data-dv="none">No model</button>';
    document.body.appendChild(dv);
    // Restore saved state
    var savedBtn = dv.querySelector('[data-dv="' + savedDev + '"]');
    if (savedBtn) { savedBtn.classList.add("is-active"); document.body.setAttribute("data-dev-mode", savedDev); }
    else { dv.querySelector('[data-dv="linked"]').classList.add("is-active"); document.body.setAttribute("data-dev-mode", "linked"); savedDev = "linked"; }
    // Set initial plan
    setTimeout(function () {
      var planEls = document.querySelectorAll("[data-user-plan]");
      planEls.forEach(function (el) { el.textContent = savedDev === "linked" ? "Pro" : "Free"; el.className = "app__plan" + (savedDev === "linked" ? " app__plan--pro" : ""); });
      document.querySelectorAll("[data-user-credits]").forEach(function (el) { el.textContent = savedDev === "linked" ? "2,450" : "0"; });
    }, 0);
    dv.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-dv]"); if (!btn) return;
      dv.querySelectorAll("button").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      var mode = btn.getAttribute("data-dv");
      document.body.setAttribute("data-dev-mode", mode);
      try { localStorage.setItem("mb.devmode", mode); } catch(e) {}
      // Update plan badge
      var planEls = document.querySelectorAll("[data-user-plan]");
      planEls.forEach(function (el) { el.textContent = mode === "linked" ? "Pro" : "Free"; el.className = "app__plan" + (mode === "linked" ? " app__plan--pro" : ""); });
      document.querySelectorAll("[data-user-credits]").forEach(function (el) { el.textContent = mode === "linked" ? "2,450" : "0"; });
    });
  }
})();
