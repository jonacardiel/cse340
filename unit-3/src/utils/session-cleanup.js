import { query } from "../models/db.js";

let cleanupTimer = null;

function startSessionCleanup() {
  if (cleanupTimer) {
    return cleanupTimer;
  }

  const twelveHours = 1000 * 60 * 60 * 12;

  cleanupTimer = setInterval(async () => {
    try {
      await query("DELETE FROM session WHERE expire < NOW()");
      console.log("Expired sessions cleaned up.");
    } catch (error) {
      console.error("Session cleanup error:", error);
    }
  }, twelveHours);

  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }

  return cleanupTimer;
}

export { startSessionCleanup };
