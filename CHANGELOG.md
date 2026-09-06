# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-09-06

### Added

- `RESOURCES.heavyTruck` — active heavy trucks / vehicles without model code (N2/N3, trailers, tractors)
- `HeavyTruckRecord` type, `searchHeavyTruckByPlate()`, and `paginateHeavyTrucks()`

### Documentation

- README: heavy-truck registry in coverage tables
- `examples/full-plate-lookup.mjs`: heavy-truck and two-wheeler fallback chain (aligned with Car check)

## [1.1.1] - 2026-09-02

### Changed

- `datastoreSearch` retries transient HTTP failures (429, 5xx, HTML gateway pages, empty bodies) with backoff instead of crashing on `JSON.parse`

## [1.1.0] - 2026-09-02

### Added

- `paginateDatastore()` async generator for walking CKAN pages with offset/limit
- `paginateActivePrivate()` and `paginateTwoWheelers()` convenience wrappers
- `fields` parameter on `DatastoreSearchParams` for slimmer page payloads
- `RESOURCES.twoWheelers`, `TwoWheelerRecord` type, and `searchTwoWheelersByPlate()`

### Documentation

- README: full coverage table (all 13 resources), grouped query helpers, pagination opts, TypeScript types, public fleet & two-wheelers

## [1.0.0] - 2026-07-27

First stable release.

### Added

- CKAN `datastore_search` client returning the official JSON envelope (`success`, `result`, `error`)
- `buildDatastoreSearchUrl` with correct single-pass filter encoding
- `RESOURCES` constant with known data.gov.il vehicle dataset IDs
- Typed query helpers for active registry, fallback registries, recalls, WLTP, mileage, ownership, and disabled parking permit
- Record types for all supported datasets
- ESM + CommonJS builds with bundled TypeScript declarations
- Vitest unit tests and GitHub Actions CI (lint, typecheck, test, build)
- `examples/full-plate-lookup.mjs` runnable script

### Documentation

- README: badges (npm dw/dm/dy, CI, license, views, stars)
- README: full plate lookup example, datasets table with data.gov.il links
- README: [Car check](https://car-check-il.netlify.app/) as a live example (site only, no app repo link)

## [0.1.0] - 2026-07-27

Initial npm publish (superseded by 1.0.0 — same API).

[1.2.0]: https://github.com/NirTatcher/israel-vehicle-open-data/releases/tag/v1.2.0
[1.1.1]: https://github.com/NirTatcher/israel-vehicle-open-data/releases/tag/v1.1.1
[1.1.0]: https://github.com/NirTatcher/israel-vehicle-open-data/releases/tag/v1.1.0
[1.0.0]: https://github.com/NirTatcher/israel-vehicle-open-data/releases/tag/v1.0.0
[0.1.0]: https://github.com/NirTatcher/israel-vehicle-open-data/releases/tag/v0.1.0
