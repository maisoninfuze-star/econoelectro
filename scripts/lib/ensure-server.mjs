/**
 * Ensures a storefront server is reachable at `base`. When nothing listens on a
 * localhost base, starts "next dev -p <port>" for the duration of the process
 * and stops it on exit. Returns a stop() function.
 */
export async function reachable(url) {
  try {
    await fetch(url, { signal: AbortSignal.timeout(4000) });
    return true;
  } catch {
    return false;
  }
}

export async function ensureServer(base, { autoStart = true, warmup = [] } = {}) {
  if (await reachable(base)) return () => {};
  const url = new URL(base);
  const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (!isLocal || !autoStart) {
    console.error(`No server at ${base}. Start it with "npm run dev" first.`);
    process.exit(1);
  }
  const port = url.port || "3000";
  console.log(`No server at ${base} — starting "next dev -p ${port}" for this run…`);
  const { spawn } = await import("node:child_process");
  let child = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["next", "dev", "-p", port], { stdio: "ignore", detached: process.platform !== "win32", env: { ...process.env, BROWSER: "none" } });
  const stop = () => {
    if (!child) return;
    try {
      if (process.platform === "win32") child.kill();
      else process.kill(-child.pid, "SIGTERM");
    } catch { /* already gone */ }
    child = null;
  };
  process.on("exit", stop);
  process.on("SIGINT", () => { stop(); process.exit(130); });
  process.on("SIGTERM", () => { stop(); process.exit(143); });
  const started = Date.now();
  while (!(await reachable(base))) {
    if (Date.now() - started > 120_000) {
      console.error("The dev server did not start within 120 s.");
      stop();
      process.exit(1);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  for (const path of warmup) await fetch(`${base}${path}`).catch(() => {});
  return stop;
}
