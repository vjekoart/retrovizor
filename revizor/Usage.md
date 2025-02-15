# Usage

## Usage via Node API

*Note: installation via NPM not yet possible.*

```javascript
import { FrontendApp } from "./revizor/index.js";

const app = FrontendApp();

export default app;
```

## Configuration

```json
{
    "buildPath": "dist",
    "buildType": "native|native-library-bundle",
    "dataFile": "path/to/data.json",
    "nativeDependencies":
    {
        "lit": "assets/lit-all.min.js"
    }
}
```

## CLI actions

* `npm run dev`
* `npm run build`
* `npm run test`
* `npm run e2e`

## Development & usage notes

* Files `src/index.js` and `src/index.css` are mandatory, they are entry points for creating CSS and JS bundles used on every subpage.
* Before running `npm run e2e` make sure to run `npm run build` or `npm run dev`.
* To use scripts from the library use `import "Library/configuration.js";` and similar.
* There's no content hashing for assets, add versioning manually. For example, `font-file.v01.woff` and similar.

### View script/styles

Use relative paths in `src` directory. For example, file `src/views/code/image-degradator/image-degradator.js` should be defined in `src/views/code/image-degradator/index.html.hbs` as
`viewScript="views/code/image-degradator/image-degradator.js"`. Same goes for `viewStyle`.

The same mechanism applies to templates, e.g. `templateScript="templates/my-template.js"`.

### Modules in native VS native-library-bundle

```javascript
/* Some file inside a library */

/* Build type is "native"; requires "lit-all.min.js" in "configuration.json" */
import { LitElement, html, css, createRef, ref } from "lit";

/* Build type === "native-library-bundle" */
import { LitElement, html, css } from "lit";
import { createRef, ref        } from "lit/directives/ref.js";
```

### Testing web workers

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

## Known problems

* Build system: while in `dev` mode, removing a file from `src` directory won't result with that file being removed from the `dist` folder. User needs to manually stop the `dev` mode, delete the `dist` folder, and start again.
* Build system: native: it's not possible to have URL/view with name `templates`, or `library`, or `assets` since these folders are reserved for code.
* Build system: native: when adding a dedicated script and style file for homepage view (`src/views/index.html`), using `viewStyle` and `viewScript`, files should not be named `index.js` or `index.css`, because those file names are reserved for `src/index.js` and `src/index.css` files - global style/script files that are loaded on every page.
