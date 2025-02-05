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
    * Responsiveness / cross-browser testing
        * Combinations
            * Macos/Chrome
            * Macos/Safari
            * Windows/Chrome
            * Windows/Edge
            * Android Chrome
            * iOS
        * To fix
            * Degradator: increase default, and max limit of factor because photos from phone have huge resolutions
            * Blank: default and max line length, set and limit based on the available canvas width
            * Blank: cannot change background color on Android, maybe somewhere else also? I tried `#161`
            * Blank: disable `Run` button once the animation started
            * General: line below the navigation, always have the same width as content box? or nav items?
            * General: headings: if multiple lines, have padding so everything starts after `#` signs
            * Mobile: add some kind of bottom box-shadow/border on the homepage, so on mobile there's distinction between navigation buttons and animation
            * Mobile landscape: there's a micro gap between navigation and top bar - when scrolling you can see text pixels
            * Android Chrome: 100vh is problematic on homepage, it can scroll and regenerate animation that breaks
        * To discuss
            * Mobile portrait: maybe full-content-width image on the user page? To feel complete?
            * Mobile portrait: maybe decrease gaps in header and around nav? It takes a lot of space
* Phase 8: content fine-tune
    * Adjust dates everywhere
    * Go through texts
        * I need to categorize texts somehow, think in the format of collections or something
        * Native web:
            * **Maybe the idea is to present limitations, and build system workarounds for current native web technologies?**
                * For example, precomposed web components since it's heavy to load the library, relying on SSR, sweet spot between bundles and native ES modules?
            * **Maybe the idea is to talk about native web frontend and Revizor?**
            * Architecture: explain approach with index/layout/views + library
            * Approach: crafting a build system
        * Declarative Javascript
            * Define readable code and context at the beginning: working in large teams, where team members change,... workplace/industry context
            * Maybe completely different approach: text about writing code, declarative, coding style matters, and similar, more abstract, like main philosophy when writing a code
                * "We're writing a book with formulae,..."
                * But better split that into multiple articles, so declarative is one, and (philosophical) text about writing code is another one
    * Go through code (in text pages, user-facing content) and coding styles
    * Go through user page
    * General: I'm not sure `text-align: justify` is going to work, try on multiple devices
        * Check on mobile, fine-tune, then look at mobile and desktop again to see what's happening.
        * Maybe rythm: long words should always be surrounded by short words, to improve `text-align: justify`
    * Proofreading
    * Add link to gist "Code Poetry"
* Phase 9: run Lighthouse to check website quality
    * Check which attributes to put on `<link>` and `<script>` elements
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
    * Make sure that 404 page is working as expected
    * How to collect visit stats?
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
