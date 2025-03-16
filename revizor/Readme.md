# Revizor

Utility for building web frontend applications - set of static websites that share the same library during the development.

Goals:

* A native feel, focusing on core technologies rather than the tool itself.
* A strict architecture that makes the codebase predictable and, yes, boring.
* A pleasant and modern build system that enables the development of production-ready web interfaces.

For motivation, see [Boring web frontend development](https://retrovizor.xyz/text/boring-web-frontend-development/).

## File structure / Architecture

```
* dist/                # Generated deployment files
* assets/              # Binaries, e.g. fonts and images
* src/
    * index.js         # Executed before each view. If needed, loads scripts from the library.
    * index.css        # Entry point that's loaded dynamically. Loads styles from the library.
    * data.json        # Data for the generation of public HTML files
    * templates/       # Partials and layouts
    * views/           # Views organised in acutal hierarchy of the website
        * index.html   # A view HTML file that has `<style>` and `<script>` elements if needed
        * about.html   # [Example] Transformed to `dist/about/index.html`
        * ...
    * library/
        * index.js     # Provide entry point, register components, expose and initialize services and utils.
        * index.css    # Entry point for library styles
        * utilities.js # [Example] Stateless, mainly deterministic one-call functions
        * services/    # [Optional] Class-based files that have some state
        * components/  # [Optional] From buttons to UI elements like navigation.
        * styles/      # [Optional] Make possible to import these general styles from `index.css`
```

## Roadmap

### Alpha: standalone entity

1. Define what's part of Revizor when it comes to entry files, e.g. `index.html`, `index.css`, `index.js`
2. Remove `buildType` property and stick with `native-library-bundle`
3. Add initial version of SSR for web components
4. Dockerisation
5. DX optimisations
    * Die loudly if expected files are not present, e.g. `src/index.{js|css}`
    * Add timestamps to console outputs
    * Handle file rename during the active `dev` loop
    * Handle file deletion during the active `dev` loop - remove that file from the `dist` directory
    * Introduce `dev:test` to support test development
    * Provide test mechanisms for views and templates
    * Enable E2E tests in non-headless mode
    * Extract and generalise test utilities from `retrovizor/src/library/test.utilities.js`
6. Enable installation via NPM
7. Expand documentation and add example projects

### Beta: seriously reusable

* Performance
    * Try streams instead of `writeFile` and similar to improve performance 
    * Try keeping open handles during the active `dev` loop to decrease rebuild time
    * Recompile only affected files in `buildLibrary|buildScripts|buildStyles` functions during the active `dev` mode
* TypeScript
* Starters and tests
    * 4 starters: minimal, presentational, app-behind-login, combination of two types
    * E2E Revizor tests are tests of these 4 starters from both developers and users perspective.
* Unit tests for bits and other utility functions
* Improve documentation and examples

### Future

* E2E tests in Gherkin-like syntax
* Code generator: ideally, something like configuration+Gherkin expressions that generate and extend codebase
* Introducing AI API for faster development
    * Specification -> gradual code generation incl. tests -> fine-tune -> repeat -> apply.
    * AI helps with every step.
    * Predefined prompts/knowledge in front of the AI API:
        * Architecture and Revizor in general (coding style, naming conventions,...)
        * Steps: help with definition (limit domain scope), generate code, ensure tests are working
        * Current codebase
    * Think about interface for this kind of AI: IDE? CLI? GUI?

## License

[MIT](License)
