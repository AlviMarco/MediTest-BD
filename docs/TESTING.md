# Testing Checklist

## Automated

```powershell
npm.cmd run build:api
npm.cmd run build:admin
npm.cmd run test:api
```

Flutter CLI is required for mobile checks:

```powershell
flutter analyze
flutter test
```

## Manual Smoke Test

- Register a new user from the mobile app.
- Login from the mobile app.
- Become a blood donor.
- Search blood donors by blood group and district.
- Login to admin panel.
- Open dashboard pages on desktop and mobile width.
- Create or update one hospital/test/medicine record.
- Confirm protected admin routes reject a normal user token.

## Regression Areas

- Login/logout token storage.
- Referral code registration.
- Blood donor 90-day cooldown.
- Medicine order coupon calculation.
- Booking status changes.
- Admin responsive navigation.
