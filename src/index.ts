import { AxiosError } from 'axios'

import { defaultIsInvalid, defaultSetHeaders, noop } from './defaults'
import { AuthorizeAxiosInstanceOptions } from './types'

function authorizeAxiosInstance({
  instance,
  tokenProvider,
  refreshTokenRequest,
  errorCallback = noop,
  setHeaders = defaultSetHeaders,
  isInvalid = defaultIsInvalid,
}: AuthorizeAxiosInstanceOptions) {
  let requestInterceptor: number, responseInterceptor: number

  async function getTokens() {
    return {
      accessToken: await tokenProvider.accessToken.get(),
      refreshToken: await tokenProvider.refreshToken.get(),
    }
  }

  function setupInterceptors() {
    requestInterceptor = instance.interceptors.request.use(
      async requestConfig => {
        return setHeaders({
          requestConfig,
          tokens: await getTokens(),
        })
      }
    )

    responseInterceptor = instance.interceptors.response.use(
      undefined,
      checkInvalidResponse
    )
  }

  function removeInterceptors() {
    instance.interceptors.request.eject(requestInterceptor)
    instance.interceptors.response.eject(responseInterceptor)
  }

  async function checkInvalidResponse(error: AxiosError) {
    if (error.response && isInvalid(error.response!)) {
      try {
        removeInterceptors()

        const { accessToken, refreshToken } = await refreshTokenRequest({
          instance,
          oldTokens: await getTokens(),
        })

        await tokenProvider.accessToken.set(accessToken)
        await tokenProvider.refreshToken.set(refreshToken)

        setupInterceptors()
      } catch (tokenRenewalError) {
        if (errorCallback) {
          errorCallback(tokenRenewalError)
        }

        throw tokenRenewalError
      }

      return instance.request(error.config)
    }

    throw error
  }

  setupInterceptors()

  return instance
}

export default authorizeAxiosInstance
