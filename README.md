# Profy App Starter

Minimal Vite + React + Tailwind CSS template for building custom UI applications on the [Profy](https://profy-test.agentspro.cn) platform.

## Quick Start

```bash
# Clone the template
git clone https://github.com/AutoAgents-ai/profy-starter.git my-app
cd my-app
npm install

# Start developing
npm run dev
```

Open <http://localhost:3000> — edit `src/App.tsx` to start building.

## Deploy

```bash
# Validate your profy.json
npm run profy:validate

# Deploy (no Docker needed — the platform builds for you)
npm run profy:deploy

# Publish to the Profy Marketplace
npm run profy:publish
```

## Project Structure

```
profy.json             — product config (billing, marketplace, build settings)
index.html             — Vite entry
src/
  main.tsx             — React mount
  App.tsx              — your app
  styles/globals.css   — Tailwind CSS
  lib/profy-bridge.ts  — iframe ↔ shell communication
vite.config.ts         — Vite + Tailwind configuration
```

## Configuration

Edit `profy.json` to configure your app's name, billing, marketplace listing, and environment variables. See `AGENTS.md` for the full field reference.

## Learn More

- [Profy Marketplace](https://profy-test.agentspro.cn/marketplace)
- [Publishing Guide](https://profy-test.agentspro.cn/creator/publish-custom-app.md)
