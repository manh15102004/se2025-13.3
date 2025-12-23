# Copilot / Agent Instructions for Shopee Clone 🔧

Purpose: give AI coding agents the minimal, concrete knowledge to be productive quickly.

## Quick start (what to run) ✅
- Install: `npm install`
- Dev server: `npm run dev` (Next.js dev server on port 3000)
- Build for prod: `npm run build` then `npm start`
- Lint: `npm run lint` (uses ESLint)
- Common workaround: to change port: `npm run dev -- -p 3001`

## Important environment variables ⚙️
- `MONGODB_URI` — MongoDB connection (default: `mongodb://localhost:27017/shopee-clone`)
- `JWT_SECRET` — used by `src/lib/auth.ts` for signing/verification
- `NEXT_PUBLIC_API_URL` — public base URL

Set values in `.env.local` (see `README.md` / `QUICKSTART.md`).

## High-level architecture & conventions 🏗️
- Next.js App Router project (pages under `src/app`). API route handlers are under `src/app/api/*` and export `GET`, `POST`, `PUT`, `DELETE` functions that accept `NextRequest` and return `NextResponse` (see `src/app/api/products/route.ts`).
- Database: MongoDB via Mongoose. Connection helper is `src/lib/db.ts` — **always call `await dbConnect()` at the top of route handlers** to reuse a cached global connection.
- Auth: JWT helpers are in `src/lib/auth.ts` (exports `createToken`, `verifyToken`, `getTokenFromCookie`). Routes return the token in JSON (login/register) — no automatic cookie-setting is implemented.
- Models are in `src/models` (Mongoose schemas). Pattern: `mongoose.models.ModelName || mongoose.model(...)` to avoid model recompilation in dev.
- Response shape: routes return JSON with `{ success: boolean, data?: any, error?: string }` — follow this pattern when adding endpoints.
- Path aliases: imports use `@/` -> `src/` (see `tsconfig.json`).
- UI stack: React + TypeScript + Tailwind. Client components use `'use client'` and components live in `src/components` (e.g., `ProductCard.tsx`).
- State: Zustand used for local client state (e.g., `useCartStore` in `src/stores/cartStore.ts`).

## Coding patterns & examples (copy/paste) ✂️
- DB connect + handler example (follow pattern in `src/app/api/products/route.ts`):

```ts
await dbConnect();
const products = await Product.find(...);
return NextResponse.json({ success: true, data: products });
```

- Auth token creation example (see `src/app/api/auth/login/route.ts`):

```ts
const token = createToken({ userId: user._id.toString(), email: user.email });
return NextResponse.json({ success: true, data: { user: {...}, token } });
```

## Project-specific notes / gotchas ⚠️
- README mentions Next.js 15 but `package.json` uses `next@16.0.6` — check for any API mismatches if you upgrade or add features relying on particular Next APIs.
- Password fields are `select: false` in the `User` model; route handlers call `.select('+password')` when validating login.
- No automated test framework configured in the repo — add test setup if you need endpoint/unit tests.
- The app uses Vietnamese UI copy and `₫` currency formatting in many components — prefer locale-aware formatting when adding related features.

## Where to look first (priority files) 🔍
- `package.json`, `README.md`, `QUICKSTART.md` (setup & scripts)
- `tsconfig.json` (path alias `@/`)
- `src/lib/db.ts`, `src/lib/auth.ts` (DB/auth helpers)
- `src/app/api/**` (route handlers)
- `src/models/*` (Mongoose models)
- `src/stores/*` (Zustand stores)
- `src/components/*` (UI components)

---
If anything above is unclear or you'd like more examples (e.g., request/response samples for specific endpoints, or conventions for adding middleware), tell me which area to expand and I'll iterate. ✅