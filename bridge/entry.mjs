// Launcher shared by both ways of running this bridge.
//
//   Home Assistant add-on : Supervisor mounts /data as the persistent volume and
//                           writes the values from the add-on UI to /data/options.json.
//   Plain Docker / Coolify: configuration arrives as environment variables and the
//                           operator mounts a volume at /data.
//
// Either way we end up with the same process.env, because server.mjs reads all of its
// settings once at import time. That is also why the import below is dynamic: the
// environment has to be complete before the module body runs, or its BRIDGE_TOKEN
// length check throws on startup.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const OPTIONS_FILE = "/data/options.json";
const TOKEN_FILE = "/data/bridge_token";
const MIN_TOKEN_LENGTH = 24;

function readAddonOptions() {
  if (!existsSync(OPTIONS_FILE)) return {};
  try {
    const parsed = JSON.parse(readFileSync(OPTIONS_FILE, "utf8"));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.error(`[entry] ${OPTIONS_FILE} is not valid JSON (${error.message}); ignoring it.`);
    return {};
  }
}

function firstUsableToken(...candidates) {
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length >= MIN_TOKEN_LENGTH) {
      return candidate.trim();
    }
  }
  return null;
}

// A generated token is written to /data so it survives restarts and add-on updates.
// Without that the integration would need reconfiguring every time the container is
// recreated, which is exactly the friction this launcher exists to remove.
function resolveToken(options) {
  const configured = firstUsableToken(options.bridge_token, process.env.BRIDGE_TOKEN);
  if (configured) return { token: configured, source: "configured" };

  if (existsSync(TOKEN_FILE)) {
    const saved = firstUsableToken(readFileSync(TOKEN_FILE, "utf8"));
    if (saved) return { token: saved, source: "stored" };
  }

  const token = randomBytes(24).toString("base64url");
  try {
    writeFileSync(TOKEN_FILE, token, { mode: 0o600 });
    return { token, source: "generated" };
  } catch (error) {
    // No writable /data (a Docker run without a volume). Still start, but the token
    // changes on every restart, so say so rather than letting it look persistent.
    console.error(`[entry] Could not persist a token to ${TOKEN_FILE}: ${error.message}`);
    return { token, source: "ephemeral" };
  }
}

function announce(token, source) {
  const banner = "=".repeat(64);
  if (source === "configured") {
    console.log("[entry] Using the bridge token from the add-on options / environment.");
    return;
  }
  if (source === "stored") {
    console.log(`[entry] Reusing the bridge token stored in ${TOKEN_FILE}.`);
    console.log(`[entry] Token: ${token}`);
    return;
  }
  console.log(banner);
  console.log("[entry] No bridge token was configured, so one was generated for you.");
  console.log("");
  console.log(`    ${token}`);
  console.log("");
  console.log("[entry] Paste it into the Auchan Grocery List integration:");
  console.log("[entry]   Settings > Devices & services > Auchan Grocery > Configure");
  console.log("[entry]   > Chef bridge token");
  if (source === "ephemeral") {
    console.log("[entry] WARNING: /data is not writable, so this token is lost on restart.");
    console.log("[entry] Mount a persistent volume at /data, or set BRIDGE_TOKEN yourself.");
  }
  console.log(banner);
}

const options = readAddonOptions();
const { token, source } = resolveToken(options);

process.env.BRIDGE_TOKEN = token;
process.env.PORT = String(options.port ?? process.env.PORT ?? 8787);
process.env.CODEX_HOME = process.env.CODEX_HOME || "/data/codex";
process.env.CHEF_WORKSPACE = process.env.CHEF_WORKSPACE || "/data/workspace";

if (options.codex_model) process.env.CODEX_MODEL = String(options.codex_model);
if (options.request_timeout_ms) {
  process.env.REQUEST_TIMEOUT_MS = String(options.request_timeout_ms);
}

// Codex keeps its ChatGPT session under CODEX_HOME and refuses to start without a
// working directory, so both have to exist before the server spawns it.
for (const dir of [process.env.CODEX_HOME, process.env.CHEF_WORKSPACE]) {
  try {
    mkdirSync(dir, { recursive: true });
  } catch (error) {
    console.error(`[entry] Could not create ${dir}: ${error.message}`);
  }
}

announce(token, source);

await import("./server.mjs");
