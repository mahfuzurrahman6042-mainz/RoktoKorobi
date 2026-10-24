import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const areas = JSON.parse(readFileSync(new URL('../lib/data/country-areas.json', import.meta.url), 'utf8'));

test('offline India and Pakistan areas are separate, unique, and have usable centroids', () => {
  assert.ok(areas.IN.length > 1000);
  assert.ok(areas.PK.length > 100);
  for (const country of ['IN', 'PK']) {
    const ids = new Set();
    for (const area of areas[country]) {
      assert.match(area.id, /^\d+$/);
      assert.ok(!ids.has(area.id));
      ids.add(area.id);
      assert.ok(area.name && area.region);
      assert.ok(Number.isFinite(area.lat) && area.lat >= -90 && area.lat <= 90);
      assert.ok(Number.isFinite(area.lng) && area.lng >= -180 && area.lng <= 180);
    }
  }
});
