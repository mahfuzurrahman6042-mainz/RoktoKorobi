# Consent-based pilot security rollout

This is a release checklist, not permission to publish the draft rules. The live
Realtime Database rules remain separate from `database.rules.json` until they
are tested and deliberately deployed.

## Before publishing

1. Keep the exported database JSON private and out of GitHub and outreach files.
2. Confirm the super-admin UID in Firebase Authentication > Users. The exported
   profiles contain duplicate records for the admin email, so do not infer a UID
   from profile email alone.
3. In Realtime Database > Data, set `security/superAdminUid` to that exact UID
   using the Firebase Console. Verify it again before tightening rules. Do not
   expose a service-account key or put the UID in a client-editable role field.
4. Have the Moonlight leader create and verify their own account. Never create a
   password for them or send one over WhatsApp/email.
5. Test draft rules with anonymous, unverified, student, partner leader, and
   super-admin identities. Check allowed reads *and* denied reads/writes.
6. Review existing donor/request/chat screens affected by denied full-collection
   reads. The donor directory and new chat writes are intentionally paused in
   this pilot rule set; do not market them as functioning.

## Cutover

1. Announce a short maintenance window and pause invitations.
2. Publish tested Realtime Database rules, then deploy the matching app build.
   A partial cutover may temporarily deny some features. Never restore the old
   public-root rules as a rollback.
3. Test the deployed partner invitation link, consent boxes, verification
   email, login, partner dashboard, and super-admin activation with consenting
   test accounts. Test that ordinary users cannot read another profile or
   perform admin actions.
4. Only then distribute the first small invitation batch.

## Known follow-ups

- Two legacy profiles in the provided backup lack current consent flags and a
  stored UID. They need a reviewed re-consent/repair process, not assumed consent.
- Partner dashboard aggregate stats need an admin-maintained or trusted-server
  sync. Until then they show `Pending sync` rather than invented counts.
- Public partner applications, bulk account creation, and legacy partner
  approval APIs are closed for the pilot. Onboard partners from the protected
  super-admin activation page after their leader self-registers.
- Account deletion, donor-directory opt-in, consented messaging/notifications,
  and medical screening require separate review before being promised.
