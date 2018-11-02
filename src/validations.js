export function isValidTokenProvider(t) {
  return (
    typeof t === 'object' &&
    typeof t.accessToken === 'object' &&
    typeof t.refreshToken === 'object' &&
    typeof t.accessToken.get === 'function' &&
    typeof t.accessToken.set === 'function' &&
    typeof t.refreshToken.get === 'function' &&
    typeof t.refreshToken.set === 'function'
  );
}

export function isFunction(f) {
  return typeof f === 'function';
}