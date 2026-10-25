import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(readFileSync(path.join(root, 'docs/country-release-manifest.json'), 'utf8'));
const requested = process.argv[2]?.toUpperCase();
const countries = requested ? [requested] : ['IN', 'PK'];
const unresolved = /\[(?:NOT SET|PUBLICATION BLOCKER|OWNER|NEEDS|LOCAL LEGAL|MEDICAL|INSERT)|\{\{[^}]+\}\}|NOT EVIDENCED|DRAFT\s*[-\u2013\u2014]\s*NOT EFFECTIVE|^# .+\u2014 DRAFT|^Editorial review revision:/im;
const databaseRules = JSON.parse(readFileSync(path.join(root, 'database.rules.json'), 'utf8'));

function broadPendingRequestRead() {
  const rule = databaseRules.rules?.countryData?.$country?.bloodRequests?.['.read'];
  // A collection-level grant to every verified user in the same country also
  // exposes pending/rejected requests. Client-side filtering cannot undo it.
  return typeof rule === 'string'
    && rule.includes("root.child('users').child(auth.uid).child('country').val() === $country")
    && !rule.includes('query.orderByChild')
    && !rule.includes("data.child('status')");
}

function evidencePath(value, issues, label) {
  if (!value || typeof value !== 'string') { issues.push(`${label}: missing evidence path`); return null; }
  const resolved = path.resolve(root, value);
  if (!resolved.startsWith(`${root}${path.sep}`) || !existsSync(resolved)) {
    issues.push(`${label}: file missing or outside workspace`);
    return null;
  }
  return resolved;
}

function checkCountry(country) {
  const record = manifest[country];
  if (!record) return [`${country}: unknown country`];
  const issues = [];
  if (record.status !== 'release-approved' && record.status !== 'owner-authorized-rollout') issues.push('status is not release-approved or owner-authorized-rollout');
  if (broadPendingRequestRead()) issues.push('database rules expose pending blood requests to all verified users in the same country');
  if (!record.operatorName || !String(record.operatorName).trim()) issues.push('operatorName is missing');
  evidencePath(record.ownerReleaseAuthorization, issues, 'ownerReleaseAuthorization');
  if (!record.operatorAddress) console.warn(`${country}: operator service address not recorded; confirm whether a local disclosure requirement applies`);
  if (!record.medicalSafetyReviewReference) console.warn(`${country}: independent medical-safety review evidence not recorded; do not describe it as completed`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(record.effectiveDate ?? '') || Number.isNaN(Date.parse(`${record.effectiveDate}T00:00:00Z`)) || new Date(`${record.effectiveDate}T00:00:00Z`).toISOString().slice(0, 10) !== record.effectiveDate) issues.push('effectiveDate must be a valid YYYY-MM-DD date');
  if (!Array.isArray(record.languages) || record.languages.length === 0) console.warn(`${country}: languages not recorded; review informed-access needs before release`);
  for (const kind of ['privacy', 'terms']) {
    const document = record[kind] ?? {};
    if (!document.version) issues.push(`${kind} version is missing`);
    else if (/draft|(?:^|-)H1$/i.test(document.version)) issues.push(`${kind} version is still a review draft`);
    if (!document.contentAuthorizationReference) issues.push(`${kind} content authorization reference is missing`);
    const file = evidencePath(document.path, issues, `${kind} document`);
    if (!file) continue;
    const bytes = readFileSync(file);
    const digest = createHash('sha256').update(bytes).digest('hex');
    if (document.sha256 !== digest) issues.push(`${kind} SHA-256 does not match the approved document`);
    if (unresolved.test(bytes.toString('utf8'))) issues.push(`${kind} contains unresolved draft markers`);
  }
  evidencePath(record.rulesTestReport, issues, 'rulesTestReport');
  if (record.status === 'release-approved') evidencePath(record.endToEndTestReport, issues, 'endToEndTestReport');
  else if (!record.endToEndTestReport) console.warn(`${country}: owner-authorized rollout; live end-to-end acceptance remains pending and must be recorded after activation`);
  if (record.notificationsEnabled === true) evidencePath(record.notificationTestReport, issues, 'notificationTestReport');
  else if (record.notificationsEnabled !== false) issues.push('notificationsEnabled must be explicitly true or false');
  return issues;
}

let blocked = false;
for (const country of countries) {
  const issues = checkCountry(country);
  if (issues.length) {
    blocked = true;
    console.error(`${country}: BLOCKED`);
    for (const issue of issues) console.error(`  - ${issue}`);
  } else {
    console.log(`${country}: ${manifest[country].status === 'owner-authorized-rollout' ? 'owner-authorized rollout checks complete; live acceptance remains pending' : 'manifest complete; human review and live verification are still required'}.`);
  }
}
if (blocked) process.exitCode = 1;
