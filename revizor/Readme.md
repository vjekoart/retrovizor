# Revizor

* Explain purpose
* Explain philosophy behind Revizor (SSR + native + library + views)

---

This organization represents a single component in the "product codebase organization approach".
 
Since the goal is to have a central point from which the whole codebase is deduced, an entry point must contain all logic necessary for management and communication with the component.

This is a simple use case, since static frontend doesn't really communicate with the rest of the ecosystem - maybe via some REST API calls - but only by sending messages, not listening.

The advantage of this example is that I can focus on other aspects of the system, management: development, building, testing, deploying,...

Inspired by [Product codebase organiztion](https://gist.github.com/vjekoart/83f0e90fc2c1a5e45932414ddbf5d04d).

* Philosophy note: no autonmatic linting, care about what you craft.

## Roadmap

## Phase Alpha

* Maybe remove `buildType` property and stick to `native-library-bundle`?
* What to do with `deploy` and `start` actions in `revizor/index.js`?
* Prioritise for Filthy Fingers (focus on performance)
    * Add timestamps to (some) console outputs
    * Extract `revizor` to separate repository
    * Precompose some web components during the build: for marked, logicless components, create full HTML/CSS on the server-side so TTI is as small as possible (like navigation and title components)
* Block loading (preloading) for web components
    * Overlays nor DOMContentLoaded work as expected
    * Check out SSR for lit.dev components
* Compare `buildType:native` and `buildType:bundle` performance
* `buildType`: for now native web module, but later enable bundling
* `buildType: native` if dependency starts with `node_modules` copy from there, if it starts with `assets` copy from the assets folder
* Handle file rename in the loop
* When a file is removed from chokidar, remove that file from dist if present, e.g. user delets a file during development, nothing happens and that file is still present in the dist directory
* Add something like `npm run dev:test` to support test development
* Enable tests for views, and maybe templates?
* Tests: enable running E2E tests in non-headless mode
* Tests: extract and generalise test utilities from `retrovizor/src/library/test.utilities.js`
* Performance
    * Try streams instead of `writeFile` and similar to improve performance 
    * Try keeping open handles in dev mode to decrease rebuild time
    * `buildLibrary|buildScripts|buildStyles` in `dev` mode
        * Recompile only affected file, create bundle if not `native`, and move affected file or the whole bundle to dist
* Environment (limited by Revizor)
    * Migrate to TypeScript
    * Dockerisation

## Phase Beta

* 4 starters: minimal, presentational, app-behind-login, combination of two types
    * Basically every web app is one of those when it comes to structure
* Revizor tests should actually be tests of these 4 starters
* Write unit tests for bits and similar utility functions
* Add app generator, ideally something like configuration+Gherkin expressions that generates (and extends existing!) codebase
    * This is 
* Write E2E tests using Gherkin syntax

## Overview

* Present file structure and explain main points, enough for someone to start

## Configuration

```json
{
    "buildPath": "dist",
    "buildType": "native|native-library-bundle"
    "dataFile": "path/to/data.json",
    "nativeDependencies":
    {
        "lit": "assets/lit-all.min.js"
    }
}
```

## Usage

* `npm run e2e`, make sure to run `npm run build` or `npm run dev` beforehand
* Index library scripts: use `import "Library/configuration.js";` and similar
* Other library and index/layout/views scripts: use `import { x } from "Library";`
* Library CSS: only once include library index CSS file, e.g. in index style. Other library CSS files are included by the library index CSS file. There's not on-demand loading of the library styles.
* There's no content hashing for assets, add versioning manually. For example, `font-file.v01.woff` and similar.
* When adding a template or view script/style, use relative paths in `src` directory. For example, file `src/views/code/image-degradator/image-degradator.js` should be defined in `src/views/code/image-degradator/index.html.hbs` file as `viewScript="views/code/image-degradator/image-degradator.js"`. Same goes for `viewStyle`. For templates, similar, e.g. `templateScript="templates/my-template.js"`.
* [CHECK] It's not possible to load CSS library files from view/template style files. I assume that's because missing import maps when building a bundle library.

### Note on modules in native VS native-library-bundle

```javascript
/* Some file inside a library */

/* Build type is "native"; requires "lit-all.min.js" in "configuration.json" */
import { LitElement, html, css, createRef, ref } from "lit";

/* Build type === "native-library-bundle" */
import { LitElement, html, css } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
```

### Note on testing web workers

The idea is to consume other testable units inside worker files, so they're
not treated as units when it comes to testing.

Their functionality should be covered with E2E tests.

### Workers inside a library

Create workers using resolved URLs from import maps to support build system features:

```javascript
const url = import.meta.resolve( "Library/services/some.worker.js" );
this.worker = new Worker( url, { type : "module" } );
```

Worker specifics:

* Use relative import statements inside a worker, same as in other scripts.
* Convention for worker file names is `*.worker.js`.
* Build system only supports workers inside a library folder.

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
        * about.html   # Transformed to `dist/about/index.html`
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

## Known limitations / Problems

* Build system: in the `dev` mode, when removing a file from `src` directory, the file won't be removed from the `dist` folder. User needs to manually stop the `dev` mode, delete the `dist` folder, and start again.
* Build system: in case of a compliation/transpilation error, the process will die.
* Build system: native: it's not possible to have URL/view with name `templates`, or `library`, or `assets` since these folders are reserved for code. Doesn't sound very good.
* Build system: native: when adding a dedicated script and style file for homepage view (`src/views/index.html`), using `viewStyle` and `viewScript`, files should not be named `index.js` or `index.css`, because those file names are reserved for `src/index.js` and `src/index.css` files - global style/script files that are loaded on every page.

## Stuff

* Author bla bla
* License is MIT or something bla bla
* Contributions, comments, opinions are welcome bla bla
