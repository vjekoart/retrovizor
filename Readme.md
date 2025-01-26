# Retrovizor.xyz

Bla bla, Retrovizor.xyz website built with revizor

## TODO

* ~Phase 1: simple build system~
* ~Phase 2: design prototype~
* ~Phase 3: code extraction: library and web components with test mechanisms~
* ~Phase 4: content & pages, incl. related logic~
* ~Phase 5: Add single E2E test - user journey~
* ~Phase 6: code fine-tune~
* Phase 7: UI fine-tune
    * Philosophy: programming aesthetics in eigengrau scheme
        * Terminal fonts and feeling
        * Markdown code inspiration for exposing "bare-bones" - code
        * Code editor colors and symbols
    * General
        * Title and navigation
            * Non-homepage: they should be header of the "machine"
            * Programming code - grammar machine?
            * Rework/revisit, e.g. for title instead of text use SVG if needed
        * Different accent color? Maybe more colors?
        * Font? Maybe another font?
        * Try `text-align: justify` by modifying some paragraphs and check behaviour on different screens. Is it worth it?
    * Homepage
        * Improve loading (default) state (part of the title+nav machine)
        * Improve the animation by improving lines and fine-tunning
    * Code
        * Responsive experiment controls
        * Fine tune experiment controls UI/UX
        * Fine-tune UI/UX of Image Degradator
        * Fine-tune UI/UX of Close Your Eyes
    * Block loading for web components
        * By adding CSS rules to the main file OR loading overlay that's removed on DOMContentLoaded
    * Post
        * Responsiveness / cross-browser testing
        * Favicons
        * Transitions
        * Assets optimization and download
        * SEO and accessibility
        * Basic background color, font color, and font family; alongside some basic positioning should be placed in the `index.html` file
* Phase 8: content fine-tune
    * Adjust dates everywhere
    * Go through texts
        * Native web:
            * **Maybe the idea is to present limitations, and build system workarounds for current native web technologies?**
                * For example, precomposed web components since it's heavy to load the library, relying on SSR, sweet spot between bundles and native ES modules?
            * **Maybe the idea is to talk about native web frontend and Revizor?**
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

* A strange bug where `close-your-eyes.worker.js` doesn't work for `native` build type, but `image-degradator.worker.js` works as expected (most probably affects Revizor)
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
