import axios from 'axios';
import invariant from 'invariant';

import {
  isValidTokenProvider,
  isFunction,
} from './validations';

import {
  defaultTransformAuthorizationHeader,
  noop,
} from './defaults';

function createAuthorizedAxiosInstance({
                                   config = {},
                                   tokenProvider,
                                   refreshTokenRequest,
                                   transformAuthorizationHeader = defaultTransformAuthorizationHeader,
                                   errorCallback = noop,
                                   invalidStatus = 401,
                                 }) {
  invariant(isValidTokenProvider(tokenProvider), 'Invalid token provider.');
  invariant(isFunction(transformAuthorizationHeader), 'Invalid `transformAuthorizationHeader`. It expects a function!');
  invariant(isFunction(refreshTokenRequest), 'Invalid `getRefreshTokenRequest`. It expects a function!');

  const instance = axios.create(config);
  let accessTokenRequestInterceptor, invalidAccessTokenResponseInterceptor;

  function setupInterceptors() {
    accessTokenRequestInterceptor = instance.interceptors.request.use(setAccessToken);
    invalidAccessTokenResponseInterceptor = instance.interceptors.response.use(null, checkInvalidAccessToken);
  }

  function removeInterceptors() {
    instance.interceptors.request.eject(accessTokenRequestInterceptor);
    instance.interceptors.response.eject(invalidAccessTokenResponseInterceptor);
  }

  async function setAccessToken(requestConfig) {
    requestConfig.headers.Authorization = transformAuthorizationHeader(await tokenProvider.accessToken.get());

    return requestConfig;
  }

  async function checkInvalidAccessToken(error) {
    if(error.response.status === invalidStatus) {
      try {
        removeInterceptors();

        const tokens = {
          accessToken: await tokenProvider.accessToken.get(),
          refreshToken: await tokenProvider.refreshToken.get(),
        };

        const { accessToken, refreshToken } = await refreshTokenRequest(instance, tokens);

        await tokenProvider.accessToken.set(accessToken);
        await tokenProvider.refreshToken.set(refreshToken);

        setupInterceptors();
      } catch(tokenRenewalError) {
        if(errorCallback) {
          errorCallback(tokenRenewalError);
        }

        return Promise.reject(tokenRenewalError);
      }

      return instance.request(error.config);
    }

    return Promise.reject(error);
  }

  setupInterceptors();

  return instance;
}

export default createAuthorizedAxiosInstance;