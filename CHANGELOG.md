# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-07-27

### Changed

- README: badges on separate rows (npm dw/dm/dy like tranzilajs, stars last)
- README: dataset links on data.gov.il, Car check demo link, related links section
- README: full plate lookup example (all query helpers for one plate)
- Added `examples/full-plate-lookup.mjs` runnable script

## [0.1.0] - 2026-07-27

### Added

- CKAN `datastore_search` client returning the official JSON envelope (`success`, `result`, `error`)
- `buildDatastoreSearchUrl` with correct single-pass filter encoding
- `RESOURCES` constant with known data.gov.il vehicle dataset IDs
- Typed query helpers for active registry, fallback registries, recalls, WLTP, mileage, ownership, and disabled parking permit
- Record types for all supported datasets
- ESM + CommonJS builds with bundled TypeScript declarations
- Vitest unit tests and GitHub Actions CI (lint, typecheck, test, build)

[0.1.1]: https://github.com/NirTatcher/israel-vehicle-open-data/releases/tag/v0.1.1
[0.1.0]: https://github.com/NirTatcher/israel-vehicle-open-data/releases/tag/v0.1.0
