# India and Pakistan owner-directed live rollout — 25 October 2026

The owner explicitly authorized the Vercel and Firebase production changes for both countries. The release check accepts the documented `owner-authorized-rollout` state, but **does not represent completed owner acceptance, legal clearance, or medical review**. Both manifest records retain `manualAcceptance: pending-owner-test` and `endToEndTestReport: null`.

## Live changes and read-back

- Vercel Production Config `NEXT_PUBLIC_ENABLED_COUNTRIES` was set to `IN,PK`; it is public build configuration, not a secret. The Git-connected production deployment `dpl_7ytddTYSvZUXptQLKvNqzJJe3FJW` built commit `543d9ce9` successfully and received both `www.roktokorobi.org` and `roktokorobi.org` aliases.
- Firebase Realtime Database `settings/countryLaunch/IN` and `/PK` were set to `true`. CLI read-back returned `{"IN":true,"PK":true}`. `settings/countryNotifications` returned `null`, so country-specific push alerts remain disabled.
- On the live donor-registration page, the country options BD, IN and PK were enabled. Selecting IN or PK showed country-specific location fields and policy links. The ordinary-account page showed India policies when IN was selected. The partner-leader page showed the correct India and Pakistan policies when those countries were selected.
- On the live domain, `/`, `/register`, `/signup`, `/partner-account`, `/partner-request`, `/request`, `/donors` and all four country policy routes returned HTTP 200; `/local-testing` returned HTTP 404. Vercel's error-level deployment log query for the last hour found no logs.

## Checks completed before activation

- `node scripts/check-country-release.mjs` passed for IN and PK with explicit warnings about the missing service address, independent medical-safety review, and pending live acceptance.
- `npm run test:rules` passed (1 integrated suite); 21 country, stats, partner-metrics and notification-payload tests passed; `npm run lint` passed.
- In the local Firebase emulator, a Pakistan leader submitted a synthetic request through the browser; it appeared in the Pakistan request list as pending. After switching the same browser to an India leader, the Pakistan request did not appear. No real patient information or production test account was created.

## Not yet verified or enabled

- No genuine India or Pakistan signup, email verification, partner activation, donor-map consent/withdrawal, or real blood-request workflow has been completed in production. The owner must perform and record live acceptance in both countries; do not claim full end-to-end verification yet.
- Firebase Cloud Functions still require a Blaze-plan upgrade in this project. Automatic country count refresh and cross-user push alerts are unavailable; country alert switches remain unset. Existing super-admin manual count refresh remains the available path.
- A physical operator service address and independent medical-safety review were not supplied. The release check warns; it does not claim these matters have been resolved. Local legal and medical applicability is not determined by the technical rollout.

If live testing reveals cross-country data exposure, broken signup, or a request-safety issue, set the affected `settings/countryLaunch/IN` or `/PK` value to `false` and investigate before re-enabling it. Because the Vercel build flag remains enabled until a new deployment, the UI country choice may still display while Firebase blocks new records; communicate that clearly during any rollback.
