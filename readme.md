# @qnx/composables

@qnx/composables provides a collection of Vue composition utilities.

## Installation

Use the package manager [npm](https://www.npmjs.com/) to install @qnx/composables.

```bash
npm install @qnx/composables
```

You can also use [yarn](https://yarnpkg.com/), [pnpm](https://pnpm.io/), or [bun](https://bun.sh/)

```bash
yarn add @qnx/composables
```

```bash
pnpm install @qnx/composables
```

```bash
bun install @qnx/composables
```

## Usage

### Core Features

**objectToFormData:** Transforms an object into a FormData object.

```bash
import { objectToFormData  } from '@qnx/composables'

const formData = objectToFormData({
 name: 'foo',
 profileImage: File Object
})
```

**objectToQueryString:** Transforms an object into a query string, useful for sending data in a URL.

```bash
import { objectToQueryString  } from '@qnx/composables'

const queryString = objectToQueryString({
 name: 'foo',
 address: 'bar'
})
```

### Integration Features

**useAxios:** Collects reactive data and the status of a request.

```bash
import { useAxios  } from '@qnx/composables/axios'

const { response, loading, cancel } = useAxios('/user', { method: 'GET' })
```

**useAsyncAxios:** Collects data from a request asynchronously.

```bash
import { useAsyncAxios  } from '@qnx/composables/axios'

const response = await useAsyncAxios('/user', { method: 'GET' })
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT License](https://github.com/yatendra121/composables/blob/main/LICENSE.md) © 2023-PRESENT [Yatendra Kushwaha](https://github.com/yatendra121)
