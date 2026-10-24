import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { countryDataPath, countryForRecord, recordBelongsToCountry, enrollmentOpen, partnerEnrollmentOpen } from '../lib/countries.ts';

test('legacy records belong only to the Bangladesh pilot', () => {
  assert.equal(countryForRecord(undefined), 'BD');
  assert.equal(countryForRecord(null), 'BD');
  assert.equal(recordBelongsToCountry({}, 'BD'), true);
  assert.equal(recordBelongsToCountry({}, 'IN'), false);
  assert.equal(recordBelongsToCountry({}, 'PK'), false);
});

test('explicit country codes never cross into another country', () => {
  for (const country of ['BD', 'IN', 'PK']) {
    assert.equal(countryForRecord(country), country);
    for (const other of ['BD', 'IN', 'PK']) {
      assert.equal(recordBelongsToCountry({ country }, other), country === other);
    }
  }
});

test('invalid country values fail closed', () => {
  for (const value of ['XX', 'Bangladesh', 123, false]) {
    assert.equal(countryForRecord(value), null);
    assert.equal(recordBelongsToCountry({ country: value }, 'BD'), false);
  }
});

test('new country enrollment stays closed during the foundation work', () => {
  assert.equal(enrollmentOpen('BD'), true);
  assert.equal(enrollmentOpen('IN'), false);
  assert.equal(enrollmentOpen('PK'), false);
  assert.equal(partnerEnrollmentOpen('BD'), true);
  assert.equal(partnerEnrollmentOpen('IN'), false);
  assert.equal(partnerEnrollmentOpen('PK'), false);
});

test('new countries use separate database collections while Bangladesh stays backward compatible', () => {
  for (const collection of ['donors', 'hospitals', 'bloodRequests', 'messages']) {
    assert.equal(countryDataPath('BD', collection), collection);
    assert.equal(countryDataPath('IN', collection), `countryData/IN/${collection}`);
    assert.equal(countryDataPath('PK', collection), `countryData/PK/${collection}`);
  }
});

test('the local emulator flag cannot open production enrollment', () => {
  for (const [mode, expected] of [['development', true], ['production', false], ['test', false]]) {
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', `import { enrollmentOpen, partnerEnrollmentOpen } from './lib/countries.ts'; console.log(JSON.stringify([enrollmentOpen('IN'), partnerEnrollmentOpen('PK')]))`], {
      cwd: new URL('..', import.meta.url), encoding: 'utf8',
      env: { ...process.env, NODE_ENV: mode, NEXT_PUBLIC_USE_FIREBASE_EMULATORS: 'true', NEXT_PUBLIC_ENABLED_COUNTRIES: '' },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), [expected, expected]);
  }
});

test('production enrollment opens only for explicitly selected countries', () => {
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', `import { enrollmentOpen, partnerEnrollmentOpen } from './lib/countries.ts'; console.log(JSON.stringify(['BD', 'IN', 'PK'].map(country => [enrollmentOpen(country), partnerEnrollmentOpen(country)])))`], {
    cwd: new URL('..', import.meta.url), encoding: 'utf8',
    env: { ...process.env, NODE_ENV: 'production', NEXT_PUBLIC_USE_FIREBASE_EMULATORS: 'false', NEXT_PUBLIC_ENABLED_COUNTRIES: 'IN' },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), [[true, true], [true, true], [false, false]]);
});
