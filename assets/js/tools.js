/* Shared behaviour for the Create tool pages (img2img, Edit, Transfer, Upscale,
   Video Motion, plus Adv. Settings on Apex Video). Demo only: files are counted,
   never uploaded, and Generate adds placeholder tiles. */
(function () {
  var root = document.querySelector("[data-tool]"); if (!root) return;
  var $ = function (s) { return root.querySelector(s); }, $$ = function (s) { return [].slice.call(root.querySelectorAll(s)); };
  var unit = +root.getAttribute("data-unit") || 10, maxN = +root.getAttribute("data-max-n") || 8;
  var st = { n: +root.getAttribute("data-n") || 1, mode: root.getAttribute("data-mode") || "", pair: "1-1", made: 0, counts: {} };
  var toastEl = document.querySelector("[data-toast]"), toastT;
  var toast = function (m) { if (!toastEl) return; toastEl.textContent = m; toastEl.hidden = false; requestAnimationFrame(function () { toastEl.classList.add("is-on"); }); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove("is-on"); }, 2600); };
  var out = $("[data-t-output]");
  var maxOf = function (d) {
    var m = +d.getAttribute("data-max");
    if (st.mode && d.hasAttribute("data-max-" + st.mode)) m = +d.getAttribute("data-max-" + st.mode);
    if (out && out.value === "Unrestricted" && st.mode === "auto" && d.hasAttribute("data-max-unrestricted")) m = +d.getAttribute("data-max-unrestricted");
    return m;
  };
  var pairs = function () {
    var ids = (root.getAttribute("data-pair") || "").split(",").filter(Boolean); if (!ids.length) return 1;
    var a = st.counts[ids[0]] || 0, b = st.counts[ids[1]] || 0;
    return Math.max(1, st.pair === "all" ? a * b : Math.min(a, b));
  };
  var render = function () {
    $$("[data-t-mode]").forEach(function (b) { b.setAttribute("aria-checked", String(b.getAttribute("data-t-mode") === st.mode)); });
    $$("[data-t-panel]").forEach(function (p) { p.hidden = p.getAttribute("data-t-panel") !== st.mode; });
    $$("[data-t-drop]").forEach(function (d) {
      var id = d.getAttribute("data-t-drop"), max = maxOf(d); st.counts[id] = Math.min(st.counts[id] || 0, max);
      d.classList.toggle("is-filled", st.counts[id] > 0);
      $$('[data-t-count="' + id + '"]').forEach(function (c) { c.textContent = st.counts[id] + "/" + max + (c.getAttribute("data-suffix") || ""); });
    });
    var p = pairs(), total = p * st.n;
    $$("[data-t-n]").forEach(function (e) { e.textContent = st.n; });
    $$("[data-t-cost]").forEach(function (e) { e.textContent = (total * unit).toLocaleString("en-US"); });
    $$("[data-t-pairs]").forEach(function (e) { e.textContent = p + (p === 1 ? " pair" : " pairs"); });
    $$("[data-t-total]").forEach(function (e) { e.textContent = total + " total gens"; });
    $$("[data-t-pair]").forEach(function (b) { b.setAttribute("aria-checked", String(b.getAttribute("data-t-pair") === st.pair)); });
    var go = $("[data-t-go]");
    if (go) go.disabled = ((st.mode && go.getAttribute("data-t-need-" + st.mode)) || go.getAttribute("data-t-need") || "").split(",").filter(Boolean).some(function (id) { return !st.counts[id]; });
    if (out) {
      var un = out.value === "Unrestricted"; out.classList.toggle("is-accent", un);
      var lab = $("[data-t-power-label]"); if (lab) lab.textContent = un ? "Pose Fidelity" : "Power";
    }
  };
  $$("[data-t-drop]").forEach(function (d) {
    var id = d.getAttribute("data-t-drop"), inp = d.querySelector("input[type=file]");
    var add = function (n) { st.counts[id] = Math.min(maxOf(d), (st.counts[id] || 0) + n); render(); };
    if (inp) inp.addEventListener("change", function () { add(inp.files.length); inp.value = ""; });
    ["dragenter", "dragover"].forEach(function (ev) { d.addEventListener(ev, function (e) { e.preventDefault(); d.classList.add("is-over"); }); });
    ["dragleave", "drop"].forEach(function (ev) { d.addEventListener(ev, function (e) { e.preventDefault(); d.classList.remove("is-over"); }); });
    d.addEventListener("drop", function (e) { add(((e.dataTransfer && e.dataTransfer.files) || []).length); });
  });
  root.addEventListener("click", function (e) {
    var t = e.target, b;
    if ((b = t.closest("[data-t-mode]"))) { st.mode = b.getAttribute("data-t-mode"); render(); return; }
    if ((b = t.closest("[data-t-pair]"))) { st.pair = b.getAttribute("data-t-pair"); render(); return; }
    if (t.closest("[data-t-inc]")) { st.n = Math.min(maxN, st.n + 1); render(); return; }
    if (t.closest("[data-t-dec]")) { st.n = Math.max(1, st.n - 1); render(); return; }
    if ((b = t.closest("[data-t-clear]"))) { st.counts[b.getAttribute("data-t-clear")] = 0; render(); return; }
    if ((b = t.closest("[data-t-seed]"))) {
      var on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", String(on));
      $("[data-t-seed-state]").textContent = on ? "Seed locked" : "New seed each render";
      $("[data-t-seed-note]").textContent = on ? "The same seed is reused for every render. Unlock it to vary results." : "A fresh seed is used for every render. Lock it to keep it fixed.";
      return;
    }
    if ((b = t.closest("[data-t-copy]"))) { var txt = $("[data-t-result-text]").textContent; if (navigator.clipboard) navigator.clipboard.writeText(txt).catch(function () {}); toast("Analysis copied."); return; }
    if (t.closest("[data-t-undo]")) { toast("Nothing to undo yet."); return; }
    if ((b = t.closest("[data-t-go]")) && !b.disabled && $("[data-t-result]")) { $("[data-t-result]").hidden = false; toast("Analysis ready (demo)."); return; }
    if ((b = t.closest("[data-t-go]")) && !b.disabled) {
      var total = pairs() * st.n, grid = $("[data-t-grid]"), h = "";
      for (var i = 0; i < total; i++) { st.made++; h += '<div class="frame ai__tile"><span class="frame__tag">#' + st.made + "</span></div>"; }
      grid.insertAdjacentHTML("afterbegin", h); grid.hidden = false; $("[data-t-empty]").hidden = true; $("[data-t-gallery]").classList.add("has-items");
      toast(total + " item" + (total > 1 ? "s" : "") + " added (demo placeholders).");
      return;
    }
    // Avatar picker (Apex Image has its own handler)
    if (document.querySelector("[data-ai-cp]")) return;
    var list = $("[data-ai-avatar-list]"), btn = $("[data-ai-avatar-btn]"); if (!list) return;
    if (t.closest("[data-ai-avatar-btn]")) { list.hidden = !list.hidden; btn.setAttribute("aria-expanded", String(!list.hidden)); return; }
    if ((b = t.closest("[data-ai-pick]"))) { var nm = b.getAttribute("data-ai-pick"); $("[data-ai-av-name]").textContent = nm; $("[data-ai-av-initial]").textContent = nm.charAt(0); $$("[data-ai-pick]").forEach(function (o) { o.classList.toggle("is-on", o === b); }); }
    if (!list.hidden) { list.hidden = true; btn.setAttribute("aria-expanded", "false"); }
  });
  document.addEventListener("click", function (e) { var list = $("[data-ai-avatar-list]"); if (list && !list.hidden && !document.querySelector("[data-ai-cp]") && !e.target.closest("[data-ai-avatar]")) { list.hidden = true; } });
  var adv = $("[data-t-adv]"); if (adv) adv.addEventListener("change", function () { $("[data-t-adv-body]").hidden = !adv.checked; });
  $$("input[data-t-sync]").forEach(function (i) { i.addEventListener("input", function () { $$('input[data-t-sync="' + i.getAttribute("data-t-sync") + '"]').forEach(function (o) { if (o !== i) o.value = i.value; }); }); });
  if (out) out.addEventListener("change", function () { var v = out.value === "Unrestricted" ? 13 : 52; $$('input[data-t-sync="power"]').forEach(function (i) { i.value = v; }); render(); });
  $$("input[data-t-flat-cost]").forEach(function (r) { r.addEventListener("change", function () { $("[data-t-flat]").textContent = r.getAttribute("data-t-flat-cost"); }); });
  var px = $("[data-t-px]");
  if (px) { var pxr = function () { $("[data-t-px-out]").textContent = px.value + "px"; var d = $("[data-t-dot]"); d.style.width = d.style.height = px.value + "px"; }; px.addEventListener("input", pxr); pxr(); }
  var pp = $("[data-t-ppick]"), dlg = document.querySelector("[data-prompt-pick-dlg]");
  if (pp && dlg && pp !== document.querySelector(".gen__prompt-pick")) pp.addEventListener("click", function () { dlg.showModal(); });
  render();
})();
