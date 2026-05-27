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
