// One-time, reproducible import of GeoNames cities5000 and admin1CodesASCII.
// Source: https://download.geonames.org/export/dump/
// Licence: CC BY 4.0 — https://www.geonames.org/export/
// Run: node scripts/generate-country-areas.mjs <cities5000.txt> <admin1CodesASCII.txt>
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const [citiesFile, adminFile] = process.argv.slice(2);
if (!citiesFile || !adminFile) throw new Error('Provide both GeoNames input files.');

const regions = new Map(readFileSync(adminFile, 'utf8').trim().split(/\r?\n/).map(line => {
  const [code, name] = line.split('\t');
  return [code, name];
}));

const result = { IN: [], PK: [] };
for (const line of readFileSync(citiesFile, 'utf8').trim().split(/\r?\n/)) {
  const fields = line.split('\t');
  const country = fields[8];
  if (country !== 'IN' && country !== 'PK') continue;
  const [id, name] = fields;
  const lat = Number(fields[4]);
  const lng = Number(fields[5]);
  const region = regions.get(`${country}.${fields[10]}`) || fields[10];
  if (!/^\d+$/.test(id) || !name || !region || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
  result[country].push({ id, name, region, lat, lng });
}
for (const country of ['IN', 'PK']) {
  result[country].sort((a, b) => a.region.localeCompare(b.region) || a.name.localeCompare(b.name));
}

const outputFile = resolve('lib/data/country-areas.json');
writeFileSync(outputFile, `${JSON.stringify(result)}\n`);
console.log(`Generated ${result.IN.length} India areas and ${result.PK.length} Pakistan areas at ${outputFile}`);
