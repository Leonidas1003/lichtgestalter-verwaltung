
/**
 * Die Lichtgestalter – Supabase Konfiguration
 * Nur öffentliche Schlüssel verwenden.
 */

const CLOUD_CONFIG = {
  url: "https://kjeesqqmyifojtgmodxm.supabase.co",
  anonKey: "sb_publishable_r7AU9XcORV3RWaNvxptz-g_ThUGN4eM"
};

window.LG_CONFIG = {
  SUPABASE_URL: CLOUD_CONFIG.url,
  SUPABASE_ANON_KEY: CLOUD_CONFIG.anonKey
};
