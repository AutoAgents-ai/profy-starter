"use client";

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafaf9]">
      <div className="w-full max-w-lg space-y-6 p-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">
            Welcome to your Profy App
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Start building your application here. Edit{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">
              src/app/page.tsx
            </code>{" "}
            to customize this page.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Quick Start</h2>
          <ul className="mt-3 space-y-2 text-sm text-gray-500">
            <li>
              <code className="text-xs font-mono text-gray-700">npm run dev</code>{" "}
              — Start local development
            </li>
            <li>
              <code className="text-xs font-mono text-gray-700">npm run profy:validate</code>{" "}
              — Validate profy.json
            </li>
            <li>
              <code className="text-xs font-mono text-gray-700">npm run profy:deploy</code>{" "}
              — Deploy to Profy platform
            </li>
            <li>
              <code className="text-xs font-mono text-gray-700">npm run profy:publish</code>{" "}
              — Publish to marketplace
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
