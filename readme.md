# @qnx/composables

@qnx/composables is a collection of Vue composition utilities for building reactive, data-driven applications. It provides core form helpers and Axios-based request composables with built-in error handling.

## 📑 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Usage](#-usage)
  - [Core Utilities](#core-utilities)
    - [objectToFormData](#objecttoformdata)
    - [objectToQueryString](#objecttoquerystring)
  - [Axios Integration](#axios-integration)
    - [useAxios](#useaxios)
    - [useAsyncAxios](#useasyncaxios)
    - [useAsyncAxiosGenerator](#useasyncaxiosgenerator)
    - [useErrorResponse](#useerrorresponse)
    - [setHandleUnauthenticated](#sethandleunauthenticated)
- [API Reference](#-api-reference)
  - [Core Utilities](#core-utilities-1)
  - [Axios Composables](#axios-composables)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Features

| Feature                    | Description                                                    |
| -------------------------- | -------------------------------------------------------------- |
| 📦 Form Utilities          | Convert objects to `FormData` or query strings with ease       |
| ⚡ Reactive Requests       | `useAxios` returns reactive refs for response, loading, cancel |
| 🔄 Async Support           | `useAsyncAxios` for promise-based request handling             |
| 📄 Paginated Generator     | `useAsyncAxiosGenerator` for cursor/page-based data fetching   |
| 🚫 Built-in Error Handling | Automatically handles 400/401/422 responses                    |
| 🧠 TypeScript-First        | Fully typed API with excellent IntelliSense support            |

## 📦 Installation

Install @qnx/composables via [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), [pnpm](https://pnpm.io/), or [bun](https://bun.sh/):

```bash
# Using npm
npm install @qnx/composables

# Using yarn
yarn add @qnx/composables

# Using pnpm
pnpm install @qnx/composables

# Using bun
bun install @qnx/composables
```

#### Peer Dependencies

@qnx/composables has optional peer dependencies depending on the features you use:

```bash
# Required for Axios integration features
npm install axios vue
```

## 💡 Usage

### Core Utilities

#### objectToFormData

Transforms a plain object into a `FormData` instance. Handles nested objects, `Date`, `File`, and `Blob` values recursively.

```ts
import { objectToFormData } from '@qnx/composables'

const formData = objectToFormData({
  name: 'foo',
  profileImage: fileObject // File or Blob
})
```

#### objectToQueryString

Converts an object into a URL-encoded query string, including support for nested objects.

```ts
import { objectToQueryString } from '@qnx/composables'

const queryString = objectToQueryString({
  name: 'foo',
  address: 'bar'
})
// => "name=foo&address=bar"
```

### Axios Integration

Import from the `@qnx/composables/axios` sub-path:

#### useAxios

Returns reactive refs for `response`, `loading`, and cancel controls. The request fires immediately on call.

```ts
import { useAxios } from '@qnx/composables/axios'

const { response, isLoading, abort } = useAxios<User[]>('/users', { method: 'GET' })
```

#### useAsyncAxios

Promise-based request — awaits the response and returns the data directly.

```ts
import { useAsyncAxios } from '@qnx/composables/axios'

const users = await useAsyncAxios<User[]>('/users', { method: 'GET' })
```

#### useAsyncAxiosGenerator

An async generator for paginated data fetching. Yields one page at a time and advances when `.next()` is called.

```ts
import { useAsyncAxios } from '@qnx/composables/axios'

const generator = useAsyncAxiosGenerator('/users', { method: 'GET' }, {
  queryParams: { search: '' },
  page_size: 10
})

const { value } = await generator.next()
```

#### useErrorResponse

Processes an `AxiosError` and returns structured reactive refs for status, statusText, and the error response body.

```ts
import { useErrorResponse } from '@qnx/composables/axios'

const { getErrorResponse } = useErrorResponse()

try {
  await useAsyncAxios('/users', { method: 'GET' })
} catch (e) {
  const { status, eResponse } = await getErrorResponse(e)
}
```

#### setHandleUnauthenticated

Registers a global callback invoked automatically when a `401 Unauthorized` response is received.

```ts
import { setHandleUnauthenticated } from '@qnx/composables/axios'

setHandleUnauthenticated(() => {
  router.push('/login')
})
```

## 📘 API Reference

### Core Utilities

| Function                              | Description                                     |
| ------------------------------------- | ----------------------------------------------- |
| `objectToFormData(obj, form?, ns?)`   | Recursively converts an object to `FormData`    |
| `objectToQueryString(obj, prefix?)`   | Converts an object to a URL query string        |

### Axios Composables

Imported from `@qnx/composables/axios`.

#### useAxios

```ts
useAxios<T>(url: string, config: RawAxiosRequestConfig): UseAxiosReturn<T, E>
```

| Returned Ref / Method | Type              | Description                           |
| --------------------- | ----------------- | ------------------------------------- |
| `response`            | `Ref<T>`          | Reactive response data                |
| `isLoading`           | `Ref<boolean>`    | `true` while the request is in flight |
| `isFinished`          | `Ref<boolean>`    | `true` once the request completes     |
| `loading`             | `Ref<boolean>`    | Alias for `isLoading`                 |
| `finished`            | `Ref<boolean>`    | Alias for `isFinished`                |
| `aborted`             | `Ref<boolean>`    | `true` if the request was aborted     |
| `canceled`            | `Ref<boolean>`    | Alias for `aborted`                   |
| `abort(message?)`     | `Function`        | Cancels the in-flight request         |
| `cancel(message?)`    | `Function`        | Alias for `abort`                     |

#### useAsyncAxios

```ts
useAsyncAxios<T>(url: string, config: RawAxiosRequestConfig): Promise<T>
```

#### useAsyncAxiosGenerator

```ts
useAsyncAxiosGenerator<T>(url, config, { queryParams, page_size, page?, deley? }): AsyncGenerator<T>
```

#### useErrorResponse

```ts
getErrorResponse<T>(error: AxiosError<T>): Promise<{ status, statusText, eResponse: Ref<T> }>
```

Handles status codes automatically:

| Status Code | Behavior                                    |
| ----------- | ------------------------------------------- |
| 400, 422    | Populates `eResponse` with the error body   |
| 401         | Calls the handler set by `setHandleUnauthenticated` |
| 404, 405    | Throws an `Error`                           |
| Other       | Throws an `Error`                           |

#### setHandleUnauthenticated

```ts
setHandleUnauthenticated(fn: () => void | Promise<void>): void
```

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.
Please make sure to update tests as appropriate.

## 📄 License

[MIT License](https://github.com/yatendra121/composables/blob/main/LICENSE.md) © 2023-PRESENT [Yatendra Kushwaha](https://github.com/yatendra121)
