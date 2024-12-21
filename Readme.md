# Retrovizor.xyz

This organization represents a single component in the "product codebase organization approach".
 
Since the goal is to have a central point from which the whole codebase is deduced, an entry point must contain all logic necessary for management and communication with the component.

This is a simple use case, since static frontend doesn't really communicate with the rest of the ecosystem - maybe via some REST API calls - but only by sending messages, not listening.

The advantage of this example is that I can focus on other aspects of the system, management: development, building, testing, deploying,...

Inspired by [Product codebase organiztion](https://gist.github.com/vjekoart/83f0e90fc2c1a5e45932414ddbf5d04d).

## TODO

* Phase 1: create SIMPLE build system for HTML, CSS, JS
* Phase 2: design exploration: homepage UI without artwork/responsive skeleton
    * Prototype homepage design without artwork
* Phase 3: library
    * Build system for library and Web Components (not native, lit?)
    * Refactor homepage UI to use Web Components; extract code

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
        * styles/ # Maybe not necessary
