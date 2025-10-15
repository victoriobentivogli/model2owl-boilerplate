# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]
### Added
- Generation of the new ReSpec documentation artefact (available through the new
  `generate_jsonld_context` CI job) (TEDM2O-11).
- New subdirectories for input (`respec-resources`) and output (`respec`) data
  related to the ReSpec generation feature (TEDM2O-11).
- New resources needed to demonstrate the ReSpec documentation (TEDM2O-11).
- Dedicated `metadata.json` file describing metadata to be used in the generated
  artefacts (TEDM2O-11).
- Generation of the new JSON-LD context artefact, available through the new
  `generate_respec` CI job (TEDM2O-7).
- Publication of the ReSpec documentation via the GitHub Pages (TEDM2O-11).

### Changed
- Update project to use [model2owl
3.1.0](https://github.com/OP-TED/model2owl/releases/tag/3.1.0)


## [3.0.0] — 2025-03-26
### Changed
- Update project to use [model2owl 3.0.0](https://github.com/OP-TED/model2owl/releases/tag/3.0.0)
- Update GitHub Actions to explicitly pass a namespaces file to model2owl toolkit commands
- Update test files
- Change the versioning scheme to align with the used [model2owl](https://github.com/OP-TED/[model2owl](https://github.com/OP-TED/model2owl)) version