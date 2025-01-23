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
* ~Phase 5: Add single E2E test - user journey~
* Phase 6: code fine-tune
    * Visit stats: add a service/component (restructure FE into component), produce single publicly available JSON file with statistics per month, one endpoint to collect stats : maybe just an nginx configuration files?
    * CloseYourEyes
        * Create `retro-experiment-control` web component for experiment settings and control
            * Integration with CloseYourEyes view
        * Loading state homepage: bright dot
        * Loading state ClseYourEyes: text
        * Homepage: limit animation size to full HD, don't break someones PC
        * Homepage/CloseYourEyes: handle error state (just log and keep a placeholder) (For homepage always show bright dot)
        * Code todos
        * Dot size: default 1px, but possible to increase so the animation is more pixelated and less-heavy?
    * Build system tests: when build type is `native-library-bundle` then create bundles in library when running tests, see `retro-experiment-control.js`
    * Write tests for worker files
    * Templates/views: like in Prospekt, single file with HTML/CSS/JS: build system should resolve CSS, babel-ify JS and similar, goal is to reduce load time by reducing number of requests to 1 (I can simplify `src/views` file structure)
        * Enable source maps, possible because `sourceMappingURL=index.js.map`
    * Move `library.*` files from the root directory to `revizor/` folder, including the main `index.js` file, and expose something like `revizorFrontend()` so there's minimal code in the root `index.js` file - feeling should be as if I am using a library for building the app
        * What to do with `deploy` and `start` actions in `index.js`?
        * Add `revizor/Readme.md` and extract relevant stuff there
    * ---
    * TODOs in the code, console outputs
    * Standardize function comments; explain params and return values (JSDoc)
    * Apply patterns from the text Declarative thinking and coding style
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
    * Structure and clean `Readme.md`
    * Enable GitHub workflow for PRs (tests for now)
* Phase 11: public image
    * Revise (delete and archive) GitHub repositories
    * Revise (delete and make private) gist.github
    * Revise LinkedIn and update links
    * Revise GitHub profile and update links
* PUBLISH
    * Rename instagram to retrovizor.xyz and update info - the same day the website is published
* Phase 12: cycle of improvements from backlog after the first feedback

### Roadmap stuff (not part of the first version)

* Prioritise for Filthy Fingers (focus on performance)
    * Precompose some web components during the build: for marked, logicless components, create full HTML/CSS on the server-side so TTI is as small as possible (like navigation and title components)
* Website functionalities
    * Add support for linkable headings
    * Add support for "Table of contents" on text pages
* Environment
    * Migrate to TypeScript
    * Add `lint` action that lints the whole codebase
    * Dockerisation
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
* Testing
    * Complete test coverage for services and components
    * Enable tests for views, and maybe templates?

## Configuration

```json
{
    "buildType": "native|native-library-bundle"
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

### Known limitations / Problems

* Build system: in the `dev` mode, when removing a file from `src` directory, the file won't be removed from the `dist` folder. User needs to manually stop the `dev` mode, delete the `dist` folder, and start again.
* Build system: in case of a compliation/transpilation error, the process will die.
* Build system: native: it's not possible to have URL/view with name `templates`, or `library`, or `assets` since these folders are reserved for code. Doesn't sound very good.
* Build system: native: when adding a dedicated script and style file for homepage view (`src/views/index.html`), using `viewStyle` and `viewScript`, files should not be named `index.js` or `index.css`, because those file names are reserved for `src/index.js` and `src/index.css` files - global style/script files that are loaded on every page.

## Stuff

* Author bla bla
* License is MIT or something bla bla
* Contributions, comments, opinions are welcome bla bla
