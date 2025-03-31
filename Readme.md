# Retrovizor.xyz

Source code of a personal website [retrovizor.xyz](https://retrovizor.xyz).

Developed with the help of [revizor](revizor).

## Usage

1. Clone the repo.
2. Ensure Node v20+ is present.
3. Run `npm install && npm run build`
4. Serve `dist/` folder via HTTP.

## Development

1. Clone the repo.
2. Ensure Node v20+ is present.
3. Run `npm install`.
4. Run `npm run dev` to start the development server.
5. Open `http://localhost:8090/` in the web browser.

## Deployment

* Set `.env` file and run `npm run deploy`.
* For more information on infrastructure, see `./infrastructure/remote.sh`.

## Roadmap

* Primitive analytics
    * Goal: have stats.retrovizor.xyz that's automatically generated every day for the past day
    * Implement `./infrastrcture/remote.sh task-run id`
    * Implement `./infrastructure/remote.sh task-register analytics/nginx-statistics.js daily|weekly|monthly`
    * Implement `./infrastructure/remote.sh task-list|task-remove id|task-logs id`
    * Implementation of task-* functionality
        * Task is NodeJS a script inside retrovizor.xyz repository that knows how to work inside when dependecies are installed
        * Set of shell scripts that use cron to schedule execution of NodeJS scripts inside a repository, and stores logs on predefined location
        * Ideally, avoid having a .spec file or something where all defined tasks are listed on the remote machine
        * Logs: test console.log|info and console.error to ensure that logs are saved as expected - store all logs in a single file
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

