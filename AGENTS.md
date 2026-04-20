# Profy App Starter — Developer Guide

A minimal Next.js starter for building custom UI applications on the Profy platform.
In production, your app runs inside Profy's fullscreen iframe shell (header + iframe).
Locally, it's a normal Next.js app.

## Architecture

- **Next.js App Router** — standard routing, no special wrappers
- **profy.json** — declares product metadata, billing, build, and runtime config
- **profy-bridge.ts** — postMessage bridge for iframe ↔ shell communication
- **@profy/market-cli** — validate, deploy, and publish via CLI

### Local vs Production

| | Local (`npm run dev`) | Local (`npm run dev:next`) | Production (Profy shell) |
|---|---|---|---|
| URL | `http://localhost:82/webapps/{slug}` | `http://localhost:3000` | `https://{domain}/webapps/{slug}` |
| Auth | Dev session via appSecret | None | Same-origin cookie |
| Platform API | Proxied through gateway | Not available | Same-origin |
| Billing | Gateway simulates platform | N/A | Platform-managed |
| Shell | Standalone | Standalone | Header + iframe |

`npm run dev` starts `market-cli app dev` which runs both a **gateway proxy** (port 82) and **Next.js** (port 81). The gateway exchanges `appSecret` for a dev session, then proxies `/api/market/*`, `/api/file/*`, `/api/openapi/*` to the real platform.

`npm run dev:next` runs Next.js only — useful for pure UI work when you don't need platform APIs.

## File Structure

```
profy.json             — product config (type, billing, build, marketplace)
src/app/page.tsx       — your main page ("use client" by default)
src/app/layout.tsx     — root layout
src/app/api/           — API routes (your backend logic)
src/lib/profy-bridge.ts — postMessage bridge
Dockerfile             — deployment image
```

## profy.json

Complete field reference with all available options:

```json
{
  "$schema": "https://profy-test.agentspro.cn/schema/profy.json",
  "name": "My App",
  "type": "app",
  "version": "1.0.0",
  "slug": "my-app",
  "framework": "nextjs",

  "marketplace": {
    "category": "productivity",
    "tags": ["keyword1", "keyword2"],
    "description": "A brief description (50-500 chars)",
    "icon": "./assets/icon.png",
    "overview": "./overview.md"
  },

  "billing": {
    "type": "PER_CALL",
    "freeTrialPerUser": 3,
    "rules": [
      { "path": "/api/run", "type": "PER_CALL", "amount": 10, "name": "Run" },
      { "path": "/api/chat", "type": "PER_TOKEN", "name": "AI Chat" }
    ]
  },

  "platform": {
    "baseUrl": "https://profy-test.agentspro.cn",
    "appSecret": "",
    "appUuid": ""
  },

  "deploy": { "mode": "k8s", "replicas": 1, "platform": "linux/amd64" },
  "build": { "command": "npm run build", "outputDir": ".next" },
  "runtime": { "memory": 256, "maxInstances": 1, "timeout": 30 },
  "env": { "OPENAI_API_KEY": { "required": true, "description": "OpenAI key" } }
}
```

Key fields:

| Field | Description |
|-------|-------------|
| `type` | Must be `"app"` for custom UI applications |
| `billing.type` | `FREE`, `PER_CALL`, or `SUBSCRIPTION` |
| `billing.rules[]` | Per-path billing rules (see Billing below) |
| `platform` | Local dev gateway config (baseUrl + appSecret + appUuid) |
| `deploy` | K8s deployment config |
| `build` / `runtime` | Build and runtime configuration |

## Billing

The `/webapps/*` proxy intercepts API calls matching `billing.rules` and charges
automatically. Your app does NOT implement billing logic.

### Two billing strategies per rule

| Type | Behavior | `amount` required? |
|------|----------|-------------------|
| `PER_CALL` | Fixed credits deducted per call | Yes |
| `PER_TOKEN` | Actual cost returned by backend in `_billing.amount` | No (optional estimate) |

When `type` is omitted in a rule, it defaults to `PER_CALL`.

**PER_TOKEN response protocol:** Your API route returns the consumed amount:
```json
{ "result": { "..." }, "_billing": { "amount": 23 } }
```

The user's balance is the natural cap — no `maxAmount` needed.

### Handling insufficient balance

When the proxy rejects with HTTP 422 `INSUFFICIENT_BALANCE`, call
`notifyInsufficientBalance()` from `profy-bridge.ts`. The shell shows a
unified recharge prompt. Do NOT build your own balance dialog.

## postMessage Bridge

`src/lib/profy-bridge.ts` provides three functions for iframe ↔ shell communication:

| Function | When to use |
|----------|-------------|
| `notifyReady()` | Call after your app has loaded |
| `notifyTaskState("started" \| "finished", opts?)` | Call when a user action starts/completes |
| `notifyInsufficientBalance({ apiPath? })` | Call when API returns 422 INSUFFICIENT_BALANCE |

All are no-ops when the app runs standalone (not in iframe).

## Commands

```bash
npm run dev              # Gateway (82) + Next.js (81), full platform proxy
npm run dev:next         # Next.js only, no gateway
npm run build            # Production build
npm run profy:validate   # Validate profy.json
npm run profy:deploy     # Build Docker image + deploy to Profy
npm run profy:publish    # Publish to marketplace
```

## Configuration

| Field | Purpose |
|-------|---------|
| `platform.baseUrl` | Profy platform URL for dev gateway |
| `platform.appSecret` | App secret for dev session exchange (keep private) |
| `platform.appUuid` | Application UUID; required for updating existing apps |
| `billing.rules[]` | Per-path billing rules — gateway intercepts and charges per API call |
| `deploy` | K8s deployment config (replicas, platform) |

Set `platform.appSecret` and `platform.appUuid` after creating your app on the Profy console.

## Key Constraints

1. **No auth code needed** — Profy handles user authentication
2. **No billing code in your app** — billing is platform-managed via `billing.rules` in profy.json; the `/webapps/*` proxy intercepts matching paths and charges automatically
3. **No site-level navigation** — in production, the Profy header provides back/identity
4. **Use relative paths** — avoid hardcoded absolute URLs (basePath may differ)
5. **Responsive design** — your app fills the area below the 48px Profy header
6. **Never expose `platform.appSecret`** in client-side code or public repos

## Deployment

Deploy flow: `npm run profy:deploy` → Docker build → image upload → K8s deployment.

The app is accessible at `https://{domain}/webapps/{slug}` via the platform's reverse proxy.
