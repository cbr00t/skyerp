# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Repository overview
- Primary stack: PHP application structured as modular sub-apps under app/.
- Vendored third-party libraries: lib_external/bulma (CSS framework) and lib_external/jsdom (Node.js package). These are external projects checked into the repo; avoid modifying them unless explicitly working on those libraries.

Common commands (pwsh on Windows)
- Run locally with PHP’s built-in server (serves the whole www root so /skyerp routes work):
  $env:PORT=8000; php -S localhost:$env:PORT -t F:\AppServ\www
  Then open http://localhost:8000/skyerp/app/index.php

- Quick PHP syntax check for all PHP files:
  Get-ChildItem -Recurse -Filter *.php | ForEach-Object { php -l $_.FullName }

- Frontend (Bulma) asset build (only if you’re intentionally editing lib_external/bulma sources):
  pushd lib_external\bulma; npm install; npm run build; popd
  Output CSS is written under lib_external/bulma/css/; wire it in the app only if needed.

- jsdom development (only if you’re intentionally working on the vendored jsdom subtree):
  pushd lib_external\jsdom; npm ci; npm run lint; npm test; popd
  Note: jsdom is not the app’s runtime dependency; it’s a full external project included here.

Notes on tests and linting
- No project-level PHP testing framework or Composer configuration was found (no phpunit.xml or composer.json in the repo). If you need tests, create them within the app’s PHP structure and introduce a test runner explicitly.
- The PHP syntax check above helps catch parse errors; there’s no configured style linter.

How the app runs
- This repository is typically hosted under a web root like F:\AppServ\www with the app accessible at /skyerp. The entry point is app/index.php. If running the built-in server, serve the parent web root so path expectations like /skyerp/... remain valid.

High-level architecture
- Modular sub-apps: The app/ directory contains many modules (e.g., crm, rapor, ticari, eIslem, etc.). Each module commonly includes:
  - config.php: Establishes paths (e.g., $webRoot) and app metadata (e.g., $appVersion).
  - prereq.php: Bootstraps dependencies by requiring shared classes and UI components (e.g., $webRoot/classes/*, $webRoot/ortak/*) and enqueues core JS like $webRoot/lib/appBase/app.js with cache-busting via ?$appVersion.
  - index.php: The module’s main HTML/PHP entry, usually including a shared head from $webRoot/lib/include/head.php.
  - manifest.php: Outputs JSON for the app’s PWA-style manifest, parameterized via variables from config.php (id/name/version, scope /skyerp, icons, screenshots). Note that app/manifest.php sets headers and echoes a manifest based on $appClass, $appName, and $appVersion.

- Shared libraries and UI:
  - classes/: Application business logic and utilities (e.g., classes/mq, classes/stmYapi, classes/tekSecim, classes/worker, etc.).
  - ortak/: Shared UI widgets and layout pieces (tabs, menu, buttons, date UI, form builder, charts). These are required from prereq.php across modules.
  - lib/: Shared static assets and includes (e.g., lib/include/head.php) referenced by app pages.

- Boot sequence (typical per module):
  1) config.php sets $webRoot and app variables, used to resolve shared includes.
  2) index.php includes $webRoot/lib/include/head.php in <head> for common head elements.
  3) prereq.php loads base JS (lib/appBase/app.js) and requires shared PHP class/UI includes from classes/ and ortak/ to register components.
  4) Module pages then render their specific UI and logic using the shared components.

- Versioning and cache busting:
  - $appVersion is appended to script URLs (e.g., app.js?$appVersion) to invalidate browser caches on releases.

- PWA-oriented manifest:
  - app/manifest.php dynamically emits a manifest (manifest_version 3, display fullscreen/standalone, scope "/skyerp", protocol handler web+erp, icons/screenshots). It relies on config-provided variables; ensure these are set before manifest output.

Working with modules
- To develop a specific module, navigate to its directory under app/<module>/ and review config.php, prereq.php, and index.php to understand its dependencies and entrypoints.
- Access a module directly via browser, e.g., http://localhost:8000/skyerp/app/<module>/index.php when using the built-in server setup above.

Cautions for agents
- Do not alter lib_external/jsdom or lib_external/bulma unless you are explicitly tasked with modifying those third-party projects. Treat them as vendored dependencies; they contain their own READMEs and build/test processes.
- Many includes rely on $webRoot being set consistently by config.php. When introducing new includes, respect the existing path conventions and append ?$appVersion for cache control where appropriate.

