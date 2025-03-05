# Retrovizor.xyz

Source code of a personal website [retrovizor.xyz](https://retrovizor.xyz).

Developed with the help of [revizor](revizor).

## Usage

1. Clone the repo.
2. Ensure Node v20+ is present.
3. Run `npm install && npm run build`
4. Serve `dist/` folder via HTTP.

## Roadmap

### Based on feedback

* Homepage: it's not really clear what's happening - maybe that's okay, but maybe I'd like to make it explicit that this is an experiment that may change?
* User: remove a link to filthy-fingers.retrovizor.xyz, or remove the password or change password to something friendly and make it public on retrovizor.xyz
* Revizor Readme -> Roadmap ( undefined -> undefined ) ???
* Experiment: Blank: make line length setting safer

### Future

* [BUG] Worker `close-your-eyes.worker.js` doesn't work for `native` build type, but `image-degradator.worker.js` works as expected; most probably affects Revizor
* [UX] Support for light and dark themes
* [UX] Approach where mobile navigation is always at the bottom of the screen, and desktop like now, on top
* [UX] Support for linkable headings
* [UX] Introduce sticky "Table of contents" on text pages
* [UX] Expand color selector functionalities in `retro-experiment`
* [Tech/UX] Expand styling for code blocks, and transfer content from gist.github.com to standalone pages
* [Tech] Expand test coverage for services and components

## License

[MIT](License)

