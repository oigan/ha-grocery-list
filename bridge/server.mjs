import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { timingSafeEqual } from "node:crypto";

const PORT = Number(process.env.PORT || 8787);
const BRIDGE_TOKEN = process.env.BRIDGE_TOKEN || "";
const CODEX_BIN = process.env.CODEX_BIN || "codex";
const CODEX_MODEL = process.env.CODEX_MODEL || "";
const CHEF_WORKSPACE = process.env.CHEF_WORKSPACE || "/data/workspace";
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 180000);
const MAX_BODY_BYTES = 64 * 1024;

if (!BRIDGE_TOKEN || BRIDGE_TOKEN.length < 24) {
  throw new Error("BRIDGE_TOKEN must contain at least 24 characters");
}

const RECIPE_SCHEMA = {
  type: "object",
  properties: {
    type: { type: "string", enum: ["recipe", "clarification"] },
    message: { type: "string" },
    title: { type: "string" },
    description: { type: "string" },
    servings: { type: "integer", minimum: 1, maximum: 20 },
    prep_minutes: { type: "integer", minimum: 0, maximum: 1440 },
    cook_minutes: { type: "integer", minimum: 0, maximum: 1440 },
    difficulty: { type: "string", enum: ["ușor", "mediu", "avansat"] },
    ingredients: {
      type: "array",
      maxItems: 30,
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          search_query: { type: "string" },
          quantity: { type: "number", minimum: 0, maximum: 100000 },
          unit: {
            type: "string",
            enum: ["g", "kg", "ml", "l", "buc", "lingură", "linguriță", "după gust"]
          },
          optional: { type: "boolean" },
          notes: { type: "string" }
        },
        required: ["name", "search_query", "quantity", "unit", "optional", "notes"],
        additionalProperties: false
      }
    },
    instructions: { type: "array", maxItems: 24, items: { type: "string" } },
    tips: { type: "array", maxItems: 10, items: { type: "string" } },
    source_urls: { type: "array", maxItems: 8, items: { type: "string" } }
  },
  required: [
    "type", "message", "title", "description", "servings", "prep_minutes",
    "cook_minutes", "difficulty", "ingredients", "instructions", "tips", "source_urls"
  ],
  additionalProperties: false
};

const CHEF_INSTRUCTIONS = `Ești Chef AI într-o aplicație românească de cumpărături.
Răspunzi exclusiv în limba română și ajuți numai cu rețete, meniuri și planificare alimentară.
Transformă cererea într-o singură rețetă completă, realistă și sigură alimentar.
Ingredientele trebuie să fie materii prime cumpărabile separat. search_query trebuie să conțină
doar denumirea românească scurtă a ingredientului, niciodată titlul rețetei, mărci sau SKU-uri.
Nu inventa produse, SKU-uri, prețuri ori disponibilitate Auchan; acestea sunt rezolvate de aplicație.
Folosește unități metrice și cantități pentru numărul cerut de porții.
Dacă informația esențială lipsește, întoarce type=clarification și o întrebare scurtă în message;
în acest caz folosește valori neutre și liste goale. Nu executa comenzi și nu modifica fișiere.`;

class RpcError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = "RpcError";
    this.details = details;
  }
}

class CodexRpc {
  constructor() {
    this.child = null;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Set();
    this.startPromise = null;
  }

  async start() {
    if (this.child && !this.child.killed) return;
    if (this.startPromise) return this.startPromise;
    this.startPromise = this.#startProcess();
    try {
      await this.startPromise;
    } finally {
      this.startPromise = null;
    }
  }

  async #startProcess() {
    this.child = spawn(CODEX_BIN, ["app-server"], {
      cwd: CHEF_WORKSPACE,
      env: { ...process.env },
      stdio: ["pipe", "pipe", "pipe"]
    });

    const lines = createInterface({ input: this.child.stdout });
    lines.on("line", line => this.#onLine(line));
    this.child.stderr.on("data", chunk => {
      const message = String(chunk).trim();
      if (message) process.stderr.write(`[codex] ${message}\n`);
    });
    this.child.on("exit", (code, signal) => {
      const error = new RpcError(`Codex App Server stopped (${code ?? signal ?? "unknown"})`);
      for (const { reject, timer } of this.pending.values()) {
        clearTimeout(timer);
        reject(error);
      }
      this.pending.clear();
      this.child = null;
    });
    this.child.on("error", error => {
      for (const { reject, timer } of this.pending.values()) {
        clearTimeout(timer);
        reject(error);
      }
      this.pending.clear();
    });

    await this.request("initialize", {
      clientInfo: { name: "ha_auchan_chef", title: "Auchan Chef AI", version: "0.1.0" },
      capabilities: { experimentalApi: false }
    }, 30000, false);
    this.notify("initialized", {});
  }

