// TrueMile EV — dashboard rendering.
//
// Two rules this file exists to keep:
//
// 1. NOTHING here derives a figure the server already returns. get_stats' numbers are net-basis
//    (miles / (used - regen)), exclude rebuilt drives from every ratio, and carry the app's own
//    rounding. Dividing the columns again would print numbers 20-45% off on urban drives and
//    disagree with the phone.
// 2. NO internal accounting word ever reaches the page. The prepaid-energy figures arrive under
//    their internal key names; they are relabelled here, exactly as the app labels them.

(function () {
  const $ = (id) => document.getElementById(id);
  const cfg = window.TM_CONFIG;

  let vehicleList = [];
  let currentVehicle = null;

  // ── small helpers ──────────────────────────────────────────────────────────────────────────
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const fmtDate = (epochMs) => {
    if (!epochMs) return "—";
    const d = new Date(Number(epochMs));
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" }) +
      " " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };
  const num = (v, d = 1) => (v == null || v === "" || isNaN(Number(v))) ? "—" : Number(v).toFixed(d);
  const money = (v) => (v == null || v === "" || isNaN(Number(v))) ? "—" : "$" + Number(v).toFixed(2);

  function msg(host, text, kind) {
    host.innerHTML = text ? `<div class="msg ${kind || "info"}">${esc(text)}</div>` : "";
  }

  function tile(k, v, cls) {
    return `<div class="tile"><div class="k">${esc(k)}</div><div class="v ${cls || ""}">${esc(v)}</div></div>`;
  }

  // ── board ──────────────────────────────────────────────────────────────────────────────────
  function renderBoard(stats) {
    const f = stats.financial || {}, p = stats.performance || {}, c = stats.chargeStats || {}, m = stats.monthStats || {};

    $("boardTiles").innerHTML = [
      tile("Cost per mile", f.avgDollarPerMile ? "$" + f.avgDollarPerMile : "—", "green"),
      tile("Cost per kWh", f.avgDollarPerKwh ? "$" + f.avgDollarPerKwh : "—"),
      tile("Total spent", money(f.totalCostDollars)),
      tile("Saved vs petrol", money(f.savingsDollars), "green"),
      // The two internal accounting keys, under the names the app itself shows.
      tile("Prepaid", f.bankKwh ? f.bankKwh + " kWh" : "—", "cyan"),
      tile("Prepaid", money(f.bankValueDollars)),
      tile("Distance", p.totalMiles ? p.totalMiles + " mi" : "—"),
      tile("Efficiency", p.avgMiPerKwh ? p.avgMiPerKwh + " mi/kWh" : "—", "cyan"),
      tile("MPGe", p.mpge || "—"),
      tile("Average speed", p.avgSpeedMph ? p.avgSpeedMph + " mph" : "—"),
      tile("Drives", p.tripCount != null ? p.tripCount : "—"),
      tile("Recovered", p.totalRegenKwh ? p.totalRegenKwh + " kWh" : "—", "green"),
      tile("Climate cost", p.hvacPenalty ? "-" + p.hvacPenalty + " mi/kWh" : "—", "amber"),
      tile("Climate share", p.hvacEnergyPct ? p.hvacEnergyPct + "%" : "—", "amber"),
    ].join("");

    $("chargeTiles").innerHTML = [
      tile("Sessions", c.sessionCount != null ? c.sessionCount : "—"),
      tile("Energy added", c.sumTotalKwh ? c.sumTotalKwh + " kWh" : "—", "cyan"),
      tile("Average session", c.avgTotalKwh ? c.avgTotalKwh + " kWh" : "—"),
      tile("Average rate", c.avgRatePerKwh ? "$" + c.avgRatePerKwh + "/kWh" : "—"),
      tile("Average time", c.avgTimeMin ? c.avgTimeMin + " min" : "—"),
      tile("DC time", c.avgDcTimeMin ? c.avgDcTimeMin + " min" : "—"),
      tile("Arrives at", c.avgArrSocPct ? c.avgArrSocPct + "%" : "—"),
      tile("Leaves at", c.avgDepSocPct ? c.avgDepSocPct + "%" : "—"),
    ].join("");

    $("monthTiles").innerHTML = [
      tile("Distance", m.miles ? m.miles + " mi" : "—"),
      tile("Energy", m.kwh ? m.kwh + " kWh" : "—"),
      tile("Cost", money(m.cost)),
      tile("Drives", m.trips != null ? m.trips : "—"),
      tile("Efficiency", m.avgMiKwh ? m.avgMiKwh + " mi/kWh" : "—", "cyan"),
    ].join("");

    const v = vehicleList.find(x => x.id === currentVehicle);
    const name = v ? [v.year, v.make, v.model].filter(Boolean).join(" ") : "This vehicle";
    // Say which side this is. The cloud and the phone can legitimately differ, and a figure shown
    // without its source is the one that starts an argument with the app.
    $("scopeLine").textContent =
      `${name} · every drive on record · figures as the cloud has them, which is what the app's Board reads first.`;
  }

  // ── tables ─────────────────────────────────────────────────────────────────────────────────
  function renderTrips(rows) {
    const body = $("tripTable").querySelector("tbody");
    if (!rows.length) { body.innerHTML = `<tr><td colspan="8" class="note">No drives yet.</td></tr>`; return; }
    body.innerHTML = rows.map(t => {
      const mi = (Number(t.highway_miles) || 0) + (Number(t.local_miles) || 0);
      const used = Number(t.used_kwh) || 0, regen = Number(t.regen_kwh) || 0;
      // Net basis, and never for a rebuilt drive: its distance is real but its energy is inferred,
      // so a ratio from it would report an estimate as a measurement.
      const net = used - regen;
      const eff = (!t.is_reconciled && net > 0.05 && mi > 0.1) ? (mi / net).toFixed(2) : "—";
      const soc = (t.start_soc_pct != null && t.end_soc_pct != null)
        ? `${num(t.start_soc_pct, 0)}% → ${num(t.end_soc_pct, 0)}%` : "—";
      const kind = t.is_reconciled ? `<span class="pill grey">rebuilt</span>`
        : (t.classification ? `<span class="pill">${esc(t.classification)}</span>` : "");
      return `<tr><td>${esc(fmtDate(t.date_epoch))}</td><td>${num(mi)} mi</td><td>${num(used, 1)} kWh</td>` +
        `<td>${money(t.cost_dollars)}</td><td>${eff}</td><td>${num(t.avg_speed_mph, 0)} mph</td>` +
        `<td>${soc}</td><td>${kind}</td></tr>`;
    }).join("");
    $("tripNote").textContent = `${rows.length} most recent drives.`;
  }

  function renderCharges(rows) {
    const body = $("chargeTable").querySelector("tbody");
    if (!rows.length) { body.innerHTML = `<tr><td colspan="7" class="note">No charges yet.</td></tr>`; return; }
    body.innerHTML = rows.map(c => {
      const where = c.network || c.charger_type || c.style || "—";
      const soc = (c.arrival_soc_pct != null && c.departure_soc_pct != null)
        ? `${num(c.arrival_soc_pct, 0)}% → ${num(c.departure_soc_pct, 0)}%` : "—";
      return `<tr><td>${esc(fmtDate(c.date_epoch))}</td><td>${esc(where)}</td><td>${num(c.total_kwh, 1)}</td>` +
        `<td>${money(c.total_dollars)}</td><td>${c.rate_per_kwh ? "$" + num(c.rate_per_kwh, 3) : "—"}</td>` +
        `<td>${soc}</td><td>${num(c.time_minutes, 0)}</td></tr>`;
    }).join("");
  }

  // ── load ───────────────────────────────────────────────────────────────────────────────────
  async function loadAll() {
    const btn = $("refreshBtn");
    btn.disabled = true; btn.textContent = "Loading…";
    msg($("dashMsg"), "");
    try {
      const [stats, trips, charges] = await Promise.all([
        TM.boardStats(currentVehicle),
        TM.trips(currentVehicle),
        TM.charges(currentVehicle),
      ]);
      renderBoard(stats);
      renderTrips(trips);
      renderCharges(charges);
    } catch (e) {
      msg($("dashMsg"), "Could not load: " + e.message, "err");
    } finally {
      btn.disabled = false; btn.textContent = "Refresh";
    }
  }

  async function enterDashboard(user) {
    $("signIn").classList.add("hide");
    $("dash").classList.remove("hide");
    $("who").textContent = user && user.email ? user.email : "";
    $("signOutBtn").classList.remove("hide");
    $("refreshBtn").classList.remove("hide");

    vehicleList = await TM.vehicles().catch(() => []);
    if (!vehicleList.length) {
      msg($("dashMsg"), "This account has no vehicle yet. Add one in the app and it will appear here.", "info");
      return;
    }
    const picker = $("vehiclePicker");
    picker.innerHTML = vehicleList.map(v =>
      `<option value="${esc(v.id)}">${esc([v.year, v.make, v.model].filter(Boolean).join(" ") || "Vehicle")}</option>`).join("");
    picker.classList.remove("hide");
    currentVehicle = (vehicleList.find(v => v.is_active) || vehicleList[0]).id;
    picker.onchange = () => { currentVehicle = picker.value; loadAll(); };

    await loadAll();
  }

  // ── boot ───────────────────────────────────────────────────────────────────────────────────
  async function boot() {
    if (!TM.configured()) { $("unconfigured").classList.remove("hide"); return; }

    TM.adoptRedirectSession();

    $("googleBtn").onclick = () => { location.href = TM.googleSignInUrl(); };
    $("emailBtn").onclick = async () => {
      const b = $("emailBtn");
      b.disabled = true;
      msg($("signInMsg"), "");
      try {
        await TM.signInWithPassword($("email").value.trim(), $("password").value);
        const user = await TM.whoAmI();
        await enterDashboard(user);
      } catch (e) {
        msg($("signInMsg"), e.message, "err");
      } finally { b.disabled = false; }
    };
    $("signOutBtn").onclick = async () => {
      await TM.signOut();
      location.reload();
    };
    $("refreshBtn").onclick = loadAll;

    if (TM.signedIn()) {
      const user = await TM.whoAmI();
      if (user) { await enterDashboard(user); return; }
    }
    $("signIn").classList.remove("hide");
  }

  boot();
})();
