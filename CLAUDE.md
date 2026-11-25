# Nastiia's Gallery

React + Vite + Tailwind CSS design prototype of the Nastiia's Gallery website. The real application is a Laravel/Inertia project; this prototype mirrors its frontend without a backend.

## Development Server

Run `pnpm dev`. Vite serves the app on port 8444 (`vite.config.ts`).

## Project Structure

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx`
- `src/App.tsx` - Hash-route switch, route guards, artwork modal and toaster
- `src/pages/` - `home.tsx`, `gallery.tsx`, `auth/*` (login, register, password reset, email verification, two-factor, confirm password) and `settings/*` (profile, security, appearance)
- `src/layouts/` - Auth and settings layouts
- `src/components/` - Header, footer, filter bar, artwork modal, account/security components; `ui/` holds the small UI primitives
- `src/lib/` - `i18n.ts` (translations), `router.ts` (hash routes), `demo-store.ts` and `demo-auth.ts` (localStorage stand-ins for the backend), `appearance.ts` (light/dark), `toast.ts`, `utils.ts`
- `src/locales/` - English and Ukrainian strings, exported from the main project's `lang/*/ui.php`
- `src/data/artworks.ts` - The demo collection
- `src/index.css` - Tailwind v4 import, fonts, palette tokens (light + `.dark`) and animations
- `index.html` - Vite HTML shell
- `ontwerp-overdracht.html` - Design handoff document

## Dependencies

- Runtime: React 19, framer-motion, lucide-react, clsx + tailwind-merge, class-variance-authority, input-otp, qrcode
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling

Tailwind CSS v4 runs through `@tailwindcss/vite`; there is no Tailwind config or PostCSS config. Global CSS, fonts and theme tokens live in `src/index.css`. Keep CSS `@import` statements first, then `@font-face` rules.

## Demo behaviour

There is no server. Accounts, likes, comments, two-factor secrets and passkeys are stored in localStorage, and no emails are sent. Two-factor codes are real TOTP codes checked in the browser; passkeys use WebAuthn without server-side signature verification.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings.
- Ensure JSX tags are closed and braces are balanced.
- Export page and layout components as default exports.
