# Retrovizor.xyz

Bla bla, Retrovizor.xyz website built with revizor

## TODO

* ~Phase 1: simple build system~
* ~Phase 2: design prototype~
* ~Phase 3: code extraction: library and web components with test mechanisms~
* ~Phase 4: content & pages, incl. related logic~
* ~Phase 5: Add single E2E test - user journey~
* Phase 6: code fine-tune
    * Standardize function comments; explain params and return values (JSDoc)
    * Apply patterns from the Declarative text and coding style (CSS is done)
* Phase 7: UI fine-tune
    * **UI Style: terminal + markdown + code editor aesthetics + programming languages in eigengrau palette** Programming aesthetics in eigengrau scheme
    * General: loading state: block loading for web components by adding CSS rules to the main file OR loading overlay that's removed on DOMContentLoaded
    * Homepage: make loading state nice
    * Homepage: what to do in case of an error during CloseYourEyes generating error?
    * ImageDegradator: merge input image preview and upload image control
    * CloseYourEyes art: what about those damn lines? Make them breathe
    * CloseYourEyes/ImageDegradator: responsive experiment controls
    * Main nav elements, specially on the homepage, look strange with underline text? Maybe add block color behind each link?
    * Nav difference between active and non-active is bleak and weak
    * Homepage: hide everything except animation if user is idle
    * Try `text-align: justify` for long text? Looks good, but should be careful to expand sentences which seem empty.
    * Basic background color, font color, and font family; alongside some basic positioning should be placed in the `index.html` file - for instant brand elements during the initial loading
    * Transitions
    * Assets
    * Favicons
    * SEO
* Phase 8: content fine-tune
    * Adjust dates everywhere
    * Go through texts
        * Native web:
            * **Maybe the idea is to present limitations, and build system workarounds for current native web technologies?**
                * For example, precomposed web components since it's heavy to load the library, relying on SSR, sweet spot between bundles and native ES modules?
            * Architecture: explain approach with index/layout/views + library
            * Approach: crafting a build system
        * Declarative Javascript
            * Define readable code and context at the beginning: working in large teams, where team members change,... workplace/industry context
    * Go through code (in text pages, user-facing content) and coding styles
    * Go through user page
    * Proofreading
    * Add link to gist "Code Poetry"
* Phase 9: run Lighthouse and similar dev tools to ensure website quality
    * For example, HTML validator
    * Check which attributes to put on `<link>` and `<script>` elements
    * Head (`<meta>`) tags
    * Don't forget to run this on every page since this is not a SPA
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
    * How to collect visit stats?
* Phase 12: cycle of improvements from backlog after the first feedback

### Roadmap stuff (not part of the first version)

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
