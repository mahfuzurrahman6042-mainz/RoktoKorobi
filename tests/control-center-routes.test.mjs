import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activeSection, sectionPages } from '../components/admin/control-center-routes.ts';

test('every linked super-admin page belongs to its parent menu section', () => {
  for (const [section, pages] of Object.entries(sectionPages)) {
    for (const page of pages) assert.equal(activeSection(page.href), section, page.href);
  }
});

test('legacy overview and partner routes keep the right menu active', () => {
  assert.equal(activeSection('/super-admin/overview'), '/super-admin');
  assert.equal(activeSection('/super-admin/partner-institutes'), '/super-admin/partners');
  assert.equal(activeSection('/super-admin/partner-onboard'), '/super-admin/partners');
});
