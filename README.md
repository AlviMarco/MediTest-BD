# MediTest BD Production

This folder is the clean production workspace for MediTest BD. The original prototype is kept untouched.

## Apps

- `apps/mobile` - Flutter mobile app for users and blood donor flow.
- `apps/admin` - Next.js admin panel.
- `apps/api` - NestJS API connected to PostgreSQL.

## Quick Start

1. Install Node dependencies:
   ```powershell
   npm.cmd --prefix apps/api install
   npm.cmd --prefix apps/admin install
   ```

2. Create environment files from the examples:
   ```powershell
   Copy-Item apps/api/.env.example apps/api/.env
   Copy-Item apps/admin/.env.example apps/admin/.env.local
   ```

3. Run both backend and admin together:
   ```powershell
   npm.cmd run start:local
   ```

   If the project is already built and you only want a quick restart:
   ```powershell
   npm.cmd run start:local:fast
   ```

4. Or run the backend only:
   ```powershell
   npm.cmd run dev:api
   ```

   If port `4000` is already busy, use:
   ```powershell
   npm.cmd --prefix apps/api run start:clean
   ```

5. Run the admin panel only:
   ```powershell
   npm.cmd run dev:admin
   ```

   If port `3000` is already busy, use:
   ```powershell
   npm.cmd --prefix apps/admin run dev:clean
   ```

If you see `EADDRINUSE` for port `4000` or `3000`, it means that server is already running in another terminal/background process. Use `npm.cmd run start:local:fast` from this folder to cleanly restart both servers.

6. Run the mobile app with the target API URL:
   ```powershell
   flutter run --dart-define=API_BASE_URL=http://10.0.2.2:4000/api
   ```

## Production Notes

- Do not commit `.env` files.
- Set `NODE_ENV=production` for deployed API environments.
- Keep `DB_SYNCHRONIZE=false` in production.
- Set `CORS_ORIGINS` to the deployed admin/mobile web origins only.
- Build mobile release with `--dart-define=API_BASE_URL=https://your-api-domain.com/api`.

## Render Backend Deploy

This repository includes `render.yaml` for deploying the backend API from the `main` branch. In Render, create a Blueprint from this GitHub repo. Render will ask for `DATABASE_URL` and `CORS_ORIGINS`; `JWT_SECRET` is generated automatically.

After Render gives you a backend URL, use it as:

```text
https://your-render-service.onrender.com/api
```

## Vercel Backend Deploy

The backend also supports Vercel through `server.ts` and `vercel.json`. In Vercel, set these environment variables:

```text
DATABASE_URL=your-production-postgres-url
JWT_SECRET=at-least-32-random-characters
JWT_EXPIRES_IN=7d
NODE_ENV=production
API_PREFIX=api
DB_SSL=true
DB_SYNCHRONIZE=false
DB_LOGGING=false
CORS_ORIGINS=https://your-admin-or-mobile-frontend.netlify.app
```

Health check:

```text
https://your-vercel-backend.vercel.app/api/health
```

This endpoint must return JSON. If it shows a Vercel login page, turn off Vercel Deployment Protection for production before using it in the admin panel or mobile app.

## Netlify Frontend Deploy

The root `netlify.toml` deploys the admin panel from `apps/admin`.

Admin Netlify environment:

```text
NEXT_PUBLIC_API_URL=https://your-render-service.onrender.com/api
```

For a separate mobile web/PWA Netlify site, select `apps/mobile` as the package directory. Its `netlify.toml` builds Flutter web.

Mobile web Netlify environment:

```text
API_BASE_URL=https://your-render-service.onrender.com/api
```

For a future Android APK:

```powershell
npm.cmd run build:mobile:apk -- -ApiBaseUrl https://your-render-service.onrender.com/api
```

More detail is in `docs/`.
