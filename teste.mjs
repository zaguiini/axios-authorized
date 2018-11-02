import createAuthorizedAxiosInstance from './src/index'

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

function refreshTokenRequest(instance, { refreshToken }) {
  return instance.get('/token', {
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  })
}

const config = {
  baseURL: 'http://localhost:5000',
}

const axios = createAuthorizedAxiosInstance({
  config,
  tokenProvider,
  refreshTokenRequest,
})

axios.get('/me').then(({ data }) => console.log(data)).catch((e) => console.log('deu ruim fera...', e))