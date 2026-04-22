# Profy App Starter — Developer Guide

A minimal Vite + React starter for building custom UI applications on the Profy platform.
In production, your app runs inside Profy's fullscreen iframe shell (header + iframe).
Locally, it's a normal Vite dev server.

## Architecture

- **Vite + React** — fast HMR, static build output (`dist/`)
- **profy.json** — declares product metadata, billing, build, and runtime config
- **profy-bridge.ts** — postMessage bridge for iframe ↔ shell communication
- **@profy/market-cli** — validate, deploy, and publish via CLI

### Local vs Production

| | Local (`npm run dev`) | Production (Profy shell) |
|---|---|---|
| URL | `http://localhost:3000` | `https://{domain}/webapps/{slug}` |
| Auth | None (standalone) | Same-origin cookie |
| Platform API | Not available | Same-origin |
| Billing | N/A | Platform-managed |
| Shell | Standalone | Header + iframe |

## File Structure

```
profy.json             — product config (type, billing, build, marketplace)
index.html             — Vite HTML entry
src/main.tsx           — React entry point
src/App.tsx            — your main component
src/styles/globals.css — Tailwind CSS
src/lib/profy-bridge.ts — postMessage bridge
vite.config.ts         — Vite configuration
```

## profy.json

```json
{
  "$schema": "https://profy-test.agentspro.cn/schema/profy.json",
  "name": "My App",
  "type": "app",
  "version": "1.0.0",
  "slug": "my-app",
  "framework": "vite",
  "build": {
    "command": "npm run build",
    "outputDir": "dist",
    "installCommand": "npm install"
  },
  "runtime": { "memory": 128, "maxInstances": 1, "timeout": 30 },
  "marketplace": { "category": "productivity", "tags": [], "description": "" },
  "billing": { "type": "FREE" }
}
```

Key fields:

| Field | Description |
|-------|-------------|
| `type` | Must be `"app"` for custom UI applications |
| `framework` | `"vite"` for this starter |
| `billing.type` | `FREE`, `PER_CALL`, or `SUBSCRIPTION` |
| `billing.rules[]` | Per-path billing rules (see Billing below) |
| `build` | Build and install commands for deployment |

## Billing

The `/webapps/*` proxy intercepts API calls matching `billing.rules` and charges
automatically. Your app does NOT implement billing logic.

| Type | Behavior | `amount` required? |
|------|----------|-------------------|
| `PER_CALL` | Fixed credits deducted per call | Yes |
| `PER_TOKEN` | Actual cost returned by backend in `_billing.amount` | No (optional estimate) |

When the proxy rejects with HTTP 422 `INSUFFICIENT_BALANCE`, call
`notifyInsufficientBalance()` from `profy-bridge.ts`. The shell shows a
unified recharge prompt.

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
npm run dev              # Vite dev server at localhost:3000
npm run build            # Production build -> dist/
npm run preview          # Preview production build locally
npm run profy:validate   # Validate profy.json
npm run profy:deploy     # Deploy to Profy platform (no Docker needed)
npm run profy:publish    # Publish to marketplace
```

## Key Constraints

1. **No auth code needed** — Profy handles user authentication
2. **No billing code in your app** — billing is platform-managed via `billing.rules` in profy.json
3. **No Dockerfile needed** — the platform handles building and containerization
4. **Use relative paths** — avoid hardcoded absolute URLs (`base` may differ in production)
5. **Responsive design** — your app fills the area below the 48px Profy header

## Deployment

Deploy flow: `npm run profy:deploy` → platform builds → deploys to K8s.

The app is accessible at `https://{domain}/webapps/{slug}` via the platform's reverse proxy.
No Docker installation is required locally.
