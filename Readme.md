# Retrovizor.xyz

This organization represents a single component in the "product codebase organization approach".
 
Since the goal is to have a central point from which the whole codebase is deduced, an entry point must contain all logic necessary for management and communication with the component.

This is a simple use case, since static frontend doesn't really communicate with the rest of the ecosystem - maybe via some REST API calls - but only by sending messages, not listening.

The advantage of this example is that I can focus on other aspects of the system, management: development, building, testing, deploying,...

Inspired by [Product codebase organiztion](https://gist.github.com/vjekoart/83f0e90fc2c1a5e45932414ddbf5d04d).

## TODO

* ~Phase 1: simple build system~
* ~Phase 2: design prototype~
* ~Phase 3: code extraction: library and web components with test mechanisms~
* ~Phase 4: content & pages, incl. related logic~
* ~Phase 5: Add single E2E test - user journey (Jasmine, BDD)~
* Phase 6: code fine-tune (decoupling, style, remove comments, optimisations)
    * Phase 6.1: Visit stats: add a service/component (restructure FE into component), produce single publicly available JSON file with statistics per month, one endpoint to collect stats : maybe just a nginx configuration files?
    * Performance: `native-library-bundle`: build type where library is bundled, but views and general JS are not -- if this is too slow
    * Add bundle hash to JS/CSS asssets to avoid caching
        * Find a way to use something like import maps for CSS files

            Function `Bits.compileAndMoveStyle` should return an object that
            contains `{ input, output }` path informations, where input is 
            is relative location in `src|dist`, while output is final output
            location in the `dist`, including hash if not in dev mode.

            Library: after calling the `Bits.compileAndMoveStyle` function,
            another function should be called that will get all path information
            as input, and change `@import` statements in the `dist/` directory.

            Function `buildLibrary` should return the `{ input, output }` path
            information for the entry CSS file of the library. That information
            should be provided to the `buildStyles` function, so the main
            `@import` statement for the library CSS file can be changed - same
            function that's used when building a library.

        * Optimise `library.bits.js:getFileHash` function
        * Reduce the hash length
        * Clear `dist/` folder before the build action
        * Use content hashes during the build action
    * Handlebars (generateHTML) error handling in case of syntax error
    * CloseYourEyes: loading state, computation logic to worker, rAF
    * CloseYourEyes: what about those damn lines? Make them breathe
    * ImageDegradator: maybe processing to worker or leave for later?
    * ---
    * Rename `templates` to `layouts` because every template is a layout
    * TODOs in the code, and console outputs and placeholder code (visible in browser console)
    * Apply patterns from the text Declarative thinking
* Phase 7: UI fine-tune
    * **UI Style: terminal + markdown + code editor aesthetics + programming languages in eigengrau palette** Programming aesthetics in eigengrau scheme
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
    * Go through texts
        * Native web: architecture: explain approach with index/layout/views + library
    * Go through code and coding styles
    * Go through user page
    * Proofreading
    * Add link to gist "Code Poetry"
* Phase 9: run Lighthouse and similar dev tools to ensure website quality
    * For example, HTML validator
    * Check which attributes to put on `<link>` and `<script>` elements
    * Don't forget to run this on every page since this is not a SPA
* Phase 10: repository preparations
    * Structure and clean `Readme.md`
* Phase 11: public image
    * Revise (delete and archive) GitHub repositories
    * Revise (delete and make private) gist.github
* PUBLISH
    * Rename instagram to retrovizor.xyz - the same day the website is published
* Phase 12: cycle of improvements from backlog after the first feedback

### Roadmap stuff (not part of the first version)

* Website functionalities
    * Add support for linkable headings
    * Add support for "Table of contents" on text pages
* Environment
    * Migrate to TypeScript
    * Add `lint` action that lints the whole codebase
    * Dockerisation
    * GitHub PR workflow
    * Write E2E tests using Gherkin syntax
* Build system
    * Compare `buildType:native` and `buildType:bundle` performance
    * `buildType`: for now native web module, but later enable bundling
    * `buildType: native` if dependency starts with `node_modules` copy from there, if it starts with `assets` copy from the assets folder
    * Handle file rename in the loop
    * When a file is removed from chokidar, remove that file from dist if present, e.g. user delets a file during development, nothing happens and that file is still present in the dist directory
    * Add something like `npm run dev:test` to support test development
    * Performance
        * Try streams instead of `writeFile` and similar to improve performance 
        * Try keeping open handles in dev mode to decrease rebuild time
        * `buildLibrary|buildScripts|buildStyles` in `dev` mode
            * Recompile only affected file, create bundle if not `native`, and move affected file or the whole bundle to dist
        * Simplify component `index.js` file by removing the need to provide low level detail tech stuff

## Configuration

```
{
    "buildType": "native|native-library-bundle"
}
```

## Usage

* `npm run e2e`, make sure to run `npm run build` or `npm run dev` beforehand
* Index library scripts: use `import "Library/configuration.js";` and similar
* Other library and index/layout/views scripts: use `import { x } from "Library";`
* Library CSS: only once include library index CSS file, e.g. in index style. Other library CSS files are included by the library index CSS file. There's not on-demand loading of the library styles.

## File structure / Architecture (try to keep updated)

```
* dist/                # Generated deployment files
* assets/              # Binaries like fonts and images
* src/
    * index.js         # Executed before each view. Loads scripts from the
                       # library.
    * index.css        # Entry point that's loaded dynamically. Loads styles
                       # from the library.
                       # ...may need more files if SASS+mixins is used
    * data.json        # File or a folder
                       # Data for the generation of public HTML files
    * templates/       # Partials and layouts
                       # This + views generates final HTML files
    * views/           # Views organised in acutal hierarchy of the website
        * index.html   # HTML file that has `<style>` and `<script>` elements
                       # if needed
        * about.html   # Transformed to `dist/about/index.html\
        * ...
    * library/
        * index.js     # Provide entry point, register components, expose and
                       # initialize services and utils.
        * index.css    # Entry point for library styles
        * utilities.js # Stateless, mainly deterministic one-call functions
        * services/    # Class-based files that have some state
        * components/  # From buttons to UI elements like navigation.
        * styles/      # Make possible to import these general styles
                       # from `index.css`
```

### Known limitations / Problems

* Build system: in the `dev` mode, when removing a file from `src` directory, the file won't be removed from the `dist` folder. User needs to manually stop the `dev` mode, delete the `dist` folder, and start again.
* Build system: in case of a compliation/transpilation error, the process will die.
* Build system: native: it's not possible to have URL/view with name `templates`, or `library`, or `assets` since these folders are reserved for code. Doesn't sound very good.
* Build system: native: when adding a dedicated script and style file for homepage view (`src/views/index.html`), using `viewStyle` and `viewScript`, files should not be named `index.js` or `index.css`, because those file names are reserved for `src/index.js` and `src/index.css` files - global style/script files that are loaded on every page.

## Stuff

* Author bla bla
* License is MIT or something bla bla
* Contributions, comments, opinions are welcome bla bla
