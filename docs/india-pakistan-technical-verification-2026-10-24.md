# India/Pakistan technical handoff — 24 October 2026

Scope: local manual acceptance using the Firebase Authentication and Realtime Database emulators, plus a 24 October preview/rules deployment addendum. This report does not assert production app deployment, live notification delivery, legal approval, or completion of the owner's manual acceptance.

## Automated checks

| Check | Result | Evidence |
| --- | --- | --- |
| Country, area, counter, partner-impact and notification-payload unit tests | PASS: 21 tests, 0 failures | `node --test tests/countries.test.mjs tests/country-areas.test.mjs tests/country-stats.test.mjs tests/partner-metrics.test.mjs functions/notification-payload.test.js functions/public-stats.test.js` |
| Firebase Realtime Database rules | PASS: 1 integrated suite, 0 failures | `npm run test:rules`, against demo-roktokorobi-rules on 127.0.0.1:9000 |
| Production build | PASS | `npm run build`: compiled, typechecked and generated 83 pages successfully |
| Standalone typecheck | PASS | `npm run lint` (`tsc --noEmit`), exit 0 |
| Local test mode cannot open production enrollment | PASS | The unit suite checks development, production and test environments with the emulator flag present. |
| Test-account route unavailable in production | PASS | HTTP 404 from `http://127.0.0.1:3102/local-testing` using the production build. The temporary production-mode server was then stopped. |

Expected `permission_denied` messages in the rules suite are negative-access assertions, not failed tests.

Tested and deployed rules SHA-256: `3c2fcd356b4a5884ad769577b4d004b8692bd6b2f01086ddf024da4b966f94e8`.

Test suite SHA-256: `d09639f438b407f8ede2b6e8da1bf0891cf4de4d747aa2c963b0e9c1dab5caa4`.

The rules suite covers country isolation, immutable account country, privileged-role protection, partner invitation access, organization-scoped rosters, rejection of extra private fields in projections, pending-request confidentiality, prevention of self-approval, participant-only messages, and no new messages after request closure. For both India and Pakistan, it verifies that roster withdrawal preserves a separately chosen map entry, map withdrawal preserves a separately chosen roster entry, and a suspended leader loses roster access.

## Browser flow evidence

On 23 October, the local browser completed these flows against the demo database:

- India leader sign-in, partner overview and own student roster.
- Pakistan leader account creation, local email verification, and a Pakistan/Lahore organization application.
- Super-admin approval of that application and generation of a localhost invitation containing `country=PK`.
- India donor signup from `TESTINDIA01`, India/Delhi selection, independent map/roster choices, local email verification and arrival at the dashboard.
- On 24 October, an authenticated India donor withdrew their own roster membership while the India leader's student page remained open. The student's name disappeared without reloading the leader page. The synthetic membership was then restored for manual testing.
- On 24 October, a new ordinary India account was created through the local signup page without an 18+ checkbox. The form accepted the India policy choices, wrote to the emulator and advanced to email verification. The emulator generated the verification link.

The browser host reported the tab as hidden during some click checks. Native form submission was used to verify those event handlers and database responses. Ordinary tap/click usability remains part of the owner's manual acceptance; this report does not claim it was fully verified through physical click simulation.

An earlier browser-opening attempt on 24 October did not complete; a later open-page roster-withdrawal test succeeded. Ordinary touch/click usability and the full owner acceptance checklist below remain pending. Existing non-blocking warnings include React 18 deprecation under Next.js 16 and Node module-type inference in the unit-test runner.

## Technical fixes included

- [Database rules](../database.rules.json) restrict India/Pakistan request reads to approved/open queries or the requester's own records; pending/rejected records are not generally readable.
- [Request page](../app/request/page.tsx) uses the corresponding filtered queries, merges duplicates, and limits owner actions in the UI.
- [Partner workspace](../app/dashboard/partner/partner-workspace.tsx) clears previous-account state, ignores stale async loads, and uses a live roster subscription so withdrawals update an open leader page.
- [Partner onboarding](../app/super-admin/partner-onboard/page.tsx) initializes real zero counts for newly created organizations and includes country in invitation links.
- [Partner assets](../app/dashboard/partner/partner-assets.ts) keep demo referral links on localhost. The registration form consumes the country parameter but still validates the invite's actual country.
- [Firebase initialization](../lib/firebase.ts) uses a named demo app and loopback emulators only when local test mode is enabled. It does not initialize live messaging or storage in that mode.
- [Local testing page](../app/local-testing/page.tsx) provides synthetic accounts and emulator verification links. Production access remains disabled.

## Run the manual test workspace

From the repository, use separate terminals:

1. `npm run emulators:country-test`
2. `npm run seed:country-test` (after the emulators say ready)
3. `npm run dev:country-test`

Open **http://127.0.0.1:3101/local-testing**. The portable Java runtime is in the ignored `.local-tools` directory; it is not part of the Git deliverable. A normal Java installation can be used instead. Clean emulator shutdown exports demo state into `.local-tools/country-emulator-data` for the next start.