  #onLine(line) {
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      return;
    }
    if (Object.prototype.hasOwnProperty.call(message, "id")) {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      clearTimeout(pending.timer);
      this.pending.delete(message.id);
      if (message.error) {
        pending.reject(new RpcError(message.error.message || "Codex request failed", message.error));
      } else {
        pending.resolve(message.result);
      }
      return;
    }
    if (message.method) {
      for (const listener of this.listeners) listener(message);
    }
  }

  request(method, params = {}, timeoutMs = REQUEST_TIMEOUT_MS, ensureStarted = true) {
    if (ensureStarted && (!this.child || this.child.killed)) {
      return this.start().then(() => this.request(method, params, timeoutMs, false));
    }
    if (!this.child?.stdin?.writable) {
      return Promise.reject(new RpcError("Codex App Server is not available"));
    }
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new RpcError(`Codex request timed out: ${method}`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.child.stdin.write(`${JSON.stringify({ method, id, params })}\n`);
    });
  }

  notify(method, params = {}) {
    if (this.child?.stdin?.writable) {
      this.child.stdin.write(`${JSON.stringify({ method, params })}\n`);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

const rpc = new CodexRpc();
const logins = new Map();

rpc.subscribe(message => {
  if (message.method !== "account/login/completed") return;
  const params = message.params || {};
  if (!params.loginId) return;
  const current = logins.get(params.loginId) || {};
  logins.set(params.loginId, {
    ...current,
    status: params.success ? "completed" : "failed",
    error: params.error || null,
    completed_at: Date.now()
  });
});

function safeEqual(left, right) {
  const a = Buffer.from(left || "");
  const b = Buffer.from(right || "");
  return a.length === b.length && timingSafeEqual(a, b);
}

function authorized(request) {
  const header = request.headers.authorization || "";
  return header.startsWith("Bearer ") && safeEqual(header.slice(7), BRIDGE_TOKEN);
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new RpcError("Request body is too large");
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  const value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new RpcError("JSON object required");
  }
  return value;
}

function accountPayload(result) {
  const account = result?.account || null;
  return {
    connected: account?.type === "chatgpt",
    account: account ? {
      type: account.type || null,
      email: account.email || null,
      plan_type: account.planType || null
    } : null,
    requires_openai_auth: Boolean(result?.requiresOpenaiAuth)
  };
}

async function ensureChatGptAccount() {
  const status = await rpc.request("account/read", { refreshToken: false }, 30000);
  if (status?.account?.type !== "chatgpt") {
    throw new RpcError("Conectează mai întâi contul ChatGPT");
  }
  return status;
}

function buildPrompt(userPrompt, preferences) {
  const profile = {
    persoane: Number(preferences?.household_size) || null,
    buget: ["economic", "mediu", "premium"].includes(preferences?.budget)
      ? preferences.budget
      : "mediu",
    timp_maxim_minute: Number(preferences?.max_time_minutes) || null,
    dieta_si_alergii: Array.isArray(preferences?.dietary)
      ? preferences.dietary.slice(0, 20).join(", ").slice(0, 500)
      : String(preferences?.dietary || "").slice(0, 500),
    ingrediente_de_evitat: String(preferences?.dislikes || "").slice(0, 500),
    ingrediente_deja_acasa: String(preferences?.pantry || "").slice(0, 1000)
  };
  return `Cererea utilizatorului:\n${userPrompt}\n\nProfil și preferințe:\n${JSON.stringify(profile)}`;
}

async function createOrResumeThread(threadId) {
  if (threadId) {
    try {
      const resumed = await rpc.request("thread/resume", { threadId }, 30000);
      return resumed.thread.id;
    } catch (error) {
      if (!(error instanceof RpcError)) throw error;
    }
  }
  const params = {
    cwd: CHEF_WORKSPACE,
    approvalPolicy: "never",
    sandbox: "read-only",
    personality: "friendly",
    serviceName: "ha_auchan_chef",
    developerInstructions: CHEF_INSTRUCTIONS
  };
  if (CODEX_MODEL) params.model = CODEX_MODEL;
  const started = await rpc.request("thread/start", params, 30000);
  return started.thread.id;
}

async function runRecipeTurn(threadId, prompt) {
  let targetTurnId = null;
  const messages = [];
  let complete;
  const completed = new Promise((resolve, reject) => { complete = { resolve, reject }; });
  const unsubscribe = rpc.subscribe(message => {
    const params = message.params || {};
    if (params.threadId !== threadId) return;
    if (message.method === "item/completed") {
      const item = params.item || {};
      if ((!targetTurnId || params.turnId === targetTurnId) && item.type === "agentMessage" && item.text) {
        messages.push(item.text);
      }
    }
    if (message.method === "turn/completed" && (!targetTurnId || params.turn?.id === targetTurnId)) {
      const turn = params.turn || {};
      const fallback = (turn.items || []).filter(item => item.type === "agentMessage" && item.text).map(item => item.text);
      if (fallback.length) messages.push(...fallback);
      if (turn.status === "completed") complete.resolve();
      else complete.reject(new RpcError(turn.error?.message || "Generarea rețetei a eșuat", turn.error));
    }
  });

  try {
    const params = {
      threadId,
      input: [{ type: "text", text: prompt }],
      approvalPolicy: "never",
      sandboxPolicy: { type: "readOnly", networkAccess: false },
      effort: "low",
      summary: "none",
      outputSchema: RECIPE_SCHEMA
    };
    if (CODEX_MODEL) params.model = CODEX_MODEL;
    const started = await rpc.request("turn/start", params, 30000);
    targetTurnId = started.turn.id;
    await Promise.race([
      completed,
      new Promise((_, reject) => setTimeout(() => reject(new RpcError("Generarea rețetei a expirat")), REQUEST_TIMEOUT_MS))
    ]);
  } finally {
    unsubscribe();
  }

  const text = messages.at(-1);
  if (!text) throw new RpcError("Codex nu a returnat o rețetă");
  try {
    return JSON.parse(text);
  } catch {
    throw new RpcError("Răspunsul Codex nu este JSON valid");
  }
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", "http://bridge.local");
    if (request.method === "GET" && url.pathname === "/health") {
      sendJson(response, 200, { ok: true, codex_running: Boolean(rpc.child) });
      return;
    }
    if (!authorized(request)) {
      sendJson(response, 401, { error: "Unauthorized" });
      return;
    }

    if (request.method === "GET" && url.pathname === "/v1/auth/status") {
      const result = await rpc.request("account/read", { refreshToken: false }, 30000);
      sendJson(response, 200, accountPayload(result));
      return;
    }

    if (request.method === "POST" && url.pathname === "/v1/auth/device/start") {
      const result = await rpc.request("account/login/start", { type: "chatgptDeviceCode" }, 30000);
      logins.set(result.loginId, { status: "pending", ...result, created_at: Date.now() });
      sendJson(response, 200, {
        login_id: result.loginId,
        verification_url: result.verificationUrl,
        user_code: result.userCode,
        status: "pending"
      });
      return;
    }

    const loginMatch = url.pathname.match(/^\/v1\/auth\/device\/([A-Za-z0-9-]{1,80})$/);
    if (request.method === "GET" && loginMatch) {
      const login = logins.get(loginMatch[1]);
      if (!login) {
        sendJson(response, 404, { error: "Login not found" });
        return;
      }
      if (login.status === "pending") {
        const account = await rpc.request("account/read", { refreshToken: false }, 30000);
        if (account?.account?.type === "chatgpt") login.status = "completed";
      }
      sendJson(response, 200, {
        status: login.status,
        error: login.error || null,
        account: login.status === "completed"
          ? accountPayload(await rpc.request("account/read", { refreshToken: false }, 30000)).account
          : null
      });
      return;
    }

    if (request.method === "POST" && url.pathname === "/v1/auth/logout") {
      await rpc.request("account/logout", {}, 30000);
      logins.clear();
      sendJson(response, 200, { connected: false });
      return;
    }

    if (request.method === "GET" && url.pathname === "/v1/usage") {
      await ensureChatGptAccount();
      const usage = await rpc.request("account/rateLimits/read", {}, 30000);
      sendJson(response, 200, usage || {});
      return;
    }

    if (request.method === "POST" && url.pathname === "/v1/recipes") {
      await ensureChatGptAccount();
      const body = await readJson(request);
      const prompt = String(body.prompt || "").trim();
      if (prompt.length < 3 || prompt.length > 2000) {
        sendJson(response, 400, { error: "Prompt must contain 3-2000 characters" });
        return;
      }
      const threadId = await createOrResumeThread(
        typeof body.thread_id === "string" && body.thread_id.length < 100 ? body.thread_id : ""
      );
      const recipe = await runRecipeTurn(threadId, buildPrompt(prompt, body.preferences || {}));
      sendJson(response, 200, { thread_id: threadId, recipe });
      return;
    }

    sendJson(response, 404, { error: "Not found" });
  } catch (error) {
    const status = error instanceof SyntaxError ? 400 : 502;
    const message = error instanceof RpcError || error instanceof SyntaxError
      ? error.message
      : "Chef bridge request failed";
    console.error("[bridge]", error?.message || error);
    sendJson(response, status, { error: message });
  }
});

server.listen(PORT, "0.0.0.0", async () => {
  console.log(`Auchan Chef bridge listening on ${PORT}`);
  try {
    await rpc.start();
  } catch (error) {
    console.error("[bridge] Could not start Codex App Server:", error.message);
  }
});

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    server.close();
    rpc.child?.kill("SIGTERM");
    process.exit(0);
  });
}
