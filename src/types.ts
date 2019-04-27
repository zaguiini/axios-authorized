import { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

type TokenTypes = 'accessToken' | 'refreshToken'

type TokenGetterAndSetter = {
  get: () => Promise<string>
  set: (newToken: string) => Promise<void>
}

export type TokenProvider = { [K in TokenTypes]: TokenGetterAndSetter }

export type Tokens = { [K in TokenTypes]: string }

export interface RefreshTokenRequestOptions {
  instance: AxiosInstance
  oldTokens: Tokens
}

export interface AuthorizeAxiosInstanceOptions {
  instance: AxiosInstance
  setHeaders: ({
    requestConfig,
    tokens,
  }: SetHeadersOptions) => AxiosRequestConfig
  tokenProvider: TokenProvider
  refreshTokenRequest: (options: RefreshTokenRequestOptions) => Promise<Tokens>
  errorCallback?: (error: AxiosError) => void
  isInvalid?: (response: AxiosResponse) => boolean
}

export interface SetHeadersOptions {
  requestConfig: AxiosRequestConfig
  tokens: Tokens
}