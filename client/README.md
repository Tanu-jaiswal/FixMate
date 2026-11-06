# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## API configuration

The frontend reads `VITE_API_URL` as the backend URL and adds exactly one `/api`
to API requests. A trailing slash and an optional trailing `/api` are removed
before requests are built. For local development, requests use
`http://localhost:5000` when the variable is not set. Production builds default
to the deployed FixMate backend; localhost is never used in production.

For Vercel, add this environment variable to the project for the environments
you deploy, then redeploy:

```text
VITE_API_URL=https://fixmate-backend-0cyg.onrender.com
```

The recommended value is the backend origin without `/api`.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
