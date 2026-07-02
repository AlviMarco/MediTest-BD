# Deployment

## API

Recommended platforms: Render, Railway, Fly.io, AWS, or any Node.js host with PostgreSQL network access.

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
