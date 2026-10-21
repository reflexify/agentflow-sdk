export interface AuthAdapter {
  headers(): Promise<Record<string, string>>;
  credentials?: RequestCredentials;
}

/** Delegates auth to same-origin cookies via the SDK's own server proxy; adds no headers. */
export function proxyAdapter(): AuthAdapter {
  return {
    async headers() {
      return {};
    },
    credentials: 'same-origin',
  };
}

/** Sends a bearer token obtained fresh (or from cache) on every request. */
export function bearerAdapter(getToken: () => Promise<string>): AuthAdapter {
  return {
    async headers() {
      return { authorization: `Bearer ${await getToken()}` };
    },
  };
}
