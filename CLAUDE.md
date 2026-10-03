# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server
- `npm run build` — `tsc -b && vite build` (type-check first, then bundle)
- `npm run lint` — ESLint over the whole repo
- `npm run preview` — serve the production build

There is no test runner configured, so there is no single-test command.

## Architecture

Single-page CRUD for products: React 19 + TypeScript + Vite, Tailwind v4 (via `@tailwindcss/vite`), TanStack Query for server state, TanStack Table for rendering, Zod for validation. UI strings are in Spanish (es-CL, prices formatted as CLP).

Data flow, top to bottom:

- `src/main.tsx` mounts `QueryClientProvider` and `MyCRUD` (there is no `App.tsx`).
- `src/MyCRUD.tsx` is the only stateful container. It owns modal open state, the product being edited (`null` means create mode), and `actionError`. It wires the three mutations to `ProductFormModal` and `ProductsTable`.
- `src/hooks/useProducts.ts` wraps each API function in a TanStack Query hook. All mutations invalidate the single `['products']` query key on success; there are no optimistic updates.
- `src/api/products.ts` holds raw `fetch` calls. Every response is parsed through the Zod schemas, so a server payload that does not match fails at runtime.
- `src/types/products.ts` is the source of truth for types. `Product` and `ProductInput` are inferred from `productSchema` / `productInputSchema` (input = schema minus `id`). Change the shape there, not with hand-written interfaces.

## Gotchas

- The backend is the hosted `my-json-server.typicode.com/nicowxdvd/gProducts` (hardcoded `BASE_URL` in `src/api/products.ts`), which serves the GitHub repo's `db.json`. The local `db.json` is only the seed data for that service and is not served by `npm run dev`. The remote server fakes writes: POST/PUT/DELETE return success but do not persist.
- `ProductFormModal` is keyed by `editingProduct?.id ?? 'new'` in `MyCRUD`, so form state resets by remounting. Keep that key if you change the modal.
- The form keeps values as strings and converts them with `parseEsArNumber` (es-AR format: `.` thousands, `,` decimal) before validating with `productInputSchema`.
- `typescript` is `~6.0` and `eslint` is `^10`. Expect newer config behavior than most online examples.
- The README is the unmodified Vite template and has no project-specific information.
