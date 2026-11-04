## 0.8.10 (2026-11-04)

Bugs

- objectToFormData: send `0` and `false` instead of dropping them; empty strings are still dropped
- objectToFormData: stop throwing on an invalid `Date`, and on Node 18, which has no global `File`
- objectToQueryString: send `Date` values as ISO strings instead of dropping them
- useAxios: 5xx, 403, 404 and network failures no longer end in an unhandled rejection
- useAsyncAxiosGenerator: send `page_size`, which was only used locally to decide when to stop, so results could end early if the server's default differed
- useAsyncAxiosGenerator: support a `url` that already has a query string, and skip the delay after the last page
- useErrorResponse: a failing 401 handler is logged instead of rejecting unobserved or replacing the result; remove debug logging
- package: `require` now resolves to the CommonJS build, which was built but unreachable
- package: declare `@qnx/client`, which the published types re-export

Features

- useAxios: add an `error` ref for failures `errorResponse` can't carry
- useErrorResponse: thrown errors keep the axios error as `cause`

Chore

- add a `type-check` script and run it in CI

## 0.8.1 (2026-05-27)

Features

- useAxios: expose errorResponse ref in UseAxiosReturn interface

Bugs

- useErrorResponse: fix dead async path in executeFunction; async 401 handlers were never awaited
- useErrorResponse: fix wrong type Promise<() => void> → Promise<void>
- useAxios: guard cancel errors in catch to prevent unhandled promise rejections on abort
- useAxios: fix null access on optional queryParams in useAsyncAxiosGenerator
- useAxios: remove debug console.log statements; rename deley → delay
- form: fix str inferred as never[]; replace hasOwnProperty with Object.hasOwn; fix Blob/File append logic
- vite.config: remove invalid tsconfigPaths from resolve options

Chore

- deps: update devDependencies to latest versions

## 0.8.0 (2026-04-05)

Features

- lib: add @qnx/client lib
- docs: update readme file
- ci: update node version

## 0.7.0 (2025-06-29)

Features

- lib: update deps
- ci: update node version

Bugs

- build: remove unusable codes

## 0.6.21 (2024-12-06)

Bugs

- build: typescript version conflict

## 0.6.20 (2024-12-06)

Features

- useAxios: console added
- lib: update deps

## 0.6.7 (2024-03-13)

Bugs

- docs: highlight functions

## 0.6.7 (2024-03-13)

Features

- docs: added more details of composables
