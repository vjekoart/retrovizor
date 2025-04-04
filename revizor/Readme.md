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

### Alpha.1: standalone entity

0. Rethink Revizor in terms of "personal toolkit for building web applications"
    * In Readme.md there should be a status message: "Build a static web app, deploy to Debian server with nginx, collect basic analytics."
    * Think about name "boring-toolkit"
1. Toolkit
    * Add a higher layer of abstraction, transform from "Utility for web frontend" to "Toolkit for web applications"
    * Introduce some kind of templating mechanism when generating/initializing/updating the project (the whole management CLI needs ideation)
    * Find a place for infrastructure scripts, and generalise, i.e. remove hardcoded "retrovizor.xyz" values
    * Find a place for analytics script, and generalies, i.e. remove hardcoded "retrovizor.xyz" values
    * Extend `configuration.json` fields with selection of `infrastructure` and `analytics` types
    * Refactor: split `core.js` and `core.bits.js` to multiple files so they're readable and small.
2. Define what's part of frontend Revizor when it comes to entry files, e.g. `index.html`, `index.css`, `index.js`
3. Frontend: remove `buildType` property and stick with `native-library-bundle`
4. Web frontend DX optimisations
    * Die loudly if expected files are not present, e.g. `src/index.{js|css}`
    * Add timestamps to console outputs
    * Handle file rename during the active `dev` loop
    * Handle file deletion during the active `dev` loop - remove that file from the `dist` directory
    * Introduce `dev:test` to support test development
    * Provide test mechanisms for views and templates
    * Enable E2E tests in non-headless mode
    * Extract and generalise test utilities from `retrovizor/src/library/test.utilities.js`
5. Expand documentation and add example projects
6. First phase of AI: generate application code (that works within Revizor)
    * Usage: `revizor run generate description.txt branch-name "PR name" pr-description-template.txt`
    * Philosophy: use LLMs as coders that get very detailed architecture/instructions - start low to increase chance of viable program
    * Premise:
        * With well-written documentation, specialized LLMs can generate incomplete PRs based on description text/architecture; furthermore
          LLM can change code based on PR comments (so it's a service that gets invoked by a direct call, and by an automation, e.g. PR review)
        * If user provides a detailed architecture, LLMs requires smaller context so it's better in implementation
        * Description should be a collection of high-level guidelines, in the form of list where every list item represents a file, and pseudocode
          changes inside that file, and symbols that are used (new components, services, and similar)
        * Description should explicitly state which symbols to use, e.g. these Components and Services from that files
        * LLM works on a single file, with knowledge of external services and environment, but focuses on code that should be generated
        * Some best practices are also appended as instructions, second documentation file, e.g. add JSDoc comment above new methods, don't use
          overly complex statements, write tests for new methods and similar
            * Different doc for different language/technology, e.g. Django backend vs JS frontend
    * Prerequisites:
        * Concise documentation of revizor that explains how things work, and how to add new stuff: both LMM and human friendly
            * Different documentations for different language/technology, e.g. Django backend vs JS frontend
        * Main `generate` NodeJS/Pyhton function that has (codestral) applet, knowledge of revizor, and sufficient rights to modify and save code
    * Future (team) usage:
        * Enable something like a GitHub bot for code generation on servers that can be triggered via an API
        * Watch for review comments on PRs, and automatically fix/adjust code based on comments.
7. Integrate with Django

### Alpha.2: production optimisations

* Dockerisation, or some other way to ensure environment requirements
* Infrastructure: introduce log rotation on nginx
* Frontend: add initial version of SSR for web components

### Beta: seriously reusable

* Web frontend performance
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
