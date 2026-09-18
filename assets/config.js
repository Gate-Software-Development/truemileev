// TrueMile EV — web dashboard configuration.
//
// PROJECT_URL and ANON_KEY are the SAME public pair the Android app ships (SupabaseClient.kt).
// The anon key is public by design: every row this page can reach is gated by row-level security
// against the signed-in user, not by the key. It still is not committed here — paste it in once,
// the way every other credential in this project is handled.
//
// Where to get it: Supabase dashboard → Project Settings → API → Project API keys → anon / public.
//                  (Or copy the value already in app/.../data/SupabaseClient.kt.)
//
// NEVER put the service_role key in this file. It is not gated by row-level security and this file
// is served to every visitor's browser.
window.TM_CONFIG = {
  PROJECT_URL: "https://fsnmjxtthahperapdihw.supabase.co",
  ANON_KEY:    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzbm1qeHR0aGFocGVyYXBkaWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2OTYwMDQsImV4cCI6MjA5NjI3MjAwNH0.rC_Vw_HbFw3FpTjcg7Lu1gc0ClLaXY0_LWOtLsuHe3Q",

  // Where Google sends the browser back after sign-in. Must match, exactly, one of the redirect
  // URLs allowed in Supabase (Authentication → URL Configuration) and in the Google Cloud OAuth
  // client's "Authorised redirect URIs". Leave as-is to use whatever origin this page is served
  // from, which is what you want in production.
  REDIRECT_URL: window.location.origin + window.location.pathname,

  // Read-only by decision, not by accident. The tables this page reads carry a FOR ALL policy, so a
  // browser COULD write to them directly - and a direct write bypasses the date-ordered cost replay
  // the app and the sync functions run, leaving the money wrong on both surfaces with no error.
  // Corrections belong in the app. Leave this false.
  ALLOW_WRITES: false,
};
