# Security Notes

Implemented in this production copy:

- JWT guard is global, with `@Public()` only for intended public routes.
- Role guard is global; admin operations use `@Roles(...)`.
- Helmet security headers are enabled.
- API rate limiting is enabled with `@nestjs/throttler`.
- CORS is controlled by `CORS_ORIGINS`.
- Request validation rejects unknown fields.
- Secrets are environment variables and ignored by git.
- Database auto-sync is disabled automatically when `NODE_ENV=production`.

Before launch:

- Rotate the prototype JWT secret and database password if they were shared.
- Use HTTPS only for deployed API/admin.
- Restrict production CORS origins to real domains.
- Add database migrations before changing production schema.
- Review app store privacy policy text for phone numbers, location/address data, health-adjacent data, and blood donor availability.
