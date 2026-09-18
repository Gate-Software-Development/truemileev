// TrueMile EV — the public page: theme, splash, and the 3D carousel of app screens.
// No dependency of any kind; every icon below is drawn inline for the same reason.

(function () {
  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── theme: the system's choice if it has one, the clock if it does not ─────────────────────
  // 06:00-18:00 light, 18:00-06:00 dark, exactly as asked. A manual pick wins over both and is
  // remembered on this device only.
  const THEME_KEY = "tm_theme";
  function clockTheme() {
    const h = new Date().getHours();
    return (h >= 6 && h < 18) ? "light" : "dark";
  }
  function systemTheme() {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    if (window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
    return null;
  }
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    const b = $("#themeBtn");
    if (b) {
      b.setAttribute("aria-label", t === "dark" ? "Switch to the light theme" : "Switch to the dark theme");
      b.innerHTML = t === "dark"
        ? '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="5"/><path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 13a9 9 0 1 1-10-10 7 7 0 0 0 10 10z"/></svg>';
    }
  }
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (_) {}
  let theme = saved || systemTheme() || clockTheme();
  applyTheme(theme);
  // Follow the system if it changes while the page is open and nothing was picked by hand.
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", e => {
    if (!saved) applyTheme(theme = e.matches ? "dark" : "light");
  });

  // ── the six (plus Auto), in the app's own bottom-bar order and its own colours ─────────────
  const SCREENS = [
    { key: "board", label: "Board", color: "var(--c-board)" },
    { key: "charge", label: "Charge", color: "var(--c-charge)" },
    { key: "live", label: "Live", color: "var(--c-live)" },
    { key: "map", label: "Map", color: "var(--c-map)" },
    { key: "report", label: "Report", color: "var(--c-report)" },
    { key: "wear", label: "Wear", color: "var(--c-wear)" },
    { key: "auto", label: "Auto", color: "var(--c-auto)", soon: true },
  ];

  // ── icons (inline; nothing loads from anywhere) ────────────────────────────────────────────
  const ICON = {
    board: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    charge: '<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/>',
    live: '<path d="M12 21a9 9 0 1 1 9-9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 12l5-3" fill="none" stroke="currentColor" stroke-width="2"/>',
    map: '<path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/>',
    report: '<rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/>',
    wear: '<rect x="7" y="6" width="10" height="12" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 6V3h6v3M9 18v3h6v-3" fill="none" stroke="currentColor" stroke-width="2"/>',
    auto: '<path d="M5 16V11l2-5h10l2 5v5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="8" cy="16" r="2"/><circle cx="16" cy="16" r="2"/><path d="M3 16h18" fill="none" stroke="currentColor" stroke-width="2"/>',
  };
  const svg = (k, cls) =>
    `<svg viewBox="0 0 24 24" fill="currentColor" class="${cls || ""}" aria-hidden="true">${ICON[k]}</svg>`;

  // ── real screenshots, when they are there ──────────────────────────────────────────────────
  // assets/shots/<key>-<theme>.png, e.g. board-dark.png. A missing file falls back to the drawn
  // screen below, so the page never shows a broken image and dropping a PNG in is the whole job.
  // Charge and Map take -1/-2/-3 suffixes for their several faces.
  const shot = (key, i) => {
    const n = (i === undefined || i === null) ? "" : "-" + (i + 1);
    return `assets/shots/${key}${n}-${theme}.png`;
  };
  // The drawn screen shows FIRST and the photo hides it once it has actually loaded - the other way
  // round leaves an empty frame for as long as the 404 takes.
  const framed = (key, i, drawn, cls) => `
    <img class="shot" src="${shot(key, i)}" alt="" loading="lazy"
         onload="this.parentNode.querySelector('.fallback').style.display='none'"
         onerror="this.remove()">
    <div class="fallback ${cls || "screen"}">${drawn}</div>`;

  // ── the drawn screens (the fallback, and what shows until screenshots land) ────────────────
  const navbar = (on) => `<div class="navbar">` +
    ["board", "charge", "live", "map", "report"]
      .map(k => `<span style="${k === on ? "color:var(--c-" + k + ")" : ""}">${svg(k)}</span>`).join("") + `</div>`;

  const inner = (on, body) => `
      <div class="status"><span>7:04</span><span>5G</span></div>
      <div class="body">${body}</div>
      ${navbar(on)}`;

  const phone = (key, sub, on, body) =>
    `<div class="phone">${framed(key, sub, inner(on, body))}</div>`;

  const tile = (k, v, cls) => `<div class="t"><div class="k">${k}</div><div class="v ${cls || ""}">${v}</div></div>`;
  const liveTile = (k, v, cls, id) => `<div class="t"><div class="k">${k}</div><div class="v ${cls || ""}" data-n="${id}">${v}</div></div>`;

  const BODY = {
    board: () => `
      <div class="g2">
        ${liveTile("cost / mile", "$0.141", "green", "cpm")}
        ${liveTile("mi / kWh", "2.46", "cyan", "eff")}
        ${liveTile("total spent", "$1,533", "", "spent")}
        ${liveTile("saved", "$981", "green", "saved")}
      </div>
      <div class="g3">
        ${liveTile("drives", "485", "", "trips")}
        ${liveTile("charged", "4,944", "cyan", "kwh")}
        ${liveTile("MPGe", "83", "", "mpge")}
      </div>
      <div class="t"><div class="k">last drive</div>
        <div class="listrow"><span>09/17 19:11</span><span class="cyan" data-n="last">177.1 mi</span></div>
        <div class="listrow"><span>09/17 12:19</span><span class="cyan">14.6 mi</span></div>
      </div>`,
    charge: [
      () => `<div class="t"><div class="k">charging now</div><div class="v cyan" data-n="kw">48.2 kW</div></div>
        <div class="bar-s"><i style="width:62%"></i></div>
        <div class="g2">${liveTile("charge", "62%", "cyan", "soc")}${liveTile("added", "31.4 kWh", "", "added")}</div>
        <div class="g2">${tile("rate", "$0.33/kWh")}${liveTile("cost", "$10.36", "", "cost")}</div>`,
      () => `<div class="t"><div class="k">plugged in</div><div class="v muted">idle</div></div>
        <div class="bar-s"><i style="width:80%"></i></div>
        <div class="g2">${tile("charge", "80%")}${tile("since", "12 min")}</div>
        <div class="t"><div class="k">waiting for power</div><div class="v muted" style="font-size:9px">the session resumes on its own</div></div>`,
      () => `<div class="t"><div class="k">session complete</div><div class="v green">54.8 kWh</div></div>
        <div class="g2">${tile("cost", "$18.11")}${tile("rate", "$0.331")}</div>
        <div class="g2">${tile("arrived", "18%")}${tile("left at", "82%")}</div>
        <div class="t"><div class="k">time</div><div class="v">41 min</div></div>`,
      () => `<div class="t"><div class="k">power curve</div>
          <svg viewBox="0 0 100 34" style="width:100%;height:34px">
            <polyline points="2,30 12,8 26,7 44,12 62,19 80,25 98,29" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--cyan)"/>
          </svg></div>
        <div class="g3">${tile("peak", "149 kW")}${tile("avg", "97 kW")}${tile("taper", "62%")}</div>
        <div class="listrow"><span>Electrify America</span><span>09/14</span></div>`,
    ],
    live: () => `
      <div style="display:flex;justify-content:center;padding:2px 0">
        <svg viewBox="0 0 100 100" style="width:98px;height:98px">
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--line)" stroke-width="9"
            stroke-dasharray="220 251" stroke-linecap="round" transform="rotate(112.5 50 50)"/>
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--blue)" stroke-width="9"
            stroke-dasharray="62 251" stroke-linecap="round" transform="rotate(-90 50 50)" data-n="accel"/>
          <text x="50" y="47" text-anchor="middle" fill="currentColor" font-size="20" font-weight="800" data-n="mph">62</text>
          <text x="50" y="61" text-anchor="middle" fill="var(--muted)" font-size="8">MPH</text>
        </svg>
      </div>
      <div class="g3">${liveTile("charge", "78%", "green", "lsoc")}${liveTile("range", "212 mi", "", "range")}${liveTile("power", "38 kW", "blue", "pw")}</div>
      <div class="g2">${tile("pack", "78 °F")}${tile("cabin", "70 °F")}</div>`,
    map: [
      () => `<div style="position:relative;flex:1;border-radius:9px;overflow:hidden">
        <div class="mapbg"></div>
        <span class="pin" style="background:var(--green);left:26%;top:30%"></span>
        <span class="pin" style="background:var(--green);left:62%;top:52%"></span>
        <span class="pin" style="background:var(--green);left:44%;top:71%"></span>
        <div style="position:absolute;left:6px;bottom:6px" class="t"><div class="k">charges here</div><div class="v green">86</div></div>
      </div>`,
      () => `<div style="position:relative;flex:1;border-radius:9px;overflow:hidden">
        <div class="mapbg"></div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%">
          <polyline points="12,86 28,66 40,60 56,38 72,28 88,14" fill="none" stroke="var(--cyan)" stroke-width="3"/>
        </svg>
        <div style="position:absolute;left:6px;bottom:6px" class="t"><div class="k">this drive</div><div class="v cyan">177.1 mi</div></div>
      </div>`,
      () => `<div style="position:relative;flex:1;border-radius:9px;overflow:hidden">
        <div class="mapbg"></div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%">
          <polyline points="50,92 50,58 62,40 62,8" fill="none" stroke="var(--green)" stroke-width="3"/>
        </svg>
        <div style="position:absolute;left:6px;right:6px;bottom:6px" class="t">
          <div class="k">work · arrival charge</div><div class="v green">68%</div></div>
      </div>`,
    ],
    report: () => `
      <div class="g3">
        <div class="t"><div class="k">vehicle</div><div class="v" style="font-size:8px">F-150</div></div>
        <div class="t"><div class="k">category</div><div class="v" style="font-size:8px">Business</div></div>
        <div class="t"><div class="k">range</div><div class="v" style="font-size:8px">Sep 10-17</div></div>
      </div>
      <div class="g3">${liveTile("drives", "28", "", "rtrips")}${liveTile("distance", "612 mi", "", "rmi")}${liveTile("cost", "$86.40", "green", "rcost")}</div>
      <div class="t"><div class="k">drives</div>
        <div class="listrow"><span>Sep 17 · 177.1 mi</span><span>$18.61</span></div>
        <div class="listrow"><span>Sep 16 · 23.5 mi</span><span>$3.17</span></div>
        <div class="listrow"><span>Sep 15 · 12.1 mi</span><span>$1.92</span></div>
      </div>
      <div class="row"><span class="t" style="flex:1;text-align:center"><span class="k cyan">CSV</span></span>
        <span class="t" style="flex:1;text-align:center"><span class="k cyan">PDF</span></span>
        <span class="t" style="flex:1;text-align:center"><span class="k cyan">MILEAGE</span></span></div>`,
  };

  const MOCK = {
    board:  () => phone("board", null, "board", BODY.board()),
    charge: BODY.charge.map((b, i) => () => phone("charge", i, "charge", b())),
    live:   () => phone("live", null, "live", BODY.live()),
    map:    BODY.map.map((b, i) => () => phone("map", i, "map", b())),
    report: () => phone("report", null, "report", BODY.report()),

    wear: () => `<div class="watch"><div class="face" style="position:relative;overflow:hidden">
        ${framed("wear", null, `
          <div style="font-size:27px;font-weight:800;color:var(--green)" data-n="wsoc">78%</div>
          <div style="font-size:9px;color:var(--muted)">212 mi range</div>
          <div style="height:1px;width:64px;background:var(--line);margin:5px 0"></div>
          <div style="font-size:11px;font-weight:700" data-n="wmi">14.6 mi</div>
          <div style="font-size:8px;color:var(--muted)">drive in progress</div>`,
          "screen")}
      </div></div>`,

    // The car's own screen, not a phone (owner 9/18).
    auto: () => `<div class="head"><div class="unit">
        <div class="vents"><i></i><i></i></div>
        <div class="display" style="margin-top:6px;position:relative">
          ${framed("auto", null, `
            <div class="hbar">${svg("board")}${svg("charge")}${svg("map")}
              <span style="margin-left:auto;font-size:7px;color:var(--dim)">ANDROID AUTO</span></div>
            <div style="flex:1;position:relative">
              <div class="mapbg"></div>
              <span class="pin" style="background:var(--green);left:44%;top:46%"></span>
              <div style="position:absolute;left:5px;top:5px;display:flex;gap:4px">
                <span class="t"><span class="k">charge</span><span class="v green" style="font-size:10px">78%</span></span>
                <span class="t"><span class="k">range</span><span class="v" style="font-size:10px">212 mi</span></span>
              </div>
              <div style="position:absolute;right:5px;bottom:5px" class="t">
                <span class="k" style="color:var(--c-auto)">coming soon</span></div>
            </div>`, "screen")}
        </div>
      </div></div>`,
  };

  // ── build ──────────────────────────────────────────────────────────────────────────────────
  const ring = $("#ring"), nav = $("#appnav");
  const N = SCREENS.length;
  const step = 360 / N;
  let active = 0, radius = 240;
  const subIndex = {};

  function slideInner(s) {
    const m = MOCK[s.key];
    if (Array.isArray(m)) {
      const i = subIndex[s.key] || 0;
      return m[i]() + `<div class="dots">${m.map((_, j) =>
        `<i class="${j === i ? "on" : ""}"></i>`).join("")}</div>`;
    }
    return m();
  }

  function build() {
    const w = window.innerWidth < 640 ? 186 : 214;
    radius = Math.round(w / 2 / Math.tan(Math.PI / N)) + 34;
    ring.innerHTML = SCREENS.map((s, i) => `
      <div class="slide" data-key="${s.key}" style="transform:rotateY(${i * step}deg) translateZ(${radius}px)">
        ${slideInner(s)}
      </div>`).join("");
    nav.innerHTML = SCREENS.map((s, i) => `
      <button role="tab" aria-selected="${i === active}" data-i="${i}" style="--c:${s.color}"
              class="${s.soon ? "soon" : ""}" aria-label="${s.label}${s.soon ? ", coming soon" : ""}">
        ${svg(s.key)}<span>${s.label}</span>
      </button>`).join("");
    $$("#appnav button").forEach(b => b.onclick = () => select(Number(b.dataset.i)));
    turn();
  }

  function turn() {
    ring.style.transform = `translateZ(-${radius}px) rotateY(${-active * step}deg)`;
    $$(".slide", ring).forEach((el, i) => {
      const d = Math.min(Math.abs(i - active), N - Math.abs(i - active));
      el.dataset.far = d === 0 ? "0" : "1";
    });
  }

  function select(i) {
    active = ((i % N) + N) % N;
    $$("#appnav button").forEach(b => b.setAttribute("aria-selected", String(Number(b.dataset.i) === active)));
    turn();
  }

  // ── the numbers move, but only on the screen you are looking at ────────────────────────────
  const jitter = (v, pct) => v * (1 + (Math.random() - 0.5) * pct);
  function tick() {
    const slide = $$(".slide", ring)[active];
    if (!slide) return;
    const set = (id, fn) => { const el = $(`[data-n="${id}"]`, slide); if (el) fn(el); };
    set("mph", el => el.textContent = Math.round(jitter(62, 0.22)));
    set("accel", el => el.setAttribute("stroke-dasharray", `${Math.round(jitter(62, 0.5))} 251`));
    set("pw", el => el.textContent = Math.round(jitter(38, 0.6)) + " kW");
    set("lsoc", el => el.textContent = (77 + Math.round(Math.random())) + "%");
    set("range", el => el.textContent = Math.round(jitter(212, 0.04)) + " mi");
    set("kw", el => el.textContent = jitter(48.2, 0.16).toFixed(1) + " kW");
    set("soc", el => el.textContent = Math.round(jitter(62, 0.06)) + "%");
    set("added", el => el.textContent = jitter(31.4, 0.05).toFixed(1) + " kWh");
    set("cost", el => el.textContent = "$" + jitter(10.36, 0.05).toFixed(2));
    set("cpm", el => el.textContent = "$" + jitter(0.141, 0.06).toFixed(3));
    set("eff", el => el.textContent = jitter(2.46, 0.05).toFixed(2));
    set("spent", el => el.textContent = "$" + Math.round(jitter(1533, 0.01)).toLocaleString("en-US"));
    set("saved", el => el.textContent = "$" + Math.round(jitter(981, 0.02)));
    set("trips", el => el.textContent = 480 + Math.round(Math.random() * 9));
    set("kwh", el => el.textContent = Math.round(jitter(4944, 0.004)).toLocaleString("en-US"));
    set("mpge", el => el.textContent = Math.round(jitter(83, 0.05)));
    set("rtrips", el => el.textContent = 24 + Math.round(Math.random() * 8));
    set("rmi", el => el.textContent = Math.round(jitter(612, 0.06)) + " mi");
    set("rcost", el => el.textContent = "$" + jitter(86.4, 0.06).toFixed(2));
    set("wsoc", el => el.textContent = (77 + Math.round(Math.random())) + "%");
    set("wmi", el => el.textContent = jitter(14.6, 0.08).toFixed(1) + " mi");
  }

  // Charge and Map hold several faces; they advance only while centred.
  function cycleSub() {
    const s = SCREENS[active];
    const m = MOCK[s.key];
    if (!Array.isArray(m)) return;
    subIndex[s.key] = ((subIndex[s.key] || 0) + 1) % m.length;
    const slide = $$(".slide", ring)[active];
    if (slide) slide.innerHTML = slideInner(s);
  }

  // ── splash — every load, tap to skip, never when motion is reduced ─────────────────────────
  function splash() {
    const el = $("#splash");
    if (!el) return;
    if (reduced) { el.classList.add("gone"); return; }
    const close = () => el.classList.add("gone");
    setTimeout(close, 1900);
    el.addEventListener("click", close);
    document.addEventListener("keydown", close, { once: true });
  }

  // ── go ─────────────────────────────────────────────────────────────────────────────────────
  splash();
  build();

  $("#themeBtn").onclick = () => {
    theme = (document.documentElement.getAttribute("data-theme") === "dark") ? "light" : "dark";
    saved = theme;
    try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
    applyTheme(theme);
    build();   // the screens follow the theme
  };

  document.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") select(active + 1);
    if (e.key === "ArrowLeft")  select(active - 1);
  });
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(build, 200); });

  if (!reduced) {
    setInterval(tick, 1400);
    setInterval(cycleSub, 3200);
  }
})();
