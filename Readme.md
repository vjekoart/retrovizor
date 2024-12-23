# Retrovizor.xyz

This organization represents a single component in the "product codebase organization approach".
 
Since the goal is to have a central point from which the whole codebase is deduced, an entry point must contain all logic necessary for management and communication with the component.

This is a simple use case, since static frontend doesn't really communicate with the rest of the ecosystem - maybe via some REST API calls - but only by sending messages, not listening.

The advantage of this example is that I can focus on other aspects of the system, management: development, building, testing, deploying,...

Inspired by [Product codebase organiztion](https://gist.github.com/vjekoart/83f0e90fc2c1a5e45932414ddbf5d04d).

## TODO

* Phase 1: create SIMPLE build system for HTML, CSS, JS
    * Improve error reporting, e.g. for CSS
    * Add support for multiple CSS files on the app level
* Phase 2: design exploration: homepage UI without artwork/responsive skeleton
    * Use dark-theme approach, with light gray monospace text - terminal/hacker feel
    * Upper experience: as I've written down, fullpage artwork and title in top-right corner that floats to center as user scrolls
    * Typography: terminal + markdown approach? Headings are bold and have `#` character in `::before` that's in different color? In general, more than one color to accent the markdown/IDE feel/
* Phase 3: library
    * Build system for library and Web Components (not native, lit?)
    * Refactor homepage UI to use Web Components; extract code
---
* Build system performance
    * Try streams instead of `writeFile` and similar to improve performance 
    * Try keeping open handles in dev mode to decrease rebuild time

## File structure (try to keep updated)

* dist/ # Generated folder intended for deployment
* assets/
* src/
    * index.ts # Executed before each view?
    * index.css # Entry point that's loaded dynamically. Variables and global reset, may need more files if SASS+mixins is used
    * data.json # This can be a folder if complex, data that's used during the generation of public HTML files
    * templates/ # Partials and layouts, this + views will generate final HTML files during the build step
    * views/ # Views organised in acutal hierarchy of the website
        * index.html # HTML file that has `<style>` and `<script>` elements if needed
        * about/
            * index.html
        * ...
    * library/
        * index.js # Provide entry point, register components, expose and initialize services and utils.
        * utils/ # Stateless, mainly deterministic one-call functions
        * services/ # Class-based files that have some state
        * components/ # From buttons to UI elements like navigation.
        * styles/ # Make possible to import these general styles from `index.css`
