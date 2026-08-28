# Virginia Autism Spectrum Services website

This repository contains the VASS React/Vite website and Firebase parent document portal.

## Important: opening `index.html`

The root `index.html` is a Vite source entry, not a standalone webpage. Double-clicking it in File Explorer will not load the application because the browser cannot compile the React/TypeScript source or resolve the production routes.

Use the production build for publishing:

```text
npm install
npm run build
```

The deployable static website is created in `dist/`. The Firebase backend configuration, security rules, Functions, and staff-access utility are documented in `docs/FIREBASE-PORTAL-OPERATIONS.md`.

## Verification

```text
npm test
npm run build
npm --prefix functions test
npm --prefix functions run build
```
