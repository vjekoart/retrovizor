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
    * User: picture: extract face with transparent background then degrade image so it has a nice outline
    * User: add a real link to Instagram
* Phase 9: Lighthouse optimisations
    * BUG: degradator: downloaded image has buggy file name, for every degradation prefix `.degraded` is added to the file name 
    * ACTION: there's no need for `layout.homepage` because it's used only in once place
    * ACTION: merge `index.css` and `library.css`, AND `index.js` and `library.js` to reduce the number of initial requests; THEN rerun lighthouse
    * ACTION: Polyfills and transforms enable legacy browsers to use new JavaScript features. However, many aren't necessary for modern browsers. For your bundled JavaScript, adopt a modern script deployment strategy using module/nomodule feature detection to reduce the amount of code shipped to modern browsers, while retaining support for legacy browsers.
    * ACTION: User: add width and height attributes to profile image element
    * ACTION: User: serve image in webp format
    * ACTION: User: image should have exact dimensions like when rendered
    * ACTION: Ensure CSP is effective against XSS attacks
    * ACTION: See https://developers.google.com/search/docs/appearance/structured-data
    * ACTION: See http://linter.structured-data.org/
* Phase 10: repository preparations
    * Structure and clean both `Readme.md` and `revizor/Readme.md`: ensure it's in british english
    * Enable GitHub workflow for PRs (tests for now)
* Phase 11: public image
    * Revise (delete and archive) GitHub repositories
    * Revise (delete and make private) gist.github
    * Revise LinkedIn and update links (add link to this website)
    * Revise GitHub profile and update links (add link to this website)
    * Make this repository public
* PUBLISH
    * Deployment
        * Make sure that 404 page is working as expected
        * Add `Cache-Control: max-age=31536000` response header for all static files
        * How to collect visit stats?
    * Rename instagram to retrovizor.xyz and update info - the same day the website is published
	* Use something like access log parsing - executed by a script on a daily basis and pushed to something like retrovizor.xyz/stats
	* Collect number of views, URL number of views, referer
* Phase 12: cycle of improvements from backlog after the first feedback

### Roadmap stuff (not part of the first version)

* A strange bug where `close-your-eyes.worker.js` doesn't work for `native` build type, but `image-degradator.worker.js` works as expected (most probably affects Revizor)
* Add support for light and dark theme
* Add support for linkable headings
* Add support for "Table of contents" on text pages
* Add support for better color selector in `retro-experiment-control`
* Expand styling for code blocks, and transfer content from gist.github.com to standalone pages
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
