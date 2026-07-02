# Deployment

## API

Recommended platforms: Render, Railway, Fly.io, AWS, or any Node.js host with PostgreSQL network access.

### Render Blueprint

This repo includes `render.yaml` at the repository root. In Render, create a new Blueprint from the GitHub repo and select the `main` branch.

Render will create one web service:

- Service name: `meditest-bd-api`
- Runtime: Node
- Health check: `/api/health`
- Build command: `npm run render:build:api`
- Start command: `npm run render:start:api`

When Render asks for environment variables, set:

- `DATABASE_URL`: your production PostgreSQL connection string
- `CORS_ORIGINS`: comma-separated allowed frontend URLs, for example `https://your-admin-domain.com`

Render generates `JWT_SECRET` automatically from the Blueprint. Do not put real secrets in GitHub.

After the deploy succeeds, the backend URL will look like:

```text
https://your-render-service.onrender.com/api
```

Use that value later for:

- Admin: `NEXT_PUBLIC_API_URL=https://your-render-service.onrender.com/api`
- Mobile: `--dart-define=API_BASE_URL=https://your-render-service.onrender.com/api`

Required environment:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `NODE_ENV=production`
- `PORT`
- `CORS_ORIGINS`
- `DB_SSL=true`
- `DB_SYNCHRONIZE=false`
- Prefer `sslmode=verify-full` in the PostgreSQL connection string.

Build and start:

```powershell
npm.cmd --prefix apps/api install
npm.cmd --prefix apps/api run build
npm.cmd --prefix apps/api run start:prod
```

## Admin

Set:

- `NEXT_PUBLIC_API_URL=https://your-api-domain.com/api`

Build:

```powershell
npm.cmd --prefix apps/admin install
npm.cmd --prefix apps/admin run build
```

## Mobile

Build release with:

```powershell
flutter build apk --release --dart-define=API_BASE_URL=https://your-api-domain.com/api
```

For Play Store release, update app id, app icon, privacy policy, signing config, and version/build number.

Android package id is set to `com.meditestbd.app`. Create `apps/mobile/android/key.properties` from `key.properties.example` and point it to your Play Store upload keystore before generating a real release bundle.
