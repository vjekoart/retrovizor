# Retrovizor.xyz

This organization represents a single component in the "product codebase organization approach".
 
Since the goal is to have a central point from which the whole codebase is deduced, an entry point must contain all logic necessary for management and communication with the component.

This is a simple use case, since static frontend doesn't really communicate with the rest of the ecosystem - maybe via some REST API calls - but only by sending messages, not listening.

The advantage of this example is that I can focus on other aspects of the system, management: development, building, testing, deploying,...

Inspired by [Product codebase organiztion](https://gist.github.com/vjekoart/83f0e90fc2c1a5e45932414ddbf5d04d).

## TODO

* ~Phase 1: simple build system~
* ~Phase 2: design prototype~
* Phase 3: code extraction: library and web components with test mechanisms
    * Extract existing HTML/CSS/JS code in the app to the library
        * Use `typography.css` to define H-elements, P; use web components only to override those styles
    * Clean `index.bits.js` by moving general stuff to `library.js`
* Phase 4: content & pages, incl. related logic eg view-specific styles/scripts
    * First logic, then focusing on the content
* Phase 5: Add single E2e test - user journey (Jasmine, BDD)
* Phase 6: code fine-tune (decoupling, style, remove comments, optimisations)
    * Phase 6.1: Visit stats: add a service/component (restructure FE into component), produce single publicly available JSON file with statistics per month, one endpoint to collect stats : maybe just a nginx configuration files?
    * General: apply patterns from the article Declarative thinking
    * Animation: loading state, computation logic to worker, rAF
    * Animation: what about those damn lines? Make them breathe
* Phase 6.1: build system fine tune
    * Remove `*.test.*` files and test utilities from JS build functions (both actual test code, and test utilities)
* Phase 7: UI fine-tune (transitions, assets, favicons, SEO,...)
    * Title should transition and become part of the nav, max-width to read exp
    * Try `text-align: justify` for long text
    * Basic background color, font color, and font family; alongside some basic positioning should be placed in the `index.html` file - for instant brand elements during the initial loading
* Phase 8: run Lighthouse and similar dev tools to ensure website quality
* Phase 9: structure and clean `Readme.md`
* PUBLISH
* Phase 10: cycle of improvements from backlog after first feedback

### Roadmap stuff (not part of the first version)

* Environment
    * Migrate to TypeScript
    * Add `lint` action that lints the whole codebase
* Build system
    * Compare `buildType:native` and `buildType:bundle` performance
    * `buildType`: for now native web module, but later enable bundling
    * `buildType: native` if dependency starts with `node_modules` copy from there, if it starts with `assets` copy from the assets folder
    * Improve error reporting, e.g. for CSS, don't die when there's an error
    * Handle file rename in the loop
    * Add something like `npm run dev:test` to support test development
    * Add support for multiple CSS and JS files on the app level
    * Performance
        * Try streams instead of `writeFile` and similar to improve performance 
        * Try keeping open handles in dev mode to decrease rebuild time
        * `buildLibrary|buildScripts|buildStyles` in `dev` mode
            * Recompile only affected file, create bundle if not `native`, and move affected file or the whole bundle to dist
        * Simplify component `index.js` file by removing the need to provide low level detail tech stuff

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

### Notes

* Tests: files with `*.unit.test.js` are run as basic unit tests, while files with `*.component.test.js` are run inside a web browser