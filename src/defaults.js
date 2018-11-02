export function defaultTransformAuthorizationHeader(accessToken) {
  return `Bearer ${accessToken}`;
}

export function noop() {}