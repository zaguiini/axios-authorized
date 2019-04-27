import { AxiosResponse } from 'axios'

import { SetHeadersOptions } from './types'

export function noop() {}

export function defaultSetHeaders({
  requestConfig,
  tokens,
}: SetHeadersOptions) {
  requestConfig.headers.Authorization = `Bearer ${tokens.accessToken}`

  return requestConfig
}

export function defaultIsInvalid(response: AxiosResponse) {
  return response.status === 401
}
