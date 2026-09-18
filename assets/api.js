// TrueMile EV — the browser's whole data layer. No SDK, no bundler, no dependency.
//
// Two reasons this is raw fetch rather than supabase-js: the app's edge functions answer preflight
// with "authorization, apikey, content-type" and do NOT allow x-client-info, which supabase-js sends
// on every call; and a dependency-free page is the only kind that can honestly claim what the
// privacy policy claims — no third-party script of any sort.

const TM = (() => {
  const cfg = window.TM_CONFIG;
  const SESSION_KEY = "tm_session";

  const configured = () => !!(cfg.PROJECT_URL && cfg.ANON_KEY);

  // ── session ────────────────────────────────────────────────────────────────────────────────
  // sessionStorage, not localStorage: the token dies with the tab. On a shared host that is the
  // difference between "this tab" and "anything ever published on this origin".
  function saveSession(s) {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (_) {}
  }
  function loadSession() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch (_) { return null; }
  }
  function clearSession() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (_) {}
  }
  const session = () => loadSession();
  const signedIn = () => !!(session() && session().access_token);

  function expired(s) {
    if (!s || !s.expires_at) return false;
    return Date.now() / 1000 > (s.expires_at - 60);
  }

  async function refreshIfNeeded() {
    const s = session();
    if (!s || !expired(s) || !s.refresh_token) return s;
    const r = await fetch(`${cfg.PROJECT_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { "apikey": cfg.ANON_KEY, "content-type": "application/json" },
      body: JSON.stringify({ refresh_token: s.refresh_token }),
    });
    if (!r.ok) { clearSession(); return null; }
    const next = await r.json();
    saveSession(next);
    return next;
  }

  // ── sign in ────────────────────────────────────────────────────────────────────────────────
  function googleSignInUrl() {
    const u = new URL(`${cfg.PROJECT_URL}/auth/v1/authorize`);
    u.searchParams.set("provider", "google");
    u.searchParams.set("redirect_to", cfg.REDIRECT_URL);
    return u.toString();
  }

  async function signInWithPassword(email, password) {
    const r = await fetch(`${cfg.PROJECT_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { "apikey": cfg.ANON_KEY, "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(body.error_description || body.msg || body.message || "Sign-in failed");
    saveSession(body);
    return body;
  }

  /** Google returns the session in the URL fragment. Consume it and scrub the address bar. */
  function adoptRedirectSession() {
    if (!location.hash || location.hash.length < 2) return false;
    const p = new URLSearchParams(location.hash.slice(1));
    const access_token = p.get("access_token");
    if (!access_token) return false;
    saveSession({
      access_token,
      refresh_token: p.get("refresh_token"),
      expires_at: Number(p.get("expires_at") || 0),
      token_type: p.get("token_type") || "bearer",
    });
    history.replaceState(null, "", location.pathname + location.search);
    return true;
  }

  async function signOut() {
    const s = session();
    if (s && s.access_token) {
      try {
        await fetch(`${cfg.PROJECT_URL}/auth/v1/logout`, {
          method: "POST",
          headers: { "apikey": cfg.ANON_KEY, "authorization": `Bearer ${s.access_token}` },
        });
      } catch (_) { /* the local session goes either way */ }
    }
    clearSession();
  }

  async function whoAmI() {
    const s = await refreshIfNeeded();
    if (!s) return null;
    const r = await fetch(`${cfg.PROJECT_URL}/auth/v1/user`, {
      headers: { "apikey": cfg.ANON_KEY, "authorization": `Bearer ${s.access_token}` },
    });
    if (!r.ok) { clearSession(); return null; }
    return r.json();
  }

  // ── data ───────────────────────────────────────────────────────────────────────────────────
  async function authed(path, init) {
    const s = await refreshIfNeeded();
    if (!s) throw new Error("Signed out");
    const r = await fetch(`${cfg.PROJECT_URL}${path}`, Object.assign({}, init, {
      headers: Object.assign({
        "apikey": cfg.ANON_KEY,
        "authorization": `Bearer ${s.access_token}`,
      }, (init && init.headers) || {}),
    }));
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(`${r.status} ${t.slice(0, 200)}`);
    }
    return r;
  }

  const rest = async (table, query) => (await authed(`/rest/v1/${table}?${query}`)).json();

  /**
   * The Board, from the same endpoint the app's own Board trusts.
   *
   * Deliberately NOT called on a timer or on navigation: this endpoint records an app-open on every
   * call, and that counter is what Play reads for the twelve-testers-fourteen-days requirement. It
   * runs when the page loads and when the Refresh button is pressed. Nothing else.
   */
  const boardStats = (vehicleId) =>
    authed(`/functions/v1/get_stats?vehicle_id=${encodeURIComponent(vehicleId)}`).then(r => r.json());

  // The cloud vehicle's id IS "id" here - there is no vehicle_id column on this table, and it is
  // that id which trip_log.vehicle_id, charge_session.vehicle_id and get_stats all key on.
  // The VIN is deliberately not selected: this page never needs it, so it never fetches it.
  const vehicles = () => rest("vehicles", "select=id,make,model,year,is_active&order=created_at.asc");

  /**
   * Trips WITHOUT gps_polyline. Each row is ~16 kB of route otherwise, and PostgREST caps a page at
   * 1000 rows, so the projection is what keeps a year of driving loadable at all.
   *
   * car_status=eq. (the empty string) is not optional: without it the list folds in drives logged in
   * another car, and drives still waiting to be identified, which the app promises not to count.
   */
  const trips = (vehicleId, limit = 200) =>
    rest("trip_log",
      "select=id,date_epoch,start_epoch,duration_sec,highway_miles,local_miles,used_kwh,regen_kwh," +
      "cost_dollars,avg_speed_mph,start_soc_pct,end_soc_pct,start_odo,end_odo,classification," +
      "journey_id,is_reconciled,car_status" +
      `&vehicle_id=eq.${encodeURIComponent(vehicleId)}&car_status=eq.&order=date_epoch.desc&limit=${limit}`);

  /**
   * Charges, minus the hidden ones. is_hidden marks the originals of a merged pair: the app keeps
   * them for audit and excludes them from every total, so a page that listed them would show the
   * same energy twice.
   */
  const charges = (vehicleId, limit = 200) =>
    rest("charge_session",
      "select=id,date_epoch,network,style,total_kwh,total_dollars,rate_per_kwh," +
      "arrival_soc_pct,departure_soc_pct,time_minutes,charger_type,is_merged,split_session" +
      `&vehicle_id=eq.${encodeURIComponent(vehicleId)}&is_hidden=eq.false` +
      `&order=date_epoch.desc&limit=${limit}`);

  /** What the server says this account may do, on the SERVER's clock — never the browser's. */
  const effectiveTier = () =>
    authed("/rest/v1/rpc/my_effective_tier", {
      method: "POST", headers: { "content-type": "application/json" }, body: "{}",
    }).then(r => r.json());

  return {
    configured, session, signedIn, saveSession, clearSession,
    googleSignInUrl, signInWithPassword, adoptRedirectSession, signOut, whoAmI,
    rest, boardStats, vehicles, trips, charges, effectiveTier,
  };
})();
