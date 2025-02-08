# Retrovizor.xyz

Bla bla, Retrovizor.xyz website built with revizor

## TODO

* ~Phase 1: simple build system~
* ~Phase 2: design prototype~
* ~Phase 3: code extraction: library and web components with test mechanisms~
* ~Phase 4: content & pages, incl. related logic~
* ~Phase 5: Add single E2E test - user journey~
* ~Phase 6: code fine-tune~
* ~Phase 7: UI fine-tune~
* Phase 8: content fine-tune
    * Rename `Revizor` to `boring`
    * User
        * General
        * Picture: degrade image, extract face with transparent background
        * Proofreading
    * Text
        * Native web
            * Complete the article based on the guidelines in `native-web-front/index.html.hbs`
            * Proofreading
        * Code readability
            * Fine-tune content, remove `should|must` with `could|can`
            * Go through code (in text pages, user-facing content) and coding styles
            * Proofreading
    * Code
        * Maybe fine-tune list
        * Check text content on experiment views
        * Why should I have link to gists? Why not hosting them on the website?
            * Gists are cool because they're easier to update
            * I can use gists to create and manage content, and have some kind of a script to automatically generate views in the CLI (fetch gist, create HTML, update view file)
        * Add link to gist "Code Poetry|Code Poems", or add a page, see above
        * Proofreading
* Phase 9: run Lighthouse to check website quality: don't forget to run this on every page since this is not a SPA
* Phase 10: repository preparations
    * Structure and clean both `Readme.md` and `revizor/Readme.md`
    * Enable GitHub workflow for PRs (tests for now)
* Phase 11: public image
    * Revise (delete and archive) GitHub repositories
    * Revise (delete and make private) gist.github
    * Revise LinkedIn and update links
    * Revise GitHub profile and update links
* PUBLISH
    * Rename instagram to retrovizor.xyz and update info - the same day the website is published
    * Make sure that 404 page is working as expected
    * How to collect visit stats?
	* Use something like access log parsing - executed by a script on a daily basis and pushed to something like retrovizor.xyz/stats
	* Collect number of views, URL number of views, referer
* Phase 12: cycle of improvements from backlog after the first feedback

### Roadmap stuff (not part of the first version)

* A strange bug where `close-your-eyes.worker.js` doesn't work for `native` build type, but `image-degradator.worker.js` works as expected (most probably affects Revizor)
* Add support for light and dark theme
* Add support for linkable headings
* Add support for "Table of contents" on text pages
* Add support for better color selector in `retro-experiment-control`
* Expand test coverage for services and components
* Environment (limited by Revizor)
    * Migrate to TypeScript
    * Add `lint` action that lints the whole codebase
    * Dockerisation
    * Write E2E tests using Gherkin syntax

## Stuff

* Author bla bla
* License is MIT or something bla bla
* Contributions, comments, opinions are welcome bla bla
