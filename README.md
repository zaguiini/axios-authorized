# axios-authorized

[`axios`](https://github.com/axios/axios) wrapper for authorized REST APIs

---

## Why

It is, often, a pain to consume REST APIs that need some kind of authorization.
Basically, you need to have a valid `access_token` to consume one resource.
If that `access_token` is invalid, though, you generally get one `401` error right in your face.

To solve that, you must refresh your `access_token` using one `refresh_token` and retry the request.
If everything goes wrong, then usually the user is logged out and sent back to the login page.

That is a lot of stuff and it seems to be a common pattern: I have faced that situation in, at least, four projects.
So I've decided to make this simple and small (3kb minified) package to solve this problem!

## Installing

Using `npm`/`yarn`:

`npm install`/`yarn add` `axios-authorized`

It uses `axios` as a peer-dependency, so don't forget to have `axios` installed!

## Usage

The default export contains a `function` that generates (returns) one ready-to-use `axios` instance. Example:

```js
import createAuthorizedAxiosInstance from 'axios-authorized'

const axios = createAuthorizedAxiosInstance({
  config,
  tokenProvider,
  refreshTokenRequest,
})

axios.get('/me')
  .then((response) => console.log(response.data))
  .catch((e) => console.error('well, it did not work out so well...', e))
```

The only argument for `createAuthorizedAxiosInstance` is an object with the properties:

| *Name*                       | *Example*                                                                           | *Required* |
|------------------------------|-------------------------------------------------------------------------------------|------------|
| config                       | [All possible configurations](https://github.com/axios/axios/blob/master/README.md) | No         |
| tokenProvider                | [tokenProvider](#tokenProvider)                                                     | Yes        |
| refreshTokenRequest          | [refreshTokenRequest](#refreshTokenRequest)                                         | Yes        |
| transformAuthorizationHeader | [transformAuthorizationHeader](#transformAuthorizationHeader)                       | No         |
| errorCallback                | A regular callback function, called with no arguments                               | No         |
| invalidStatus                | 401                                                                                 | No         |

*(not required = default)

### tokenProvider

Is an object with `getter`s and `setter`s for both the access and refresh tokens:

```js
let accessToken = ''
let refreshToken = ''

const tokenProvider = {
  accessToken: {
    get: () => Promise.resolve(accessToken),
    set: (newAccessToken) => Promise.resolve(accessToken = newAccessToken),
  },

  refreshToken: {
    get: () => Promise.resolve(refreshToken),
    set: (newRefreshToken) => Promise.resolve(refreshToken = newRefreshToken),
  },
}
```

The nice thing about it is that you can use [`AsyncStorage`](https://facebook.github.io/react-native/docs/asyncstorage) as it demands a `Promise` to be resolved.
**Even if you use a sync method (like get a cookie from the browser), you still need to resolve a `Promise`!!!**

### refreshTokenRequest

A function that returns a `Promise` with both new tokens as an object (in the `resolve` function call).
The `axios` instance and both old tokens are passed as arguments. Example:

```js
function refreshTokenRequest(instance, oldTokens) {
  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await instance.get('/token', {
        header: {
          Authorization: `Bearer ${oldTokens.refreshToken}`,
        }
      })
      
      resolve({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      })
    } catch(e) {
      reject(e)
    }
  })
}
```

### transformAuthorizationHeader

A function that returns the `Authorization` header string. The only argument passed is the `access_token`. Example:

```js
function transformAuthorizationHeader(accessToken) {
  return `Bearer ${accessToken}`;
}
```

---

## License

MIT
