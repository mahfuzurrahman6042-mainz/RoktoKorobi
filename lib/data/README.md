# Country service areas

`country-areas.json` is generated from the GeoNames `cities5000` and
`admin1CodesASCII` exports using `scripts/generate-country-areas.mjs`.

Source: [GeoNames export](https://www.geonames.org/export/). Licence: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
GeoNames provides the data as-is; these city points are approximate service-area
centres, not a donor's address. Credit GeoNames wherever these areas appear on a map.

To refresh, download both source files from the GeoNames export, then run:

`node scripts/generate-country-areas.mjs cities5000.txt admin1CodesASCII.txt`