All seeded accounts use `Local-Only-2026!`:

| Role | Demo email |
| --- | --- |
| Super admin | owner@example.test |
| India leader | india-leader@example.test |
| Pakistan leader | pakistan-leader@example.test |
| India donor | india-student@example.test |
| Pakistan donor | pakistan-student@example.test |

Use separate browser sessions for a leader and donor. Do not enter real patient information or real credentials into this demo environment.

### Manual acceptance still pending

1. Create a fresh account for each country, verify via the local testing page, submit an organization application and approve it as the demo super admin.
2. Open the resulting leader dashboard and use its invitation to register a student. Confirm the country, phone and city remain correct.
3. Confirm only the corresponding leader sees the consenting student; withdrawing roster permission should remove the name without a leader-page reload.
4. Check the donor map, city marker, zoom and map-consent withdrawal separately from the roster choice.
5. Confirm a newly submitted blood request is private to the requester/admin until approved; after approval, verify same-country visibility and cross-country denial.
6. Exercise search, copy link/code, QR/poster/flyer downloads and mobile navigation. Inspect share destinations without sending unsolicited test messages.

## 24 October deployment addendum

- Four English India/Pakistan policy pages were built and verified in the production-mode local build. The built India privacy and Pakistan terms routes returned HTTP 200 without draft labels. The local-only test page returned HTTP 404 in production mode.
- Vercel preview `https://roktokorobi-96sf9th6d-roktokorobi.vercel.app` is READY. Its India privacy page rendered, and its India signup page remained closed because the production country flag was not set. This is not the live production alias.
- The tested Realtime Database rules were deployed to Firebase project `roktokorobi-ea822` on 24 October. A read-back confirmed the country request rule and user validation match the local file. The live `settings/countryLaunch` and `settings/countryNotifications` paths were still unset after deployment.
- A pre-deployment copy of live database rules is stored at `.local-tools/live-rules-2026-10-24.json` (ignored by Git). The Bangladesh homepage and donor page still loaded after the rule deployment; the homepage showed 61 registered users, 38 donors, 1 fulfilled request and 17 partners. Authenticated Bangladesh writes were not live-tested.
- No Cloud Functions were present in the live project. A scoped deployment attempt for the three stats-refresh functions failed because the project requires a Blaze billing-plan upgrade before `artifactregistry.googleapis.com` can be enabled. No Cloud Function or billing upgrade was completed. Automatic country counter refresh and push notifications remain unavailable; do not describe them as live features.
- A fresh `npm run test:rules` check passed (1 suite, 0 failures). The production Vercel environment still had no `NEXT_PUBLIC_ENABLED_COUNTRIES`; Firebase `settings/countryLaunch` returned `null`, and `https://www.roktokorobi.org/india/privacy` returned HTTP 404 before promotion. The local demo server returned HTTP 200 for `/local-testing`, and its emulator launch switch for India was true. Browser automation did not open the local page in this session, so this check adds no completed browser acceptance result.
- The release checker treats an unprovided operator street address and independent medical-review file as warnings, not automatically applicable technical prerequisites. It still fails for both countries because `status` is blocked and a completed end-to-end acceptance report is missing. Neither the warnings nor the failed check are evidence of legal or medical clearance.
- A production-target Vercel artifact was staged with `--skip-domain`: `https://roktokorobi-cilr1k9w9-roktokorobi.vercel.app` (`dpl_GNGXCggD6eBuVFH6hrqmAuvUBEzm`, READY). It is not assigned to `www.roktokorobi.org`; that domain still returned HTTP 404 for `/india/privacy` at verification time. On the staged artifact, the four India/Pakistan policies, `/request`, and `/signup` returned HTTP 200, `/local-testing` returned HTTP 404, and `/api/stats` returned HTTP 200 with the current published Bangladesh counters. This does not prove live India/Pakistan enrollment or complete browser interaction.
- The staged artifact was subsequently promoted to `www.roktokorobi.org` on 24 October. On the live domain, all four policy routes returned HTTP 200, the final India privacy and Pakistan terms version markers were present, `/local-testing` returned HTTP 404, and `/api/stats` returned HTTP 200. Firebase `settings/countryLaunch` still returned `null`, so India/Pakistan enrollment and request posting are not active for live users. This promotion published policy pages only; it did not close the manual acceptance gap or deploy Cloud Functions.

## Remaining deployment boundary

No production enrollment switch was changed in this handoff. The production database rules and a Vercel deployment with final policy pages were released as described above; their new-country signup and request paths remain inactive until the live launch settings are enabled. Real verification-email delivery, push delivery, uploads, deployed cross-account tests and the owner's manual acceptance remain unverified. The four policy files have versioned English content. The owner approved the current versions for publication on 24 October 2026, including their stated effective date, but did not supply a completed live acceptance report. The release checker still blocks both country activations.
