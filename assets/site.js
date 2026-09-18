// TrueMile EV — the public page: splash, the 3D carousel, and the write-up under it.
// No dependency of any kind; every icon below is drawn inline for the same reason.

(function () {
  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── the six (plus Auto), in the app's own bottom-bar order ─────────────────────────────────
  // Copy lives here so it is one object to edit, not seven places in the markup.
  const SCREENS = [
    {
      key: "board", label: "Board",
      headline: "One screen, every number",
      lede: "A glance tells you what the car actually costs you — every mile, every kilowatt-hour, every dollar, day by day and drive by drive.",
      detail: "Cost per mile and cost per kWh come from what you actually paid for the energy, charge by charge, at the price on the day. Lifetime sits next to this month — total spent, savings against gas, mi/kWh and MPGe, average speed, drive count, the energy regen handed back, what climate control took — and your last drives sit underneath. Nothing here is typed in; it's measured off the car and added up.",
      bullets: ["Cost per mile from what you paid", "Lifetime and monthly totals side by side", "Regen recovered and climate cost, measured"],
    },
    {
      key: "charge", label: "Charge",
      headline: "Every charge, accounted for",
      lede: "Watch the energy land in real time, then keep the receipt for good.",
      detail: "Plugged in, the screen follows power, energy delivered and state of charge as they climb; unplugged, it sits idle and waits. When the session ends you get the summary — kWh delivered, what it cost, the rate, the charge you arrived and left with, how long you stood there. Open any past session and its own power curve is there, sampled from your car while it charged, not copied off a spec sheet.",
      bullets: ["Live power, energy and charge state", "Cost, rate and duration per session", "Every session's own power curve"],
    },
    {
      key: "live", label: "Live",
      headline: "The drive, as it happens",
      lede: "See what your right foot costs you at the moment it costs it.",
      detail: "The power gauge swings up under acceleration and falls through zero into regen, so energy going out and energy coming back are one continuous motion. Around it sit speed, state of charge, range, pack and cabin temperature and 12-volt health — and you choose which readouts fill the tiles, because what matters on a mountain pass isn't what matters in traffic. It all comes straight off the adapter, live; when the link drops the gauge falls to zero instead of holding a stale number.",
      bullets: ["Power gauge reads acceleration and regen", "Choose which readouts fill the tiles", "Pack, cabin and 12-volt health"],
    },
    {
      key: "map", label: "Map",
      headline: "Where you are, where you're going",
      lede: "Where you've been is drawn on the map; where you can get to is planned on what your car actually does.",
      detail: "Three faces on one map: the charge locations you've really used, past trips drawn along the roads you actually took, and navigation with your saved places. Plan a route and the stops are sized from your measured range in today's conditions and your car's own charging curve. It tells you where you'd stop, for how long, and what charge you'd arrive with, before you pull out of the driveway.",
      bullets: ["Charge locations you've actually used", "Past trips drawn as you drove them", "Stops and arrival charge, planned ahead"],
    },
    {
      key: "report", label: "Report",
      headline: "Proof you can hand over",
      lede: "When someone wants the driving in writing — an accountant, a client, you next April — it's already written.",
      detail: "Filter by vehicle, category and date range, and the totals for that window come back with the drives behind them. Export the list as CSV, the period as a PDF, or business mileage as a PDF that carries its own verification page. Every row is a drive the app recorded while it was happening, so the total isn't a claim — it's a sum.",
      bullets: ["Filter by vehicle, category, date range", "CSV, period PDF, mileage PDF", "Business report with verification page"],
    },
    {
      key: "wear", label: "Wear",
      headline: "Your car, on your wrist",
      lede: "What the car knows shouldn't be stuck in a phone at the bottom of a bag.",
      detail: "The watch mirrors the phone: state of charge, range remaining, and the drive being recorded right now, updating as you go. When the drive ends it holds on to where the car stopped, so finding it again in a packed lot is a glance and a walk. Nothing to start, nothing to stop — same as the phone.",
      bullets: ["Charge and range on your wrist", "The drive in progress, live", "Walk back to where you parked"],
    },
    {
      key: "auto", label: "Auto", soon: true,
      headline: "Android Auto",
      lede: "The same drive data on the car's own screen — not released yet.",
      detail: "Built and running, waiting on release: charge, range and the drive in progress on the head unit, with the places you charge as points of interest. It ships when the phone app leaves closed testing.",
      bullets: ["Coming after closed testing", "Charge and range on the dash", "Your chargers as places"],
    },
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

  // ── the mock screens ───────────────────────────────────────────────────────────────────────
  // Recreations, not screenshots: they stay crisp at any size, weigh nothing, and their numbers can
  // move. Any one of them can be swapped for a real PNG later without touching the carousel.
  const navbar = (on) => `<div class="navbar">` +
    ["board", "charge", "live", "map", "report"]
      .map(k => svg(k, k === on ? "on" : "")).join("") + `</div>`;

  const phone = (on, body) => `
    <div class="phone"><div class="screen">
      <div class="status"><span>7:04</span><span>5G</span></div>
      <div class="body">${body}</div>
      ${navbar(on)}
    </div></div>`;

  const tile = (k, v, cls) => `<div class="t"><div class="k">${k}</div><div class="v ${cls || ""}" ${cls === undefined ? "" : ""}>${v}</div></div>`;
  const liveTile = (k, v, cls, id) => `<div class="t"><div class="k">${k}</div><div class="v ${cls || ""}" data-n="${id}">${v}</div></div>`;

  const MOCK = {
    board: () => phone("board", `
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
      </div>`),

    charge: [
      () => phone("charge", `
        <div class="t"><div class="k">charging now</div><div class="v cyan" data-n="kw">48.2 kW</div></div>
        <div class="bar-s"><i style="width:62%" data-n="soc-bar"></i></div>
        <div class="g2">${liveTile("charge", "62%", "cyan", "soc")}${liveTile("added", "31.4 kWh", "", "added")}</div>
        <div class="g2">${tile("rate", "$0.33/kWh")}${liveTile("cost", "$10.36", "", "cost")}</div>`),
      () => phone("charge", `
        <div class="t"><div class="k">plugged in</div><div class="v muted">idle</div></div>
        <div class="bar-s"><i style="width:80%"></i></div>
        <div class="g2">${tile("charge", "80%")}${tile("since", "12 min")}</div>
        <div class="t"><div class="k">waiting for power</div><div class="v muted" style="font-size:9px">the session resumes on its own</div></div>`),
      () => phone("charge", `
        <div class="t"><div class="k">session complete</div><div class="v green">54.8 kWh</div></div>
        <div class="g2">${tile("cost", "$18.11")}${tile("rate", "$0.331")}</div>
        <div class="g2">${tile("arrived", "18%")}${tile("left at", "82%")}</div>
        <div class="t"><div class="k">time</div><div class="v">41 min</div></div>`),
      () => phone("charge", `
        <div class="t"><div class="k">power curve</div>
          <svg viewBox="0 0 100 34" style="width:100%;height:34px">
            <polyline points="2,30 12,8 26,7 44,12 62,19 80,25 98,29" fill="none" stroke="#37b6ff" stroke-width="2"/>
          </svg></div>
        <div class="g3">${tile("peak", "149 kW")}${tile("avg", "97 kW")}${tile("taper", "62%")}</div>
        <div class="listrow"><span>Electrify America</span><span>09/14</span></div>`),
    ],

    live: () => phone("live", `
      <div style="display:flex;justify-content:center;padding:2px 0">
        <svg viewBox="0 0 100 100" style="width:96px;height:96px">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#1d2b42" stroke-width="9"
            stroke-dasharray="220 251" stroke-linecap="round" transform="rotate(112.5 50 50)"/>
          <circle cx="50" cy="50" r="40" fill="none" stroke="#2e9be6" stroke-width="9"
            stroke-dasharray="62 251" stroke-linecap="round" transform="rotate(-90 50 50)" data-n="accel"/>
          <text x="50" y="47" text-anchor="middle" fill="#e8eef7" font-size="20" font-weight="800" data-n="mph">62</text>
          <text x="50" y="61" text-anchor="middle" fill="#8fa1b8" font-size="8">MPH</text>
        </svg>
      </div>
      <div class="g3">${liveTile("charge", "78%", "green", "lsoc")}${liveTile("range", "212 mi", "", "range")}${liveTile("power", "38 kW", "blue", "pw")}</div>
      <div class="g2">${tile("pack", "78 °F")}${tile("cabin", "70 °F")}</div>
      <div class="t" style="border:1px dashed var(--line);background:transparent">
        <div class="k cyan">hold a tile to change it</div></div>`),

    map: [
      () => phone("map", `<div style="position:relative;flex:1;border-radius:9px;overflow:hidden">
        <div class="mapbg"></div>
        <span class="pin" style="background:#00e676;left:26%;top:30%"></span>
        <span class="pin" style="background:#00e676;left:62%;top:52%"></span>
        <span class="pin" style="background:#00e676;left:44%;top:71%"></span>
        <div style="position:absolute;left:6px;bottom:6px" class="t"><div class="k">charges here</div><div class="v green">86</div></div>
      </div>`),
      () => phone("map", `<div style="position:relative;flex:1;border-radius:9px;overflow:hidden">
        <div class="mapbg"></div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%">
          <polyline points="12,86 28,66 40,60 56,38 72,28 88,14" fill="none" stroke="#37b6ff" stroke-width="3"/>
        </svg>
        <div style="position:absolute;left:6px;bottom:6px" class="t"><div class="k">this drive</div><div class="v cyan">177.1 mi</div></div>
      </div>`),
      () => phone("map", `<div style="position:relative;flex:1;border-radius:9px;overflow:hidden">
        <div class="mapbg"></div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%">
          <polyline points="50,92 50,58 62,40 62,8" fill="none" stroke="#00e676" stroke-width="3"/>
        </svg>
        <div style="position:absolute;left:6px;top:6px;display:flex;flex-direction:column;gap:4px">
          <span class="pin" style="position:static;background:#37b6ff"></span>
          <span class="pin" style="position:static;background:#37b6ff"></span>
        </div>
        <div style="position:absolute;left:6px;right:6px;bottom:6px" class="t">
          <div class="k">work · arrival charge</div><div class="v green">68%</div></div>
      </div>`),
    ],

    report: () => phone("report", `
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
        <span class="t" style="flex:1;text-align:center"><span class="k cyan">MILEAGE</span></span></div>`),

    wear: () => `<div class="watch"><div class="face">
        <div style="font-size:26px;font-weight:800;color:#00e676" data-n="wsoc">78%</div>
        <div style="font-size:9px;color:#8fa1b8">212 mi range</div>
        <div style="height:1px;width:64px;background:#1d2b42;margin:5px 0"></div>
        <div style="font-size:11px;font-weight:700" data-n="wmi">14.6 mi</div>
        <div style="font-size:8px;color:#8fa1b8">drive in progress</div>
      </div></div>`,

    auto: () => phone("board", `
      <div class="t" style="text-align:center"><div class="k">android auto</div>
        <div class="v cyan" style="font-size:11px">coming soon</div></div>
      <div class="g2">${tile("charge", "78%")}${tile("range", "212 mi")}</div>
      <div style="position:relative;flex:1;border-radius:9px;overflow:hidden">
        <div class="mapbg"></div>
        <span class="pin" style="background:#00e676;left:40%;top:44%"></span>
      </div>`),
  };

  // ── build ──────────────────────────────────────────────────────────────────────────────────
  const ring = $("#ring"), nav = $("#appnav"), readout = $("#readout");
  const N = SCREENS.length;
  const step = 360 / N;
  let active = 0;
  const subIndex = {};

  function slideInner(s) {
    const m = MOCK[s.key];
    if (Array.isArray(m)) {
      const i = subIndex[s.key] || 0;
      const dots = `<div class="dots">${m.map((_, j) =>
        `<i class="${j === i ? "on" : ""}"></i>`).join("")}</div>`;
      return m[i]() + dots;
    }
    return m();
  }

  function build() {
    const radius = Math.round((window.innerWidth < 640 ? 176 : 210) / 2 / Math.tan(Math.PI / N)) + 30;
    ring.style.setProperty("--r", radius + "px");
    ring.innerHTML = SCREENS.map((s, i) => `
      <div class="slide" data-key="${s.key}" style="transform:rotateY(${i * step}deg) translateZ(${radius}px)">
        ${slideInner(s)}
      </div>`).join("");

    nav.innerHTML = SCREENS.map((s, i) => `
      <button role="tab" aria-selected="${i === active}" data-i="${i}"
              class="${s.soon ? "soon" : ""}" aria-label="${s.label}${s.soon ? ", coming soon" : ""}">
        ${svg(s.key)}<span>${s.label}</span>
      </button>`).join("");
    $$("#appnav button").forEach(b => b.onclick = () => select(Number(b.dataset.i)));
    turn();
  }

  function turn() {
    ring.style.transform = `translateZ(-${ring.style.getPropertyValue("--r")}) rotateY(${-active * step}deg)`;
    $$(".slide", ring).forEach((el, i) => {
      const d = Math.min(Math.abs(i - active), N - Math.abs(i - active));
      el.dataset.far = d === 0 ? "0" : "1";
    });
  }

  function select(i) {
    active = ((i % N) + N) % N;
    $$("#appnav button").forEach(b => b.setAttribute("aria-selected", String(Number(b.dataset.i) === active)));
    turn();
    write();
  }

  function write() {
    const s = SCREENS[active];
    readout.innerHTML = `
      <div class="fade-in">
        <h2>${s.headline}</h2>
        <p class="lede">${s.lede}</p>
        <p class="detail">${s.detail}</p>
        <ul>${s.bullets.map(b => `<li>${b}</li>`).join("")}</ul>
      </div>`;
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

  // ── splash — once per visit, and never when motion is reduced ──────────────────────────────
  function splash() {
    const el = $("#splash");
    if (!el) return;
    let seen = false;
    try { seen = sessionStorage.getItem("tm_splash") === "1"; } catch (_) {}
    if (seen || reduced) { el.classList.add("gone"); return; }
    try { sessionStorage.setItem("tm_splash", "1"); } catch (_) {}
    const close = () => el.classList.add("gone");
    setTimeout(close, 1500);
    el.addEventListener("click", close);
  }

  // ── go ─────────────────────────────────────────────────────────────────────────────────────
  splash();
  build();
  write();

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
