import { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

export enum TokenTypes {
  AccessToken = 'accessToken',
  RefreshToken = 'refreshToken',
}

export type Token = string | undefined | null

export type TokenGetterAndSetter = {
  get: () => Promise<Token>
  set: (newToken: Token) => Promise<void>
}

export type TokenProvider = { [K in TokenTypes]: TokenGetterAndSetter }

export type Tokens = { [K in TokenTypes]: Token }

export interface RefreshTokenRequestOptions {
  instance: AxiosInstance
  oldTokens: Tokens
}

export interface SetHeadersOptions {
  requestConfig: AxiosRequestConfig
  tokens: Tokens
}

export interface AuthorizeAxiosInstanceOptions {
  instance: AxiosInstance
  setHeaders?: ({
    requestConfig,
    tokens,
  }: SetHeadersOptions) => AxiosRequestConfig
  tokenProvider: TokenProvider
  refreshTokenRequest: (options: RefreshTokenRequestOptions) => Promise<Tokens>
  errorCallback?: (error: AxiosError) => void
  isInvalid?: (response: AxiosResponse) => boolean
}
