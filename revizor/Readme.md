# Revizor

Development environment and build system for web frontend applications, with
the purpose of creating multi-page static websites with reusability mechanisms.

Library `lit.dev` is used for writing web components.

Supported actions:

* `build`, create deployable artefacts
* `dev`, start development server and listen for code changes
* `start`, synonym for `dev`
* `test`, run unit tests inside a web browser
* `e2e`, run E2E tests

JavaScript and CSS compiler is based on the `esbuild` project, while templates
are based on `handlebars`.

This development environment expects a certain folder structure.

See [Usage](Usage.md) for more information.

